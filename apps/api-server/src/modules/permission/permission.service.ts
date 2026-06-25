import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.permission.findMany({
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }]
    })
  }
}
