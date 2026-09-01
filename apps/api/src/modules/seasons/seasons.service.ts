import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Season } from './entities/season.entity'
import { CreateSeasonDto } from './dto/create-season.dto'
import { UpdateSeasonDto } from './dto/update-season.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { SeasonResponseDto } from './dto/season-response.dto'

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season) private seasonsRepo: Repository<Season>,
  ) {}

  // Seasons are platform-wide (no business owner). Any authenticated user can manage them.
  async create(dto: CreateSeasonDto) {
    this.assertValidDates(dto.starts_at, dto.ends_at)

    const saved = await this.seasonsRepo.save(
      this.seasonsRepo.create({
        name: dto.name,
        startsAt: new Date(dto.starts_at),
        endsAt: new Date(dto.ends_at),
        status: 'active',
      }),
    )

    return ApiResponse.success(SeasonResponseDto.fromEntity(saved), 'Season created', 201)
  }

  async list() {
    const seasons = await this.seasonsRepo.find({
      order: { startsAt: 'ASC' },
    })

    return ApiResponse.success(seasons.map(SeasonResponseDto.fromEntity), 'Seasons retrieved', 200)
  }

  /** Active seasons (status = active and not yet ended) — used by the MCOM Solutions connector. */
  async listActive(): Promise<Season[]> {
    const now = new Date()
    const seasons = await this.seasonsRepo.find({
      where: { status: 'active' },
      order: { startsAt: 'ASC' },
    })
    return seasons.filter((season) => season.endsAt > now)
  }

  async findOne(id: string) {
    const season = await this.seasonsRepo.findOne({ where: { id } })

    if (!season) throw new NotFoundException('Season not found')

    return season
  }

  async update(id: string, dto: UpdateSeasonDto) {
    const season = await this.findOne(id)

    if (dto.starts_at !== undefined && dto.ends_at !== undefined) {
      this.assertValidDates(dto.starts_at, dto.ends_at)
    } else if (dto.starts_at !== undefined) {
      this.assertValidDates(dto.starts_at, season.endsAt.toISOString())
    } else if (dto.ends_at !== undefined) {
      this.assertValidDates(season.startsAt.toISOString(), dto.ends_at)
    }

    const patch: Partial<Season> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.starts_at !== undefined) patch.startsAt = new Date(dto.starts_at)
    if (dto.ends_at !== undefined) patch.endsAt = new Date(dto.ends_at)

    await this.seasonsRepo.update({ id }, patch)

    return ApiResponse.success(SeasonResponseDto.fromEntity(await this.findOne(id)), 'Season updated', 200)
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.seasonsRepo.delete({ id })

    return ApiResponse.message('Season deleted', 200)
  }

  private assertValidDates(startsAt: string, endsAt: string) {
    const start = new Date(startsAt)
    const end = new Date(endsAt)

    if (end <= start) {
      throw new BadRequestException('ends_at must be later than starts_at')
    }
  }
}