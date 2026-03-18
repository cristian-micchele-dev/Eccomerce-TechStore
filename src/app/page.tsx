"use client"

import { Suspense, useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Category, Product } from "@/lib/types"
import { CategoryFilter } from "@/components/catalog/CategoryFilter"
import { ProductGrid } from "@/components/catalog/ProductGrid"
import { TrendingUp, Package, Users, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ProductFormDialog } from "@/components/admin/ProductFormDialog"
import { DeleteProductDialog } from "@/components/admin/DeleteProductDialog"
import { HeroBanner } from "@/components/catalog/HeroBanner"
import { CatalogFilters, MAX_PRICE } from "@/components/catalog/CatalogFilters"

type StatsData = { productCount: number; ordersThisMonth: number; userCount: number }

function HomeContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""

  const [selectedCategory, setSelectedCategory] = useState<Category>("all")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE])
  const [minRating, setMinRating] = useState(0)
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  const fetchProducts = useCallback(async (query: string, category: Category, pageNum: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      if (category !== "all") params.set("category", category)
      params.set("page", String(pageNum))
      params.set("limit", "12")
      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(
        (data.products ?? []).map((p: Product & { images?: string[]; specs?: { label: string; value: string }[] }) => ({
          ...p,
          images: p.images ?? [],
          specs: p.specs ?? [],
        }))
      )
      setTotalPages(data.pages ?? 1)
      setTotalProducts(data.total ?? 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    setPriceRange([0, MAX_PRICE])
    setMinRating(0)
  }, [q, selectedCategory])

  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) => p.price >= priceRange[0] && (priceRange[1] >= MAX_PRICE || p.price <= priceRange[1]))
        .filter((p) => minRating === 0 || p.rating >= minRating),
    [products, priceRange, minRating]
  )

  useEffect(() => {
    fetchProducts(q, selectedCategory, page)
  }, [fetchProducts, q, selectedCategory, page])

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setStatsData(data) })
      .catch(() => {})
  }, [])

  const formProduct = editingProduct
    ? {
        ...editingProduct,
        originalPrice: editingProduct.originalPrice ?? null,
        badge: editingProduct.badge ?? null,
        specs: editingProduct.specs ?? [],
      }
    : null

  return (
    <div className="space-y-6">
      <HeroBanner onCategorySelect={setSelectedCategory} />

      {/* Stats — solo visible para admins */}
      {isAdmin && <div className="grid grid-cols-3 gap-4">
        {/* Productos */}
        <div className="bg-transparent rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-muted-foreground">Productos</p>
            <div className="w-7 h-7 rounded-md bg-blue-500/8 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-blue-400/70" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums">
            {statsData === null ? (
              <span className="inline-block w-12 h-6 bg-secondary rounded animate-shimmer" />
            ) : statsData.productCount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">en catálogo</p>
        </div>

        {/* Usuarios */}
        <div className="bg-transparent rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-muted-foreground">Usuarios</p>
            <div className="relative w-7 h-7 rounded-md bg-amber-500/8 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-amber-400/70" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400/80 border border-card" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums">
            {statsData === null ? (
              <span className="inline-block w-12 h-6 bg-secondary rounded animate-shimmer" />
            ) : statsData.userCount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">registrados</p>
        </div>

        {/* Ventas este mes */}
        <div className="bg-transparent rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-muted-foreground">Ventas este mes</p>
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums">
            {statsData === null ? (
              <span className="inline-block w-12 h-6 bg-secondary rounded animate-shimmer" />
            ) : statsData.ordersThisMonth.toLocaleString()}
          </p>
          <p className="text-xs text-green-400/70 mt-1">órdenes confirmadas</p>
        </div>
      </div>}

      {/* Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {q ? (
            <h2 className="text-lg font-semibold">
              {loading ? "Buscando..." : `${totalProducts} resultado${totalProducts !== 1 ? "s" : ""} para "${q}"`}
            </h2>
          ) : (
            <h2 className="text-lg font-semibold">Catálogo</h2>
          )}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => { setEditingProduct(null); setFormOpen(true) }}>
                <Plus className="h-3.5 w-3.5" />
                Agregar producto
              </Button>
            )}
            {!q && (
              <span className="text-sm text-muted-foreground">
                {loading ? "Cargando..." : `${totalProducts} productos`}
              </span>
            )}
          </div>
        </div>

        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

        <CatalogFilters
          priceRange={priceRange}
          minRating={minRating}
          onPriceChange={setPriceRange}
          onRatingChange={setMinRating}
          onClear={() => { setPriceRange([0, MAX_PRICE]); setMinRating(0) }}
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border aspect-3/4 animate-shimmer" />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts}
            isAdmin={isAdmin}
            onEdit={(p) => { setEditingProduct(p); setFormOpen(true) }}
            onDelete={(p) => setDeletingProduct(p)}
          />
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm text-muted-foreground tabular-nums">
              Página <span className="text-foreground font-medium">{page}</span> de <span className="text-foreground font-medium">{totalPages}</span>
            </span>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Dialog crear / editar */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null) }}
        onSave={() => { setFormOpen(false); setEditingProduct(null); fetchProducts(q, selectedCategory, page) }}
        product={formProduct}
      />

      {/* Dialog eliminar */}
      {deletingProduct && (
        <DeleteProductDialog
          open={!!deletingProduct}
          productId={deletingProduct.id}
          productName={deletingProduct.name}
          onClose={() => setDeletingProduct(null)}
          onDeleted={() => { setDeletingProduct(null); fetchProducts(q, selectedCategory, page) }}
        />
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
