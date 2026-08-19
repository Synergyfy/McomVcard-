import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { MembershipsController } from './memberships.controller'
import { MembershipsService } from './memberships.service'
import { MembershipTier } from './entities/membership-tier.entity'
import { Benefit } from './entities/benefit.entity'
import { MembershipBenefit } from './entities/membership-benefit.entity'
import { Membership } from './entities/membership.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([MembershipTier, Benefit, MembershipBenefit, Membership]),
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}