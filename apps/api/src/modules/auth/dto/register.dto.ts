import { Transform } from 'class-transformer'
import { IsEmail, IsString, MaxLength, MinLength, IsOptional, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'secret123',
    description: 'Account password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string

  @ApiPropertyOptional({
    example: 'John',
    description: 'First name',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(50)
  firstName?: string

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(50)
  lastName?: string

  @ApiPropertyOptional({
    example: 'AFF-8K2QZ7',
    description: 'Optional affiliate referral code. When present, the new user is attributed to the affiliate.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Z0-9-]+$/, { message: 'referral_code may only contain uppercase letters, digits, and hyphens' })
  referral_code?: string
}