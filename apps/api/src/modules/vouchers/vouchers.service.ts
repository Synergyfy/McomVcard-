import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { VoucherVendor } from './entities/voucher-vendor.entity'
import { Voucher } from './entities/voucher.entity'
import { VoucherTransaction } from './entities/voucher-transaction.entity'
import { CreateVoucherDto, CreateVoucherVendorDto, UpdateVoucherVendorDto } from './dto/voucher.dto'
import {
  VoucherResponseDto,
  VoucherTransactionResponseDto,
  VoucherVendorDetailDto,
  VoucherVendorResponseDto,
} from './dto/voucher-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { RedeemableItemResponseDto } from './dto/redeemable-item-response.dto'

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(VoucherVendor) private vendorsRepo: Repository<VoucherVendor>,
    @InjectRepository(Voucher) private vouchersRepo: Repository<Voucher>,
    @InjectRepository(VoucherTransaction) private transactionsRepo: Repository<VoucherTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Vendors ──────────────────────────────────────────────────────────────

  async createVendor(dto: CreateVoucherVendorDto) {
    const saved = await this.vendorsRepo.save(
      this.vendorsRepo.create({
        name: dto.name,
        description: dto.description ?? null,
        website: dto.website ?? null,
      }),
    )

    return ApiResponse.success(VoucherVendorResponseDto.fromEntity(saved), 'Voucher vendor created', 201)
  }

  async listVendors() {
    const vendors = await this.vendorsRepo.find({ order: { name: 'ASC' } })

    return ApiResponse.success(
      vendors.map((vendor) => VoucherVendorResponseDto.fromEntity(vendor)),
      'Voucher vendors retrieved',
      200,
    )
  }

  async getVendor(id: string) {
    const vendor = await this.findVendor(id)
    const voucherCount = await this.vouchersRepo.count({ where: { vendorId: id } })

    return ApiResponse.success(VoucherVendorDetailDto.fromEntity(vendor, voucherCount), 'Voucher vendor retrieved', 200)
  }

  async updateVendor(id: string, dto: UpdateVoucherVendorDto) {
    await this.findVendor(id)

    await this.vendorsRepo.update({ id }, {
      name: dto.name,
      description: dto.description,
      website: dto.website,
      status: dto.status,
    })

    const updated = await this.findVendor(id)

    return ApiResponse.success(VoucherVendorResponseDto.fromEntity(updated), 'Voucher vendor updated', 200)
  }

  async removeVendor(id: string) {
    await this.findVendor(id)

    await this.vendorsRepo.delete({ id })

    return ApiResponse.message('Voucher vendor removed', 200)
  }

  // ── Vouchers ─────────────────────────────────────────────────────────────

  async createVoucher(dto: CreateVoucherDto) {
    await this.findVendor(dto.vendor_id)

    const existing = await this.vouchersRepo.findOne({ where: { code: dto.code } })

    if (existing) throw new BadRequestException('A voucher with this code already exists')

    // AVAILABLE + CREATED ledger row written atomically (spec §38: "Maintain a clear transaction/history model").
    const saved = await this.dataSource.transaction(async (manager) => {
      const voucher = await manager.save(
        this.vouchersRepo.create({
          vendorId: dto.vendor_id,
          code: dto.code,
          title: dto.title,
          description: dto.description ?? null,
          value: dto.value,
          currency: dto.currency ?? 'GBP',
          expiresAt: dto.expires_at ? new Date(dto.expires_at) : null,
          status: 'AVAILABLE',
        }),
      )

      await manager.save(
        this.transactionsRepo.create({
          voucherId: voucher.id,
          type: 'CREATED',
          note: 'Voucher created',
        }),
      )

      return voucher
    })

    const voucher = await this.loadVoucher(saved.id)

    return ApiResponse.success(VoucherResponseDto.fromEntity(voucher, voucher.vendor), 'Voucher created', 201)
  }

  async listVouchers(userId: string, status?: string) {
    const where: Record<string, unknown> = {}

    if (status) {
      const valid = ['AVAILABLE', 'ASSIGNED', 'REDEEMED', 'EXPIRED', 'CANCELLED']

      if (!valid.includes(status)) throw new BadRequestException('Invalid voucher status filter')

      where.status = status
    }

    const vouchers = await this.vouchersRepo.find({
      where,
      relations: { vendor: true },
      order: { createdAt: 'DESC' },
    })

    // Lazily expire any vouchers whose expiry has passed (spec §38 statuses).
    const enriched = await Promise.all(
      vouchers.map(async (voucher) => {
        const current = await this.applyExpiry(voucher.id)
        return VoucherResponseDto.fromEntity(current, current.vendor)
      }),
    )

    return ApiResponse.success(enriched, 'Vouchers retrieved', 200)
  }

  async getVoucher(id: string) {
    const current = await this.applyExpiry(id)
    const voucher = await this.loadVoucher(current.id)

    return ApiResponse.success(VoucherResponseDto.fromEntity(voucher, voucher.vendor), 'Voucher retrieved', 200)
  }

  async claimVoucher(userId: string, id: string) {
    const voucher = await this.loadVoucher(id)

    if (voucher.status !== 'AVAILABLE') throw new BadRequestException('Voucher is not available to claim')

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      throw new BadRequestException('Voucher has expired')
    }

    // ASSIGNED + ledger row atomically (one claim per voucher instance).
    const saved = await this.dataSource.transaction(async (manager) => {
      await manager.update(Voucher, { id: voucher.id }, {
        status: 'ASSIGNED',
        assignedToUserId: userId,
        assignedAt: new Date(),
      })

      await manager.save(
        this.transactionsRepo.create({
          voucherId: voucher.id,
          type: 'ASSIGNED',
          userId,
          note: 'Voucher claimed by user',
        }),
      )
    })

    const updated = await this.loadVoucher(id)

    return ApiResponse.success(VoucherResponseDto.fromEntity(updated, updated.vendor), 'Voucher claimed', 200)
  }

  async redeemVoucher(userId: string, id: string) {
    const voucher = await this.loadVoucher(id)

    if (voucher.status !== 'ASSIGNED') throw new BadRequestException('Voucher is not assigned')

    if (voucher.assignedToUserId !== userId) throw new ForbiddenException('You can only redeem vouchers assigned to you')

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      throw new BadRequestException('Voucher has expired')
    }

    // REDEEMED is a terminal state (spec §38).
    const saved = await this.dataSource.transaction(async (manager) => {
      await manager.update(Voucher, { id: voucher.id }, {
        status: 'REDEEMED',
        redeemedAt: new Date(),
      })

      await manager.save(
        this.transactionsRepo.create({
          voucherId: voucher.id,
          type: 'REDEEMED',
          userId,
          note: 'Voucher redeemed by user',
        }),
      )
    })

    const updated = await this.loadVoucher(id)

    return ApiResponse.success(VoucherResponseDto.fromEntity(updated, updated.vendor), 'Voucher redeemed', 200)
  }

  async cancelVoucher(userId: string, id: string) {
    const voucher = await this.loadVoucher(id)

    if (voucher.status === 'REDEEMED') throw new BadRequestException('Redeemed vouchers cannot be cancelled')

    if (voucher.status === 'CANCELLED') throw new BadRequestException('Voucher is already cancelled')

    // An ASSIGNED voucher may only be cancelled by the assigned user; AVAILABLE ones by anyone.
    if (voucher.status === 'ASSIGNED' && voucher.assignedToUserId !== userId) {
      throw new ForbiddenException('You can only cancel vouchers assigned to you')
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      await manager.update(Voucher, { id: voucher.id }, { status: 'CANCELLED' })

      await manager.save(
        this.transactionsRepo.create({
          voucherId: voucher.id,
          type: 'CANCELLED',
          userId: voucher.status === 'ASSIGNED' ? userId : null,
          note: voucher.status === 'ASSIGNED' ? 'Voucher cancelled by assignee' : 'Voucher cancelled',
        }),
      )
    })

    const updated = await this.loadVoucher(id)

    return ApiResponse.success(VoucherResponseDto.fromEntity(updated, updated.vendor), 'Voucher cancelled', 200)
  }

  async listTransactions(id: string) {
    await this.applyExpiry(id)

    const transactions = await this.transactionsRepo.find({
      where: { voucherId: id },
      order: { createdAt: 'ASC' },
    })

    return ApiResponse.success(
      transactions.map((transaction) => VoucherTransactionResponseDto.fromEntity(transaction)),
      'Voucher transactions retrieved',
      200,
    )
  }

  // ── Redeemable items (consumer discovery) ────────────────────────────────

  async listRedeemableItems() {
    const vouchers = await this.vouchersRepo.find({
      where: { status: 'AVAILABLE' as const },
      relations: { vendor: true },
      order: { createdAt: 'DESC' },
      take: 20,
    })

    const enriched = await Promise.all(
      vouchers.map(async (voucher) => {
        const current = await this.applyExpiry(voucher.id)
        return RedeemableItemResponseDto.fromEntity(current, current.vendor)
      }),
    )

    return ApiResponse.success(enriched, 'Redeemable items retrieved', 200)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async findVendor(id: string) {
    const vendor = await this.vendorsRepo.findOne({ where: { id } })

    if (!vendor) throw new NotFoundException('Voucher vendor not found')

    return vendor
  }

  private async loadVoucher(id: string) {
    const voucher = await this.vouchersRepo.findOne({ where: { id }, relations: { vendor: true } })

    if (!voucher) throw new NotFoundException('Voucher not found')

    return voucher
  }

  // Marks AVAILABLE/ASSIGNED vouchers as EXPIRED (with a ledger row) when their expiry has passed.
  private async applyExpiry(id: string) {
    const voucher = await this.loadVoucher(id)

    if (!voucher.expiresAt) return voucher

    if (voucher.status !== 'AVAILABLE' && voucher.status !== 'ASSIGNED') return voucher

    if (new Date(voucher.expiresAt) >= new Date()) return voucher

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Voucher, { id: voucher.id }, { status: 'EXPIRED' })

      await manager.save(
        this.transactionsRepo.create({
          voucherId: voucher.id,
          type: 'EXPIRED',
          userId: voucher.assignedToUserId,
          note: 'Voucher expired',
        }),
      )
    })

    return this.loadVoucher(id)
  }
}