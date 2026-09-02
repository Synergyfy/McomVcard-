import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
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
import { WalletService } from './wallet.service'
import { WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet-response.dto'
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto'
import { WalletTransferDto } from './dto/wallet-transfer.dto'
import { AllocateToChildDto } from './dto/allocate-to-child.dto'

@ApiTags('finance')
@ApiExtraModels(ApiResponse, WalletResponseDto, WalletTransactionResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my wallet', description: 'Returns the authenticated user\'s wallet with its current balance. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Wallet found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WalletResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  async getMyWallet(@CurrentUser() user: UserResponseDto) {
    return this.walletService.getMyWallet(user.id)
  }

  @Post('wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create my wallet', description: 'Creates the authenticated user\'s wallet (one per user). Returns the existing wallet if already created. Per-user scoped.' })
  @ApiCreatedResponse({
    description: 'Wallet created (or already exists)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WalletResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createWallet(@CurrentUser() user: UserResponseDto) {
    return this.walletService.createWallet(user.id)
  }

  @Get('wallet/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my wallet transactions', description: 'Returns the authenticated user\'s wallet ledger (newest first). The transaction table is the ledger. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Wallet transactions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(WalletTransactionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  async listMyTransactions(@CurrentUser() user: UserResponseDto) {
    return this.walletService.listMyTransactions(user.id)
  }

  @Post('wallet/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a wallet transaction', description: 'Credits or debits the authenticated user\'s wallet. Each transaction writes a ledger row and updates the balance atomically (spec §34). Debits above the balance are rejected. Per-user scoped.' })
  @ApiBody({ type: CreateWalletTransactionDto, examples: { default: { summary: 'Credit top-up', value: { type: 'CREDIT', amount: 25.5, description: 'Wallet top-up' } } } })
  @ApiCreatedResponse({
    description: 'Wallet transaction recorded',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WalletTransactionResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, inactive wallet, or insufficient balance' })
  async createTransaction(@CurrentUser() user: UserResponseDto, @Body() body: CreateWalletTransactionDto) {
    return this.walletService.createTransaction(user.id, body)
  }

  @Get('wallet/transactions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a wallet transaction', description: 'Returns a single wallet transaction from the authenticated user\'s ledger. Per-user scoped.' })
  @ApiOkResponse({
    description: 'Wallet transaction found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(WalletTransactionResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wallet transaction not found' })
  async getMyTransaction(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.walletService.getMyTransaction(user.id, id)
  }

  @Post('wallet/transfer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer funds to another user', description: 'Transfers funds from the authenticated user\'s wallet to a recipient\'s wallet. The recipient\'s wallet is created automatically if it does not exist. Both the debit and credit are written atomically. Per-user scoped.' })
  @ApiBody({ type: WalletTransferDto, examples: { default: { summary: 'Transfer to another user', value: { recipient_id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', amount: 25.5, description: 'Dinner split' } } } })
  @ApiOkResponse({
    description: 'Transfer completed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'object', properties: { balance: { type: 'number', example: 74.5 } } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  @ApiBadRequestResponse({ description: 'Insufficient balance, transfer to self, or inactive wallet' })
  async transfer(@CurrentUser() user: UserResponseDto, @Body() body: WalletTransferDto) {
    return this.walletService.transfer(user.id, body)
  }

  @Post('wallet/allocate-to-child')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Allocate funds to a child card', description: 'Debits the authenticated user\'s wallet and adds the amount to the specified child card\'s wallet_allocation. The caller must be the card owner (parent). Per-user scoped.' })
  @ApiBody({ type: AllocateToChildDto, examples: { default: { summary: 'Allocate to child card', value: { child_card_id: 'c9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', amount: 50 } } } })
  @ApiOkResponse({
    description: 'Funds allocated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'object', properties: { wallet_allocation: { type: 'number', example: 50 }, balance: { type: 'number', example: 50 } } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Wallet or child card not found' })
  @ApiForbiddenResponse({ description: 'Only the card owner can allocate funds' })
  @ApiBadRequestResponse({ description: 'Insufficient balance or inactive wallet' })
  async allocateToChild(@CurrentUser() user: UserResponseDto, @Body() body: AllocateToChildDto) {
    return this.walletService.allocateToChild(user.id, body)
  }
}