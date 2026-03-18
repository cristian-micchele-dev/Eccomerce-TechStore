import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"

const MAX_BYTES = 200 * 1024 // 200 KB

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { image } = await req.json()

  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 })
  }

  const base64 = image.split(",")[1] ?? ""
  if (Buffer.byteLength(base64, "base64") > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 200 KB" }, { status: 400 })
  }

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, { image })

  return NextResponse.json({ success: true })
}
