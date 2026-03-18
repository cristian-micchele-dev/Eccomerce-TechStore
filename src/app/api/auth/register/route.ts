import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    await connectDB()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ name, email, password: hashedPassword, role: "CUSTOMER" })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error("[register] Error:", err)
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 })
  }
}
