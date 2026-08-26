import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSocialLinkDto {
  @ApiProperty({ example: 'instagram', description: 'Social platform (e.g. instagram, facebook, linkedin, twitter, youtube)' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  platform: string

  @ApiProperty({ example: 'https://instagram.com/janedoe' })
  @IsUrl()
  @MaxLength(500)
  url: string

  @ApiPropertyOptional({ example: 0, description: 'Sort order, ascending' })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean
}