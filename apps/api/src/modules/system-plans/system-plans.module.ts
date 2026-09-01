import { Module } from '@nestjs/common'
import { PlansModule } from '../plans/plans.module'
import { SeasonsModule } from '../seasons/seasons.module'
import { SystemPlansController } from './system-plans.controller'
import { SystemPlansService } from './system-plans.service'
import { SystemApiKeyGuard } from './system-api-key.guard'
import { SystemSeasonsController } from './system-seasons.controller'

@Module({
  imports: [PlansModule, SeasonsModule],
  controllers: [SystemPlansController, SystemSeasonsController],
  providers: [SystemPlansService, SystemApiKeyGuard],
})
export class SystemPlansModule {}