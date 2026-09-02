import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere, Like } from 'typeorm'
import { Enquiry } from './entities/enquiry.entity'

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
  ) {}

  async findAll(query: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ data: Enquiry[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const where: FindOptionsWhere<Enquiry> = {}

    if (query.status) {
      where.status = query.status
    }

    if (query.search) {
      return this.searchWithPagination(query.search, where, page, limit)
    }

    const [data, total] = await this.enquiryRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  private async searchWithPagination(
    search: string,
    baseWhere: FindOptionsWhere<Enquiry>,
    page: number,
    limit: number,
  ): Promise<{ data: Enquiry[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const qb = this.enquiryRepository.createQueryBuilder('enquiry')

    if (baseWhere.status) {
      qb.andWhere('enquiry.status = :status', { status: baseWhere.status })
    }

    qb.andWhere('(enquiry.name ILIKE :search OR enquiry.email ILIKE :search OR enquiry.subject ILIKE :search OR enquiry.message ILIKE :search)', {
      search: `%${search}%`,
    })

    qb.orderBy('enquiry.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string): Promise<Enquiry> {
    const enquiry = await this.enquiryRepository.findOne({ where: { id } })
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found')
    }
    return enquiry
  }

  async update(id: string, data: Partial<Pick<Enquiry, 'status' | 'adminNotes'>>): Promise<Enquiry> {
    const enquiry = await this.findOne(id)
    if (data.status !== undefined) enquiry.status = data.status
    if (data.adminNotes !== undefined) enquiry.adminNotes = data.adminNotes
    return this.enquiryRepository.save(enquiry)
  }

  async markRead(id: string): Promise<Enquiry> {
    const enquiry = await this.findOne(id)
    if (enquiry.status === 'new') {
      enquiry.status = 'read'
      return this.enquiryRepository.save(enquiry)
    }
    return enquiry
  }

  async remove(id: string): Promise<void> {
    const enquiry = await this.findOne(id)
    await this.enquiryRepository.remove(enquiry)
  }
}
