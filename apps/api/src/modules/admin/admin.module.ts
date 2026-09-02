import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { PlansModule } from '../plans/plans.module'
import { LanguagesModule } from '../languages/languages.module'
import { CurrenciesModule } from '../currencies/currencies.module'
import { ActivityModule } from '../activity/activity.module'
import { NewsletterModule } from '../newsletter/newsletter.module'
import { CountriesModule } from '../countries/countries.module'
import { CouponCodesModule } from '../coupon-codes/coupon-codes.module'
import { AdminController } from './admin.controller'
import { AdminUsersController } from './admin-users.controller'
import { AdminBusinessesController } from './admin-businesses.controller'
import { AdminCardsController } from './admin-cards.controller'
import { AdminTemplatesController } from './admin-templates.controller'
import { AdminMembershipsController } from './admin-memberships.controller'
import { AdminFinanceController } from './admin-finance.controller'
import { AdminVouchersController } from './admin-vouchers.controller'
import { AdminCampaignsController } from './admin-campaigns.controller'
import { AdminImpersonationController } from './admin-impersonation.controller'
import { AdminPlansController } from './admin-plans.controller'
import { AdminRolesController } from './admin-roles.controller'
import { AdminCurrenciesController } from './admin-currencies.controller'
import { AdminTestimonialsController } from './admin-testimonials.controller'
import { AdminFrontFeaturesController } from './admin-front-features.controller'
import { AdminAboutUsController } from './admin-about-us.controller'
import { AdminEnquiriesController } from './admin-enquiries.controller'
import { AdminSubscribersController } from './admin-subscribers.controller'
import { AdminSettingsController } from './admin-settings.controller'
import { AdminAdminsController } from './admin-admins.controller'
import { AdminsService } from './admins.service'
import { AdminSubscribedPlansController } from './admin-subscribed-plans.controller'
import { AdminCashPaymentsController } from './admin-cash-payments.controller'
import { AdminAffiliateUsersController } from './admin-affiliate-users.controller'
import { AdminAffiliateTransactionsController } from './admin-affiliate-transactions.controller'
import { AdminWithdrawTransactionsController } from './admin-withdraw-transactions.controller'
import { AdminCountriesController } from './admin-countries.controller'
import { AdminLanguagesController } from './admin-languages.controller'
import { AdminCouponCodesController } from './admin-coupon-codes.controller'
import { AdminFrontCMSController } from './admin-front-cms.controller'
import { AdminFaqsController } from './admin-faqs.controller'
import { AdminEmailTemplatesController } from './admin-email-templates.controller'
import { AdminActivityLogsController } from './admin-activity-logs.controller'
import { AdminNewsletterController } from './admin-newsletter.controller'
import { AdminBookingsController } from './admin-bookings.controller'
import { AdminSystemController } from './admin-system.controller'
import { AdminVcardsController } from './admin-vcards.controller'
import { EnquiriesModule } from '../enquiries/enquiries.module'
import { FaqsModule } from '../faqs/faqs.module'
import { EmailTemplatesModule } from '../email-templates/email-templates.module'
import { SettingsModule } from '../settings/settings.module'
import { FeaturesModule } from '../features/features.module'
import { TestimonialsModule } from '../testimonials/testimonials.module'
import { AboutUsModule } from '../about-us/about-us.module'
import { AffiliatesModule } from '../affiliates/affiliates.module'
import { CmsModule } from '../cms/cms.module'
import { FinanceModule } from '../finance/finance.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'

import { User } from '../users/entities/user.entity'
import { UserRole } from '../roles/entities/user-role.entity'
import { Role } from '../roles/entities/role.entity'
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
import { ActivityLog } from '../activity/entities/activity-log.entity'
import { NewsletterCampaign } from '../newsletter/entities/newsletter-campaign.entity'
import { Subscriber } from '../newsletter/entities/subscriber.entity'
import { Country } from '../countries/entities/country.entity'
import { CouponCode } from '../coupon-codes/entities/coupon-code.entity'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    PlansModule,
    LanguagesModule,
    CurrenciesModule,
    EnquiriesModule,
    FaqsModule,
    EmailTemplatesModule,
    SettingsModule,
    FeaturesModule,
    TestimonialsModule,
    AboutUsModule,
    AffiliatesModule,
    CmsModule,
    FinanceModule,
    SubscriptionsModule,
    ActivityModule,
    NewsletterModule,
    CountriesModule,
    CouponCodesModule,
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Role,
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
      ActivityLog,
      NewsletterCampaign,
      Subscriber,
      Country,
      CouponCode,
    ]),
  ],
  providers: [AdminsService],
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
    AdminImpersonationController,
    AdminPlansController,
    AdminRolesController,
    AdminCurrenciesController,
    AdminTestimonialsController,
    AdminFrontFeaturesController,
    AdminAboutUsController,
    AdminEnquiriesController,
    AdminSubscribersController,
    AdminSettingsController,
    AdminAdminsController,
    AdminSubscribedPlansController,
    AdminCashPaymentsController,
    AdminAffiliateUsersController,
    AdminAffiliateTransactionsController,
    AdminWithdrawTransactionsController,
    AdminCountriesController,
    AdminLanguagesController,
    AdminCouponCodesController,
    AdminFrontCMSController,
    AdminFaqsController,
    AdminEmailTemplatesController,
    AdminActivityLogsController,
    AdminNewsletterController,
    AdminBookingsController,
    AdminSystemController,
    AdminVcardsController,
  ],
})
export class AdminModule {}
