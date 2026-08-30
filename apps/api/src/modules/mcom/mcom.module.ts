import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { PlansModule } from '../plans/plans.module'
import { McomService } from './mcom.service'
import { McomController } from './mcom.controller'
import { McomWalletService } from './mcom-wallet.service'
import { McomPackagesController } from './packages/mcom-packages.controller'
import { McomPackagesService } from './packages/mcom-packages.service'
import { McomWebhookController } from './webhooks/mcom-webhook.controller'
import { McomWebhookService } from './webhooks/mcom-webhook.service'
import { McomWebhookEvent } from './webhooks/mcom-webhook-event.entity'
import { DirectHandshakeController } from './direct-handshake.controller'

@Module({
  imports: [AuthModule, UsersModule, PlansModule, TypeOrmModule.forFeature([McomWebhookEvent])],
  controllers: [McomController, McomPackagesController, McomWebhookController, DirectHandshakeController],
  providers: [McomService, McomWalletService, McomPackagesService, McomWebhookService],
  exports: [McomService, McomWalletService, McomPackagesService],
})
export class McomModule {}