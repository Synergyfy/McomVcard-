import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { ProductsModule } from '../products/products.module'
import { UsersModule } from '../users/users.module'
import { FinanceModule } from '../finance/finance.module'
import { WishlistsController } from './wishlists.controller'
import { WishlistsService } from './wishlists.service'
import { Wishlist } from './entities/wishlist.entity'
import { WishlistItem } from './entities/wishlist-item.entity'
import { WishlistShare } from './entities/wishlist-share.entity'

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    UsersModule,
    FinanceModule,
    TypeOrmModule.forFeature([Wishlist, WishlistItem, WishlistShare]),
  ],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}