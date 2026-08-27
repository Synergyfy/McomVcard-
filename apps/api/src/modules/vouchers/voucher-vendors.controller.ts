import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { VouchersService } from './vouchers.service'
import { CreateVoucherVendorDto, UpdateVoucherVendorDto } from './dto/voucher.dto'
import { VoucherVendorDetailDto, VoucherVendorResponseDto } from './dto/voucher-response.dto'

@ApiTags('vouchers')
@ApiExtraModels(ApiResponse, VoucherVendorResponseDto, VoucherVendorDetailDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('vouchers/vendors')
export class VoucherVendorsController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a voucher vendor', description: 'Creates a platform-wide voucher vendor. Voucher vendors are shared configuration (not owned by a single business).' })
  @ApiBody({
    type: CreateVoucherVendorDto,
    examples: { default: { summary: 'Create a vendor', value: { name: 'Tesco', description: 'Retail voucher partner', website: 'https://www.tesco.com' } } },
  })
  @ApiCreatedResponse({
    description: 'Voucher vendor created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherVendorResponseDto) } } },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createVendor(@Body() body: CreateVoucherVendorDto) {
    return this.vouchersService.createVendor(body)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List voucher vendors', description: 'Returns all platform-wide voucher vendors, ordered by name.' })
  @ApiOkResponse({
    description: 'Voucher vendors',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(VoucherVendorResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listVendors() {
    return this.vouchersService.listVendors()
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a voucher vendor', description: 'Returns a single voucher vendor with its voucher count.' })
  @ApiOkResponse({
    description: 'Voucher vendor found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherVendorDetailDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher vendor not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getVendor(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.getVendor(id)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a voucher vendor', description: 'Updates name, description, website, or status of a voucher vendor.' })
  @ApiBody({
    type: UpdateVoucherVendorDto,
    examples: { default: { summary: 'Update a vendor', value: { name: 'Tesco Stores', status: 'inactive' } } },
  })
  @ApiOkResponse({
    description: 'Voucher vendor updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(VoucherVendorResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Voucher vendor not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async updateVendor(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateVoucherVendorDto) {
    return this.vouchersService.updateVendor(id, body)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a voucher vendor', description: 'Removes a voucher vendor. Its vouchers and their transaction history are cascaded and deleted.' })
  @ApiOkResponse({ description: 'Voucher vendor removed', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }] } })
  @ApiNotFoundResponse({ description: 'Voucher vendor not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async removeVendor(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vouchersService.removeVendor(id)
  }
}