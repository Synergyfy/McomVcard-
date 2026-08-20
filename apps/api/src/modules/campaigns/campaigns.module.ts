import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { CampaignsController } from './campaigns.controller'
import { CampaignsService } from './campaigns.service'
import { Campaign } from './entities/campaign.entity'
import { Offer } from './entities/offer.entity'
import { Coupon } from './entities/coupon.entity'

@Module({
  imports: [AuthModule, BusinessesModule, TypeOrmModule.forFeature([Campaign, Offer, Coupon])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}