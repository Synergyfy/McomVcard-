import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus'

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  liveness() {
    return { status: 'ok', service: 'mcom-api' }
  }

  @Get('health')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.db.pingCheck('database')])
  }
}