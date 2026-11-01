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
import { Setting } from '../settings/entities/setting.entity'

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
  @ApiOkResponse({ description: 'General settings keyed by setting name' })
  async getGeneralSettings() {
    const settings = await this.settingsService.findByGroup('general')
    const values = this.toObject(settings)

    return ApiResponse.success(
      {
        ...values,
        site_title: values.site_title ?? values.site_name ?? '',
        site_url: values.site_url ?? '',
      },
      'General settings retrieved',
      200,
    )
  }

  @Patch('general')
  @ApiOperation({ summary: 'Update general settings (Admin only)' })
  @ApiBody({ schema: { properties: { site_title: { type: 'string' }, site_email: { type: 'string' }, site_url: { type: 'string' } } } })
  @ApiOkResponse({ description: 'General settings updated' })
  async updateGeneralSettings(@Body() body: Record<string, unknown> | Array<{ key: string; value: string }>) {
    const settings = await this.settingsService.setBulk(this.toPairs(body), 'general')
    return ApiResponse.success(this.toObject(settings), 'General settings updated', 200)
  }

  @Get('email')
  @ApiOperation({ summary: 'Get email settings (Admin only)' })
  @ApiOkResponse({ description: 'Email settings keyed by setting name' })
  async getEmailSettings() {
    const settings = await this.settingsService.findByGroup('email')
    const values = this.toObject(settings)

    // Backwards-compatible aliases for the older smtp_* keys.
    return ApiResponse.success(
      {
        ...values,
        mail_host: values.mail_host ?? values.smtp_host ?? '',
        mail_port: values.mail_port ?? values.smtp_port ?? '',
        mail_username: values.mail_username ?? values.smtp_user ?? '',
        mail_password: values.mail_password ?? values.smtp_pass ?? '',
        mail_from_address: values.mail_from_address ?? '',
        mail_from_name: values.mail_from_name ?? '',
        mail_encryption: values.mail_encryption ?? '',
        mail_driver: values.mail_driver ?? 'smtp',
      },
      'Email settings retrieved',
      200,
    )
  }

  @Patch('email')
  @ApiOperation({ summary: 'Update email settings (Admin only)' })
  @ApiBody({ schema: { properties: { mail_host: { type: 'string' }, mail_port: { type: 'string' }, mail_username: { type: 'string' }, mail_password: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Email settings updated' })
  async updateEmailSettings(@Body() body: Record<string, unknown> | Array<{ key: string; value: string }>) {
    const settings = await this.settingsService.setBulk(this.toPairs(body), 'email')
    return ApiResponse.success(this.toObject(settings), 'Email settings updated', 200)
  }

  @Get('payment')
  @ApiOperation({ summary: 'Get payment settings (Admin only)' })
  @ApiOkResponse({ description: 'Payment settings keyed by setting name' })
  async getPaymentSettings() {
    const settings = await this.settingsService.findByGroup('payment')
    return ApiResponse.success(this.toObject(settings), 'Payment settings retrieved', 200)
  }

  @Patch('payment')
  @ApiOperation({ summary: 'Update payment settings (Admin only)' })
  @ApiBody({ schema: { properties: { stripe_key: { type: 'string' }, stripe_secret: { type: 'string' }, paypal_client_id: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Payment settings updated' })
  async updatePaymentSettings(@Body() body: Record<string, unknown> | Array<{ key: string; value: string }>) {
    const settings = await this.settingsService.setBulk(this.toPairs(body), 'payment')
    return ApiResponse.success(this.toObject(settings), 'Payment settings updated', 200)
  }

  private toObject(settings: Setting[]): Record<string, string> {
    return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
  }

  private toPairs(body: Record<string, unknown> | Array<{ key: string; value: string }>): Array<{ key: string; value: string }> {
    if (Array.isArray(body)) return body

    return Object.entries(body ?? {})
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => ({ key, value: value == null ? '' : String(value) }))
  }
}
