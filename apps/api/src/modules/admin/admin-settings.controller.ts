import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { SettingsService } from '../settings/settings.service'

@ApiTags('admin-settings')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('general')
  @ApiOperation({ summary: 'Get general settings (Admin only)' })
  @ApiOkResponse({ description: 'General settings' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getGeneralSettings() {
    const settings = await this.settingsService.findByGroup('general')
    return ApiResponse.success(settings, 'General settings retrieved', 200)
  }

  @Patch('general')
  @ApiOperation({ summary: 'Update general settings (Admin only)' })
  @ApiBody({ schema: { properties: { site_name: { type: 'string' }, site_email: { type: 'string' }, site_url: { type: 'string' } } } })
  @ApiOkResponse({ description: 'General settings updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateGeneralSettings(@Body() body: Array<{ key: string; value: string }>) {
    const settings = await this.settingsService.setBulk(body, 'general')
    return ApiResponse.success(settings, 'General settings updated', 200)
  }

  @Get('email')
  @ApiOperation({ summary: 'Get email settings (Admin only)' })
  @ApiOkResponse({ description: 'Email settings' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getEmailSettings() {
    const settings = await this.settingsService.findByGroup('email')
    return ApiResponse.success(settings, 'Email settings retrieved', 200)
  }

  @Patch('email')
  @ApiOperation({ summary: 'Update email settings (Admin only)' })
  @ApiBody({ schema: { properties: { smtp_host: { type: 'string' }, smtp_port: { type: 'string' }, smtp_user: { type: 'string' }, smtp_pass: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Email settings updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateEmailSettings(@Body() body: Array<{ key: string; value: string }>) {
    const settings = await this.settingsService.setBulk(body, 'email')
    return ApiResponse.success(settings, 'Email settings updated', 200)
  }

  @Get('payment')
  @ApiOperation({ summary: 'Get payment settings (Admin only)' })
  @ApiOkResponse({ description: 'Payment settings' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getPaymentSettings() {
    const settings = await this.settingsService.findByGroup('payment')
    return ApiResponse.success(settings, 'Payment settings retrieved', 200)
  }

  @Patch('payment')
  @ApiOperation({ summary: 'Update payment settings (Admin only)' })
  @ApiBody({ schema: { properties: { stripe_key: { type: 'string' }, stripe_secret: { type: 'string' }, paypal_client_id: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Payment settings updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updatePaymentSettings(@Body() body: Array<{ key: string; value: string }>) {
    const settings = await this.settingsService.setBulk(body, 'payment')
    return ApiResponse.success(settings, 'Payment settings updated', 200)
  }
}
