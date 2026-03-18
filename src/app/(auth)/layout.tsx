import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TechStore — Iniciar sesión",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
