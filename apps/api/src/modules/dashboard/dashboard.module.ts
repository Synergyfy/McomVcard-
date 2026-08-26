import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { Business } from '../businesses/entities/business.entity'
import { Share } from '../shares/entities/share.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { Review } from '../reviews/entities/review.entity'
import { Card } from '../cards/entities/card.entity'
import { Membership } from '../memberships/entities/membership.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Business,
      Share,
      WalletTransaction,
      RewardTransaction,
      Appointment,
      Campaign,
      Review,
      Card,
      Membership,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
