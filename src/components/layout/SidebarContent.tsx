"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  ShoppingBag,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Cpu,
  Package,
  Receipt,
  Bookmark,
  ClipboardList,
  Users,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { signOut, useSession } from "next-auth/react"

// Rutas visibles para cualquiera (incluso visitantes)
const publicNavItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/cart", label: "Mi Carrito", icon: ShoppingBag },
  { href: "/wishlist", label: "Favoritos", icon: Bookmark },
]

// Rutas adicionales solo para usuarios autenticados
const authNavItems = [
  { href: "/orders", label: "Mis Compras", icon: Receipt },
  { href: "/profile", label: "Perfil", icon: User },
  { href: "/settings", label: "Configuración", icon: Settings },
]

const adminItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Órdenes", icon: ClipboardList },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/coupons", label: "Cupones", icon: Tag },
]

interface SidebarContentProps {
  onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5 hover:opacity-80 transition-opacity">
        <div className="relative w-9 h-9 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Cpu className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-[15px] tracking-tight text-foreground">
            Tech<span className="text-primary">Store</span>
          </span>
          <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase font-medium mt-0.5">
            Electronics
          </span>
        </div>
      </Link>

      <Separator className="opacity-20" />

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
        {/* Rutas públicas — siempre visibles */}
        {publicNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Rutas autenticadas — solo si hay sesión */}
        {session?.user && authNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Sección Admin */}
        {isAdmin && (
          <div className="pt-3 mt-1 border-t border-border/40">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Admin
            </p>
            {adminItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Footer: logout si logueado, login si visitante */}
      <div className="px-3 pb-5">
        <Separator className="opacity-20 mb-4" />
        {session?.user ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar Sesión
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors w-full"
          >
            <User className="w-4 h-4 shrink-0" />
            Iniciar sesión
          </Link>
        )}
      </div>
    </div>
  )
}
