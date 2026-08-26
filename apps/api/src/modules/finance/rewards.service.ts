import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { RewardBalance } from './entities/reward-balance.entity'
import { RewardTransaction, RewardTransactionType } from './entities/reward-transaction.entity'
import { CreateRewardTransactionDto } from './dto/create-reward-transaction.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { RewardBalanceResponseDto, RewardTransactionResponseDto } from './dto/reward-response.dto'

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(RewardBalance) private balancesRepo: Repository<RewardBalance>,
    @InjectRepository(RewardTransaction) private transactionsRepo: Repository<RewardTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getMyBalance(userId: string) {
    const balance = await this.balancesRepo.findOne({ where: { userId } })

    if (!balance) throw new NotFoundException('Reward balance not found. Create one first.')

    return ApiResponse.success(RewardBalanceResponseDto.fromEntity(balance), 'Reward balance retrieved', 200)
  }

  async createBalance(userId: string) {
    const existing = await this.balancesRepo.findOne({ where: { userId } })

    if (existing) return ApiResponse.success(RewardBalanceResponseDto.fromEntity(existing), 'Reward balance already exists', 200)

    const saved = await this.balancesRepo.save(
      this.balancesRepo.create({ userId, balance: 0, status: 'active' }),
    )

    return ApiResponse.success(RewardBalanceResponseDto.fromEntity(saved), 'Reward balance created', 201)
  }

  async listMyTransactions(userId: string) {
    const balance = await this.getOwnedBalance(userId)

    const transactions = await this.transactionsRepo.find({
      where: { rewardBalanceId: balance.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(transactions.map(RewardTransactionResponseDto.fromEntity), 'Reward transactions retrieved', 200)
  }

  async getMyTransaction(userId: string, transactionId: string) {
    const balance = await this.getOwnedBalance(userId)

    const transaction = await this.transactionsRepo.findOne({
      where: { id: transactionId, rewardBalanceId: balance.id },
    })

    if (!transaction) throw new NotFoundException('Reward transaction not found')

    return ApiResponse.success(RewardTransactionResponseDto.fromEntity(transaction), 'Reward transaction retrieved', 200)
  }

  async createTransaction(userId: string, dto: CreateRewardTransactionDto) {
    const balance = await this.getOwnedBalance(userId)

    if (balance.status !== 'active') throw new BadRequestException('Reward balance is not active')

    // Direction per type (spec §32). EARN/ADJUST can move up; REDEEM/EXPIRE/ADJUST-down move down.
    let delta: number

    switch (dto.type) {
      case 'EARN':
        if (dto.amount <= 0) throw new BadRequestException('EARN amount must be positive')
        delta = dto.amount
        break

      case 'REDEEM':
      case 'EXPIRE':
        if (dto.amount <= 0) throw new BadRequestException(`${dto.type} amount must be positive`)
        delta = -dto.amount
        break

      case 'ADJUST':
        if (dto.amount === 0) throw new BadRequestException('ADJUST amount must be non-zero')
        delta = dto.amount
        break
    }

    const balanceAfter = Number((balance.balance + delta).toFixed(2))

    if (balanceAfter < 0) throw new BadRequestException('Insufficient reward balance for this transaction')

    // The transaction table is the history ledger — balance and ledger row must be written atomically (spec §32).
    const saved = await this.dataSource.transaction(async (manager) => {
      const transaction = await manager.save(
        this.transactionsRepo.create({
          rewardBalanceId: balance.id,
          type: dto.type,
          amount: delta,
          balanceAfter,
          description: dto.description ?? null,
        }),
      )

      await manager.update(RewardBalance, { id: balance.id }, { balance: balanceAfter })

      return transaction
    })

    return ApiResponse.success(RewardTransactionResponseDto.fromEntity(saved), 'Reward transaction recorded', 201)
  }

  private async getOwnedBalance(userId: string) {
    const balance = await this.balancesRepo.findOne({ where: { userId } })

    if (!balance) throw new NotFoundException('Reward balance not found. Create one first.')

    return balance
  }
}