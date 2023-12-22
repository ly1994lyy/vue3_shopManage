import { get, update, del, post } from '@/utils/http'

export const getRoles = () => {
  return get('roles', '')
}

export const getRights = () => {
  return get('rights/tree', '')
}

export const getRightsApi = () => {
  return get('rights/list', '')
}

export const deleteRole = (id, rightId) => {
  return del(`roles/${id}/rights/${rightId}`)
}

export const setRole = (id, data) => {
  return post(`roles/${id}/rights`, data)
}
