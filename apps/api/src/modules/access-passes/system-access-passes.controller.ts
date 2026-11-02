import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SystemApiKeyGuard } from '../system-plans/system-api-key.guard'
import { AccessPassesService } from './access-passes.service'

/**
 * Machine-facing access pass catalogue for MCOM Solutions (Central Hub).
 *
 * Central registers this URL as the app's "Access Pass Plans Endpoint" and
 * calls it server-to-server with `x-mcom-solution-api-key`. The response is a
 * flat catalogue of active access passes that MCOM admins can bundle into a
 * central-hub access pass.
 */
@ApiTags('MCOM Solution - Access Passes')
@ApiBearerAuth()
@UseGuards(SystemApiKeyGuard)
@Controller('v1/access-passes')
export class SystemAccessPassesController {
  constructor(private readonly accessPassesService: AccessPassesService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List access pass plans (MCOM Solutions catalogue)' })
  @ApiOkResponse({ description: 'Active access passes published to MCOM Solutions' })
  async findPlans() {
    const passes = await this.accessPassesService.findPurchasable()

    return passes.map((pass) => ({
      id: pass.id,
      name: pass.name,
      slug: null,
      description: pass.description || null,
      price: pass.price,
      currency: pass.currency,
      durationDays: pass.durationDays,
      features: (pass.features ?? []).map((feature) => feature.text),
      configuration: pass.configuration ?? null,
      isActive: pass.status === 'active',
      purchaseEnabled: true,
      codeRedemptionEnabled: true,
    }))
  }
}
