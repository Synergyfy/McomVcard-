import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Faq } from './entities/faq.entity'
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  async findAll(): Promise<Faq[]> {
    return this.faqRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { id } })
    if (!faq) {
      throw new NotFoundException('FAQ not found')
    }
    return faq
  }

  async create(dto: CreateFaqDto): Promise<Faq> {
    const faq = this.faqRepository.create({
      question: dto.question,
      answer: dto.answer,
      category: dto.category ?? 'General',
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.faqRepository.save(faq)
  }

  async update(id: string, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id)

    if (dto.question !== undefined) faq.question = dto.question
    if (dto.answer !== undefined) faq.answer = dto.answer
    if (dto.category !== undefined) faq.category = dto.category
    if (dto.displayOrder !== undefined) faq.displayOrder = dto.displayOrder
    if (dto.isActive !== undefined) faq.isActive = dto.isActive

    return this.faqRepository.save(faq)
  }

  async remove(id: string): Promise<void> {
    const faq = await this.findOne(id)
    await this.faqRepository.remove(faq)
  }

  async reorder(ids: string[]): Promise<Faq[]> {
    const faqs: Faq[] = []
    for (let i = 0; i < ids.length; i++) {
      const faq = await this.findOne(ids[i])
      faq.displayOrder = i
      faqs.push(await this.faqRepository.save(faq))
    }
    return faqs
  }
}
