import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CashPayment } from './entities/cash-payment.entity'
import { CreateCashPaymentDto, UpdateCashPaymentDto } from './dto/cash-payment.dto'
import { AdminPaginatedQueryDto, PaginatedResult } from '../admin/dto/admin-paginated-query.dto'

@Injectable()
export class CashPaymentsService {
  constructor(
    @InjectRepository(CashPayment)
    private readonly cashPaymentRepository: Repository<CashPayment>,
  ) {}

  async findAll(query: AdminPaginatedQueryDto): Promise<PaginatedResult<CashPayment>> {
    const { page = 1, limit = 20, search, status } = query

    const qb = this.cashPaymentRepository
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.user', 'user')

    if (status) {
      qb.andWhere('cp.status = :status', { status })
    }

    if (search) {
      qb.andWhere('(user.email ILIKE :search OR cp.reference ILIKE :search)', { search: `%${search}%` })
    }

    const [data, total] = await qb
      .orderBy('cp.created_at', 'DESC')
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

  async findOne(id: string): Promise<CashPayment> {
    const cashPayment = await this.cashPaymentRepository.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!cashPayment) {
      throw new NotFoundException('Cash payment not found')
    }
    return cashPayment
  }

  async create(dto: CreateCashPaymentDto): Promise<CashPayment> {
    const cashPayment = this.cashPaymentRepository.create({
      userId: dto.userId,
      amount: dto.amount,
      currency: dto.currency ?? 'GBP',
      reference: dto.reference ?? null,
      status: (dto.status as any) ?? 'pending',
      notes: dto.notes ?? null,
    })
    return this.cashPaymentRepository.save(cashPayment)
  }

  async update(id: string, dto: UpdateCashPaymentDto): Promise<CashPayment> {
    const cashPayment = await this.findOne(id)

    if (dto.amount !== undefined) cashPayment.amount = dto.amount
    if (dto.currency !== undefined) cashPayment.currency = dto.currency
    if (dto.reference !== undefined) cashPayment.reference = dto.reference
    if (dto.status !== undefined) cashPayment.status = dto.status as any
    if (dto.notes !== undefined) cashPayment.notes = dto.notes

    return this.cashPaymentRepository.save(cashPayment)
  }

  async remove(id: string): Promise<void> {
    const cashPayment = await this.findOne(id)
    await this.cashPaymentRepository.remove(cashPayment)
  }
}
