import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongoose"
import User from "@/lib/models/User"
import { authConfig } from "../auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()
        const user = await User.findOne({ email: credentials.email as string })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session: updatedSession }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // Solo guardar si es URL real (no base64) para no inflar la cookie
        if (user.image && !user.image.startsWith("data:")) token.picture = user.image
      }
      if (trigger === "update") {
        // Nunca guardar base64 en el JWT — explota el tamaño de la cookie (HTTP 431)
        if (updatedSession?.image !== undefined && !updatedSession.image?.startsWith("data:")) {
          token.picture = updatedSession.image
        }
        if (updatedSession?.name !== undefined) token.name = updatedSession.name
      }
      if (token.id && !token.role) {
        await connectDB()
        const dbUser = await User.findById(token.id).select("role")
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.picture) session.user.image = token.picture as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },
  },
})
