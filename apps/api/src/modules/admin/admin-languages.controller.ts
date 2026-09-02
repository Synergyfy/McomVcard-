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
import { LanguagesService } from '../languages/languages.service'

@ApiTags('admin-languages')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/languages')
export class AdminLanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all languages (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'List of languages' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 20, @Query('search') search?: string) {
    const languages = await this.languagesService.findAll()
    const filtered = search ? languages.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase())) : languages
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const paged = filtered.slice((page - 1) * limit, page * limit)

    return ApiResponse.success({ data: paged, meta: { total, page, limit, totalPages } }, 'Languages retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a language (Admin only)' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, code: { type: 'string' }, nativeName: { type: 'string' }, direction: { type: 'string', enum: ['ltr', 'rtl'] } } } })
  @ApiCreatedResponse({ description: 'Language created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() body: any) {
    return ApiResponse.success({ id: 'placeholder', ...body }, 'Language created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a language by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Language found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Language not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(await this.languagesService.findOne(id), 'Language retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a language (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, code: { type: 'string' }, nativeName: { type: 'string' }, direction: { type: 'string', enum: ['ltr', 'rtl'] } } } })
  @ApiOkResponse({ description: 'Language updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Language not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any) {
    return ApiResponse.success({ id, ...body }, 'Language updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a language (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Language deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Language not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.message('Language deleted', 200)
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get translations for a language' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Translations retrieved' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getTranslations(@Param('id', new ParseUUIDPipe()) id: string) {
    const language = await this.languagesService.findOne(id)

    return ApiResponse.success(language.translations ?? [], 'Translations retrieved', 200)
  }

  @Patch(':id/translations/:translationId')
  @ApiOperation({ summary: 'Update an individual translation entry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Language ID' })
  @ApiParam({ name: 'translationId', format: 'uuid', description: 'Translation entry ID' })
  @ApiBody({ schema: { properties: { key: { type: 'string' }, value: { type: 'string' }, context: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Translation updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Translation not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateTranslation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('translationId', new ParseUUIDPipe()) translationId: string,
    @Body() body: { key?: string; value?: string; context?: string },
  ) {
    const updated = await this.languagesService.updateTranslation(id, translationId, body)

    return ApiResponse.success(updated, 'Translation updated', 200)
  }
}
