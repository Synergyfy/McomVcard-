/**
 * Central Hub Solution `PlatformEntitlement` contract (protocol 2026-10-01).
 *
 * Central is the single source of truth for platform access. VCard never
 * infers access from a role or from local billing state — it reads the
 * entitlement returned by the SSO token exchange / userinfo / introspection
 * endpoints and maps it to a local {@link McomAccessDecision}.
 */

export type McomAccessType = 'PAID_MEMBERSHIP' | 'DIRECT_PACKAGE' | 'TRIAL_PROGRAMME' | 'NONE'

export type McomPlanSource = 'membership' | 'direct' | 'trial'

export type McomAccessSource = McomPlanSource | 'none'

export type McomAccessReason =
  | 'PLATFORM_NOT_IN_MEMBERSHIP'
  | 'TRIAL_NO_TASKS'
  | 'TRIAL_EXPIRED'
  | 'UNVERIFIED'
  | 'MEMBERSHIP_EXPIRED'
  | 'NO_ACTIVE_ENTITLEMENT'
  | string

export interface McomTargetPlatform {
  clientId?: string | null
  platformSlug?: string | null
  name?: string | null
}

export interface McomEntitlementPlan {
  planId?: string | null
  planName?: string | null
  source?: McomPlanSource | string | null
  status?: string | null
  billingCycle?: string | null
  expiresAt?: string | null
  quotas?: Record<string, unknown> | null
  limits?: Record<string, unknown> | null
  features?: string[] | null
  [key: string]: unknown
}

export interface McomMembershipContext {
  membershipPlanName?: string | null
  membershipLevel?: string | null
  membershipStatus?: string | null
  isIncludedInMembership?: boolean | null
  [key: string]: unknown
}

export interface McomTrialTask {
  taskId: string
  title: string
  description: string
  deadlineDays: number
  rewardPoints: number
  status: string
}

export interface McomTrialContext {
  isInTrial?: boolean | null
  hasPaidVerificationFee?: boolean | null
  trialExpiresAt?: string | null
  daysRemaining?: number | null
  programmeTasks?: Array<Partial<McomTrialTask> & Record<string, unknown>> | null
  [key: string]: unknown
}

/** Unified entitlement returned by Central for every platform. */
export interface McomEntitlement {
  version?: string
  targetPlatform?: McomTargetPlatform | null
  access?: {
    hasAccess?: boolean | null
    accessType?: McomAccessType | string | null
    reason?: McomAccessReason | null
    upgradeUrl?: string | null
    upgrade_url?: string | null
  } | null
  plan?: McomEntitlementPlan | null
  membershipContext?: McomMembershipContext | null
  trialContext?: McomTrialContext | null
  whitelabel?: {
    enabled?: boolean
    granted?: boolean
    roleEligible?: boolean
    grantedAt?: string | null
  } | null
  [key: string]: unknown
}

/**
 * The local, normalized form of an entitlement. Persisted on the user and
 * returned to the SPA so both can make the same access decision.
 */
export interface McomAccessDecision {
  /** Authoritative local decision (Central's hasAccess + expiry guard). */
  allowed: boolean
  accessType: McomAccessType
  source: McomAccessSource

  planId: string | null
  planName: string | null
  planStatus: string | null
  billingCycle: string | null
  expiresAt: string | null
  quotas: Record<string, unknown>
  limits: Record<string, unknown>
  features: string[]

  membershipName: string | null
  membershipLevel: string | null
  membershipStatus: string | null
  isIncludedInMembership: boolean

  trialDaysRemaining: number
  trialExpiresAt: string | null
  hasPaidVerificationFee: boolean
  tasks: McomTrialTask[]

  reason?: McomAccessReason
  upgradeUrl?: string
  checkedAt?: string
}

const SOURCE_BY_ACCESS_TYPE: Record<string, McomAccessSource> = {
  PAID_MEMBERSHIP: 'membership',
  DIRECT_PACKAGE: 'direct',
  TRIAL_PROGRAMME: 'trial',
  NONE: 'none',
}

function isExpired(iso: string | null | undefined): boolean {
  if (!iso) return false
  const time = new Date(iso).getTime()
  return Number.isFinite(time) && time <= Date.now()
}

function normalizeTasks(tasks: McomTrialContext['programmeTasks']): McomTrialTask[] {
  if (!Array.isArray(tasks)) return []

  return tasks.map((task, index) => ({
    taskId: String(task?.taskId ?? `task_${index + 1}`),
    title: String(task?.title ?? 'Programme task'),
    description: String(task?.description ?? ''),
    deadlineDays: Number(task?.deadlineDays ?? 0) || 0,
    rewardPoints: Number(task?.rewardPoints ?? 0) || 0,
    status: String(task?.status ?? 'PENDING'),
  }))
}

function denied(
  entitlement: McomEntitlement,
  accessType: McomAccessType,
  reason: McomAccessReason | undefined,
  membership: McomMembershipContext,
  trial: McomTrialContext,
  expiresAt: string | null,
): McomAccessDecision {
  return {
    allowed: false,
    accessType,
    source: 'none',
    planId: null,
    planName: null,
    planStatus: null,
    billingCycle: null,
    expiresAt,
    quotas: {},
    limits: {},
    features: [],
    membershipName: membership.membershipPlanName ?? null,
    membershipLevel: membership.membershipLevel ?? 'Bronze',
    membershipStatus: membership.membershipStatus ?? 'none',
    isIncludedInMembership: membership.isIncludedInMembership === true,
    trialDaysRemaining: Number(trial.daysRemaining ?? 0) || 0,
    trialExpiresAt: trial.trialExpiresAt ?? null,
    hasPaidVerificationFee: trial.hasPaidVerificationFee === true,
    tasks: normalizeTasks(trial.programmeTasks),
    reason,
    upgradeUrl: entitlement.access?.upgradeUrl ?? entitlement.access?.upgrade_url ?? undefined,
    checkedAt: new Date().toISOString(),
  }
}

/** True when a plan/trial window in the decision has already passed. */
export function isDecisionExpired(decision: McomAccessDecision): boolean {
  return isExpired(decision.expiresAt)
}

/**
 * Resolve the entitlement into a local access decision.
 *
 * Rules (protocol §10):
 * - `access.hasAccess === false` always means deny — no fallback to cached data.
 * - A plan/trial whose expiry has passed is revoked locally even if Central's
 *   cached response still says active.
 * - Membership bundles have `plan.expiresAt: null`; validity follows the
 *   membership itself and Central keeps `hasAccess` current.
 * - `access.accessType` + `plan.source` together tell us which UI/source label
 *   to show. Access passes are handled generically (VCard does not publish any
 *   yet).
 */
export function decideAccess(entitlement: McomEntitlement): McomAccessDecision {
  const access = entitlement.access ?? {}
  const plan = entitlement.plan ?? null
  const membership = entitlement.membershipContext ?? {}
  const trial = entitlement.trialContext ?? {}

  const accessType = (access.accessType ?? 'NONE') as McomAccessType
  const mappedSource = SOURCE_BY_ACCESS_TYPE[accessType] ?? 'none'

  // No platform access (or no plan for this platform) means deny. Read the
  // reason and send the user to Central's upgrade URL.
  if (access.hasAccess !== true || !plan) {
    return denied(
      entitlement,
      accessType,
      access.reason ?? 'NO_ACTIVE_ENTITLEMENT',
      membership,
      trial,
      plan?.expiresAt ?? null,
    )
  }

  // Revoke locally the moment a pass/trial expires, or the plan is cancelled.
  if (
    isExpired(plan.expiresAt) ||
    plan.status === 'expired' ||
    plan.status === 'cancelled'
  ) {
    return denied(
      entitlement,
      accessType,
      access.reason ?? 'NO_ACTIVE_ENTITLEMENT',
      membership,
      trial,
      plan.expiresAt ?? null,
    )
  }

  const planSource = (plan.source ?? null) as McomAccessSource | null
  const source: McomAccessSource =
    planSource && planSource !== 'none' ? planSource : mappedSource

  const isTrial = source === 'trial'

  return {
    allowed: true,
    accessType,
    source,
    planId: plan.planId ?? null,
    planName: plan.planName ?? null,
    planStatus: plan.status ?? null,
    billingCycle: plan.billingCycle ?? null,
    expiresAt: plan.expiresAt ?? (isTrial ? trial.trialExpiresAt ?? null : null),
    quotas: plan.quotas ?? {},
    limits: plan.limits ?? {},
    features: Array.isArray(plan.features) ? plan.features : [],
    membershipName: membership.membershipPlanName ?? null,
    membershipLevel: membership.membershipLevel ?? 'Bronze',
    membershipStatus: membership.membershipStatus ?? 'none',
    isIncludedInMembership: membership.isIncludedInMembership === true,
    trialDaysRemaining: isTrial ? Number(trial.daysRemaining ?? 0) || 0 : 0,
    trialExpiresAt: trial.trialExpiresAt ?? null,
    hasPaidVerificationFee: trial.hasPaidVerificationFee === true,
    tasks: isTrial ? normalizeTasks(trial.programmeTasks) : [],
    reason: access.reason ?? undefined,
    upgradeUrl: access.upgradeUrl ?? access.upgrade_url ?? undefined,
    checkedAt: new Date().toISOString(),
  }
}

/** True only when the user has access because their membership bundles VCard. */
export function isMembershipAccess(entitlement: McomEntitlement): boolean {
  const decision = decideAccess(entitlement)
  return (
    decision.allowed &&
    decision.accessType === 'PAID_MEMBERSHIP' &&
    decision.isIncludedInMembership &&
    decision.source === 'membership'
  )
}

/** True only when the user has programme (dashboard/trial) access. */
export function isTrialAccess(entitlement: McomEntitlement): boolean {
  const decision = decideAccess(entitlement)
  return (
    decision.allowed &&
    decision.accessType === 'TRIAL_PROGRAMME' &&
    decision.source === 'trial'
  )
}
