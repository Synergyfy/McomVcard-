import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Subscriber } from './entities/subscriber.entity'
import { CreateSubscriberDto, UpdateSubscriberDto } from './dto/subscriber.dto'

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepo: Repository<Subscriber>,
  ) {}

  async findAll(options: {
    page: number
    limit: number
    search?: string
    status?: string
    sort?: string
    order?: 'ASC' | 'DESC'
  }): Promise<{ data: Subscriber[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page, limit, search, status, sort = 'created_at', order = 'DESC' } = options
    const qb = this.subscriberRepo.createQueryBuilder('s')

    if (search) {
      qb.andWhere('(s.email ILIKE :search OR s.name ILIKE :search)', { search: `%${search}%` })
    }

    if (status) {
      qb.andWhere('s.status = :status', { status })
    }

    const total = await qb.getCount()
    const data = await qb
      .orderBy(`s.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string): Promise<Subscriber> {
    const subscriber = await this.subscriberRepo.findOne({ where: { id } })
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found')
    }
    return subscriber
  }

  async create(dto: CreateSubscriberDto): Promise<Subscriber> {
    const existing = await this.subscriberRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('Email is already subscribed')
    }

    const subscriber = this.subscriberRepo.create({
      email: dto.email,
      name: dto.name ?? null,
      status: 'active',
    })
    return this.subscriberRepo.save(subscriber)
  }

  async remove(id: string): Promise<void> {
    const subscriber = await this.findOne(id)
    await this.subscriberRepo.remove(subscriber)
  }

  async unsubscribe(id: string): Promise<Subscriber> {
    const subscriber = await this.findOne(id)

    if (subscriber.status === 'unsubscribed') {
      return subscriber
    }

    subscriber.status = 'unsubscribed'
    subscriber.unsubscribedAt = new Date()

    return this.subscriberRepo.save(subscriber)
  }
}
