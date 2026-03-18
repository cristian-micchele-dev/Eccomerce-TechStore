"use client"

import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { Product } from "@/lib/types"
import { toast } from "sonner"
import { cartReducer, CartState } from "@/lib/cartReducer"

export { cartReducer } from "@/lib/cartReducer"

interface CartContextValue {
  items: CartState["items"]
  itemCount: number
  subtotal: number
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * Proveedor del contexto del carrito de compras.
 * Debe envolver cualquier parte del árbol que use `useCart()`.
 * Ya está montado en `src/components/Providers.tsx` → no añadir manualmente.
 *
 * Persiste el estado en localStorage con clave por usuario:
 * `techstore-cart-{userId}` para usuarios autenticados,
 * `techstore-cart-guest` para visitantes.
 * Se re-hidrata automáticamente al hacer login, logout o cambio de cuenta.
 *
 * @param children - Árbol de componentes que tendrán acceso al carrito
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [storageKey, setStorageKey] = useState<string | null>(null)
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Re-hydrate when user changes (login/logout/switch)
  useEffect(() => {
    if (status === "loading") return
    const key = `techstore-cart-${session?.user?.id ?? "guest"}`
    setStorageKey(key)
    try {
      const stored = localStorage.getItem(key)
      dispatch({ type: "HYDRATE", items: stored ? JSON.parse(stored) : [] })
    } catch {
      dispatch({ type: "HYDRATE", items: [] })
    }
  }, [status, session?.user?.id])

  // Persist to localStorage on change
  useEffect(() => {
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(state.items))
  }, [state.items, storageKey])

  const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        addToCart: (product, quantity = 1) => {
          dispatch({ type: "ADD_ITEM", product, quantity })
          toast.success(`${product.name} agregado al carrito`)
        },
        removeFromCart: (productId) => {
          dispatch({ type: "REMOVE_ITEM", productId })
          toast("Producto eliminado del carrito")
        },
        updateQuantity: (productId, quantity) => dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/**
 * Hook para consumir el contexto del carrito de compras.
 * Debe usarse dentro de `<CartProvider>` (ya montado en `Providers.tsx`).
 *
 * @returns Objeto con el estado del carrito y sus acciones:
 *   - `items` — array de `CartItem` actuales
 *   - `itemCount` — total de unidades en el carrito
 *   - `subtotal` — suma de `price * quantity` de todos los ítems (en USD)
 *   - `addToCart(product, quantity?)` — agrega o incrementa un ítem (respeta stock)
 *   - `removeFromCart(productId)` — elimina el ítem con toast de confirmación
 *   - `updateQuantity(productId, quantity)` — actualiza cantidad (0 elimina el ítem)
 *   - `clearCart()` — vacía el carrito
 *
 * @throws {Error} Si se usa fuera de `CartProvider`
 *
 * @example
 * const { addToCart, itemCount, subtotal } = useCart()
 * addToCart(product, 2)       // agrega 2 unidades
 * console.log(subtotal)       // → 2398.00
 */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
