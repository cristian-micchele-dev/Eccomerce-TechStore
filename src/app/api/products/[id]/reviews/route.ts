import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Review from "@/lib/models/Review"
import ProductModel from "@/lib/models/Product"
import mongoose from "mongoose"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  await connectDB()
  const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 }).lean()
  return NextResponse.json(reviews)
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const { rating, comment } = await req.json()
  if (!rating || rating < 1 || rating > 5 || !comment?.trim())
    return NextResponse.json({ error: "Rating (1-5) y comentario son requeridos" }, { status: 400 })

  await connectDB()

  try {
    const review = await Review.create({
      productId: id,
      userId: session.user.id,
      userName: session.user.name ?? "Usuario",
      rating,
      comment: comment.trim(),
    })

    // Recalcular rating promedio del producto
    const agg = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ])
    if (agg.length > 0) {
      await ProductModel.findByIdAndUpdate(id, {
        rating: Math.round(agg[0].avg * 10) / 10,
        reviews: agg[0].count,
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000)
      return NextResponse.json({ error: "Ya dejaste una reseña para este producto" }, { status: 409 })
    return NextResponse.json({ error: "Error al guardar la reseña" }, { status: 500 })
  }
}
