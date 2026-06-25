import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  check() {
    return {
      status: 'ok',
      service: 'shop-saas-api',
      version: '0.1.0'
    }
  }
}
