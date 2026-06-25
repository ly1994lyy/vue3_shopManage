import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { AuditLogInterceptor } from './common/audit/audit-log.interceptor'
import { AuditModule } from './common/audit/audit.module'
import { AuthGuard } from './common/guards/auth.guard'
import { PermissionGuard } from './common/guards/permission.guard'
import { AppLoggerModule } from './common/logger/app-logger.module'
import { RequestIdMiddleware } from './common/middleware/request-id.middleware'
import { SecurityModule } from './common/security/security.module'
import { DatabaseModule } from './database/database.module'
import { AuditLogModule } from './modules/audit-log/audit-log.module'
import { AuthModule } from './modules/auth/auth.module'
import { HealthModule } from './modules/health/health.module'
import { PermissionModule } from './modules/permission/permission.module'
import { ProductModule } from './modules/product/product.module'
import { OrderModule } from './modules/order/order.module'
import { RoleModule } from './modules/role/role.module'
import { TenantModule } from './modules/tenant/tenant.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppLoggerModule,
    AuditModule,
    ScheduleModule.forRoot(),
    SecurityModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    TenantModule,
    UserModule,
    ProductModule,
    OrderModule,
    AuditLogModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*')
  }
}
