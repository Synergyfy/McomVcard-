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
import { FaqsService } from '../faqs/faqs.service'
import { CreateFaqDto, UpdateFaqDto, ReorderFaqDto } from '../faqs/dto/faq.dto'

@ApiTags('admin-faqs')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/faqs')
export class AdminFaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @ApiOperation({ summary: 'List all FAQs (Admin only)' })
  @ApiOkResponse({ description: 'List of FAQs' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll() {
    const faqs = await this.faqsService.findAll()
    return ApiResponse.success(faqs, 'FAQs retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create an FAQ (Admin only)' })
  @ApiBody({ type: CreateFaqDto })
  @ApiCreatedResponse({ description: 'FAQ created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateFaqDto) {
    const faq = await this.faqsService.create(dto)
    return ApiResponse.success(faq, 'FAQ created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an FAQ by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'FAQ found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const faq = await this.faqsService.findOne(id)
    return ApiResponse.success(faq, 'FAQ retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an FAQ (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateFaqDto })
  @ApiOkResponse({ description: 'FAQ updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateFaqDto) {
    const faq = await this.faqsService.update(id, dto)
    return ApiResponse.success(faq, 'FAQ updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'FAQ deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.faqsService.remove(id)
    return ApiResponse.message('FAQ deleted', 200)
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder FAQs by providing ordered IDs' })
  @ApiBody({ type: ReorderFaqDto })
  @ApiOkResponse({ description: 'FAQs reordered' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async reorder(@Body() dto: ReorderFaqDto) {
    const faqs = await this.faqsService.reorder(dto.ids)
    return ApiResponse.success(faqs, 'FAQs reordered', 200)
  }
}
