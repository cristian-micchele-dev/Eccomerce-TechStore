import { DollarSign, Package, ShoppingBag, Users, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongoose"
import Product from "@/lib/models/Product"
import Order from "@/lib/models/Order"
import User from "@/lib/models/User"

const categoryColors: Record<string, string> = {
  pcs: "bg-blue-500/10 text-blue-400/70",
  monitores: "bg-purple-500/10 text-purple-400/70",
  teclados: "bg-green-500/10 text-green-400/70",
  mouse: "bg-orange-500/10 text-orange-400/70",
  headsets: "bg-pink-500/10 text-pink-400/70",
  almacenamiento: "bg-yellow-500/10 text-yellow-400/70",
}

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") redirect("/")

  await connectDB()

  const [productCount, orderCount, customerCount, revenueResult, recentProducts] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "CUSTOMER" }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    Product.find().sort({ createdAt: -1 }).limit(8).lean(),
  ])

  const totalRevenue = revenueResult[0]?.total ?? 0

  const stats = [
    { label: "Ingresos totales", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400/70", bg: "bg-green-400/8" },
    { label: "Productos", value: productCount.toString(), icon: Package, color: "text-blue-400/70", bg: "bg-blue-400/8" },
    { label: "Órdenes", value: orderCount.toLocaleString(), icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
    { label: "Clientes", value: customerCount.toLocaleString(), icon: Users, color: "text-purple-400/70", bg: "bg-purple-400/8" },
  ]

  const products = recentProducts.map((p) => ({
    ...p,
    id: (p._id as { toString(): string }).toString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumen general del negocio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-primary" />
          Datos en tiempo real
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-green-400" />
                <span className="text-xs text-muted-foreground">acumulado total</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Productos recientes</h2>
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-sm text-primary hover:underline font-medium">
              Gestionar productos →
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Ver catálogo
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">Producto</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Categoría</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Precio</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Stock</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Rating</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Badge</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="36px" />
                      </div>
                      <span className="font-medium line-clamp-1 max-w-[180px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize ${categoryColors[product.category] ?? "bg-muted text-muted-foreground"}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">${product.price}</td>
                  <td className="px-4 py-3">
                    <span className={
                      product.stock > 20 ? "text-green-400" :
                      product.stock > 5 ? "text-amber-400" : "text-destructive"
                    }>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">⭐ {product.rating}</td>
                  <td className="px-4 py-3">
                    {product.badge ? (
                      <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                        {product.badge}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
