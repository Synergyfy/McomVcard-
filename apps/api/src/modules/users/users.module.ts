import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UserActionsService } from './user-actions.service'
import { ChildCard } from '../child-cards/entities/child-card.entity'
import { Share } from '../shares/entities/share.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, ChildCard, Share])],
  controllers: [UsersController],
  providers: [UsersService, UserActionsService],
  exports: [UsersService],
})
export class UsersModule {}
