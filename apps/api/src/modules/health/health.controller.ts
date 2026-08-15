import { Controller, Get } from '@nestjs/common'

@Controller()
export class HealthController {
  @Get()
  ping(): string {
    return 'API IS UP AND RUNNING'
  }
}
