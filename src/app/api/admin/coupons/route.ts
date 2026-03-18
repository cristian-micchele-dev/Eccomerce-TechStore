import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Coupon from "@/lib/models/Coupon"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return null
  return session
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await connectDB()
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json(coupons)
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { code, type, value, minOrder, maxUses, expiresAt } = await req.json()

  if (!code?.trim() || !type || !value) {
    return NextResponse.json({ error: "Código, tipo y valor son requeridos" }, { status: 400 })
  }
  if (!["percent", "fixed"].includes(type)) {
    return NextResponse.json({ error: "Tipo debe ser 'percent' o 'fixed'" }, { status: 400 })
  }
  if (type === "percent" && (value <= 0 || value > 100)) {
    return NextResponse.json({ error: "El porcentaje debe estar entre 1 y 100" }, { status: 400 })
  }

  await connectDB()
  try {
    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      type,
      value,
      minOrder: minOrder ?? 0,
      maxUses: maxUses || null,
      expiresAt: expiresAt || null,
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000)
      return NextResponse.json({ error: "Ya existe un cupón con ese código" }, { status: 409 })
    return NextResponse.json({ error: "Error al crear el cupón" }, { status: 500 })
  }
}
