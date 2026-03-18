# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npx tsc --noEmit # Type-check without emitting files
```

No test runner is configured yet.

## Stack

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`. All theme is defined in `src/app/globals.css` via `@theme inline` and CSS custom properties. Use `bg-background`, `text-foreground`, etc. (not arbitrary values like `bg-[#fff]`).
- **shadcn/ui** — components live in `src/components/ui/`. Add new ones with `npx shadcn@latest add <component>`.
- **Prisma + PostgreSQL** — installed but not yet configured. No `schema.prisma` exists yet.
- **lucide-react** for icons.

## Architecture

### Data flow (current — UI only, no backend)
All data comes from `src/lib/mock-data.ts` which exports `products[]`, `categories[]`, `getProductById()`, and `getProductsByCategory()`. Types are in `src/lib/types.ts` (`Product`, `Category`, `CartItem`).

### Cart state
`src/context/CartContext.tsx` manages global cart state with `useReducer`. It persists to `localStorage` under the key `techstore-cart` and hydrates on mount. Wrap any component that needs cart access with `useCart()`. The provider is mounted in `src/components/Providers.tsx` which is imported by the root layout.

### Layout
`src/app/layout.tsx` renders `<Providers>` → `<Sidebar>` + `<Header>` + `<main>{children}</main>`. The HTML element has `className="dark"` — the app is always dark mode. Theme colors (deep black background, red primary accent) are overridden in the `.dark` block in `globals.css`.

### Pages
| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Client component — holds `selectedCategory` state |
| `/products/[id]` | `src/app/products/[id]/page.tsx` | Server component, calls `getProductById()` |
| `/cart` | `src/app/cart/page.tsx` | Client component, reads from `useCart()` |
| `/admin` | `src/app/admin/page.tsx` | Server component, uses mock data directly |

### Adding a new page
Create `src/app/<route>/page.tsx`. If it needs cart or other client state, add `"use client"` at the top. The sidebar and header are provided automatically by the root layout.

### Tailwind v4 notes
- Variables: use `bg-(--variable-name)` syntax instead of `bg-[var(--variable-name)]`
- All design tokens are CSS variables defined in `globals.css`
- The red accent color maps to `bg-primary` / `text-primary`

### rules
rules

Idioma y formato de respuesta (obligatorio): Respondé en español, con tono corporativo, y entregá respuestas cortas. Siempre incluí: (1) qué cambiaste y (2) para qué, en 2–5 bullets máximo.

Alcance / guardrails: No inventes endpoints, DB, ni auth. El repo está en modo UI-only: la data sale de src/lib/mock-data.ts. Si te piden backend, proponé un plan incremental (mock → API route → Prisma) sin implementar de golpe.

Stack y convenciones (no negociables):

Next.js App Router + TypeScript: preferí Server Components por defecto; usá "use client" solo cuando haya estado, efectos o contexto (ej. carrito).

Tailwind v4 (CSS-first): no uses tailwind.config.js. Usá tokens (bg-background, text-foreground, bg-primary, text-primary) y variables definidas en globals.css. Evitá valores arbitrarios tipo bg-[#fff].

Variables v4: cuando corresponda, usá bg-(--variable-name) (no bg-[var(--...)]).

shadcn/ui: componentes en src/components/ui/. Si falta uno, indicar el comando npx shadcn@latest add <component> (no “recrear” el componente a mano).

Iconos: lucide-react únicamente.

Arquitectura / flujo de datos:

Consumí products[], categories[], getProductById(), getProductsByCategory() desde src/lib/mock-data.ts.

Respetá tipos en src/lib/types.ts (Product, Category, CartItem). No dupliques interfaces.

Carrito (estado global):

Toda interacción con carrito pasa por useCart() y CartContext (src/context/CartContext.tsx).

No accedas directo a localStorage desde componentes de UI; el contexto ya persiste en techstore-cart.

Asegurá que cualquier componente que use carrito esté bajo src/components/Providers.tsx (ya montado en layout.tsx).

Layout y tema:

El sitio está siempre en dark mode (<html className="dark">). No agregues toggles de tema salvo requerimiento explícito.

Mantené consistencia con el esquema (negro profundo + acento rojo) definido en .dark de globals.css.

Rutas / páginas:

Nuevas páginas en src/app/<route>/page.tsx. No uses pages/.

/products/[id] es server component: si necesitás client behavior, aislalo en un componente hijo "use client".

Calidad / delivery:

Antes de cerrar, validá: npx tsc --noEmit y npm run build (cuando aplique).

Cambios chicos, PR-friendly: evitá refactors masivos fuera del scope.

Accesibilidad básica: button para acciones, aria-label cuando haya íconos sin texto, estados disabled coherentes.

Prisma/PostgreSQL (estado actual):

Están instalados pero no configurados y no hay schema.prisma. No asumas modelos ni migraciones. Si se solicita, proponé la creación del schema y la estrategia de migración como paso separado.

Estilo de implementación:

Preferí composición con componentes existentes (Sidebar/Header/Card/Button).

Evitá lógica duplicada: helpers en src/lib/ y tipos centralizados.

Qué modifiqué y para qué (en este archivo):

Agregué reglas operativas para estandarizar cómo contribuir (stack, data flow, carrito, Tailwind v4).

Forcé lineamientos de respuesta (español + corto + “qué/para qué”) para mejorar trazabilidad y velocidad de revisión.