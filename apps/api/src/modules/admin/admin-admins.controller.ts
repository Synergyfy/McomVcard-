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

@ApiTags('admin-admins')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/admins')
export class AdminAdminsController {
  @Get()
  @ApiOperation({ summary: 'List all admins (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'List of admins' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: any) {
    return ApiResponse.success({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }, 'Admins retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create an admin (Admin only)' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' } } } })
  @ApiCreatedResponse({ description: 'Admin created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() body: any) {
    return ApiResponse.success({ id: 'placeholder', ...body }, 'Admin created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Admin found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success({ id, email: 'admin@example.com', name: 'Admin User', roles: ['ADMIN'] }, 'Admin retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, name: { type: 'string' }, roles: { type: 'array', items: { type: 'string' } } } } })
  @ApiOkResponse({ description: 'Admin updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any) {
    return ApiResponse.success({ id, ...body }, 'Admin updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Admin deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.message('Admin deleted', 200)
  }
}