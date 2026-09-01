import { IsString, IsOptional, IsBoolean, IsInt, Min, IsNotEmpty, IsIn, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export const FAQ_CATEGORIES = ['General', 'Payment', 'Account', 'Cards', 'Technical', 'Other'] as const
export type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export class CreateFaqDto {
  @ApiProperty({ example: 'How do I sign up for a membership?' })
  @IsString()
  @IsNotEmpty()
  question!: string

  @ApiProperty({ example: 'You can sign up by visiting our pricing page and selecting a plan that suits your needs.' })
  @IsString()
  @IsNotEmpty()
  answer!: string

  @ApiPropertyOptional({ enum: FAQ_CATEGORIES, example: 'General' })
  @IsOptional()
  @IsIn(FAQ_CATEGORIES)
  category?: FaqCategory

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateFaqDto {
  @ApiPropertyOptional({ example: 'How do I sign up for a membership?' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  question?: string

  @ApiPropertyOptional({ example: 'You can sign up by visiting our pricing page and selecting a plan that suits your needs.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  answer?: string

  @ApiPropertyOptional({ enum: FAQ_CATEGORIES, example: 'General' })
  @IsOptional()
  @IsIn(FAQ_CATEGORIES)
  category?: FaqCategory

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class ReorderFaqDto {
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2', 'uuid3'], description: 'Ordered list of FAQ IDs' })
  @IsArray()
  @IsString({ each: true })
  ids!: string[]
}
