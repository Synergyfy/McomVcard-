import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NewsletterCampaign } from './entities/newsletter-campaign.entity'
import { Subscriber } from './entities/subscriber.entity'
import { CreateNewsletterCampaignDto, UpdateNewsletterCampaignDto } from './dto/newsletter-campaign.dto'
import { MailService } from '../mail/mail.service'

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger('Newsletter')

  constructor(
    @InjectRepository(NewsletterCampaign)
    private readonly campaignRepo: Repository<NewsletterCampaign>,
    @InjectRepository(Subscriber)
    private readonly subscriberRepo: Repository<Subscriber>,
    private readonly mailService: MailService,
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
    if (status) qb.andWhere('c.status = :status', { status })

    const total = await qb.getCount()
    const data = await qb.orderBy(`c.${sort}`, order).skip((page - 1) * limit).take(limit).getMany()

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string): Promise<NewsletterCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } })
    if (!campaign) throw new NotFoundException('Newsletter campaign not found')
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
    if (dto.scheduledAt !== undefined) campaign.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null
    return this.campaignRepo.save(campaign)
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id)
    await this.campaignRepo.remove(campaign)
  }

  /** Delivers a campaign to every active subscriber through Resend/SMTP. */
  async send(id: string): Promise<NewsletterCampaign> {
    const campaign = await this.findOne(id)
    if (campaign.status === 'sent') throw new BadRequestException('Campaign has already been sent')

    const subscribers = await this.subscriberRepo.find({ where: { status: 'active' } })
    if (subscribers.length === 0) {
      throw new BadRequestException('There are no active subscribers to send this campaign to')
    }

    const looksLikeHtml = /<[a-z][\s\S]*>/i.test(campaign.body)
    let delivered = 0
    let failed = 0

    for (const subscriber of subscribers) {
      try {
        await this.mailService.sendMail({
          to: subscriber.email,
          subject: campaign.subject,
          html: looksLikeHtml ? campaign.body : undefined,
          text: looksLikeHtml ? undefined : campaign.body,
        })
        delivered += 1
      } catch (error) {
        failed += 1
        this.logger.warn(
          `Newsletter ${campaign.id} delivery to ${subscriber.email} failed: ${
            error instanceof Error ? error.message : error
          }`,
        )
      }
    }

    campaign.status = 'sent'
    campaign.sentCount = delivered
    const saved = await this.campaignRepo.save(campaign)
    this.logger.log(`Newsletter ${campaign.id} delivered to ${delivered}/${subscribers.length} subscribers (${failed} failed)`)
    return saved
  }
}
