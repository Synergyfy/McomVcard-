import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Language } from './entities/language.entity'
import { Translation } from './entities/translation.entity'


@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private languagesRepo: Repository<Language>,
    @InjectRepository(Translation) private translationsRepo: Repository<Translation>,
  ) {}

  async findAll() {
    return this.languagesRepo.find({ order: { name: 'ASC' } })
  }

  async findOne(id: string) {
    const language = await this.languagesRepo.findOne({ where: { id }, relations: { translations: true } })

    if (!language) throw new NotFoundException('Language not found')

    return language
  }

  async updateTranslation(languageId: string, translationId: string, patch: { key?: string; value?: string; context?: string }) {
    await this.findOne(languageId)

    const translation = await this.translationsRepo.findOne({ where: { id: translationId, languageId } })
    if (!translation) throw new NotFoundException('Translation not found')

    if (patch.key !== undefined) translation.key = patch.key
    if (patch.value !== undefined) translation.value = patch.value
    if (patch.context !== undefined) translation.context = patch.context

    return this.translationsRepo.save(translation)
  }
}
