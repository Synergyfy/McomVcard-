import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  @Get()
  @ApiOperation({ summary: 'Admin dashboard health check', description: 'Confirms the admin API is reachable and the caller has the ADMIN role.' })
  @ApiOkResponse({ description: 'Admin API healthy' })
  async dashboard() {
    return ApiResponse.success({ status: 'ok', message: 'Admin API is operational' }, 'Admin dashboard', 200)
  }
}
