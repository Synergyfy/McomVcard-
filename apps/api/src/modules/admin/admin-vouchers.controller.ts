import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  ApiParam,
} from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { VoucherVendor } from '../vouchers/entities/voucher-vendor.entity'
import { Voucher } from '../vouchers/entities/voucher.entity'
import { VoucherTransaction } from '../vouchers/entities/voucher-transaction.entity'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'


class CreateVendorBodyDto {
  @ApiProperty({ example: 'Amazon', description: 'Vendor name' })
  @IsString()
  @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'Amazon gift cards and vouchers', description: 'Vendor description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional({ example: 'https://amazon.co.uk', description: 'Vendor website URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string
}


class UpdateVendorBodyDto {
  @ApiPropertyOptional({ example: 'Amazon UK', description: 'Vendor name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: 'Updated description', description: 'Vendor description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional({ example: 'https://amazon.co.uk', description: 'Vendor website URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string
}


@ApiTags('admin-vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiExtraModels(ApiResponse)
@Controller('admin/vouchers')
export class AdminVouchersController {
  constructor(
    @InjectRepository(VoucherVendor)
    private readonly vendorRepo: Repository<VoucherVendor>,
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    @InjectRepository(VoucherTransaction)
    private readonly voucherTxRepo: Repository<VoucherTransaction>,
  ) {}


  @Get('vendors')
  @ApiOperation({
    summary: 'List all voucher vendors',
    description: 'Returns all voucher vendors. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'List of vendors' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listVendors() {
    const vendors = await this.vendorRepo.find({
      relations: ['vouchers'],
      order: { createdAt: 'DESC' },
    })

    const data = vendors.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      website: v.website,
      status: v.status,
      voucher_count: v.vouchers?.length ?? 0,
      created_at: v.createdAt,
      updated_at: v.updatedAt,
    }))

    return ApiResponse.success(data, 'Vendors retrieved', 200)
  }


  @Post('vendors')
  @ApiOperation({
    summary: 'Create a voucher vendor',
    description: 'Creates a new voucher vendor. Requires ADMIN role.',
  })
  @ApiBody({ type: CreateVendorBodyDto })
  @ApiCreatedResponse({ description: 'Created vendor' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async createVendor(@Body() body: CreateVendorBodyDto) {
    const vendor = this.vendorRepo.create({
      name: body.name,
      description: body.description ?? null,
      website: body.website ?? null,
    })

    const saved = await this.vendorRepo.save(vendor)

    const data = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      website: saved.website,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Vendor created', 201)
  }


  @Patch('vendors/:id')
  @ApiOperation({
    summary: 'Update a voucher vendor',
    description: 'Updates vendor fields. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Vendor UUID', type: String })
  @ApiBody({ type: UpdateVendorBodyDto })
  @ApiOkResponse({ description: 'Updated vendor' })
  @ApiNotFoundResponse({ description: 'Vendor not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateVendorBodyDto,
  ) {
    const vendor = await this.vendorRepo.findOne({ where: { id } })

    if (!vendor) {
      throw new NotFoundException('Vendor not found')
    }

    if (body.name !== undefined) vendor.name = body.name
    if (body.description !== undefined) vendor.description = body.description ?? null
    if (body.website !== undefined) vendor.website = body.website ?? null

    const saved = await this.vendorRepo.save(vendor)

    const data = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      website: saved.website,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Vendor updated', 200)
  }


  @Delete('vendors/:id')
  @ApiOperation({
    summary: 'Delete a voucher vendor',
    description: 'Permanently removes a vendor. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Vendor UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Vendor not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteVendor(@Param('id', ParseUUIDPipe) id: string) {
    const vendor = await this.vendorRepo.findOne({ where: { id } })

    if (!vendor) {
      throw new NotFoundException('Vendor not found')
    }

    await this.vendorRepo.remove(vendor)

    return ApiResponse.success(
      { success: true, message: 'Vendor deleted' },
      'Vendor deleted',
      200,
    )
  }


  @Get()
  @ApiOperation({
    summary: 'List all vouchers (admin)',
    description: 'Returns a paginated list of vouchers with vendor relation. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of vouchers' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listVouchers(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'v.createdAt', updated_at: 'v.updatedAt', code: 'v.code', title: 'v.title', id: 'v.id', status: 'v.status', expires_at: 'v.expiresAt' }
    const sortField = sortMap[sort] || 'v.createdAt'

    const qb = this.voucherRepo.createQueryBuilder('v')
      .leftJoinAndSelect('v.vendor', 'vendor')

    if (search) {
      qb.andWhere(
        '(v.code ILIKE :search OR v.title ILIKE :search OR vendor.name ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('v.status = :status', { status })
    }

    const total = await qb.getCount()

    const vouchers = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = vouchers.map((v) => ({
      id: v.id,
      vendor_id: v.vendorId,
      vendor: v.vendor ? {
        id: v.vendor.id,
        name: v.vendor.name,
        description: v.vendor.description,
      } : null,
      code: v.code,
      title: v.title,
      description: v.description,
      value: v.value,
      currency: v.currency,
      status: v.status,
      expires_at: v.expiresAt,
      assigned_to_user_id: v.assignedToUserId,
      assigned_at: v.assignedAt,
      redeemed_at: v.redeemedAt,
      created_at: v.createdAt,
      updated_at: v.updatedAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Vouchers retrieved',
      200,
    )
  }


  @Get(':id')
  @ApiOperation({
    summary: 'Get a single voucher',
    description: 'Returns voucher details with vendor and recent transactions. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Voucher UUID', type: String })
  @ApiOkResponse({ description: 'Voucher details' })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getVoucher(@Param('id', ParseUUIDPipe) id: string) {
    const voucher = await this.voucherRepo.findOne({
      where: { id },
      relations: ['vendor'],
    })

    if (!voucher) {
      throw new NotFoundException('Voucher not found')
    }

    const transactions = await this.voucherTxRepo.find({
      where: { voucherId: id },
      order: { createdAt: 'DESC' },
      take: 10,
    })

    const data = {
      id: voucher.id,
      vendor_id: voucher.vendorId,
      vendor: voucher.vendor ? {
        id: voucher.vendor.id,
        name: voucher.vendor.name,
        description: voucher.vendor.description,
        website: voucher.vendor.website,
      } : null,
      code: voucher.code,
      title: voucher.title,
      description: voucher.description,
      value: voucher.value,
      currency: voucher.currency,
      status: voucher.status,
      expires_at: voucher.expiresAt,
      assigned_to_user_id: voucher.assignedToUserId,
      assigned_at: voucher.assignedAt,
      redeemed_at: voucher.redeemedAt,
      recent_transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        user_id: tx.userId,
        note: tx.note,
        created_at: tx.createdAt,
      })),
      created_at: voucher.createdAt,
      updated_at: voucher.updatedAt,
    }

    return ApiResponse.success(data, 'Voucher retrieved', 200)
  }


  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a voucher',
    description: 'Permanently removes a voucher. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Voucher UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteVoucher(@Param('id', ParseUUIDPipe) id: string) {
    const voucher = await this.voucherRepo.findOne({ where: { id } })

    if (!voucher) {
      throw new NotFoundException('Voucher not found')
    }

    await this.voucherRepo.remove(voucher)

    return ApiResponse.success(
      { success: true, message: 'Voucher deleted' },
      'Voucher deleted',
      200,
    )
  }
}
