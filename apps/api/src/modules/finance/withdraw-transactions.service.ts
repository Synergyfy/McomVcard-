import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WithdrawTransaction } from './entities/withdraw-transaction.entity'
import { CreateWithdrawTransactionDto, UpdateWithdrawTransactionDto } from './dto/withdraw-transaction.dto'
import { AdminPaginatedQueryDto, PaginatedResult } from '../admin/dto/admin-paginated-query.dto'

@Injectable()
export class WithdrawTransactionsService {
  constructor(
    @InjectRepository(WithdrawTransaction)
    private readonly withdrawTransactionRepository: Repository<WithdrawTransaction>,
  ) {}

  async findAll(query: AdminPaginatedQueryDto): Promise<PaginatedResult<WithdrawTransaction>> {
    const { page = 1, limit = 20, search, status } = query

    const qb = this.withdrawTransactionRepository
      .createQueryBuilder('wt')
      .leftJoinAndSelect('wt.user', 'user')

    if (status) {
      qb.andWhere('wt.status = :status', { status })
    }

    if (search) {
      qb.andWhere('user.email ILIKE :search', { search: `%${search}%` })
    }

    const [data, total] = await qb
      .orderBy('wt.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<WithdrawTransaction> {
    const withdraw = await this.withdrawTransactionRepository.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!withdraw) {
      throw new NotFoundException('Withdraw transaction not found')
    }
    return withdraw
  }

  async create(dto: CreateWithdrawTransactionDto): Promise<WithdrawTransaction> {
    const withdraw = this.withdrawTransactionRepository.create({
      userId: dto.userId,
      amount: dto.amount,
      currency: dto.currency ?? 'GBP',
      status: (dto.status as any) ?? 'pending',
      bankDetails: dto.bankDetails ?? null,
      notes: dto.notes ?? null,
    })
    return this.withdrawTransactionRepository.save(withdraw)
  }

  async update(id: string, dto: UpdateWithdrawTransactionDto): Promise<WithdrawTransaction> {
    const withdraw = await this.findOne(id)

    if (dto.amount !== undefined) withdraw.amount = dto.amount
    if (dto.currency !== undefined) withdraw.currency = dto.currency
    if (dto.status !== undefined) withdraw.status = dto.status as any
    if (dto.bankDetails !== undefined) withdraw.bankDetails = dto.bankDetails
    if (dto.notes !== undefined) withdraw.notes = dto.notes

    return this.withdrawTransactionRepository.save(withdraw)
  }

  async approve(id: string): Promise<WithdrawTransaction> {
    const withdraw = await this.findOne(id)

    if (withdraw.status !== 'pending') {
      throw new BadRequestException('Only pending transactions can be approved')
    }

    withdraw.status = 'approved'
    withdraw.processedAt = new Date()
    return this.withdrawTransactionRepository.save(withdraw)
  }

  async reject(id: string): Promise<WithdrawTransaction> {
    const withdraw = await this.findOne(id)

    if (withdraw.status !== 'pending') {
      throw new BadRequestException('Only pending transactions can be rejected')
    }

    withdraw.status = 'rejected'
    withdraw.processedAt = new Date()
    return this.withdrawTransactionRepository.save(withdraw)
  }

  async markPaid(id: string): Promise<WithdrawTransaction> {
    const withdraw = await this.findOne(id)

    if (withdraw.status !== 'approved') {
      throw new BadRequestException('Only approved transactions can be marked as paid')
    }

    withdraw.status = 'paid'
    withdraw.processedAt = new Date()
    return this.withdrawTransactionRepository.save(withdraw)
  }

  async remove(id: string): Promise<void> {
    const withdraw = await this.findOne(id)
    await this.withdrawTransactionRepository.remove(withdraw)
  }
}
