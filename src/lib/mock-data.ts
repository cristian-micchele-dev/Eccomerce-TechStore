import { Product, Category } from './types'

export const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pcs', label: 'PCs' },
  { value: 'monitores', label: 'Monitores' },
  { value: 'teclados', label: 'Teclados' },
  { value: 'mouse', label: 'Mouse' },
  { value: 'headsets', label: 'Headsets' },
  { value: 'almacenamiento', label: 'Almacenamiento' },
  { value: 'procesadores', label: 'Procesadores' },
  { value: 'memorias', label: 'Memorias RAM' },
  { value: 'gpus', label: 'Tarjetas de Video' },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'PC Gamer Ultra RTX 4080',
    description: 'Torre gaming de alto rendimiento con RTX 4080, ideal para gaming 4K y creación de contenido profesional.',
    price: 2499,
    originalPrice: 2799,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80',
      'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&q=80',
    ],
    category: 'pcs',
    specs: [
      { label: 'CPU', value: 'Intel Core i9-14900K' },
      { label: 'GPU', value: 'NVIDIA RTX 4080 16GB' },
      { label: 'RAM', value: '32GB DDR5 5600MHz' },
      { label: 'Almacenamiento', value: '2TB NVMe SSD' },
      { label: 'Fuente', value: '850W 80+ Gold' },
      { label: 'Refrigeración', value: 'Líquida 360mm AIO' },
    ],
    stock: 8,
    rating: 4.9,
    reviews: 124,
    badge: 'Oferta',
  },
  {
    id: '2',
    name: 'Monitor LG UltraWide 34"',
    description: 'Monitor curvo ultrawide 34 pulgadas con resolución WQHD y frecuencia de 144Hz para gaming inmersivo.',
    price: 649,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80',
    ],
    category: 'monitores',
    specs: [
      { label: 'Tamaño', value: '34 pulgadas' },
      { label: 'Resolución', value: '3440x1440 WQHD' },
      { label: 'Panel', value: 'IPS Curvo 1800R' },
      { label: 'Frecuencia', value: '144Hz' },
      { label: 'Tiempo Resp.', value: '1ms GtG' },
      { label: 'Conectividad', value: 'HDMI 2.0 x2, DP 1.4' },
    ],
    stock: 15,
    rating: 4.7,
    reviews: 89,
    badge: 'Popular',
  },
  {
    id: '3',
    name: 'Teclado Mecánico Keychron K8',
    description: 'Teclado mecánico TKL inalámbrico con switches Cherry MX y retroiluminación RGB.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    ],
    category: 'teclados',
    specs: [
      { label: 'Switches', value: 'Cherry MX Red' },
      { label: 'Layout', value: 'TKL (87 teclas)' },
      { label: 'Conexión', value: 'Bluetooth 5.1 / USB-C' },
      { label: 'Batería', value: '4000mAh' },
      { label: 'Retroiluminación', value: 'RGB per-key' },
      { label: 'Compatibilidad', value: 'Win / Mac / Linux' },
    ],
    stock: 32,
    rating: 4.8,
    reviews: 256,
    badge: 'Popular',
  },
  {
    id: '4',
    name: 'Mouse Logitech G Pro X Superlight 2',
    description: 'Mouse gaming ultraligero de 60g con sensor HERO 2 de 32000 DPI para máximo rendimiento competitivo.',
    price: 159,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    ],
    category: 'mouse',
    specs: [
      { label: 'Sensor', value: 'HERO 2 32000 DPI' },
      { label: 'Peso', value: '60g' },
      { label: 'Conexión', value: 'LIGHTSPEED Wireless' },
      { label: 'Batería', value: '70 horas' },
      { label: 'Polling Rate', value: '2000Hz' },
      { label: 'Botones', value: '5 programables' },
    ],
    stock: 22,
    rating: 4.9,
    reviews: 412,
    badge: 'Nuevo',
  },
  {
    id: '5',
    name: 'Headset HyperX Cloud Alpha',
    description: 'Auriculares gaming con drivers duales de cámara y sonido 3D espacial para una experiencia inmersiva.',
    price: 99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    category: 'headsets',
    specs: [
      { label: 'Drivers', value: '50mm Dual Chamber' },
      { label: 'Respuesta Frec.', value: '13Hz – 27,000Hz' },
      { label: 'Micrófono', value: 'Desmontable, Noise Cancel' },
      { label: 'Conexión', value: '3.5mm / USB dongle' },
      { label: 'Peso', value: '336g' },
      { label: 'Compatibilidad', value: 'PC, PS5, Xbox, Switch' },
    ],
    stock: 18,
    rating: 4.6,
    reviews: 341,
  },
  {
    id: '6',
    name: 'SSD Samsung 990 Pro 2TB',
    description: 'SSD NVMe PCIe 4.0 con velocidades de lectura de hasta 7450 MB/s para cargas de trabajo intensivas.',
    price: 189,
    originalPrice: 229,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    ],
    category: 'almacenamiento',
    specs: [
      { label: 'Capacidad', value: '2TB' },
      { label: 'Interfaz', value: 'PCIe 4.0 NVMe' },
      { label: 'Lectura Seq.', value: '7,450 MB/s' },
      { label: 'Escritura Seq.', value: '6,900 MB/s' },
      { label: 'Factor de Forma', value: 'M.2 2280' },
      { label: 'Garantía', value: '5 años' },
    ],
    stock: 45,
    rating: 4.8,
    reviews: 198,
    badge: 'Oferta',
  },
  {
    id: '7',
    name: 'PC Mini ITX AMD Ryzen 9',
    description: 'PC compacta de alto rendimiento con Ryzen 9 7950X en factor de forma Mini ITX.',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&q=80',
    ],
    category: 'pcs',
    specs: [
      { label: 'CPU', value: 'AMD Ryzen 9 7950X' },
      { label: 'GPU', value: 'RX 7900 XTX 24GB' },
      { label: 'RAM', value: '64GB DDR5 6000MHz' },
      { label: 'Almacenamiento', value: '1TB NVMe SSD' },
      { label: 'Factor', value: 'Mini ITX' },
      { label: 'SO', value: 'Windows 11 Pro' },
    ],
    stock: 5,
    rating: 4.7,
    reviews: 67,
    badge: 'Nuevo',
  },
  {
    id: '8',
    name: 'Monitor Samsung Odyssey G7 27"',
    description: 'Monitor gaming curvo 1000R con 240Hz, QHD y tecnología QLED para colores vibrantes.',
    price: 529,
    image: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800&q=80',
    ],
    category: 'monitores',
    specs: [
      { label: 'Tamaño', value: '27 pulgadas' },
      { label: 'Resolución', value: '2560x1440 QHD' },
      { label: 'Panel', value: 'VA Curvo 1000R QLED' },
      { label: 'Frecuencia', value: '240Hz' },
      { label: 'Tiempo Resp.', value: '1ms' },
      { label: 'HDR', value: 'HDR600' },
    ],
    stock: 11,
    rating: 4.8,
    reviews: 145,
  },
  {
    id: '9',
    name: 'Teclado Corsair K100 RGB',
    description: 'Teclado mecánico full-size con switches OPX óptico-mecánicos y rueda de control multimedia.',
    price: 229,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    ],
    category: 'teclados',
    specs: [
      { label: 'Switches', value: 'CORSAIR OPX Óptico' },
      { label: 'Layout', value: 'Full-size (110 teclas)' },
      { label: 'Actuation', value: '1mm' },
      { label: 'Retroiluminación', value: 'RGB per-key 44 zonas' },
      { label: 'Memoria', value: '8MB onboard' },
      { label: 'Cable', value: 'Trenzado USB-C' },
    ],
    stock: 20,
    rating: 4.7,
    reviews: 178,
  },
  {
    id: '10',
    name: 'Mouse Razer DeathAdder V3 Pro',
    description: 'Mouse ergonómico inalámbrico con sensor Focus Pro 30000 DPI y autonomía de 90 horas.',
    price: 139,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    ],
    category: 'mouse',
    specs: [
      { label: 'Sensor', value: 'Focus Pro 30000 DPI' },
      { label: 'Peso', value: '64g' },
      { label: 'Conexión', value: 'HyperSpeed Wireless' },
      { label: 'Batería', value: '90 horas' },
      { label: 'Polling Rate', value: '1000Hz' },
      { label: 'Botones', value: '8 programables' },
    ],
    stock: 28,
    rating: 4.6,
    reviews: 287,
  },
  {
    id: '11',
    name: 'Headset SteelSeries Arctis Nova Pro',
    description: 'Headset premium inalámbrico con cancelación activa de ruido y sistema de doble batería.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    ],
    category: 'headsets',
    specs: [
      { label: 'Tipo', value: 'Circumaural cerrado' },
      { label: 'ANC', value: 'Active Noise Cancellation' },
      { label: 'Batería', value: 'Dual battery hot-swap' },
      { label: 'Autonomía', value: '22h por batería' },
      { label: 'Micrófono', value: 'Retráctil ClearCast Gen2' },
      { label: 'Compatibilidad', value: 'PC, PS5, Switch' },
    ],
    stock: 9,
    rating: 4.8,
    reviews: 156,
    badge: 'Nuevo',
  },
  {
    id: '12',
    name: 'SSD WD Black SN850X 1TB',
    description: 'SSD gaming NVMe con velocidades extremas y tecnología Game Mode 2.0 optimizada para gaming.',
    price: 119,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    category: 'almacenamiento',
    specs: [
      { label: 'Capacidad', value: '1TB' },
      { label: 'Interfaz', value: 'PCIe 4.0 NVMe' },
      { label: 'Lectura Seq.', value: '7,300 MB/s' },
      { label: 'Escritura Seq.', value: '6,600 MB/s' },
      { label: 'Factor de Forma', value: 'M.2 2280' },
      { label: 'Garantía', value: '5 años' },
    ],
    stock: 38,
    rating: 4.7,
    reviews: 223,
  },
]

/**
 * Busca un producto por su ID en el conjunto de datos de demostración.
 *
 * @param id - Identificador string del producto (ej. `"1"`, `"6"`)
 * @returns El producto encontrado, o `undefined` si ninguno coincide con el ID
 *
 * @example
 * const product = getProductById("3")  // → Keychron K8
 * const missing = getProductById("99") // → undefined
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

/**
 * Retorna todos los productos de una categoría dada.
 * Si `category` es `"all"`, retorna el array completo sin filtrar.
 *
 * @param category - Categoría a filtrar. Debe ser un valor válido del tipo `Category`.
 * @returns Array de productos que pertenecen a la categoría. Vacío si ninguno coincide.
 *
 * @example
 * getProductsByCategory("gpus")       // → productos con category === "gpus"
 * getProductsByCategory("all")        // → los 12 productos sin filtrar
 * getProductsByCategory("memorias")   // → [] (sin datos en mock actual)
 */
export function getProductsByCategory(category: Category): Product[] {
  if (category === 'all') return products
  return products.filter((p) => p.category === category)
}
