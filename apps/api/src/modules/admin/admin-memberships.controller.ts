import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  ApiParam,
} from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { Membership } from '../memberships/entities/membership.entity'
import { MembershipTier } from '../memberships/entities/membership-tier.entity'
import { Benefit } from '../memberships/entities/benefit.entity'
import { User } from '../users/entities/user.entity'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'


class UpdateMembershipStatusBodyDto {
  @ApiProperty({ enum: ['active', 'cancelled', 'expired'], example: 'active', description: 'New status for the membership' })
  @IsIn(['active', 'cancelled', 'expired'])
  status!: 'active' | 'cancelled' | 'expired'
}


class CreateTierBodyDto {
  @ApiProperty({ example: 'Gold', description: 'Tier name' })
  @IsString()
  @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'Premium tier with exclusive benefits', description: 'Tier description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'percentage', description: 'Discount type (percentage or fixed)' })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  discount_type?: string

  @ApiPropertyOptional({ example: 15.5, description: 'Discount value' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_value?: number

  @ApiPropertyOptional({ example: 1, description: 'Sort order for display' })
  @IsOptional()
  @IsNumber()
  sort_order?: number
}


class UpdateTierBodyDto {
  @ApiPropertyOptional({ example: 'Platinum', description: 'Tier name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: 'Updated description', description: 'Tier description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'fixed', description: 'Discount type' })
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  discount_type?: string

  @ApiPropertyOptional({ example: 20, description: 'Discount value' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_value?: number

  @ApiPropertyOptional({ example: 2, description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sort_order?: number
}


class CreateBenefitBodyDto {
  @ApiProperty({ example: 'Free Shipping', description: 'Benefit name' })
  @IsString()
  @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'Free express shipping on all orders', description: 'Benefit description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'perk', description: 'Benefit type (perk, discount, access, etc.)' })
  @IsOptional()
  @IsIn(['perk', 'discount', 'access', 'gift'])
  benefit_type?: string
}


class UpdateBenefitBodyDto {
  @ApiPropertyOptional({ example: 'Priority Support', description: 'Benefit name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: 'Updated description', description: 'Benefit description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 'access', description: 'Benefit type' })
  @IsOptional()
  @IsIn(['perk', 'discount', 'access', 'gift'])
  benefit_type?: string
}


@ApiTags('admin-memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiExtraModels(ApiResponse)
@Controller('admin/memberships')
export class AdminMembershipsController {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(MembershipTier)
    private readonly tierRepo: Repository<MembershipTier>,
    @InjectRepository(Benefit)
    private readonly benefitRepo: Repository<Benefit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}


  @Get()
  @ApiOperation({
    summary: 'List all memberships (admin)',
    description: 'Returns a paginated list of memberships with user and tier relations. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of memberships' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listMemberships(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'm.createdAt', updated_at: 'm.updatedAt', id: 'm.id', status: 'm.status', started_at: 'm.startedAt', expires_at: 'm.expiresAt' }
    const sortField = sortMap[sort] || 'm.createdAt'

    const qb = this.membershipRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoinAndSelect('m.tier', 't')

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search OR t.name ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('m.status = :status', { status })
    }

    const total = await qb.getCount()

    const memberships = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = memberships.map((m) => ({
      id: m.id,
      user_id: m.userId,
      user: m.user ? {
        id: m.user.id,
        email: m.user.email,
        first_name: m.user.firstName ?? null,
        last_name: m.user.lastName ?? null,
      } : null,
      tier_id: m.membershipTierId,
      tier: m.tier ? {
        id: m.tier.id,
        name: m.tier.name,
        discount_type: m.tier.discountType,
        discount_value: m.tier.discountValue,
      } : null,
      status: m.status,
      started_at: m.startedAt,
      expires_at: m.expiresAt,
      created_at: m.createdAt,
      updated_at: m.updatedAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Memberships retrieved',
      200,
    )
  }


  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update membership status',
    description: 'Sets the membership status to active, cancelled, or expired. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Membership UUID', type: String })
  @ApiBody({ type: UpdateMembershipStatusBodyDto })
  @ApiOkResponse({ description: 'Updated membership with new status' })
  @ApiNotFoundResponse({ description: 'Membership not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateMembershipStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMembershipStatusBodyDto,
  ) {
    const membership = await this.membershipRepo.findOne({
      where: { id },
      relations: ['user', 'tier'],
    })

    if (!membership) {
      throw new NotFoundException('Membership not found')
    }

    membership.status = body.status
    await this.membershipRepo.save(membership)

    const data = {
      id: membership.id,
      user_id: membership.userId,
      user: membership.user ? {
        id: membership.user.id,
        email: membership.user.email,
        first_name: membership.user.firstName ?? null,
        last_name: membership.user.lastName ?? null,
      } : null,
      tier_id: membership.membershipTierId,
      tier: membership.tier ? {
        id: membership.tier.id,
        name: membership.tier.name,
        discount_type: membership.tier.discountType,
        discount_value: membership.tier.discountValue,
      } : null,
      status: membership.status,
      started_at: membership.startedAt,
      expires_at: membership.expiresAt,
      created_at: membership.createdAt,
      updated_at: membership.updatedAt,
    }

    return ApiResponse.success(data, 'Membership status updated', 200)
  }


  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a membership',
    description: 'Permanently removes a membership record. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Membership UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Membership not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteMembership(@Param('id', ParseUUIDPipe) id: string) {
    const membership = await this.membershipRepo.findOne({ where: { id } })

    if (!membership) {
      throw new NotFoundException('Membership not found')
    }

    await this.membershipRepo.remove(membership)

    return ApiResponse.success(
      { success: true, message: 'Membership deleted' },
      'Membership deleted',
      200,
    )
  }


  @Get('tiers')
  @ApiOperation({
    summary: 'List all membership tiers',
    description: 'Returns all membership tiers with their benefits. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'List of tiers with benefits' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listTiers() {
    const tiers = await this.tierRepo.find({
      relations: ['benefits', 'benefits.benefit'],
      order: { sortOrder: 'ASC' },
    })

    const data = tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      discount_type: tier.discountType,
      discount_value: tier.discountValue,
      sort_order: tier.sortOrder,
      status: tier.status,
      benefits: (tier.benefits || []).map((mb) => ({
        id: mb.benefit?.id ?? mb.id,
        name: mb.benefit?.name ?? null,
        description: mb.benefit?.description ?? null,
        benefit_type: mb.benefit?.benefitType ?? null,
      })),
      created_at: tier.createdAt,
      updated_at: tier.updatedAt,
    }))

    return ApiResponse.success(data, 'Tiers retrieved', 200)
  }


  @Post('tiers')
  @ApiOperation({
    summary: 'Create a membership tier',
    description: 'Creates a new membership tier. Requires ADMIN role.',
  })
  @ApiBody({ type: CreateTierBodyDto })
  @ApiCreatedResponse({ description: 'Created tier' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async createTier(@Body() body: CreateTierBodyDto) {
    const tier = this.tierRepo.create({
      name: body.name,
      description: body.description ?? null,
      discountType: body.discount_type ?? 'percentage',
      discountValue: body.discount_value ?? 0,
      sortOrder: body.sort_order ?? 0,
    })

    const saved = await this.tierRepo.save(tier)

    const data = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      discount_type: saved.discountType,
      discount_value: saved.discountValue,
      sort_order: saved.sortOrder,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Tier created', 201)
  }


  @Patch('tiers/:id')
  @ApiOperation({
    summary: 'Update a membership tier',
    description: 'Updates tier fields. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Tier UUID', type: String })
  @ApiBody({ type: UpdateTierBodyDto })
  @ApiOkResponse({ description: 'Updated tier' })
  @ApiNotFoundResponse({ description: 'Tier not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateTier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTierBodyDto,
  ) {
    const tier = await this.tierRepo.findOne({ where: { id } })

    if (!tier) {
      throw new NotFoundException('Tier not found')
    }

    if (body.name !== undefined) tier.name = body.name
    if (body.description !== undefined) tier.description = body.description ?? null
    if (body.discount_type !== undefined) tier.discountType = body.discount_type
    if (body.discount_value !== undefined) tier.discountValue = body.discount_value
    if (body.sort_order !== undefined) tier.sortOrder = body.sort_order

    const saved = await this.tierRepo.save(tier)

    const data = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      discount_type: saved.discountType,
      discount_value: saved.discountValue,
      sort_order: saved.sortOrder,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Tier updated', 200)
  }


  @Delete('tiers/:id')
  @ApiOperation({
    summary: 'Delete a membership tier',
    description: 'Permanently removes a tier. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Tier UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Tier not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteTier(@Param('id', ParseUUIDPipe) id: string) {
    const tier = await this.tierRepo.findOne({ where: { id } })

    if (!tier) {
      throw new NotFoundException('Tier not found')
    }

    await this.tierRepo.remove(tier)

    return ApiResponse.success(
      { success: true, message: 'Tier deleted' },
      'Tier deleted',
      200,
    )
  }


  @Get('benefits')
  @ApiOperation({
    summary: 'List all benefits',
    description: 'Returns all available membership benefits. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'List of benefits' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listBenefits() {
    const benefits = await this.benefitRepo.find({
      order: { createdAt: 'ASC' },
    })

    const data = benefits.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      benefit_type: b.benefitType,
      status: b.status,
      created_at: b.createdAt,
      updated_at: b.updatedAt,
    }))

    return ApiResponse.success(data, 'Benefits retrieved', 200)
  }


  @Post('benefits')
  @ApiOperation({
    summary: 'Create a benefit',
    description: 'Creates a new membership benefit. Requires ADMIN role.',
  })
  @ApiBody({ type: CreateBenefitBodyDto })
  @ApiCreatedResponse({ description: 'Created benefit' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async createBenefit(@Body() body: CreateBenefitBodyDto) {
    const benefit = this.benefitRepo.create({
      name: body.name,
      description: body.description ?? null,
      benefitType: body.benefit_type ?? 'perk',
    })

    const saved = await this.benefitRepo.save(benefit)

    const data = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      benefit_type: saved.benefitType,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Benefit created', 201)
  }


  @Patch('benefits/:id')
  @ApiOperation({
    summary: 'Update a benefit',
    description: 'Updates benefit fields. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Benefit UUID', type: String })
  @ApiBody({ type: UpdateBenefitBodyDto })
  @ApiOkResponse({ description: 'Updated benefit' })
  @ApiNotFoundResponse({ description: 'Benefit not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateBenefit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBenefitBodyDto,
  ) {
    const benefit = await this.benefitRepo.findOne({ where: { id } })

    if (!benefit) {
      throw new NotFoundException('Benefit not found')
    }

    if (body.name !== undefined) benefit.name = body.name
    if (body.description !== undefined) benefit.description = body.description ?? null
    if (body.benefit_type !== undefined) benefit.benefitType = body.benefit_type

    const saved = await this.benefitRepo.save(benefit)

    const data = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      benefit_type: saved.benefitType,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Benefit updated', 200)
  }


  @Delete('benefits/:id')
  @ApiOperation({
    summary: 'Delete a benefit',
    description: 'Permanently removes a benefit. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Benefit UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Benefit not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteBenefit(@Param('id', ParseUUIDPipe) id: string) {
    const benefit = await this.benefitRepo.findOne({ where: { id } })

    if (!benefit) {
      throw new NotFoundException('Benefit not found')
    }

    await this.benefitRepo.remove(benefit)

    return ApiResponse.success(
      { success: true, message: 'Benefit deleted' },
      'Benefit deleted',
      200,
    )
  }
}
