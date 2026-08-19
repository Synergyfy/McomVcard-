import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusinessesService } from '../businesses/businesses.service'
import { Service } from './entities/service.entity'
import { CreateServiceDto } from './dto/create-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { ServiceResponseDto } from './dto/service-response.dto'

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private servicesRepo: Repository<Service>,
    private readonly businessesService: BusinessesService,
  ) {}

  async create(businessId: string, ownerId: string, dto: CreateServiceDto) {
    await this.businessesService.findOwned(businessId, ownerId)

    const saved = await this.servicesRepo.save(
      this.servicesRepo.create({
        businessId,
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price ?? null,
        currency: dto.currency ?? 'USD',
        duration: dto.duration ?? null,
        image: dto.image ?? null,
        status: 'active',
      }),
    )

    return ApiResponse.success(ServiceResponseDto.fromEntity(await this.findOne(saved.id)), 'Service created', 201)
  }

  // Public service listing: readable by any authenticated user, but the parent business must exist.
  async list(businessId: string) {
    await this.businessesService.findOne(businessId)

    const services = await this.servicesRepo.find({
      where: { businessId },
      order: { createdAt: 'ASC' },
    })

    return ApiResponse.success(services.map(ServiceResponseDto.fromEntity), 'Services retrieved', 200)
  }

  async findOne(id: string) {
    const service = await this.servicesRepo.findOne({ where: { id } })

    if (!service) throw new NotFoundException('Service not found')

    return service
  }

  // Returns the service if it belongs to the given user, else 403/404.
  async findOwned(id: string, ownerId: string) {
    const service = await this.findOne(id)

    await this.businessesService.findOwned(service.businessId, ownerId)

    return service
  }

  async update(id: string, ownerId: string, dto: UpdateServiceDto) {
    await this.findOwned(id, ownerId)

    const patch: Partial<Service> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.price !== undefined) patch.price = dto.price
    if (dto.currency !== undefined) patch.currency = dto.currency
    if (dto.duration !== undefined) patch.duration = dto.duration
    if (dto.image !== undefined) patch.image = dto.image

    await this.servicesRepo.update({ id }, patch)

    return ApiResponse.success(ServiceResponseDto.fromEntity(await this.findOne(id)), 'Service updated', 200)
  }

  async remove(id: string, ownerId: string) {
    await this.findOwned(id, ownerId)

    await this.servicesRepo.delete({ id })

    return ApiResponse.message('Service deleted', 200)
  }
}