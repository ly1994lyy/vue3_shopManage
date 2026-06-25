import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [JwtModule.register({})],
  exports: [JwtModule]
})
export class SecurityModule {}
