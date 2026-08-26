import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { AnalyticsEvent } from './entities/analytics-event.entity'
import { Business } from '../businesses/entities/business.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([AnalyticsEvent, Business]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
