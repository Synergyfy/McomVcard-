import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review, ReviewStatus } from './entities/review.entity'
import { BusinessesService } from '../businesses/businesses.service'
import { CreateReviewDto, UpdateReviewDto, ModerateReviewDto } from './dto/review.dto'
import { ReviewResponseDto, BusinessReviewStatsDto } from './dto/review-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    private readonly businessesService: BusinessesService,
  ) {}

  // A user reviews a business (spec §43: User 1:N Reviews N:1 Business).
  // One review per user per business (unique pair, enforced at the DB too).
  // New reviews are approved immediately; moderation via admin endpoint later.
  async create(user: UserResponseDto, dto: CreateReviewDto) {
    const business = await this.businessesService.findOne(dto.business_id)

    if (business.ownerId === user.id) {
      throw new BadRequestException('You cannot review your own business')
    }

    const existing = await this.reviewsRepo.findOne({ where: { userId: user.id, businessId: dto.business_id } })
    if (existing) {
      throw new BadRequestException('You have already reviewed this business')
    }

    const saved = await this.reviewsRepo.save(
      this.reviewsRepo.create({
        userId: user.id,
        businessId: dto.business_id,
        rating: dto.rating,
        comment: dto.comment ?? null,
        status: ReviewStatus.APPROVED,
      }),
    )

    return ApiResponse.success(ReviewResponseDto.fromEntity(await this.findOne(saved.id)), 'Review created', 201)
  }

  // Approved reviews of a business — public for any authenticated user.
  async listForBusiness(businessId: string) {
    const reviews = await this.reviewsRepo.find({
      where: { businessId, status: ReviewStatus.APPROVED },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      reviews.map((r) => ReviewResponseDto.fromEntity(r)),
      'Reviews retrieved',
      200,
    )
  }

  // Business owner sees all reviews (incl. pending/rejected) on their business.
  async listForBusinessOwner(user: UserResponseDto, businessId: string) {
    await this.businessesService.findOwned(businessId, user.id)

    const reviews = await this.reviewsRepo.find({
      where: { businessId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      reviews.map((r) => ReviewResponseDto.fromEntity(r)),
      'Reviews retrieved',
      200,
    )
  }

  async statsForBusiness(businessId: string) {
    const reviews = await this.reviewsRepo.find({ where: { businessId, status: ReviewStatus.APPROVED } })

    return ApiResponse.success(BusinessReviewStatsDto.fromReviews(reviews), 'Review stats retrieved', 200)
  }

  // A user updates their own review.
  async update(user: UserResponseDto, id: string, dto: UpdateReviewDto) {
    const review = await this.findOwned(user.id, id)

    review.rating = dto.rating ?? review.rating
    review.comment = dto.comment !== undefined ? (dto.comment ?? null) : review.comment

    const saved = await this.reviewsRepo.save(review)

    return ApiResponse.success(ReviewResponseDto.fromEntity(saved), 'Review updated', 200)
  }

  // A user deletes their own review.
  async remove(user: UserResponseDto, id: string) {
    await this.findOwned(user.id, id)

    await this.reviewsRepo.delete(id)

    return ApiResponse.success(null, 'Review deleted', 200)
  }

  // Moderation (admin later, `@Roles('ADMIN')`): approve/reject a review.
  async moderate(id: string, dto: ModerateReviewDto) {
    const review = await this.findOne(id)

    review.status = dto.status
    const saved = await this.reviewsRepo.save(review)

    return ApiResponse.success(ReviewResponseDto.fromEntity(saved), 'Review moderated', 200)
  }

  async listMine(user: UserResponseDto) {
    const reviews = await this.reviewsRepo.find({
      where: { userId: user.id },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(
      reviews.map((r) => ReviewResponseDto.fromEntity(r)),
      'Reviews retrieved',
      200,
    )
  }

  private async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepo.findOne({ where: { id }, relations: { user: true } })

    if (!review) throw new NotFoundException('Review not found')

    return review
  }

  private async findOwned(userId: string, id: string): Promise<Review> {
    const review = await this.findOne(id)

    if (review.userId !== userId) throw new NotFoundException('Review not found')

    return review
  }
}