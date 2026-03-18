"use client"

import { useEffect, useState } from "react"
import { Users, Pencil, Trash2, Shield, ShoppingBag, Mail, Globe, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSession } from "next-auth/react"

interface AdminUser {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "CUSTOMER"
  image: string | null
  provider: string | null
  hasPassword: boolean
  orderCount: number
  createdAt: string
}

function UserAvatar({ user }: { user: AdminUser }) {
  const initial = (user.name ?? user.email)[0].toUpperCase()
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
        user.role === "ADMIN"
          ? "bg-primary/20 text-primary"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {initial}
    </div>
  )
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")

  // Edit
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState<"ADMIN" | "CUSTOMER">("CUSTOMER")
  const [editPassword, setEditPassword] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  // Delete
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data)
        else throw new Error("Respuesta inesperada")
      })
      .catch(() => setFetchError("No se pudieron cargar los usuarios. Intentá recargar la página."))
      .finally(() => setLoading(false))
  }, [])

  function openEdit(user: AdminUser) {
    setEditUser(user)
    setEditName(user.name ?? "")
    setEditRole(user.role)
    setEditPassword("")
    setEditError("")
  }

  async function handleEdit() {
    if (!editUser) return
    setEditLoading(true)
    setEditError("")
    try {
      const body: Record<string, string> = { name: editName, role: editRole }
      if (editPassword) body.password = editPassword
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al actualizar")
      }
      const updated = await res.json()
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? { ...u, name: updated.name, role: updated.role, hasPassword: updated.hasPassword }
            : u
        )
      )
      setEditUser(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al actualizar")
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteUser) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: "DELETE" })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id))
        setDeleteUser(null)
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const adminCount = users.filter((u) => u.role === "ADMIN").length
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {users.length} usuarios · {adminCount} admin{adminCount !== 1 ? "s" : ""} · {customerCount} cliente{customerCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: users.length, icon: Users, color: "text-muted-foreground", bg: "bg-secondary" },
          { label: "Admins", value: adminCount, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
          { label: "Clientes", value: customerCount, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Cargando usuarios...</div>
        ) : fetchError ? (
          <div className="p-8 text-center text-sm text-destructive">{fetchError}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No hay usuarios registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Usuario</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Rol</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Acceso</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Compras</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Registrado</th>
                  <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = session?.user?.id === user.id
                  const date = new Date(user.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar user={user} />
                          <div>
                            <p className="font-medium text-sm leading-tight">
                              {user.name ?? (
                                <span className="text-muted-foreground italic">Sin nombre</span>
                              )}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] text-muted-foreground">(vos)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-4 py-3">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                            Cliente
                          </span>
                        )}
                      </td>

                      {/* Acceso */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {user.provider === "google" ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Globe className="w-3 h-3" />
                              Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                              <Mail className="w-3 h-3" />
                              Email
                            </span>
                          )}
                          {user.hasPassword && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                              <Key className="w-2.5 h-2.5" />
                              Pass
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Compras */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{user.orderCount}</span>
                        </div>
                      </td>

                      {/* Registrado */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">{date}</td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(user)}
                            aria-label="Editar usuario"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteUser(user)}
                            disabled={isSelf}
                            aria-label="Eliminar usuario"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre del usuario"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as "ADMIN" | "CUSTOMER")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Cliente</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-pass">
                Nueva contraseña{" "}
                <span className="text-xs text-muted-foreground font-normal">(opcional — mín. 6 caracteres)</span>
              </Label>
              <Input
                id="edit-pass"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Dejar vacío para no cambiar"
              />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={editLoading}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      {deleteUser && (
        <AlertDialog open={!!deleteUser} onOpenChange={(v) => !v && setDeleteUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás por eliminar a{" "}
                <span className="font-semibold text-foreground">
                  {deleteUser.name ?? deleteUser.email}
                </span>
                . Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
