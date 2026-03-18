"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { User, Mail, ShieldCheck, Phone, Pencil, Check, X, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const size = 200
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")!
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ProfilePage() {
  const { data: session, update } = useSession()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [draftName, setDraftName] = useState("")
  const [draftPhone, setDraftPhone] = useState("")

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const email = session?.user?.email ?? "—"
  const role = session?.user?.role ?? "CUSTOMER"
  const initials = (session?.user?.name ?? email)
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setName(data.name)
        if (data.phone) setPhone(data.phone)
        if (data.image) setAvatarSrc(data.image)
      })
      .catch(() => {})
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    setAvatarError("")
    try {
      const dataUrl = await resizeImage(file)
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al subir la imagen")
      }
      setAvatarSrc(dataUrl)
      // Solo actualizamos el nombre en la sesión, NO la imagen (evita cookie grande)
      await update({ name: session?.user?.name })
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function startEdit() {
    setDraftName(name)
    setDraftPhone(phone)
    setError("")
    setSuccess(false)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setError("")
  }

  async function handleSave() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, phone: draftPhone }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setName(draftName)
      setPhone(draftPhone)
      setEditing(false)
      setSuccess(true)
      await update({ name: draftName })
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("No se pudo guardar. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const displayName = name || session?.user?.name || "—"

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Mi perfil</h1>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            aria-label="Cambiar foto de perfil"
            className="w-16 h-16 rounded-full overflow-hidden bg-primary flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary-foreground">{initials}</span>
            )}
            <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-lg font-semibold">{displayName}</p>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mt-1">
            <ShieldCheck className="w-3 h-3" />
            {role === "ADMIN" ? "Administrador" : "Cliente"}
          </span>
          {avatarError && <p className="text-xs text-destructive mt-1">{avatarError}</p>}
          <p className="text-xs text-muted-foreground mt-1">Hacé clic en la foto para cambiarla</p>
        </div>
      </div>

      {/* Info / Edit */}
      {!editing ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-3 px-5 py-4">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm font-medium">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">
                  {phone || <span className="text-muted-foreground italic">No configurado</span>}
                </p>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            {success && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cambios guardados
              </p>
            )}
            {!success && <span />}
            <Button size="sm" variant="outline" onClick={startEdit} className="gap-1.5 h-8 text-xs">
              <Pencil className="w-3.5 h-3.5" />
              Editar perfil
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="text-sm font-medium">Editar perfil</p>
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={email} disabled className="opacity-50 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Teléfono</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={loading} size="sm" className="gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="outline" onClick={cancelEdit} disabled={loading} size="sm" className="gap-1.5">
              <X className="w-3.5 h-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
