import { Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import type { IncomingMessage } from 'node:http'
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware'

const isProd = process.env.NODE_ENV === 'production'

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
        // 生产环境用 JSON；开发环境走 pino-pretty 便于阅读
        transport: isProd
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                ignore: 'pid,hostname,req,res,responseTime'
              }
            },
        // 复用 request-id 中间件已经塞进去的 id，避免每个请求又生成一次
        genReqId: (req: IncomingMessage) => {
          const headers = req.headers || {}
          const existed = headers[REQUEST_ID_HEADER]
          if (typeof existed === 'string' && existed) return existed
          // 极少数情况：req 在中间件之前 —— 回退到 pino-http 自己的实现
          return undefined as unknown as string
        },
        customLogLevel: (_req, res, err) => {
          if (err) return 'error'
          if (res.statusCode >= 500) return 'error'
          if (res.statusCode >= 400) return 'warn'
          return 'info'
        },
        // 简化默认日志体，避免每条日志都把整个 req 对象打出来
        serializers: {
          req: (req: { id?: string; method?: string; url?: string }) => ({
            id: req.id,
            method: req.method,
            url: req.url
          }),
          res: (res: { statusCode?: number }) => ({ statusCode: res.statusCode })
        },
        // 健康检查、静态资源等不打访问日志
        autoLogging: {
          ignore: (req) => req.url === '/api/health' || req.url?.startsWith('/api/docs') === true
        }
      }
    })
  ]
})
export class AppLoggerModule {}
