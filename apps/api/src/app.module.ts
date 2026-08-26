import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
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
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'mcomvcard',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Disable synchronize in production regardless of TYPEORM_SYNC
      synchronize: process.env.NODE_ENV === 'production' ? false : process.env.TYPEORM_SYNC === 'true',
    }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 20 }),
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
