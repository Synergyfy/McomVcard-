import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { AffiliatesService } from './affiliates.service'
import { CreateAffiliateTransactionDto, UpdateAffiliateTransactionStatusDto } from './dto/affiliate.dto'
import { AffiliateResponseDto, AffiliateTransactionResponseDto } from './dto/affiliate-response.dto'

@ApiTags('admin')
@ApiExtraModels(ApiResponse, AffiliateResponseDto, AffiliateTransactionResponseDto)
@Controller('admin/affiliates')
export class AdminAffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all affiliates (admin only)', description: 'Returns every affiliate with referral codes, referred counts, and earnings. Requires the ADMIN role.' })
  @ApiOkResponse({
    description: 'Affiliates',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(AffiliateResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listAll() {
    return this.affiliatesService.listAll()
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all affiliate transactions (admin only)', description: 'Returns the full affiliate commission ledger, optionally filtered by status. Requires the ADMIN role.' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'], description: 'Filter by transaction status' })
  @ApiOkResponse({
    description: 'Affiliate transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(AffiliateTransactionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid status filter' })
  async listTransactions(@Query('status') status?: string) {
    return this.affiliatesService.listAllTransactions(status)
  }

  @Put('transactions/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject an affiliate transaction (admin only)', description: 'Updates the status of an affiliate commission (pending → approved/rejected). Requires the ADMIN role.' })
  @ApiBody({
    type: UpdateAffiliateTransactionStatusDto,
    examples: { default: { summary: 'Approve a commission', value: { status: 'approved', note: 'Commission verified' } } },
  })
  @ApiOkResponse({
    description: 'Affiliate transaction updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AffiliateTransactionResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Affiliate transaction not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid status' })
  async updateTransactionStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateAffiliateTransactionStatusDto) {
    return this.affiliatesService.updateTransactionStatus(id, body)
  }

  @Post('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an affiliate transaction (admin only)', description: 'Manually records an affiliate commission/payout/adjustment in pending state. Requires the ADMIN role.' })
  @ApiBody({
    type: CreateAffiliateTransactionDto,
    examples: { default: { summary: 'Record a commission', value: { affiliate_id: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', type: 'COMMISSION', amount: 10, description: 'Commission from plan purchase' } } },
  })
  @ApiCreatedResponse({
    description: 'Affiliate transaction created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(AffiliateTransactionResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Affiliate or referral not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async createTransaction(@Body() body: CreateAffiliateTransactionDto) {
    return this.affiliatesService.createTransaction(body)
  }
}