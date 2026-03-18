import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const body = await req.json()
  const { name, role, password } = body

  if (typeof name === "string" && name.trim().length > 100) {
    return NextResponse.json({ error: "El nombre no puede superar 100 caracteres" }, { status: 400 })
  }
  if (typeof password === "string" && password.length > 128) {
    return NextResponse.json({ error: "La contraseña no puede superar 128 caracteres" }, { status: 400 })
  }

  await connectDB()

  const update: Record<string, unknown> = {}
  if (typeof name === "string") update.name = name.trim() || undefined
  if (role === "ADMIN" || role === "CUSTOMER") update.role = role
  if (typeof password === "string" && password.length >= 6) {
    update.password = await bcrypt.hash(password, 10)
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true }).lean()
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  return NextResponse.json({
    id: user._id.toString(),
    name: user.name ?? null,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  if (session.user.id === id) {
    return NextResponse.json({ error: "No podés eliminar tu propia cuenta" }, { status: 400 })
  }

  await connectDB()
  const deleted = await User.findByIdAndDelete(id)
  if (!deleted) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  return NextResponse.json({ success: true })
}
