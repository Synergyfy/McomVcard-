import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { CardsController } from './cards.controller'
import { CardsService } from './cards.service'
import { Card } from './entities/card.entity'
import { CardProfile } from './entities/card-profile.entity'
import { CardCustomization } from './entities/card-customization.entity'
import { SocialLink } from './entities/social-link.entity'
import { CardAccess } from './entities/card-access.entity'
import { Template } from './entities/template.entity'
import { TemplateField } from './entities/template-field.entity'

@Module({
  imports: [
    AuthModule,
    BusinessesModule,
    TypeOrmModule.forFeature([Card, CardProfile, CardCustomization, SocialLink, CardAccess, Template, TemplateField]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}