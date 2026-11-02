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
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { AccessPassesService } from './access-passes.service'
import { CreateAccessPassDto, UpdateAccessPassDto } from './dto/access-pass.dto'
import { AccessPassResponseDto } from './dto/access-pass-response.dto'

@ApiTags('admin-access-passes')
@ApiExtraModels(ApiResponse, AccessPassResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/access-passes')
export class AdminAccessPassesController {
  constructor(private readonly accessPassesService: AccessPassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new access pass (Admin only)' })
  @ApiBody({ type: CreateAccessPassDto })
  @ApiCreatedResponse({ description: 'Access pass created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input or duplicate name' })
  async create(@Body() dto: CreateAccessPassDto) {
    const pass = await this.accessPassesService.create(dto)
    return ApiResponse.success(pass, 'Access pass created', 201)
  }

  @Get()
  @ApiOperation({ summary: 'List all access passes (Admin only)' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @ApiOkResponse({ description: 'List of access passes' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query('status') status?: string) {
    const passes = await this.accessPassesService.findAll(status)
    return ApiResponse.success(passes, 'Access passes retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an access pass by ID (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Access pass found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Access pass not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const pass = await this.accessPassesService.findOne(id)
    return ApiResponse.success(pass, 'Access pass retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an access pass (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateAccessPassDto })
  @ApiOkResponse({ description: 'Access pass updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Access pass not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAccessPassDto) {
    const pass = await this.accessPassesService.update(id, dto)
    return ApiResponse.success(pass, 'Access pass updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an access pass (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Access pass deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Access pass not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.accessPassesService.remove(id)
    return ApiResponse.message('Access pass deleted', 200)
  }
}
