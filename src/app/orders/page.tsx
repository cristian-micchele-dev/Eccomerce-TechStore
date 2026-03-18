"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered"
  createdAt: string
}

const steps: Order["status"][] = ["pending", "confirmed", "shipped", "delivered"]

const stepConfig: Record<Order["status"], { label: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", icon: Clock },
  confirmed: { label: "Confirmado", icon: CheckCircle },
  shipped: { label: "En camino", icon: Truck },
  delivered: { label: "Entregado", icon: Package },
}

function OrderStepper({ status }: { status: Order["status"] }) {
  const currentIndex = steps.indexOf(status)
  return (
    <div className="flex items-center mt-3">
      {steps.map((step, i) => {
        const isPast = i < currentIndex
        const isCurrent = i === currentIndex
        const { label, icon: Icon } = stepConfig[step]
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isPast
                    ? "bg-muted-foreground/60 text-background"
                    : "bg-secondary border border-border text-muted-foreground/40"
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>
              <span
                className={`text-[9px] font-medium whitespace-nowrap ${
                  isCurrent ? "text-primary" : isPast ? "text-muted-foreground" : "text-muted-foreground/40"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 mb-4 ${i < currentIndex ? "bg-muted-foreground/60" : "bg-border"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data)
        else setError("No se pudieron cargar las órdenes")
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Mis Compras</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-xl p-5 animate-shimmer h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold">Mis Compras</h1>
        <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 pt-16 text-muted-foreground">
        <ShoppingBag className="w-16 h-16 opacity-20" />
        <p className="text-lg font-medium">Todavía no hiciste compras</p>
        <p className="text-sm">Explorá el catálogo y encontrá lo que necesitás</p>
        <Link href="/">
          <Button className="mt-2">Ver catálogo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Mis Compras</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedId === order._id
          const date = new Date(order.createdAt).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0)
          const shortId = `#${order._id.slice(-6).toUpperCase()}`

          return (
            <div key={order._id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-primary">{shortId}</span>
                      <span className="text-xs text-muted-foreground/60">·</span>
                      <span className="text-xs text-muted-foreground">{date}</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {itemCount} {itemCount === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0">${order.total.toLocaleString()}</p>
                </div>

                {/* Stepper */}
                <OrderStepper status={order.status} />
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order._id)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent py-2 border-t border-border transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {isExpanded ? "Ocultar productos" : "Ver productos"}
              </button>

              {/* Expanded items */}
              {isExpanded && (
                <div className="border-t border-border divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 px-5 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
