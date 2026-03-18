import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"
import Order from "@/lib/models/Order"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  await connectDB()

  const [users, orderCounts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    Order.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
  ])
  const countMap = Object.fromEntries(orderCounts.map((o) => [o._id as string, o.count as number]))

  const result = users.map((u) => ({
    id: u._id.toString(),
    name: u.name ?? null,
    email: u.email,
    role: u.role,
    image: u.image ?? null,
    provider: u.provider ?? null,
    hasPassword: !!u.password,
    orderCount: countMap[u._id.toString()] ?? 0,
    createdAt: u.createdAt,
  }))

  return NextResponse.json(result)
}
