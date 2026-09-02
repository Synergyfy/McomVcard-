import { IsString, IsOptional, IsNotEmpty, IsUUID, IsIn, IsNumber, IsPositive, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCashPaymentDto {
  @ApiProperty({ example: 'uuid-of-user', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string

  @ApiProperty({ example: 50.00, description: 'Payment amount' })
  @IsNumber()
  @IsPositive()
  amount!: number

  @ApiPropertyOptional({ example: 'GBP', default: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 'REF-001', description: 'Payment reference' })
  @IsOptional()
  @IsString()
  reference?: string

  @ApiPropertyOptional({ enum: ['pending', 'completed', 'failed'], default: 'pending' })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  status?: string

  @ApiPropertyOptional({ example: 'Cash payment for services' })
  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateCashPaymentDto {
  @ApiPropertyOptional({ example: 75.00 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 'REF-001' })
  @IsOptional()
  @IsString()
  reference?: string

  @ApiPropertyOptional({ enum: ['pending', 'completed', 'failed'] })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  status?: string

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string
}
