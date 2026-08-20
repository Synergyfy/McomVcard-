import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CardsModule } from '../cards/cards.module'
import { UsersModule } from '../users/users.module'
import { ChildCardsController } from './child-cards.controller'
import { ChildCardsService } from './child-cards.service'
import { ChildCard } from './entities/child-card.entity'

@Module({
  imports: [
    AuthModule,
    CardsModule,
    UsersModule,
    TypeOrmModule.forFeature([ChildCard]),
  ],
  controllers: [ChildCardsController],
  providers: [ChildCardsService],
  exports: [ChildCardsService],
})
export class ChildCardsModule {}