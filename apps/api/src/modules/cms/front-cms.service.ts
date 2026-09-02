import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FrontCms } from './entities/front-cms.entity'
import { BulkUpdateFrontCmsDto, CreateFrontCmsDto, UpdateFrontCmsDto } from './dto/front-cms.dto'

@Injectable()
export class FrontCmsService {
  constructor(
    @InjectRepository(FrontCms)
    private readonly frontCmsRepository: Repository<FrontCms>,
  ) {}

  async findAll(): Promise<FrontCms[]> {
    return this.frontCmsRepository.find({ order: { group: 'ASC', key: 'ASC' } })
  }

  async findByGroup(group: string): Promise<FrontCms[]> {
    return this.frontCmsRepository.find({
      where: { group },
      order: { key: 'ASC' },
    })
  }

  async findOne(id: string): Promise<FrontCms> {
    const entity = await this.frontCmsRepository.findOne({ where: { id } })

    if (!entity) {
      throw new NotFoundException('Front CMS entry not found')
    }

    return entity
  }

  async getByKey(key: string): Promise<string | null> {
    const entity = await this.frontCmsRepository.findOne({ where: { key } })
    return entity ? entity.value : null
  }

  async create(dto: CreateFrontCmsDto): Promise<FrontCms> {
    const entity = this.frontCmsRepository.create({
      key: dto.key,
      value: dto.value,
      group: dto.group ?? 'general',
    })

    return this.frontCmsRepository.save(entity)
  }

  async update(id: string, dto: UpdateFrontCmsDto): Promise<FrontCms> {
    const entity = await this.findOne(id)

    if (dto.value !== undefined) entity.value = dto.value
    if (dto.group !== undefined) entity.group = dto.group

    return this.frontCmsRepository.save(entity)
  }

  async set(key: string, value: string, group?: string): Promise<FrontCms> {
    let entity = await this.frontCmsRepository.findOne({ where: { key } })

    if (entity) {
      entity.value = value
      if (group !== undefined) entity.group = group
    } else {
      entity = this.frontCmsRepository.create({
        key,
        value,
        group: group ?? 'general',
      })
    }

    return this.frontCmsRepository.save(entity)
  }

  async setBulk(dto: BulkUpdateFrontCmsDto): Promise<FrontCms[]> {
    const results: FrontCms[] = []

    for (const item of dto.items) {
      const entity = await this.set(item.key, item.value, dto.group)
      results.push(entity)
    }

    return results
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id)
    await this.frontCmsRepository.remove(entity)
  }
}
