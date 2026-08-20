import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { NotificationsService } from './notifications.service'
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto'
import { NotificationResponseDto, UnreadCountDto } from './dto/notification-response.dto'

@ApiTags('notifications')
@ApiExtraModels(ApiResponse, NotificationResponseDto, UnreadCountDto)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a notification', description: 'Creates an in-app notification for a user and dispatches it through the abstracted delivery provider (spec §44).' })
  @ApiBody({
    type: CreateNotificationDto,
    examples: { review: { summary: 'Review received', value: { user_id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', type: 'system', title: 'New review received', message: 'Someone reviewed your business', data: '{"business_id":"b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b"}' } } },
  })
  @ApiCreatedResponse({ description: 'Notification created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(NotificationResponseDto) } } }] } })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async create(@CurrentUser() _user: UserResponseDto, @Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my notifications', description: 'Returns the authenticated user\'s notifications, newest first. Use ?unread=true to show only unread.' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean, description: 'Only unread notifications' })
  @ApiOkResponse({ description: 'Notifications', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(NotificationResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async list(@CurrentUser() user: UserResponseDto, @Query('unread') unread?: string) {
    return this.notificationsService.listForUser(user, unread === 'true')
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unread notification count', description: 'Returns how many of the authenticated user\'s notifications are unread.' })
  @ApiOkResponse({ description: 'Unread count', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(UnreadCountDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async unreadCount(@CurrentUser() user: UserResponseDto) {
    return this.notificationsService.unreadCount(user)
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read', description: 'Marks every unread notification of the authenticated user as read.' })
  @ApiOkResponse({ description: 'All marked read', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async markAllRead(@CurrentUser() user: UserResponseDto) {
    return this.notificationsService.markAllRead(user)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a notification read/unread', description: 'Marks one of the authenticated user\'s notifications as read (read: true) or unread (read: false).' })
  @ApiBody({ type: UpdateNotificationDto, examples: { read: { summary: 'Mark read', value: { read: true } } } })
  @ApiOkResponse({ description: 'Notification updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(NotificationResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async markRead(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateNotificationDto) {
    return this.notificationsService.markRead(user, id, body.read ?? true)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a notification', description: 'Deletes one of the authenticated user\'s notifications.' })
  @ApiOkResponse({ description: 'Notification deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.notificationsService.remove(user, id)
  }
}