import { RenewTenantSchema, UpdateTenantSchema } from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class UpdateTenantDto extends createZodDto(UpdateTenantSchema) {}
export class RenewTenantDto extends createZodDto(RenewTenantSchema) {}
