import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { PlansService } from './plans.service'
import { CreatePlanDto, UpdatePlanDto, PlanLevel, PlanAudience } from './dto/plan.dto'
import { PlanResponseDto } from './dto/plan-response.dto'

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new plan (Admin only)' })
  @ApiBody({ type: CreatePlanDto, examples: {
    businessGold: {
      summary: 'Business Gold Plan',
      value: {
        level: 'Gold',
        audience: 'business',
        name: 'Gold',
        tagline: 'High-tier access with the full VCard suite and premium QR features.',
        popular: true,
        sortOrder: 2,
        features: [
          { text: '50 Business VCards', description: 'Business vCards your team can create and publish.', scope: 'All' },
          { text: '200 Consumer VCards', description: 'Consumer vCards you can issue to customers.', scope: 'All' },
        ],
        rules: [
          { label: 'Business VCards', values: { Normal: '50', Pro: '100', 'Pro+': '200' }, description: 'Business vCards the business can create and publish.', scope: 'All' },
        ],
        tiers: {
          Normal: { monthly: 0, quarterly: 0, semiannual: 0, annual: 0, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
          Pro: { monthly: 449, quarterly: 1212, semiannual: 2425, annual: 4490, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
          'Pro+': { monthly: 674, quarterly: 1818, semiannual: 3637, annual: 6735, setupFee: 0, trialDays: 7, description: '', scope: 'All' },
        },
        sections: {
          price: { description: 'Prices for the selected tier...' },
          feature: { description: 'Check-list items shown on the plan cards.' },
          rule: { description: 'Limits enforced across admin setup...' },
        },
        annualDiscount: { type: 'months', value: 2 },
        currency: 'GBP',
      },
    },
    consumerGold: {
      summary: 'Consumer Gold Plan',
      value: {
        level: 'Gold',
        audience: 'consumer',
        name: 'Gold',
        tagline: 'Premium access with guest passes and first-in-line campaigns.',
        popular: true,
        sortOrder: 2,
        features: [
          { text: '1 Digital membership card', description: 'Your membership card in the MCOM app.', scope: 'All' },
          { text: '6 Family cards', description: 'Cards you can allocate to family.', scope: 'All' },
        ],
        rules: [
          { label: 'Store Cards collectable', values: { Normal: '40', Pro: '80', 'Pro+': '160' }, description: 'Number of business store cards you can collect.', scope: 'All' },
        ],
        tiers: {
          Normal: { monthly: 0, quarterly: 0, semiannual: 0, annual: 0, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
          Pro: { monthly: 29, quarterly: 78, semiannual: 157, annual: 290, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
          'Pro+': { monthly: 44, quarterly: 117, semiannual: 235, annual: 435, setupFee: 0, trialDays: 7, description: '', scope: 'All' },
        },
        sections: {
          price: { description: 'Consumer access prices...' },
          feature: { description: 'Consumer membership feature check-list items.' },
          rule: { description: 'Consumer usage limits shown on cards...' },
        },
        annualDiscount: { type: 'months', value: 2 },
        currency: 'GBP',
      },
    },
  } })
  @ApiResponse({ status: 201, description: 'Plan created', type: PlanResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate plan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() dto: CreatePlanDto): Promise<{ success: boolean; message: string; data: PlanResponseDto; statusCode: number }> {
    const plan = await this.plansService.create(dto)
    return { success: true, message: 'Plan created', data: plan, statusCode: 201 }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all plans (optionally filtered by audience)' })
  @ApiQuery({ name: 'audience', required: false, enum: ['business', 'consumer'], description: 'Filter by audience' })
  @ApiResponse({ status: 200, description: 'List of plans', type: [PlanResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('audience') audience?: PlanAudience,
  ): Promise<{ success: boolean; message: string; data: PlanResponseDto[]; statusCode: number }> {
    const plans = await this.plansService.findAll(audience)
    return { success: true, message: 'Plans retrieved', data: plans, statusCode: 200 }
  }

  @Get('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed default plans for all levels and audiences (Admin only)' })
  @ApiResponse({ status: 200, description: 'Default plans seeded', type: [PlanResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async seedDefaults(): Promise<{ success: boolean; message: string; data: PlanResponseDto[]; statusCode: number }> {
    const plans = await this.plansService.seedDefaults()
    return { success: true, message: 'Default plans seeded', data: plans, statusCode: 200 }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Plan found', type: PlanResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findOne(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; data: PlanResponseDto; statusCode: number }> {
    const plan = await this.plansService.findOne(id)
    return { success: true, message: 'Plan retrieved', data: plan, statusCode: 200 }
  }

  @Get('level/:level/audience/:audience')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a plan by level and audience' })
  @ApiParam({ name: 'level', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] })
  @ApiParam({ name: 'audience', enum: ['business', 'consumer'] })
  @ApiResponse({ status: 200, description: 'Plan found', type: PlanResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findByLevelAndAudience(
    @Param('level') level: PlanLevel,
    @Param('audience') audience: PlanAudience,
  ): Promise<{ success: boolean; message: string; data: PlanResponseDto; statusCode: number }> {
    const plan = await this.plansService.findByLevelAndAudience(level, audience)
    return { success: true, message: 'Plan retrieved', data: plan, statusCode: 200 }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdatePlanDto })
  @ApiResponse({ status: 200, description: 'Plan updated', type: PlanResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ): Promise<{ success: boolean; message: string; data: PlanResponseDto; statusCode: number }> {
    const plan = await this.plansService.update(id, dto)
    return { success: true, message: 'Plan updated', data: plan, statusCode: 200 }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a plan (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Plan deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string; data: null; statusCode: number }> {
    await this.plansService.remove(id)
    return { success: true, message: 'Plan deleted', data: null, statusCode: 200 }
  }
}