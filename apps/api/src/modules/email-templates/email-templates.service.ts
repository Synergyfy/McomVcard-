import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EmailTemplate } from './entities/email-template.entity'
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto'

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async findAll(): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({ where: { id } })
    if (!template) {
      throw new NotFoundException('Email template not found')
    }
    return template
  }

  async create(dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create({
      name: dto.name,
      subject: dto.subject,
      body: dto.body,
      category: dto.category ?? 'transactional',
      isActive: dto.isActive ?? true,
    })
    return this.emailTemplateRepository.save(template)
  }

  async update(id: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.findOne(id)

    if (dto.name !== undefined) template.name = dto.name
    if (dto.subject !== undefined) template.subject = dto.subject
    if (dto.body !== undefined) template.body = dto.body
    if (dto.category !== undefined) template.category = dto.category
    if (dto.isActive !== undefined) template.isActive = dto.isActive

    return this.emailTemplateRepository.save(template)
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id)
    await this.emailTemplateRepository.remove(template)
  }
}
