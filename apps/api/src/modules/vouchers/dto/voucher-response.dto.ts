import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Voucher } from '../entities/voucher.entity'
import { VoucherTransaction } from '../entities/voucher-transaction.entity'
import { VoucherVendor } from '../entities/voucher-vendor.entity'

export class VoucherVendorResponseDto {
  @ApiProperty({ description: 'Vendor ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Vendor name', example: 'Tesco' })
  name!: string

  @ApiPropertyOptional({ description: 'Vendor description', example: 'Retail voucher partner', nullable: true })
  description!: string | null

  @ApiPropertyOptional({ description: 'Vendor website', example: 'https://www.tesco.com', nullable: true })
  website!: string | null

  @ApiProperty({ description: 'Vendor status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(vendor: VoucherVendor): VoucherVendorResponseDto {
    const dto = new VoucherVendorResponseDto()

    dto.id = vendor.id
    dto.name = vendor.name
    dto.description = vendor.description
    dto.website = vendor.website
    dto.status = vendor.status
    dto.created_at = vendor.createdAt instanceof Date ? vendor.createdAt.toISOString() : vendor.createdAt
    dto.updated_at = vendor.updatedAt instanceof Date ? vendor.updatedAt.toISOString() : vendor.updatedAt

    return dto
  }
}

export class VoucherVendorDetailDto {
  @ApiProperty({ description: 'Vendor ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Vendor name', example: 'Tesco' })
  name!: string

  @ApiPropertyOptional({ description: 'Vendor description', example: 'Retail voucher partner', nullable: true })
  description!: string | null

  @ApiPropertyOptional({ description: 'Vendor website', example: 'https://www.tesco.com', nullable: true })
  website!: string | null

  @ApiProperty({ description: 'Vendor status', example: 'active' })
  status!: string

  @ApiProperty({ description: 'Number of vouchers for this vendor', example: 3 })
  voucher_count!: number

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(vendor: VoucherVendor, voucherCount: number): VoucherVendorDetailDto {
    const dto = new VoucherVendorDetailDto()

    dto.id = vendor.id
    dto.name = vendor.name
    dto.description = vendor.description
    dto.website = vendor.website
    dto.status = vendor.status
    dto.voucher_count = voucherCount
    dto.created_at = vendor.createdAt instanceof Date ? vendor.createdAt.toISOString() : vendor.createdAt
    dto.updated_at = vendor.updatedAt instanceof Date ? vendor.updatedAt.toISOString() : vendor.updatedAt

    return dto
  }
}

export class VoucherVendorSummaryDto {
  @ApiProperty({ description: 'Vendor ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Vendor name', example: 'Tesco' })
  name!: string

  static fromEntity(vendor: VoucherVendor): VoucherVendorSummaryDto {
    const dto = new VoucherVendorSummaryDto()

    dto.id = vendor.id
    dto.name = vendor.name

    return dto
  }
}

export class VoucherResponseDto {
  @ApiProperty({ description: 'Voucher ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Vendor the voucher belongs to', type: VoucherVendorSummaryDto })
  vendor!: VoucherVendorSummaryDto

  @ApiProperty({ description: 'Unique voucher code', example: 'TESCO-GIFT-100' })
  code!: string

  @ApiProperty({ description: 'Voucher title', example: '£100 Gift Card' })
  title!: string

  @ApiPropertyOptional({ description: 'Voucher description', example: '£100 off your first shop', nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Voucher monetary value', example: 100 })
  value!: number

  @ApiProperty({ description: 'Voucher currency', example: 'GBP' })
  currency!: string

  @ApiProperty({ description: 'Voucher status', enum: ['AVAILABLE', 'ASSIGNED', 'REDEEMED', 'EXPIRED', 'CANCELLED'], example: 'AVAILABLE' })
  status!: string

  @ApiPropertyOptional({ description: 'Voucher expiry date', example: '2027-08-19T00:00:00.000Z', nullable: true })
  expires_at!: string | null

  @ApiPropertyOptional({ description: 'User ID the voucher is assigned to', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', nullable: true })
  assigned_to_user_id!: string | null

  @ApiPropertyOptional({ description: 'When the voucher was assigned', example: '2026-08-20T09:00:00.000Z', nullable: true })
  assigned_at!: string | null

  @ApiPropertyOptional({ description: 'When the voucher was redeemed', example: '2026-08-21T09:00:00.000Z', nullable: true })
  redeemed_at!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiPropertyOptional({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at?: string

  static fromEntity(voucher: Voucher, vendor?: VoucherVendor): VoucherResponseDto {
    const dto = new VoucherResponseDto()

    dto.id = voucher.id
    dto.vendor = vendor
      ? VoucherVendorSummaryDto.fromEntity(vendor)
      : { id: voucher.vendorId, name: 'Unknown vendor' }
    dto.code = voucher.code
    dto.title = voucher.title
    dto.description = voucher.description
    dto.value = voucher.value
    dto.currency = voucher.currency
    dto.status = voucher.status
    dto.expires_at = voucher.expiresAt instanceof Date ? voucher.expiresAt.toISOString() : voucher.expiresAt
    dto.assigned_to_user_id = voucher.assignedToUserId
    dto.assigned_at = voucher.assignedAt instanceof Date ? voucher.assignedAt.toISOString() : voucher.assignedAt
    dto.redeemed_at = voucher.redeemedAt instanceof Date ? voucher.redeemedAt.toISOString() : voucher.redeemedAt
    dto.created_at = voucher.createdAt instanceof Date ? voucher.createdAt.toISOString() : voucher.createdAt
    dto.updated_at = voucher.updatedAt instanceof Date ? voucher.updatedAt.toISOString() : voucher.updatedAt

    return dto
  }
}

export class VoucherTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 'e1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Voucher ID', example: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  voucher_id!: string

  @ApiProperty({ description: 'Transaction type', enum: ['CREATED', 'ASSIGNED', 'REDEEMED', 'EXPIRED', 'CANCELLED'], example: 'CREATED' })
  type!: string

  @ApiPropertyOptional({ description: 'User ID involved in the transaction', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', nullable: true })
  user_id!: string | null

  @ApiPropertyOptional({ description: 'Note', example: 'Voucher created by admin', nullable: true })
  note!: string | null

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  static fromEntity(transaction: VoucherTransaction): VoucherTransactionResponseDto {
    const dto = new VoucherTransactionResponseDto()

    dto.id = transaction.id
    dto.voucher_id = transaction.voucherId
    dto.type = transaction.type
    dto.user_id = transaction.userId
    dto.note = transaction.note
    dto.created_at = transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt

    return dto
  }
}