import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(session.user.id).select("name email phone image role").lean()
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  return NextResponse.json({
    name: user.name ?? null,
    email: user.email,
    phone: user.phone ?? null,
    image: user.image ?? null,
  })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { name, phone } = await req.json()

  if (typeof name === "string" && name.trim().length > 100) {
    return NextResponse.json({ error: "El nombre no puede superar 100 caracteres" }, { status: 400 })
  }
  if (typeof phone === "string" && phone.trim().length > 30) {
    return NextResponse.json({ error: "El teléfono no puede superar 30 caracteres" }, { status: 400 })
  }

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, {
    ...(typeof name === "string" && { name: name.trim() }),
    phone: typeof phone === "string" ? phone.trim() || null : null,
  })

  return NextResponse.json({ success: true })
}
