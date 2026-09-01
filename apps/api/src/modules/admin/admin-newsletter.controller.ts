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
import { NewsletterService } from '../newsletter/newsletter.service'
import { CreateNewsletterCampaignDto, UpdateNewsletterCampaignDto } from '../newsletter/dto/newsletter-campaign.dto'

@ApiTags('admin-newsletter')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/newsletter')
export class AdminNewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get()
  @ApiOperation({ summary: 'List all newsletter campaigns (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiOkResponse({ description: 'List of newsletter campaigns' })
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
    const result = await this.newsletterService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status,
      sort,
      order,
    })
    return ApiResponse.success(result, 'Newsletter campaigns retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a newsletter campaign (Admin only)' })
  @ApiBody({ type: CreateNewsletterCampaignDto })
  @ApiCreatedResponse({ description: 'Newsletter campaign created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateNewsletterCampaignDto) {
    const campaign = await this.newsletterService.create(dto)
    return ApiResponse.success(campaign, 'Newsletter campaign created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a newsletter campaign by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Newsletter campaign found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const campaign = await this.newsletterService.findOne(id)
    return ApiResponse.success(campaign, 'Newsletter campaign retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a newsletter campaign (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateNewsletterCampaignDto })
  @ApiOkResponse({ description: 'Newsletter campaign updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateNewsletterCampaignDto) {
    const campaign = await this.newsletterService.update(id, dto)
    return ApiResponse.success(campaign, 'Newsletter campaign updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a newsletter campaign (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Newsletter campaign deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.newsletterService.remove(id)
    return ApiResponse.message('Newsletter campaign deleted', 200)
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a newsletter campaign (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Newsletter campaign sent' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Newsletter campaign not found' })
  @ApiBadRequestResponse({ description: 'Campaign already sent' })
  async send(@Param('id', new ParseUUIDPipe()) id: string) {
    const campaign = await this.newsletterService.send(id)
    return ApiResponse.success(campaign, 'Newsletter campaign sent', 200)
  }
}
