import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiExtraModels } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { User } from '../users/entities/user.entity'
import { Business } from '../businesses/entities/business.entity'
import { Card } from '../cards/entities/card.entity'
import { Template } from '../cards/entities/template.entity'

@ApiTags('admin')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    @InjectRepository(Template) private templateRepo: Repository<Template>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Admin dashboard health check', description: 'Confirms the admin API is reachable and the caller has the ADMIN role.' })
  @ApiOkResponse({ description: 'Admin API healthy' })
  async healthCheck() {
    return ApiResponse.success({ status: 'ok', message: 'Admin API is operational' }, 'Admin dashboard', 200)
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats', description: 'Returns aggregate counts and recent entries for users, businesses, cards, and templates.' })
  @ApiOkResponse({ description: 'Dashboard stats' })
  async getDashboard() {
    const [totalUsers, totalBusinesses, totalCards, totalTemplates] = await Promise.all([
      this.userRepo.count(),
      this.businessRepo.count(),
      this.cardRepo.count(),
      this.templateRepo.count(),
    ])

    const [recentUsers, recentBusinesses] = await Promise.all([
      this.userRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      }),
      this.businessRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'name', 'slug', 'createdAt'],
      }),
    ])

    return ApiResponse.success({
      total_users: totalUsers,
      total_businesses: totalBusinesses,
      total_cards: totalCards,
      total_templates: totalTemplates,
      recent_users: recentUsers.map((u) => ({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        email: u.email,
        created_at: u.createdAt,
      })),
      recent_businesses: recentBusinesses.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        created_at: b.createdAt,
      })),
    }, 'Dashboard stats retrieved', 200)
  }
}
