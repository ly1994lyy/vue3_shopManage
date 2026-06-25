import {
  AssignUserRolesSchema,
  QueryUsersSchema,
  ResetUserPasswordSchema,
  UpdateUserSchema
} from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class QueryUserDto extends createZodDto(QueryUsersSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class AssignUserRolesDto extends createZodDto(AssignUserRolesSchema) {}
export class ResetUserPasswordDto extends createZodDto(ResetUserPasswordSchema) {}
