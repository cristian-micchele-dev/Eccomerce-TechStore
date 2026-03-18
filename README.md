# TechStore — E-commerce de Hardware

E-commerce full-stack para venta de componentes y periféricos de computación. Gestiona catálogo, carrito persistente por usuario, wishlist, checkout con MercadoPago, panel de administración completo y autenticación con Google o credenciales.

## Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![NextAuth](https://img.shields.io/badge/NextAuth-5_beta-purple)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| MongoDB | Atlas (gratis) o local |
| Cuenta Google Cloud | Para OAuth (opcional) |
| Cuenta MercadoPago | Para pagos (opcional en dev) |

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd techstore

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores (ver tabla abajo)

# 4. (Opcional) Poblar la base de datos con datos de prueba
npm run db:seed

# 5. Iniciar el servidor de desarrollo
npm run dev
```

El sitio estará disponible en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Crear `.env.local` en la raíz del proyecto:

```env
# Base de datos
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/techstore

# NextAuth — autenticación
AUTH_SECRET=           # Generar con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000   # En producción: https://tudominio.com

# Google OAuth (opcional — necesario si querés login con Google)
GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<tu-secret>

# MercadoPago (opcional en dev — necesario para checkout real)
MP_ACCESS_TOKEN=APP_USR-<tu-access-token>
```

| Variable | Descripción | Ejemplo | Obligatoria |
|----------|-------------|---------|-------------|
| `MONGODB_URI` | Connection string de MongoDB | `mongodb+srv://user:pass@cluster/db` | ✅ |
| `AUTH_SECRET` | Clave para firmar tokens JWT | salida de `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | URL base del sitio | `https://tudominio.com` | ✅ en producción |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `123...apps.googleusercontent.com` | Solo si usás Google |
| `GOOGLE_CLIENT_SECRET` | Secret de Google OAuth | `GOCSPX-...` | Solo si usás Google |
| `MP_ACCESS_TOKEN` | Access token de MercadoPago | `APP_USR-...` | Solo si usás pagos |

## Uso rápido

1. Entrar a `/` — el catálogo es **público**, no se requiere login para navegar ni agregar al carrito.
2. Carrito (`/cart`) y wishlist (`/wishlist`) funcionan sin cuenta.
3. Ir a `/login` para autenticarse con Google o email/contraseña.
4. Con cuenta: ver historial en `/orders`, editar datos en `/profile`.
5. Con cuenta `ADMIN`: panel completo en `/admin` (productos, órdenes, usuarios, cupones).

## Estructura del proyecto

```
techstore/
├── src/
│   ├── app/                        # App Router de Next.js
│   │   ├── (auth)/                 # Rutas sin layout (login, register)
│   │   ├── admin/                  # Panel administrador (protegido, rol ADMIN)
│   │   │   ├── products/           # CRUD de productos
│   │   │   ├── orders/             # Gestión de órdenes
│   │   │   ├── users/              # Gestión de usuarios
│   │   │   └── coupons/            # Gestión de cupones
│   │   ├── api/                    # API Routes (30 endpoints)
│   │   │   ├── auth/               # NextAuth handlers + registro
│   │   │   ├── products/           # CRUD de productos + reviews
│   │   │   ├── orders/             # Órdenes del usuario autenticado
│   │   │   ├── admin/              # Endpoints exclusivos de administración
│   │   │   ├── user/               # Perfil, avatar, contraseña
│   │   │   ├── payments/           # Integración MercadoPago
│   │   │   ├── coupons/            # Validación de cupones
│   │   │   ├── wishlist/           # Toggle de favoritos
│   │   │   └── stats/              # Métricas para el dashboard
│   │   ├── products/[id]/          # Detalle de producto
│   │   ├── cart/                   # Carrito de compras
│   │   ├── checkout/               # Flujo post-pago (success / failure)
│   │   ├── orders/                 # Historial de compras
│   │   ├── wishlist/               # Lista de favoritos
│   │   ├── profile/                # Perfil de usuario
│   │   ├── settings/               # Configuración de cuenta
│   │   ├── layout.tsx              # Layout raíz (Providers + Sidebar + Header)
│   │   └── page.tsx                # Home — catálogo con filtros y búsqueda
│   │
│   ├── components/
│   │   ├── ui/                     # Componentes shadcn/ui (Button, Card, Dialog, etc.)
│   │   ├── layout/                 # Header, Sidebar, SidebarContent
│   │   ├── catalog/                # ProductCard, ProductGrid, CategoryFilter
│   │   ├── product/                # ProductDetail, ProductReviews, RelatedProducts
│   │   └── admin/                  # ProductFormDialog, DeleteProductDialog
│   │
│   ├── context/
│   │   ├── CartContext.tsx          # Estado global del carrito (useReducer + localStorage)
│   │   └── WishlistContext.tsx      # Estado global de favoritos
│   │
│   ├── lib/
│   │   ├── models/                 # Esquemas Mongoose
│   │   │   ├── User.ts             # Usuario (email, password hash, role, provider)
│   │   │   ├── Product.ts          # Producto (specs, stock, rating, badge)
│   │   │   ├── Order.ts            # Orden (items, total, status, paymentId)
│   │   │   ├── Coupon.ts           # Cupón (type: percent|fixed, minOrder, maxUses)
│   │   │   ├── Review.ts           # Reseña (rating 1-5, comment, userId único por producto)
│   │   │   └── Wishlist.ts         # Wishlist (userId → productIds[])
│   │   ├── mongoose.ts             # Conexión MongoDB con singleton cache (serverless-safe)
│   │   ├── cartReducer.ts          # Reducer puro del carrito (sin side effects)
│   │   ├── types.ts                # Tipos TypeScript compartidos (Product, CartItem, etc.)
│   │   ├── utils.ts                # cn() — helper para clases Tailwind
│   │   └── mock-data.ts            # 12 productos de demostración + helpers de búsqueda
│   │
│   ├── types/
│   │   └── next-auth.d.ts          # Extensión de tipos de sesión NextAuth (id, role)
│   │
│   └── __tests__/                  # Tests unitarios y de componentes
│       ├── cartReducer.test.ts     # 20 tests del reducer (puro, sin mocks)
│       ├── ProductCard.test.tsx    # 20 tests del componente ProductCard
│       └── couponValidation.test.ts # 14 tests de integración — API de cupones
│
├── auth.config.ts                  # Config Edge-safe: autorización de rutas para middleware
├── auth.ts                         # Config completa NextAuth (Google + Credentials + JWT)
├── middleware.ts                   # Middleware Next.js — usa auth() para proteger rutas
├── jest.config.ts                  # Configuración Jest + next/jest
├── jest.setup.ts                   # Import de @testing-library/jest-dom
└── scripts/
    └── seed-mongo.mjs              # Pobla MongoDB con productos y usuario admin inicial
```

## Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Next.js con hot reload en puerto 3000 |
| Build | `npm run build` | Compila para producción |
| Producción | `npm run start` | Sirve el build de producción |
| Seed DB | `npm run db:seed` | Puebla MongoDB con datos iniciales |
| Tests | `npm test` | Ejecuta todos los tests con Jest |
| Tests watch | `npm run test:watch` | Jest en modo watch |
| Coverage | `npm run test:coverage` | Tests + reporte de cobertura HTML |

## Tests

```bash
npm test                  # Todos los tests (54 en total)
npm run test:watch        # Modo watch — re-ejecuta al guardar
npm run test:coverage     # Genera reporte en /coverage/
```

Cobertura: reducer puro (cartReducer), componente ProductCard, y contrato HTTP de la API de cupones.

## Rutas protegidas

El sitio es **público por defecto**. Solo requieren login:

| Ruta | Rol |
|------|-----|
| `/orders` | Autenticado |
| `/profile` | Autenticado |
| `/settings` | Autenticado |
| `/admin/*` | `ADMIN` |

Sin autenticación → redirige a `/login`. Sin rol `ADMIN` en `/admin` → redirige a `/`.

## Deploy en Vercel

1. Importar el repo en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables**, cargar todas las variables del `.env.local`
3. El deploy se ejecuta automáticamente en cada push a `main`

Para Google OAuth en producción, registrar en Google Cloud Console:
- Authorized origin: `https://tudominio.com`
- Callback URL: `https://tudominio.com/api/auth/callback/google`

> `.env.local` está excluido por `.gitignore`. Nunca commitear secretos.

## Contribuir

```bash
git checkout -b feat/nombre-feature
# ... cambios ...
npx tsc --noEmit    # verificar tipos
npm test            # correr tests
git commit -m "feat: descripción del cambio"
git push origin feat/nombre-feature
# abrir Pull Request hacia main
```

Convención de commits: `feat:` `fix:` `refactor:` `docs:` `test:` `chore:`

## Licencia

MIT
