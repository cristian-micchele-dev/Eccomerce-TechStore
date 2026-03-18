import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

// Leer MONGODB_URI desde .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, "../.env.local")
const envContent = readFileSync(envPath, "utf-8")
const uriMatch = envContent.match(/MONGODB_URI="([^"]+)"/)
const MONGODB_URI = uriMatch?.[1]

if (!MONGODB_URI || MONGODB_URI.includes("<usuario>")) {
  console.error("❌ MONGODB_URI no está configurada en .env.local")
  process.exit(1)
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
}, { timestamps: true })

const ProductSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true },
  originalPrice: { type: Number },
  image:         { type: String, required: true },
  images:        { type: [String], default: [] },
  category:      { type: String, required: true },
  specs:         { type: [{ label: String, value: String }], default: [] },
  stock:         { type: Number, required: true, default: 0 },
  rating:        { type: Number, default: 0 },
  reviews:       { type: Number, default: 0 },
  badge:         { type: String },
}, { timestamps: true })

const CouponSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:      { type: String, enum: ["percent", "fixed"], required: true },
  value:     { type: Number, required: true, min: 0 },
  minOrder:  { type: Number, default: 0 },
  maxUses:   { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
})

const User    = mongoose.models.User    ?? mongoose.model("User",    UserSchema)
const Product = mongoose.models.Product ?? mongoose.model("Product", ProductSchema)
const Coupon  = mongoose.models.Coupon  ?? mongoose.model("Coupon",  CouponSchema)

// ── Productos seed ────────────────────────────────────────────────────────────

const PRODUCTS = [

  // ── PCs ──────────────────────────────────────────────────────────────────
  {
    name: "PC Gamer Ultra RTX 4080",
    description: "Torre gaming de alto rendimiento con RTX 4080, ideal para gaming 4K y creación de contenido profesional.",
    price: 2499, originalPrice: 2799,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
      "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80",
    ],
    category: "pcs", stock: 8, rating: 4.9, reviews: 124, badge: "Oferta",
    specs: [
      { label: "CPU", value: "Intel Core i9-14900K" },
      { label: "GPU", value: "NVIDIA RTX 4080 16GB" },
      { label: "RAM", value: "32GB DDR5 5600MHz" },
      { label: "Almacenamiento", value: "2TB NVMe SSD" },
      { label: "Fuente", value: "850W 80+ Gold" },
      { label: "Refrigeración", value: "Líquida 360mm AIO" },
    ],
  },
  {
    name: "PC Mini ITX AMD Ryzen 9",
    description: "PC compacta de alto rendimiento con Ryzen 9 7950X en factor de forma Mini ITX.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&q=80"],
    category: "pcs", stock: 5, rating: 4.7, reviews: 67, badge: "Nuevo",
    specs: [
      { label: "CPU", value: "AMD Ryzen 9 7950X" },
      { label: "GPU", value: "RX 7900 XTX 24GB" },
      { label: "RAM", value: "64GB DDR5 6000MHz" },
      { label: "Almacenamiento", value: "1TB NVMe SSD" },
      { label: "Factor", value: "Mini ITX" },
      { label: "SO", value: "Windows 11 Pro" },
    ],
  },
  {
    name: "PC Workstation Creator Pro",
    description: "Estación de trabajo profesional para renderizado, edición de video 8K y diseño 3D con doble GPU.",
    price: 3299,
    image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&q=80"],
    category: "pcs", stock: 3, rating: 4.8, reviews: 41,
    specs: [
      { label: "CPU", value: "Intel Core i9-14900KF" },
      { label: "GPU", value: "NVIDIA RTX 4090 24GB" },
      { label: "RAM", value: "128GB DDR5 ECC" },
      { label: "Almacenamiento", value: "4TB NVMe RAID 0" },
      { label: "Fuente", value: "1200W 80+ Platinum" },
      { label: "SO", value: "Windows 11 Pro" },
    ],
  },
  {
    name: "PC Gamer Entry Level RTX 4060",
    description: "PC gaming de entrada accesible, perfecta para 1080p a 144Hz en todos los títulos actuales.",
    price: 899, originalPrice: 999,
    image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80"],
    category: "pcs", stock: 14, rating: 4.5, reviews: 203, badge: "Oferta",
    specs: [
      { label: "CPU", value: "Intel Core i5-14600K" },
      { label: "GPU", value: "NVIDIA RTX 4060 8GB" },
      { label: "RAM", value: "16GB DDR5 4800MHz" },
      { label: "Almacenamiento", value: "1TB NVMe SSD" },
      { label: "Fuente", value: "650W 80+ Bronze" },
      { label: "SO", value: "Windows 11 Home" },
    ],
  },

  // ── MONITORES ─────────────────────────────────────────────────────────────
  {
    name: 'Monitor LG UltraWide 34"',
    description: "Monitor curvo ultrawide 34 pulgadas con resolución WQHD y frecuencia de 144Hz para gaming inmersivo.",
    price: 649,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"],
    category: "monitores", stock: 15, rating: 4.7, reviews: 89, badge: "Popular",
    specs: [
      { label: "Tamaño", value: "34 pulgadas" },
      { label: "Resolución", value: "3440x1440 WQHD" },
      { label: "Panel", value: "IPS Curvo 1800R" },
      { label: "Frecuencia", value: "144Hz" },
      { label: "Tiempo Resp.", value: "1ms GtG" },
      { label: "Conectividad", value: "HDMI 2.0 x2, DP 1.4" },
    ],
  },
  {
    name: 'Monitor Samsung Odyssey G7 27"',
    description: "Monitor gaming curvo 1000R con 240Hz, QHD y tecnología QLED para colores vibrantes.",
    price: 529,
    image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80"],
    category: "monitores", stock: 11, rating: 4.8, reviews: 145,
    specs: [
      { label: "Tamaño", value: "27 pulgadas" },
      { label: "Resolución", value: "2560x1440 QHD" },
      { label: "Panel", value: "VA Curvo 1000R QLED" },
      { label: "Frecuencia", value: "240Hz" },
      { label: "Tiempo Resp.", value: "1ms" },
      { label: "HDR", value: "HDR600" },
    ],
  },
  {
    name: 'Monitor ASUS ProArt 32" 4K',
    description: "Monitor profesional 4K con calibración de fábrica, cobertura 100% DCI-P3 y soporte HDR1000.",
    price: 849,
    image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80"],
    category: "monitores", stock: 7, rating: 4.9, reviews: 58, badge: "Nuevo",
    specs: [
      { label: "Tamaño", value: "32 pulgadas" },
      { label: "Resolución", value: "3840x2160 4K UHD" },
      { label: "Panel", value: "IPS OLED" },
      { label: "Frecuencia", value: "60Hz" },
      { label: "Color", value: "100% DCI-P3" },
      { label: "HDR", value: "DisplayHDR 1000" },
    ],
  },
  {
    name: 'Monitor MSI MAG 240Hz 24"',
    description: "Monitor gaming Full HD de 240Hz con tiempo de respuesta de 0.5ms para esports competitivo.",
    price: 279, originalPrice: 319,
    image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80"],
    category: "monitores", stock: 24, rating: 4.6, reviews: 312, badge: "Oferta",
    specs: [
      { label: "Tamaño", value: "24 pulgadas" },
      { label: "Resolución", value: "1920x1080 Full HD" },
      { label: "Panel", value: "IPS" },
      { label: "Frecuencia", value: "240Hz" },
      { label: "Tiempo Resp.", value: "0.5ms GtG" },
      { label: "Sync", value: "AMD FreeSync Premium" },
    ],
  },

  // ── TECLADOS ──────────────────────────────────────────────────────────────
  {
    name: "Teclado Mecánico Keychron K8",
    description: "Teclado mecánico TKL inalámbrico con switches Cherry MX y retroiluminación RGB.",
    price: 129,
    image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800&q=80"],
    category: "teclados", stock: 32, rating: 4.8, reviews: 256, badge: "Popular",
    specs: [
      { label: "Switches", value: "Cherry MX Red" },
      { label: "Layout", value: "TKL (87 teclas)" },
      { label: "Conexión", value: "Bluetooth 5.1 / USB-C" },
      { label: "Batería", value: "4000mAh" },
      { label: "Retroiluminación", value: "RGB per-key" },
      { label: "Compatibilidad", value: "Win / Mac / Linux" },
    ],
  },
  {
    name: "Teclado Corsair K100 RGB",
    description: "Teclado mecánico full-size con switches OPX óptico-mecánicos y rueda de control multimedia.",
    price: 229,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"],
    category: "teclados", stock: 20, rating: 4.7, reviews: 178,
    specs: [
      { label: "Switches", value: "CORSAIR OPX Óptico" },
      { label: "Layout", value: "Full-size (110 teclas)" },
      { label: "Actuation", value: "1mm" },
      { label: "Retroiluminación", value: "RGB per-key 44 zonas" },
      { label: "Memoria", value: "8MB onboard" },
      { label: "Cable", value: "Trenzado USB-C" },
    ],
  },
  {
    name: "Teclado Anne Pro 2 60%",
    description: "Teclado compacto 60% inalámbrico con switches Gateron y programación completa de macros.",
    price: 89,
    image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80"],
    category: "teclados", stock: 41, rating: 4.5, reviews: 389, badge: "Popular",
    specs: [
      { label: "Switches", value: "Gateron Brown" },
      { label: "Layout", value: "60% (61 teclas)" },
      { label: "Conexión", value: "Bluetooth 4.0 / USB-C" },
      { label: "Batería", value: "1900mAh" },
      { label: "Retroiluminación", value: "RGB" },
      { label: "Software", value: "ObinsKit" },
    ],
  },
  {
    name: "Teclado Logitech MX Keys",
    description: "Teclado premium para productividad con teclas esféricas, retroiluminación adaptativa y multi-device.",
    price: 119, originalPrice: 139,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80"],
    category: "teclados", stock: 27, rating: 4.6, reviews: 524, badge: "Oferta",
    specs: [
      { label: "Tipo", value: "Membrana de baja silueta" },
      { label: "Layout", value: "Full-size con numpad" },
      { label: "Conexión", value: "Bluetooth / USB receiver" },
      { label: "Batería", value: "10 días (retroilum. on)" },
      { label: "Multi-device", value: "Hasta 3 dispositivos" },
      { label: "Compatibilidad", value: "Win / Mac / Linux" },
    ],
  },

  // ── MOUSE ─────────────────────────────────────────────────────────────────
  {
    name: "Mouse Logitech G Pro X Superlight 2",
    description: "Mouse gaming ultraligero de 60g con sensor HERO 2 de 32000 DPI para máximo rendimiento competitivo.",
    price: 159,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"],
    category: "mouse", stock: 22, rating: 4.9, reviews: 412, badge: "Nuevo",
    specs: [
      { label: "Sensor", value: "HERO 2 32000 DPI" },
      { label: "Peso", value: "60g" },
      { label: "Conexión", value: "LIGHTSPEED Wireless" },
      { label: "Batería", value: "70 horas" },
      { label: "Polling Rate", value: "2000Hz" },
      { label: "Botones", value: "5 programables" },
    ],
  },
  {
    name: "Mouse Razer DeathAdder V3 Pro",
    description: "Mouse ergonómico inalámbrico con sensor Focus Pro 30000 DPI y autonomía de 90 horas.",
    price: 139,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"],
    category: "mouse", stock: 28, rating: 4.6, reviews: 287,
    specs: [
      { label: "Sensor", value: "Focus Pro 30000 DPI" },
      { label: "Peso", value: "64g" },
      { label: "Conexión", value: "HyperSpeed Wireless" },
      { label: "Batería", value: "90 horas" },
      { label: "Polling Rate", value: "1000Hz" },
      { label: "Botones", value: "8 programables" },
    ],
  },
  {
    name: "Mouse SteelSeries Rival 600",
    description: "Mouse gaming con doble sensor óptico TrueMove3+ para tracking perfecto sin lift-off involuntario.",
    price: 79, originalPrice: 99,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"],
    category: "mouse", stock: 35, rating: 4.5, reviews: 198, badge: "Oferta",
    specs: [
      { label: "Sensor", value: "TrueMove3+ 12000 DPI" },
      { label: "Peso", value: "96g + 16g ajustables" },
      { label: "Conexión", value: "USB con cable" },
      { label: "Polling Rate", value: "1000Hz" },
      { label: "Switches", value: "Omron 60M clics" },
      { label: "RGB", value: "2 zonas RGB" },
    ],
  },

  // ── HEADSETS ──────────────────────────────────────────────────────────────
  {
    name: "Headset HyperX Cloud Alpha",
    description: "Auriculares gaming con drivers duales de cámara y sonido 3D espacial para una experiencia inmersiva.",
    price: 99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    category: "headsets", stock: 18, rating: 4.6, reviews: 341,
    specs: [
      { label: "Drivers", value: "50mm Dual Chamber" },
      { label: "Respuesta Frec.", value: "13Hz – 27,000Hz" },
      { label: "Micrófono", value: "Desmontable, Noise Cancel" },
      { label: "Conexión", value: "3.5mm / USB dongle" },
      { label: "Peso", value: "336g" },
      { label: "Compatibilidad", value: "PC, PS5, Xbox, Switch" },
    ],
  },
  {
    name: "Headset SteelSeries Arctis Nova Pro",
    description: "Headset premium inalámbrico con cancelación activa de ruido y sistema de doble batería hot-swap.",
    price: 349,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80"],
    category: "headsets", stock: 9, rating: 4.8, reviews: 156, badge: "Nuevo",
    specs: [
      { label: "Tipo", value: "Circumaural cerrado" },
      { label: "ANC", value: "Active Noise Cancellation" },
      { label: "Batería", value: "Dual battery hot-swap" },
      { label: "Autonomía", value: "22h por batería" },
      { label: "Micrófono", value: "Retráctil ClearCast Gen2" },
      { label: "Compatibilidad", value: "PC, PS5, Switch" },
    ],
  },
  {
    name: "Headset Logitech G733 Lightspeed",
    description: "Headset inalámbrico de colores con sonido envolvente DTS 2.0 y batería de 29 horas.",
    price: 129, originalPrice: 149,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"],
    category: "headsets", stock: 21, rating: 4.4, reviews: 267, badge: "Oferta",
    specs: [
      { label: "Drivers", value: "40mm PRO-G" },
      { label: "Sonido", value: "DTS Headphone:X 2.0" },
      { label: "Conexión", value: "LIGHTSPEED Wireless" },
      { label: "Batería", value: "29 horas" },
      { label: "Micrófono", value: "Cardioid con boom" },
      { label: "Peso", value: "278g" },
    ],
  },

  // ── ALMACENAMIENTO ────────────────────────────────────────────────────────
  {
    name: "SSD Samsung 990 Pro 2TB",
    description: "SSD NVMe PCIe 4.0 con velocidades de lectura de hasta 7450 MB/s para cargas de trabajo intensivas.",
    price: 189, originalPrice: 229,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80"],
    category: "almacenamiento", stock: 45, rating: 4.8, reviews: 198, badge: "Oferta",
    specs: [
      { label: "Capacidad", value: "2TB" },
      { label: "Interfaz", value: "PCIe 4.0 NVMe" },
      { label: "Lectura Seq.", value: "7,450 MB/s" },
      { label: "Escritura Seq.", value: "6,900 MB/s" },
      { label: "Factor de Forma", value: "M.2 2280" },
      { label: "Garantía", value: "5 años" },
    ],
  },
  {
    name: "SSD WD Black SN850X 1TB",
    description: "SSD gaming NVMe con velocidades extremas y tecnología Game Mode 2.0 optimizada para gaming.",
    price: 119,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    category: "almacenamiento", stock: 38, rating: 4.7, reviews: 223,
    specs: [
      { label: "Capacidad", value: "1TB" },
      { label: "Interfaz", value: "PCIe 4.0 NVMe" },
      { label: "Lectura Seq.", value: "7,300 MB/s" },
      { label: "Escritura Seq.", value: "6,600 MB/s" },
      { label: "Factor de Forma", value: "M.2 2280" },
      { label: "Garantía", value: "5 años" },
    ],
  },
  {
    name: "SSD Crucial P3 Plus 4TB",
    description: "SSD económica de alta capacidad con PCIe 4.0 para almacenamiento masivo de juegos y archivos.",
    price: 229, originalPrice: 279,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80"],
    category: "almacenamiento", stock: 29, rating: 4.4, reviews: 87, badge: "Oferta",
    specs: [
      { label: "Capacidad", value: "4TB" },
      { label: "Interfaz", value: "PCIe 4.0 NVMe" },
      { label: "Lectura Seq.", value: "5,000 MB/s" },
      { label: "Escritura Seq.", value: "4,200 MB/s" },
      { label: "Factor de Forma", value: "M.2 2280" },
      { label: "Garantía", value: "5 años" },
    ],
  },
  {
    name: "HDD Seagate Barracuda 4TB",
    description: "Disco duro de alta capacidad para almacenamiento secundario con transferencia de 190 MB/s.",
    price: 79,
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80"],
    category: "almacenamiento", stock: 52, rating: 4.2, reviews: 641,
    specs: [
      { label: "Capacidad", value: "4TB" },
      { label: "Interfaz", value: "SATA III 6Gb/s" },
      { label: "RPM", value: "5400 RPM" },
      { label: "Caché", value: "256MB" },
      { label: "Transfer Rate", value: "190 MB/s" },
      { label: "Garantía", value: "2 años" },
    ],
  },

  // ── PROCESADORES ──────────────────────────────────────────────────────────
  {
    name: "Intel Core i9-14900K",
    description: "Procesador flagship de 14ta generación con 24 núcleos (8P+16E) y boost de 6.0GHz para gaming y creación.",
    price: 549,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    category: "procesadores", stock: 12, rating: 4.8, reviews: 189, badge: "Popular",
    specs: [
      { label: "Núcleos", value: "24 (8P + 16E)" },
      { label: "Threads", value: "32" },
      { label: "Base Clock", value: "3.2 GHz (P) / 2.4 GHz (E)" },
      { label: "Boost Clock", value: "6.0 GHz" },
      { label: "Caché L3", value: "36MB Intel Smart Cache" },
      { label: "Socket", value: "LGA1700" },
    ],
  },
  {
    name: "Intel Core i7-14700K",
    description: "Procesador de alto rendimiento con 20 núcleos equilibrado entre gaming y productividad profesional.",
    price: 389,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"],
    category: "procesadores", stock: 18, rating: 4.7, reviews: 145,
    specs: [
      { label: "Núcleos", value: "20 (8P + 12E)" },
      { label: "Threads", value: "28" },
      { label: "Base Clock", value: "3.4 GHz" },
      { label: "Boost Clock", value: "5.6 GHz" },
      { label: "Caché L3", value: "33MB" },
      { label: "Socket", value: "LGA1700" },
    ],
  },
  {
    name: "Intel Core i5-14600K",
    description: "El mejor procesador precio-rendimiento para gaming a 1080p y 1440p con 14 núcleos híbridos.",
    price: 279, originalPrice: 309,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80"],
    category: "procesadores", stock: 26, rating: 4.8, reviews: 412, badge: "Popular",
    specs: [
      { label: "Núcleos", value: "14 (6P + 8E)" },
      { label: "Threads", value: "20" },
      { label: "Base Clock", value: "3.5 GHz" },
      { label: "Boost Clock", value: "5.3 GHz" },
      { label: "Caché L3", value: "24MB" },
      { label: "Socket", value: "LGA1700" },
    ],
  },
  {
    name: "AMD Ryzen 9 7950X",
    description: "Procesador AM5 de 16 núcleos para workstations y renderizado con arquitectura Zen 4 y DDR5.",
    price: 649, originalPrice: 699,
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80"],
    category: "procesadores", stock: 9, rating: 4.9, reviews: 98, badge: "Oferta",
    specs: [
      { label: "Núcleos", value: "16" },
      { label: "Threads", value: "32" },
      { label: "Base Clock", value: "4.5 GHz" },
      { label: "Boost Clock", value: "5.7 GHz" },
      { label: "Caché L3", value: "64MB" },
      { label: "Socket", value: "AM5" },
    ],
  },
  {
    name: "AMD Ryzen 7 7700X",
    description: "Procesador AM5 de 8 núcleos con Zen 4, ideal para gaming de alto rendimiento con excelente eficiencia.",
    price: 299,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80"],
    category: "procesadores", stock: 22, rating: 4.6, reviews: 176,
    specs: [
      { label: "Núcleos", value: "8" },
      { label: "Threads", value: "16" },
      { label: "Base Clock", value: "4.5 GHz" },
      { label: "Boost Clock", value: "5.4 GHz" },
      { label: "Caché L3", value: "32MB" },
      { label: "Socket", value: "AM5" },
    ],
  },
  {
    name: "AMD Ryzen 5 7600X",
    description: "Procesador gaming AM5 de entrada accesible, el Ryzen 5 más rápido para gaming 1080p.",
    price: 199, originalPrice: 239,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80"],
    category: "procesadores", stock: 33, rating: 4.5, reviews: 287, badge: "Oferta",
    specs: [
      { label: "Núcleos", value: "6" },
      { label: "Threads", value: "12" },
      { label: "Base Clock", value: "4.7 GHz" },
      { label: "Boost Clock", value: "5.3 GHz" },
      { label: "Caché L3", value: "32MB" },
      { label: "Socket", value: "AM5" },
    ],
  },

  // ── MEMORIAS RAM ──────────────────────────────────────────────────────────
  {
    name: "Corsair Dominator Platinum 32GB DDR5",
    description: "Kit DDR5 de alta gama con iluminación CAPELLIX RGB y latencias CL30 para el máximo rendimiento.",
    price: 179,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80"],
    category: "memorias", stock: 16, rating: 4.8, reviews: 134, badge: "Nuevo",
    specs: [
      { label: "Capacidad", value: "32GB (2x16GB)" },
      { label: "Tipo", value: "DDR5" },
      { label: "Velocidad", value: "6000MHz" },
      { label: "Latencia", value: "CL30" },
      { label: "Voltaje", value: "1.35V" },
      { label: "RGB", value: "CAPELLIX LED" },
    ],
  },
  {
    name: "G.Skill Trident Z5 RGB 32GB DDR5",
    description: "Memoria DDR5 de alto rendimiento con diseño icónico y XMP 3.0 para overclock sin complicaciones.",
    price: 149, originalPrice: 169,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    category: "memorias", stock: 24, rating: 4.7, reviews: 201, badge: "Oferta",
    specs: [
      { label: "Capacidad", value: "32GB (2x16GB)" },
      { label: "Tipo", value: "DDR5" },
      { label: "Velocidad", value: "5600MHz" },
      { label: "Latencia", value: "CL28" },
      { label: "Perfil", value: "Intel XMP 3.0" },
      { label: "RGB", value: "Trident Z RGB" },
    ],
  },
  {
    name: "Kingston Fury Beast 16GB DDR4",
    description: "Memoria DDR4 de bajo perfil con overclocking inteligente Intel XMP 2.0 y disipador de calor.",
    price: 49, originalPrice: 59,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"],
    category: "memorias", stock: 58, rating: 4.6, reviews: 823, badge: "Oferta",
    specs: [
      { label: "Capacidad", value: "16GB (2x8GB)" },
      { label: "Tipo", value: "DDR4" },
      { label: "Velocidad", value: "3200MHz" },
      { label: "Latencia", value: "CL16" },
      { label: "Perfil", value: "Intel XMP 2.0" },
      { label: "Voltaje", value: "1.35V" },
    ],
  },
  {
    name: "Corsair Vengeance 64GB DDR5",
    description: "Kit de alta capacidad 64GB DDR5 para workstations, edición de video y máquinas virtuales.",
    price: 299,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80"],
    category: "memorias", stock: 11, rating: 4.8, reviews: 67,
    specs: [
      { label: "Capacidad", value: "64GB (2x32GB)" },
      { label: "Tipo", value: "DDR5" },
      { label: "Velocidad", value: "5200MHz" },
      { label: "Latencia", value: "CL38" },
      { label: "Perfil", value: "AMD EXPO / Intel XMP 3.0" },
      { label: "Voltaje", value: "1.25V" },
    ],
  },
  {
    name: "Team Group T-Force Delta 32GB DDR4",
    description: "Memoria gaming DDR4 con iluminación RGB de alto impacto visual y rendimiento estable.",
    price: 79,
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=80"],
    category: "memorias", stock: 31, rating: 4.4, reviews: 312, badge: "Popular",
    specs: [
      { label: "Capacidad", value: "32GB (2x16GB)" },
      { label: "Tipo", value: "DDR4" },
      { label: "Velocidad", value: "3600MHz" },
      { label: "Latencia", value: "CL18" },
      { label: "Perfil", value: "Intel XMP 2.0" },
      { label: "RGB", value: "Full mirror RGB" },
    ],
  },

  // ── TARJETAS DE VIDEO ─────────────────────────────────────────────────────
  {
    name: "NVIDIA GeForce RTX 4090 24GB",
    description: "La GPU más potente del mercado para gaming 4K, ray tracing y IA generativa con arquitectura Ada Lovelace.",
    price: 1799,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80"],
    category: "gpus", stock: 4, rating: 4.9, reviews: 89,
    specs: [
      { label: "VRAM", value: "24GB GDDR6X" },
      { label: "CUDA Cores", value: "16384" },
      { label: "Boost Clock", value: "2.52 GHz" },
      { label: "TDP", value: "450W" },
      { label: "Bus", value: "384-bit" },
      { label: "Conector", value: "PCIe 4.0 x16" },
    ],
  },
  {
    name: "NVIDIA GeForce RTX 4080 Super 16GB",
    description: "GPU de alta gama para gaming 4K ultra con DLSS 3.5 y Frame Generation para fps extremos.",
    price: 999, originalPrice: 1099,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80"],
    category: "gpus", stock: 7, rating: 4.8, reviews: 134, badge: "Popular",
    specs: [
      { label: "VRAM", value: "16GB GDDR6X" },
      { label: "CUDA Cores", value: "10240" },
      { label: "Boost Clock", value: "2.55 GHz" },
      { label: "TDP", value: "320W" },
      { label: "DLSS", value: "DLSS 3.5" },
      { label: "Conector", value: "PCIe 4.0 x16" },
    ],
  },
  {
    name: "NVIDIA GeForce RTX 4070 Ti Super 16GB",
    description: "El punto dulce para gaming 1440p y 4K con excelente relación rendimiento-precio y DLSS 3.",
    price: 799,
    image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&q=80"],
    category: "gpus", stock: 13, rating: 4.7, reviews: 198, badge: "Nuevo",
    specs: [
      { label: "VRAM", value: "16GB GDDR6X" },
      { label: "CUDA Cores", value: "8448" },
      { label: "Boost Clock", value: "2.61 GHz" },
      { label: "TDP", value: "285W" },
      { label: "Bus", value: "256-bit" },
      { label: "DLSS", value: "DLSS 3" },
    ],
  },
  {
    name: "AMD Radeon RX 7900 XTX 24GB",
    description: "Tarjeta AMD de referencia para gaming 4K con arquitectura RDNA 3 y soporte DisplayPort 2.1.",
    price: 899, originalPrice: 999,
    image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&q=80"],
    category: "gpus", stock: 6, rating: 4.7, reviews: 112, badge: "Oferta",
    specs: [
      { label: "VRAM", value: "24GB GDDR6" },
      { label: "Stream Proc.", value: "6144" },
      { label: "Boost Clock", value: "2.5 GHz" },
      { label: "TDP", value: "355W" },
      { label: "Bus", value: "384-bit" },
      { label: "Display", value: "DisplayPort 2.1 x2" },
    ],
  },
  {
    name: "NVIDIA GeForce RTX 4060 8GB",
    description: "GPU gaming 1080p de nueva generación con DLSS 3 y eficiencia energética excepcional a precio accesible.",
    price: 299, originalPrice: 329,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80"],
    category: "gpus", stock: 31, rating: 4.5, reviews: 445, badge: "Oferta",
    specs: [
      { label: "VRAM", value: "8GB GDDR6" },
      { label: "CUDA Cores", value: "3072" },
      { label: "Boost Clock", value: "2.46 GHz" },
      { label: "TDP", value: "115W" },
      { label: "DLSS", value: "DLSS 3" },
      { label: "Conector", value: "PCIe 4.0 x16" },
    ],
  },
  {
    name: "AMD Radeon RX 7600 8GB",
    description: "GPU AMD accesible con FSR 3 y soporte AV1 para gaming 1080p fluido con bajo consumo.",
    price: 239,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    category: "gpus", stock: 26, rating: 4.3, reviews: 287, badge: "Nuevo",
    specs: [
      { label: "VRAM", value: "8GB GDDR6" },
      { label: "Stream Proc.", value: "2048" },
      { label: "Boost Clock", value: "2.655 GHz" },
      { label: "TDP", value: "165W" },
      { label: "FSR", value: "AMD FSR 3" },
      { label: "Conector", value: "PCIe 4.0 x8" },
    ],
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔌 Conectando a MongoDB Atlas...")
  await mongoose.connect(MONGODB_URI)
  console.log("✅ Conectado!\n")

  // Admin user
  const password = await bcrypt.hash("admin123", 10)
  await User.findOneAndUpdate(
    { email: "admin@techstore.com" },
    { $setOnInsert: { name: "Admin", email: "admin@techstore.com", password, role: "ADMIN" } },
    { upsert: true, new: true }
  )
  console.log("👤 Admin listo: admin@techstore.com / admin123")

  // Productos — upsert por nombre para evitar duplicados
  let creados = 0
  let actualizados = 0
  for (const p of PRODUCTS) {
    const existing = await Product.findOne({ name: p.name })
    if (existing) {
      await Product.updateOne({ name: p.name }, { $set: { image: p.image, images: p.images } })
      actualizados++
    } else {
      await Product.create(p)
      creados++
    }
  }

  // Cupones demo
  await Coupon.findOneAndUpdate(
    { code: "TECHSTORE10" },
    { $setOnInsert: { code: "TECHSTORE10", type: "percent", value: 10, minOrder: 0, active: true } },
    { upsert: true }
  )
  await Coupon.findOneAndUpdate(
    { code: "DESC500" },
    { $setOnInsert: { code: "DESC500", type: "fixed", value: 500, minOrder: 1000, active: true } },
    { upsert: true }
  )
  console.log("🏷️  Cupones demo: TECHSTORE10 (10% off) · DESC500 ($500 off en pedidos +$1000)")

  console.log(`\n📦 Productos: ${creados} creados, ${actualizados} imágenes actualizadas.`)
  console.log(`   Total en catálogo: ${creados + actualizados} productos`)
  console.log("\n🚀 Seed completado. Ya podés hacer login y ver el catálogo.")
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error("❌ Error:", err.message)
  process.exit(1)
})
