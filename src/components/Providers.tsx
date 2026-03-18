"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import { CouponProvider } from "@/context/CouponContext"
import { Toaster } from "sonner"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          <CouponProvider>{children}</CouponProvider>
        </WishlistProvider>
      </CartProvider>
      <Toaster position="bottom-right" theme="dark" richColors />
    </SessionProvider>
  )
}
