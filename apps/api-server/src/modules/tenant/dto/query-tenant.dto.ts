import { QueryTenantsSchema } from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class QueryTenantDto extends createZodDto(QueryTenantsSchema) {}
