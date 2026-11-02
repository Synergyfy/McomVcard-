import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../roles/guards/roles.guard'
import { Roles } from '../../roles/decorators/roles.decorator'
import { CurrentUser } from '../../auth/current-user.decorator'
import { UserResponseDto } from '../../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../../lib/utils/api-response'
import {
  McomPackagesService,
  PurchasableAccessPass,
  PurchasablePlan,
} from './mcom-packages.service'
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto'
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto'
import { InitiateAccessPassPurchaseDto } from './dto/initiate-access-pass-purchase.dto'
import { ConfirmAccessPassPurchaseDto } from './dto/confirm-access-pass-purchase.dto'

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

  @Get('access-passes')
  @ApiOperation({
    summary: 'List purchasable access passes',
    description: 'Single-duration access passes that can be purchased in-app and paid from the MCOM Wallet.',
  })
  async listAccessPasses() {
    const passes: PurchasableAccessPass[] = await this.packagesService.listAccessPasses()
    return ApiResponse.success(passes, 'Purchasable access passes retrieved', 200)
  }

  @Post('access-pass/purchase/initiate')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create an access pass charge (MCOM Wallet, Stripe or PayPal)',
    description:
      'Creates a server-priced MCOM Pay charge for a single-duration access pass. wallet settles immediately; stripe returns a clientSecret; paypal returns an approvalUrl.',
  })
  @ApiBody({ type: InitiateAccessPassPurchaseDto })
  async initiateAccessPass(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: InitiateAccessPassPurchaseDto,
  ) {
    const result = await this.packagesService.initiateAccessPass(user.id, dto)
    return ApiResponse.success(result, 'Access pass payment settled', 200)
  }

  @Post('access-pass/purchase/confirm')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm an access pass charge and activate the pass',
    description: 'Idempotent replay path for clients that lost the initiate response.',
  })
  @ApiBody({ type: ConfirmAccessPassPurchaseDto })
  async confirmAccessPass(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: ConfirmAccessPassPurchaseDto,
  ) {
    const result = await this.packagesService.confirmAccessPass(user.id, dto)
    return ApiResponse.success(result, 'Payment confirmed — access pass activated', 200)
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
