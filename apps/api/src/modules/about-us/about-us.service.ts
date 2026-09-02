import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AboutUs } from './entities/about-us.entity'
import { CreateAboutUsDto, UpdateAboutUsDto } from './dto/about-us.dto'

@Injectable()
export class AboutUsService {
  constructor(
    @InjectRepository(AboutUs)
    private readonly aboutUsRepository: Repository<AboutUs>,
  ) {}

  async findAll(): Promise<AboutUs[]> {
    return this.aboutUsRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    })
  }

  async findOne(id: string): Promise<AboutUs> {
    const aboutUs = await this.aboutUsRepository.findOne({ where: { id } })
    if (!aboutUs) {
      throw new NotFoundException('About us entry not found')
    }
    return aboutUs
  }

  async create(dto: CreateAboutUsDto): Promise<AboutUs> {
    const aboutUs = this.aboutUsRepository.create({
      section: dto.section,
      title: dto.title,
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.aboutUsRepository.save(aboutUs)
  }

  async update(id: string, dto: UpdateAboutUsDto): Promise<AboutUs> {
    const aboutUs = await this.findOne(id)

    if (dto.section !== undefined) aboutUs.section = dto.section
    if (dto.title !== undefined) aboutUs.title = dto.title
    if (dto.content !== undefined) aboutUs.content = dto.content
    if (dto.imageUrl !== undefined) aboutUs.imageUrl = dto.imageUrl
    if (dto.displayOrder !== undefined) aboutUs.displayOrder = dto.displayOrder
    if (dto.isActive !== undefined) aboutUs.isActive = dto.isActive

    return this.aboutUsRepository.save(aboutUs)
  }

  async remove(id: string): Promise<void> {
    const aboutUs = await this.findOne(id)
    await this.aboutUsRepository.remove(aboutUs)
  }

  async reorder(ids: string[]): Promise<AboutUs[]> {
    // Single query to load all entries, then batch save
    const all = await this.aboutUsRepository
      .createQueryBuilder('a')
      .where('a.id IN (:...ids)', { ids })
      .getMany()

    const byId = new Map(all.map((a) => [a.id, a]))
    const toSave = ids
      .map((id, i) => {
        const entry = byId.get(id)
        if (!entry) return null
        entry.displayOrder = i
        return entry
      })
      .filter((entry): entry is AboutUs => entry !== null)

    return this.aboutUsRepository.save(toSave)
  }
}
