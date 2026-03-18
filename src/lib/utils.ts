import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases Tailwind resolviendo conflictos con twMerge.
 * Útil para aplicar clases condicionales sin duplicados ni colisiones.
 *
 * @param inputs - Valores de clase: strings, arrays, objetos condicionales (clsx syntax)
 * @returns String con clases deduplicadas y mergeadas correctamente
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", "px-2")
 * // → "py-2 bg-primary px-2"  (px-4 es sobreescrito por px-2)
 *
 * cn("text-sm font-medium", className)
 * // → aplica className sobre la base, resolviendo conflictos de utilidades Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
