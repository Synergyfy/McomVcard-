import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { CardsController } from './cards.controller'
import { CardsPublicController } from './cards-public.controller'
import { CardsService } from './cards.service'
import { Card } from './entities/card.entity'
import { CardProfile } from './entities/card-profile.entity'
import { CardCustomization } from './entities/card-customization.entity'
import { SocialLink } from './entities/social-link.entity'
import { CardAccess } from './entities/card-access.entity'
import { CardSection } from './entities/card-section.entity'
import { CardCentreControl } from './entities/card-centre-control.entity'
import { Template } from './entities/template.entity'
import { TemplateField } from './entities/template-field.entity'
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { MembershipTier } from '../memberships/entities/membership-tier.entity'
import { MembershipBenefit } from '../memberships/entities/membership-benefit.entity'
import { Benefit } from '../memberships/entities/benefit.entity'
import { Season } from '../seasons/entities/season.entity'
import { Wallet } from '../finance/entities/wallet.entity'
import { RewardBalance } from '../finance/entities/reward-balance.entity'
import { ActivityLog } from '../activity/entities/activity-log.entity'

@Module({
  imports: [
    AuthModule,
    BusinessesModule,
    TypeOrmModule.forFeature([
      Card,
      CardProfile,
      CardCustomization,
      SocialLink,
      CardAccess,
      CardSection,
      CardCentreControl,
      Template,
      TemplateField,
      AnalyticsEvent,
      Membership,
      MembershipTier,
      MembershipBenefit,
      Benefit,
      Season,
      Wallet,
      RewardBalance,
      ActivityLog,
    ]),
  ],
  controllers: [CardsController, CardsPublicController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
