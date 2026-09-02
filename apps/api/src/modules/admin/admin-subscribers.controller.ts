import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
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
import { SubscribersService } from '../newsletter/subscribers.service'
import { CreateSubscriberDto } from '../newsletter/dto/subscriber.dto'

@ApiTags('admin-subscribers')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/subscribers')
export class AdminSubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Get()
  @ApiOperation({ summary: 'List all subscribers (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiOkResponse({ description: 'List of subscribers' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const result = await this.subscribersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
      sort,
      order,
    })
    return ApiResponse.success(result, 'Subscribers retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscriber (Admin only)' })
  @ApiBody({ type: CreateSubscriberDto })
  @ApiCreatedResponse({ description: 'Subscriber created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateSubscriberDto) {
    const subscriber = await this.subscribersService.create(dto)
    return ApiResponse.success(subscriber, 'Subscriber created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscriber by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscriber found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscriber not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const subscriber = await this.subscribersService.findOne(id)
    return ApiResponse.success(subscriber, 'Subscriber retrieved', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscriber (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscriber deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscriber not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.subscribersService.remove(id)
    return ApiResponse.message('Subscriber deleted', 200)
  }

  @Post(':id/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe a subscriber (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Subscriber unsubscribed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Subscriber not found' })
  async unsubscribe(@Param('id', new ParseUUIDPipe()) id: string) {
    const subscriber = await this.subscribersService.unsubscribe(id)
    return ApiResponse.success(subscriber, 'Subscriber unsubscribed', 200)
  }
}
