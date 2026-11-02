import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class ConsumerPageQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiPropertyOptional({ example: 20, description: 'Rows per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}

export class ConsumerActivityQueryDto extends ConsumerPageQueryDto {
  @ApiPropertyOptional({
    example: 'all',
    description: 'Filter the activity feed by category',
    enum: ['all', 'wallet', 'funding', 'reward', 'earn', 'share', 'exchange', 'family', 'membership', 'booking', 'voucher', 'campaign'],
  })
  @IsOptional()
  @IsIn(['all', 'wallet', 'funding', 'reward', 'earn', 'share', 'exchange', 'family', 'membership', 'booking', 'voucher', 'campaign'])
  type?: string
}

export class ConsumerNotificationQueryDto extends ConsumerPageQueryDto {
  @ApiPropertyOptional({ example: 'all', enum: ['all', 'unread', 'read'] })
  @IsOptional()
  @IsIn(['all', 'unread', 'read'])
  filter?: 'all' | 'unread' | 'read'
}

export class ConsumerRewardQueryDto extends ConsumerPageQueryDto {
  @ApiPropertyOptional({ example: 'all', enum: ['all', 'available', 'redeemed', 'expired'] })
  @IsOptional()
  @IsIn(['all', 'available', 'redeemed', 'expired'])
  status?: 'all' | 'available' | 'redeemed' | 'expired'
}

export class ConsumerOffersQueryDto extends ConsumerPageQueryDto {
  @ApiPropertyOptional({ example: 'Coffee Shop', description: 'Optional campaign/category filter' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string
}

export class ConsumerInviteDto {
  @ApiProperty({ example: 'friend@example.com', description: 'Email address to send the referral invitation to' })
  @IsEmail()
  @MaxLength(255)
  email!: string
}

export class ConsumerClaimCardDto {
  @ApiPropertyOptional({ example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Existing card ID or public slug to add to the customer account' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  card_id?: string

  @ApiPropertyOptional({ example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Template ID used to create a consumer card' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  template_id?: string

  @ApiPropertyOptional({ example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Business that issued the card (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  business_id?: string
}

export class ConsumerNotificationUpdateDto {
  @ApiPropertyOptional({ example: true, description: 'True marks the notification read, false marks it unread' })
  @IsOptional()
  @IsBoolean()
  read?: boolean
}
