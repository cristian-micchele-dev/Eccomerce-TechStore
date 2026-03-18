"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, ShoppingCart, Bell, X, Clock, CheckCircle, Truck, Package, Menu, Cpu, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarContent } from "./SidebarContent"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { useSession, signOut } from "next-auth/react"

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered"

interface OrderNotif {
  _id: string
  status: OrderStatus
  total: number
  createdAt: string
}

const statusNotif: Record<OrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendiente de confirmación", icon: Clock, color: "text-muted-foreground" },
  confirmed: { label: "Pedido confirmado", icon: CheckCircle, color: "text-blue-400" },
  shipped: { label: "En camino", icon: Truck, color: "text-yellow-400" },
  delivered: { label: "Entregado", icon: Package, color: "text-green-400" },
}

const BREADCRUMBS: Record<string, { label: string; parent?: string }> = {
  "/": { label: "Catálogo" },
  "/cart": { label: "Mi Carrito" },
  "/orders": { label: "Mis Compras" },
  "/wishlist": { label: "Favoritos" },
  "/profile": { label: "Perfil" },
  "/settings": { label: "Configuración" },
  "/checkout": { label: "Checkout" },
  "/admin": { label: "Dashboard", parent: "Admin" },
  "/admin/products": { label: "Productos", parent: "Admin" },
  "/admin/orders": { label: "Órdenes", parent: "Admin" },
  "/admin/users": { label: "Usuarios", parent: "Admin" },
  "/admin/coupons": { label: "Cupones", parent: "Admin" },
}

export function Header() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState("")

  const breadcrumb = (() => {
    // Exact match
    if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname]
    // /products/[id]
    if (pathname.startsWith("/products/")) return { label: "Producto", parent: "Catálogo" }
    // /admin/* fallback
    if (pathname.startsWith("/admin/")) return { label: pathname.split("/").pop() ?? "Admin", parent: "Admin" }
    return null
  })()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`)
    }
    if (e.key === "Escape") {
      setSearch("")
      router.push("/")
    }
  }

  function clearSearch() {
    setSearch("")
    router.push("/")
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [orders, setOrders] = useState<OrderNotif[]>([])
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()).catch(() => null),
      fetch("/api/orders").then((r) => r.json()).catch(() => null),
    ]).then(([profile, orders]) => {
      if (profile?.image) setAvatarUrl(profile.image)
      if (Array.isArray(orders)) setOrders(orders.slice(0, 5))
    })
  }, [session?.user?.email])

  const unread = Math.max(0, orders.length - seenCount)

  function handleOpenNotifs() {
    setNotifsOpen((v) => !v)
    if (!notifsOpen) setSeenCount(orders.length)
  }

  const name = session?.user?.name ?? "Usuario"
  const image = avatarUrl || session?.user?.image || ""
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-4 lg:px-6 border-b border-border bg-background">
      {/* Hamburguesa — solo mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground shrink-0"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-background border-r border-border">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Logo — solo mobile (desktop lo muestra el sidebar) */}
      <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Cpu className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-extrabold text-sm tracking-tight">
          Tech<span className="text-primary">Store</span>
        </span>
      </Link>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          className="pl-9 pr-8 bg-secondary border-border text-sm h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Breadcrumb — solo desktop */}
      {breadcrumb && (
        <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          {breadcrumb.parent && (
            <>
              <span>{breadcrumb.parent}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
          <span className="text-foreground font-medium">{breadcrumb.label}</span>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications — solo usuarios logueados */}
        {session?.user && (
          <DropdownMenu open={notifsOpen} onOpenChange={setNotifsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                onClick={handleOpenNotifs}
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {orders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin notificaciones</p>
              ) : (
                orders.map((order) => {
                  const { label, icon: Icon, color } = statusNotif[order.status]
                  const shortId = `#${order._id.slice(-6).toUpperCase()}`
                  const date = new Date(order.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                  return (
                    <DropdownMenuItem key={order._id} asChild>
                      <Link href="/orders" className="flex items-start gap-3 px-3 py-2.5 cursor-pointer">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold">Orden {shortId}</p>
                          <p className={`text-xs ${color}`}>{label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{date} · ${order.total.toLocaleString()}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )
                })
              )}
              {orders.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="text-xs text-center text-primary justify-center">
                      Ver todos mis pedidos
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Cart */}
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* User: dropdown si logueado, botón login si invitado */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
                  {name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders">Mis Pedidos</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Configuración</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-9 px-4 text-sm font-medium">
              Iniciar sesión
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
