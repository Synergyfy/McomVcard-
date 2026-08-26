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
    ]),
  ],
  controllers: [CardsController, CardsPublicController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
