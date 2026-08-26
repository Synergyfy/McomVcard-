import { Injectable } from '@nestjs/common'
import { promises as fs } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

// Spec §45: "Media should be stored externally when appropriate." The provider
// abstraction means S3/S3-compatible storage can be swapped in later without
// touching the service or controller. Bytes are never stored in PostgreSQL.

export enum MediaUploadProvider {
  LOCAL = 'local',
}

export interface SavedMediaFile {
  key: string
  url: string
}

export interface MediaFileInput {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

export interface MediaStorageProvider {
  readonly providerName: string
  save(file: MediaFileInput): Promise<SavedMediaFile>
  getUrl(key: string): string
  remove(key: string): Promise<void>
}

@Injectable()
export class LocalMediaStorageProvider implements MediaStorageProvider {
  readonly providerName = MediaUploadProvider.LOCAL

  private readonly uploadsDir = join(process.cwd(), 'uploads', 'media')
  private readonly publicPrefix = '/media/uploads'

  constructor() {
    this.ensureDir().catch(() => undefined)
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.uploadsDir, { recursive: true })
  }

  private safeName(originalname: string): string {
    const base = originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)

    return base || 'file'
  }

  async save(file: MediaFileInput): Promise<SavedMediaFile> {
    await this.ensureDir()

    const id = randomBytes(12).toString('hex')
    const filename = `${id}-${this.safeName(file.originalname)}`
    const absolute = join(this.uploadsDir, filename)

    await fs.writeFile(absolute, file.buffer)

    return { key: filename, url: this.getUrl(filename) }
  }

  getUrl(key: string): string {
    return `${this.publicPrefix}/${key}`
  }

  async remove(key: string): Promise<void> {
    try {
      await fs.unlink(join(this.uploadsDir, key))
    } catch {
      // File already gone — treat as success.
    }
  }
}