import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { CashbackAccount } from './entities/cashback-account.entity'
import { CashbackTransaction, CashbackTransactionType } from './entities/cashback-transaction.entity'
import { CashbackRule } from './entities/cashback-rule.entity'
import { CreateCashbackTransactionDto } from './dto/create-cashback-transaction.dto'
import { CreateCashbackRuleDto } from './dto/create-cashback-rule.dto'
import { UpdateCashbackRuleDto } from './dto/update-cashback-rule.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { CashbackAccountResponseDto, CashbackRuleResponseDto, CashbackTransactionResponseDto } from './dto/cashback-response.dto'

@Injectable()
export class CashbackService {
  constructor(
    @InjectRepository(CashbackAccount) private accountsRepo: Repository<CashbackAccount>,
    @InjectRepository(CashbackTransaction) private transactionsRepo: Repository<CashbackTransaction>,
    @InjectRepository(CashbackRule) private rulesRepo: Repository<CashbackRule>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Rules (platform-wide) ---

  async createRule(dto: CreateCashbackRuleDto) {
    if (dto.starts_at && dto.ends_at && new Date(dto.ends_at) <= new Date(dto.starts_at)) {
      throw new BadRequestException('ends_at must be after starts_at')
    }

    const saved = await this.rulesRepo.save(
      this.rulesRepo.create({
        percentage: dto.percentage,
        minimumAmount: dto.minimum_amount ?? null,
        maximumAmount: dto.maximum_amount ?? null,
        startsAt: dto.starts_at ? new Date(dto.starts_at) : null,
        endsAt: dto.ends_at ? new Date(dto.ends_at) : null,
        status: 'active',
      }),
    )

    return ApiResponse.success(CashbackRuleResponseDto.fromEntity(saved), 'Cashback rule created', 201)
  }

  async listRules() {
    const rules = await this.rulesRepo.find({ order: { createdAt: 'DESC' } })

    return ApiResponse.success(rules.map(CashbackRuleResponseDto.fromEntity), 'Cashback rules retrieved', 200)
  }

  async findOneRule(id: string) {
    const rule = await this.rulesRepo.findOne({ where: { id } })

    if (!rule) throw new NotFoundException('Cashback rule not found')

    return rule
  }

  async getRule(id: string) {
    return ApiResponse.success(CashbackRuleResponseDto.fromEntity(await this.findOneRule(id)), 'Cashback rule retrieved', 200)
  }

  async updateRule(id: string, dto: UpdateCashbackRuleDto) {
    const rule = await this.findOneRule(id)

    const patch: Partial<CashbackRule> = {}

    if (dto.percentage !== undefined) patch.percentage = dto.percentage
    if (dto.minimum_amount !== undefined) patch.minimumAmount = dto.minimum_amount
    if (dto.maximum_amount !== undefined) patch.maximumAmount = dto.maximum_amount
    if (dto.starts_at !== undefined) patch.startsAt = dto.starts_at ? new Date(dto.starts_at) : null
    if (dto.ends_at !== undefined) patch.endsAt = dto.ends_at ? new Date(dto.ends_at) : null

    const startsAt = patch.startsAt ?? rule.startsAt
    const endsAt = patch.endsAt !== undefined ? patch.endsAt : rule.endsAt

    if (startsAt && endsAt && endsAt <= startsAt) throw new BadRequestException('ends_at must be after starts_at')

    await this.rulesRepo.update({ id }, patch)

    return ApiResponse.success(CashbackRuleResponseDto.fromEntity(await this.findOneRule(id)), 'Cashback rule updated', 200)
  }

  async removeRule(id: string) {
    await this.findOneRule(id)

    await this.rulesRepo.delete({ id })

    return ApiResponse.message('Cashback rule deleted', 200)
  }

  // --- Account (per-user) ---

  async getMyAccount(userId: string) {
    const account = await this.getOwnedAccount(userId)

    return ApiResponse.success(CashbackAccountResponseDto.fromEntity(account), 'Cashback account retrieved', 200)
  }

  async createAccount(userId: string) {
    const existing = await this.accountsRepo.findOne({ where: { userId } })

    if (existing) return ApiResponse.success(CashbackAccountResponseDto.fromEntity(existing), 'Cashback account already exists', 200)

    const saved = await this.accountsRepo.save(
      this.accountsRepo.create({ userId, balance: 0, status: 'active' }),
    )

    return ApiResponse.success(CashbackAccountResponseDto.fromEntity(saved), 'Cashback account created', 201)
  }

  async listMyTransactions(userId: string) {
    const account = await this.getOwnedAccount(userId)

    const transactions = await this.transactionsRepo.find({
      where: { cashbackAccountId: account.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(transactions.map(CashbackTransactionResponseDto.fromEntity), 'Cashback transactions retrieved', 200)
  }

  async getMyTransaction(userId: string, transactionId: string) {
    const account = await this.getOwnedAccount(userId)

    const transaction = await this.transactionsRepo.findOne({
      where: { id: transactionId, cashbackAccountId: account.id },
    })

    if (!transaction) throw new NotFoundException('Cashback transaction not found')

    return ApiResponse.success(CashbackTransactionResponseDto.fromEntity(transaction), 'Cashback transaction retrieved', 200)
  }

  async createTransaction(userId: string, dto: CreateCashbackTransactionDto) {
    const account = await this.getOwnedAccount(userId)

    if (account.status !== 'active') throw new BadRequestException('Cashback account is not active')

    let delta: number

    switch (dto.type) {
      case 'EARN':
        if (dto.amount <= 0) throw new BadRequestException('EARN amount must be positive')
        delta = dto.amount
        break

      case 'REDEEM':
        if (dto.amount <= 0) throw new BadRequestException('REDEEM amount must be positive')
        delta = -dto.amount
        break

      case 'ADJUST':
        if (dto.amount === 0) throw new BadRequestException('ADJUST amount must be non-zero')
        delta = dto.amount
        break
    }

    const balanceAfter = Number((account.balance + delta).toFixed(2))

    if (balanceAfter < 0) throw new BadRequestException('Insufficient cashback balance for this transaction')

    // The transaction table is the history ledger — balance and ledger row must be written atomically (spec §33).
    const saved = await this.dataSource.transaction(async (manager) => {
      const transaction = await manager.save(
        this.transactionsRepo.create({
          cashbackAccountId: account.id,
          type: dto.type,
          amount: delta,
          balanceAfter,
          description: dto.description ?? null,
        }),
      )

      await manager.update(CashbackAccount, { id: account.id }, { balance: balanceAfter })

      return transaction
    })

    return ApiResponse.success(CashbackTransactionResponseDto.fromEntity(saved), 'Cashback transaction recorded', 201)
  }

  private async getOwnedAccount(userId: string) {
    const account = await this.accountsRepo.findOne({ where: { userId } })

    if (!account) throw new NotFoundException('Cashback account not found. Create one first.')

    return account
  }
}