import { del, get, patch, post } from '@shop-saas/api-client'
import type { PageResult } from '@shop-saas/types'

export type ProductStatus = 'draft' | 'on_sale' | 'off_sale' | 'archived'

export interface ProductCategoryItem {
  id: string
  tenantId: string
  parentId?: string | null
  name: string
  sort: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface ProductItem {
  id: string
  tenantId: string
  categoryId?: string | null
  brandId?: string | null
  name: string
  code: string
  brief?: string | null
  description?: string | null
  price: string | number
  costPrice?: string | number | null
  weight?: string | number | null
  stock: number
  cover?: string | null
  images?: string[] | null
  tags?: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
  category?: ProductCategoryItem | null
}

export interface QueryProductsParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: ProductStatus
  categoryId?: string
}

export interface CreateProductPayload {
  name: string
  code: string
  categoryId?: string
  brief?: string
  description?: string
  price?: number
  costPrice?: number
  weight?: number
  stock?: number
  cover?: string
  images?: string[]
  status?: ProductStatus
}

export interface UpdateProductPayload {
  name?: string
  categoryId?: string
  brief?: string
  description?: string
  price?: number
  costPrice?: number
  weight?: number
  stock?: number
  cover?: string
  images?: string[]
  status?: ProductStatus
}

export interface CreateCategoryPayload {
  name: string
  parentId?: string
  sort?: number
}

export interface UpdateCategoryPayload {
  name?: string
  parentId?: string
  sort?: number
  status?: 'active' | 'disabled'
}

export function getProductCategoriesApi() {
  return get<ProductCategoryItem[]>('/products/categories')
}

export function createProductCategoryApi(payload: CreateCategoryPayload) {
  return post<ProductCategoryItem>('/products/categories', payload)
}

export function updateProductCategoryApi(id: string, payload: UpdateCategoryPayload) {
  return patch<ProductCategoryItem>(`/products/categories/${id}`, payload)
}

export function deleteProductCategoryApi(id: string) {
  return del<{ success: boolean }>(`/products/categories/${id}`)
}

export function getProductsApi(params: QueryProductsParams) {
  return get<PageResult<ProductItem>>('/products', params)
}

export function createProductApi(payload: CreateProductPayload) {
  return post<ProductItem>('/products', payload)
}

export function updateProductApi(id: string, payload: UpdateProductPayload) {
  return patch<ProductItem>(`/products/${id}`, payload)
}

export function deleteProductApi(id: string) {
  return del<{ success: boolean }>(`/products/${id}`)
}
