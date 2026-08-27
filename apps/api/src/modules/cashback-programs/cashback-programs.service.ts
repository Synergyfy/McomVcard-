import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CashbackProgram } from './entities/cashback-program.entity'
import { CreateCashbackProgramDto } from './dto/create-cashback-program.dto'
import { UpdateCashbackProgramDto } from './dto/update-cashback-program.dto'
import { BusinessesService } from '../businesses/businesses.service'
import { ApiResponse } from '../../lib/utils/api-response'

@Injectable()
export class CashbackProgramsService {
  constructor(
    @InjectRepository(CashbackProgram) private readonly cashbackProgramsRepo: Repository<CashbackProgram>,
    private readonly businessesService: BusinessesService,
  ) {}

  async create(userId: string, dto: CreateCashbackProgramDto): Promise<CashbackProgram> {
    await this.businessesService.findOwned(dto.business_id, userId)

    const program = this.cashbackProgramsRepo.create({
      businessId: dto.business_id,
      title: dto.title,
      rate: dto.rate,
      status: dto.status,
    })

    return this.cashbackProgramsRepo.save(program)
  }

  async listForBusiness(businessId: string, userId: string): Promise<CashbackProgram[]> {
    await this.businessesService.findOwned(businessId, userId)
    return this.cashbackProgramsRepo.find({ where: { businessId }, order: { createdAt: 'DESC' } })
  }

  async listForOwner(userId: string): Promise<CashbackProgram[]> {
    const businessesResponse = await this.businessesService.listForOwner(userId)
    const businesses = businessesResponse.data as any[]
    const businessIds = businesses.map((b) => b.id)
    if (businessIds.length === 0) return []

    const programs: CashbackProgram[] = []
    for (const businessId of businessIds) {
      const progs = await this.cashbackProgramsRepo.find({ where: { businessId }, order: { createdAt: 'DESC' } })
      programs.push(...progs)
    }
    return programs
  }

  async findOne(id: string): Promise<CashbackProgram> {
    const program = await this.cashbackProgramsRepo.findOne({ where: { id }, relations: ['business'] })
    if (!program) throw new NotFoundException('Cashback program not found')
    return program
  }

  async update(userId: string, id: string, dto: UpdateCashbackProgramDto): Promise<CashbackProgram> {
    const program = await this.findOne(id)
    await this.businessesService.findOwned(program.businessId, userId)

    if (dto.title !== undefined) program.title = dto.title
    if (dto.rate !== undefined) program.rate = dto.rate
    if (dto.status !== undefined) program.status = dto.status

    return this.cashbackProgramsRepo.save(program)
  }

  async remove(userId: string, id: string): Promise<void> {
    const program = await this.findOne(id)
    await this.businessesService.findOwned(program.businessId, userId)
    await this.cashbackProgramsRepo.remove(program)
  }
}