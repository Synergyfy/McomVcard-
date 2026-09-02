import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsIn } from 'class-validator'

export class ShareWishlistDto {
  @ApiProperty({ description: 'Email of the user to share the wishlist with', example: 'friend@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string

  @ApiProperty({ description: 'Permission level', enum: ['view', 'fulfill'], default: 'view', example: 'view' })
  @IsIn(['view', 'fulfill'], { message: 'permission must be either view or fulfill' })
  permission!: 'view' | 'fulfill'
}
