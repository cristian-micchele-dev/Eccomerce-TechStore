import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { orderId, items, total } = await req.json()
  if (!orderId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Datos de orden inválidos" }, { status: 400 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: "MercadoPago no configurado" }, { status: 500 })
  }

  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    const result = await preference.create({
      body: {
        items: items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
          id: orderId,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS",
          picture_url: item.image,
        })),
        back_urls: {
          success: `${baseUrl}/checkout/success?orderId=${orderId}`,
          failure: `${baseUrl}/checkout/failure?orderId=${orderId}`,
          pending: `${baseUrl}/checkout/success?orderId=${orderId}&status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/payments/webhook`,
        external_reference: orderId,
        statement_descriptor: "TechStore",
      },
    })

    return NextResponse.json({ init_point: result.init_point, sandbox_init_point: result.sandbox_init_point })
  } catch (err) {
    console.error("MP create-preference error:", err)
    return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 })
  }
}
