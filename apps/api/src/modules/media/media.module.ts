import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'
import { LocalMediaStorageProvider } from './media.provider'
import { Media } from './entities/media.entity'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Media])],
  controllers: [MediaController],
  providers: [
    MediaService,
    { provide: 'MediaStorageProvider', useClass: LocalMediaStorageProvider },
  ],
  exports: [MediaService],
})
export class MediaModule {}