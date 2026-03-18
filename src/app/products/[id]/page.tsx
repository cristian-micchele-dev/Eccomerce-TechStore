import { connectDB } from "@/lib/mongoose"
import ProductModel from "@/lib/models/Product"
import { ProductDetail } from "@/components/product/ProductDetail"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import { ProductReviews } from "@/components/product/ProductReviews"
import { notFound } from "next/navigation"
import mongoose from "mongoose"
import type { Product } from "@/lib/types"

interface Props {
  params: Promise<{ id: string }>
}

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: (raw._id as mongoose.Types.ObjectId).toString(),
    name: raw.name as string,
    description: raw.description as string,
    price: raw.price as number,
    originalPrice: raw.originalPrice as number | undefined,
    image: raw.image as string,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [raw.image as string],
    category: raw.category as Product["category"],
    specs: Array.isArray(raw.specs)
      ? (raw.specs as Array<{ label: string; value: string }>).map(({ label, value }) => ({ label, value }))
      : [],
    stock: raw.stock as number,
    rating: raw.rating as number,
    reviews: raw.reviews as number,
    badge: raw.badge as Product["badge"],
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  if (!mongoose.Types.ObjectId.isValid(id)) notFound()

  await connectDB()
  const raw = await ProductModel.findById(id).lean()

  if (!raw) notFound()

  const relatedRaw = await ProductModel.find({
    category: raw.category,
    _id: { $ne: raw._id },
  })
    .limit(4)
    .lean()

  const product = mapProduct(raw as unknown as Record<string, unknown>)
  const related = relatedRaw.map((r) => mapProduct(r as unknown as Record<string, unknown>))

  return (
    <div className="space-y-10">
      <ProductDetail product={product} />
      <ProductReviews productId={product.id} />
      <RelatedProducts products={related} />
    </div>
  )
}
