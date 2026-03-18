"use client"

import { useEffect, useState } from "react"
import { useWishlist } from "@/context/WishlistContext"
import { Product } from "@/lib/types"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { Bookmark } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { ids } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { products?: Product[] }) => {
        const list = data.products ?? []
        setProducts(
          list
            .filter((p) => ids.has(p.id))
            .map((p) => ({ ...p, images: (p as Product & { images?: string[] }).images ?? [], specs: (p as Product & { specs?: { label: string; value: string }[] }).specs ?? [] }))
        )
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [ids])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Favoritos</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border aspect-3/4 animate-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  if (ids.size === 0 || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-16 text-muted-foreground">
        <Bookmark className="w-16 h-16 opacity-20" />
        <p className="text-lg font-medium">No tenés productos guardados</p>
        <p className="text-sm">Hacé clic en el ícono de bookmark en cualquier producto</p>
        <Link href="/">
          <Button className="mt-2">Ver catálogo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Favoritos</h1>
        <span className="text-sm text-muted-foreground">{products.length} guardado{products.length !== 1 ? "s" : ""}</span>
      </div>
      <ProductGrid products={products} />
    </div>
  )
}
