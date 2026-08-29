import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusinessesService } from '../businesses/businesses.service'
import { Product } from './entities/product.entity'
import { ProductImage } from './entities/product-image.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CreateProductImageDto } from './dto/create-product-image.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { ProductResponseDto, ProductImageResponseDto } from './dto/product-response.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(ProductImage) private imagesRepo: Repository<ProductImage>,
    private readonly businessesService: BusinessesService,
  ) {}

  async create(businessId: string, ownerId: string, dto: CreateProductDto) {
    await this.businessesService.findOwned(businessId, ownerId)

    const saved = await this.productsRepo.save(
      this.productsRepo.create({
        businessId,
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price ?? null,
        currency: dto.currency ?? 'GBP',
        image: dto.image ?? null,
        status: 'active',
      }),
    )

    return ApiResponse.success(ProductResponseDto.fromEntity(await this.findOne(saved.id)), 'Product created', 201)
  }

  // Public product listing: readable by any authenticated user, but the parent business must exist.
  async list(businessId: string) {
    await this.businessesService.findOne(businessId)

    const products = await this.productsRepo.find({
      where: { businessId },
      relations: { images: true },
      order: { createdAt: 'ASC' },
    })

    return ApiResponse.success(products.map(ProductResponseDto.fromEntity), 'Products retrieved', 200)
  }

  async findOne(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { images: true },
    })

    if (!product) throw new NotFoundException('Product not found')

    return product
  }

  // Returns the product if its parent business belongs to the given user, else 403/404.
  async findOwned(id: string, ownerId: string) {
    const product = await this.findOne(id)

    await this.businessesService.findOwned(product.businessId, ownerId)

    return product
  }

  async update(id: string, ownerId: string, dto: UpdateProductDto) {
    await this.findOwned(id, ownerId)

    const patch: Partial<Product> = {}

    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined) patch.description = dto.description
    if (dto.price !== undefined) patch.price = dto.price
    if (dto.currency !== undefined) patch.currency = dto.currency
    if (dto.image !== undefined) patch.image = dto.image

    await this.productsRepo.update({ id }, patch as any)

    return ApiResponse.success(ProductResponseDto.fromEntity(await this.findOne(id)), 'Product updated', 200)
  }

  async remove(id: string, ownerId: string) {
    await this.findOwned(id, ownerId)

    await this.productsRepo.delete({ id })

    return ApiResponse.message('Product deleted', 200)
  }

  // --- Images ---

  async addImage(productId: string, ownerId: string, dto: CreateProductImageDto) {
    const product = await this.findOwned(productId, ownerId)

    const position = dto.position ?? (await this.nextPosition(productId))

    const saved = await this.imagesRepo.save(
      this.imagesRepo.create({
        productId,
        imageUrl: dto.image_url,
        position,
      }),
    )

    return ApiResponse.success(ProductImageResponseDto.fromEntity(saved), 'Product image added', 201)
  }

  // Public gallery listing: any authenticated user, but the parent product must exist.
  async listImages(productId: string) {
    await this.findOne(productId)

    const images = await this.imagesRepo.find({
      where: { productId },
      order: { position: 'ASC', createdAt: 'ASC' },
    })

    return ApiResponse.success(images.map(ProductImageResponseDto.fromEntity), 'Product images retrieved', 200)
  }

  async removeImage(imageId: string, ownerId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId } })

    if (!image) throw new NotFoundException('Product image not found')

    await this.findOwned(image.productId, ownerId)

    await this.imagesRepo.delete({ id: imageId })

    return ApiResponse.message('Product image deleted', 200)
  }

  private async nextPosition(productId: string): Promise<number> {
    const last = await this.imagesRepo.findOne({
      where: { productId },
      order: { position: 'DESC' },
    })

    return last ? last.position + 1 : 0
  }
}