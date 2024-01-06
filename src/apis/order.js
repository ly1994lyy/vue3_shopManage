import { get, update, del, post } from '@/utils/http'

export const getOrders = (data) => {
  return get('orders', data)
}

export const getProgressInfoApi = () => {
  return get('/kuaidi/JT5241813716835')
}
