import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateBusinessFamilyMemberDto {
  @ApiProperty({ example: 'Jordan Smith' })
  @IsString() @MinLength(2) @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'jordan@example.com' })
  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string

  @ApiPropertyOptional({ example: '+44 7700 900123' })
  @IsOptional() @IsString() @MaxLength(30)
  phone?: string

  @ApiPropertyOptional({ example: 'Family' })
  @IsOptional() @IsString() @MaxLength(40)
  relationship?: string

  @ApiPropertyOptional({ description: 'Optional avatar URL or data URL' })
  @IsOptional() @IsString() @MaxLength(2_000_000)
  avatar?: string
}

export class UpdateBusinessFamilyMemberStatusDto {
  @ApiProperty({ enum: ['allocated', 'active', 'suspended', 'removed'] })
  @IsIn(['allocated', 'active', 'suspended', 'removed'])
  status!: 'allocated' | 'active' | 'suspended' | 'removed'
}
