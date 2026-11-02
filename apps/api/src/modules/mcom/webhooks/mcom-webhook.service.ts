import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'
import { createHash } from 'crypto'
import { UsersService } from '../../users/users.service'
import { McomWebhookEvent } from './mcom-webhook-event.entity'
import { McomWebhookDto } from '../dto/mcom-webhook.dto'
import { McomPackagesService } from '../packages/mcom-packages.service'

export interface WebhookProcessResult {
  handled: boolean
  alreadyProcessed: boolean
  action?: string
}

/**
 * Processes MCOM Solutions lifecycle webhooks (`package.created`,
 * `package.renewed`, `package.cancelled`, `package.expired`,
 * `payment.failed`).
 *
 * The handler is idempotent: every delivery is hashed (SHA-256 of the raw
 * body) and recorded in `mcom_webhook_events` with a unique PK, so retried
 * deliveries never double-apply an entitlement change.
 */
@Injectable()
export class McomWebhookService {
  private readonly logger = new Logger('McomWebhook')
  private readonly platformSlug: string

  constructor(
    @InjectRepository(McomWebhookEvent) private readonly eventsRepo: Repository<McomWebhookEvent>,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly packagesService: McomPackagesService,
  ) {
    this.platformSlug = (this.config.get<string>('MCOM_PLATFORM_SLUG') || 'vcards')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  }

  /**
   * Handle a verified webhook. `rawBody` must be the exact bytes MCOM Solutions
   * signed (used for dedupe only — signature verification happens upstream).
   */
  async process(rawBody: Buffer | string, dto: McomWebhookDto): Promise<WebhookProcessResult> {
    // Accept the current slug (`vcards`) and the legacy `vcard` spelling.
    const incomingPlatform = String(dto.platform || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    if (incomingPlatform !== this.platformSlug && !incomingPlatform.includes('vcard')) {
      // Webhook for another platform slug — acknowledge but do nothing.
      return { handled: false, alreadyProcessed: false, action: 'platform-mismatch' }
    }

    const eventHash = createHash('sha256').update(rawBody).digest('hex')

    const alreadyProcessed = await this.eventsRepo.exist({ where: { eventHash } })
    if (alreadyProcessed) {
      return { handled: true, alreadyProcessed: true }
    }

    await this.applyEvent(dto)

    await this.eventsRepo.insert({
      eventHash,
      event: dto.event,
      platform: dto.platform,
      packageId: dto.data?.packageId ?? dto.data?.chargeId ?? null,
    })

    return { handled: true, alreadyProcessed: false, action: dto.event }
  }

  // ── per-event application logic ───────────────────────────────────────────

  private async applyEvent(dto: McomWebhookDto): Promise<void> {
    const user =
      (dto.data.externalCustomerId
        ? await this.usersService.findById(dto.data.externalCustomerId).catch(() => null)
        : null) ??
      (dto.data.mcomUserId ? await this.usersService.findByMcomUserId(dto.data.mcomUserId) : null)

    if (!user) {
      // The account may not exist locally yet (user has never visited this
      // platform). Nothing to update — the OAuth SSO flow provisions them.
      this.logger.log(
        `Webhook ${dto.event} for unknown user ${dto.data.externalCustomerId ?? dto.data.mcomUserId} — skipped`,
      )
      return
    }

    switch (dto.event) {
      case 'package.created': {
        await this.usersService.update(user.id, {
          mcomCanAccessVcard: true,
          mcomMembershipStatus: dto.data.status || 'active',
        })
        this.logger.log(`package.created granted VCard access to ${dto.data.mcomUserId}`)
        break
      }

      case 'package.renewed': {
        await this.usersService.update(user.id, {
          mcomCanAccessVcard: true,
          mcomMembershipStatus: dto.data.status || 'active',
        })
        this.logger.log(`package.renewed extended VCard access for ${dto.data.mcomUserId}`)
        break
      }

      case 'package.cancelled': {
        // Auto-renew cancelled — access remains until the current period ends,
        // at which point Central dispatches `package.expired`.
        await this.usersService.update(user.id, { mcomMembershipStatus: 'cancelled' })
        this.logger.log(`package.cancelled marked pending cancellation for ${dto.data.mcomUserId}`)
        break
      }

      case 'package.expired': {
        await this.usersService.update(user.id, {
          mcomCanAccessVcard: false,
          mcomMembershipStatus: 'inactive',
        })
        this.logger.log(`package.expired revoked VCard access for ${dto.data.mcomUserId}`)
        break
      }

      case 'payment.failed': {
        // Recurring charge failed — flag the account for a billing update but
        // keep current access until the retry/grace window elapses.
        await this.usersService.update(user.id, { mcomMembershipStatus: 'payment_failed' })
        this.logger.warn(`payment.failed flagged billing for ${dto.data.mcomUserId}`)
        break
      }

      case 'payment.succeeded': {
        // Backstop for a plan charge the browser never confirmed. Activation is
        // idempotent on the MCOM Pay charge id.
        const activated = await this.packagesService.activateFromCharge({
          id: dto.data.chargeId as string,
          status: dto.data.status || 'paid',
          reference: dto.data.reference ?? null,
          externalCustomerId: user.id,
        })
        this.logger.log(
          activated
            ? `payment.succeeded activated the paid plan for ${user.id}`
            : `payment.succeeded received for ${user.id} (not a plan charge)`,
        )
        break
      }

      case 'payment.refunded': {
        const chargeTotal = dto.data.chargeAmountMinor
        const refunded = dto.data.totalRefundedMinor ?? dto.data.amountMinor
        const fullyRefunded = Boolean(chargeTotal && refunded && BigInt(refunded) >= BigInt(chargeTotal))

        if (fullyRefunded) {
          await this.packagesService.revokeFromCharge({
            id: dto.data.chargeId as string,
            status: 'refunded',
            reference: dto.data.reference ?? null,
            externalCustomerId: user.id,
          })
          this.logger.log(`payment.refunded revoked the plan for ${user.id}`)
        } else {
          this.logger.log(`payment.refunded partially refunded charge ${dto.data.chargeId} — access kept`)
        }
        break
      }
    }
  }
}