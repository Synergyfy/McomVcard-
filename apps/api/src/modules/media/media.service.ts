import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Media } from './entities/media.entity'
import { MediaStorageProvider } from './media.provider'
import { UploadedFileRecord } from './uploaded-file.type'
import { CreateMediaFromUrlDto } from './dto/media.dto'
import { MediaResponseDto } from './dto/media-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    @Inject('MediaStorageProvider') private readonly storage: MediaStorageProvider,
  ) {}

  // Upload: bytes go to the storage provider, only metadata lands in PostgreSQL.
  async upload(user: UserResponseDto, file: UploadedFileRecord) {
    const stored = await this.storage.save({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })

    const saved = await this.mediaRepo.save(
      this.mediaRepo.create({
        uploadedBy: user.id,
        provider: this.storage.providerName,
        key: stored.key,
        url: stored.url,
        mimeType: file.mimetype,
        size: file.size,
      }),
    )

    return ApiResponse.success(MediaResponseDto.fromEntity(saved), 'Media uploaded', 201)
  }

  // Register an externally-hosted file by URL (no bytes stored by us).
  async createFromUrl(user: UserResponseDto, dto: CreateMediaFromUrlDto) {
    const saved = await this.mediaRepo.save(
      this.mediaRepo.create({
        uploadedBy: user.id,
        provider: 'external',
        key: dto.url,
        url: dto.url,
        mimeType: dto.mime_type ?? 'application/octet-stream',
        size: 0,
      }),
    )

    return ApiResponse.success(MediaResponseDto.fromEntity(saved), 'Media registered', 201)
  }

  async listMine(user: UserResponseDto) {
    const media = await this.mediaRepo.find({
      where: { uploadedBy: user.id },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      media.map((m) => MediaResponseDto.fromEntity(m)),
      'Media retrieved',
      200,
    )
  }

  async get(id: string) {
    const media = await this.mediaRepo.findOne({ where: { id } })

    if (!media) throw new NotFoundException('Media not found')

    return ApiResponse.success(MediaResponseDto.fromEntity(media), 'Media retrieved', 200)
  }

  async remove(user: UserResponseDto, id: string) {
    const media = await this.mediaRepo.findOne({ where: { id, uploadedBy: user.id } })

    if (!media) throw new NotFoundException('Media not found')

    if (media.provider !== 'external') {
      await this.storage.remove(media.key)
    }

    await this.mediaRepo.delete(id)

    return ApiResponse.success(null, 'Media deleted', 200)
  }
}