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
import { PlanConfiguration, PlanVariantKey } from '../../plans/entities/plan.entity'
import { mergeConfiguration } from '../../plans/plan-variants'
import { AccessPassesService } from '../../access-passes/access-passes.service'
import { UsersService } from '../../users/users.service'
import { SubscriptionsService } from '../../subscriptions/subscriptions.service'
import { AppCharge, McomPayError, McomPayService } from '../mcom-pay.service'
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto'
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto'
import { InitiateAccessPassPurchaseDto } from './dto/initiate-access-pass-purchase.dto'
import { ConfirmAccessPassPurchaseDto } from './dto/confirm-access-pass-purchase.dto'

/** One of the three fixed-duration variants a buyer can choose. */
export interface PurchasableVariant {
  key: PlanVariantKey
  name: string
  durationDays: number
  price: number
  description: string
  features: string[]
  configuration?: PlanConfiguration | null
}

/** A plan a user can purchase, with its Standard/Pro/Pro+ variants. */
export interface PurchasablePlan {
  id: string
  name: string
  description: string
  audience: string
  currency: string
  variants: PurchasableVariant[]
}

/** A single-duration access pass a user can purchase. */
export interface PurchasableAccessPass {
  id: string
  name: string
  description: string
  price: number
  durationDays: number
  currency: string
  features: string[]
  configuration?: PlanConfiguration | null
}

interface ResolvedPurchase {
  planId: string
  planName: string | null
  planLevel: string | null
  variant: PurchasableVariant
}

interface ResolvedAccessPassPurchase {
  accessPassId: string
  name: string
  price: number
  durationDays: number
  currency: string
}

/** Reference format carried on every MCOM Pay plan charge. */
export const PLAN_PAYMENT_REFERENCE_PREFIX = 'vcards:plan:'
const PLAN_REFERENCE_RE = /^vcards:plan:([0-9a-fA-F-]{36}):(standard|pro|pro_plus)$/

/** Reference format carried on every MCOM Pay access-pass charge. */
export const ACCESS_PASS_PAYMENT_REFERENCE_PREFIX = 'vcards:access-pass:'
const ACCESS_PASS_REFERENCE_RE = /^vcards:access-pass:([0-9a-fA-F-]{36})$/

export function parsePlanPaymentReference(reference?: string | null): { planId: string; variant: PlanVariantKey } | null {
  if (!reference) return null
  const match = PLAN_REFERENCE_RE.exec(reference)
  if (!match) return null
  return { planId: match[1], variant: match[2] as PlanVariantKey }
}

export function parseAccessPassPaymentReference(
  reference?: string | null,
): { accessPassId: string } | null {
  if (!reference) return null
  const match = ACCESS_PASS_REFERENCE_RE.exec(reference)
  if (!match) return null
  return { accessPassId: match[1] }
}

/** Minimal charge shape needed to activate/revoke a plan entitlement. */
export interface PlanChargeLike {
  id: string
  status: string
  reference?: string | null
  externalCustomerId?: string | null
}

/**
 * In-app VCard plan purchases.
 *
 * Payments always settle from the customer's centralized MCOM Wallet through
 * the MCOM Pay partner gateway (`method: "wallet"`). The amount is resolved
 * server-side from the plan variant — the browser can never set it. Once MCOM
 * reports the charge as paid, the matching local plan entitlement is activated
 * (Part C: partner apps own their subscription lifecycle).
 */
@Injectable()
export class McomPackagesService {
  private readonly topUpUrl: string

  constructor(
    private readonly config: ConfigService,
    private readonly plansService: PlansService,
    private readonly accessPassesService: AccessPassesService,
    private readonly usersService: UsersService,
    private readonly mcomPay: McomPayService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {
    const solutionsUrl = (this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010').replace(/\/+$/, '')
    this.topUpUrl =
      this.config.get<string>('mcom.walletTopUpUrl') || `${solutionsUrl}/dashboard/wallet`
  }

  /** Purchasable business plans with their three fixed-duration variants. */
  async listPlans(): Promise<PurchasablePlan[]> {
    const plans = await this.plansService.findAll('business')

    return plans
      .filter((plan) => plan.status === 'active')
      .map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        audience: plan.audience,
        currency: plan.currency,
        variants: (plan.variants ?? [])
          .filter((variant) => variant.isActive !== false)
          .map((variant) => ({
            key: variant.key as PlanVariantKey,
            name: variant.name,
            durationDays: variant.durationDays,
            price: variant.price,
            description: variant.description,
            features: (variant.features?.length ? variant.features : plan.features ?? []).map((f) => f.text),
            configuration: mergeConfiguration(plan.configuration, variant.configuration),
          })),
      }))
      .filter((plan) => plan.variants.length > 0)
  }

  /** Active access passes, each with a single duration and price. */
  async listAccessPasses(): Promise<PurchasableAccessPass[]> {
    const passes = await this.accessPassesService.findPurchasable()

    return passes.map((pass) => ({
      id: pass.id,
      name: pass.name,
      description: pass.description,
      price: pass.price,
      durationDays: pass.durationDays,
      currency: pass.currency,
      features: (pass.features ?? []).map((feature) => feature.text),
      configuration: pass.configuration,
    }))
  }

  /**
   * Charge the customer's MCOM Wallet for a plan. Amounts are in pence and come
   * from the stored plan variant, never from the request body.
   */
  async initiate(userId: string, dto: InitiatePurchaseDto) {
    const resolved = await this.resolvePurchaseVariant(dto.externalPlanId, dto.variant, dto.billingCycle)
    const user = await this.requireLinkedUser(userId)

    const amountMinor = Math.round(resolved.variant.price * 100)
    if (!Number.isFinite(amountMinor) || amountMinor < 0) {
      throw new BadRequestException('This plan variant has an invalid price')
    }

    // A genuinely free variant needs no wallet charge — grant it directly with
    // the attempt key as the idempotent payment reference.
    if (amountMinor === 0) {
      const freeReference = this.mcomPay.idempotencyKey('free-plan', user.id, dto.idempotencyKey)
      await this.subscriptionsService.activatePlan({
        userId: user.id,
        planId: resolved.planId,
        planName: resolved.planName,
        level: resolved.planLevel ?? resolved.planName,
        tier: resolved.variant.name,
        variant: resolved.variant.key,
        durationDays: resolved.variant.durationDays,
        paymentReference: freeReference,
      })

      return {
        charge: {
          id: freeReference,
          amountMinor: '0',
          currency: 'GBP',
          feeMinor: '0',
          netMinor: '0',
          method: 'wallet',
          status: 'paid',
          reference: `${PLAN_PAYMENT_REFERENCE_PREFIX}${resolved.planId}:${resolved.variant.key}`,
          externalCustomerId: user.id,
          createdAt: new Date().toISOString(),
        },
        plan: {
          id: resolved.planId,
          name: resolved.planName,
          variant: resolved.variant.key,
          durationDays: resolved.variant.durationDays,
          price: 0,
        },
        canAccessVcard: true,
      }
    }

    if (!this.mcomPay.enabled) {
      throw new ServiceUnavailableException('MCOM Pay is not configured on this server')
    }

    const reference = `${PLAN_PAYMENT_REFERENCE_PREFIX}${resolved.planId}:${resolved.variant.key}`
    const idempotencyKey = this.mcomPay.idempotencyKey('plan', user.id, dto.idempotencyKey)

    try {
      const result = await this.mcomPay.createCharge(
        {
          amountMinor: String(amountMinor),
          currency: 'GBP',
          method: dto.provider,
          reference,
          description: `MCOM VCard — ${resolved.planName ?? 'Plan'} (${resolved.variant.name})`,
          mcomUserId: user.mcomUserId as string,
          externalCustomerId: user.id,
          metadata: {
            purpose: 'vcard-plan',
            planId: resolved.planId,
            variant: resolved.variant.key,
            durationDays: resolved.variant.durationDays,
            userId: user.id,
            provider: dto.provider,
          },
        },
        idempotencyKey,
      )

      const activated = await this.activateIfPaid(result.charge, resolved, user.id)

      return {
        charge: result.charge,
        clientSecret: result.clientSecret ?? null,
        approvalUrl: result.approvalUrl ?? null,
        plan: {
          id: resolved.planId,
          name: resolved.planName,
          variant: resolved.variant.key,
          durationDays: resolved.variant.durationDays,
          price: resolved.variant.price,
        },
        canAccessVcard: activated,
      }
    } catch (err) {
      this.rethrowPayError(err)
    }
  }

  /**
   * Confirm a wallet charge. Wallet charges settle synchronously, so this is a
   * safe replay path for clients that lost the initiate response. Returns the
   * charge and the current access state.
   */
  async confirm(userId: string, dto: ConfirmPurchaseDto) {
    if (!this.mcomPay.enabled) {
      throw new ServiceUnavailableException('MCOM Pay is not configured on this server')
    }

    const resolved = await this.resolvePurchaseVariant(dto.externalPlanId, dto.variant, dto.billingCycle)
    await this.requireLinkedUser(userId)

    try {
      let charge = await this.mcomPay.getCharge(dto.chargeId)

      const expectedReference = `${PLAN_PAYMENT_REFERENCE_PREFIX}${resolved.planId}:${resolved.variant.key}`
      const expectedAmountMinor = String(Math.round(resolved.variant.price * 100))
      if (
        charge.reference !== expectedReference ||
        charge.externalCustomerId !== userId ||
        charge.amountMinor !== expectedAmountMinor
      ) {
        throw new BadRequestException('This charge does not match the selected plan')
      }

      // Stripe / PayPal settle via the provider after the browser returns or
      // the customer approves. Confirm with MCOM Pay using the provider handle.
      if (charge.status === 'pending' && dto.paymentIntentId) {
        charge = await this.mcomPay.confirmCharge(charge.id, { paymentIntentId: dto.paymentIntentId })
      } else if (charge.status === 'pending' && dto.orderId) {
        charge = await this.mcomPay.confirmCharge(charge.id, { orderId: dto.orderId })
      }

      const activated = await this.activateIfPaid(charge, resolved, userId)

      return {
        charge,
        plan: {
          id: resolved.planId,
          name: resolved.planName,
          variant: resolved.variant.key,
          durationDays: resolved.variant.durationDays,
          price: resolved.variant.price,
        },
        canAccessVcard: activated,
      }
    } catch (err) {
      this.rethrowPayError(err)
    }
  }

  /**
   * Charge the customer's MCOM Wallet for an access pass. As with plans, the
   * amount is resolved server-side from the stored pass, never the request.
   */
  async initiateAccessPass(userId: string, dto: InitiateAccessPassPurchaseDto) {
    const resolved = await this.resolveAccessPassPurchase(dto.accessPassId)
    const user = await this.requireLinkedUser(userId)

    const amountMinor = Math.round(resolved.price * 100)
    if (!Number.isFinite(amountMinor) || amountMinor < 0) {
      throw new BadRequestException('This access pass has an invalid price')
    }

    if (amountMinor === 0) {
      const freeReference = this.mcomPay.idempotencyKey(
        'free-access-pass',
        user.id,
        dto.idempotencyKey,
      )
      await this.accessPassesService.activatePurchase({
        userId: user.id,
        accessPassId: resolved.accessPassId,
        paymentReference: freeReference,
      })

      return {
        charge: {
          id: freeReference,
          amountMinor: '0',
          currency: resolved.currency,
          feeMinor: '0',
          netMinor: '0',
          method: 'wallet',
          status: 'paid',
          reference: `${ACCESS_PASS_PAYMENT_REFERENCE_PREFIX}${resolved.accessPassId}`,
          externalCustomerId: user.id,
          createdAt: new Date().toISOString(),
        },
        accessPass: {
          id: resolved.accessPassId,
          name: resolved.name,
          durationDays: resolved.durationDays,
          price: 0,
        },
        canAccessVcard: true,
      }
    }

    if (!this.mcomPay.enabled) {
      throw new ServiceUnavailableException('MCOM Pay is not configured on this server')
    }

    const reference = `${ACCESS_PASS_PAYMENT_REFERENCE_PREFIX}${resolved.accessPassId}`
    const idempotencyKey = this.mcomPay.idempotencyKey(
      'access-pass',
      user.id,
      dto.idempotencyKey,
    )

    try {
      const result = await this.mcomPay.createCharge(
        {
          amountMinor: String(amountMinor),
          currency: resolved.currency,
          method: dto.provider,
          reference,
          description: `MCOM VCard — ${resolved.name} (${resolved.durationDays} days)`,
          mcomUserId: user.mcomUserId as string,
          externalCustomerId: user.id,
          metadata: {
            purpose: 'vcard-access-pass',
            accessPassId: resolved.accessPassId,
            durationDays: resolved.durationDays,
            userId: user.id,
            provider: dto.provider,
          },
        },
        idempotencyKey,
      )

      const activated = await this.activateAccessPassIfPaid(result.charge, resolved, user.id)

      return {
        charge: result.charge,
        clientSecret: result.clientSecret ?? null,
        approvalUrl: result.approvalUrl ?? null,
        accessPass: {
          id: resolved.accessPassId,
          name: resolved.name,
          durationDays: resolved.durationDays,
          price: resolved.price,
        },
        canAccessVcard: activated,
      }
    } catch (err) {
      this.rethrowPayError(err)
    }
  }

  /** Confirm an access pass charge (safe replay path for lost responses). */
  async confirmAccessPass(userId: string, dto: ConfirmAccessPassPurchaseDto) {
    if (!this.mcomPay.enabled) {
      throw new ServiceUnavailableException('MCOM Pay is not configured on this server')
    }

    const resolved = await this.resolveAccessPassPurchase(dto.accessPassId)
    await this.requireLinkedUser(userId)

    try {
      let charge = await this.mcomPay.getCharge(dto.chargeId)

      const expectedReference = `${ACCESS_PASS_PAYMENT_REFERENCE_PREFIX}${resolved.accessPassId}`
      const expectedAmountMinor = String(Math.round(resolved.price * 100))
      if (
        charge.reference !== expectedReference ||
        charge.externalCustomerId !== userId ||
        charge.amountMinor !== expectedAmountMinor
      ) {
        throw new BadRequestException('This charge does not match the selected access pass')
      }

      if (charge.status === 'pending' && dto.paymentIntentId) {
        charge = await this.mcomPay.confirmCharge(charge.id, { paymentIntentId: dto.paymentIntentId })
      } else if (charge.status === 'pending' && dto.orderId) {
        charge = await this.mcomPay.confirmCharge(charge.id, { orderId: dto.orderId })
      }

      const activated = await this.activateAccessPassIfPaid(charge, resolved, userId)

      return {
        charge,
        accessPass: {
          id: resolved.accessPassId,
          name: resolved.name,
          durationDays: resolved.durationDays,
          price: resolved.price,
        },
        canAccessVcard: activated,
      }
    } catch (err) {
      this.rethrowPayError(err)
    }
  }

  /**
   * Webhook backstop: activate a paid plan charge from its MCOM Pay reference.
   * Returns true when access was granted.
   */
  async activateFromCharge(charge: PlanChargeLike): Promise<boolean> {
    if (charge.status !== 'paid') return false

    const userId = charge.externalCustomerId
    if (!userId) return false

    const parsed = parsePlanPaymentReference(charge.reference)
    if (parsed) {
      const user = await this.usersService.findById(userId)
      if (!user) return false

      const plan = await this.plansService.findOne(parsed.planId).catch(() => null)
      if (!plan) return false

      const variant = (plan.variants ?? []).find((candidate) => candidate.key === parsed.variant)
      if (!variant) return false

      await this.subscriptionsService.activatePlan({
        userId,
        planId: plan.id,
        planName: plan.name,
        level: plan.level ?? plan.name,
        tier: variant.name,
        variant: parsed.variant,
        durationDays: variant.durationDays,
        paymentReference: charge.id,
      })

      return true
    }

    const parsedPass = parseAccessPassPaymentReference(charge.reference)
    if (parsedPass) {
      const user = await this.usersService.findById(userId)
      if (!user) return false

      const pass = await this.accessPassesService
        .findOne(parsedPass.accessPassId)
        .catch(() => null)
      if (!pass) return false

      await this.accessPassesService.activatePurchase({
        userId,
        accessPassId: pass.id,
        paymentReference: charge.id,
      })

      return true
    }

    return false
  }

  /** Revoke local access when a plan or access-pass charge is refunded. */
  async revokeFromCharge(charge: PlanChargeLike): Promise<boolean> {
    const userId = charge.externalCustomerId
    if (!userId) return false

    const parsed = parsePlanPaymentReference(charge.reference)
    if (parsed) {
      await this.subscriptionsService.cancelPaidPlan(userId, parsed.planId)
      return true
    }

    const parsedPass = parseAccessPassPaymentReference(charge.reference)
    if (parsedPass) {
      await this.accessPassesService.cancelPurchase(userId, parsedPass.accessPassId)
      return true
    }

    return false
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private async activateIfPaid(
    charge: AppCharge,
    resolved: ResolvedPurchase,
    userId: string,
  ): Promise<boolean> {
    if (charge.status !== 'paid') return false

    const expectedReference = `${PLAN_PAYMENT_REFERENCE_PREFIX}${resolved.planId}:${resolved.variant.key}`
    if (
      charge.reference !== expectedReference ||
      (charge.externalCustomerId != null && charge.externalCustomerId !== userId)
    ) {
      throw new BadRequestException('This charge does not belong to this account or plan')
    }

    await this.subscriptionsService.activatePlan({
      userId,
      planId: resolved.planId,
      planName: resolved.planName,
      level: resolved.planLevel ?? resolved.planName,
      tier: resolved.variant.name,
      variant: resolved.variant.key,
      durationDays: resolved.variant.durationDays,
      paymentReference: charge.id,
    })

    return true
  }

  private async activateAccessPassIfPaid(
    charge: AppCharge,
    resolved: ResolvedAccessPassPurchase,
    userId: string,
  ): Promise<boolean> {
    if (charge.status !== 'paid') return false

    const expectedReference = `${ACCESS_PASS_PAYMENT_REFERENCE_PREFIX}${resolved.accessPassId}`
    if (
      charge.reference !== expectedReference ||
      (charge.externalCustomerId != null && charge.externalCustomerId !== userId)
    ) {
      throw new BadRequestException('This charge does not belong to this account or access pass')
    }

    await this.accessPassesService.activatePurchase({
      userId,
      accessPassId: resolved.accessPassId,
      paymentReference: charge.id,
    })

    return true
  }

  /** Resolve the stored access pass being purchased. */
  private async resolveAccessPassPurchase(accessPassId: string): Promise<ResolvedAccessPassPurchase> {
    const pass = await this.accessPassesService.findOne(accessPassId)
    if (pass.status !== 'active') {
      throw new BadRequestException('This access pass is not available for purchase')
    }
    if (!(pass.durationDays > 0)) {
      throw new BadRequestException('This access pass has an invalid duration')
    }

    return {
      accessPassId: pass.id,
      name: pass.name,
      price: pass.price,
      durationDays: pass.durationDays,
      currency: pass.currency || 'GBP',
    }
  }

  /**
   * Resolve which of the plan's three variants is being purchased. `variant` is
   * preferred; the legacy `billingCycle` field is still accepted.
   */
  private async resolvePurchaseVariant(
    planId: string,
    variant?: PlanVariantKey,
    legacyBillingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'annual',
  ): Promise<ResolvedPurchase> {
    const plan = await this.plansService.findOne(planId)
    if (plan.status !== 'active') {
      throw new BadRequestException('This plan is not available for purchase')
    }

    let resolved = variant
    if (!resolved && legacyBillingCycle) {
      const legacyMap: Record<'monthly' | 'quarterly' | 'semiannual' | 'annual', PlanVariantKey> = {
        monthly: 'standard',
        quarterly: 'standard',
        semiannual: 'pro',
        annual: 'pro_plus',
      }
      resolved = legacyMap[legacyBillingCycle]
    }
    if (!resolved) {
      throw new BadRequestException('A plan variant is required (standard, pro or pro_plus)')
    }

    const match = (plan.variants ?? []).find(
      (candidate) => candidate.key === resolved && candidate.isActive !== false,
    )
    if (!match) {
      throw new BadRequestException(`Variant "${resolved}" is not available for this plan`)
    }

    return {
      planId: plan.id,
      planName: plan.name,
      planLevel: plan.level,
      variant: {
        key: match.key as PlanVariantKey,
        name: match.name,
        durationDays: match.durationDays,
        price: match.price,
        description: match.description,
        features: (match.features?.length ? match.features : plan.features ?? []).map((f) => f.text),
        configuration: mergeConfiguration(plan.configuration, match.configuration),
      },
    }
  }

  /** The wallet owner on Central is the linked MCOM user id. */
  private async requireLinkedUser(userId: string) {
    const dbUser = await this.usersService.findById(userId)
    if (!dbUser) throw new NotFoundException('User not found')
    if (!dbUser.mcomUserId) {
      throw new BadRequestException('Account is not linked to MCOM Solutions — sign in with MCOM first')
    }
    return dbUser
  }

  /** Translate partner errors into stable HTTP responses for the SPA. */
  private rethrowPayError(err: unknown): never {
    if (!(err instanceof McomPayError)) throw err

    if (err.code === 'INSUFFICIENT_BALANCE' && err.httpStatus === 422) {
      throw new HttpException(
        {
          error: 'WALLET_INSUFFICIENT_FUNDS',
          message: 'Top up your MCOM Wallet to continue.',
          topUpUrl: this.topUpUrl,
        },
        402,
      )
    }

    if (err.httpStatus === 401) {
      throw new UnauthorizedException('MCOM rejected the payment request — sign in again to continue')
    }
    if (err.httpStatus === 404) {
      throw new NotFoundException(`MCOM Pay: ${err.message}`)
    }
    if (err.httpStatus >= 500) {
      throw new ServiceUnavailableException(`MCOM Pay error (${err.code}): ${err.message}`)
    }

    throw new HttpException({ error: err.code || 'PAYMENT_ERROR', message: err.message }, err.httpStatus || 400)
  }
}
