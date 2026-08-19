import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { RewardsService } from './rewards.service'
import { RewardBalanceResponseDto, RewardTransactionResponseDto } from './dto/reward-response.dto'
import { CreateRewardTransactionDto } from './dto/create-reward-transaction.dto'

@ApiTags('finance')
@ApiExtraModels(ApiResponse, RewardBalanceResponseDto, RewardTransactionResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('rewards/balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reward balance', description: 'Returns the authenticated user\'s reward points balance. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Reward balance found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RewardBalanceResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Reward balance not found' })
  async getMyBalance(@CurrentUser() user: UserResponseDto) {
    return this.rewardsService.getMyBalance(user.id)
  }

  @Post('rewards/balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create my reward balance', description: 'Creates the authenticated user\'s reward balance (one per user). Returns the existing balance if already created. Per-user scoped.' })
  @ApiCreatedResponse({
    description: 'Reward balance created (or already exists)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RewardBalanceResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createBalance(@CurrentUser() user: UserResponseDto) {
    return this.rewardsService.createBalance(user.id)
  }

  @Get('rewards/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my reward transactions', description: 'Returns the authenticated user\'s reward history ledger (newest first). Per-user scoped.' })
  @ApiOkResponse({
    description: 'Reward transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(RewardTransactionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Reward balance not found' })
  async listMyTransactions(@CurrentUser() user: UserResponseDto) {
    return this.rewardsService.listMyTransactions(user.id)
  }

  @Post('rewards/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a reward transaction', description: 'Records an EARN/REDEEM/EXPIRE/ADJUST reward transaction. Each writes a ledger row and updates the balance atomically. Transactions that would drive the balance below zero are rejected. Per-user scoped.' })
  @ApiBody({ type: CreateRewardTransactionDto, examples: { default: { summary: 'Earn points', value: { type: 'EARN', amount: 100, description: 'Points from purchase' } } } })
  @ApiCreatedResponse({
    description: 'Reward transaction recorded',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RewardTransactionResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Reward balance not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, inactive balance, or insufficient balance' })
  async createTransaction(@CurrentUser() user: UserResponseDto, @Body() body: CreateRewardTransactionDto) {
    return this.rewardsService.createTransaction(user.id, body)
  }

  @Get('rewards/transactions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a reward transaction', description: 'Returns a single reward transaction from the authenticated user\'s ledger. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Reward transaction found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(RewardTransactionResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Reward transaction not found' })
  async getMyTransaction(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.rewardsService.getMyTransaction(user.id, id)
  }
}