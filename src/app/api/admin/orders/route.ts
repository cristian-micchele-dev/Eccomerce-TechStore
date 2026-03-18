import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Order from "@/lib/models/Order"
import User from "@/lib/models/User"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  await connectDB()
  const orders = await Order.find().sort({ createdAt: -1 }).lean()

  // Lookup user info for each order
  const userIds = [...new Set(orders.map((o) => o.userId))]
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email")
    .lean()

  const userMap = Object.fromEntries(
    users.map((u) => [
      (u._id as { toString(): string }).toString(),
      { name: u.name, email: u.email },
    ])
  )

  const result = orders.map((o) => ({
    ...o,
    id: (o._id as { toString(): string }).toString(),
    _id: undefined,
    __v: undefined,
    user: userMap[o.userId] ?? null,
  }))

  return NextResponse.json(result)
}
