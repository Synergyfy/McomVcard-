import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscribedPlan } from './entities/subscribed-plan.entity'
import { SubscriptionsService } from './subscriptions.service'

@Module({
  imports: [TypeOrmModule.forFeature([SubscribedPlan])],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
