import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Order from "@/lib/models/Order"
import Product from "@/lib/models/Product"
import Coupon from "@/lib/models/Coupon"

type VerifiedItem = {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

function toRestoreOps(items: VerifiedItem[]) {
  return items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: item.quantity } },
    },
  }))
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  await connectDB()
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()

  // M-3: mapear _id como string consistente
  const mapped = orders.map((o) => ({
    ...o,
    _id: (o._id as { toString(): string }).toString(),
    __v: undefined,
  }))

  return NextResponse.json(mapped)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { items, discountCode } = body

  // Validación básica de estructura
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
  }

  for (const item of items) {
    if (
      typeof item.productId !== "string" ||
      !item.productId ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return NextResponse.json({ error: "Item inválido en el carrito" }, { status: 400 })
    }
  }

  try {
    await connectDB()

    // C-4: verificar existencia y precio real desde DB
    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await Product.find({ _id: { $in: productIds } }).lean()
    const productMap = Object.fromEntries(
      products.map((p) => [(p._id as { toString(): string }).toString(), p])
    )

    for (const item of items) {
      const product = productMap[item.productId]
      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 400 }
        )
      }
      // C-5 (pre-check): verificar stock antes del decremento atómico
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // C-3: recalcular total server-side con precios reales de DB
    const subtotal = items.reduce(
      (acc: number, item: { productId: string; quantity: number }) =>
        acc + productMap[item.productId].price * item.quantity,
      0
    )
    const shipping = subtotal > 299 ? 0 : subtotal > 0 ? 15 : 0

    // Verificar cupón server-side si se envió uno
    let verifiedDiscount = 0
    let validCouponId: string | null = null
    if (typeof discountCode === "string" && discountCode.trim()) {
      const coupon = await Coupon.findOne({ code: discountCode.trim().toUpperCase(), active: true })
      if (coupon) {
        const now = new Date()
        const expired = coupon.expiresAt && now > coupon.expiresAt
        const maxedOut = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
        const belowMin = subtotal < coupon.minOrder
        if (!expired && !maxedOut && !belowMin) {
          verifiedDiscount = coupon.type === "percent"
            ? Math.round((subtotal * coupon.value) / 100)
            : Math.min(coupon.value, subtotal)
          validCouponId = (coupon._id as { toString(): string }).toString()
        }
      }
    }

    const total = subtotal + shipping - verifiedDiscount

    // Items verificados con datos de DB (nombre, precio e imagen reales)
    const verifiedItems: VerifiedItem[] = items.map((item: { productId: string; quantity: number }) => {
      const p = productMap[item.productId]
      return {
        productId: item.productId,
        name: p.name,
        price: p.price,
        quantity: item.quantity,
        image: p.image,
      }
    })

    // C-5: decrementar stock atómicamente con condición $gte (ordered:true para rollback seguro)
    const bulkOps = verifiedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }))

    const bulkResult = await Product.bulkWrite(bulkOps, { ordered: true })

    if (bulkResult.modifiedCount !== verifiedItems.length) {
      // Race condition: otro usuario compró el mismo producto en paralelo.
      // Con ordered:true los primeros bulkResult.modifiedCount operaciones tuvieron éxito → revertirlas.
      if (bulkResult.modifiedCount > 0) {
        await Product.bulkWrite(toRestoreOps(verifiedItems.slice(0, bulkResult.modifiedCount)))
      }
      return NextResponse.json(
        { error: "Stock insuficiente para uno o más productos. Actualizá tu carrito." },
        { status: 409 }
      )
    }

    // Crear orden — si falla, revertir TODO el stock ya decrementado
    try {
      const order = await Order.create({
        userId: session.user.id,
        items: verifiedItems,
        total,
        status: "pending",
      })
      // Incrementar usedCount del cupón si se aplicó uno válido
      if (validCouponId) {
        await Coupon.findByIdAndUpdate(validCouponId, { $inc: { usedCount: 1 } })
      }
      return NextResponse.json(order, { status: 201 })
    } catch {
      await Product.bulkWrite(toRestoreOps(verifiedItems))
      return NextResponse.json(
        { error: "Error al registrar la orden. El stock fue restaurado." },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json({ error: "Error al procesar la orden" }, { status: 500 })
  }
}
