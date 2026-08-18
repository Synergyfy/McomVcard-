import { IsIn, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

const SUPPORTED_LANGUAGES = ['ar', 'de', 'en', 'es', 'fr', 'pt', 'ru', 'tr', 'zh']

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'en', description: 'Preferred UI language', enum: SUPPORTED_LANGUAGES })
  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGES)
  language?: string

  @ApiPropertyOptional({ example: 'light', description: 'UI theme mode', enum: ['light', 'dark'] })
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme_mode?: 'light' | 'dark'
}