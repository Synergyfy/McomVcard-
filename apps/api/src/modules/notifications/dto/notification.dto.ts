import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

export class CreateNotificationDto {
  @ApiProperty({ description: 'Recipient user', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  @IsUUID('4', { message: 'user_id must be a valid UUID' })
  user_id!: string

  @ApiProperty({ description: 'Notification type', example: 'system' })
  @IsString()
  @MinLength(2, { message: 'type must be at least 2 characters' })
  @MaxLength(50, { message: 'type must be at most 50 characters' })
  type!: string

  @ApiProperty({ description: 'Notification title', example: 'New review received' })
  @IsString()
  @MinLength(2, { message: 'title must be at least 2 characters' })
  @MaxLength(150, { message: 'title must be at most 150 characters' })
  title!: string

  @ApiPropertyOptional({ description: 'Notification message', example: 'Someone reviewed your business', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'message must be at most 2000 characters' })
  message?: string

  @ApiPropertyOptional({ description: 'JSON payload (stringified)', example: '{"business_id":"b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b"}' })
  @IsOptional()
  @IsString()
  @IsJSON({ message: 'data must be valid JSON' })
  data?: string
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Mark as read', example: true })
  @IsOptional()
  read!: boolean
}