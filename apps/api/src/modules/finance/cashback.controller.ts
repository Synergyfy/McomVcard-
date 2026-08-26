import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
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
import { CashbackService } from './cashback.service'
import { CashbackAccountResponseDto, CashbackRuleResponseDto, CashbackTransactionResponseDto } from './dto/cashback-response.dto'
import { CreateCashbackRuleDto } from './dto/create-cashback-rule.dto'
import { UpdateCashbackRuleDto } from './dto/update-cashback-rule.dto'
import { CreateCashbackTransactionDto } from './dto/create-cashback-transaction.dto'

@ApiTags('finance')
@ApiExtraModels(ApiResponse, CashbackAccountResponseDto, CashbackRuleResponseDto, CashbackTransactionResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class CashbackController {
  constructor(private readonly cashbackService: CashbackService) {}

  // --- Rules (platform-wide) ---

  @Post('cashback/rules')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a cashback rule', description: 'Creates a platform-wide cashback rule. Any authenticated user can manage rules.' })
  @ApiBody({ type: CreateCashbackRuleDto, examples: { default: { summary: '5% rule', value: { percentage: 5, minimum_amount: 10, maximum_amount: 50, starts_at: '2026-08-19T00:00:00.000Z', ends_at: '2027-08-19T00:00:00.000Z' } } } })
  @ApiCreatedResponse({
    description: 'Cashback rule created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackRuleResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async createRule(@Body() body: CreateCashbackRuleDto) {
    return this.cashbackService.createRule(body)
  }

  @Get('cashback/rules')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cashback rules', description: 'Returns all platform-wide cashback rules. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Cashback rules',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CashbackRuleResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listRules() {
    return this.cashbackService.listRules()
  }

  @Get('cashback/rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a cashback rule', description: 'Returns a single cashback rule. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Cashback rule found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackRuleResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback rule not found' })
  async getRule(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cashbackService.getRule(id)
  }

  @Patch('cashback/rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a cashback rule', description: 'Updates a platform-wide cashback rule. Any authenticated user can manage rules.' })
  @ApiBody({ type: UpdateCashbackRuleDto, examples: { default: { summary: 'Raise percentage', value: { percentage: 7 } } } })
  @ApiOkResponse({
    description: 'Cashback rule updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackRuleResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback rule not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async updateRule(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateCashbackRuleDto) {
    return this.cashbackService.updateRule(id, body)
  }

  @Delete('cashback/rules/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a cashback rule', description: 'Deletes a cashback rule. Any authenticated user can manage rules.' })
  @ApiOkResponse({
    description: 'Cashback rule deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Cashback rule deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback rule not found' })
  async removeRule(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cashbackService.removeRule(id)
  }

  // --- Account (per-user) ---

  @Get('cashback/account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my cashback account', description: 'Returns the authenticated user\'s cashback account with its balance. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Cashback account found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackAccountResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback account not found' })
  async getMyAccount(@CurrentUser() user: UserResponseDto) {
    return this.cashbackService.getMyAccount(user.id)
  }

  @Post('cashback/account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create my cashback account', description: 'Creates the authenticated user\'s cashback account (one per user). Returns the existing account if already created. Per-user scoped.' })
  @ApiCreatedResponse({
    description: 'Cashback account created (or already exists)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackAccountResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createAccount(@CurrentUser() user: UserResponseDto) {
    return this.cashbackService.createAccount(user.id)
  }

  @Get('cashback/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my cashback transactions', description: 'Returns the authenticated user\'s cashback history ledger (newest first). Per-user scoped.' })
  @ApiOkResponse({
    description: 'Cashback transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CashbackTransactionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback account not found' })
  async listMyTransactions(@CurrentUser() user: UserResponseDto) {
    return this.cashbackService.listMyTransactions(user.id)
  }

  @Post('cashback/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a cashback transaction', description: 'Records an EARN/REDEEM/ADJUST cashback transaction. Each writes a ledger row and updates the balance atomically. Transactions that would drive the balance below zero are rejected. Per-user scoped.' })
  @ApiBody({ type: CreateCashbackTransactionDto, examples: { default: { summary: 'Earn cashback', value: { type: 'EARN', amount: 5, description: 'Cashback from purchase' } } } })
  @ApiCreatedResponse({
    description: 'Cashback transaction recorded',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackTransactionResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback account not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, inactive account, or insufficient balance' })
  async createTransaction(@CurrentUser() user: UserResponseDto, @Body() body: CreateCashbackTransactionDto) {
    return this.cashbackService.createTransaction(user.id, body)
  }

  @Get('cashback/transactions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a cashback transaction', description: 'Returns a single cashback transaction from the authenticated user\'s ledger. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Cashback transaction found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackTransactionResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback transaction not found' })
  async getMyTransaction(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.cashbackService.getMyTransaction(user.id, id)
  }
}