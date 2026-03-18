"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Clock, CheckCircle, Truck, Package, ChevronDown, ChevronUp } from "lucide-react"

interface OrderUser {
  name?: string
  email: string
}

interface AdminOrder {
  id: string
  userId: string
  items: { productId: string; name: string; price: number; quantity: number; image: string }[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered"
  createdAt: string
  user: OrderUser | null
}

const statusConfig = {
  pending: { label: "Pendiente", icon: Clock, className: "text-muted-foreground" },
  confirmed: { label: "Confirmado", icon: CheckCircle, className: "text-blue-400" },
  shipped: { label: "En camino", icon: Truck, className: "text-yellow-400" },
  delivered: { label: "Entregado", icon: Package, className: "text-green-400" },
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered"] as const
type StatusFilter = "all" | AdminOrder["status"]

const tabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "shipped", label: "En camino" },
  { value: "delivered", label: "Entregadas" },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<StatusFilter>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setOrders(data)
        else throw new Error("Respuesta inesperada")
      })
      .catch(() => setError("No se pudieron cargar las órdenes. Intentá recargar la página."))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as AdminOrder["status"] } : o))
        )
      }
    } catch {
      // silent
    } finally {
      setUpdating(null)
    }
  }

  const statusCounts = useMemo(
    () =>
      orders.reduce(
        (acc, o) => { acc[o.status]++; return acc },
        { pending: 0, confirmed: 0, shipped: 0, delivered: 0 } as Record<AdminOrder["status"], number>
      ),
    [orders]
  )

  const filtered = useMemo(
    () => (activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab)),
    [orders, activeTab]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Órdenes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestión de pedidos de clientes</p>
        </div>
        {statusCounts.pending > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {statusCounts.pending} pendiente{statusCounts.pending !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
        {tabs.map((tab) => {
          const count = tab.value === "all" ? orders.length : statusCounts[tab.value as AdminOrder["status"]]
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Cargando órdenes...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {activeTab === "all" ? "No hay órdenes todavía" : "No hay órdenes con este estado"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-8 px-3 py-3" />
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Orden / Fecha</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Cliente</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Items</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Total</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const { icon: Icon, className } = statusConfig[order.status]
                  const isExpanded = expandedId === order.id
                  const date = new Date(order.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0)
                  const shortId = `#${order.id.slice(-6).toUpperCase()}`

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`border-b border-border transition-colors cursor-pointer ${isExpanded ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="px-3 py-3 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-semibold text-primary">{shortId}</p>
                          <p className="text-xs text-muted-foreground">{date}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm">{order.user?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.email ?? order.userId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            {itemCount} {itemCount === 1 ? "producto" : "productos"}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold">${order.total.toLocaleString()}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${className}`} />
                            <select
                              value={order.status}
                              disabled={updating === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="text-xs bg-secondary border border-border rounded-md px-2 py-1 text-foreground cursor-pointer disabled:opacity-50"
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                  {statusConfig[s].label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-border bg-secondary/20">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.productId} className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-card shrink-0 border border-border">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                                  </div>
                                  <span className="text-sm flex-1">{item.name}</span>
                                  <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                                  <span className="text-sm font-semibold w-20 text-right">${(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
