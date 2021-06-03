import { get, update, del, post } from '@/utils/http'
import { AxiosPromise } from 'axios'
import { IUser } from '@/utils/userValidate'

export const getUsers = (data:any) :AxiosPromise => {
  return get('users', data)
}

export const updateUserState = (id:string, mg_state:string) :AxiosPromise => {
  return update(`/users/${id}/state/${mg_state}`, '')
}

export const deleteUser = (id:string) :AxiosPromise => {
  return del(`users/${id}`)
}

export const addUserApi = (data:IUser) :AxiosPromise => {
  return post('users', data)
}

export const getUser = (id:string) :AxiosPromise => {
  return get(`/users/${id}`, '')
}

export const updateUserApi = (id:string, data:IUser) :AxiosPromise => {
  return update(`/users/${id}`, data)
}

export const getRoles = () :AxiosPromise => {
  return get('roles', '')
}

interface IRole{
  rid:string
}

export const setRole = (id:string, data:IRole) :AxiosPromise => {
  return update(`users/${id}/role`, data)
}
