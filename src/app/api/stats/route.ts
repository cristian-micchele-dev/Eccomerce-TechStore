import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongoose"
import Product from "@/lib/models/Product"
import Order from "@/lib/models/Order"
import User from "@/lib/models/User"

export async function GET() {
  await connectDB()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [productCount, ordersThisMonth, userCount] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments(),
  ])

  return NextResponse.json({ productCount, ordersThisMonth, userCount })
}
