import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator'
import { ReviewStatus } from '../entities/review.entity'

export class CreateReviewDto {
  @ApiProperty({ description: 'Business being reviewed', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  @IsUUID('4', { message: 'business_id must be a valid UUID' })
  business_id!: string

  @ApiProperty({ description: 'Rating 1–5', example: 5 })
  @IsInt({ message: 'rating must be an integer' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  rating!: number

  @ApiPropertyOptional({ description: 'Review comment', example: 'Lovely service, would recommend!', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'comment must be at most 2000 characters' })
  comment?: string
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Rating 1–5', example: 4 })
  @IsOptional()
  @IsInt({ message: 'rating must be an integer' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  rating?: number

  @ApiPropertyOptional({ description: 'Review comment', example: 'Updated after follow-up visit', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'comment must be at most 2000 characters' })
  comment?: string
}

export class ModerateReviewDto {
  @ApiProperty({ description: 'New moderation status', enum: ReviewStatus, example: ReviewStatus.APPROVED })
  @IsOptional()
  status!: ReviewStatus
}