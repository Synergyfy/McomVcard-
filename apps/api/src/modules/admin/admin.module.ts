import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { AdminController } from './admin.controller'
import { AdminUsersController } from './admin-users.controller'
import { AdminBusinessesController } from './admin-businesses.controller'
import { AdminCardsController } from './admin-cards.controller'
import { AdminTemplatesController } from './admin-templates.controller'
import { AdminMembershipsController } from './admin-memberships.controller'
import { AdminFinanceController } from './admin-finance.controller'
import { AdminVouchersController } from './admin-vouchers.controller'
import { AdminCampaignsController } from './admin-campaigns.controller'

import { User } from '../users/entities/user.entity'
import { Business } from '../businesses/entities/business.entity'
import { Card } from '../cards/entities/card.entity'
import { Template } from '../cards/entities/template.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { MembershipTier } from '../memberships/entities/membership-tier.entity'
import { Benefit } from '../memberships/entities/benefit.entity'
import { Wallet } from '../finance/entities/wallet.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardBalance } from '../finance/entities/reward-balance.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { CashbackAccount } from '../finance/entities/cashback-account.entity'
import { CashbackTransaction } from '../finance/entities/cashback-transaction.entity'
import { CashbackRule } from '../finance/entities/cashback-rule.entity'
import { VoucherVendor } from '../vouchers/entities/voucher-vendor.entity'
import { Voucher } from '../vouchers/entities/voucher.entity'
import { VoucherTransaction } from '../vouchers/entities/voucher-transaction.entity'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { Offer } from '../campaigns/entities/offer.entity'
import { Coupon } from '../campaigns/entities/coupon.entity'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    TypeOrmModule.forFeature([
      User,
      Business,
      Card,
      Template,
      Membership,
      MembershipTier,
      Benefit,
      Wallet,
      WalletTransaction,
      RewardBalance,
      RewardTransaction,
      CashbackAccount,
      CashbackTransaction,
      CashbackRule,
      VoucherVendor,
      Voucher,
      VoucherTransaction,
      Campaign,
      Offer,
      Coupon,
    ]),
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminBusinessesController,
    AdminCardsController,
    AdminTemplatesController,
    AdminMembershipsController,
    AdminFinanceController,
    AdminVouchersController,
    AdminCampaignsController,
  ],
})
export class AdminModule {}
