import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../roles/guards/roles.guard'
import { Roles } from '../../roles/decorators/roles.decorator'
import { CurrentUser } from '../../auth/current-user.decorator'
import { UserResponseDto } from '../../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../../lib/utils/api-response'
import { McomPackagesService, PurchasablePlan } from './mcom-packages.service'
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto'
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto'

@ApiTags('mcom/packages')
@ApiBearerAuth()
// Customers receive memberships from businesses and never buy them. Only
// business accounts can list or purchase business plans.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BUSINESS_OWNER')
@Controller('v1/mcom/packages')
export class McomPackagesController {
  constructor(private readonly packagesService: McomPackagesService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List purchasable VCard plans', description: 'Business plans that can be purchased in-app and paid from the MCOM Wallet.' })
  async listPlans() {
    const plans: PurchasablePlan[] = await this.packagesService.listPlans()
    return ApiResponse.success(plans, 'Purchasable plans retrieved', 200)
  }

  @Post('purchase/initiate')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create a VCard plan charge (MCOM Wallet, Stripe or PayPal)',
    description:
      'Creates a server-priced MCOM Pay charge. wallet settles immediately; stripe returns a clientSecret for Stripe Elements; paypal returns an approvalUrl. Requires a linked MCOM account and an X-Idempotency-Key. Insufficient wallet funds → 402 with a Central Hub top-up URL.',
  })
  @ApiBody({ type: InitiatePurchaseDto })
  async initiate(@CurrentUser() user: UserResponseDto, @Body() dto: InitiatePurchaseDto) {
    const result = await this.packagesService.initiate(user.id, dto)
    return ApiResponse.success(result, 'Wallet payment settled', 200)
  }

  @Post('purchase/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm a wallet charge and (re)activate the VCard plan', description: 'Idempotent replay path for clients that lost the initiate response.' })
  @ApiBody({ type: ConfirmPurchaseDto })
  async confirm(@CurrentUser() user: UserResponseDto, @Body() dto: ConfirmPurchaseDto) {
    const result = await this.packagesService.confirm(user.id, dto)
    return ApiResponse.success(result, 'Payment confirmed — plan activated', 200)
  }
}
