import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Plan } from '../plans/entities/plan.entity'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { AccessPass } from '../access-passes/entities/access-pass.entity'
import { AccessPassPurchase } from '../access-passes/entities/access-pass-purchase.entity'
import { User } from '../users/entities/user.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { CapabilitiesService } from './capabilities.service'
import { CapabilitiesController } from './capabilities.controller'
import { CapabilityGuard } from './capability.guard'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      SubscribedPlan,
      AccessPass,
      AccessPassPurchase,
      User,
      Membership,
    ]),
  ],
  controllers: [CapabilitiesController],
  providers: [CapabilitiesService, CapabilityGuard],
  exports: [CapabilitiesService, CapabilityGuard],
})
export class CapabilitiesModule {}
