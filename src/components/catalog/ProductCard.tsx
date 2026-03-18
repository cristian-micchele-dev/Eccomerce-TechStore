"use client"

import Image from "next/image"
import Link from "next/link"
import { Bookmark, Star, Pencil, Trash2, ShoppingCart } from "lucide-react"

import { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

interface ProductCardProps {
  product: Product
  index?: number
  isAdmin?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const badgeColors: Record<string, string> = {
  Nuevo: "bg-blue-500/10 text-blue-400/75 border-blue-500/20",
  Oferta: "bg-primary/15 text-primary border-primary/25",
  Popular: "bg-amber-500/10 text-amber-400/75 border-amber-500/20",
}

export function ProductCard({ product, index = 0, isAdmin, onEdit, onDelete }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const bookmarked = isWishlisted(product.id)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addToCart(product, 1)
    setAdded(true)
    timerRef.current = setTimeout(() => setAdded(false), 1800)
  }

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative bg-transparent rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggle(product.id)
          }}
          aria-label={bookmarked ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={cn(
            "absolute top-3 right-3 z-10 w-7 h-7 rounded-md flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            bookmarked ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
        </button>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border", badgeColors[product.badge])}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative h-44 bg-secondary overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {/* Spec readout overlay */}
          {product.specs.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <div className="space-y-1">
                {product.specs.slice(0, 2).map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-white/50 font-mono uppercase tracking-wide truncate">{spec.label}</span>
                    <span className="text-[10px] text-white/90 font-mono shrink-0">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground leading-tight line-clamp-2 flex-1">
              {product.name}
            </p>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <p className="text-sm font-bold text-foreground font-mono tabular-nums">${product.price.toLocaleString()}</p>
                {discountPct && (
                  <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-primary/15 text-primary">-{discountPct}%</span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-xs text-muted-foreground line-through">${product.originalPrice.toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Rating + stock bajo */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400/75 text-amber-400/75" />
              <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
            </div>
            {lowStock && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 border border-amber-500/20">
                Quedan {product.stock}
              </span>
            )}
          </div>

          {/* Add to cart — solo usuario */}
          {!isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                "mt-3 w-full flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                product.stock === 0
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : added
                  ? "bg-green-500/20 text-green-400"
                  : "bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {product.stock === 0 ? "Sin stock" : added ? "¡Agregado!" : "Agregar al carrito"}
            </button>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.() }}
                className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.() }}
                className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 className="w-3 h-3" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
