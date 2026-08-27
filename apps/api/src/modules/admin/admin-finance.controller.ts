import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiExtraModels,
  ApiPropertyOptional,
  ApiParam,
} from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsIn, IsOptional, IsNumber, IsString, IsDateString } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { Wallet } from '../finance/entities/wallet.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardBalance } from '../finance/entities/reward-balance.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { CashbackAccount } from '../finance/entities/cashback-account.entity'
import { CashbackTransaction } from '../finance/entities/cashback-transaction.entity'
import { CashbackRule } from '../finance/entities/cashback-rule.entity'
import { User } from '../users/entities/user.entity'
import { ApiResponse } from '../../lib/utils/api-response'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'


class UpdateCashbackRuleBodyDto {
  @ApiPropertyOptional({ example: 5.5, description: 'Cashback percentage' })
  @IsOptional()
  @IsNumber()
  percentage?: number

  @ApiPropertyOptional({ example: 10, description: 'Minimum transaction amount' })
  @IsOptional()
  @IsNumber()
  minimum_amount?: number

  @ApiPropertyOptional({ example: 500, description: 'Maximum transaction amount' })
  @IsOptional()
  @IsNumber()
  maximum_amount?: number

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'Rule start date' })
  @IsOptional()
  @IsDateString()
  starts_at?: string

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z', description: 'Rule end date' })
  @IsOptional()
  @IsDateString()
  ends_at?: string

  @ApiPropertyOptional({ enum: ['active', 'inactive'], example: 'active', description: 'Rule status' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string
}


@ApiTags('admin-finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiExtraModels(ApiResponse)
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTxRepo: Repository<WalletTransaction>,
    @InjectRepository(RewardBalance)
    private readonly rewardBalanceRepo: Repository<RewardBalance>,
    @InjectRepository(RewardTransaction)
    private readonly rewardTxRepo: Repository<RewardTransaction>,
    @InjectRepository(CashbackAccount)
    private readonly cashbackAccountRepo: Repository<CashbackAccount>,
    @InjectRepository(CashbackTransaction)
    private readonly cashbackTxRepo: Repository<CashbackTransaction>,
    @InjectRepository(CashbackRule)
    private readonly cashbackRuleRepo: Repository<CashbackRule>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}


  @Get('wallets')
  @ApiOperation({
    summary: 'List all wallets (admin)',
    description: 'Returns a paginated list of wallets with user relation. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of wallets' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listWallets(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'w.createdAt', updated_at: 'w.updatedAt', id: 'w.id', status: 'w.status', balance: 'w.balance', currency: 'w.currency' }
    const sortField = sortMap[sort] || 'w.createdAt'

    const qb = this.walletRepo.createQueryBuilder('w')
      .leftJoinAndSelect('w.user', 'u')

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('w.status = :status', { status })
    }

    const total = await qb.getCount()

    const wallets = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = wallets.map((w) => ({
      id: w.id,
      user_id: w.userId,
      user: w.user ? {
        id: w.user.id,
        email: w.user.email,
        first_name: w.user.firstName ?? null,
        last_name: w.user.lastName ?? null,
      } : null,
      balance: w.balance,
      currency: w.currency,
      status: w.status,
      created_at: w.createdAt,
      updated_at: w.updatedAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Wallets retrieved',
      200,
    )
  }


  @Get('wallets/:id')
  @ApiOperation({
    summary: 'Get a single wallet',
    description: 'Returns wallet details with the last 10 transactions. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Wallet UUID', type: String })
  @ApiOkResponse({ description: 'Wallet details with recent transactions' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getWallet(@Param('id', ParseUUIDPipe) id: string) {
    const wallet = await this.walletRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!wallet) {
      throw new NotFoundException('Wallet not found')
    }

    const transactions = await this.walletTxRepo.find({
      where: { walletId: id },
      order: { createdAt: 'DESC' },
      take: 10,
    })

    const data = {
      id: wallet.id,
      user_id: wallet.userId,
      user: wallet.user ? {
        id: wallet.user.id,
        email: wallet.user.email,
        first_name: wallet.user.firstName ?? null,
        last_name: wallet.user.lastName ?? null,
      } : null,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      recent_transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance_after: tx.balanceAfter,
        description: tx.description,
        created_at: tx.createdAt,
      })),
      created_at: wallet.createdAt,
      updated_at: wallet.updatedAt,
    }

    return ApiResponse.success(data, 'Wallet retrieved', 200)
  }


  @Get('wallets/:id/transactions')
  @ApiOperation({
    summary: 'List wallet transactions',
    description: 'Returns paginated transactions for a specific wallet. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Wallet UUID', type: String })
  @ApiOkResponse({ description: 'Paginated wallet transactions' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listWalletTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AdminPaginatedQueryDto,
  ) {
    const wallet = await this.walletRepo.findOne({ where: { id } })

    if (!wallet) {
      throw new NotFoundException('Wallet not found')
    }

    const { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'tx.createdAt', updated_at: 'tx.updatedAt', id: 'tx.id', type: 'tx.type', amount: 'tx.amount' }
    const sortField = sortMap[sort] || 'tx.createdAt'

    const qb = this.walletTxRepo.createQueryBuilder('tx')
      .where('tx.walletId = :walletId', { walletId: id })

    const total = await qb.getCount()

    const transactions = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balance_after: tx.balanceAfter,
      description: tx.description,
      created_at: tx.createdAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Wallet transactions retrieved',
      200,
    )
  }


  @Get('rewards')
  @ApiOperation({
    summary: 'List all reward balances (admin)',
    description: 'Returns a paginated list of reward balances with user relation. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of reward balances' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listRewards(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'rb.createdAt', updated_at: 'rb.updatedAt', id: 'rb.id', status: 'rb.status', balance: 'rb.balance' }
    const sortField = sortMap[sort] || 'rb.createdAt'

    const qb = this.rewardBalanceRepo.createQueryBuilder('rb')
      .leftJoinAndSelect('rb.user', 'u')

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('rb.status = :status', { status })
    }

    const total = await qb.getCount()

    const balances = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = balances.map((rb) => ({
      id: rb.id,
      user_id: rb.userId,
      user: rb.user ? {
        id: rb.user.id,
        email: rb.user.email,
        first_name: rb.user.firstName ?? null,
        last_name: rb.user.lastName ?? null,
      } : null,
      balance: rb.balance,
      status: rb.status,
      created_at: rb.createdAt,
      updated_at: rb.updatedAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Reward balances retrieved',
      200,
    )
  }


  @Get('rewards/:id')
  @ApiOperation({
    summary: 'Get a single reward balance',
    description: 'Returns reward balance with the last 10 transactions. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Reward balance UUID', type: String })
  @ApiOkResponse({ description: 'Reward balance details with recent transactions' })
  @ApiNotFoundResponse({ description: 'Reward balance not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getReward(@Param('id', ParseUUIDPipe) id: string) {
    const balance = await this.rewardBalanceRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!balance) {
      throw new NotFoundException('Reward balance not found')
    }

    const transactions = await this.rewardTxRepo.find({
      where: { rewardBalanceId: id },
      order: { createdAt: 'DESC' },
      take: 10,
    })

    const data = {
      id: balance.id,
      user_id: balance.userId,
      user: balance.user ? {
        id: balance.user.id,
        email: balance.user.email,
        first_name: balance.user.firstName ?? null,
        last_name: balance.user.lastName ?? null,
      } : null,
      balance: balance.balance,
      status: balance.status,
      recent_transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance_after: tx.balanceAfter,
        description: tx.description,
        created_at: tx.createdAt,
      })),
      created_at: balance.createdAt,
      updated_at: balance.updatedAt,
    }

    return ApiResponse.success(data, 'Reward balance retrieved', 200)
  }


  @Get('rewards/:id/transactions')
  @ApiOperation({
    summary: 'List reward transactions',
    description: 'Returns paginated transactions for a specific reward balance. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Reward balance UUID', type: String })
  @ApiOkResponse({ description: 'Paginated reward transactions' })
  @ApiNotFoundResponse({ description: 'Reward balance not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listRewardTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AdminPaginatedQueryDto,
  ) {
    const balance = await this.rewardBalanceRepo.findOne({ where: { id } })

    if (!balance) {
      throw new NotFoundException('Reward balance not found')
    }

    const { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'tx.createdAt', updated_at: 'tx.updatedAt', id: 'tx.id', type: 'tx.type', amount: 'tx.amount' }
    const sortField = sortMap[sort] || 'tx.createdAt'

    const qb = this.rewardTxRepo.createQueryBuilder('tx')
      .where('tx.rewardBalanceId = :balanceId', { balanceId: id })

    const total = await qb.getCount()

    const transactions = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balance_after: tx.balanceAfter,
      description: tx.description,
      created_at: tx.createdAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Reward transactions retrieved',
      200,
    )
  }


  @Get('cashback')
  @ApiOperation({
    summary: 'List all cashback accounts (admin)',
    description: 'Returns a paginated list of cashback accounts with user relation. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'Paginated list of cashback accounts' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listCashbackAccounts(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'ca.createdAt', updated_at: 'ca.updatedAt', id: 'ca.id', status: 'ca.status', balance: 'ca.balance' }
    const sortField = sortMap[sort] || 'ca.createdAt'

    const qb = this.cashbackAccountRepo.createQueryBuilder('ca')
      .leftJoinAndSelect('ca.user', 'u')

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('ca.status = :status', { status })
    }

    const total = await qb.getCount()

    const accounts = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = accounts.map((ca) => ({
      id: ca.id,
      user_id: ca.userId,
      user: ca.user ? {
        id: ca.user.id,
        email: ca.user.email,
        first_name: ca.user.firstName ?? null,
        last_name: ca.user.lastName ?? null,
      } : null,
      balance: ca.balance,
      status: ca.status,
      created_at: ca.createdAt,
      updated_at: ca.updatedAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Cashback accounts retrieved',
      200,
    )
  }


  @Get('cashback/:id')
  @ApiOperation({
    summary: 'Get a single cashback account',
    description: 'Returns cashback account with the last 10 transactions. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Cashback account UUID', type: String })
  @ApiOkResponse({ description: 'Cashback account details with recent transactions' })
  @ApiNotFoundResponse({ description: 'Cashback account not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async getCashbackAccount(@Param('id', ParseUUIDPipe) id: string) {
    const account = await this.cashbackAccountRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!account) {
      throw new NotFoundException('Cashback account not found')
    }

    const transactions = await this.cashbackTxRepo.find({
      where: { cashbackAccountId: id },
      order: { createdAt: 'DESC' },
      take: 10,
    })

    const data = {
      id: account.id,
      user_id: account.userId,
      user: account.user ? {
        id: account.user.id,
        email: account.user.email,
        first_name: account.user.firstName ?? null,
        last_name: account.user.lastName ?? null,
      } : null,
      balance: account.balance,
      status: account.status,
      recent_transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance_after: tx.balanceAfter,
        description: tx.description,
        created_at: tx.createdAt,
      })),
      created_at: account.createdAt,
      updated_at: account.updatedAt,
    }

    return ApiResponse.success(data, 'Cashback account retrieved', 200)
  }


  @Get('cashback/:id/transactions')
  @ApiOperation({
    summary: 'List cashback transactions',
    description: 'Returns paginated transactions for a specific cashback account. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Cashback account UUID', type: String })
  @ApiOkResponse({ description: 'Paginated cashback transactions' })
  @ApiNotFoundResponse({ description: 'Cashback account not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listCashbackTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AdminPaginatedQueryDto,
  ) {
    const account = await this.cashbackAccountRepo.findOne({ where: { id } })

    if (!account) {
      throw new NotFoundException('Cashback account not found')
    }

    const { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 'tx.createdAt', updated_at: 'tx.updatedAt', id: 'tx.id', type: 'tx.type', amount: 'tx.amount' }
    const sortField = sortMap[sort] || 'tx.createdAt'

    const qb = this.cashbackTxRepo.createQueryBuilder('tx')
      .where('tx.cashbackAccountId = :accountId', { accountId: id })

    const total = await qb.getCount()

    const transactions = await qb
      .orderBy(sortField, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    const data = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balance_after: tx.balanceAfter,
      description: tx.description,
      created_at: tx.createdAt,
    }))

    return ApiResponse.success(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Cashback transactions retrieved',
      200,
    )
  }


  @Get('cashback-rules')
  @ApiOperation({
    summary: 'List all cashback rules',
    description: 'Returns all cashback rules. Requires ADMIN role.',
  })
  @ApiOkResponse({ description: 'List of cashback rules' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async listCashbackRules() {
    const rules = await this.cashbackRuleRepo.find({
      order: { createdAt: 'DESC' },
    })

    const data = rules.map((rule) => ({
      id: rule.id,
      percentage: rule.percentage,
      minimum_amount: rule.minimumAmount,
      maximum_amount: rule.maximumAmount,
      starts_at: rule.startsAt,
      ends_at: rule.endsAt,
      status: rule.status,
      created_at: rule.createdAt,
      updated_at: rule.updatedAt,
    }))

    return ApiResponse.success(data, 'Cashback rules retrieved', 200)
  }


  @Patch('cashback-rules/:id')
  @ApiOperation({
    summary: 'Update a cashback rule',
    description: 'Updates cashback rule fields. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Cashback rule UUID', type: String })
  @ApiBody({ type: UpdateCashbackRuleBodyDto })
  @ApiOkResponse({ description: 'Updated cashback rule' })
  @ApiNotFoundResponse({ description: 'Cashback rule not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async updateCashbackRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCashbackRuleBodyDto,
  ) {
    const rule = await this.cashbackRuleRepo.findOne({ where: { id } })

    if (!rule) {
      throw new NotFoundException('Cashback rule not found')
    }

    if (body.percentage !== undefined) rule.percentage = body.percentage
    if (body.minimum_amount !== undefined) rule.minimumAmount = body.minimum_amount
    if (body.maximum_amount !== undefined) rule.maximumAmount = body.maximum_amount
    if (body.starts_at !== undefined) rule.startsAt = new Date(body.starts_at)
    if (body.ends_at !== undefined) rule.endsAt = new Date(body.ends_at)
    if (body.status !== undefined) rule.status = body.status

    const saved = await this.cashbackRuleRepo.save(rule)

    const data = {
      id: saved.id,
      percentage: saved.percentage,
      minimum_amount: saved.minimumAmount,
      maximum_amount: saved.maximumAmount,
      starts_at: saved.startsAt,
      ends_at: saved.endsAt,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    }

    return ApiResponse.success(data, 'Cashback rule updated', 200)
  }


  @Delete('cashback-rules/:id')
  @ApiOperation({
    summary: 'Delete a cashback rule',
    description: 'Permanently removes a cashback rule. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Cashback rule UUID', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Cashback rule not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async deleteCashbackRule(@Param('id', ParseUUIDPipe) id: string) {
    const rule = await this.cashbackRuleRepo.findOne({ where: { id } })

    if (!rule) {
      throw new NotFoundException('Cashback rule not found')
    }

    await this.cashbackRuleRepo.remove(rule)

    return ApiResponse.success(
      { success: true, message: 'Cashback rule deleted' },
      'Cashback rule deleted',
      200,
    )
  }
}
