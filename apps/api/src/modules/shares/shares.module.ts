import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CardsModule } from '../cards/cards.module'
import { SharesController } from './shares.controller'
import { SharesService } from './shares.service'
import { Share } from './entities/share.entity'
import { Affiliate } from '../affiliates/entities/affiliate.entity'

@Module({
  imports: [
    AuthModule,
    CardsModule,
    TypeOrmModule.forFeature([Share, Affiliate]),
  ],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}