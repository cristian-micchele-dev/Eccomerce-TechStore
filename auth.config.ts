import type { NextAuthConfig } from "next-auth"

// Config Edge-safe: sin imports de Node.js (sin Mongoose, sin bcrypt)
// Usada SOLO en middleware para verificar JWT
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Rutas que SÍ requieren login
      const PROTECTED = ["/orders", "/profile", "/settings", "/admin"]
      const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

      if (!isProtected) return true          // Todo lo demás: acceso libre
      if (!isLoggedIn) return false          // Protegida + no logueado → /login
      if (pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/", nextUrl))
      }
      return true
    },
    async session({ session, token }) {
      if (token.role) session.user.role = token.role as string
      return session
    },
  },
}
