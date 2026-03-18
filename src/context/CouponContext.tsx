"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface AppliedCoupon {
  code: string
  type: "percent" | "fixed"
  value: number
  discount: number
}

interface CouponContextType {
  appliedCoupon: AppliedCoupon | null
  setCoupon: (c: AppliedCoupon) => void
  clearCoupon: () => void
}

const CouponContext = createContext<CouponContextType>({
  appliedCoupon: null,
  setCoupon: () => {},
  clearCoupon: () => {},
})

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const storageKey = `techstore-coupon-${session?.user?.id ?? "guest"}`

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setAppliedCoupon(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [storageKey])

  function setCoupon(c: AppliedCoupon) {
    setAppliedCoupon(c)
    try { localStorage.setItem(storageKey, JSON.stringify(c)) } catch {}
  }

  function clearCoupon() {
    setAppliedCoupon(null)
    try { localStorage.removeItem(storageKey) } catch {}
  }

  if (!hydrated) return <>{children}</>

  return (
    <CouponContext.Provider value={{ appliedCoupon, setCoupon, clearCoupon }}>
      {children}
    </CouponContext.Provider>
  )
}

export function useCoupon() {
  return useContext(CouponContext)
}
