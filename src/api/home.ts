import { get } from '@/utils/http'
import { AxiosPromise } from 'axios'

export const getMenu = (data:any) :AxiosPromise => {
  return get('/menus', data)
}
