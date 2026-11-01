import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { PaymentsService } from './payments.service'
import { CardTopUpDto } from './dto/card-topup.dto'

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get my MCOM Wallet balance', description: 'Returns the centralized MCOM Wallet balance plus the Central Hub top-up URL.' })
  async wallet(@CurrentUser() user: UserResponseDto) {
    const summary = await this.paymentsService.getWalletSummary(user.id)
    return ApiResponse.success(summary, 'MCOM Wallet retrieved', 200)
  }

  @Get('card-balance')
  @ApiOperation({ summary: 'Get my VCard card balance', description: 'Local card ledger, separate from the centralized MCOM Wallet balance.' })
  async cardBalance(@CurrentUser() user: UserResponseDto) {
    const balance = await this.paymentsService.getCardBalance(user.id)
    return ApiResponse.success(balance, 'Card balance retrieved', 200)
  }

  @Post('card-topup')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fund the card from the MCOM Wallet',
    description: 'Debits the caller\'s centralized MCOM Wallet and credits the local card ledger. Requires an idempotency key.',
  })
  @ApiBody({ type: CardTopUpDto })
  async topUpCard(@CurrentUser() user: UserResponseDto, @Body() dto: CardTopUpDto) {
    const result = await this.paymentsService.topUpCard(user.id, dto)
    return ApiResponse.success(result, 'Card funded from MCOM Wallet', 200)
  }
}
