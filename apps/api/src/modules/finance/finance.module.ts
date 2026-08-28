import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { McomModule } from '../mcom/mcom.module'
import { UsersModule } from '../users/users.module'
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
import { CatalogController } from './catalog.controller'
import { CatalogService } from './catalog.service'
import { GiftCard } from './entities/gift-card.entity'
import { CashbackProgram } from './entities/cashback-program.entity'
import { Business } from '../businesses/entities/business.entity'

@Module({
  imports: [
    AuthModule,
    McomModule,
    UsersModule,
    TypeOrmModule.forFeature([Wallet, WalletTransaction, RewardBalance, RewardTransaction, CashbackAccount, CashbackTransaction, CashbackRule, GiftCard, CashbackProgram, Business]),
  ],
  controllers: [WalletController, RewardsController, CashbackController, CatalogController],
  providers: [WalletService, RewardsService, CashbackService, CatalogService],
  exports: [WalletService, RewardsService, CashbackService, CatalogService],
})
export class FinanceModule {}