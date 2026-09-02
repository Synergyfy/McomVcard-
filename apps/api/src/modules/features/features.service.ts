import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Feature } from './entities/feature.entity'
import { CreateFeatureDto, UpdateFeatureDto } from './dto/feature.dto'

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
  ) {}

  async findAll(): Promise<Feature[]> {
    return this.featureRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    })
  }

  async findOne(id: string): Promise<Feature> {
    const feature = await this.featureRepository.findOne({ where: { id } })
    if (!feature) {
      throw new NotFoundException('Feature not found')
    }
    return feature
  }

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const feature = this.featureRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      icon: dto.icon ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.featureRepository.save(feature)
  }

  async update(id: string, dto: UpdateFeatureDto): Promise<Feature> {
    const feature = await this.findOne(id)

    if (dto.title !== undefined) feature.title = dto.title
    if (dto.description !== undefined) feature.description = dto.description ?? null
    if (dto.icon !== undefined) feature.icon = dto.icon ?? null
    if (dto.displayOrder !== undefined) feature.displayOrder = dto.displayOrder
    if (dto.isActive !== undefined) feature.isActive = dto.isActive

    return this.featureRepository.save(feature)
  }

  async remove(id: string): Promise<void> {
    const feature = await this.findOne(id)
    await this.featureRepository.remove(feature)
  }

  async reorder(ids: string[]): Promise<Feature[]> {
    const features: Feature[] = []
    for (let i = 0; i < ids.length; i++) {
      const feature = await this.findOne(ids[i])
      feature.displayOrder = i
      features.push(await this.featureRepository.save(feature))
    }
    return features
  }
}
