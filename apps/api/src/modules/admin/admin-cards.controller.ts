import { UseGuards, Controller, Get, Param, Patch, Delete, Query, ParseUUIDPipe, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiQuery, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { Card } from '../cards/entities/card.entity'
import { User } from '../users/entities/user.entity'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'

@ApiTags('admin-cards')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/cards')
export class AdminCardsController {
  constructor(
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all cards (admin)', description: 'Paginated list of all cards with search, status filter, and owner info.' })
  @ApiOkResponse({ description: 'Paginated cards' })
  async list(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'c.createdAt', updated_at: 'c.updatedAt', slug: 'c.slug', type: 'c.type', id: 'c.id', status: 'c.status' }
    const sortField = sortMap[sort] || 'c.createdAt'
    const qb = this.cardRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.owner', 'owner')
      .leftJoinAndSelect('c.template', 'template')

    if (search) {
      qb.andWhere('(c.slug ILIKE :s OR c.type ILIKE :s)', { s: `%${search}%` })
    }
    if (status) {
      qb.andWhere('c.status = :status', { status })
    }

    qb.orderBy(sortField, order)
    const total = await qb.getCount()
    const data = await qb.skip((page - 1) * limit).take(limit).getMany()

    const mapped = data.map((c) => ({
      id: c.id,
      slug: c.slug,
      type: c.type,
      status: c.status,
      owner: c.owner ? { id: c.owner.id, first_name: c.owner.firstName, last_name: c.owner.lastName, email: c.owner.email } : null,
      template: c.template ? { id: c.template.id, name: c.template.name } : null,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }))

    return ApiResponse.success({ data: mapped, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 'Cards retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a card (admin)' })
  @ApiOkResponse({ description: 'Card detail' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const c = await this.cardRepo.findOne({ where: { id }, relations: ['owner', 'template', 'profile', 'customization', 'socialLinks'] })
    if (!c) throw new NotFoundException('Card not found')

    return ApiResponse.success({
      id: c.id,
      slug: c.slug,
      type: c.type,
      status: c.status,
      business_id: c.businessId,
      owner: c.owner ? { id: c.owner.id, first_name: c.owner.firstName, last_name: c.owner.lastName, email: c.owner.email } : null,
      template: c.template ? { id: c.template.id, name: c.template.name } : null,
      profile: c.profile,
      customization: c.customization,
      social_links: c.socialLinks,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }, 'Card retrieved', 200)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update card status (admin)', description: 'Set a card to active, suspended, or deactivated.' })
  @ApiOkResponse({ description: 'Card status updated' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Query('status') status: string) {
    const c = await this.cardRepo.findOne({ where: { id } })
    if (!c) throw new NotFoundException('Card not found')

    c.status = status || 'active'
    const saved = await this.cardRepo.save(c)

    return ApiResponse.success({ id: saved.id, status: saved.status }, 'Card status updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a card (admin)' })
  @ApiOkResponse({ description: 'Card deleted' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const c = await this.cardRepo.findOne({ where: { id } })
    if (!c) throw new NotFoundException('Card not found')

    await this.cardRepo.remove(c)

    return ApiResponse.success(null, 'Card deleted', 200)
  }
}
