import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { ProductsModule } from '../products/products.module'
import { WishlistsController } from './wishlists.controller'
import { WishlistsService } from './wishlists.service'
import { Wishlist } from './entities/wishlist.entity'
import { WishlistItem } from './entities/wishlist-item.entity'

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    TypeOrmModule.forFeature([Wishlist, WishlistItem]),
  ],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}