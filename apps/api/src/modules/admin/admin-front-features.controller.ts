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
import { FeaturesService } from '../features/features.service'
import { CreateFeatureDto, UpdateFeatureDto } from '../features/dto/feature.dto'

@ApiTags('admin-features')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/features')
export class AdminFrontFeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  @ApiOperation({ summary: 'List all front features (Admin only)' })
  @ApiOkResponse({ description: 'List of features' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll() {
    const features = await this.featuresService.findAll()
    return ApiResponse.success(features, 'Features retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a front feature (Admin only)' })
  @ApiBody({ type: CreateFeatureDto })
  @ApiCreatedResponse({ description: 'Feature created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateFeatureDto) {
    const feature = await this.featuresService.create(dto)
    return ApiResponse.success(feature, 'Feature created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a front feature by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Feature found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const feature = await this.featuresService.findOne(id)
    return ApiResponse.success(feature, 'Feature retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a front feature (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateFeatureDto })
  @ApiOkResponse({ description: 'Feature updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateFeatureDto) {
    const feature = await this.featuresService.update(id, dto)
    return ApiResponse.success(feature, 'Feature updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a front feature (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Feature deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.featuresService.remove(id)
    return ApiResponse.message('Feature deleted', 200)
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder features (Admin only)' })
  @ApiBody({ schema: { properties: { ids: { type: 'array', items: { type: 'string', format: 'uuid' } } } } })
  @ApiOkResponse({ description: 'Features reordered' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async reorder(@Body() body: { ids: string[] }) {
    const features = await this.featuresService.reorder(body.ids)
    return ApiResponse.success(features, 'Features reordered', 200)
  }
}
