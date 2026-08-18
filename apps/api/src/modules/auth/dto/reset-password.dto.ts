import { Transform } from 'class-transformer'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address the reset link was sent to',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.signature',
    description: 'Password reset token from the emailed link',
  })
  @IsString()
  token: string

  @ApiProperty({
    example: 'newSecret123',
    description: 'New account password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string

  @ApiProperty({
    example: 'newSecret123',
    description: 'Must match the new password',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password_confirmation: string
}