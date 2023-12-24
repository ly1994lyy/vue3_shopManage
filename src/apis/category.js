import { get, update, del, post } from '@/utils/http'

export const getCategories = (data) => {
  return get('categories', data)
}

export const deleteCategory = (id) => {
  return del(`categories/${id}`)
}

export const addCategoryApi = (data) => {
  return post('categories', data)
}

export const getCategory = (id) => {
  return get(`/categories/${id}`, '')
}

export const getCategoryParams = (id, params) => {
  return get(`categories/${id}/attributes`, params)
}

export const updateCategoryParams = (cateId, attrId, params) => {
  return update(`categories/${cateId}/attributes/${attrId}`, params)
}

export const updateCategoryApi = (id, data) => {
  return update(`/categories/${id}`, data)
}
