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
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'

@ApiTags('admin-settings')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/settings')
export class AdminSettingsController {
  @Get('general')
  @ApiOperation({ summary: 'Get general settings (Admin only)' })
  @ApiOkResponse({ description: 'General settings' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getGeneralSettings() {
    return ApiResponse.success({ siteName: 'MCOMVCard', siteUrl: 'https://mcomvcard.link', defaultLanguage: 'en', defaultCurrency: 'GBP' }, 'General settings retrieved', 200)
  }

  @Patch('general')
  @ApiOperation({ summary: 'Update general settings (Admin only)' })
  @ApiBody({ schema: { properties: { siteName: { type: 'string' }, siteUrl: { type: 'string' }, defaultLanguage: { type: 'string' }, defaultCurrency: { type: 'string' } } } })
  @ApiOkResponse({ description: 'General settings updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateGeneralSettings(@Body() body: any) {
    return ApiResponse.success(body, 'General settings updated', 200)
  }

  @Get('email')
  @ApiOperation({ summary: 'Get email settings (Admin only)' })
  @ApiOkResponse({ description: 'Email settings' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getEmailSettings() {
    return ApiResponse.success({ host: 'smtp.example.com', port: 587, secure: false, user: 'noreply@example.com', fromName: 'MCOMVCard' }, 'Email settings retrieved', 200)
  }

  @Patch('email')
  @ApiOperation({ summary: 'Update email settings (Admin only)' })
  @ApiBody({ schema: { properties: { host: { type: 'string' }, port: { type: 'number' }, secure: { type: 'boolean' }, user: { type: 'string' }, fromName: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Email settings updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateEmailSettings(@Body() body: any) {
    return ApiResponse.success(body, 'Email settings updated', 200)
  }

  @Get('payment')
  @ApiOperation({ summary: 'Get payment settings (Admin only)' })
  @ApiOkResponse({ description: 'Payment settings' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getPaymentSettings() {
    return ApiResponse.success({ stripeEnabled: false, paypalEnabled: false, stripePublicKey: '', stripeSecretKey: '', paypalClientId: '', paypalSecret: '' }, 'Payment settings retrieved', 200)
  }

  @Patch('payment')
  @ApiOperation({ summary: 'Update payment settings (Admin only)' })
  @ApiBody({ schema: { properties: { stripeEnabled: { type: 'boolean' }, paypalEnabled: { type: 'boolean' }, stripePublicKey: { type: 'string' }, stripeSecretKey: { type: 'string' }, paypalClientId: { type: 'string' }, paypalSecret: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Payment settings updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updatePaymentSettings(@Body() body: any) {
    return ApiResponse.success(body, 'Payment settings updated', 200)
  }
}