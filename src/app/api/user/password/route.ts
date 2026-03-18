import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Completá todos los campos" }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
  }

  await connectDB()
  const user = await User.findById(session.user.id).select("+password")

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }
  if (!user.password) {
    return NextResponse.json(
      { error: "Tu cuenta usa Google. No podés cambiar la contraseña desde aquí." },
      { status: 400 }
    )
  }

  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) {
    return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await User.findByIdAndUpdate(session.user.id, { password: hashed })

  return NextResponse.json({ message: "Contraseña actualizada correctamente" })
}
