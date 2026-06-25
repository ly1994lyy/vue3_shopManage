import { randomUUID } from 'node:crypto'
import { Injectable, NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

export const REQUEST_ID_HEADER = 'x-request-id'

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers[REQUEST_ID_HEADER]?.toString() || randomUUID()

    req.headers[REQUEST_ID_HEADER] = requestId
    res.setHeader(REQUEST_ID_HEADER, requestId)
    next()
  }
}
