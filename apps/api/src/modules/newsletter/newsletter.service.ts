import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike } from 'typeorm'
import { NewsletterCampaign } from './entities/newsletter-campaign.entity'
import { CreateNewsletterCampaignDto, UpdateNewsletterCampaignDto } from './dto/newsletter-campaign.dto'

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterCampaign)
    private readonly campaignRepo: Repository<NewsletterCampaign>,
  ) {}

  async findAll(options: {
    page: number
    limit: number
    search?: string
    status?: string
    sort?: string
    order?: 'ASC' | 'DESC'
  }): Promise<{ data: NewsletterCampaign[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page, limit, search, status, sort = 'created_at', order = 'DESC' } = options
    const qb = this.campaignRepo.createQueryBuilder('c')

    if (search) {
      qb.andWhere('(c.name ILIKE :search OR c.subject ILIKE :search)', { search: `%${search}%` })
    }

    if (status) {
      qb.andWhere('c.status = :status', { status })
    }

    const total = await qb.getCount()
    const data = await qb
      .orderBy(`c.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string): Promise<NewsletterCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } })
    if (!campaign) {
      throw new NotFoundException('Newsletter campaign not found')
    }
    return campaign
  }

  async create(dto: CreateNewsletterCampaignDto): Promise<NewsletterCampaign> {
    const campaign = this.campaignRepo.create({
      name: dto.name,
      subject: dto.subject,
      body: dto.body,
      status: dto.status ?? 'draft',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    })
    return this.campaignRepo.save(campaign)
  }

  async update(id: string, dto: UpdateNewsletterCampaignDto): Promise<NewsletterCampaign> {
    const campaign = await this.findOne(id)

    if (dto.name !== undefined) campaign.name = dto.name
    if (dto.subject !== undefined) campaign.subject = dto.subject
    if (dto.body !== undefined) campaign.body = dto.body
    if (dto.status !== undefined) campaign.status = dto.status
    if (dto.scheduledAt !== undefined) {
      campaign.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null
    }

    return this.campaignRepo.save(campaign)
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id)
    await this.campaignRepo.remove(campaign)
  }

  async send(id: string): Promise<NewsletterCampaign> {
    const campaign = await this.findOne(id)

    if (campaign.status === 'sent') {
      throw new BadRequestException('Campaign has already been sent')
    }

    campaign.status = 'sent'
    campaign.sentCount += 1

    return this.campaignRepo.save(campaign)
  }
}
