import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Plan,
  PlanVariantKey,
} from '../plans/entities/plan.entity'
import {
  PLAN_VARIANT_DEFINITIONS,
  mergeConfiguration,
  resolvePlanVariants,
} from '../plans/plan-variants'
import { PLAN_CAPABILITY_SCHEMA } from '../plans/plan-capability-schema'
import { SubscribedPlan } from '../subscriptions/entities/subscribed-plan.entity'
import { AccessPass } from '../access-passes/entities/access-pass.entity'
import { AccessPassPurchase } from '../access-passes/entities/access-pass-purchase.entity'
import { expiryTime } from '../access-passes/access-passes.service'
import { User } from '../users/entities/user.entity'
import { Membership } from '../memberships/entities/membership.entity'
import {
  PLAN_LIMIT_MATRIX,
  resolvePlanLevel,
  resolvePlanTier,
  tierIndex,
} from '../businesses/plan-limit-matrix'

/** How a configured capability behaves for the resolved plan variant. */
export type CapabilityMode = 'disabled' | 'limited' | 'unlimited'

export interface ResolvedCapability {
  key: string
  mode: CapabilityMode
  enabled: boolean
  /** Maximum uses for `limited`; `null` for unlimited/disabled. */
  limit: number | null
}

export type CapabilitySource = 'plan' | 'access_pass' | 'membership' | 'central' | 'none'

export interface ResolvedCapabilities {
  /** True when the user has an active, unexpired entitlement. */
  allowed: boolean
  /** Where the entitlements came from. */
  source: CapabilitySource
  planId: string | null
  planName: string | null
  /** Set when the entitlement came from an access pass. */
  accessPassId: string | null
  variant: PlanVariantKey | null
  variantName: string | null
  durationDays: number | null
  startedAt: string | null
  expiresAt: string | null
  features: string[]
  quotas: Record<string, number | boolean>
  featureFlags: Record<string, boolean>
  capabilities: Record<string, ResolvedCapability>
  reason?: string
}

const VARIANT_KEYS: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']

function isVariantKey(value: unknown): value is PlanVariantKey {
  return typeof value === 'string' && (VARIANT_KEYS as string[]).includes(value)
}

function emptyCapabilities(reason: string): ResolvedCapabilities {
  return {
    allowed: false,
    source: 'none',
    planId: null,
    planName: null,
    accessPassId: null,
    variant: null,
    variantName: null,
    durationDays: null,
    startedAt: null,
    expiresAt: null,
    features: [],
    quotas: {},
    featureFlags: {},
    capabilities: {},
    reason,
  }
}

function capabilityLabel(key: string): string {
  const field = [
    ...PLAN_CAPABILITY_SCHEMA.quotas,
    ...PLAN_CAPABILITY_SCHEMA.featureFlags,
  ].find((candidate) => candidate.key === key)
  if (field) return field.label
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()).trim()
}

function toQuotaValue(value: unknown): number | boolean | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase()
    if (lower === 'unlimited' || lower === '∞') return -1
    if (lower === 'true') return true
    if (lower === 'false') return false
    const parsed = Number(lower)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

/**
 * Resolves the capabilities a user actually has.
 *
 * Resolution order:
 * 1. Locally purchased plan subscription → the exact plan + variant the user
 *    paid for (the configuration created in `/admin/plans/create`).
 * 2. Legacy membership tier (Bronze/Silver/Gold/Platinum × Normal/Pro/Pro+) →
 *    the historical matrix, with every feature enabled so existing members do
 *    not lose access when local plans are introduced.
 * 3. Central Hub entitlement (MCOM) → its quotas/limits, with every feature
 *    enabled as a compatibility fallback.
 *
 * `assertFeature()` / `assertQuota()` are the enforcement entry points used by
 * the capability guard and by services that create quota-bound resources.
 */
@Injectable()
export class CapabilitiesService {
  constructor(
    @InjectRepository(Plan)
    private readonly plansRepo: Repository<Plan>,
    @InjectRepository(SubscribedPlan)
    private readonly subscriptionsRepo: Repository<SubscribedPlan>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Membership)
    private readonly membershipsRepo: Repository<Membership>,
    @InjectRepository(AccessPass)
    private readonly accessPassesRepo: Repository<AccessPass>,
    @InjectRepository(AccessPassPurchase)
    private readonly accessPassPurchasesRepo: Repository<AccessPassPurchase>,
  ) {}

  /** Resolve the current plan + variant and all configured capabilities. */
  async resolveForUser(userId: string): Promise<ResolvedCapabilities> {
    // 1. A plan or access pass bought directly on MCOM VCard always wins, even
    //    when Central also reports a membership/trial entitlement. If both
    //    exist, honour whichever runs longer so a new purchase never silently
    //    shortens the access the user already paid for.
    const subscription = await this.findActiveSubscription(userId)
    const accessPass = await this.findActiveAccessPassPurchase(userId)

    if (
      accessPass &&
      (!subscription ||
        expiryTime(accessPass.expiresAt) > expiryTime(subscription.expiresAt))
    ) {
      const resolved = await this.resolveFromAccessPass(accessPass)
      if (resolved) return resolved
    }

    if (subscription) {
      const resolved = await this.resolveFromSubscription(userId, subscription)
      if (resolved) return resolved
    }

    // 2. Central Hub membership/trial (including the VCard plan bundled with
    //    that membership) determines access when there is no local purchase.
    const central = await this.resolveFromCentral(userId)
    if (central) return central

    // 3. Legacy local membership rows remain a fallback for older accounts.
    const membership = await this.resolveFromMembership(userId)
    if (membership) return membership

    return emptyCapabilities('NO_ACTIVE_PLAN')
  }

  /**
   * Enforce a feature flag. Unknown features and users without a resolved plan
   * are allowed (the binary business-access guard already gates the dashboard);
   * an explicit `false` in the user's variant denies the action.
   */
  async assertFeature(userId: string, key: string): Promise<ResolvedCapabilities> {
    const resolved = await this.resolveForUser(userId)
    if (!resolved.allowed) return resolved

    const capability = resolved.capabilities[key]
    if (capability?.mode === 'disabled') {
      throw new ForbiddenException(
        `"${capabilityLabel(key)}" is not included in your current plan. Upgrade to add it.`,
      )
    }

    return resolved
  }

  /**
   * Enforce a numeric quota with the resource's current usage count.
   * - `disabled` → deny
   * - `limited` → deny when `used >= limit`
   * - `unlimited` / unconfigured → allow
   *
   * Users without a resolved plan are allowed; the binary business-access
   * guard is responsible for denying dashboard access in that case.
   */
  async assertQuota(
    userId: string,
    key: string,
    used = 0,
  ): Promise<ResolvedCapabilities> {
    const resolved = await this.resolveForUser(userId)
    // Quotas are business-plan entitlements. Without a resolved plan the
    // caller must not be able to create the resource (the dashboard is
    // already gated, but the API must enforce it independently).
    if (!resolved.allowed) {
      throw new ForbiddenException('An active plan is required for this action')
    }

    const capability = resolved.capabilities[key]
    if (!capability) return resolved

    if (capability.mode === 'disabled') {
      throw new ForbiddenException(
        `"${capabilityLabel(key)}" is not included in your current plan. Upgrade to add it.`,
      )
    }

    if (capability.mode === 'limited' && capability.limit !== null) {
      if (used >= capability.limit) {
        throw new ForbiddenException(
          `You have reached the "${capabilityLabel(key)}" limit for your plan ` +
            `(${used} of ${capability.limit} used). Upgrade to create more.`,
        )
      }
    }

    return resolved
  }

  /**
   * Returns the configured limit for a capability:
   * - `null` when unlimited or not configured,
   * - a positive number for finite quotas.
   * Throws when the capability is explicitly disabled.
   */
  async getLimit(userId: string, key: string): Promise<number | null> {
    const resolved = await this.resolveForUser(userId)
    this.assertPlanAccess(resolved)
    const capability = resolved.capabilities[key]
    if (!capability) return null
    if (capability.mode === 'disabled') {
      throw new ForbiddenException(`Your plan does not include "${capabilityLabel(key)}"`)
    }
    return capability.limit
  }

  /** True when the user's variant enables the capability. */
  async can(userId: string, key: string): Promise<boolean> {
    const resolved = await this.resolveForUser(userId)
    if (!resolved.allowed) return false
    const capability = resolved.capabilities[key]
    return capability ? capability.enabled : true
  }

  /**
   * Backwards-compatible combined assertion. Feature checks should prefer
   * `assertFeature()`; quota checks should prefer `assertQuota()`.
   */
  async assert(userId: string, key: string, used = 0): Promise<ResolvedCapabilities> {
    await this.assertFeature(userId, key)
    return this.assertQuota(userId, key, used ?? 0)
  }

  private assertPlanAccess(resolved: ResolvedCapabilities): void {
    if (!resolved.allowed) {
      throw new ForbiddenException('An active plan is required for this action')
    }
  }

  private async findActiveAccessPassPurchase(
    userId: string,
  ): Promise<AccessPassPurchase | null> {
    const purchases = await this.accessPassPurchasesRepo.find({
      where: { userId, status: 'active' },
      relations: ['accessPass'],
      order: { expiresAt: 'DESC' },
    })

    const now = Date.now()
    for (const purchase of purchases) {
      if (purchase.expiresAt.getTime() > now) return purchase
      purchase.status = 'expired'
      await this.accessPassPurchasesRepo.save(purchase)
    }

    return null
  }

  private async resolveFromAccessPass(
    purchase: AccessPassPurchase,
  ): Promise<ResolvedCapabilities | null> {
    const pass =
      purchase.accessPass ??
      (await this.accessPassesRepo.findOne({ where: { id: purchase.accessPassId } }))
    if (!pass) return null

    const quotas = pass.configuration?.quotas ?? {}
    const featureFlags = pass.configuration?.featureFlags ?? {}
    const features = (pass.features ?? []).map((feature) => feature.text)

    return {
      allowed: true,
      source: 'access_pass',
      planId: null,
      planName: pass.name,
      accessPassId: pass.id,
      variant: null,
      variantName: pass.name,
      durationDays: pass.durationDays,
      startedAt: purchase.startedAt?.toISOString() ?? null,
      expiresAt: purchase.expiresAt?.toISOString() ?? null,
      features,
      quotas,
      featureFlags,
      capabilities: this.buildCapabilities(quotas, featureFlags),
    }
  }

  private async findActiveSubscription(userId: string): Promise<SubscribedPlan | null> {
    const now = new Date()
    const subscriptions = await this.subscriptionsRepo.find({
      where: { userId, status: 'active' },
      relations: ['plan'],
      order: { expiresAt: 'DESC' },
    })

    return (
      subscriptions.find(
        (candidate) => !candidate.expiresAt || candidate.expiresAt.getTime() > now.getTime(),
      ) ?? null
    )
  }

  private async resolveFromSubscription(
    userId: string,
    subscription: SubscribedPlan,
  ): Promise<ResolvedCapabilities | null> {
    const plan =
      subscription.plan ?? (await this.plansRepo.findOne({ where: { id: subscription.planId } }))
    if (!plan) return null

    const variantKey = await this.resolveVariantKey(userId, subscription)
    const variants = resolvePlanVariants(plan)
    const variant = variants[variantKey]
    const config = mergeConfiguration(plan.configuration, variant.configuration)

    const quotas = config?.quotas ?? {}
    const featureFlags = config?.featureFlags ?? {}
    const features = (variant.features?.length ? variant.features : plan.features ?? []).map(
      (feature) => feature.text,
    )
    const definition = PLAN_VARIANT_DEFINITIONS[variantKey]

    return {
      allowed: true,
      source: 'plan',
      planId: plan.id,
      planName: plan.name,
      accessPassId: null,
      variant: variantKey,
      variantName: variant.name ?? definition.name,
      durationDays: variant.durationDays ?? definition.durationDays,
      startedAt: subscription.startedAt?.toISOString() ?? null,
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
      features,
      quotas,
      featureFlags,
      capabilities: this.buildCapabilities(quotas, featureFlags),
    }
  }

  /**
   * Legacy membership fallback. Keeps existing Bronze/Silver/Gold/Platinum
   * customers working while still returning a capability map the dashboard can
   * display. Feature flags are all enabled because the legacy matrix only
   * carries quotas.
   */
  private async resolveFromMembership(userId: string): Promise<ResolvedCapabilities | null> {
    const membership = await this.membershipsRepo.findOne({
      where: { userId, status: 'active' },
      relations: { tier: true },
      order: { startedAt: 'DESC' },
    })
    if (!membership) return null
    if (membership.expiresAt && membership.expiresAt.getTime() <= Date.now()) return null

    const tierName = membership.tier?.name ?? ''
    const planLevel = resolvePlanLevel(tierName)
    const planTier = resolvePlanTier(tierName)
    const index = tierIndex(planTier)
    const matrix = PLAN_LIMIT_MATRIX[planLevel]

    const quotaOrUnlimited = (value: number | null | undefined): number =>
      value === null || value === undefined ? -1 : value

    const quotas: Record<string, number | boolean> = {
      maxVCards: quotaOrUnlimited(matrix.vcards[index]),
      maxBusinessCards: quotaOrUnlimited(matrix.businessCards[index]),
      maxFriendsFamily: quotaOrUnlimited(matrix.friendsFamily[index]),
      qrRoutingRules: quotaOrUnlimited(matrix.qrRoutingRules[index]),
    }

    const featureFlags: Record<string, boolean> = {}
    for (const field of PLAN_CAPABILITY_SCHEMA.featureFlags) {
      featureFlags[field.key] = true
    }

    const variantKey = this.variantKeyFromTier(planTier)
    const definition = PLAN_VARIANT_DEFINITIONS[variantKey]

    return {
      allowed: true,
      source: 'membership',
      planId: null,
      planName: tierName || null,
      accessPassId: null,
      variant: variantKey,
      variantName: definition.name,
      durationDays: null,
      startedAt: membership.startedAt?.toISOString() ?? null,
      expiresAt: membership.expiresAt?.toISOString() ?? null,
      features: [],
      quotas,
      featureFlags,
      capabilities: this.buildCapabilities(quotas, featureFlags),
    }
  }

  /**
   * Central Hub entitlement fallback. Used for direct packages/trials that are
   * not represented by a local membership or subscription.
   */
  private async resolveFromCentral(userId: string): Promise<ResolvedCapabilities | null> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: [
        'id',
        'mcomCanAccessVcard',
        'mcomMembershipTier',
        'mcomMembershipLevel',
        'mcomMembershipStatus',
        'mcomAccess',
      ],
    })
    if (!user) return null

    const access = user.mcomAccess
    if (!user.mcomCanAccessVcard && access?.allowed !== true) return null

    // Central's quotas/limits are the fallback; when the bundled VCard plan is
    // published locally, its exact variant configuration (Gold Standard, Gold
    // Pro, etc.) is authoritative for this user.
    const centralQuotas: Record<string, number | boolean> = {}
    const centralFlags: Record<string, boolean> = {}
    const absorb = (input?: Record<string, unknown> | null) => {
      for (const [key, value] of Object.entries(input ?? {})) {
        const normalised = toQuotaValue(value)
        if (normalised === null) continue
        if (typeof normalised === 'boolean') centralFlags[key] = normalised
        else centralQuotas[key] = normalised
      }
    }
    absorb(access?.quotas)
    absorb(access?.limits)

    const plan = await this.findPlanForAccess(access?.planId ?? null, [
      access?.planName,
      access?.membershipLevel,
      user.mcomMembershipLevel,
      user.mcomMembershipTier,
    ])
    // Prefer the bundled VCard plan's own name. Only fall back to the
    // membership tier when the plan name does not name a variant explicitly.
    const planHint = access?.planName ?? ''
    const planNamesVariant = /\b(standard|pro\+?|pro)\b/i.test(planHint)
    const tierHint = planNamesVariant
      ? planHint
      : [planHint, access?.membershipLevel, user.mcomMembershipTier, user.mcomMembershipLevel]
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
          .join(' ')
    const variantKey = this.variantKeyFromTier(resolvePlanTier(tierHint))
    const definition = PLAN_VARIANT_DEFINITIONS[variantKey]

    if (plan) {
      const variant = resolvePlanVariants(plan)[variantKey]
      const config = mergeConfiguration(plan.configuration, variant.configuration)
      const quotas = { ...centralQuotas, ...(config?.quotas ?? {}) }
      const featureFlags = { ...centralFlags, ...(config?.featureFlags ?? {}) }
      const localFeatures = variant.features?.length
        ? variant.features
        : plan.features?.length
          ? plan.features
          : null

      return {
        allowed: true,
        source: 'central',
        planId: plan.id,
        planName: plan.name,
        accessPassId: null,
        variant: variantKey,
        variantName: variant.name ?? definition.name,
        durationDays: variant.durationDays ?? definition.durationDays,
        startedAt: null,
        expiresAt: access?.expiresAt ?? null,
        features: localFeatures
          ? localFeatures.map((feature) => feature.text)
          : access?.features ?? [],
        quotas,
        featureFlags,
        capabilities: this.buildCapabilities(quotas, featureFlags),
      }
    }

    return {
      allowed: true,
      source: 'central',
      planId: access?.planId ?? null,
      planName: access?.planName ?? user.mcomMembershipLevel ?? user.mcomMembershipTier ?? null,
      accessPassId: null,
      variant: variantKey,
      variantName: definition.name,
      durationDays: null,
      startedAt: null,
      expiresAt: access?.expiresAt ?? null,
      features: access?.features ?? [],
      quotas: centralQuotas,
      featureFlags: centralFlags,
      capabilities: this.buildCapabilities(centralQuotas, centralFlags),
    }
  }

  /** Resolve the local plan that a Central membership/trial bundles with VCard. */
  private async findPlanForAccess(
    planId: string | null,
    planNames: Array<string | null | undefined>,
  ): Promise<Plan | null> {
    if (planId) {
      const byId = await this.plansRepo.findOne({ where: { id: planId } })
      if (byId) return byId
    }

    const candidates = new Set<string>()
    for (const name of planNames) {
      const trimmed = name?.trim()
      if (!trimmed) continue
      candidates.add(trimmed)
      // Central often names the bundle "Gold Standard" / "Gold Pro" while the
      // local plan is simply "Gold"; try the level prefix as well.
      const withoutVariant = trimmed.replace(/\s+(standard|pro\+?|pro)$/i, '').trim()
      if (withoutVariant && withoutVariant !== trimmed) candidates.add(withoutVariant)
    }

    for (const name of candidates) {
      const byName = await this.plansRepo
        .createQueryBuilder('plan')
        .where('LOWER(plan.name) = LOWER(:name)', { name })
        .getOne()
      if (byName) return byName
    }

    return null
  }

  private variantKeyFromTier(tier: 'Normal' | 'Pro' | 'Pro+'): PlanVariantKey {
    if (tier === 'Pro+') return 'pro_plus'
    if (tier === 'Pro') return 'pro'
    return 'standard'
  }

  private async resolveVariantKey(
    userId: string,
    subscription: SubscribedPlan,
  ): Promise<PlanVariantKey> {
    if (isVariantKey(subscription.variant)) return subscription.variant

    // Older subscriptions predate the variant column. Fall back to the tier
    // stored on the user by the activation flow, then to Standard.
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: ['id', 'mcomMembershipTier'],
    })
    const tier = user?.mcomMembershipTier?.trim().toLowerCase()
    if (tier === 'pro+') return 'pro_plus'
    if (tier === 'pro') return 'pro'
    return 'standard'
  }

  private buildCapabilities(
    quotas: Record<string, number | boolean>,
    featureFlags: Record<string, boolean>,
  ): Record<string, ResolvedCapability> {
    const keys = new Set([...Object.keys(quotas), ...Object.keys(featureFlags)])
    const result: Record<string, ResolvedCapability> = {}

    for (const key of keys) {
      const quota = quotas[key]
      const flag = featureFlags[key]
      let mode: CapabilityMode = 'disabled'
      let limit: number | null = null

      if (typeof quota === 'boolean') {
        mode = quota ? 'unlimited' : 'disabled'
      } else if (typeof quota === 'number') {
        if (quota < 0) mode = 'unlimited'
        else if (quota === 0) mode = 'disabled'
        else {
          mode = 'limited'
          limit = quota
        }
      } else if (typeof flag === 'boolean') {
        mode = flag ? 'unlimited' : 'disabled'
      }

      // An explicit `false` flag always wins — admins use it to switch a
      // feature off for a variant regardless of any quota value.
      if (flag === false) {
        mode = 'disabled'
        limit = null
      }

      result[key] = {
        key,
        mode,
        enabled: mode !== 'disabled',
        limit,
      }
    }

    return result
  }
}
