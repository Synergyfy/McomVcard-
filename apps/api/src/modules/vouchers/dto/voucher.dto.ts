import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, MinLength } from 'class-validator'

export class CreateVoucherVendorDto {
  @ApiProperty({ description: 'Vendor name', example: 'Tesco' })
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string

  @ApiPropertyOptional({ description: 'Vendor description', example: 'Retail voucher partner', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'description must be at most 1000 characters' })
  description?: string

  @ApiPropertyOptional({ description: 'Vendor website', example: 'https://www.tesco.com', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'website must be at most 255 characters' })
  website?: string
}

export class UpdateVoucherVendorDto {
  @ApiPropertyOptional({ description: 'Vendor name', example: 'Tesco' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name?: string

  @ApiPropertyOptional({ description: 'Vendor description', example: 'Retail voucher partner', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'description must be at most 1000 characters' })
  description?: string

  @ApiPropertyOptional({ description: 'Vendor website', example: 'https://www.tesco.com', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'website must be at most 255 characters' })
  website?: string

  @ApiPropertyOptional({ description: 'Vendor status', example: 'active', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  status?: string
}

export class CreateVoucherDto {
  @ApiProperty({ description: 'Vendor ID the voucher belongs to', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'vendor_id must be a valid UUID' })
  vendor_id!: string

  @ApiProperty({ description: 'Unique voucher code', example: 'TESCO-GIFT-100' })
  @IsString()
  @MinLength(3, { message: 'code must be at least 3 characters' })
  @MaxLength(50, { message: 'code must be at most 50 characters' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'code may only contain uppercase letters, digits, and hyphens' })
  code!: string

  @ApiProperty({ description: 'Voucher title', example: '£100 Gift Card' })
  @IsString()
  @MinLength(2, { message: 'title must be at least 2 characters' })
  @MaxLength(100, { message: 'title must be at most 100 characters' })
  title!: string

  @ApiPropertyOptional({ description: 'Voucher description', example: '£100 off your first shop', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'description must be at most 1000 characters' })
  description?: string

  @ApiProperty({ description: 'Voucher monetary value', example: 100 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'value must be a number with at most 2 decimal places' })
  @Min(0.01, { message: 'value must be greater than zero' })
  value!: number

  @ApiPropertyOptional({ description: 'Voucher currency', default: 'GBP', example: 'GBP' })
  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'currency must be at most 10 characters' })
  currency?: string

  @ApiPropertyOptional({ description: 'Voucher expiry date (ISO 8601)', example: '2027-08-19T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsISO8601({}, { message: 'expires_at must be a valid ISO 8601 date' })
  expires_at?: string
}