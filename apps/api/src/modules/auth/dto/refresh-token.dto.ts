import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class RefreshTokenDto {
  @ApiPropertyOptional({ example: 'opaque-random-refresh-token', description: 'The refresh token issued at login/register/refresh. Optional when it is supplied via the HttpOnly refresh_token cookie.' })
  @IsOptional()
  @IsString()
  refresh_token?: string
}