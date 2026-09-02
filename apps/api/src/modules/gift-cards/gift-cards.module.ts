import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BusinessesModule } from '../businesses/businesses.module'
import { GiftCardsService } from './gift-cards.service'
import { GiftCardsController } from './gift-cards.controller'
import { GiftCard } from './entities/gift-card.entity'

@Module({
  imports: [TypeOrmModule.forFeature([GiftCard]), BusinessesModule],
  controllers: [GiftCardsController],
  providers: [GiftCardsService],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}