import { Injectable } from '@nestjs/common'
import { Prisma, UserType } from '@prisma/client'
import type { RequestUser } from '../../common/types/request-user'
import { PrismaService } from '../../database/prisma.service'
import type { QueryLoginLogsDto, QueryOperationLogsDto } from './dto/audit-log.dto'

@Injectable()
export class AuditLogQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOperationLogs(query: QueryOperationLogsDto, user: RequestUser) {
    const where: Prisma.OperationLogWhereInput = {
      ...(query.module ? { module: query.module } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.result ? { result: query.result } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.account ? { account: { contains: query.account } } : {}),
      ...(query.keyword
        ? {
            OR: [
              { account: { contains: query.keyword } },
              { path: { contains: query.keyword } },
              { message: { contains: query.keyword } }
            ]
          }
        : {}),
      ...(query.startDate || query.endDate
        ? {
            createdAt: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {})
            }
          }
        : {}),
      // 租户用户只能看自己租户的；平台管理员看全局
      ...(user.type === UserType.tenant ? { tenantId: user.tenantId || undefined } : {})
    }

    const [list, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.prisma.operationLog.count({ where })
    ])

    return {
      list,
      pagination: { page: query.page, pageSize: query.pageSize, total }
    }
  }

  async findLoginLogs(query: QueryLoginLogsDto, user: RequestUser) {
    const where: Prisma.LoginLogWhereInput = {
      ...(query.account ? { account: { contains: query.account } } : {}),
      ...(query.result ? { result: query.result } : {}),
      ...(query.startDate || query.endDate
        ? {
            createdAt: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {})
            }
          }
        : {}),
      ...(user.type === UserType.tenant ? { tenantId: user.tenantId || undefined } : {})
    }

    const [list, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.prisma.loginLog.count({ where })
    ])

    return {
      list,
      pagination: { page: query.page, pageSize: query.pageSize, total }
    }
  }

  async findOperationStats(user: RequestUser) {
    const where: Prisma.OperationLogWhereInput =
      user.type === UserType.tenant ? { tenantId: user.tenantId || undefined } : {}

    const [total, failures, last24h] = await Promise.all([
      this.prisma.operationLog.count({ where }),
      this.prisma.operationLog.count({ where: { ...where, result: 'failure' } }),
      this.prisma.operationLog.count({
        where: { ...where, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      })
    ])

    return { total, failures, last24h }
  }
}
