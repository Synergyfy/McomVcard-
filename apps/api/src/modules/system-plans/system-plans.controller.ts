import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger'
import { SystemApiKeyGuard } from './system-api-key.guard'
import { SystemPlansService } from './system-plans.service'
import { CreateSystemPlanDto, UpdateSystemPlanDto, SystemPlanResponseDto } from './dto/system-plan.dto'
import { ApiResponse } from '../../lib/utils/api-response'

export interface PlanSchemaField {
  key: string
  label: string
  type: 'number' | 'boolean'
  unlimited?: boolean
}

export interface PlanSchema {
  quotas: PlanSchemaField[]
  featureFlags: PlanSchemaField[]
}

/**
 * The plan configuration contract Vcard exposes to MCOM Solutions. MCOM
 * Solutions renders quota/flag forms from this schema when creating or editing
 * plans for this platform. `unlimited` marks numeric quotas that support the
 * "Unlimited" (=-1) toggle.
 */
export const VCARD_PLAN_SCHEMA: PlanSchema = {
  quotas: [
    { key: 'maxVCards', label: 'Max VCards', type: 'number', unlimited: true },
    { key: 'maxConsumerVCards', label: 'Max Consumer VCards', type: 'number', unlimited: true },
    { key: 'maxTeamMembers', label: 'Max Team Members', type: 'number', unlimited: true },
  ],
  featureFlags: [
    { key: 'allowNfc', label: 'Allow NFC', type: 'boolean' },
    { key: 'customDomains', label: 'Custom Domains', type: 'boolean' },
    { key: 'customQrCodes', label: 'Custom QR Codes', type: 'boolean' },
    { key: 'advancedAnalytics', label: 'Advanced Analytics', type: 'boolean' },
    { key: 'dedicatedSupport', label: 'Dedicated Support', type: 'boolean' },
  ],
}

/**
 * Machine-facing plan API for MCOM Solutions (the "Generic Connector"
 * contract). Full CRUD, authenticated by `x-mcom-solution-api-key`.
 *
 * Response-shape note: the global TransformInterceptor wraps every controller
 * return in `{ data, message, statusCode, success }`. MCOM Solutions'
 * GenericHttpConnector reads `getPlans()` as `data.data` but `getPlanById()`
 * directly off the body (`plan.monthlyPrice`). To satisfy both, single-resource
 * responses return an ApiResponse instance (passed through the interceptor
 * unchanged) whose plan fields are ALSO flattened onto the top level, while the
 * list endpoint returns a bare array (which the interceptor wraps under `data`).
 */
@ApiTags('MCOM Solution - Plans')
@ApiBearerAuth()
@UseGuards(SystemApiKeyGuard)
@Controller('v1/system/plans')
export class SystemPlansController {
  constructor(private readonly systemPlansService: SystemPlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a plan (MCOM Solutions admin)' })
  @ApiBody({ type: CreateSystemPlanDto })
  @SwaggerApiResponse({ status: 201, type: SystemPlanResponseDto })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @SwaggerApiResponse({ status: 409, description: 'A plan with this name already exists' })
  async create(@Body() dto: CreateSystemPlanDto) {
    return this.toResponse(await this.systemPlansService.create(dto))
  }

  @Get()
  @ApiOperation({ summary: 'List all plans (business audience)' })
  @SwaggerApiResponse({ status: 200, type: [SystemPlanResponseDto] })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  findAll() {
    return this.systemPlansService.findAll()
  }

  /**
   * Static plan configuration schema (quotas + feature flags) consumed by MCOM
   * Solutions to render the plan form. Declared BEFORE `:id` so the literal
   * `schema` segment is never captured as a plan UUID.
   */
  @Get('schema')
  @ApiOperation({ summary: 'Get the plan configuration schema (quotas + feature flags)' })
  @SwaggerApiResponse({ status: 200, description: 'Plan schema used by MCOM Solutions to render the plan form' })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  getSchema(): PlanSchema {
    return VCARD_PLAN_SCHEMA
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @SwaggerApiResponse({ status: 200, type: SystemPlanResponseDto })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @SwaggerApiResponse({ status: 404, description: 'Plan not found' })
  async findOne(@Param('id') id: string) {
    return this.toResponse(await this.systemPlansService.findOne(id))
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan (MCOM Solutions admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateSystemPlanDto })
  @SwaggerApiResponse({ status: 200, type: SystemPlanResponseDto })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @SwaggerApiResponse({ status: 404, description: 'Plan not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateSystemPlanDto) {
    return this.toResponse(await this.systemPlansService.update(id, dto))
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan (MCOM Solutions admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @SwaggerApiResponse({ status: 200, description: 'Plan deleted' })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @SwaggerApiResponse({ status: 404, description: 'Plan not found' })
  async remove(@Param('id') id: string) {
    await this.systemPlansService.remove(id)
    return ApiResponse.message('Plan deleted')
  }

  /**
   * Build a connector-compatible single-resource response. The plan payload is
   * kept under `data` for the envelope consumers AND flattened onto the top
   * level so the GenericHttpConnector's `getPlanById`/`createPlan`/`updatePlan`
   * can read fields (e.g. `monthlyPrice`) straight off the body.
   */
  private toResponse(plan: SystemPlanResponseDto): ApiResponse<SystemPlanResponseDto> {
    return Object.assign(ApiResponse.success(plan), plan) as ApiResponse<SystemPlanResponseDto>
  }
}