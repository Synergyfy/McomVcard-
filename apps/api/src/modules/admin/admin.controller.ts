import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { UsersService } from '../users/users.service'
import { RolesService } from '../roles/roles.service'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'


@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (admin only)', description: 'Returns every user with their assigned roles. Requires the ADMIN role.' })
  @ApiOkResponse({ description: 'List of users with roles' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listUsers() {
    const users = await this.usersService.findAll()

    const data = await Promise.all(
      users.map(async (user) => ({
        ...UserResponseDto.fromEntity(user),
        roles: await this.rolesService.getRoleNamesForUser(user.id),
      })),
    )

    return ApiResponse.success(data, 'Users retrieved', 200)
  }
}