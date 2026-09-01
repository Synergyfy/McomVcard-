import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Setting } from './entities/setting.entity'

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults()
  }

  async findByGroup(group: string): Promise<Setting[]> {
    return this.settingRepository.find({
      where: { group },
      order: { key: 'ASC' },
    })
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findOne({ where: { key } })
    return setting ? setting.value : null
  }

  async set(key: string, value: string, group?: string, type?: string): Promise<Setting> {
    let setting = await this.settingRepository.findOne({ where: { key } })

    if (setting) {
      setting.value = value
      if (group !== undefined) setting.group = group
      if (type !== undefined) setting.type = type
    } else {
      setting = this.settingRepository.create({
        key,
        value,
        group: group ?? 'general',
        type: type ?? 'string',
      })
    }

    return this.settingRepository.save(setting)
  }

  async setBulk(settings: Array<{ key: string; value: string }>, group: string): Promise<Setting[]> {
    const results: Setting[] = []

    for (const item of settings) {
      const setting = await this.set(item.key, item.value, group)
      results.push(setting)
    }

    return results
  }

  async seedDefaults(): Promise<void> {
    const count = await this.settingRepository.count()
    if (count > 0) return

    const defaults: Array<{ key: string; value: string; group: string; type: string }> = [
      { key: 'site_name', value: 'MCOMVCard', group: 'general', type: 'string' },
      { key: 'site_email', value: 'admin@mcomvcard.com', group: 'general', type: 'string' },
      { key: 'site_url', value: 'http://localhost:3000', group: 'general', type: 'string' },
      { key: 'smtp_host', value: 'smtp.example.com', group: 'email', type: 'string' },
      { key: 'smtp_port', value: '587', group: 'email', type: 'string' },
      { key: 'smtp_user', value: '', group: 'email', type: 'string' },
      { key: 'smtp_pass', value: '', group: 'email', type: 'string' },
      { key: 'stripe_key', value: '', group: 'payment', type: 'string' },
      { key: 'stripe_secret', value: '', group: 'payment', type: 'string' },
      { key: 'paypal_client_id', value: '', group: 'payment', type: 'string' },
    ]

    for (const item of defaults) {
      const setting = this.settingRepository.create(item)
      await this.settingRepository.save(setting)
    }
  }
}
