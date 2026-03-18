import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Product from "@/lib/models/Product"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isValidId(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    await connectDB()
    const product = await Product.findById(id)
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    return NextResponse.json(product.toJSON())
  } catch {
    return NextResponse.json({ error: "Error al obtener el producto" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    if (!isValidId(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    await connectDB()
    const body = await req.json()
    const { name, description, price, originalPrice, image, category, stock, badge, specs } = body

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image,
        category,
        stock: parseInt(stock),
        badge: badge || undefined,
        specs: Array.isArray(specs) ? specs : [],
      },
      { new: true, runValidators: true }
    )
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    return NextResponse.json(product.toJSON())
  } catch {
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    if (!isValidId(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    await connectDB()
    const deleted = await Product.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 })
  }
}
