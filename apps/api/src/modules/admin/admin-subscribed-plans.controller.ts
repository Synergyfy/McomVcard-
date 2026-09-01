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
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'
import { CreateSubscribedPlanDto, UpdateSubscribedPlanDto } from '../subscriptions/dto/subscribed-plan.dto'

@ApiTags('admin-subscribed-plans')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/subscribed-plans')
export class AdminSubscribedPlansController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all subscribed plans (Admin only)' })
  @ApiOkResponse({ description: 'List of subscribed plans' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: AdminPaginatedQueryDto) {
    const result = await this.subscriptionsService.findAll(query)
    return ApiResponse.success(result, 'Subscribed plans retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscribed plan by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscribed plan found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscribed plan not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.subscriptionsService.findOne(id)
    return ApiResponse.success(result, 'Subscribed plan retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscribed plan (Admin only)' })
  @ApiBody({ type: CreateSubscribedPlanDto })
  @ApiCreatedResponse({ description: 'Subscribed plan created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateSubscribedPlanDto) {
    const result = await this.subscriptionsService.create(dto)
    return ApiResponse.success(result, 'Subscribed plan created', 201)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscribed plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateSubscribedPlanDto })
  @ApiOkResponse({ description: 'Subscribed plan updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscribed plan not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSubscribedPlanDto) {
    const result = await this.subscriptionsService.update(id, dto)
    return ApiResponse.success(result, 'Subscribed plan updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscribed plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscribed plan deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscribed plan not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.subscriptionsService.remove(id)
    return ApiResponse.message('Subscribed plan deleted', 200)
  }
}
