import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpsertCentreControlDto {
  @ApiProperty({ example: 'share', description: 'Centre ID (share, exchange, redeem)' })
  @IsString()
  centre_id!: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  edit_allowed?: boolean

  @ApiPropertyOptional({ example: { show_email: true, show_phone: false } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>
}

export class BulkUpsertCentreControlsDto {
  @ApiProperty({ type: [UpsertCentreControlDto] })
  @IsArray()
  controls!: UpsertCentreControlDto[]
}
