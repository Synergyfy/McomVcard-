import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class CreateGiftCardDto {
  @ApiProperty({ description: 'Gift card title', example: 'GreenLeaf £10 Gift Card' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title!: string

  @ApiProperty({ description: 'Face value in GBP', example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value!: number

  @ApiProperty({ description: 'Selling price in GBP', example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number
}

export class UpdateGiftCardDto {
  @ApiPropertyOptional({ example: 'GreenLeaf £25 Gift Card' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title?: string

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value?: number

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number

  @ApiPropertyOptional({ enum: ['active', 'paused'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'paused'])
  status?: string
}

export class CreateCashbackProgramDto {
  @ApiProperty({ description: 'Program title', example: 'Loyalty Cashback' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title!: string

  @ApiProperty({ description: 'Cashback rate as a percentage', example: 3 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rate!: number
}

export class UpdateCashbackProgramDto {
  @ApiPropertyOptional({ example: 'Coffee Subscription' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title?: string

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rate?: number

  @ApiPropertyOptional({ enum: ['active', 'off'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'off'])
  status?: string
}
