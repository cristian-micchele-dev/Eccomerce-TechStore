import { Product } from "@/lib/types"
import { ProductCard } from "./ProductCard"

interface ProductGridProps {
  products: Product[]
  isAdmin?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export function ProductGrid({ products, isAdmin, onEdit, onDelete }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg font-medium">Sin productos</p>
        <p className="text-sm mt-1">Prueba con otra categoría</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          isAdmin={isAdmin}
          onEdit={onEdit ? () => onEdit(product) : undefined}
          onDelete={onDelete ? () => onDelete(product) : undefined}
        />
      ))}
    </div>
  )
}
