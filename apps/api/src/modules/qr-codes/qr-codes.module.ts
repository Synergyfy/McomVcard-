import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CardsModule } from '../cards/cards.module'
import { QrCodesController } from './qr-codes.controller'
import { QrCodesService } from './qr-codes.service'
import { QrCode } from './entities/qr-code.entity'

@Module({
  imports: [AuthModule, CardsModule, TypeOrmModule.forFeature([QrCode])],
  controllers: [QrCodesController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}