import { get, update, del, post } from '@/utils/http'

export const getGoods = (data) => {
  return get('goods', data)
}

export const updateUserState = (id, mgState) => {
  return update(`/goods/${id}/state/${mgState}`, '')
}

export const deleteGood = (id) => {
  return del(`goods/${id}`)
}

export const addGoodApi = (data) => {
  return post('goods', data)
}

export const getGood = (id) => {
  return get(`/goods/${id}`, '')
}

export const updateGoodApi = (id, data) => {
  return update(`/goods/${id}`, data)
}
