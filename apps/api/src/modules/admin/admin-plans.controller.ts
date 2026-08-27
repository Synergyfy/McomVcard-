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
import { PlansService } from '../plans/plans.service'
import { CreatePlanDto, UpdatePlanDto, PlanLevel, PlanAudience } from '../plans/dto/plan.dto'
import { PlanResponseDto } from '../plans/dto/plan-response.dto'

@ApiTags('admin-plans')
@ApiExtraModels(ApiResponse, PlanResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/plans')
export class AdminPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plan (Admin only)' })
  @ApiBody({ type: CreatePlanDto })
  @ApiCreatedResponse({ description: 'Plan created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(PlanResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input or duplicate plan' })
  async create(@Body() dto: CreatePlanDto) {
    const plan = await this.plansService.create(dto)
    return ApiResponse.success(plan, 'Plan created', 201)
  }

  @Get()
  @ApiOperation({ summary: 'List all plans (optionally filtered by audience)' })
  @ApiQuery({ name: 'audience', required: false, enum: ['business', 'consumer'], description: 'Filter by audience' })
  @ApiOkResponse({ description: 'List of plans', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(PlanResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query('audience') audience?: PlanAudience) {
    const plans = await this.plansService.findAll(audience)
    return ApiResponse.success(plans, 'Plans retrieved', 200)
  }

  @Get('seed')
  @ApiOperation({ summary: 'Seed default plans for all levels and audiences (Admin only)' })
  @ApiOkResponse({ description: 'Default plans seeded', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(PlanResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async seedDefaults() {
    const plans = await this.plansService.seedDefaults()
    return ApiResponse.success(plans, 'Default plans seeded', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Plan found', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(PlanResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const plan = await this.plansService.findOne(id)
    return ApiResponse.success(plan, 'Plan retrieved', 200)
  }

  @Get('level/:level/audience/:audience')
  @ApiOperation({ summary: 'Get a plan by level and audience' })
  @ApiParam({ name: 'level', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] })
  @ApiParam({ name: 'audience', enum: ['business', 'consumer'] })
  @ApiOkResponse({ description: 'Plan found', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(PlanResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async findByLevelAndAudience(@Param('level') level: PlanLevel, @Param('audience') audience: PlanAudience) {
    const plan = await this.plansService.findByLevelAndAudience(level, audience)
    return ApiResponse.success(plan, 'Plan retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdatePlanDto })
  @ApiOkResponse({ description: 'Plan updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(PlanResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePlanDto) {
    const plan = await this.plansService.update(id, dto)
    return ApiResponse.success(plan, 'Plan updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Plan deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { message: { type: 'string', example: 'Plan deleted' } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.plansService.remove(id)
    return ApiResponse.message('Plan deleted', 200)
  }
}