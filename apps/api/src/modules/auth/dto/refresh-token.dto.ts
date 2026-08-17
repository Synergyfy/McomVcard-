import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshTokenDto {
  @ApiProperty({ example: 'opaque-random-refresh-token', description: 'The refresh token issued at login/register/refresh' })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string
}