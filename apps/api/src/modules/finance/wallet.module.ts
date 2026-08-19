import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { Wallet } from './entities/wallet.entity'
import { WalletTransaction } from './entities/wallet-transaction.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Wallet, WalletTransaction]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}