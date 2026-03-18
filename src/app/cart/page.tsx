"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ChevronLeft, Tag, CreditCard, ShoppingBag, Loader2, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import { useCoupon } from "@/context/CouponContext"

export default function CartPage() {
  const { items, itemCount, subtotal, removeFromCart, updateQuantity } = useCart()
  const { appliedCoupon, setCoupon, clearCoupon } = useCoupon()
  const router = useRouter()
  const [couponCode, setCouponCode] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error ?? "Cupón inválido")
      } else {
        setCoupon(data)
        setCouponCode("")
      }
    } catch {
      setCouponError("Error de conexión")
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    clearCoupon()
    setCouponError("")
  }

  function handleCheckout() {
    router.push("/checkout")
  }

  const shipping = subtotal > 299 ? 0 : subtotal > 0 ? 15 : 0
  const discount = appliedCoupon?.discount ?? 0
  const total = subtotal + shipping - discount

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <ShoppingBag className="w-16 h-16 opacity-20" />
        <p className="text-lg font-medium">Tu carrito está vacío</p>
        <p className="text-sm">Agrega productos desde el catálogo</p>
        <Link href="/">
          <Button className="mt-2">Ver catálogo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Carrito ({itemCount} {itemCount === 1 ? "item" : "items"})</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-card rounded-xl border border-border p-4 flex gap-4">
              <Link href={`/products/${product.id}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="80px" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="text-sm font-semibold leading-tight line-clamp-1 hover:text-primary transition-colors">
                  {product.name}
                </Link>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{product.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-2.5 py-1.5">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold">${(product.price * quantity).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(product.id)}
                className="text-muted-foreground hover:text-destructive transition-colors self-start"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="w-4 h-4 text-primary" />
              Cupón de descuento
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-mono font-semibold text-primary">{appliedCoupon.code}</span>
                  <span className="text-muted-foreground">
                    {appliedCoupon.type === "percent" ? `-${appliedCoupon.value}%` : `-$${appliedCoupon.value}`}
                  </span>
                </div>
                <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa tu código"
                    className="h-9 text-sm bg-secondary border-border uppercase"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <Button variant="outline" size="sm" className="shrink-0" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                    {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h3 className="font-semibold">Resumen del pedido</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>
                  {shipping === 0
                    ? <span className="text-green-400">Gratis</span>
                    : `$${shipping}`
                  }
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento ({appliedCoupon?.code})</span>
                  <span className="text-primary">-${discount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg">${total.toLocaleString()}</span>
            </div>
            <Button className="w-full gap-2" onClick={handleCheckout}>
              <CreditCard className="w-4 h-4" />
              Proceder al pago
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Pago seguro con SSL encriptado
            </p>
          </div>

          {/* Shipping notice */}
          {shipping > 0 && (
            <div className="bg-primary/10 rounded-xl border border-primary/20 p-3 text-xs text-primary text-center">
              Agrega ${(299 - subtotal).toLocaleString()} más para envío gratis
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
