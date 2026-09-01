import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { Card } from '../cards/entities/card.entity'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { Wallet } from '../finance/entities/wallet.entity'

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([Card, ChildCard, Wallet])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
