import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { Logger as PinoLogger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  // 把 Nest 默认 logger 替换为 nestjs-pino
  app.useLogger(app.get(PinoLogger))

  app.setGlobalPrefix('api')
  app.enableCors({ origin: true, credentials: true })
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())

  // 全局 Zod 校验管道：所有 DTO 统一由 @shop-saas/schemas 中的 Zod schema 驱动
  app.useGlobalPipes(new ZodValidationPipe())

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shop SaaS API')
    .setDescription('Full-stack multi-tenant commerce SaaS API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(Number(process.env.PORT) || 3000)
}

bootstrap()
