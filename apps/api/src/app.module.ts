import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './lib/config/configuration'
import { validationSchema } from './lib/config/validation'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { HealthModule } from './modules/health/health.module'
import { AdminModule } from './modules/admin/admin.module'
import { ProfileModule } from './modules/profile/profile.module'
import { BusinessesModule } from './modules/businesses/businesses.module'
import { CardsModule } from './modules/cards/cards.module'
import { ServicesModule } from './modules/services/services.module'
import { ProductsModule } from './modules/products/products.module'
import { AppointmentsModule } from './modules/appointments/appointments.module'
import { SeasonsModule } from './modules/seasons/seasons.module'
import { MembershipsModule } from './modules/memberships/memberships.module'
import { FinanceModule } from './modules/finance/finance.module'
import { RelationshipsModule } from './modules/relationships/relationships.module'
import { ChildCardsModule } from './modules/child-cards/child-cards.module'
import { WishlistsModule } from './modules/wishlists/wishlists.module'
import { VouchersModule } from './modules/vouchers/vouchers.module'
import { AffiliatesModule } from './modules/affiliates/affiliates.module'
import { SharesModule } from './modules/shares/shares.module'
import { QrCodesModule } from './modules/qr-codes/qr-codes.module'
import { CampaignsModule } from './modules/campaigns/campaigns.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MediaModule } from './modules/media/media.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { ActivityModule } from './modules/activity/activity.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { CustomersModule } from './modules/customers/customers.module'
import { ConsumerModule } from './modules/consumer/consumer.module'
import { PlansModule } from './modules/plans/plans.module'
import { AccessPassesModule } from './modules/access-passes/access-passes.module'
import { CapabilitiesModule } from './modules/capabilities/capabilities.module'
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module'
import { CashbackProgramsModule } from './modules/cashback-programs/cashback-programs.module'
import { EventsModule } from './modules/events/events.module'
import { ContactModule } from './modules/contact/contact.module'
import { SystemPlansModule } from './modules/system-plans/system-plans.module'
import { McomModule } from './modules/mcom/mcom.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { CacheModule } from './lib/cache/cache.module'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema }),
    CacheModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USERNAME || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_NAME || 'mcomvcard',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Disable synchronize in production regardless of TYPEORM_SYNC
      synchronize: process.env.NODE_ENV === 'production' ? false : process.env.TYPEORM_SYNC === 'true',
    }),
    // The SPA makes several authenticated calls per navigation (session
    // refresh, profile, cached dashboard). 20/min was low enough that normal
    // dashboard use could self-throttle; 120/min still bounds abuse while
    // leaving headroom for real customers. Auth endpoints keep their own
    // credential checks and validation.
    ThrottlerModule.forRoot({ ttl: 60, limit: 120 }),
    AuthModule,
    UsersModule,
    HealthModule,
    AdminModule,
    ProfileModule,
    BusinessesModule,
    CardsModule,
    ServicesModule,
    ProductsModule,
    AppointmentsModule,
    SeasonsModule,
    MembershipsModule,
    FinanceModule,
    RelationshipsModule,
    ChildCardsModule,
    WishlistsModule,
    VouchersModule,
    AffiliatesModule,
    SharesModule,
    QrCodesModule,
    CampaignsModule,
    ReviewsModule,
    NotificationsModule,
    MediaModule,
    DashboardModule,
    ActivityModule,
    AnalyticsModule,
    CustomersModule,
    ConsumerModule,
    PlansModule,
    AccessPassesModule,
    CapabilitiesModule,
    GiftCardsModule,
    CashbackProgramsModule,
    EventsModule,
    ContactModule,
    SystemPlansModule,
    McomModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
