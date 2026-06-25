import type { Request } from 'express'
import type { RequestUser } from './request-user'

export interface AuthRequest extends Request {
  user: RequestUser
}
