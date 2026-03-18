"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, Lock, ChevronRight, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? "—"
  const email = session?.user?.email ?? "—"

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setSuccess("")
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden")
      return
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al cambiar la contraseña")
      } else {
        setSuccess(data.message)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Configuración</h1>

      {/* Cuenta */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
          Cuenta
        </p>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          <div className="flex items-center gap-3 px-5 py-4">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{email}</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors rounded-b-xl"
          >
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium flex-1">Ver mi perfil</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Seguridad */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
          Seguridad
        </p>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm font-semibold">Cambiar contraseña</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contraseña actual</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-secondary border-border h-9 text-sm"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-secondary border-border h-9 text-sm"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirmar nueva contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary border-border h-9 text-sm"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                {success}
              </div>
            )}

            <Button type="submit" size="sm" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Actualizar contraseña
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
