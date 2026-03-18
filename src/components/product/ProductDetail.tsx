"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { ShoppingCart, Heart, Star, ChevronLeft, Minus, Plus, Truck, Shield, RotateCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function handleAddToCart() {
    addToCart(product, quantity)
    setAdded(true)
    timerRef.current = setTimeout(() => setAdded(false), 2000)
  }

  const allImages = useMemo(
    () => [product.image, ...product.images.slice(1)],
    [product.image, product.images]
  )

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-card border border-border">
            <Image
              src={allImages[selectedImage] || product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground border-0">{product.badge}</Badge>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                    selectedImage === i ? "border-primary" : "border-border hover:border-primary/40"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground capitalize mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("w-4 h-4", i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reseñas)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through mb-0.5">${product.originalPrice}</span>
            )}
            {product.originalPrice && (
              <Badge variant="outline" className="border-primary/40 text-primary mb-0.5">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <Separator />

          {/* Specs */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Especificaciones</h3>
            <div className="space-y-2">
              {product.specs.map(({ label, value }) => (
                <div key={label} className="flex items-center text-sm">
                  <span className="w-36 text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Stock */}
          <div className="space-y-1.5">
            <p className="text-sm">
              Stock:{" "}
              <span className={cn("font-semibold", product.stock > 10 ? "text-green-400" : product.stock > 0 ? "text-amber-400" : "text-destructive")}>
                {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
              </span>
            </p>
            {product.stock > 0 && product.stock <= 5 && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                ¡Solo quedan {product.stock} {product.stock === 1 ? "unidad" : "unidades"}!
              </div>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-muted-foreground hover:text-foreground transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              className="flex-1 gap-2 transition-all"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? "¡Agregado!" : "Agregar al carrito"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggle(product.id)}
              className={cn(wishlisted && "border-primary text-primary")}
            >
              <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
            </Button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: "Envío gratis +$299" },
              { icon: Shield, text: "Garantía 12 meses" },
              { icon: RotateCcw, text: "30 días devolución" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-lg border border-border text-center">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
