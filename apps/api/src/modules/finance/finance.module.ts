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
import { CashbackController } from './cashback.controller'
import { CashbackService } from './cashback.service'
import { CashbackAccount } from './entities/cashback-account.entity'
import { CashbackTransaction } from './entities/cashback-transaction.entity'
import { CashbackRule } from './entities/cashback-rule.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Wallet, WalletTransaction, RewardBalance, RewardTransaction, CashbackAccount, CashbackTransaction, CashbackRule]),
  ],
  controllers: [WalletController, RewardsController, CashbackController],
  providers: [WalletService, RewardsService, CashbackService],
  exports: [WalletService, RewardsService, CashbackService],
})
export class FinanceModule {}