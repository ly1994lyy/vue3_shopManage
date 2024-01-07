import { get, update, del, post } from '@/utils/http'

export const getUsers = (data) => {
  return get('users', data)
}

export const updateUserState = (id, mgState) => {
  return update(`/users/${id}/state/${mgState}`, '')
}

export const deleteUser = (id) => {
  return del(`users/${id}`)
}

export const addUserApi = (data) => {
  return post('users', data)
}

export const getUser = (id) => {
  return get(`/users/${id}`, '')
}

export const updateUserApi = (id, data) => {
  return update(`/users/${id}`, data)
}

export const setRole = (id, data) => {
  return update(`users/${id}/role`, data)
}
