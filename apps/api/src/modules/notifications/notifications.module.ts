import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService, InAppNotificationDeliveryProvider } from './notifications.service'
import { Notification } from './entities/notification.entity'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    { provide: 'NotificationDeliveryProvider', useClass: InAppNotificationDeliveryProvider },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}