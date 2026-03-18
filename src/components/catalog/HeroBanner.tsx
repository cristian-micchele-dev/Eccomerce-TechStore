"use client"

import { Cpu, Zap, Monitor, HardDrive, Keyboard, ArrowRight, Truck, ShieldCheck, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

const featured: { label: string; value: Category; icon: React.ElementType; color: string }[] = [
  { label: "Procesadores", value: "procesadores", icon: Cpu,        color: "text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40" },
  { label: "Tarjetas de Video", value: "gpus",    icon: Zap,        color: "text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/40" },
  { label: "Monitores",    value: "monitores",    icon: Monitor,     color: "text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40" },
  { label: "Almacenamiento", value: "almacenamiento", icon: HardDrive, color: "text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40" },
  { label: "Teclados",    value: "teclados",      icon: Keyboard,   color: "text-green-400 hover:bg-green-500/10 hover:border-green-500/40" },
]

const trust = [
  { icon: Truck,       text: "Envío gratis +$299" },
  { icon: ShieldCheck, text: "12 meses de garantía" },
  { icon: Star,        text: "+500 productos" },
]

function ChipIllustration() {
  return (
    <div className="animate-float shrink-0">
      <div className="relative w-32 h-32 rounded-xl border border-border bg-secondary/50">
        {/* Corner registration marks */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-primary/60" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-primary/60" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-primary/60" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-primary/60" />

        {/* Die / core */}
        <div className="absolute inset-7 rounded-lg bg-card border border-primary/30">
          <div className="absolute left-1/2 inset-y-0 w-px bg-primary/20" />
          <div className="absolute top-1/2 inset-x-0 h-px bg-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary/80 ring-4 ring-primary/20 animate-pulse" />
          </div>
        </div>

        {/* Activity dots */}
        <div className="absolute top-[28px] left-[28px] w-1.5 h-1.5 rounded-full bg-primary/60 animate-blink" style={{ animationDelay: "0ms" }} />
        <div className="absolute top-[28px] right-[28px] w-1.5 h-1.5 rounded-full bg-primary/40 animate-blink" style={{ animationDelay: "350ms" }} />
        <div className="absolute bottom-[28px] left-[28px] w-1.5 h-1.5 rounded-full bg-primary/40 animate-blink" style={{ animationDelay: "700ms" }} />
        <div className="absolute bottom-[28px] right-[28px] w-1.5 h-1.5 rounded-full bg-primary/60 animate-blink" style={{ animationDelay: "1050ms" }} />

        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-primary/30 animate-scan" />
        </div>

        <p className="absolute bottom-2 inset-x-0 text-center text-[7px] font-mono tracking-widest text-muted-foreground/40 uppercase">
          TS · X1
        </p>
      </div>
    </div>
  )
}

interface HeroBannerProps {
  onCategorySelect: (category: Category) => void
}

export function HeroBanner({ onCategorySelect }: HeroBannerProps) {
  const { data: session } = useSession()
  const rawName = session?.user?.name?.split(" ")[0] ?? ""
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  return (
    <div className="relative rounded-xl border border-border bg-transparent overflow-hidden">
      {/* Accent line top */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />
      {/* Glow radial right */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }} />
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative px-6 py-6 flex items-center gap-8">
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Badge promo */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold">
            <Zap className="w-3 h-3" />
            Nuevos ingresos · Semana tech
          </div>

          {/* Heading */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              TechStore — Computación &amp; Gaming
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              {firstName ? (
                <>Hola, <span className="text-primary">{firstName}.</span></>
              ) : (
                <>Tu próximo build<br className="hidden sm:block" /> empieza aquí.</>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              PCs armadas · Procesadores · GPUs · Memorias · Periféricos
            </p>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {featured.map(({ label, value, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => onCategorySelect(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/60 border border-border text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  color
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
            <button
              onClick={() => onCategorySelect("all")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todo
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Trust bar */}
          <div className="flex items-center gap-4 flex-wrap pt-1">
            {trust.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Chip illustration */}
        <div aria-hidden="true" className="hidden md:flex items-center justify-center py-2 pr-2">
          <ChipIllustration />
        </div>
      </div>
    </div>
  )
}
