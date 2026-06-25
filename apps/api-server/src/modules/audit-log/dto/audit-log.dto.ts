import { QueryLoginLogsSchema, QueryOperationLogsSchema } from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class QueryOperationLogsDto extends createZodDto(QueryOperationLogsSchema) {}
export class QueryLoginLogsDto extends createZodDto(QueryLoginLogsSchema) {}
