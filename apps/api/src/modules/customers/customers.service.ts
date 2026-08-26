import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Review } from '../reviews/entities/review.entity'
import { Share } from '../shares/entities/share.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { ActivityLog } from '../activity/entities/activity-log.entity'
import { User } from '../users/entities/user.entity'
import { CustomerNote } from './entities/customer-note.entity'
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto'
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto'

export type CustomerStatus = 'active' | 'new' | 'at-risk'

export interface CustomerRecord {
  name: string
  email: string
  phone: string | null
  userId: string | null
  status: CustomerStatus
  tier: string | null
  memberSince: string | null
  firstActivity: Date
  lastActivity: Date
  totalAppointments: number
  totalReviews: number
  totalShares: number
}

/* Recency rules:
 * - new     → first activity within the last 30 days
 * - at-risk → no activity for more than 90 days
 * - active  → everything in between                                  */
const NEW_WINDOW_DAYS = 30
const AT_RISK_AFTER_DAYS = 90
const DAY_MS = 86_400_000

function deriveStatus(firstActivity: Date, lastActivity: Date, now = Date.now()): CustomerStatus {
  if (now - firstActivity.getTime() <= NEW_WINDOW_DAYS * DAY_MS) return 'new'
  if (now - lastActivity.getTime() > AT_RISK_AFTER_DAYS * DAY_MS) return 'at-risk'
  return 'active'
}

interface AggRow {
  name?: string | null
  email: string | null
  phone?: string | null
  userId?: string | null
  count: number | string
  lastActivity: string | Date
  firstActivity?: string | Date | null
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Appointment) private appointments: Repository<Appointment>,
    @InjectRepository(Review) private reviews: Repository<Review>,
    @InjectRepository(Share) private shares: Repository<Share>,
    @InjectRepository(Membership) private memberships: Repository<Membership>,
    @InjectRepository(ActivityLog) private activityLogs: Repository<ActivityLog>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(CustomerNote) private customerNotes: Repository<CustomerNote>,
  ) {}

  async getCustomers(businessId: string, limit = 50, offset = 0) {
    // Customers from appointments (guests, no user account required)
    const apptRows: AggRow[] = await this.appointments
      .createQueryBuilder('a')
      .select('a.customer_name', 'name')
      .addSelect('a.customer_email', 'email')
      .addSelect('MAX(a.customer_phone)', 'phone')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(a.created_at)', 'lastActivity')
      .addSelect('MIN(a.created_at)', 'firstActivity')
      .where('a.business_id = :businessId', { businessId })
      .groupBy('a.customer_name, a.customer_email')
      .getRawMany()

    // Customers from reviews (joined via their user account)
    const reviewRows: AggRow[] = await this.reviews
      .createQueryBuilder('r')
      .innerJoin('r.user', 'u')
      .select("u.first_name || ' ' || u.last_name", 'name')
      .addSelect('u.email', 'email')
      .addSelect('NULL', 'phone')
      .addSelect('u.id', 'userId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(r.created_at)', 'lastActivity')
      .addSelect('MIN(r.created_at)', 'firstActivity')
      .where('r.business_id = :businessId', { businessId })
      .groupBy('u.first_name, u.last_name, u.email, u.id')
      .getRawMany()

    // Customers from card shares (share -> card -> business)
    const shareRows: AggRow[] = await this.shares
      .createQueryBuilder('s')
      .innerJoin('s.user', 'su')
      .innerJoin('s.card', 'sc')
      .select("su.first_name || ' ' || su.last_name", 'name')
      .addSelect('su.email', 'email')
      .addSelect('NULL', 'phone')
      .addSelect('su.id', 'userId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(s.created_at)', 'lastActivity')
      .addSelect('MIN(s.created_at)', 'firstActivity')
      .where('sc.business_id = :businessId', { businessId })
      .groupBy("su.first_name, su.last_name, su.email, su.id")
      .getRawMany()

    const map = new Map<string, CustomerRecord & Record<string, unknown>>()

    const merge = (rows: AggRow[], counter: 'totalAppointments' | 'totalReviews' | 'totalShares') => {
      for (const row of rows) {
        const email = String(row.email ?? '').toLowerCase().trim()
        if (!email) continue
        const last = new Date(row.lastActivity)
        const first = new Date(row.firstActivity ?? row.lastActivity)
        const existing = map.get(email)

        if (existing) {
          existing[counter] += Number(row.count)
          if (last > existing.lastActivity) existing.lastActivity = last
          if (first < existing.firstActivity) existing.firstActivity = first
          if (!existing.phone && row.phone) existing.phone = row.phone
          if (!existing.userId && row.userId) existing.userId = row.userId
          const rowName = row.name?.trim()
          if ((!existing.name || existing.name === existing.email) && rowName && rowName !== ' ') existing.name = rowName
        } else {
          map.set(email, {
            name: row.name?.trim() || email,
            email,
            phone: row.phone ?? null,
            userId: row.userId ?? null,
            status: 'active',
            tier: null,
            memberSince: null,
            firstActivity: first,
            lastActivity: last,
            totalAppointments: 0,
            totalReviews: 0,
            totalShares: 0,
            [counter]: Number(row.count),
          })
        }
      }
    }

    merge(apptRows, 'totalAppointments')
    merge(reviewRows, 'totalReviews')
    merge(shareRows, 'totalShares')

    // Latest ACTIVE membership per user email → tier + member-since
    const memberRows = await this.memberships
      .createQueryBuilder('m')
      .innerJoin('m.user', 'mu')
      .innerJoin('m.tier', 'mt')
      .select('LOWER(mu.email)', 'email')
      .addSelect('mt.name', 'tierName')
      .addSelect('m.startedAt', 'startedAt')
      .where('m.status = :status', { status: 'active' })
      .orderBy('m.startedAt', 'DESC')
      .getRawMany<{ email: string; tierName: string; startedAt: string | Date }>()

    const membersByEmail = new Map<string, { tierName: string; startedAt: string | Date }>()
    for (const m of memberRows) {
      const email = String(m.email ?? '').toLowerCase().trim()
      if (email && !membersByEmail.has(email)) membersByEmail.set(email, m)
    }

    const all = Array.from(map.values()).map(rec => {
      const membership = membersByEmail.get(rec.email)
      return {
        name: rec.name,
        email: rec.email,
        phone: rec.phone,
        userId: rec.userId,
        status: deriveStatus(rec.firstActivity, rec.lastActivity),
        tier: membership?.tierName ?? null,
        memberSince: new Date(membership?.startedAt ?? rec.firstActivity).toISOString(),
        firstActivity: rec.firstActivity,
        lastActivity: rec.lastActivity,
        totalAppointments: rec.totalAppointments,
        totalReviews: rec.totalReviews,
        totalShares: rec.totalShares,
      }
    })

    all.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())

    return {
      items: all.slice(offset, offset + limit),
      total: all.length,
      limit,
      offset,
    }
  }

  /**
   * Aggregated view of one customer for the detail page.
   * Bundles the enriched summary (same shape as list items) with every
   * interaction source servable today: appointments, reviews, card shares,
   * business activity logs and the customer's active membership.
   */
  async getCustomerDetail(businessId: string, rawEmail: string) {
    const email = String(rawEmail ?? '').toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid customer email is required')
    }

    // Linked account (may not exist for appointment-only guests)
    const user = await this.users
      .createQueryBuilder('u')
      .where('LOWER(u.email) = :email', { email })
      .getOne()

    const membership = user
      ? await this.memberships.findOne({
          where: { userId: user.id, status: 'active' },
          order: { startedAt: 'DESC' },
          relations: { tier: true },
        })
      : null

    const appts = await this.appointments
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.service', 'svc')
      .where('a.business_id = :businessId', { businessId })
      .andWhere('LOWER(a.customer_email) = :email', { email })
      .orderBy('a.created_at', 'DESC')
      .getMany()

    const reviewRows = user
      ? await this.reviews.find({ where: { businessId, userId: user.id }, order: { createdAt: 'DESC' } })
      : []
    const shareRows = user
      ? await this.shares
          .createQueryBuilder('s')
          .innerJoin('s.card', 'sc')
          .where('sc.business_id = :businessId', { businessId })
          .andWhere('s.user_id = :userId', { userId: user.id })
          .orderBy('s.created_at', 'DESC')
          .getMany()
      : []
    const activityRows = user
      ? await this.activityLogs.find({ where: { businessId, userId: user.id }, order: { createdAt: 'DESC' }, take: 100 })
      : []

    const noteRows = await this.listNoteRows(businessId, email)

    // Notes alone are enough to make a customer "exist" (businesses may jot
    // down an email before any interaction is captured).
    if (!user && !membership && appts.length === 0 && noteRows.length === 0) {
      throw new NotFoundException('Customer not found')
    }

    // Activity timeline across appointments/reviews/shares for status derivation
    const stamps: number[] = [
      ...appts.map(a => a.createdAt.getTime()),
      ...reviewRows.map(r => r.createdAt.getTime()),
      ...shareRows.map(s => s.createdAt.getTime()),
    ]
    if (membership && (!user || stamps.length === 0)) stamps.push(membership.startedAt.getTime())
    const firstActivity = new Date(Math.min(...(stamps.length ? stamps : [Date.now()])))
    const lastActivity = new Date(Math.max(...(stamps.length ? stamps : [Date.now()])))

    const latestAppt = appts[0] ?? null
    const name = latestAppt?.customerName?.trim()
      || [user?.firstName, user?.lastName].filter(Boolean).join(' ')
      || email

    const customer = {
      name,
      email,
      phone: latestAppt?.customerPhone ?? user?.phone ?? null,
      userId: user?.id ?? null,
      status: deriveStatus(firstActivity, lastActivity),
      tier: membership?.tier?.name ?? null,
      memberSince: membership ? membership.startedAt.toISOString() : firstActivity.toISOString(),
      firstActivity: firstActivity.toISOString(),
      lastActivity: lastActivity.toISOString(),
      totalAppointments: appts.length,
      totalReviews: reviewRows.length,
      totalShares: shareRows.length,
      totalNotes: noteRows.length,
    }

    return {
      customer,
      membership: membership
        ? {
            tier: membership.tier?.name ?? null,
            status: membership.status,
            startedAt: membership.startedAt,
            expiresAt: membership.expiresAt,
          }
        : null,
      appointments: appts.map(a => ({
        id: a.id,
        service: a.service?.name ?? null,
        date: a.date,
        start_time: a.startTime,
        end_time: a.endTime,
        status: a.status,
        created_at: a.createdAt,
      })),
      reviews: reviewRows.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        created_at: r.createdAt,
      })),
      shares: shareRows.map(s => ({
        id: s.id,
        platform: s.platform,
        created_at: s.createdAt,
      })),
      activity: activityRows.map(l => ({
        id: l.id,
        type: l.type,
        title: l.title,
        description: l.description,
        created_at: l.createdAt,
      })),
      notes: noteRows,
    }
  }

  // --- Customer Notes ---

  private toNoteDto(note: CustomerNote) {
    const authorName = [note.author?.firstName, note.author?.lastName].filter(Boolean).join(' ')
    return {
      id: note.id,
      customer_email: note.customerEmail,
      note: note.note,
      author_id: note.authorId,
      author_name: authorName || null,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    }
  }

  private normalizeEmail(rawEmail: string): string {
    const email = String(rawEmail ?? '').toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid customer email is required')
    }
    return email
  }

  private async listNoteRows(businessId: string, email: string) {
    const rows = await this.customerNotes.find({
      where: { businessId, customerEmail: email },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    })
    return rows.map(this.toNoteDto)
  }

  async listNotes(businessId: string, rawEmail: string) {
    const email = this.normalizeEmail(rawEmail)
    const items = await this.listNoteRows(businessId, email)
    return { items, total: items.length }
  }

  async createNote(businessId: string, authorId: string, rawEmail: string, dto: CreateCustomerNoteDto) {
    const email = this.normalizeEmail(rawEmail)
    const saved = await this.customerNotes.save(
      this.customerNotes.create({
        businessId,
        customerEmail: email,
        authorId,
        note: dto.note.trim(),
      }),
    )
    const withAuthor = await this.customerNotes.findOne({
      where: { id: saved.id },
      relations: { author: true },
    })
    return this.toNoteDto(withAuthor ?? saved)
  }

  async updateNote(businessId: string, noteId: string, dto: UpdateCustomerNoteDto) {
    const note = await this.customerNotes.findOne({ where: { id: noteId } })
    if (!note || note.businessId !== businessId) throw new NotFoundException('Customer note not found')

    if (dto.note !== undefined) {
      const text = dto.note.trim()
      if (!text) throw new BadRequestException('Note text is required')
      await this.customerNotes.update({ id: note.id }, { note: text })
    }

    const updated = await this.customerNotes.findOne({ where: { id: note.id }, relations: { author: true } })
    return this.toNoteDto(updated ?? note)
  }

  async deleteNote(businessId: string, noteId: string) {
    const note = await this.customerNotes.findOne({ where: { id: noteId } })
    if (!note || note.businessId !== businessId) throw new NotFoundException('Customer note not found')
    await this.customerNotes.delete({ id: note.id })
    return { message: 'Customer note deleted' }
  }
}
