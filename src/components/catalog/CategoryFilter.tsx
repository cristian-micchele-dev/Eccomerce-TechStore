"use client"

import { Category } from "@/lib/types"
import { categories } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Monitor,
  Tv2,
  Keyboard,
  MousePointer,
  Headphones,
  HardDrive,
  Cpu,
  Database,
  Zap,
} from "lucide-react"

const categoryIcons: Record<string, React.ElementType> = {
  all: LayoutGrid,
  pcs: Monitor,
  monitores: Tv2,
  teclados: Keyboard,
  mouse: MousePointer,
  headsets: Headphones,
  almacenamiento: HardDrive,
  procesadores: Cpu,
  memorias: Database,
  gpus: Zap,
}

interface CategoryFilterProps {
  selected: Category
  onChange: (category: Category) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div role="tablist" aria-label="Categorías" className="flex items-center border-b border-border overflow-x-auto scrollbar-hide">
      {categories.map(({ value, label }) => {
        const Icon = categoryIcons[value] ?? LayoutGrid
        const isActive = selected === value
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
