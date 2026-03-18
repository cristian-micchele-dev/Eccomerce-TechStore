import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no está definida en las variables de entorno")
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache
}

const cached: MongooseCache = globalThis.mongooseCache ?? { conn: null, promise: null }
if (!globalThis.mongooseCache) globalThis.mongooseCache = cached

/**
 * Conecta a MongoDB usando Mongoose con caché global para evitar
 * conexiones múltiples en entornos serverless (Next.js API Routes).
 *
 * El singleton se almacena en `globalThis.mongooseCache`.
 * Llamadas concurrentes comparten la misma promesa de conexión para
 * evitar race conditions. Si la conexión falla, el caché se limpia
 * para permitir reintentos en el siguiente request.
 *
 * @returns Promesa que resuelve la instancia de mongoose conectada
 * @throws {Error} Si `MONGODB_URI` no está definida en las variables de entorno
 * @throws {Error} Si la conexión a MongoDB falla
 *
 * @example
 * import { connectDB } from "@/lib/mongoose"
 *
 * export async function GET() {
 *   await connectDB()
 *   const products = await Product.find({})
 *   return Response.json(products)
 * }
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .catch((err) => {
        cached.promise = null // permite reintentar en el próximo request
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
