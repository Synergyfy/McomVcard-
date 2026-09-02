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
import { FrontCmsService } from '../cms/front-cms.service'
import { CreateFrontCmsDto, UpdateFrontCmsDto, BulkUpdateFrontCmsDto } from '../cms/dto/front-cms.dto'

@ApiTags('admin-front-cms')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/front-cms')
export class AdminFrontCMSController {
  constructor(private readonly frontCmsService: FrontCmsService) {}

  @Get()
  @ApiOperation({ summary: 'List all front CMS entries (Admin only)' })
  @ApiQuery({ name: 'group', required: false, type: String, description: 'Filter by group' })
  @ApiOkResponse({ description: 'List of front CMS entries' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query('group') group?: string) {
    const entries = group
      ? await this.frontCmsService.findByGroup(group)
      : await this.frontCmsService.findAll()

    return ApiResponse.success(entries, 'Front CMS entries retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a front CMS entry by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Front CMS entry found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Front CMS entry not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const entry = await this.frontCmsService.findOne(id)
    return ApiResponse.success(entry, 'Front CMS entry retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a front CMS entry (Admin only)' })
  @ApiBody({ type: CreateFrontCmsDto })
  @ApiCreatedResponse({ description: 'Front CMS entry created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateFrontCmsDto) {
    const entry = await this.frontCmsService.create(dto)
    return ApiResponse.success(entry, 'Front CMS entry created', 201)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a front CMS entry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateFrontCmsDto })
  @ApiOkResponse({ description: 'Front CMS entry updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Front CMS entry not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateFrontCmsDto) {
    const entry = await this.frontCmsService.update(id, dto)
    return ApiResponse.success(entry, 'Front CMS entry updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a front CMS entry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Front CMS entry deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Front CMS entry not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.frontCmsService.remove(id)
    return ApiResponse.message('Front CMS entry deleted', 200)
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update front CMS entries by group (Admin only)' })
  @ApiBody({ type: BulkUpdateFrontCmsDto })
  @ApiOkResponse({ description: 'Front CMS entries updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async bulkUpdate(@Body() dto: BulkUpdateFrontCmsDto) {
    const entries = await this.frontCmsService.setBulk(dto)
    return ApiResponse.success(entries, 'Front CMS entries updated', 200)
  }
}
