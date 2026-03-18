import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Coupon from "@/lib/models/Coupon"
import mongoose from "mongoose"

interface Params { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return null
  return session
}

export async function PUT(req: Request, { params }: Params) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const body = await req.json()

  // Whitelist de campos permitidos — evita mass assignment
  const allowed: Record<string, unknown> = {}
  if (typeof body.active === "boolean") allowed.active = body.active
  if (typeof body.code === "string" && body.code.trim()) allowed.code = body.code.trim().toUpperCase()
  if (body.type === "percent" || body.type === "fixed") allowed.type = body.type
  if (typeof body.value === "number" && body.value > 0) allowed.value = body.value
  if (typeof body.minOrder === "number" && body.minOrder >= 0) allowed.minOrder = body.minOrder
  if (body.maxUses === null || (typeof body.maxUses === "number" && body.maxUses > 0)) allowed.maxUses = body.maxUses
  if (body.expiresAt === null || body.expiresAt) allowed.expiresAt = body.expiresAt || null

  await connectDB()
  const coupon = await Coupon.findByIdAndUpdate(id, allowed, { new: true })
  if (!coupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })
  return NextResponse.json(coupon)
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  await connectDB()
  const deleted = await Coupon.findByIdAndDelete(id)
  if (!deleted) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })
  return NextResponse.json({ success: true })
}
