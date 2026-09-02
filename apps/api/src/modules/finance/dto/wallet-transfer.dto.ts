import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator'

export class WalletTransferDto {
  @ApiProperty({ description: 'Recipient user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  @IsUUID()
  recipient_id!: string

  @ApiProperty({ description: 'Amount to transfer', example: 25.5, minimum: 0.01, maximum: 9999999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Min(0.01, { message: 'amount must be greater than zero' })
  @Max(9999999999.99, { message: 'amount is too large' })
  amount!: number

  @ApiProperty({ description: 'Optional description', example: 'Dinner split', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string
}
