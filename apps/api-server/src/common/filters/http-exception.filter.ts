import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import type { ZodIssue } from 'zod'
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware'

function resolveErrorCode(status: number) {
  if (status === HttpStatus.UNAUTHORIZED) return 40001
  if (status === HttpStatus.FORBIDDEN) return 40003
  if (status === HttpStatus.NOT_FOUND) return 40004
  if (status === HttpStatus.CONFLICT) return 40009
  if (status >= 500) return 50000
  return 40000
}

interface ZodLikeError {
  issues: ZodIssue[]
}

function isZodLikeError(error: unknown): error is ZodLikeError {
  return Boolean(
    error && typeof error === 'object' && 'issues' in error && Array.isArray((error as ZodLikeError).issues)
  )
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const requestId = request.headers[REQUEST_ID_HEADER]?.toString() || 'unknown'

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let message = '系统内部错误'

    // Zod 校验错误：取每条 issue 的 message
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError()

      if (isZodLikeError(zodError)) {
        message = zodError.issues
          .map((issue) => {
            const path = issue.path.join('.')
            return path ? `${path}: ${issue.message}` : issue.message
          })
          .join('; ')
      } else {
        message = '参数校验失败'
      }
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse()
      message =
        typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse
          ? Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message.join('; ')
            : String(exceptionResponse.message)
          : String(exceptionResponse)
    } else if (exception instanceof Error) {
      message = exception.message
    }

    // 5xx 打完整堆栈，4xx 只 warn 一行
    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.originalUrl || request.url} → ${status} ${message}`,
        exception instanceof Error ? exception.stack : String(exception)
      )
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.originalUrl || request.url} → ${status} ${message}`
      )
    }

    response.status(status).json({
      code: resolveErrorCode(status),
      message,
      data: null,
      requestId
    })
  }
}
