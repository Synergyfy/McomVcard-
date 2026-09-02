import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Testimonial } from './entities/testimonial.entity'
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto'

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async findAll(): Promise<Testimonial[]> {
    return this.testimonialRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({ where: { id } })
    if (!testimonial) {
      throw new NotFoundException('Testimonial not found')
    }
    return testimonial
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const testimonial = this.testimonialRepository.create({
      authorName: dto.authorName,
      authorEmail: dto.authorEmail ?? null,
      authorAvatar: dto.authorAvatar ?? null,
      content: dto.content,
      rating: dto.rating ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.testimonialRepository.save(testimonial)
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOne(id)

    if (dto.authorName !== undefined) testimonial.authorName = dto.authorName
    if (dto.authorEmail !== undefined) testimonial.authorEmail = dto.authorEmail ?? null
    if (dto.authorAvatar !== undefined) testimonial.authorAvatar = dto.authorAvatar ?? null
    if (dto.content !== undefined) testimonial.content = dto.content
    if (dto.rating !== undefined) testimonial.rating = dto.rating ?? null
    if (dto.displayOrder !== undefined) testimonial.displayOrder = dto.displayOrder
    if (dto.isActive !== undefined) testimonial.isActive = dto.isActive

    return this.testimonialRepository.save(testimonial)
  }

  async remove(id: string): Promise<void> {
    const testimonial = await this.findOne(id)
    await this.testimonialRepository.remove(testimonial)
  }

  async reorder(ids: string[]): Promise<Testimonial[]> {
    // Single query to load all items, then batch save
    const all = await this.testimonialRepository
      .createQueryBuilder('t')
      .where('t.id IN (:...ids)', { ids })
      .getMany()

    const byId = new Map(all.map((t) => [t.id, t]))
    const toSave = ids
      .map((id, i) => {
        const t = byId.get(id)
        if (!t) return null
        t.displayOrder = i
        return t
      })
      .filter((t): t is Testimonial => t !== null)

    return this.testimonialRepository.save(toSave)
  }
}
