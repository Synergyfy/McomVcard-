import {
  Controller,
  Get,
  Post,
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
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiExtraModels,
  ApiProperty,
  ApiParam,
  ApiBody,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { User } from '../users/entities/user.entity'
import { IsIn, IsString, IsEmail, IsOptional, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { RolesService } from '../roles/roles.service'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { getSchemaPath } from '@nestjs/swagger'


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


class CreateUserBodyDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'secret123', description: 'User password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  password!: string

  @ApiProperty({ example: 'secret123', description: 'Password confirmation' })
  @IsString()
  password_confirmation!: string

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsOptional()
  @IsString()
  first_name?: string

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsOptional()
  @IsString()
  last_name?: string
}


@ApiTags('admin-users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiExtraModels(ApiResponse, UserListResponseDto, UserResponseDto)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
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


  @Post()
  @ApiOperation({
    summary: 'Create a user (admin)',
    description: 'Creates a new user with the specified email, password, and optional name. Requires ADMIN role.',
  })
  @ApiBody({ type: CreateUserBodyDto, examples: { default: { summary: 'Create user', value: { email: 'newuser@example.com', password: 'secret123', password_confirmation: 'secret123', first_name: 'John', last_name: 'Doe' } } } })
  @ApiCreatedResponse({ description: 'User created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(UserResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Email already in use or invalid input' })
  async createUser(@Body() body: CreateUserBodyDto) {
    if (body.password !== body.password_confirmation) {
      return ApiResponse.message('Passwords do not match', 400)
    }

    const existing = await this.userRepo.findOne({ where: { email: body.email.toLowerCase() } })
    if (existing) {
      return ApiResponse.message('Email already in use', 400)
    }

    const hashed = await bcrypt.hash(body.password, 10)

    const saved = await this.userRepo.save(
      this.userRepo.create({
        email: body.email.toLowerCase(),
        passwordHash: hashed,
        firstName: body.first_name ?? null,
        lastName: body.last_name ?? null,
        status: 'active',
      }),
    )

    await this.rolesService.ensureDefaultRole()
    await this.rolesService.assignDefaultRole(saved.id)

    const roleNames = await this.rolesService.getRoleNamesForUser(saved.id)

    const data = {
      id: saved.id,
      email: saved.email,
      first_name: saved.firstName ?? null,
      last_name: saved.lastName ?? null,
      phone: saved.phone ?? null,
      status: saved.status,
      is_verified: saved.isVerified,
      created_at: saved.createdAt,
      roles: roleNames,
    }

    return ApiResponse.success(data, 'User created', 201)
  }


  @Post(':id/impersonate')
  @ApiOperation({
    summary: 'Impersonate a user (admin)',
    description: 'Generates a token for the target user. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiOkResponse({ description: 'Impersonation token generated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async impersonate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userRepo.findOne({ where: { id } })

    if (!user) {
      return ApiResponse.message('User not found', 404)
    }

    if (user.status !== 'active') {
      return ApiResponse.message('Account is deactivated', 400)
    }

    const roles = await this.rolesService.getRoleNamesForUser(user.id)
    const token = this.jwtService.sign({ user_id: user.id, roles })

    const data = {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        phone: user.phone ?? null,
        status: user.status,
        is_verified: user.isVerified,
        created_at: user.createdAt,
        roles,
      },
    }

    return ApiResponse.success(data, 'Impersonation token generated', 200)
  }
}
