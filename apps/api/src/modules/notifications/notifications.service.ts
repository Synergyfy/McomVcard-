import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './entities/notification.entity'
import { CreateNotificationDto } from './dto/notification.dto'
import { NotificationResponseDto, UnreadCountDto } from './dto/notification-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

// Spec §44: "Notification delivery should be abstracted so the provider can
// change later." Rows are the durable in-app record; `deliver` is the seam where
// an email/push provider plugs in. The default provider is a no-op that records
// the notification in-app only.
export interface NotificationDeliveryProvider {
  deliver(notification: Notification): Promise<void>
}

@Injectable()
export class InAppNotificationDeliveryProvider implements NotificationDeliveryProvider {
  async deliver(): Promise<void> {
    // In-app record is already persisted by NotificationsService — nothing to push.
    return
  }
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    @Inject('NotificationDeliveryProvider') private readonly deliveryProvider: NotificationDeliveryProvider,
  ) {}

  // Create a notification for a user and dispatch through the abstracted provider.
  async create(dto: CreateNotificationDto) {
    const saved = await this.notificationsRepo.save(
      this.notificationsRepo.create({
        userId: dto.user_id,
        type: dto.type,
        title: dto.title,
        message: dto.message ?? null,
        data: dto.data ? JSON.parse(dto.data) : null,
        readAt: null,
      }),
    )

    await this.deliveryProvider.deliver(saved)

    return ApiResponse.success(NotificationResponseDto.fromEntity(saved), 'Notification created', 201)
  }

  async listForUser(user: UserResponseDto, unreadOnly: boolean) {
    let query = this.notificationsRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId: user.id })

    if (unreadOnly) {
      query = query.andWhere('n.readAt IS NULL')
    }

    const notifications = await query.orderBy('n.createdAt', 'DESC').getMany()

    return ApiResponse.success(
      notifications.map((n) => NotificationResponseDto.fromEntity(n)),
      'Notifications retrieved',
      200,
    )
  }

  async unreadCount(user: UserResponseDto) {
    const count = await this.notificationsRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId: user.id })
      .andWhere('n.readAt IS NULL')
      .getCount()

    return ApiResponse.success(UnreadCountDto.fromCount(count), 'Unread count retrieved', 200)
  }

  // Mark one notification read/unread (owner-only).
  async markRead(user: UserResponseDto, id: string, read: boolean) {
    const notification = await this.notificationsRepo.findOne({ where: { id, userId: user.id } })

    if (!notification) throw new NotFoundException('Notification not found')

    notification.readAt = read ? new Date() : null
    const saved = await this.notificationsRepo.save(notification)

    return ApiResponse.success(NotificationResponseDto.fromEntity(saved), 'Notification updated', 200)
  }

  async markAllRead(user: UserResponseDto) {
    await this.notificationsRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('user_id = :userId', { userId: user.id })
      .andWhere('read_at IS NULL')
      .execute()

    return ApiResponse.success(null, 'All notifications marked as read', 200)
  }

  async remove(user: UserResponseDto, id: string) {
    const notification = await this.notificationsRepo.findOne({ where: { id, userId: user.id } })

    if (!notification) throw new NotFoundException('Notification not found')

    await this.notificationsRepo.delete(id)

    return ApiResponse.success(null, 'Notification deleted', 200)
  }
}