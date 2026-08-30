import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CurrentUser } from '../../auth/current-user.decorator'
import { UserResponseDto } from '../../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../../lib/utils/api-response'
import { McomPackagesService, PurchasablePlan } from './mcom-packages.service'
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto'
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto'
import { CapturePurchaseDto } from './dto/capture-purchase.dto'

@ApiTags('mcom/packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/mcom/packages')
export class McomPackagesController {
  constructor(private readonly packagesService: McomPackagesService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List purchasable VCard plans', description: 'Business plans that can be purchased in-app through MCOM Solutions billing.' })
  async listPlans() {
    const plans: PurchasablePlan[] = await this.packagesService.listPlans()
    return ApiResponse.success(plans, 'Purchasable plans retrieved', 200)
  }

  @Post('purchase/initiate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Initiate a Stripe or PayPal payment for a VCard plan on MCOM Solutions', description: 'Returns a Stripe clientSecret or a PayPal approvalUrl. Requires an MCOM-linked account.' })
  @ApiBody({ type: InitiatePurchaseDto })
  async initiate(@CurrentUser() user: UserResponseDto, @Body() dto: InitiatePurchaseDto) {
    const result = await this.packagesService.initiate(user.id, dto)
    return ApiResponse.success(result, 'Payment initiated', 200)
  }

  @Post('purchase/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm a settled Stripe PaymentIntent and activate the VCard plan' })
  @ApiBody({ type: ConfirmPurchaseDto })
  async confirm(@CurrentUser() user: UserResponseDto, @Body() dto: ConfirmPurchaseDto) {
    const result = await this.packagesService.confirmStripe(user.id, dto)
    return ApiResponse.success(result, 'Payment confirmed — plan activated', 200)
  }

  @Post('purchase/capture')
  @HttpCode(200)
  @ApiOperation({ summary: 'Capture an approved PayPal order and activate the VCard plan' })
  @ApiBody({ type: CapturePurchaseDto })
  async capture(@CurrentUser() user: UserResponseDto, @Body() dto: CapturePurchaseDto) {
    const result = await this.packagesService.capturePaypal(user.id, dto)
    return ApiResponse.success(result, 'Payment captured — plan activated', 200)
  }
}