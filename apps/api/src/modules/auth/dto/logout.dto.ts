import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class LogoutDto {
  @ApiPropertyOptional({ description: 'Refresh token to revoke so it can no longer be used' })
  @IsOptional()
  @IsString()
  refresh_token?: string
}