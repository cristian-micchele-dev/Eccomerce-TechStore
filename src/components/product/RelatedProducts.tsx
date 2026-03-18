import { Product } from "@/lib/types"
import { ProductCard } from "@/components/catalog/ProductCard"

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">También te puede interesar</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
