"use client"

import { useEffect, useState, useMemo } from "react"
import { Star, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Review {
  _id: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0 || !comment.trim()) {
      setError("Seleccioná una puntuación y escribí un comentario")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al enviar la reseña")
        return
      }
      setReviews((prev) => [data, ...prev])
      setSuccess(true)
      setShowForm(false)
      setRating(0)
      setComment("")
    } catch {
      setError("Error de conexión")
    } finally {
      setSubmitting(false)
    }
  }

  const avg = useMemo(
    () => reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0,
    [reviews]
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Reseñas</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-3.5 h-3.5", i < Math.floor(avg) ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avg} · {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
        {session?.user && !success && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            Escribir reseña
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">Tu reseña</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHovered(i + 1)}
                onMouseLeave={() => setHovered(0)}
                className="focus-visible:outline-none"
              >
                <Star
                  className={cn(
                    "w-6 h-6 transition-colors",
                    i < (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Contá tu experiencia con este producto..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="resize-none text-sm h-24 bg-secondary border-border"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{comment.length}/500</span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Publicar"}
              </Button>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Todavía no hay reseñas. {session?.user ? "¡Sé el primero!" : "Iniciá sesión para dejar una."}
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {r.userName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{r.userName}</span>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
              <p className="text-[10px] text-muted-foreground/50">
                {new Date(r.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
