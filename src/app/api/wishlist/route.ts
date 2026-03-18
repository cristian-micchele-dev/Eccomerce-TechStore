import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Wishlist from "@/lib/models/Wishlist"
import mongoose from "mongoose"

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

export async function GET() {
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await connectDB()
  const wishlist = await Wishlist.findOne({ userId: session.user.id }).lean()
  const productIds = (wishlist?.productIds ?? []).map((id) => id.toString())
  return NextResponse.json({ productIds })
}

export async function POST(req: NextRequest) {
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { productId } = await req.json()
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
  }

  await connectDB()

  // Verificar si ya existe en la wishlist para hacer toggle
  const existing = await Wishlist.findOne({ userId: session.user.id, productIds: productId })

  if (existing) {
    await Wishlist.updateOne(
      { userId: session.user.id },
      { $pull: { productIds: new mongoose.Types.ObjectId(productId) } }
    )
    return NextResponse.json({ action: "removed" })
  } else {
    await Wishlist.findOneAndUpdate(
      { userId: session.user.id },
      { $addToSet: { productIds: new mongoose.Types.ObjectId(productId) } },
      { upsert: true }
    )
    return NextResponse.json({ action: "added" })
  }
}
