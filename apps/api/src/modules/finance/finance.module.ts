import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { Wallet } from './entities/wallet.entity'
import { WalletTransaction } from './entities/wallet-transaction.entity'
import { RewardsController } from './rewards.controller'
import { RewardsService } from './rewards.service'
import { RewardBalance } from './entities/reward-balance.entity'
import { RewardTransaction } from './entities/reward-transaction.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Wallet, WalletTransaction, RewardBalance, RewardTransaction]),
  ],
  controllers: [WalletController, RewardsController],
  providers: [WalletService, RewardsService],
  exports: [WalletService, RewardsService],
})
export class FinanceModule {}