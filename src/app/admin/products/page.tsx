"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2, Search, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductFormDialog } from "@/components/admin/ProductFormDialog"
import { DeleteProductDialog } from "@/components/admin/DeleteProductDialog"

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
  specs: { label: string; value: string }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  pcs: "PCs",
  monitores: "Monitores",
  teclados: "Teclados",
  mouse: "Mouse",
  headsets: "Headsets",
  almacenamiento: "Almacenamiento",
}

const CATEGORY_COLORS: Record<string, string> = {
  pcs: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  monitores: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  teclados: "bg-green-500/10 text-green-400 border-green-500/20",
  mouse: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  headsets: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  almacenamiento: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products?limit=200")
      const data = await res.json()
      setProducts(data.products ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const openDelete = (product: Product) => {
    setDeletingProduct(product)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} producto{products.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PackageOpen className="h-8 w-8" />
                    <span>
                      {search ? "No se encontraron resultados" : "No hay productos aún"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ""
                        }}
                      />
                      <span className="font-medium text-sm line-clamp-2 max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        CATEGORY_COLORS[product.category] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        product.stock === 0
                          ? "text-destructive font-medium"
                          : product.stock < 5
                          ? "text-yellow-400 font-medium"
                          : "text-green-400"
                      }
                    >
                      {product.stock === 0 ? "Sin stock" : product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.badge ? (
                      <Badge variant="secondary" className="text-xs">
                        {product.badge}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(product)}
                        aria-label="Editar producto"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => openDelete(product)}
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={fetchProducts}
        product={editingProduct}
      />

      {deletingProduct && (
        <DeleteProductDialog
          open={deleteOpen}
          productId={deletingProduct.id}
          productName={deletingProduct.name}
          onClose={() => setDeleteOpen(false)}
          onDeleted={fetchProducts}
        />
      )}
    </div>
  )
}
