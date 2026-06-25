import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request } from 'express'
import { map, type Observable } from 'rxjs'
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>()
    const requestId = request.headers[REQUEST_ID_HEADER]?.toString() || 'unknown'

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
        requestId
      }))
    )
  }
}
