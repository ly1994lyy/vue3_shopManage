import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, getTenantContext, setAccessToken, setRefreshToken } from '@shop-saas/auth'
import type { ApiResponse } from '@shop-saas/types'

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly requestId?: string,
    public readonly status?: number
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

/**
 * 当后端返回 401 / refresh 失败时被调用。
 * admin-web 在启动时注入跳转登录页的实现。
 */
export type UnauthorizedHandler = (error: ApiClientError) => void

let unauthorizedHandler: UnauthorizedHandler | null = null
let unauthorizedFired = false

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
}

function fireUnauthorized(error: ApiClientError) {
  if (unauthorizedFired) return
  unauthorizedFired = true
  setTimeout(() => {
    unauthorizedFired = false
  }, 1500)
  unauthorizedHandler?.(error)
}

/**
 * 当 refresh 成功换发了新的 user 资料时，admin-web 可注入这个回调
 * 用来同步 store / permission（可选；不注入也能用）。
 */
export type SessionRefreshedHandler = (user: unknown) => void
let sessionRefreshedHandler: SessionRefreshedHandler | null = null
export function setSessionRefreshedHandler(handler: SessionRefreshedHandler | null) {
  sessionRefreshedHandler = handler
}

/** 内部：标记某次请求是已经尝试过 refresh 的重放，避免死循环 */
interface RetriableConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean
  /** refresh 请求自身的标记 —— 不走 401 重试 */
  _skipAuthRefresh?: boolean
}

/** 进行中的 refresh 请求（去抖：多个 401 并发只跑一次） */
let refreshPromise: Promise<string> | null = null

/**
 * 实际调用 refresh 接口。返回新的 accessToken。
 * 失败抛错（调用方负责清状态）。
 */
async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  // 不用 http 实例直接发，避免被 request 拦截器再贴 Authorization 头
  // 也不会被 response 拦截器递归触发 refresh
  const baseURL = http.defaults.baseURL || '/api'
  const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string; user: unknown }>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  )

  const data = res.data?.data
  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error('Refresh response invalid')
  }

  setAccessToken(data.accessToken)
  setRefreshToken(data.refreshToken)
  if (sessionRefreshedHandler) {
    try {
      sessionRefreshedHandler(data.user)
    } catch {
      // 不让回调炸断 refresh 流程
    }
  }

  return data.accessToken
}

function getOrStartRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      // 下一拍清掉，让后续 401 可以再次发起 refresh
      refreshPromise = null
    })
  }
  return refreshPromise
}

export function createHttpClient(baseURL = '/api') {
  const httpInstance = axios.create({
    baseURL,
    timeout: 15000
  })

  httpInstance.interceptors.request.use((config: RetriableConfig) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const tenantId = getTenantContext()

    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId
    }

    return config
  })

  httpInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse<null>>) => {
      if (!axios.isAxiosError(error)) {
        throw error
      }

      const data = error.response?.data
      const status = error.response?.status
      const apiError = new ApiClientError(
        data?.message || error.message,
        data?.code,
        data?.requestId,
        status
      )
      const requestConfig = error.config as RetriableConfig | undefined

      // 401 且确实是已登录会话 + 还没重试过 + 不是 refresh 自己
      const canTryRefresh =
        status === 401 &&
        getAccessToken() &&
        requestConfig &&
        !requestConfig._isRetry &&
        !requestConfig._skipAuthRefresh

      if (canTryRefresh) {
        try {
          const newToken = await getOrStartRefresh()
          // 重放原请求：标记一下，把新 token 贴上去
          requestConfig._isRetry = true
          requestConfig.headers = requestConfig.headers || {}
          requestConfig.headers.Authorization = `Bearer ${newToken}`
          return httpInstance(requestConfig) as Promise<AxiosResponse>
        } catch {
          // refresh 失败 → 走清登录流程
          clearTokens()
          fireUnauthorized(apiError)
          throw apiError
        }
      }

      // 走到这里：要么不是 401，要么是已登录但 refresh 已经放弃过，要么是 refresh 本身报错
      if (status === 401 && getAccessToken()) {
        clearTokens()
        fireUnauthorized(apiError)
      }

      throw apiError
    }
  )

  return httpInstance
}

export const http = createHttpClient()

export async function get<T>(url: string, params?: unknown) {
  const response = await http.get<ApiResponse<T>>(url, { params })
  return response.data
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  const response = await http.post<ApiResponse<T>>(url, data, config)
  return response.data
}

export async function patch<T>(url: string, data?: unknown) {
  const response = await http.patch<ApiResponse<T>>(url, data)
  return response.data
}

export async function del<T>(url: string) {
  const response = await http.delete<ApiResponse<T>>(url)
  return response.data
}
