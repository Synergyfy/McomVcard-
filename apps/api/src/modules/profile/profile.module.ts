import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { Business } from '../businesses/entities/business.entity'
import { Card } from '../cards/entities/card.entity'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { Wallet } from '../finance/entities/wallet.entity'

@Module({
  imports: [AuthModule, UsersModule, RolesModule, BusinessesModule, TypeOrmModule.forFeature([Business, Card, ChildCard, Wallet])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
