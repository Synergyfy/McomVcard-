import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { PlansModule } from '../plans/plans.module'
import { McomModule } from '../mcom/mcom.module'
import { MailModule } from '../mail/mail.module'
import { Card } from '../cards/entities/card.entity'
import { Template } from '../cards/entities/template.entity'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { Wallet } from '../finance/entities/wallet.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardBalance } from '../finance/entities/reward-balance.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { CashbackAccount } from '../finance/entities/cashback-account.entity'
import { Voucher } from '../vouchers/entities/voucher.entity'
import { Referral } from '../affiliates/entities/referral.entity'
import { Share } from '../shares/entities/share.entity'
import { Notification } from '../notifications/entities/notification.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { Offer } from '../campaigns/entities/offer.entity'
import { ConsumerWishlistItem } from './entities/consumer-wishlist-item.entity'
import { ConsumerController } from './consumer.controller'
import { ConsumerService } from './consumer.service'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    SubscriptionsModule,
    PlansModule,
    McomModule,
    MailModule,
    TypeOrmModule.forFeature([
      Card,
      Template,
      ChildCard,
      Membership,
      SubscribedPlan,
      Wallet,
      WalletTransaction,
      RewardBalance,
      RewardTransaction,
      CashbackAccount,
      Voucher,
      Referral,
      Share,
      Notification,
      Appointment,
      Campaign,
      Offer,
      ConsumerWishlistItem,
    ]),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
