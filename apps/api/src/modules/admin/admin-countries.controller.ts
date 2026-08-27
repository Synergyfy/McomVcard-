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

@ApiTags('admin-countries')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/countries')
export class AdminCountriesController {
  @Get()
  @ApiOperation({ summary: 'List all countries (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'List of countries' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: any) {
    return ApiResponse.success({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }, 'Countries retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a country (Admin only)' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, code: { type: 'string' }, iso3: { type: 'string' } } } })
  @ApiCreatedResponse({ description: 'Country created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() body: any) {
    return ApiResponse.success({ id: 'placeholder', ...body }, 'Country created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a country by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Country found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Country not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success({ id, name: 'United Kingdom', code: 'GB', iso3: 'GBR' }, 'Country retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a country (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, code: { type: 'string' }, iso3: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Country updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Country not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any) {
    return ApiResponse.success({ id, ...body }, 'Country updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a country (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Country deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Country not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.message('Country deleted', 200)
  }
}