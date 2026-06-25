import {
  AssignRolePermissionsSchema,
  CreateRoleSchema,
  UpdateRoleSchema
} from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
export class AssignRolePermissionsDto extends createZodDto(AssignRolePermissionsSchema) {}
