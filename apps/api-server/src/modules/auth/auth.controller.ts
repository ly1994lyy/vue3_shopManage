import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { REQUEST_ID_HEADER } from '../../common/middleware/request-id.middleware'
import type { JwtPayload } from '../../common/types/jwt-payload'
import { AuthService } from './auth.service'
import { LoginDto, RefreshTokenDto } from './dto/login.dto'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: '登录' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, {
      ip: this.resolveIp(req),
      userAgent: req.headers['user-agent']?.toString() || null,
      requestId: req.headers[REQUEST_ID_HEADER]?.toString() || null
    })
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  logout() {
    return { success: true }
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: '刷新 Token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Get('profile')
  @ApiOperation({ summary: '当前用户资料' })
  profile(@CurrentUser() user: JwtPayload) {
    return this.authService.profile(user)
  }

  private resolveIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0]?.trim() || null
    return req.ip || req.socket.remoteAddress || null
  }
}
