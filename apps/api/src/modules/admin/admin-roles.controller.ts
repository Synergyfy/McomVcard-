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
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { RolesService } from '../roles/roles.service'
import { Role } from '../roles/entities/role.entity'
import { IsString, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator'

class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ nullable: true })
  description!: string | null

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  static fromEntity(entity: Role): RoleResponseDto {
    const dto = new RoleResponseDto()
    dto.id = entity.id
    dto.name = entity.name
    dto.description = entity.description
    dto.created_at = entity.createdAt
    dto.updated_at = entity.updatedAt
    return dto
  }
}

class CreateRoleBodyDto {
  @ApiProperty({ example: 'MANAGER', description: 'Role name (uppercase, unique)' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string

  @ApiPropertyOptional({ example: 'Business manager role', description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: ['business:read', 'business:write'], description: 'Permission keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]
}

class UpdateRoleBodyDto {
  @ApiPropertyOptional({ example: 'Manager', description: 'Role name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string

  @ApiPropertyOptional({ example: 'Updated description', description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: ['business:read'], description: 'Permission keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]
}

@ApiTags('admin-roles')
@ApiExtraModels(ApiResponse, RoleResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role (Admin only)' })
  @ApiBody({ type: CreateRoleBodyDto })
  @ApiCreatedResponse({ description: 'Role created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Role already exists or invalid input' })
  async create(@Body() body: CreateRoleBodyDto) {
    const existing = await this.rolesService.getRoleByName(body.name)
    if (existing) {
      return ApiResponse.message('Role already exists', 400)
    }

    const role = await this.rolesService.createRole(body.name, body.description)
    return ApiResponse.success(RoleResponseDto.fromEntity(role), 'Role created', 201)
  }

  @Get()
  @ApiOperation({ summary: 'List all roles (Admin only)' })
  @ApiOkResponse({ description: 'List of roles' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll() {
    const roles = await this.rolesService.getAllRoles()
    return ApiResponse.success(roles.map(RoleResponseDto.fromEntity), 'Roles retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Role found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const role = await this.rolesService.getRoleById(id)
    if (!role) return ApiResponse.message('Role not found', 404)
    return ApiResponse.success(RoleResponseDto.fromEntity(role), 'Role retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateRoleBodyDto })
  @ApiOkResponse({ description: 'Role updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateRoleBodyDto) {
    const role = await this.rolesService.getRoleById(id)
    if (!role) return ApiResponse.message('Role not found', 404)

    if (body.name !== undefined) role.name = body.name
    if (body.description !== undefined) role.description = body.description

    const saved = await this.rolesService.updateRole(role)
    return ApiResponse.success(RoleResponseDto.fromEntity(saved), 'Role updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Role deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const role = await this.rolesService.getRoleById(id)
    if (!role) return ApiResponse.message('Role not found', 404)

    await this.rolesService.deleteRole(id)
    return ApiResponse.message('Role deleted', 200)
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get role permissions' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Role permissions' })
  async getPermissions(@Param('id', new ParseUUIDPipe()) id: string) {
    const role = await this.rolesService.getRoleById(id)
    if (!role) return ApiResponse.message('Role not found', 404)
    return ApiResponse.success({ permissions: [] }, 'Permissions retrieved', 200)
  }
}