import mongoose, { Schema, Document, Model } from "mongoose"

interface IProductSpec {
  label: string
  value: string
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  specs: IProductSpec[]
  stock: number
  rating: number
  reviews: number
  badge?: string
  createdAt: Date
  updatedAt: Date
}

const ProductSpecSchema = new Schema<IProductSpec>(
  { label: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
)

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true },
    specs: { type: [ProductSpecSchema], default: [] },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    badge: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Índices para queries frecuentes
ProductSchema.index({ category: 1 })
ProductSchema.index({ name: "text" })

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema)

export default Product
