import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { PlansModule } from '../plans/plans.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { McomService } from './mcom.service'
import { McomController } from './mcom.controller'
import { McomWalletService } from './mcom-wallet.service'
import { McomPayService } from './mcom-pay.service'
import { McomPackagesController } from './packages/mcom-packages.controller'
import { McomPackagesService } from './packages/mcom-packages.service'
import { McomWebhookController } from './webhooks/mcom-webhook.controller'
import { McomWebhookService } from './webhooks/mcom-webhook.service'
import { McomWebhookEvent } from './webhooks/mcom-webhook-event.entity'
import { DirectHandshakeController } from './direct-handshake.controller'
import { ServiceMeshController } from './service-mesh.controller'
import { ServiceAuthGuard } from './service-auth'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    TypeOrmModule.forFeature([McomWebhookEvent]),
  ],
  controllers: [
    McomController,
    McomPackagesController,
    McomWebhookController,
    DirectHandshakeController,
    ServiceMeshController,
  ],
  providers: [
    McomService,
    McomWalletService,
    McomPayService,
    McomPackagesService,
    McomWebhookService,
    ServiceAuthGuard,
  ],
  exports: [McomService, McomWalletService, McomPayService, McomPackagesService],
})
export class McomModule {}
