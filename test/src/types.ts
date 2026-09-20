export const PRODUCT_CATEGORIES = [
  'electronics',
  'clothing',
  'home',
  'other',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export type Product = {
  name: string
  price: number
  sku: string
  category: ProductCategory
  imageUrl: string
  desc: string
  rating: number
  reviewCount: number
  createdAt: unknown
}

export type ProductFormValues = {
  name: string
  price: number
  sku: string
  category: ProductCategory
  imageUrl: string
  desc: string
  rating: number
  reviewCount: number
}
