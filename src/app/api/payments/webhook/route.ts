import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { connectDB } from "@/lib/mongoose"
import Order from "@/lib/models/Order"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MercadoPago envía distintos tipos de notificaciones
    if (body.type !== "payment") {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) return NextResponse.json({ error: "No configurado" }, { status: 500 })

    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    const orderId = payment.external_reference
    if (!orderId) return NextResponse.json({ received: true })

    await connectDB()

    if (payment.status === "approved") {
      await Order.findByIdAndUpdate(orderId, {
        status: "confirmed",
        paymentId: String(paymentId),
        paymentStatus: "approved",
      })
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await Order.findByIdAndUpdate(orderId, {
        paymentId: String(paymentId),
        paymentStatus: payment.status,
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("MP webhook error:", err)
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 })
  }
}
