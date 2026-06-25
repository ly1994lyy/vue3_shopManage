import { CreateTenantSchema, InitTenantAdminSchema } from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class CreateTenantDto extends createZodDto(CreateTenantSchema) {}
export class InitTenantAdminDto extends createZodDto(InitTenantAdminSchema) {}
