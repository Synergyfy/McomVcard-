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
import { EmailTemplatesService } from '../email-templates/email-templates.service'
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../email-templates/dto/email-template.dto'

@ApiTags('admin-email-templates')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/email-templates')
export class AdminEmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all email templates (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'List of email templates' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: any) {
    const templates = await this.emailTemplatesService.findAll()
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const total = templates.length

    let filtered = templates
    if (query.search) {
      const search = query.search.toLowerCase()
      filtered = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.subject.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search),
      )
    }

    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return ApiResponse.success(
      { data: paginated, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      'Email templates retrieved',
      200,
    )
  }

  @Post()
  @ApiOperation({ summary: 'Create an email template (Admin only)' })
  @ApiBody({ type: CreateEmailTemplateDto })
  @ApiCreatedResponse({ description: 'Email template created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateEmailTemplateDto) {
    const template = await this.emailTemplatesService.create(dto)
    return ApiResponse.success(template, 'Email template created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an email template by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Email template found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Email template not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const template = await this.emailTemplatesService.findOne(id)
    return ApiResponse.success(template, 'Email template retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an email template (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateEmailTemplateDto })
  @ApiOkResponse({ description: 'Email template updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Email template not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateEmailTemplateDto) {
    const template = await this.emailTemplatesService.update(id, dto)
    return ApiResponse.success(template, 'Email template updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an email template (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Email template deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Email template not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.emailTemplatesService.remove(id)
    return ApiResponse.message('Email template deleted', 200)
  }
}
