import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesController } from './businesses.controller'
import { BusinessesService } from './businesses.service'
import { Business } from './entities/business.entity'
import { BusinessCategory } from './entities/business-category.entity'
import { BusinessLocation } from './entities/business-location.entity'
import { BusinessHour } from './entities/business-hour.entity'
import { Brand } from './entities/brand.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { MembershipTier } from '../memberships/entities/membership-tier.entity'
import { Card } from '../cards/entities/card.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Business, BusinessCategory, BusinessLocation, BusinessHour, Brand, Membership, MembershipTier, Card]),
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}