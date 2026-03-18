"use client"

import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type Spec = { label: string; value: string }

type ProductFormData = {
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  category: string
  stock: string
  badge: string
  specs: Spec[]
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  category: string
  stock: number
  rating: number
  reviews: number
  badge: string | null
  specs: Spec[]
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  image: "",
  category: "",
  stock: "",
  badge: "none",
  specs: [],
}

const CATEGORIES = [
  { value: "pcs", label: "PCs" },
  { value: "monitores", label: "Monitores" },
  { value: "teclados", label: "Teclados" },
  { value: "mouse", label: "Mouse" },
  { value: "headsets", label: "Headsets" },
  { value: "almacenamiento", label: "Almacenamiento" },
]

const BADGES = [
  { value: "none", label: "Sin badge" },
  { value: "Nuevo", label: "Nuevo" },
  { value: "Oferta", label: "Oferta" },
  { value: "Popular", label: "Popular" },
]

interface Props {
  open: boolean
  onClose: () => void
  onSave: () => void
  product?: Product | null
}

export function ProductFormDialog({ open, onClose, onSave, product }: Props) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [imgError, setImgError] = useState(false)

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        image: product.image,
        category: product.category,
        stock: String(product.stock),
        badge: product.badge || "none",
        specs: product.specs ?? [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError("")
    setImgError(false)
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      ...form,
      badge: form.badge === "none" ? "" : form.badge,
      specs: form.specs.filter((s) => s.label.trim() || s.value.trim()),
    }

    try {
      const url = isEditing ? `/api/products/${product!.id}` : "/api/products"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar")
      }

      toast.success(isEditing ? "Producto actualizado" : "Producto creado")
      onSave()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof Omit<ProductFormData, "specs">) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const addSpec = () =>
    setForm((prev) => ({ ...prev, specs: [...prev.specs, { label: "", value: "" }] }))

  const removeSpec = (i: number) =>
    setForm((prev) => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }))

  const updateSpec = (i: number, key: keyof Spec, val: string) =>
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    }))

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" {...field("name")} required placeholder="Ej: PC Gamer Ultra" />
            </div>

            {/* Descripción */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...field("description")}
                required
                rows={3}
                placeholder="Descripción del producto"
              />
            </div>

            {/* Precio */}
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...field("price")}
                required
                placeholder="0.00"
              />
            </div>

            {/* Precio original */}
            <div className="space-y-1.5">
              <Label htmlFor="originalPrice">Precio original (tachado)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                min="0"
                {...field("originalPrice")}
                placeholder="Dejar vacío si no aplica"
              />
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...field("stock")}
                required
                placeholder="0"
              />
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <Label>Categoría *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((prev) => ({ ...prev, category: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL de imagen + preview */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="image">URL de imagen *</Label>
              <div className="flex items-center gap-3">
                {form.image && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-10 w-10 rounded-md object-cover bg-muted shrink-0 border border-border"
                    onError={() => setImgError(true)}
                    onLoad={() => setImgError(false)}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted shrink-0 border border-border flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground text-center leading-tight px-0.5">
                      sin img
                    </span>
                  </div>
                )}
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => {
                    setImgError(false)
                    setForm((prev) => ({ ...prev, image: e.target.value }))
                  }}
                  required
                  placeholder="https://..."
                  className="flex-1"
                />
              </div>
            </div>

            {/* Badge */}
            <div className="space-y-1.5">
              <Label>Badge</Label>
              <Select
                value={form.badge || "none"}
                onValueChange={(v) => setForm((prev) => ({ ...prev, badge: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Especificaciones técnicas */}
          <div className="space-y-3 pt-1">
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Especificaciones técnicas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpec}
                className="gap-1.5 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </Button>
            </div>

            {form.specs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                Sin especificaciones. Hacé clic en "Agregar" para añadir características como RAM, Procesador, etc.
              </p>
            ) : (
              <div className="space-y-2">
                {form.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="Característica (ej: RAM)"
                      value={spec.label}
                      onChange={(e) => updateSpec(i, "label", e.target.value)}
                      className="flex-1 h-9 text-sm"
                    />
                    <Input
                      placeholder="Valor (ej: 16 GB)"
                      value={spec.value}
                      onChange={(e) => updateSpec(i, "value", e.target.value)}
                      className="flex-1 h-9 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSpec(i)}
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar especificación"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
