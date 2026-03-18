import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Order from "@/lib/models/Order"
import mongoose from "mongoose"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const { status } = await req.json()

  const validStatuses = ["pending", "confirmed", "shipped", "delivered"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    await connectDB()
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }
    return NextResponse.json({ message: "Estado actualizado", status: order.status })
  } catch {
    return NextResponse.json({ error: "Error al actualizar la orden" }, { status: 500 })
  }
}
