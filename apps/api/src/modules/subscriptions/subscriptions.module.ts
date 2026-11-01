import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscribedPlan } from './entities/subscribed-plan.entity'
import { User } from '../users/entities/user.entity'
import { SubscriptionsService } from './subscriptions.service'

@Module({
  imports: [TypeOrmModule.forFeature([SubscribedPlan, User])],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
