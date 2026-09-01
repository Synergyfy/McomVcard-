import { Controller, Get, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { AffiliatesService } from '../affiliates/affiliates.service'
import { UpdateAffiliateTransactionStatusDto } from '../affiliates/dto/affiliate.dto'

@ApiTags('admin-affiliate-transactions')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/affiliate-transactions')
export class AdminAffiliateTransactionsController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all affiliate transactions (Admin only)' })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['pending', 'approved', 'rejected'], description: 'Filter by status' })
  @ApiOkResponse({ description: 'List of affiliate transactions' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid status filter' })
  async findAll(@Query('status') status?: string) {
    const result = await this.affiliatesService.listAllTransactions(status)
    return result
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an affiliate transaction status (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateAffiliateTransactionStatusDto })
  @ApiOkResponse({ description: 'Affiliate transaction updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Affiliate transaction not found' })
  @ApiBadRequestResponse({ description: 'Invalid status value' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAffiliateTransactionStatusDto,
  ) {
    const result = await this.affiliatesService.updateTransactionStatus(id, dto)
    return result
  }
}
