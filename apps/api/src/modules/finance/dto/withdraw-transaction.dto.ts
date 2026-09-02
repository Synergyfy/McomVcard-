import { IsString, IsOptional, IsNotEmpty, IsUUID, IsIn, IsNumber, IsPositive, IsObject } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateWithdrawTransactionDto {
  @ApiProperty({ example: 'uuid-of-user', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string

  @ApiProperty({ example: 100.00, description: 'Withdrawal amount' })
  @IsNumber()
  @IsPositive()
  amount!: number

  @ApiPropertyOptional({ example: 'GBP', default: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected', 'paid'])
  status?: string

  @ApiPropertyOptional({ example: { bankName: 'HSBC', accountNumber: '12345678', sortCode: '12-34-56' } })
  @IsOptional()
  @IsObject()
  bankDetails?: Record<string, any>

  @ApiPropertyOptional({ example: 'Withdrawal request for affiliate earnings' })
  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateWithdrawTransactionDto {
  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected', 'paid'] })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected', 'paid'])
  status?: string

  @ApiPropertyOptional({ example: { bankName: 'HSBC', accountNumber: '12345678', sortCode: '12-34-56' } })
  @IsOptional()
  @IsObject()
  bankDetails?: Record<string, any>

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string
}
