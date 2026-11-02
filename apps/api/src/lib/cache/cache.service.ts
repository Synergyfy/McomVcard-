import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

interface MemoryEntry {
  value: string
  expiresAt: number
}

/**
 * Small Redis-backed cache with an in-process fallback.
 *
 * Redis is used whenever REDIS_URL is configured and reachable. If Redis is
 * unavailable the service degrades to a bounded in-memory cache so requests
 * keep succeeding instead of failing hard.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Cache')
  private readonly namespace = 'mcom:vcard:'
  private readonly memory = new Map<string, MemoryEntry>()
  private readonly memoryLimit = 500
  private client: Redis | null = null
  private connected = false
  private hasLoggedFailure = false

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('REDIS_URL') || process.env.REDIS_URL
    if (!url) {
      this.logger.log('REDIS_URL not set — using in-memory cache fallback')
      return
    }

    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    })

    this.client.on('error', (error) => {
      if (this.hasLoggedFailure) return
      this.hasLoggedFailure = true
      this.logger.warn(`Redis unavailable (${error.message}); using in-memory cache fallback`)
    })

    try {
      await this.client.connect()
      await this.client.ping()
      this.connected = true
      this.logger.log('Redis cache connected')
    } catch (error) {
      this.connected = false
      this.logger.warn(
        `Redis connection failed (${error instanceof Error ? error.message : error}); using in-memory cache fallback`,
      )
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.client.disconnect()
      this.client = null
    }
    this.memory.clear()
  }

  private buildKey(key: string): string {
    return `${this.namespace}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key)

    if (this.connected && this.client) {
      try {
        const raw = await this.client.get(fullKey)
        return raw ? (JSON.parse(raw) as T) : null
      } catch {
        // fall through to memory
      }
    }

    const entry = this.memory.get(fullKey)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(fullKey)
      return null
    }
    return JSON.parse(entry.value) as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const fullKey = this.buildKey(key)
    const raw = JSON.stringify(value)

    if (this.connected && this.client) {
      try {
        await this.client.set(fullKey, raw, 'EX', Math.max(1, Math.floor(ttlSeconds)))
        return
      } catch {
        // fall through to memory
      }
    }

    if (this.memory.size >= this.memoryLimit) {
      const oldest = this.memory.keys().next()
      if (!oldest.done) this.memory.delete(oldest.value)
    }
    this.memory.set(fullKey, { value: raw, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  async del(key: string): Promise<void> {
    const fullKey = this.buildKey(key)
    if (this.connected && this.client) {
      try {
        await this.client.del(fullKey)
      } catch {
        // ignore
      }
    }
    this.memory.delete(fullKey)
  }

  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  async clear(): Promise<void> {
    this.memory.clear()

    if (this.connected && this.client) {
      try {
        let cursor = '0'
        do {
          const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', `${this.namespace}*`, 'COUNT', 200)
          cursor = nextCursor
          if (keys.length > 0) await this.client.del(...keys)
        } while (cursor !== '0')
      } catch (error) {
        this.logger.warn(`Failed to clear Redis cache: ${error instanceof Error ? error.message : error}`)
      }
    }
  }

  isRedisConnected(): boolean {
    return this.connected
  }
}
