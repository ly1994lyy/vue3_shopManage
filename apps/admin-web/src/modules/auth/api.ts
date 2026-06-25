import { get, post } from '@shop-saas/api-client'
import type { LoginResult, UserProfile } from '@shop-saas/types'

export interface LoginPayload {
  account: string
  password: string
}

export function loginApi(payload: LoginPayload) {
  return post<LoginResult>('/auth/login', payload)
}

export function getProfileApi() {
  return get<UserProfile>('/auth/profile')
}
