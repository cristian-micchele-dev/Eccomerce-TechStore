import mongoose, { Schema, Document, Model } from "mongoose"

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  userId: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered"
  paymentId?: string
  paymentStatus?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered"],
      default: "pending",
    },
    paymentId: { type: String },
    paymentStatus: { type: String },
  },
  { timestamps: true }
)

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", OrderSchema)

export default Order
