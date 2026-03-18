"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface WishlistContextValue {
  ids: Set<string>
  toggle: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

/**
 * Proveedor del contexto de favoritos (wishlist).
 * Ya montado en `src/components/Providers.tsx` → no añadir manualmente.
 *
 * Comportamiento según estado de autenticación:
 * - **Autenticado**: carga desde `/api/wishlist` y sincroniza cambios con la DB.
 *   Usa actualización optimista con rollback automático si el request falla.
 * - **Visitante**: persiste en `localStorage` bajo la clave `techstore-wishlist-guest`.
 *
 * @param children - Árbol de componentes que tendrán acceso a la wishlist
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated" && !!session?.user?.id
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [storageKey, setStorageKey] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (isAuthenticated) {
      fetch("/api/wishlist")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.productIds) setIds(new Set(data.productIds as string[]))
        })
        .catch(() => {})
    } else {
      const key = "techstore-wishlist-guest"
      setStorageKey(key)
      try {
        const stored = localStorage.getItem(key)
        setIds(new Set(stored ? JSON.parse(stored) : []))
      } catch {
        setIds(new Set())
      }
    }
  }, [status, isAuthenticated])

  useEffect(() => {
    if (!storageKey || isAuthenticated) return
    localStorage.setItem(storageKey, JSON.stringify([...ids]))
  }, [ids, storageKey, isAuthenticated])

  function toggle(productId: string) {
    const willAdd = !ids.has(productId)
    if (isAuthenticated) {
      // Actualización optimista + sync con DB
      setIds((prev) => {
        const next = new Set(prev)
        if (next.has(productId)) next.delete(productId)
        else next.add(productId)
        return next
      })
      toast(willAdd ? "Guardado en favoritos" : "Quitado de favoritos")
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {
        // Revertir si falla
        setIds((prev) => {
          const next = new Set(prev)
          if (next.has(productId)) next.delete(productId)
          else next.add(productId)
          return next
        })
        toast.error("No se pudo actualizar favoritos")
      })
    } else {
      setIds((prev) => {
        const next = new Set(prev)
        if (next.has(productId)) next.delete(productId)
        else next.add(productId)
        return next
      })
      toast(willAdd ? "Guardado en favoritos" : "Quitado de favoritos")
    }
  }

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWishlisted: (id) => ids.has(id) }}>
      {children}
    </WishlistContext.Provider>
  )
}

/**
 * Hook para consumir el contexto de favoritos.
 * Debe usarse dentro de `<WishlistProvider>` (ya montado en `Providers.tsx`).
 *
 * @returns Objeto con:
 *   - `ids` — `Set<string>` con los IDs de productos en favoritos
 *   - `toggle(productId)` — agrega o quita un producto de favoritos
 *   - `isWishlisted(productId)` — `true` si el producto está en favoritos
 *
 * @throws {Error} Si se usa fuera de `WishlistProvider`
 *
 * @example
 * const { toggle, isWishlisted } = useWishlist()
 *
 * // Verificar si un producto está guardado
 * const saved = isWishlisted("product-id-123")  // → true | false
 *
 * // Agregar o quitar
 * toggle("product-id-123")
 */
export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
