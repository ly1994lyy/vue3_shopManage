import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})

http.interceptors.request.use(config => {
  if (sessionStorage.getItem('token')) {
    config.headers.authorization = sessionStorage.getItem('token')
  }
  return config
}, error => {
  return Promise.reject(error)
})

http.interceptors.response.use(res => {
  const { data } = res
  if (data.meta.status !== 200 && data.meta.status !== 201) {
    ElMessage({
      showClose: true,
      message: data.meta.msg,
      type: 'error'
    })
  }
  return res
}, error => {
  return Promise.reject(error)
})

export const get = (url, params) => {
  return http.get(url, { params })
}

export const post = (url, data) => {
  return http.post(url, data)
}

export const update = (url, data) => {
  return http.put(url, data)
}

export const del = (url) => {
  return http.delete(url)
}
