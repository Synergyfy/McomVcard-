import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common'
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
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { AboutUsService } from '../about-us/about-us.service'
import { CreateAboutUsDto, UpdateAboutUsDto } from '../about-us/dto/about-us.dto'

@ApiTags('admin-about-us')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/about-us')
export class AdminAboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @Get()
  @ApiOperation({ summary: 'List all about us entries (Admin only)' })
  @ApiOkResponse({ description: 'List of about us entries' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll() {
    const result = await this.aboutUsService.findAll()
    return ApiResponse.success(result, 'About us entries retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an about us entry by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'About us entry found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'About us entry not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.aboutUsService.findOne(id)
    return ApiResponse.success(result, 'About us entry retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create an about us entry (Admin only)' })
  @ApiBody({ type: CreateAboutUsDto })
  @ApiCreatedResponse({ description: 'About us entry created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateAboutUsDto) {
    const result = await this.aboutUsService.create(dto)
    return ApiResponse.success(result, 'About us entry created', 201)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an about us entry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateAboutUsDto })
  @ApiOkResponse({ description: 'About us entry updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'About us entry not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAboutUsDto) {
    const result = await this.aboutUsService.update(id, dto)
    return ApiResponse.success(result, 'About us entry updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an about us entry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'About us entry deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'About us entry not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.aboutUsService.remove(id)
    return ApiResponse.message('About us entry deleted', 200)
  }
}
