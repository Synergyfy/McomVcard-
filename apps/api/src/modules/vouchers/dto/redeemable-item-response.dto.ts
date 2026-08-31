import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Voucher } from '../entities/voucher.entity'
import { VoucherVendor } from '../entities/voucher-vendor.entity'

export class RedeemableItemResponseDto {
  @ApiProperty({ description: 'Voucher ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Voucher title', example: '£100 Gift Card' })
  title!: string

  @ApiPropertyOptional({ description: 'Voucher description', example: '£100 off your first shop', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Voucher monetary value', example: 100 })
  value!: number

  @ApiProperty({ description: 'Voucher currency', example: 'GBP' })
  currency!: string

  @ApiPropertyOptional({ description: 'Voucher expiry date (ISO)', example: '2027-08-19T00:00:00.000Z', nullable: true })
  expires_at!: string | null

  @ApiProperty({ description: 'Vendor name', example: 'Tesco' })
  vendor_name!: string

  static fromEntity(voucher: Voucher, vendor?: VoucherVendor): RedeemableItemResponseDto {
    const dto = new RedeemableItemResponseDto()

    dto.id = voucher.id
    dto.title = voucher.title
    dto.description = voucher.description
    dto.value = voucher.value
    dto.currency = voucher.currency
    dto.expires_at = voucher.expiresAt instanceof Date ? voucher.expiresAt.toISOString() : voucher.expiresAt
    dto.vendor_name = vendor?.name ?? 'Unknown vendor'

    return dto
  }
}
