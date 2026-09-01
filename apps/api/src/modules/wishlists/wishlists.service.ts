import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { Wishlist } from './entities/wishlist.entity'
import { WishlistItem } from './entities/wishlist-item.entity'
import { WishlistShare } from './entities/wishlist-share.entity'
import { ProductsService } from '../products/products.service'
import { UsersService } from '../users/users.service'
import { WalletService } from '../finance/wallet.service'
import { CreateWishlistDto, UpdateWishlistDto, AddWishlistItemDto } from './dto/wishlist.dto'
import { ShareWishlistDto } from './dto/share-wishlist.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { WishlistResponseDto, WishlistItemResponseDto } from './dto/wishlist-response.dto'

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private wishlistsRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem) private itemsRepo: Repository<WishlistItem>,
    @InjectRepository(WishlistShare) private sharesRepo: Repository<WishlistShare>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
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

  async listForUser(userId: string, name?: string) {
    const where: any = { userId }
    if (name) where.name = ILike(`%${name}%`)

    const wishlists = await this.wishlistsRepo.find({
      where,
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

  // ── Wishlist sharing ──────────────────────────────────────────

  async share(userId: string, wishlistId: string, dto: ShareWishlistDto) {
    const wishlist = await this.findOne(userId, wishlistId)

    const recipient = await this.usersService.findByEmail(dto.email)
    if (!recipient) throw new NotFoundException('No user found with that email')
    if (recipient.id === userId) throw new BadRequestException('Cannot share a wishlist with yourself')

    const existing = await this.sharesRepo.findOne({
      where: { wishlistId, sharedWithUserId: recipient.id },
    })

    if (existing) throw new ConflictException('Wishlist already shared with this user')

    const saved = await this.sharesRepo.save(
      this.sharesRepo.create({
        wishlistId: wishlist.id,
        sharedWithUserId: recipient.id,
        permission: dto.permission,
      }),
    )

    return ApiResponse.success(
      {
        id: saved.id,
        wishlist_id: saved.wishlistId,
        shared_with_user_id: saved.sharedWithUserId,
        permission: saved.permission,
        created_at: saved.createdAt.toISOString(),
      },
      'Wishlist shared successfully',
      201,
    )
  }

  async listSharedWithMe(userId: string) {
    const shares = await this.sharesRepo.find({
      where: { sharedWithUserId: userId },
      relations: { wishlist: true },
      order: { createdAt: 'DESC' },
    })

    const enriched = await Promise.all(
      shares.map(async (share) => {
        const items = await this.loadItems(share.wishlistId)
        return {
          share_id: share.id,
          permission: share.permission,
          shared_at: share.createdAt.toISOString(),
          wishlist: WishlistResponseDto.fromEntity(share.wishlist, items),
        }
      }),
    )

    return ApiResponse.success(enriched, 'Shared wishlists retrieved', 200)
  }

  async fulfillItem(userId: string, wishlistId: string, itemId: string) {
    const share = await this.sharesRepo.findOne({
      where: { wishlistId, sharedWithUserId: userId },
    })

    if (!share) throw new ForbiddenException('You do not have access to this wishlist')
    if (share.permission !== 'fulfill') throw new ForbiddenException('You only have view permission on this wishlist')

    const item = await this.itemsRepo.findOne({
      where: { id: itemId, wishlistId },
      relations: { product: true },
    })

    if (!item) throw new NotFoundException('Wishlist item not found')

    if (item.fulfilledBy) throw new BadRequestException('This item has already been fulfilled')

    const productPrice = item.product?.price
    if (productPrice == null || productPrice <= 0) {
      throw new BadRequestException('This product has no valid price for fulfillment')
    }

    const result = await this.dataSource.transaction(async (manager) => {
      await manager.update(WishlistItem, { id: itemId }, { fulfilledBy: userId })

      const walletRepo = manager.getRepository('Wallet')
      const walletTxRepo = manager.getRepository('WalletTransaction')

      const wallet = await walletRepo.findOne({ where: { userId } })

      if (!wallet) throw new BadRequestException('You do not have a wallet to fulfill this item')
      if (wallet.status !== 'active') throw new BadRequestException('Your wallet is not active')

      const newBalance = Number((wallet.balance - productPrice).toFixed(2))
      if (newBalance < 0) throw new BadRequestException('Insufficient wallet balance')

      await manager.update('Wallet', { id: wallet.id }, { balance: newBalance })

      const tx = walletTxRepo.create({
        walletId: wallet.id,
        type: 'DEBIT',
        amount: productPrice,
        balanceAfter: newBalance,
        description: `Fulfilled wishlist item: ${item.product?.name ?? itemId}`,
      })

      await walletTxRepo.save(tx)

      return { itemId, product_price: productPrice, new_balance: newBalance }
    })

    return ApiResponse.success(result, 'Wishlist item fulfilled', 200)
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