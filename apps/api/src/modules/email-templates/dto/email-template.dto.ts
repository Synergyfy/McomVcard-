import { IsString, IsOptional, IsBoolean, IsIn, IsNotEmpty } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export const EMAIL_TEMPLATE_CATEGORIES = ['transactional', 'marketing', 'system'] as const
export type EmailTemplateCategory = (typeof EMAIL_TEMPLATE_CATEGORIES)[number]

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'Welcome Email' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'Welcome to MCOM!' })
  @IsString()
  @IsNotEmpty()
  subject!: string

  @ApiProperty({ example: '<h1>Hello {{name}}</h1><p>Welcome to our platform.</p>' })
  @IsString()
  @IsNotEmpty()
  body!: string

  @ApiPropertyOptional({ enum: EMAIL_TEMPLATE_CATEGORIES, example: 'transactional' })
  @IsOptional()
  @IsIn(EMAIL_TEMPLATE_CATEGORIES)
  category?: EmailTemplateCategory

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional({ example: 'Welcome Email' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional({ example: 'Welcome to MCOM!' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subject?: string

  @ApiPropertyOptional({ example: '<h1>Hello {{name}}</h1><p>Welcome to our platform.</p>' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string

  @ApiPropertyOptional({ enum: EMAIL_TEMPLATE_CATEGORIES, example: 'transactional' })
  @IsOptional()
  @IsIn(EMAIL_TEMPLATE_CATEGORIES)
  category?: EmailTemplateCategory

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
