"use client"

import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <XCircle className="w-8 h-8 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Pago rechazado</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          No se pudo procesar el pago. Podés intentar con otro medio de pago o volver al carrito.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/cart">Volver al carrito</Link>
        </Button>
        <Button asChild>
          <Link href="/">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  )
}
