import { Module } from '@nestjs/common'
import { PlansModule } from '../plans/plans.module'
import { SystemPlansController } from './system-plans.controller'
import { SystemPlansService } from './system-plans.service'
import { SystemApiKeyGuard } from './system-api-key.guard'

@Module({
  imports: [PlansModule],
  controllers: [SystemPlansController],
  providers: [SystemPlansService, SystemApiKeyGuard],
})
export class SystemPlansModule {}