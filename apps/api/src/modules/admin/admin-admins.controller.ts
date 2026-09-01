import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminsService } from './admins.service'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'

@ApiTags('admin-admins')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/admins')
export class AdminAdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @ApiOperation({ summary: 'List all admins (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'List of admins' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: AdminPaginatedQueryDto) {
    const result = await this.adminsService.listAdmins(query)
    return ApiResponse.success(result, 'Admins retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Admin found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.adminsService.findOne(id)
    return ApiResponse.success(result, 'Admin retrieved', 200)
  }
}
