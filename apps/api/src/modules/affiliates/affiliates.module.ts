import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { RolesModule } from '../roles/roles.module'
import { AffiliatesController } from './affiliates.controller'
import { AdminAffiliatesController } from './admin-affiliates.controller'
import { AffiliatesService } from './affiliates.service'
import { Affiliate } from './entities/affiliate.entity'
import { Referral } from './entities/referral.entity'
import { AffiliateTransaction } from './entities/affiliate-transaction.entity'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RolesModule,
    TypeOrmModule.forFeature([Affiliate, Referral, AffiliateTransaction]),
  ],
  controllers: [AffiliatesController, AdminAffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}