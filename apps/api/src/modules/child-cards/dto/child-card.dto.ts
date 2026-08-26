import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator'

export class CreateChildCardDto {
  @ApiProperty({ description: 'Parent-owned card ID to grant access to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'card_id must be a valid UUID' })
  card_id!: string

  @ApiProperty({ description: 'Child user ID receiving access', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  @IsUUID('4', { message: 'child_id must be a valid UUID' })
  child_id!: string

  @ApiPropertyOptional({ description: 'Child may view the card', default: true, example: true })
  @IsOptional()
  @IsBoolean({ message: 'can_view must be a boolean' })
  can_view?: boolean

  @ApiPropertyOptional({ description: 'Child may use the parent wallet (spend/withdraw from allocated amount)', default: false, example: false })
  @IsOptional()
  @IsBoolean({ message: 'can_use_wallet must be a boolean' })
  can_use_wallet?: boolean

  @ApiPropertyOptional({ description: 'Child may manage the card (edit content/settings)', default: false, example: false })
  @IsOptional()
  @IsBoolean({ message: 'can_manage must be a boolean' })
  can_manage?: boolean

  @ApiPropertyOptional({ description: 'Optional wallet amount allocated to the child (requires can_use_wallet)', example: 50.0 })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'wallet_allocation must be a number with at most 2 decimal places' })
  @Min(0, { message: 'wallet_allocation cannot be negative' })
  @Max(999999999999.99, { message: 'wallet_allocation is too large' })
  wallet_allocation?: number
}

export class UpdateChildCardDto {
  @ApiPropertyOptional({ description: 'Child may view the card', example: true })
  @IsOptional()
  @IsBoolean({ message: 'can_view must be a boolean' })
  can_view?: boolean

  @ApiPropertyOptional({ description: 'Child may use the parent wallet', example: false })
  @IsOptional()
  @IsBoolean({ message: 'can_use_wallet must be a boolean' })
  can_use_wallet?: boolean

  @ApiPropertyOptional({ description: 'Child may manage the card', example: false })
  @IsOptional()
  @IsBoolean({ message: 'can_manage must be a boolean' })
  can_manage?: boolean

  @ApiPropertyOptional({ description: 'Wallet amount allocated to the child (null clears the allocation)', example: 50.0, nullable: true })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'wallet_allocation must be a number with at most 2 decimal places' })
  @Min(0, { message: 'wallet_allocation cannot be negative' })
  @Max(999999999999.99, { message: 'wallet_allocation is too large' })
  wallet_allocation?: number
}