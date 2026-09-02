import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PlansService } from '../../plans/plans.service'
import { PlanConfiguration } from '../../plans/entities/plan.entity'
import { McomService } from '../mcom.service'
import { UsersService } from '../../users/users.service'
import { User } from '../../users/entities/user.entity'
import { decryptMcomToken } from '../../../lib/utils/mcom-crypto.util'
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto'
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto'
import { CapturePurchaseDto } from './dto/capture-purchase.dto'

/** A plan a user can purchase. Prices mirror the connector contract (Pro tier = canonical). */
export interface PurchasablePlan {
  id: string
  name: string
  level: string
  monthlyPrice: number
  quarterlyPrice: number
  annualPrice: number
  trialDuration?: number
  features: string[]
  configuration?: PlanConfiguration | null
}

type BillingCycle = 'monthly' | 'quarterly' | 'annual'

interface BearerRequestOptions {
  method: 'GET' | 'POST'
  body?: Record<string, unknown>
  accessToken?: string
}

/**
 * In-app plan purchases proxied to the centralized MCOM Solutions billing
 * engine (Partner Integration Guide: "Processing Plan Purchases via MCOM
 * Solutions").
 *
 * MCOM Solutions owns the checkout: we initiate a Stripe/PayPal payment with
 * the user's Central access token, and confirm/capture once the gateway is
 * settled. The `platform` sent to Central is the registered app slug
 * (MCOM_PLATFORM_SLUG, e.g. `vcard`) so the activation writes a
 * `PlatformPackage` that flips the `canAccess_vcard` permission.
 */
@Injectable()
export class McomPackagesService {
  private readonly baseUrl: string
  private readonly webUrl: string
  private readonly platformSlug: string

  constructor(
    private readonly config: ConfigService,
    private readonly mcomService: McomService,
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
  ) {
    this.baseUrl = (this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010').replace(/\/+$/, '')
    this.webUrl = (this.config.get<string>('WEB_PUBLIC_URL') || 'http://localhost:3000').replace(/\/+$/, '')
    this.platformSlug = this.config.get<string>('MCOM_PLATFORM_SLUG') || 'vcard'
  }

  /** Purchasable business plans with the pricing Central's connector reads. */
  async listPlans(): Promise<PurchasablePlan[]> {
    const plans = await this.plansService.findAll('business')

    return plans
      .filter((plan) => plan.status === 'active')
      .map((plan) => {
        const pro = plan.tiers?.Pro
        return {
          id: plan.id,
          name: plan.name ?? plan.level,
          level: plan.level,
          monthlyPrice: pro?.monthly ?? 0,
          quarterlyPrice: pro?.quarterly ?? 0,
          annualPrice: pro?.annual ?? 0,
          trialDuration: pro?.trialDays || undefined,
          features: (plan.features ?? []).map((f) => f.text),
          configuration: plan.configuration ?? null,
        }
      })
  }

  /**
   * Kick off a gateway payment on MCOM Solutions. Returns the Stripe
   * `clientSecret` (render a card form) or the PayPal `approvalUrl` (redirect
   * the browser there).
   */
  async initiate(userId: string, dto: InitiatePurchaseDto) {
    const accessToken = await this.freshAccessToken(userId)

    return this.bearerRequest(`/api/v1/payment/platform/${dto.provider}/initiate`, {
      method: 'POST',
      accessToken,
      body: {
        platform: this.platformSlug,
        externalPlanId: dto.externalPlanId,
        billingCycle: dto.billingCycle,
        returnUrl: dto.returnUrl || this.defaultReturnUrl(),
        cancelUrl: dto.cancelUrl || this.defaultCancelUrl(),
      },
    })
  }

  /** Confirm a settled Stripe PaymentIntent/SetupIntent on MCOM Solutions → activates the package. */
  async confirmStripe(userId: string, dto: ConfirmPurchaseDto) {
    if (!dto.paymentIntentId && !dto.setupIntentId) {
      throw new BadRequestException('A paymentIntentId or setupIntentId is required')
    }

    const accessToken = await this.freshAccessToken(userId)

    const result = await this.bearerRequest('/api/v1/payment/platform/stripe/confirm', {
      method: 'POST',
      accessToken,
      body: {
        platform: this.platformSlug,
        externalPlanId: dto.externalPlanId,
        billingCycle: dto.billingCycle,
        // Central auto-detects `pi_` vs `seti_` by prefix; forward whichever
        // intent the browser settled (payment for paid plans, setup for trials).
        ...(dto.setupIntentId ? { setupIntentId: dto.setupIntentId } : { paymentIntentId: dto.paymentIntentId }),
      },
    })

    return { ...result, canAccessVcard: await this.canAccessVcard(userId) }
  }

  /** Capture an approved PayPal order on MCOM Solutions → activates the package. */
  async capturePaypal(userId: string, dto: CapturePurchaseDto) {
    // MCOM Solutions' capture endpoint is intentionally public (called after
    // PayPal's redirect, orderId-only). No user token required.
    const result = await this.bearerRequest('/api/v1/payment/platform/paypal/capture', {
      method: 'POST',
      body: { orderId: dto.orderId },
    })

    return { ...result, canAccessVcard: await this.canAccessVcard(userId) }
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private defaultReturnUrl(): string {
    return `${this.webUrl}/b/payment/success`
  }

  private defaultCancelUrl(): string {
    return `${this.webUrl}/b/membership/plans`
  }

  /** The user must be SSO-linked and have a usable Central access token. */
  private async freshAccessToken(userId: string): Promise<string> {
    const dbUser = await this.requireLinkedUser(userId)

    const accessToken = dbUser.mcomAccessToken ? decryptMcomToken(dbUser.mcomAccessToken) : null
    if (accessToken) {
      try {
        await this.mcomService.getUserInfo(accessToken)
        return accessToken
      } catch {
        // Token expired/invalid — fall through to refresh
      }
    }

    if (!dbUser.mcomRefreshToken) {
      throw new UnauthorizedException('Your MCOM session has expired — sign in with MCOM again to continue')
    }

    const refreshToken = decryptMcomToken(dbUser.mcomRefreshToken)
    try {
      const refreshed = await this.mcomService.refreshTokens(refreshToken)
      return refreshed.accessToken
    } catch {
      // The stored Central tokens are dead (session cleared/expired on MCOM
      // Solutions). A fresh SSO authorization is the only way to re-issue them.
      throw new UnauthorizedException('Your MCOM session has expired — sign in with MCOM again to continue')
    }
  }

  private async requireLinkedUser(userId: string): Promise<User> {
    const dbUser = await this.usersService.findById(userId)
    if (!dbUser) throw new NotFoundException('User not found')
    if (!dbUser.mcomUserId || !dbUser.mcomAccessToken) {
      throw new BadRequestException('Account is not linked to MCOM Solutions — sign in with MCOM first')
    }
    return dbUser
  }

  /** Freshly calculated access for this platform on Central (may still be gated on membership). */
  private async canAccessVcard(userId: string): Promise<boolean> {
    const dbUser = await this.requireLinkedUser(userId)
    if (!dbUser.mcomUserId) throw new Error('User has no linked MCOM account')
    const permissions = await this.mcomService.fetchPermissions(dbUser.mcomUserId)
    return permissions[this.mcomService.platformPermissionKey] === true || permissions.can_access_vcard === true
  }

  private async bearerRequest(path: string, opts: BearerRequestOptions): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}${path}`

    let res: Response
    try {
      res = await fetch(url, {
        method: opts.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(opts.accessToken ? { Authorization: `Bearer ${opts.accessToken}` } : {}),
        },
        body: opts.method === 'POST' && opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      })
    } catch (err) {
      throw new ServiceUnavailableException(
        `MCOM Solutions unreachable at ${this.baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const detail = this.extractMessage(text)
      const suffix = detail ? `: ${detail}` : ''
      if (res.status === 401 || res.status === 403) {
        throw new UnauthorizedException(`MCOM Solutions rejected the request (${res.status})${suffix}`)
      }
      if (res.status === 404) {
        throw new NotFoundException(`MCOM Solutions: ${text.slice(0, 300)}`)
      }
      if (res.status >= 500) {
        throw new ServiceUnavailableException(`MCOM Solutions error (${res.status}): ${text.slice(0, 300)}`)
      }
      throw new HttpException(text.slice(0, 300), res.status)
    }

    const text = await res.text()
    return text ? JSON.parse(text) : {}
  }

  /** Best-effort pull of Central's human-readable error message from its response body. */
  private extractMessage(body: string): string | null {
    if (!body) return null
    try {
      const parsed = JSON.parse(body) as { message?: unknown }
      if (typeof parsed?.message === 'string') return parsed.message.slice(0, 300)
    } catch {
      // fall through to the raw snippet
    }
    return body.slice(0, 300) || null
  }
}