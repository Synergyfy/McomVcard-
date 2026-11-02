import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccessPass } from './entities/access-pass.entity'
import { AccessPassPurchase } from './entities/access-pass-purchase.entity'
import { User } from '../users/entities/user.entity'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { AccessPassesService } from './access-passes.service'
import { AdminAccessPassesController } from './admin-access-passes.controller'
import { AccessPassesController } from './access-passes.controller'
import { SystemAccessPassesController } from './system-access-passes.controller'
import { SystemApiKeyGuard } from '../system-plans/system-api-key.guard'

@Module({
  imports: [TypeOrmModule.forFeature([AccessPass, AccessPassPurchase, User, SubscribedPlan])],
  controllers: [
    AdminAccessPassesController,
    AccessPassesController,
    SystemAccessPassesController,
  ],
  providers: [AccessPassesService, SystemApiKeyGuard],
  exports: [AccessPassesService],
})
export class AccessPassesModule {}
