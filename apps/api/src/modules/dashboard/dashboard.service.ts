import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Business } from '../businesses/entities/business.entity'
import { Share } from '../shares/entities/share.entity'
import { WalletTransaction } from '../finance/entities/wallet-transaction.entity'
import { RewardTransaction } from '../finance/entities/reward-transaction.entity'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Campaign } from '../campaigns/entities/campaign.entity'
import { Review } from '../reviews/entities/review.entity'
import { Card } from '../cards/entities/card.entity'
import { Membership } from '../memberships/entities/membership.entity'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Business) private businesses: Repository<Business>,
    @InjectRepository(Share) private shares: Repository<Share>,
    @InjectRepository(WalletTransaction) private walletTx: Repository<WalletTransaction>,
    @InjectRepository(RewardTransaction) private rewardTx: Repository<RewardTransaction>,
    @InjectRepository(Appointment) private appointments: Repository<Appointment>,
    @InjectRepository(Campaign) private campaigns: Repository<Campaign>,
    @InjectRepository(Review) private reviews: Repository<Review>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(Membership) private memberships: Repository<Membership>,
  ) {}

  async getStatsForUser(userId: string) {
    const business = await this.businesses.findOne({ where: { ownerId: userId } })
    if (!business) {
      return {
        totalCards: 0,
        totalShares: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        activeCampaigns: 0,
        totalReviews: 0,
        avgRating: 0,
        totalWalletCredits: 0,
        totalRewardsRedeemed: 0,
        activeMemberships: 0,
      }
    }
    return this.getStats(business.id, userId)
  }

  async getStats(businessId: string, ownerId?: string) {
    const [
      totalCards,
      totalShares,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      activeCampaigns,
      totalReviews,
      avgRatingResult,
      walletCredits,
      rewardsRedeemed,
      activeMemberships,
    ] = await Promise.all([
      this.cards.count({ where: { business: { id: businessId } } }),
      this.shares.createQueryBuilder('s')
        .innerJoin('s.card', 'c', 'c.business_id = :businessId', { businessId })
        .getCount(),
      this.appointments.count({ where: { business: { id: businessId } } }),
      this.appointments.count({ where: { business: { id: businessId }, status: 'pending' } }),
      this.appointments.count({ where: { business: { id: businessId }, status: 'completed' } }),
      this.campaigns.count({ where: { business: { id: businessId }, status: 'active' as any } }),
      this.reviews.count({ where: { business: { id: businessId } } }),
      this.reviews.createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .where('r.business_id = :businessId', { businessId })
        .getRawOne(),
      ownerId ? this.walletTx.createQueryBuilder('wt')
        .innerJoin('wt.wallet', 'w', 'w.user_id = :ownerId', { ownerId })
        .where('wt.type = :type', { type: 'CREDIT' })
        .select('COALESCE(SUM(wt.amount), 0)', 'total')
        .getRawOne() : Promise.resolve({ total: 0 }),
      ownerId ? this.rewardTx.createQueryBuilder('rt')
        .innerJoin('rt.balance', 'rb', 'rb.user_id = :ownerId', { ownerId })
        .where('rt.type = :type', { type: 'REDEEM' })
        .select('COALESCE(SUM(rt.amount), 0)', 'total')
        .getRawOne() : Promise.resolve({ total: 0 }),
      ownerId ? this.memberships.count({
        where: { user: { id: ownerId }, status: 'active' },
      }) : Promise.resolve(0),
    ])

    return {
      totalCards,
      totalShares,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      activeCampaigns,
      totalReviews,
      avgRating: avgRatingResult?.avg ? Number(avgRatingResult.avg) : 0,
      totalWalletCredits: walletCredits?.total ? Number(walletCredits.total) : 0,
      totalRewardsRedeemed: rewardsRedeemed?.total ? Number(rewardsRedeemed.total) : 0,
      activeMemberships,
    }
  }
}
