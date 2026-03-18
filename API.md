# API Reference — TechStore

Base URL: `http://localhost:3000` (dev) | `https://tudominio.com` (prod)

Todos los endpoints retornan JSON. Los que requieren autenticación leen la sesión de la cookie HTTP-only gestionada por NextAuth. Las rutas de admin requieren además `role === "ADMIN"`.

---

## Tabla de contenidos

1. [Auth](#1-auth)
2. [Products](#2-products)
3. [Reviews](#3-reviews)
4. [Orders](#4-orders)
5. [Payments](#5-payments)
6. [Wishlist](#6-wishlist)
7. [User](#7-user)
8. [Admin — Orders](#8-admin--orders)
9. [Admin — Users](#9-admin--users)
10. [Admin — Coupons](#10-admin--coupons)
11. [Coupons](#11-coupons)
12. [Stats](#12-stats)

---

## 1. Auth

### POST `/api/auth/register`

Crea una cuenta nueva con email y contraseña. La contraseña se hashea con bcryptjs (10 rounds).

**Auth requerida:** No

**Body**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "mipassword123"
}
```

| Campo | Tipo | Validación |
|-------|------|-----------|
| `name` | string | Requerido |
| `email` | string | Requerido, único |
| `password` | string | Requerido, mín 6 caracteres |

**Respuesta (201)**
```json
{ "success": true }
```

**Errores**

| Código | Causa |
|--------|-------|
| 400 | Campo faltante o password < 6 caracteres |
| 409 | Email ya registrado |
| 500 | Error de base de datos |

---

### GET/POST `/api/auth/[...nextauth]`

Handler de NextAuth. Gestiona login (credentials + Google), logout y callbacks JWT.

**Auth requerida:** No (login) / Sí (logout)

Para login con credenciales, usar `signIn("credentials", { email, password })` del SDK de NextAuth. No llamar directamente.

---

## 2. Products

### GET `/api/products`

Lista productos con filtros opcionales y paginación.

**Auth requerida:** No

**Query params**

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `q` | string | — | Búsqueda por nombre (case-insensitive, regex) |
| `category` | string | — | Filtrar por categoría (`pcs`, `monitores`, `teclados`, `mouse`, `headsets`, `almacenamiento`, `procesadores`, `memorias`, `gpus`) |
| `page` | int | 1 | Página actual |
| `limit` | int | 12 | Items por página (máx 48) |

**Respuesta (200)**
```json
{
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "PC Gamer Ultra RTX 4080",
      "description": "Torre gaming de alto rendimiento...",
      "price": 2499,
      "originalPrice": 2799,
      "image": "https://...",
      "images": ["https://..."],
      "category": "pcs",
      "specs": [{ "label": "CPU", "value": "Intel Core i9-14900K" }],
      "stock": 8,
      "rating": 4.9,
      "reviews": 124,
      "badge": "Oferta"
    }
  ],
  "total": 48,
  "page": 1,
  "pages": 4
}
```

**Errores**

| Código | Causa |
|--------|-------|
| 500 | Error de conexión a MongoDB |

---

### POST `/api/products`

Crea un producto nuevo.

**Auth requerida:** Sí — rol `ADMIN`

**Body**
```json
{
  "name": "RTX 4090",
  "description": "GPU flagship de NVIDIA.",
  "price": 1599,
  "originalPrice": 1799,
  "image": "https://...",
  "category": "gpus",
  "stock": 10,
  "badge": "Nuevo",
  "specs": [
    { "label": "VRAM", "value": "24GB GDDR6X" }
  ]
}
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `name` | string | ✅ |
| `description` | string | ✅ |
| `price` | number | ✅ |
| `image` | string | ✅ |
| `category` | string | ✅ |
| `stock` | number | ✅ |
| `originalPrice` | number | No |
| `badge` | `"Nuevo" \| "Oferta" \| "Popular"` | No |
| `specs` | `{ label, value }[]` | No |

**Respuesta (201)** — objeto completo del producto creado.

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión admin |
| 400 | Campo requerido faltante |
| 500 | Error de base de datos |

---

### GET `/api/products/[id]`

Retorna el detalle completo de un producto.

**Auth requerida:** No

**Path param:** `id` — MongoDB ObjectId del producto

**Respuesta (200)** — objeto producto con todos los campos.

**Errores**

| Código | Causa |
|--------|-------|
| 400 | `id` no es un ObjectId válido |
| 404 | Producto no encontrado |
| 500 | Error de base de datos |

---

### PUT `/api/products/[id]`

Actualiza un producto existente.

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — MongoDB ObjectId

**Body** — mismos campos que POST `/api/products`.

**Respuesta (200)** — objeto producto actualizado.

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión admin |
| 400 | `id` inválido |
| 404 | Producto no encontrado |

---

### DELETE `/api/products/[id]`

Elimina un producto.

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — MongoDB ObjectId

**Respuesta (200)**
```json
{ "success": true }
```

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión admin |
| 404 | Producto no encontrado |

---

## 3. Reviews

### GET `/api/products/[id]/reviews`

Lista las reseñas de un producto, ordenadas por fecha descendente.

**Auth requerida:** No

**Path param:** `id` — ID del producto

**Respuesta (200)**
```json
[
  {
    "productId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "userName": "Carlos López",
    "rating": 5,
    "comment": "Excelente producto, llegó en perfecto estado.",
    "createdAt": "2025-03-10T14:23:00.000Z"
  }
]
```

---

### POST `/api/products/[id]/reviews`

Publica una reseña del usuario autenticado para un producto.

**Auth requerida:** Sí — usuario autenticado

**Path param:** `id` — ID del producto

**Body**
```json
{
  "rating": 5,
  "comment": "Excelente producto, llegó perfecto."
}
```

| Campo | Tipo | Validación |
|-------|------|-----------|
| `rating` | int | Requerido, entre 1 y 5 |
| `comment` | string | Requerido, no vacío, máx 500 caracteres |

**Respuesta (201)** — objeto reseña creada.

**Efecto colateral:** recalcula `rating` promedio y `reviews` count del producto usando un aggregate.

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión |
| 400 | Rating fuera de rango o comentario inválido |
| 409 | El usuario ya reseñó este producto |

---

## 4. Orders

### GET `/api/orders`

Lista las órdenes del usuario autenticado, ordenadas por fecha descendente.

**Auth requerida:** Sí — usuario autenticado

**Respuesta (200)**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439012",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "PC Gamer Ultra RTX 4080",
        "price": 2499,
        "quantity": 1,
        "image": "https://..."
      }
    ],
    "subtotal": 2499,
    "shipping": 0,
    "discount": 0,
    "total": 2499,
    "status": "confirmed",
    "paymentId": "MP-123456789",
    "paymentStatus": "approved",
    "createdAt": "2025-03-15T10:00:00.000Z"
  }
]
```

---

### POST `/api/orders`

Crea una orden nueva. Verifica precios y stock en DB (server-side). Decrementa stock atómicamente.

**Auth requerida:** Sí — usuario autenticado

**Body**
```json
{
  "items": [
    { "productId": "507f1f77bcf86cd799439011", "quantity": 2 }
  ],
  "discountCode": "SUMMER20"
}
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `items` | `{ productId: string, quantity: number }[]` | ✅ (no vacío) |
| `discountCode` | string | No |

**Respuesta (201)**
```json
{
  "id": "507f1f77bcf86cd799439020",
  "total": 4798,
  "status": "pending"
}
```

**Validaciones server-side:**
- Precios tomados siempre desde la DB (no del cliente)
- Stock verificado antes de decrementar
- Cupón validado: activo, no expirado, usos disponibles, subtotal mínimo

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión |
| 400 | Items vacíos, productId inválido, o stock insuficiente |
| 404 | Producto no encontrado |
| 400 | Cupón inválido, expirado o subtotal insuficiente |

---

## 5. Payments

### POST `/api/payments/create-preference`

Crea una preferencia de pago en MercadoPago y retorna los URLs de checkout.

**Auth requerida:** Sí — usuario autenticado

**Body**
```json
{
  "orderId": "507f1f77bcf86cd799439020",
  "items": [
    {
      "title": "PC Gamer Ultra RTX 4080",
      "quantity": 1,
      "unit_price": 2499
    }
  ],
  "total": 2499
}
```

**Respuesta (200)**
```json
{
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

En desarrollo (`NODE_ENV !== "production"`) se usa `sandbox_init_point`. En producción, `init_point`.

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión |
| 400 | `orderId` faltante o `items` vacío |
| 500 | `MP_ACCESS_TOKEN` no configurado o error de MercadoPago |

---

### POST `/api/payments/webhook`

Recibe notificaciones de MercadoPago para actualizar el estado de las órdenes.

**Auth requerida:** No (llamado server-side por MercadoPago)

**Body** — notificación estándar de MercadoPago (varía según evento).

**Comportamiento:**
- Solo procesa notificaciones de tipo `"payment"`
- Consulta el estado en la API de MercadoPago
- Si `approved` → orden pasa a `status: "confirmed"`, `paymentStatus: "approved"`
- Si `rejected` o `cancelled` → actualiza `paymentStatus` en la orden

**Respuesta (200)** — siempre retorna `{ "received": true }` sin exponer detalles internos.

---

## 6. Wishlist

### GET `/api/wishlist`

Retorna los IDs de productos en favoritos del usuario autenticado.

**Auth requerida:** Sí — usuario autenticado

**Respuesta (200)**
```json
{ "productIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"] }
```

---

### POST `/api/wishlist`

Agrega o quita un producto de la wishlist (toggle).

**Auth requerida:** Sí — usuario autenticado

**Body**
```json
{ "productId": "507f1f77bcf86cd799439011" }
```

**Respuesta (200)**
```json
{ "action": "added" }
// o
{ "action": "removed" }
```

**Errores**

| Código | Causa |
|--------|-------|
| 401 | Sin sesión |
| 400 | `productId` no es un ObjectId válido |

---

## 7. User

### GET `/api/user/profile`

Retorna los datos de perfil del usuario autenticado.

**Auth requerida:** Sí — usuario autenticado

**Respuesta (200)**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "phone": "+54 11 1234-5678",
  "image": "https://..."
}
```

---

### PUT `/api/user/profile`

Actualiza el nombre o teléfono del usuario.

**Auth requerida:** Sí — usuario autenticado

**Body**
```json
{
  "name": "María García Updated",
  "phone": "+54 11 9999-8888"
}
```

| Campo | Tipo | Validación |
|-------|------|-----------|
| `name` | string | Opcional, máx 100 caracteres |
| `phone` | string | Opcional, máx 30 caracteres |

**Respuesta (200)**
```json
{ "success": true }
```

---

### POST `/api/user/avatar`

Actualiza el avatar del usuario. El backend guarda la imagen en la DB; el JWT nunca almacena base64 para evitar superar el límite de tamaño de cookies (HTTP 431).

**Auth requerida:** Sí — usuario autenticado

**Body**
```json
{ "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." }
```

| Campo | Validación |
|-------|-----------|
| `image` | Formato `data:image/...;base64,...`, máx 200 KB |

**Respuesta (200)**
```json
{ "success": true }
```

**Errores**

| Código | Causa |
|--------|-------|
| 400 | Formato inválido (no es data URI) |
| 400 | Imagen supera 200 KB |

---

### PUT `/api/user/password`

Cambia la contraseña del usuario. Solo disponible para cuentas con credenciales (no Google).

**Auth requerida:** Sí — usuario autenticado

**Body**
```json
{
  "currentPassword": "mipasswordactual",
  "newPassword": "nuevapassword123"
}
```

| Campo | Validación |
|-------|-----------|
| `currentPassword` | Requerido |
| `newPassword` | Requerido, mín 6 caracteres |

**Respuesta (200)**
```json
{ "message": "Contraseña actualizada correctamente" }
```

**Errores**

| Código | Causa |
|--------|-------|
| 400 | Cuenta de Google (sin password local) |
| 400 | `currentPassword` incorrecta |
| 400 | `newPassword` < 6 caracteres |

---

## 8. Admin — Orders

### GET `/api/admin/orders`

Lista todas las órdenes con datos del usuario (nombre y email).

**Auth requerida:** Sí — rol `ADMIN`

**Respuesta (200)**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439012",
    "userName": "María García",
    "userEmail": "maria@example.com",
    "items": [...],
    "total": 2499,
    "status": "confirmed",
    "paymentStatus": "approved",
    "createdAt": "2025-03-15T10:00:00.000Z"
  }
]
```

---

### PUT `/api/admin/orders/[id]`

Actualiza el estado de una orden.

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — ID de la orden

**Body**
```json
{ "status": "shipped" }
```

| Valor de `status` | Descripción |
|-------------------|-------------|
| `"pending"` | Pendiente de pago |
| `"confirmed"` | Pago confirmado |
| `"shipped"` | Enviado |
| `"delivered"` | Entregado |

**Respuesta (200)**
```json
{ "message": "Estado actualizado a shipped", "status": "shipped" }
```

**Errores**

| Código | Causa |
|--------|-------|
| 400 | `status` fuera de los valores permitidos |
| 404 | Orden no encontrada |

---

## 9. Admin — Users

### GET `/api/admin/users`

Lista todos los usuarios con su conteo de órdenes.

**Auth requerida:** Sí — rol `ADMIN`

**Respuesta (200)**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "María García",
    "email": "maria@example.com",
    "role": "CUSTOMER",
    "image": "https://...",
    "provider": "credentials",
    "hasPassword": true,
    "orderCount": 3,
    "createdAt": "2025-01-10T08:00:00.000Z"
  }
]
```

---

### PUT `/api/admin/users/[id]`

Actualiza datos de un usuario (nombre, rol o contraseña).

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — ID del usuario

**Body**
```json
{
  "name": "Nuevo Nombre",
  "role": "ADMIN",
  "password": "nuevapassword123"
}
```

| Campo | Validación |
|-------|-----------|
| `name` | Opcional, máx 100 caracteres |
| `role` | Opcional, `"ADMIN"` o `"CUSTOMER"` |
| `password` | Opcional, mín 6, máx 128 caracteres |

**Respuesta (200)** — usuario actualizado.

---

### DELETE `/api/admin/users/[id]`

Elimina un usuario. No se puede eliminar la propia cuenta.

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — ID del usuario

**Respuesta (200)**
```json
{ "success": true }
```

**Errores**

| Código | Causa |
|--------|-------|
| 400 | Intentar eliminar la propia cuenta |
| 404 | Usuario no encontrado |

---

## 10. Admin — Coupons

### GET `/api/admin/coupons`

Lista todos los cupones ordenados por fecha de creación descendente.

**Auth requerida:** Sí — rol `ADMIN`

**Respuesta (200)**
```json
[
  {
    "id": "507f1f77bcf86cd799439030",
    "code": "SUMMER20",
    "type": "percent",
    "value": 20,
    "minOrder": 100,
    "maxUses": 50,
    "usedCount": 12,
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST `/api/admin/coupons`

Crea un cupón de descuento.

**Auth requerida:** Sí — rol `ADMIN`

**Body**
```json
{
  "code": "SUMMER20",
  "type": "percent",
  "value": 20,
  "minOrder": 100,
  "maxUses": 50,
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

| Campo | Tipo | Validación |
|-------|------|-----------|
| `code` | string | Requerido, único |
| `type` | `"percent" \| "fixed"` | Requerido |
| `value` | number | Requerido; si `percent`: entre 1 y 100 |
| `minOrder` | number | Opcional, default 0 |
| `maxUses` | number \| null | Opcional (null = sin límite) |
| `expiresAt` | Date \| null | Opcional (null = sin expiración) |

**Respuesta (201)** — cupón creado.

**Errores**

| Código | Causa |
|--------|-------|
| 400 | `code` o `type` faltante, porcentaje fuera de 1-100 |
| 409 | Código de cupón ya existe |

---

### PUT `/api/admin/coupons/[id]`

Actualiza campos de un cupón.

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — ID del cupón

**Body** — subconjunto de los campos de creación (whitelisting aplicado).

**Respuesta (200)** — cupón actualizado.

---

### DELETE `/api/admin/coupons/[id]`

Elimina un cupón.

**Auth requerida:** Sí — rol `ADMIN`

**Path param:** `id` — ID del cupón

**Respuesta (200)**
```json
{ "success": true }
```

---

## 11. Coupons

### POST `/api/coupons/validate`

Valida un código de cupón contra el subtotal actual. No requiere autenticación.

**Auth requerida:** No

**Body**
```json
{
  "code": "SUMMER20",
  "subtotal": 250
}
```

**Respuesta (200)**
```json
{
  "code": "SUMMER20",
  "type": "percent",
  "value": 20,
  "discount": 50
}
```

El campo `discount` es el monto calculado de descuento en USD.

**Errores**

| Código | Causa |
|--------|-------|
| 404 | Código no encontrado o inactivo |
| 400 | Cupón expirado |
| 400 | Límite de usos agotado |
| 400 | Subtotal menor al mínimo requerido (`minOrder`) |

---

## 12. Stats

### GET `/api/stats`

Retorna métricas rápidas para el dashboard de administración.

**Auth requerida:** No (endpoint público)

**Respuesta (200)**
```json
{
  "productCount": 48,
  "ordersThisMonth": 127,
  "userCount": 312
}
```

`ordersThisMonth` filtra órdenes creadas desde el primer día del mes actual (UTC).
