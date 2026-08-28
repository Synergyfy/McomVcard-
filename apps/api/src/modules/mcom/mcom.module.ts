import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { PlansModule } from '../plans/plans.module'
import { McomService } from './mcom.service'
import { McomController } from './mcom.controller'
import { McomWalletService } from './mcom-wallet.service'

@Module({
  imports: [AuthModule, UsersModule, PlansModule],
  controllers: [McomController],
  providers: [McomService, McomWalletService],
  exports: [McomService, McomWalletService],
})
export class McomModule {}