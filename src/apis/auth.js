import { post, get } from '@/utils/http'

export const loginApi = (data) => {
  return post('/login', data)
}

export const getMenu = (data) => {
  return get('/menus', data)
}
