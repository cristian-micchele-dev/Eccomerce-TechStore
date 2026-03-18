import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Product from "@/lib/models/Product"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const q = req.nextUrl.searchParams.get("q")
    const category = req.nextUrl.searchParams.get("category")
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"))
    const limit = Math.min(48, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "12")))

    // M-1: escapar caracteres especiales de regex para prevenir ReDoS
    const escaped = q ? q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null
    const filter: Record<string, unknown> = {}
    if (escaped) filter.name = { $regex: escaped, $options: "i" }
    if (category && category !== "all") filter.category = category

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ])

    const mapped = products.map((p) => ({
      ...p,
      id: (p._id as unknown as { toString(): string }).toString(),
      _id: undefined,
      __v: undefined,
    }))

    return NextResponse.json({ products: mapped, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    await connectDB()
    const body = await req.json()
    const { name, description, price, originalPrice, image, category, stock, badge, specs } = body

    if (!name || !description || !price || !image || !category || stock == null) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      image,
      images: image ? [image] : [],
      category,
      stock: parseInt(stock),
      badge: badge || undefined,
      specs: Array.isArray(specs) ? specs : [],
      rating: 0,
      reviews: 0,
    })
    return NextResponse.json(product.toJSON(), { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 })
  }
}
