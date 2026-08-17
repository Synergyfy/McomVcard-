import { Transform } from 'class-transformer'
import { IsEmail, IsString, MaxLength, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  name?: string
}
