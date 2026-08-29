import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class AdminPaginatedQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: 'Items per page (max 100)', default: 20, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiPropertyOptional({ description: 'Search term (matches name, email, slug, etc.)', example: 'bloom' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string

  @ApiPropertyOptional({ description: 'Filter by status', example: 'active' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string

  @ApiPropertyOptional({ description: 'Sort field', example: 'created_at' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sort?: string = 'created_at'

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC'
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
