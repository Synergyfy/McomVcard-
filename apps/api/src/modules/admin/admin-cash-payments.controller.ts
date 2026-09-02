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
import { CashPaymentsService } from '../finance/cash-payments.service'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'
import { CreateCashPaymentDto, UpdateCashPaymentDto } from '../finance/dto/cash-payment.dto'

@ApiTags('admin-cash-payments')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/cash-payments')
export class AdminCashPaymentsController {
  constructor(private readonly cashPaymentsService: CashPaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all cash payments (Admin only)' })
  @ApiOkResponse({ description: 'List of cash payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: AdminPaginatedQueryDto) {
    const result = await this.cashPaymentsService.findAll(query)
    return ApiResponse.success(result, 'Cash payments retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cash payment by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Cash payment found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Cash payment not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.cashPaymentsService.findOne(id)
    return ApiResponse.success(result, 'Cash payment retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a cash payment (Admin only)' })
  @ApiBody({ type: CreateCashPaymentDto })
  @ApiCreatedResponse({ description: 'Cash payment created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateCashPaymentDto) {
    const result = await this.cashPaymentsService.create(dto)
    return ApiResponse.success(result, 'Cash payment created', 201)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cash payment (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateCashPaymentDto })
  @ApiOkResponse({ description: 'Cash payment updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Cash payment not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCashPaymentDto) {
    const result = await this.cashPaymentsService.update(id, dto)
    return ApiResponse.success(result, 'Cash payment updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cash payment (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Cash payment deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Cash payment not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.cashPaymentsService.remove(id)
    return ApiResponse.message('Cash payment deleted', 200)
  }
}
