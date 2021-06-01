import { get, update, del } from '@/utils/http'
import { AxiosPromise } from 'axios'

export const getUsers = (data:any) :AxiosPromise => {
  return get('users', data)
}

export const updateUserState = (id:string, mg_state:string) :AxiosPromise => {
  return update(`/users/${id}/state/${mg_state}`, '')
}

export const deleteUser = (id:string) :AxiosPromise => {
  return del(`users/${id}`)
}
