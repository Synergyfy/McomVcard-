import { ApiProperty } from '@nestjs/swagger'
import { CashbackProgram } from '../entities/cashback-program.entity'
import { CashbackProgramStatus } from '../entities/cashback-program.entity'

export class CashbackProgramResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ name: 'business_id', format: 'uuid' })
  businessId!: string

  @ApiProperty()
  title!: string

  @ApiProperty({ type: 'number' })
  rate!: number

  @ApiProperty({ enum: CashbackProgramStatus })
  status!: CashbackProgramStatus

  @ApiProperty({ type: 'number' })
  earned!: number

  @ApiProperty({ name: 'created_at' })
  createdAt!: Date

  @ApiProperty({ name: 'updated_at' })
  updatedAt!: Date

  static fromEntity(entity: CashbackProgram): CashbackProgramResponseDto {
    const dto = new CashbackProgramResponseDto()
    dto.id = entity.id
    dto.businessId = entity.businessId
    dto.title = entity.title
    dto.rate = Number(entity.rate)
    dto.status = entity.status
    dto.earned = Number(entity.earned)
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}