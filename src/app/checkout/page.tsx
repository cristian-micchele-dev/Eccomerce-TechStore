"use client"

import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Truck, Shield, Loader2, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import { useCoupon } from "@/context/CouponContext"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STEPS = ["Envío", "Pago"]

function CheckoutStepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {STEPS.map((label, i) => (
        <Fragment key={label}>
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium",
            i + 1 <= step ? "text-foreground" : "text-muted-foreground"
          )}>
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
              i + 1 < step
                ? "bg-primary text-primary-foreground"
                : i + 1 === step
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}>
              {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            {label}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("flex-1 h-px transition-colors", i + 1 < step ? "bg-primary" : "bg-border")} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { appliedCoupon, clearCoupon } = useCoupon()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const shipping = subtotal > 299 ? 0 : subtotal > 0 ? 15 : 0
  const discount = appliedCoupon?.discount ?? 0
  const total = subtotal + shipping - discount

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleContinue() {
    const required = ["name", "email", "address", "city"] as const
    for (const field of required) {
      if (!form[field].trim()) {
        setError("Por favor completá todos los campos requeridos")
        return
      }
    }
    setError("")
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return

    setError("")
    setLoading(true)
    try {
      // 1. Crear orden en la DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
          })),
          total,
          discountCode: appliedCoupon?.code,
          discount,
        }),
      })
      if (!orderRes.ok) {
        const data = await orderRes.json()
        const msg = data.error ?? "Error al procesar el pedido"
        setError(msg)
        toast.error(msg)
        return
      }
      const order = await orderRes.json()

      // 2. Crear preferencia de MercadoPago
      const prefRes = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          items: items.map(({ product, quantity }) => ({
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
          })),
          total,
        }),
      })

      if (!prefRes.ok) {
        const msg = "Error al iniciar el pago. Tu pedido fue guardado."
        setError(msg)
        toast.error(msg)
        return
      }

      const { init_point, sandbox_init_point } = await prefRes.json()
      clearCart()
      clearCoupon()

      // Redirigir a MercadoPago (sandbox en dev, production en prod)
      const mpUrl = process.env.NODE_ENV === "production" ? init_point : (sandbox_init_point ?? init_point)
      router.push(mpUrl)
    } catch {
      const msg = "Error de conexión. Intentá de nuevo."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <p className="text-lg font-medium">Tu carrito está vacío</p>
        <Link href="/"><Button>Ver catálogo</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <CheckoutStepper step={step} />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — steps */}
          <div className="lg:col-span-2 space-y-5">
            {/* PASO 1 — Datos de envío */}
            {step === 1 && (
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="w-4 h-4 text-primary" />
                  Datos de envío
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Juan García" className="bg-secondary border-border" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@email.com" className="bg-secondary border-border" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Av. Corrientes 1234, Piso 3" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Buenos Aires" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">Código postal</Label>
                    <Input id="zip" name="zip" value={form.zip} onChange={handleChange} placeholder="C1043" className="bg-secondary border-border" />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex justify-end pt-1">
                  <Button type="button" onClick={handleContinue} className="gap-2">
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* PASO 2 — Método de pago */}
            {step === 2 && (
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Método de pago
                </div>
                <div className="flex items-center gap-3 bg-secondary rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">MercadoPago</p>
                    <p className="text-xs text-muted-foreground">Tarjeta de crédito, débito, QR y más</p>
                  </div>
                  <div className="text-xs font-mono text-primary border border-primary/30 rounded px-2 py-0.5">Seleccionado</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  Pagás de forma segura en la plataforma de MercadoPago.
                </div>

                {/* Resumen de envío completado */}
                <Separator />
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground text-sm">{form.name}</p>
                  <p>{form.email}</p>
                  <p>{form.address}, {form.city} {form.zip}</p>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                  </Button>
                  <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {loading ? "Procesando..." : "Pagar con MercadoPago"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right — summary (siempre visible) */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-sm">Resumen del pedido</h3>
              <div className="space-y-2">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">× {quantity}</p>
                    </div>
                    <p className="text-xs font-semibold shrink-0">${(product.price * quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span>{shipping === 0 ? <span className="text-green-400">Gratis</span> : `$${shipping}`}</span>
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
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
