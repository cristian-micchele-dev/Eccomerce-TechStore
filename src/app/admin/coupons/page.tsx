"use client"

import { useEffect, useState } from "react"
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, X, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Coupon {
  _id: string
  code: string
  type: "percent" | "fixed"
  value: number
  minOrder: number
  maxUses: number | null
  usedCount: number
  active: boolean
  expiresAt: string | null
}

const emptyForm = { code: "", type: "percent" as "percent" | "fixed", value: "", minOrder: "", maxUses: "", expiresAt: "" }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCoupons(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: form.minOrder ? Number(form.minOrder) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error ?? "Error al crear"); return }
      toast.success("Cupón creado")
      setCoupons((prev) => [data, ...prev])
      setForm(emptyForm)
      setOpen(false)
    } catch {
      setFormError("Error de conexión")
      toast.error("Error de conexión")
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(coupon: Coupon) {
    setToggling(coupon._id)
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      })
      if (res.ok) {
        setCoupons((prev) => prev.map((c) => c._id === coupon._id ? { ...c, active: !c.active } : c))
        toast(coupon.active ? "Cupón desactivado" : "Cupón activado")
      }
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cupón?")) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      toast.success("Cupón eliminado")
      setCoupons((prev) => prev.filter((c) => c._id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Cupones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestión de descuentos y promociones</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Nuevo cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear cupón</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Código *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="TECHSTORE10"
                    className="font-mono uppercase bg-secondary border-border"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo *</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
                    className="w-full h-9 rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
                  >
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Valor *</Label>
                  <Input
                    type="number" min={1} max={form.type === "percent" ? 100 : undefined}
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === "percent" ? "10" : "500"}
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pedido mínimo ($)</Label>
                  <Input
                    type="number" min={0}
                    value={form.minOrder}
                    onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                    placeholder="0"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Máx. usos</Label>
                  <Input
                    type="number" min={1}
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Sin límite"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Fecha de expiración</Label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              {formError && <p className="text-xs text-destructive">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cupón"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Cargando cupones...</div>
        ) : coupons.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-3 text-muted-foreground">
            <Tag className="w-10 h-10 opacity-20" />
            <p className="text-sm">No hay cupones creados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Código</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Descuento</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Mín. orden</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Usos</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Expira</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.minOrder > 0 ? `$${coupon.minOrder}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.usedCount}{coupon.maxUses !== null ? `/${coupon.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
                        : "Sin límite"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(coupon)}
                        disabled={toggling === coupon._id}
                        className="flex items-center gap-1.5 text-xs transition-colors"
                      >
                        {toggling === coupon._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : coupon.active ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Activo</span>
                            <ToggleRight className="w-4 h-4 text-green-400" />
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactivo</span>
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        disabled={deleting === coupon._id}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        {deleting === coupon._id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
