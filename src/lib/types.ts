export type Category = 'all' | 'pcs' | 'monitores' | 'teclados' | 'mouse' | 'headsets' | 'almacenamiento' | 'procesadores' | 'memorias' | 'gpus'

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: Exclude<Category, 'all'>
  specs: ProductSpec[]
  stock: number
  rating: number
  reviews: number
  badge?: 'Nuevo' | 'Oferta' | 'Popular'
  bookmarked?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
