import axios, { AxiosPromise, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const http:AxiosInstance = axios.create({
  baseURL: 'https://www.liulongbin.top:8888/api/private/v1/'
})

http.interceptors.request.use((config:AxiosRequestConfig) => {
  if (sessionStorage.getItem('token')) {
    config.headers.authorization = sessionStorage.getItem('token')
  }
  return config
}, (error:AxiosError) => {
  return Promise.reject(error)
})

http.interceptors.response.use((res:AxiosResponse) => {
  const { data } = res
  if (data.meta.status !== 200 && data.meta.status !== 201) {
    ElMessage({
      showClose: true,
      message: data.meta.msg,
      type: 'error'
    })
  }
  return res
}, (error:AxiosError) => {
  return Promise.reject(error)
})

export const get = (url:string, params:any):AxiosPromise => {
  return http.get(url, { params })
}

export const post = (url:string, data:any):AxiosPromise => {
  return http.post(url, data)
}

export const update = (url:string, data:any):AxiosPromise => {
  return http.put(url, data)
}

export const del = (url:string):AxiosPromise => {
  return http.delete(url)
}
