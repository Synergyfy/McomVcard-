import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { VouchersService } from './vouchers.service'
import { CreateVoucherDto } from './dto/voucher.dto'
import { VoucherResponseDto, VoucherTransactionResponseDto } from './dto/voucher-response.dto'

@ApiTags('vouchers')
@ApiExtraModels(ApiResponse, VoucherResponseDto, VoucherTransactionResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a voucher', description: 'Creates a voucher for a vendor in AVAILABLE status. The voucher code must be unique. A CREATED ledger row is recorded.' })
  @ApiBody({
    type: CreateVoucherDto,
    examples: { default: { summary: 'Create a voucher', value: { vendor_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', code: 'TESCO-GIFT-100', title: '£100 Gift Card', value: 100, currency: 'GBP', expires_at: '2027-08-19T00:00:00.000Z' } } },
  })
  @ApiCreatedResponse({
    description: 'Voucher created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher vendor not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or duplicate voucher code' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createVoucher(@Body() body: CreateVoucherDto) {
    return this.vouchersService.createVoucher(body)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List vouchers', description: 'Returns all vouchers (optionally filtered by status), newest first. Vouchers whose expiry has passed are lazily marked EXPIRED.' })
  @ApiQuery({ name: 'status', required: false, enum: ['AVAILABLE', 'ASSIGNED', 'REDEEMED', 'EXPIRED', 'CANCELLED'], description: 'Filter by voucher status' })
  @ApiOkResponse({
    description: 'Vouchers',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(VoucherResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid status filter' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listVouchers(@CurrentUser() user: UserResponseDto, @Query('status') status?: string) {
    return this.vouchersService.listVouchers(user.id, status)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a voucher', description: 'Returns a single voucher with its vendor. Expired vouchers are lazily marked EXPIRED.' })
  @ApiOkResponse({
    description: 'Voucher found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getVoucher(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.getVoucher(id)
  }

  @Post(':id/claim')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a voucher', description: 'Claims an AVAILABLE voucher for the authenticated user (→ ASSIGNED). A voucher can only be claimed once. An ASSIGNED ledger row is recorded.' })
  @ApiCreatedResponse({
    description: 'Voucher claimed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiBadRequestResponse({ description: 'Voucher is not available, already claimed, or expired' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async claimVoucher(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.claimVoucher(user.id, id)
  }

  @Post(':id/redeem')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem a voucher', description: 'Redeems an ASSIGNED voucher (→ REDEEMED, terminal state). Only the assigned user can redeem. An REDEEMED ledger row is recorded.' })
  @ApiCreatedResponse({
    description: 'Voucher redeemed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiBadRequestResponse({ description: 'Voucher is not assigned or expired' })
  @ApiForbiddenResponse({ description: 'Voucher is assigned to a different user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async redeemVoucher(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.redeemVoucher(user.id, id)
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a voucher', description: 'Cancels a voucher (→ CANCELLED, terminal state). An ASSIGNED voucher may only be cancelled by the assigned user; AVAILABLE ones by anyone. Redeemed vouchers cannot be cancelled. A CANCELLED ledger row is recorded.' })
  @ApiCreatedResponse({
    description: 'Voucher cancelled',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiBadRequestResponse({ description: 'Voucher is redeemed or already cancelled' })
  @ApiForbiddenResponse({ description: 'Voucher is assigned to a different user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async cancelVoucher(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.cancelVoucher(user.id, id)
  }

  @Get(':id/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List voucher transactions', description: 'Returns the full transaction/history ledger for a voucher (CREATED → ASSIGNED → REDEEMED/EXPIRED/CANCELLED), oldest first.' })
  @ApiOkResponse({
    description: 'Voucher transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(VoucherTransactionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listTransactions(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.listTransactions(id)
  }
}