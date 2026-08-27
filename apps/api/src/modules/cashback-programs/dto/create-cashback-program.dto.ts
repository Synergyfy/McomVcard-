import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn, MaxLength, Min, Max, IsUUID } from 'class-validator'
import { CashbackProgramStatus } from '../entities/cashback-program.entity'

export class CreateCashbackProgramDto {
  @ApiProperty({ example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', description: 'Business ID' })
  @IsUUID()
  business_id!: string

  @ApiProperty({ example: 'Summer Cashback', description: 'Title of the cashback program' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string

  @ApiProperty({ example: 5.5, description: 'Cashback rate in percentage (e.g., 5.5 for 5.5%)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  rate!: number

  @ApiPropertyOptional({ enum: CashbackProgramStatus, default: CashbackProgramStatus.ACTIVE })
  @IsOptional()
  @IsIn(Object.values(CashbackProgramStatus))
  status?: CashbackProgramStatus
}