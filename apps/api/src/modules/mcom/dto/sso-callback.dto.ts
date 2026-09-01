import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class SsoCallbackDto {
  @ApiProperty({ example: 'a1b2c3...', description: 'Temporary OAuth authorization code issued by MCOM Central' })
  @IsString()
  @IsNotEmpty()
  code!: string

  @ApiProperty({ example: 'xyz123', description: 'CSRF state that must match the value set by /auth/sso/login' })
  @IsString()
  @IsNotEmpty()
  state!: string
}