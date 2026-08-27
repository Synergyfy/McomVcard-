import { UseGuards, Controller, Get, Param, Patch, Delete, Query, ParseUUIDPipe, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiQuery, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { Business } from '../businesses/entities/business.entity'
import { User } from '../users/entities/user.entity'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'

@ApiTags('admin-businesses')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/businesses')
export class AdminBusinessesController {
  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all businesses (admin)', description: 'Paginated list of all businesses with search, status filter, and owner info.' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiOkResponse({ description: 'Paginated businesses' })
  async list(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'b.createdAt', updated_at: 'b.updatedAt', name: 'b.name', id: 'b.id', email: 'b.email', status: 'b.status' }
    const sortField = sortMap[sort] || 'b.createdAt'
    const qb = this.businessRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.owner', 'owner')
      .leftJoinAndSelect('b.category', 'category')

    if (search) {
      qb.andWhere('(b.name ILIKE :s OR b.slug ILIKE :s OR b.email ILIKE :s)', { s: `%${search}%` })
    }
    if (status) {
      qb.andWhere('b.status = :status', { status })
    }

    qb.orderBy(sortField, order)
    const total = await qb.getCount()
    const data = await qb.skip((page - 1) * limit).take(limit).getMany()

    const mapped = data.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      email: b.email,
      phone: b.phone,
      website: b.website,
      status: b.status,
      owner: b.owner ? { id: b.owner.id, first_name: b.owner.firstName, last_name: b.owner.lastName, email: b.owner.email } : null,
      category: b.category ? { id: b.category.id, name: b.category.name } : null,
      created_at: b.createdAt,
      updated_at: b.updatedAt,
    }))

    return ApiResponse.success({ data: mapped, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 'Businesses retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a business (admin)' })
  @ApiOkResponse({ description: 'Business detail' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const b = await this.businessRepo.findOne({ where: { id }, relations: ['owner', 'category', 'locations', 'hours', 'brands'] })
    if (!b) throw new NotFoundException('Business not found')

    return ApiResponse.success({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      email: b.email,
      phone: b.phone,
      website: b.website,
      status: b.status,
      owner: b.owner ? { id: b.owner.id, first_name: b.owner.firstName, last_name: b.owner.lastName, email: b.owner.email } : null,
      category: b.category ? { id: b.category.id, name: b.category.name } : null,
      locations: b.locations,
      hours: b.hours,
      brands: b.brands,
      created_at: b.createdAt,
      updated_at: b.updatedAt,
    }, 'Business retrieved', 200)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update business status (admin)', description: 'Set a business to active, suspended, or deactivated.' })
  @ApiOkResponse({ description: 'Business status updated' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Query('status') status: string) {
    const b = await this.businessRepo.findOne({ where: { id } })
    if (!b) throw new NotFoundException('Business not found')

    b.status = status || 'active'
    const saved = await this.businessRepo.save(b)

    return ApiResponse.success({ id: saved.id, status: saved.status }, 'Business status updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business (admin)', description: 'Permanently removes a business and its cascade children.' })
  @ApiOkResponse({ description: 'Business deleted' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const b = await this.businessRepo.findOne({ where: { id } })
    if (!b) throw new NotFoundException('Business not found')

    await this.businessRepo.remove(b)

    return ApiResponse.success(null, 'Business deleted', 200)
  }
}
