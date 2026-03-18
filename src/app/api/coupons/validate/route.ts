import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongoose"
import Coupon from "@/lib/models/Coupon"

export async function POST(req: Request) {
  const { code, subtotal } = await req.json()

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 })
  }
  if (typeof subtotal !== "number" || subtotal < 0 || !isFinite(subtotal)) {
    return NextResponse.json({ error: "Subtotal inválido" }, { status: 400 })
  }

  await connectDB()
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), active: true })

  if (!coupon) {
    return NextResponse.json({ error: "Cupón no encontrado o inactivo" }, { status: 404 })
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return NextResponse.json({ error: "El cupón expiró" }, { status: 400 })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "El cupón alcanzó el límite de usos" }, { status: 400 })
  }

  if (subtotal < coupon.minOrder) {
    return NextResponse.json(
      { error: `El pedido mínimo para este cupón es $${coupon.minOrder}` },
      { status: 400 }
    )
  }

  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  })
}
