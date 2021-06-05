import { get, update, del, post } from '@/utils/http'
import { AxiosPromise } from 'axios'

export const getRoles = () :AxiosPromise => {
  return get('roles', '')
}

export const getRights = () :AxiosPromise => {
  return get('rights/tree', '')
}

export const getRightsApi = () :AxiosPromise => {
  return get('rights/list', '')
}
//
// export const updateUserState = (id:string, mg_state:string) :AxiosPromise => {
//   return update(`/users/${id}/state/${mg_state}`, '')
// }
//
export const deleteRole = (id:string, rightId:string) :AxiosPromise => {
  return del(`roles/${id}/rights/${rightId}`)
}
//
// export const addUserApi = (data:IUser) :AxiosPromise => {
//   return post('users', data)
// }
//
// export const getUser = (id:string) :AxiosPromise => {
//   return get(`/users/${id}`, '')
// }
//
// export const updateUserApi = (id:string, data:IUser) :AxiosPromise => {
//   return update(`/users/${id}`, data)
// }
//
// export const getRoles = () :AxiosPromise => {
//   return get('roles', '')
// }
//

export const setRole = (id:string, data:any) :AxiosPromise => {
  return post(`roles/${id}/rights`, data)
}
