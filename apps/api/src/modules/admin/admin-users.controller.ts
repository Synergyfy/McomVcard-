import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiExtraModels,
  ApiProperty,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { User } from '../users/entities/user.entity'
import { IsIn, IsString } from 'class-validator'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'


class UserListResponseDto {
  @ApiProperty({ type: [Object] })
  data: any[]

  @ApiProperty()
  meta: { total: number; page: number; limit: number; totalPages: number }
}


class UpdateStatusBodyDto {
  @ApiProperty({ enum: ['active', 'suspended', 'banned'], example: 'active', description: 'New status for the user' })
  @IsString()
  @IsIn(['active', 'suspended', 'banned'])
  status!: 'active' | 'suspended' | 'banned'
}


@ApiTags('admin-users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiExtraModels(ApiResponse, UserListResponseDto)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}


  @Get()
  @ApiOperation({
    summary: 'List all users (admin)',
    description: 'Returns a paginated list of users with search, status filter, and sorting. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of users with roles' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listUsers(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'u.createdAt', updated_at: 'u.updatedAt', name: 'u.name', id: 'u.id', email: 'u.email', status: 'u.status' }
    const sortField = sortMap[sort] || 'u.createdAt'

    const qb = this.userRepo.createQueryBuilder('u')
      .leftJoin('u.userRoles', 'ur')
      .leftJoin('ur.role', 'r')
      .addSelect('r.name', 'role_name')

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('u.status = :status', { status })
    }

    const total = await qb.getCount()

    const users = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = users.map((user) => {
      const roleNames: string[] = []
      if (user.userRoles) {
        for (const ur of user.userRoles) {
          if (ur.role) {
            roleNames.push(ur.role.name)
          }
        }
      }

      return {
        id: user.id,
        email: user.email,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        phone: user.phone ?? null,
        status: user.status,
        is_verified: user.isVerified,
        created_at: user.createdAt,
        roles: roleNames,
      }
    })

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
      'Users retrieved',
      200,
    )
  }


  @Get(':id')
  @ApiOperation({
    summary: 'Get a single user by ID',
    description: 'Returns the full user object with roles array. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiOkResponse({ description: 'User details with roles' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    })

    if (!user) {
      return ApiResponse.message('User not found', 404)
    }

    const roleNames: string[] = []
    if (user.userRoles) {
      for (const ur of user.userRoles) {
        if (ur.role) {
          roleNames.push(ur.role.name)
        }
      }
    }

    const data = {
      id: user.id,
      email: user.email,
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
      phone: user.phone ?? null,
      status: user.status,
      is_verified: user.isVerified,
      created_at: user.createdAt,
      roles: roleNames,
    }

    return ApiResponse.success(data, 'User retrieved', 200)
  }


  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update user status',
    description: 'Sets the user status to active, suspended, or banned. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiBody({ type: UpdateStatusBodyDto })
  @ApiOkResponse({ description: 'Updated user with new status' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStatusBodyDto,
  ) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    })

    if (!user) {
      return ApiResponse.message('User not found', 404)
    }

    user.status = body.status
    await this.userRepo.save(user)

    const roleNames: string[] = []
    if (user.userRoles) {
      for (const ur of user.userRoles) {
        if (ur.role) {
          roleNames.push(ur.role.name)
        }
      }
    }

    const data = {
      id: user.id,
      email: user.email,
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
      phone: user.phone ?? null,
      status: user.status,
      is_verified: user.isVerified,
      created_at: user.createdAt,
      roles: roleNames,
    }

    return ApiResponse.success(data, 'User status updated', 200)
  }


  @Delete(':id')
  @ApiOperation({
    summary: 'Deactivate a user (soft-delete)',
    description: 'Sets user status to "deactivated". Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiOkResponse({ description: 'Deactivation confirmation' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userRepo.findOne({ where: { id } })

    if (!user) {
      return ApiResponse.message('User not found', 404)
    }

    user.status = 'deactivated'
    await this.userRepo.save(user)

    return ApiResponse.success(
      { success: true, message: 'User deactivated' },
      'User deactivated',
      200,
    )
  }
}
