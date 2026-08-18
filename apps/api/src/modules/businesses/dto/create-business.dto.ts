import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBusinessDto {
  @ApiProperty({ example: 'Acme Cafe', description: 'Business name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: 'A cozy coffee shop downtown', description: 'Business description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ example: 'b3f2c1d4-...-uuid', description: 'Optional business category UUID' })
  @IsOptional()
  @IsUUID()
  category_id?: string

  @ApiPropertyOptional({ example: 'hello@acmecafe.com', description: 'Business contact email' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: '+15551234567', description: 'Business contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string

  @ApiPropertyOptional({ example: 'https://acmecafe.com', description: 'Business website' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string
}