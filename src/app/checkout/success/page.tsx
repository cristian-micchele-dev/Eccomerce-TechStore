"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

function SuccessContent() {
  const params = useSearchParams()
  const status = params.get("status")
  const isPending = status === "pending"

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isPending ? "bg-amber-500/10" : "bg-green-500/10"}`}>
        {isPending
          ? <Clock className="w-8 h-8 text-amber-400" />
          : <CheckCircle className="w-8 h-8 text-green-400" />}
      </div>
      <div>
        <h1 className="text-2xl font-bold">
          {isPending ? "Pago en proceso" : "¡Pago aprobado!"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {isPending
            ? "Tu pago está siendo procesado. Te notificaremos cuando se confirme."
            : "Tu pedido fue confirmado y está siendo preparado para el envío."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/orders">Ver mis pedidos</Link>
        </Button>
        <Button asChild>
          <Link href="/">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
