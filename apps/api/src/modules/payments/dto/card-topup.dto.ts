import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'

export class CardTopUpDto {
  @ApiProperty({ description: 'Amount of MCOM credits to move onto the card', example: 25, minimum: 1, maximum: 10000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' })
  @Min(1, { message: 'amount must be at least 1 MCOM' })
  @Max(10000, { message: 'amount is too large' })
  amount!: number

  @ApiProperty({
    description: 'Unique per top-up attempt (UUID recommended). Retries must reuse the same key.',
    example: '5b0f7d8e-6f39-4a2a-9f1d-0a2b3c4d5e6f',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @IsNotEmpty()
  idempotencyKey!: string
}
