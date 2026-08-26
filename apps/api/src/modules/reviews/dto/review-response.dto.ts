import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Review, ReviewStatus } from '../entities/review.entity'

const toIso = (d: Date | string): string =>
  d instanceof Date ? d.toISOString() : (d as string)

export class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID', example: 'f1e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Review author', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  user_id!: string

  @ApiProperty({ description: 'Business reviewed', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  business_id!: string

  @ApiProperty({ description: 'Rating 1–5', example: 5 })
  rating!: number

  @ApiPropertyOptional({ description: 'Review comment', example: 'Lovely service, would recommend!', nullable: true })
  comment!: string | null

  @ApiProperty({ description: 'Moderation status', enum: ReviewStatus, example: ReviewStatus.APPROVED })
  status!: ReviewStatus

  @ApiProperty({ description: 'Created at', example: '2026-08-20T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-20T09:00:00.000Z' })
  updated_at!: string

  @ApiPropertyOptional({ description: 'Author summary', example: { id: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', first_name: 'John', last_name: 'Doe' }, nullable: true })
  author?: { id: string; first_name: string | null; last_name: string | null } | null

  static fromEntity(review: Review): ReviewResponseDto {
    const dto = new ReviewResponseDto()

    dto.id = review.id
    dto.user_id = review.userId
    dto.business_id = review.businessId
    dto.rating = review.rating
    dto.comment = review.comment
    dto.status = review.status
    dto.created_at = toIso(review.createdAt)
    dto.updated_at = toIso(review.updatedAt)

    if (review.user) {
      dto.author = {
        id: review.user.id,
        first_name: review.user.firstName,
        last_name: review.user.lastName,
      }
    } else {
      dto.author = null
    }

    return dto
  }
}

export class BusinessReviewStatsDto {
  @ApiProperty({ description: 'Average rating (1 decimal)', example: 4.6 })
  average_rating!: number

  @ApiProperty({ description: 'Total approved reviews', example: 12 })
  total_reviews!: number

  @ApiProperty({ description: 'Rating distribution (1–5 → count)', example: { 5: 8, 4: 3, 3: 1 } })
  distribution!: Record<number, number>

  static fromReviews(reviews: Review[]): BusinessReviewStatsDto {
    const dto = new BusinessReviewStatsDto()

    const total = reviews.length
    dto.total_reviews = total
    dto.average_rating = total === 0 ? 0 : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10

    dto.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const r of reviews) {
      dto.distribution[r.rating] = (dto.distribution[r.rating] ?? 0) + 1
    }

    return dto
  }
}