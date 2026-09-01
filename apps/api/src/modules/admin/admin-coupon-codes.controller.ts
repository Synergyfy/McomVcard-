import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { CouponCodesService } from '../coupon-codes/coupon-codes.service'
import { CreateCouponCodeDto, UpdateCouponCodeDto } from '../coupon-codes/dto/coupon-code.dto'

@ApiTags('admin-coupon-codes')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/coupon-codes')
export class AdminCouponCodesController {
  constructor(private readonly couponCodesService: CouponCodesService) {}

  @Get()
  @ApiOperation({ summary: 'List all coupon codes (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiOkResponse({ description: 'List of coupon codes' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const result = await this.couponCodesService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      sort,
      order,
    })
    return ApiResponse.success(result, 'Coupon codes retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a coupon code (Admin only)' })
  @ApiBody({ type: CreateCouponCodeDto })
  @ApiCreatedResponse({ description: 'Coupon code created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateCouponCodeDto) {
    const coupon = await this.couponCodesService.create(dto)
    return ApiResponse.success(coupon, 'Coupon code created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon code by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Coupon code found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Coupon code not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const coupon = await this.couponCodesService.findOne(id)
    return ApiResponse.success(coupon, 'Coupon code retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon code (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateCouponCodeDto })
  @ApiOkResponse({ description: 'Coupon code updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Coupon code not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCouponCodeDto) {
    const coupon = await this.couponCodesService.update(id, dto)
    return ApiResponse.success(coupon, 'Coupon code updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon code (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Coupon code deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Coupon code not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.couponCodesService.remove(id)
    return ApiResponse.message('Coupon code deleted', 200)
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate a coupon code (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Coupon validation result' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Coupon code not found' })
  async validate(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.couponCodesService.validate(id)
    return ApiResponse.success(result, result.valid ? 'Coupon is valid' : result.reason ?? 'Coupon is invalid', 200)
  }
}
