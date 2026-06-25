import { LoginSchema, RefreshTokenSchema } from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export class LoginDto extends createZodDto(LoginSchema) {}
export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
