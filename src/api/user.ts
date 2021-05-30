import { get } from '@/utils/http'
import { AxiosPromise } from 'axios'

export const getUsers = (data:any) :AxiosPromise => {
  return get('users', data)
}
