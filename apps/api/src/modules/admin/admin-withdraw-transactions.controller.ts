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
import { WithdrawTransactionsService } from '../finance/withdraw-transactions.service'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'
import { CreateWithdrawTransactionDto, UpdateWithdrawTransactionDto } from '../finance/dto/withdraw-transaction.dto'

@ApiTags('admin-withdraw-transactions')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/withdraw-transactions')
export class AdminWithdrawTransactionsController {
  constructor(private readonly withdrawService: WithdrawTransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all withdraw transactions (Admin only)' })
  @ApiOkResponse({ description: 'List of withdraw transactions' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: AdminPaginatedQueryDto) {
    const result = await this.withdrawService.findAll(query)
    return ApiResponse.success(result, 'Withdraw transactions retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a withdraw transaction by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Withdraw transaction found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Withdraw transaction not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.withdrawService.findOne(id)
    return ApiResponse.success(result, 'Withdraw transaction retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a withdraw transaction (Admin only)' })
  @ApiBody({ type: CreateWithdrawTransactionDto })
  @ApiCreatedResponse({ description: 'Withdraw transaction created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateWithdrawTransactionDto) {
    const result = await this.withdrawService.create(dto)
    return ApiResponse.success(result, 'Withdraw transaction created', 201)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a withdraw transaction (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateWithdrawTransactionDto })
  @ApiOkResponse({ description: 'Withdraw transaction updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Withdraw transaction not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateWithdrawTransactionDto) {
    const result = await this.withdrawService.update(id, dto)
    return ApiResponse.success(result, 'Withdraw transaction updated', 200)
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a withdraw transaction' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Withdraw transaction approved' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Withdraw transaction not found' })
  @ApiBadRequestResponse({ description: 'Invalid state transition' })
  async approve(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.withdrawService.approve(id)
    return ApiResponse.success(result, 'Withdraw transaction approved', 200)
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a withdraw transaction' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Withdraw transaction rejected' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Withdraw transaction not found' })
  @ApiBadRequestResponse({ description: 'Invalid state transition' })
  async reject(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.withdrawService.reject(id)
    return ApiResponse.success(result, 'Withdraw transaction rejected', 200)
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark a withdraw transaction as paid' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Withdraw transaction marked as paid' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Withdraw transaction not found' })
  @ApiBadRequestResponse({ description: 'Invalid state transition' })
  async markPaid(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.withdrawService.markPaid(id)
    return ApiResponse.success(result, 'Withdraw transaction marked as paid', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a withdraw transaction (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Withdraw transaction deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Withdraw transaction not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.withdrawService.remove(id)
    return ApiResponse.message('Withdraw transaction deleted', 200)
  }
}
