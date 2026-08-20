import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Wishlist } from './entities/wishlist.entity'
import { WishlistItem } from './entities/wishlist-item.entity'
import { ProductsService } from '../products/products.service'
import { CreateWishlistDto, UpdateWishlistDto, AddWishlistItemDto } from './dto/wishlist.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { WishlistResponseDto, WishlistItemResponseDto } from './dto/wishlist-response.dto'

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private wishlistsRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem) private itemsRepo: Repository<WishlistItem>,
    private readonly productsService: ProductsService,
  ) {}

  async create(userId: string, dto: CreateWishlistDto) {
    const saved = await this.wishlistsRepo.save(
      this.wishlistsRepo.create({
        userId,
        name: dto.name,
        isPrivate: dto.is_private ?? false,
      }),
    )

    return ApiResponse.success(WishlistResponseDto.fromEntity(await this.findOne(userId, saved.id)), 'Wishlist created', 201)
  }

  async listForUser(userId: string) {
    const wishlists = await this.wishlistsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })

    const enriched = await Promise.all(
      wishlists.map(async (wishlist) => {
        const items = await this.loadItems(wishlist.id)
        return WishlistResponseDto.fromEntity(wishlist, items)
      }),
    )

    return ApiResponse.success(enriched, 'Wishlists retrieved', 200)
  }

  async findOne(userId: string, id: string) {
    const wishlist = await this.wishlistsRepo.findOne({ where: { id } })

    if (!wishlist) throw new NotFoundException('Wishlist not found')

    if (wishlist.userId !== userId) throw new ForbiddenException('You do not have access to this wishlist')

    return wishlist
  }

  async getOne(userId: string, id: string) {
    const wishlist = await this.findOne(userId, id)
    const items = await this.loadItems(id)

    return ApiResponse.success(WishlistResponseDto.fromEntity(wishlist, items), 'Wishlist retrieved', 200)
  }

  async update(userId: string, id: string, dto: UpdateWishlistDto) {
    await this.findOne(userId, id)

    await this.wishlistsRepo.update({ id }, { name: dto.name, isPrivate: dto.is_private })

    const wishlist = await this.findOne(userId, id)
    const items = await this.loadItems(id)

    return ApiResponse.success(WishlistResponseDto.fromEntity(wishlist, items), 'Wishlist updated', 200)
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id)

    await this.wishlistsRepo.delete({ id })

    return ApiResponse.message('Wishlist removed', 200)
  }

  async addItem(userId: string, wishlistId: string, dto: AddWishlistItemDto) {
    await this.findOne(userId, wishlistId)

    // The product must exist.
    await this.productsService.findOne(dto.product_id)

    const existing = await this.itemsRepo.findOne({
      where: { wishlistId, productId: dto.product_id },
    })

    if (existing) throw new BadRequestException('This product is already in the wishlist')

    let position = dto.position

    if (position == null) {
      const last = await this.itemsRepo.findOne({
        where: { wishlistId },
        order: { position: 'DESC' },
      })
      position = (last?.position ?? -1) + 1
    }

    const saved = await this.itemsRepo.save(
      this.itemsRepo.create({
        wishlistId,
        productId: dto.product_id,
        note: dto.note ?? null,
        position,
      }),
    )

    return ApiResponse.success(await this.buildItemResponse(saved.id), 'Item added to wishlist', 201)
  }

  async listItems(userId: string, wishlistId: string) {
    await this.findOne(userId, wishlistId)

    const items = await this.loadItems(wishlistId)

    return ApiResponse.success(items.map((item) => WishlistItemResponseDto.fromEntity(item)), 'Wishlist items retrieved', 200)
  }

  async removeItem(userId: string, wishlistId: string, itemId: string) {
    await this.findOne(userId, wishlistId)

    const item = await this.itemsRepo.findOne({ where: { id: itemId, wishlistId } })

    if (!item) throw new NotFoundException('Wishlist item not found')

    await this.itemsRepo.delete({ id: item.id })

    return ApiResponse.message('Wishlist item removed', 200)
  }

  private async loadItems(wishlistId: string): Promise<WishlistItem[]> {
    return this.itemsRepo.find({
      where: { wishlistId },
      relations: { product: true },
      order: { position: 'ASC' },
    })
  }

  private async buildItemResponse(itemId: string) {
    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
      relations: { product: true },
    })

    if (!item) throw new NotFoundException('Wishlist item not found')

    return WishlistItemResponseDto.fromEntity(item)
  }
}