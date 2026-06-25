import { CreateUserSchema } from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
