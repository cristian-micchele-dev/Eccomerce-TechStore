"use client"

import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const MAX_PRICE = 5000

interface CatalogFiltersProps {
  priceRange: [number, number]
  minRating: number
  onPriceChange: (range: [number, number]) => void
  onRatingChange: (rating: number) => void
  onClear: () => void
}

export function CatalogFilters({ priceRange, minRating, onPriceChange, onRatingChange, onClear }: CatalogFiltersProps) {
  const activeCount = (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0) + (minRating > 0 ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2.5 bg-secondary/30 rounded-xl border border-border">
      {/* Precio */}
      <div className="flex items-center gap-3 min-w-[180px] flex-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">Precio</span>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={50}
          value={priceRange}
          onValueChange={(v) => onPriceChange(v as [number, number])}
          className="flex-1"
        />
        <span className="text-xs tabular-nums text-foreground whitespace-nowrap shrink-0">
          ${priceRange[0].toLocaleString()} – ${priceRange[1] === MAX_PRICE ? `${priceRange[1].toLocaleString()}+` : priceRange[1].toLocaleString()}
        </span>
      </div>

      {/* Rating mínimo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">Rating</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => onRatingChange(minRating === r ? 0 : r)}
              aria-label={`Rating mínimo ${r}`}
              className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] transition-colors",
                minRating === r
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-muted-foreground hover:text-amber-400"
              )}
            >
              <Star className="w-3 h-3 fill-current" />
              {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Limpiar */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="w-3 h-3" />
          Limpiar
          <Badge className="h-4 px-1 text-[10px] bg-primary text-primary-foreground">{activeCount}</Badge>
        </Button>
      )}
    </div>
  )
}
