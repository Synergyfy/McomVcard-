import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mcomService, type ActivePlan, type McomAccessDecision } from '../../services/mcom'
import { capabilitiesService, type ResolvedCapabilities } from '../../services/capabilities'

function formatPrice(value?: number): string | null {
  if (value === undefined || value === null) return null
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(value?: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Human label for where the current VCard access comes from. */
function accessSourceLabel(plan: ActivePlan): string | null {
  if (plan.source === 'membership') {
    const membership = plan.membershipName ?? plan.membershipLevel ?? 'MCOM'
    return `Included in your ${membership} membership`
  }
  if (plan.source === 'trial') {
    const days = plan.trialDaysRemaining ?? plan.trialDays ?? 0
    return `Programme trial · ${days} day${days === 1 ? '' : 's'} left`
  }
  if (plan.source === 'access_pass') return 'Your VCard access pass'
  if (plan.source === 'direct') return 'Your VCard access pass'
  if (plan.source === 'local') return 'Your MCOM VCard plan'
  return null
}

/**
 * "My Plan" card driven by the user's real MCOM VCard access.
 *
 * Central returns the resolved plan inside the entitlement:
 * - a membership that bundles VCard (`source: membership`),
 * - a programme/trial window (`source: trial`) incl. the tasks to complete,
 * - or a local paid plan bought in-app (`source: local`).
 */
export default function MyPlanCard() {
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null)
  const [access, setAccess] = useState<McomAccessDecision | null>(null)
  const [capabilities, setCapabilities] = useState<ResolvedCapabilities | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    mcomService
      .getStatus(true)
      .then((res) => {
        if (cancelled) return
        setActivePlan(res.active_plan ?? null)
        setAccess(res.access ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load your plan. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    // Variant-level capabilities (quota / unlimited / disabled) for local
    // plan purchases. Membership-only access falls back to the entitlement
    // payload above and returns allowed=false here.
    capabilitiesService
      .get()
      .then((resolved) => { if (!cancelled) setCapabilities(resolved) })
      .catch(() => { /* capabilities are optional for membership-only access */ })

    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading your plan…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-sm text-gray-500 dark:text-gray-400">
        {error}
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-center">
        <p className="text-sm font-bold text-gray-900 dark:text-white">No active MCOM VCard plan</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pick a plan or ask your Central Hub membership to include MCOM VCard to unlock the full VCard suite.
        </p>
        <Link
          to="/plans"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold hover:opacity-95 transition-all"
        >
          View plans &amp; upgrade
        </Link>
      </div>
    )
  }

  const monthly = formatPrice(activePlan.monthlyPrice)
  const quarterly = formatPrice(activePlan.quarterlyPrice)
  const annual = formatPrice(activePlan.annualPrice)
  const expires = formatDate(activePlan.expiresAt)
  const sourceLabel = accessSourceLabel(activePlan)
  const isMembership = activePlan.source === 'membership'
  const isTrial = activePlan.source === 'trial'
  const quotas = activePlan.quotas ?? activePlan.configuration?.quotas ?? {}
  const featureFlags = {
    ...(activePlan.configuration?.featureFlags ?? {}),
    ...Object.fromEntries(
      Object.entries(activePlan.limits ?? {}).filter(([, value]) => typeof value === 'boolean'),
    ),
  }
  const tasks = activePlan.trialTasks?.length ? activePlan.trialTasks : isTrial ? access?.tasks ?? [] : []

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-white/70">Your current plan</p>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wide">
            {isTrial ? 'Trial' : isMembership ? 'Included' : activePlan.status === 'active' ? 'Active' : activePlan.status}
          </span>
        </div>

        <p className="text-2xl font-bold mt-1.5">{activePlan.name}</p>
        <p className="text-xs text-white/80 mt-0.5">
          {sourceLabel ?? `${activePlan.level ?? ''}${activePlan.level ? ' · ' : ''}VCard business plan`}
        </p>

        {isMembership ? (
          <p className="text-lg font-bold text-white/90 mt-4">Included in your membership</p>
        ) : isTrial ? (
          <p className="text-lg font-bold text-white/90 mt-4">
            {activePlan.trialDaysRemaining ?? activePlan.trialDays ?? 0} days of trial access
          </p>
        ) : activePlan.source === 'access_pass' ? (
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black">
              {formatPrice(activePlan.price) ?? 'Free'}
            </span>
            {activePlan.durationDays ? (
              <span className="text-sm text-white/80">
                for {activePlan.durationDays} days
              </span>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex items-baseline gap-2">
            {monthly ? (
              <>
                <span className="text-3xl font-black">{monthly}</span>
                <span className="text-sm text-white/80">/mo</span>
              </>
            ) : (
              <span className="text-lg font-bold text-white/90">Free</span>
            )}
          </div>
        )}

        {isMembership ? (
          <p className="text-xs text-white/80 mt-1">
            Valid while your {activePlan.membershipName ?? activePlan.membershipLevel ?? 'MCOM'} membership is active
          </p>
        ) : isTrial ? (
          <p className="text-xs text-white/80 mt-1">
            {expires ? `Trial ends ${expires} · ` : ''}
            {activePlan.trialDaysRemaining ?? activePlan.trialDays ?? 0} days left
          </p>
        ) : expires ? (
          <p className="text-xs text-white/80 mt-1">Renews / expires {expires}</p>
        ) : null}

        {!isMembership && (quarterly || annual) ? (
          <p className="text-[11px] text-white/70 mt-0.5">
            {quarterly ? `£${activePlan.quarterlyPrice}/quarter` : ''}
            {quarterly && annual ? ' · ' : ''}
            {annual ? `£${activePlan.annualPrice}/year` : ''}
          </p>
        ) : null}

        {capabilities?.allowed && (capabilities.source === 'plan' || capabilities.source === 'access_pass') && capabilities.variantName ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">
              {capabilities.variantName}
            </span>
            {capabilities.durationDays ? (
              <span className="text-[10px] text-white/70">{capabilities.durationDays} days of access</span>
            ) : null}
          </div>
        ) : null}

        {(activePlan.features && activePlan.features.length > 0) || Object.keys(quotas).length > 0 ? (
          <div className="mt-4 space-y-1.5">
            {activePlan.features?.slice(0, 6).map((f) => (
              <p key={f} className="text-sm text-white/90 flex items-start gap-2">
                <span className="text-white mt-0.5">✓</span>
                {f}
              </p>
            ))}
            {Object.entries(quotas)
              .slice(0, 4)
              .map(([key, value]) => (
                <p key={key} className="text-xs text-white/75 flex items-start gap-2">
                  <span className="text-white/60 mt-0.5">•</span>
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value === -1 ? 'Unlimited' : String(value)}
                  </span>
                </p>
              ))}
            {Object.entries(featureFlags)
              .filter(([, v]) => v === true)
              .slice(0, 3)
              .map(([key]) => (
                <p key={key} className="text-xs text-white/75 flex items-start gap-2">
                  <span className="text-white/60 mt-0.5">•</span>
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} enabled</span>
                </p>
              ))}
          </div>
        ) : null}

        {capabilities?.allowed && (capabilities.source === 'plan' || capabilities.source === 'access_pass') && Object.keys(capabilities.capabilities).length > 0 ? (
          <div className="mt-4 rounded-xl bg-white/10 border border-white/15 p-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-white/60 font-bold">
              {capabilities.source === 'access_pass' ? 'Your access pass' : 'Your variant access'}
            </p>
            {Object.values(capabilities.capabilities).slice(0, 5).map((capability) => (
              <p key={capability.key} className="text-xs text-white/85 flex items-center justify-between gap-3">
                <span className="capitalize">{capability.key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-semibold">
                  {capability.mode === 'disabled'
                    ? 'Not included'
                    : capability.mode === 'limited'
                      ? `${capability.limit} max`
                      : 'Unlimited'}
                </span>
              </p>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Link
            to="/plans"
            className="flex-1 py-3 min-h-[44px] rounded-xl bg-white text-orange-600 text-sm font-bold text-center hover:opacity-95 transition-all"
          >
            {isMembership || isTrial ? 'Add a plan' : 'Upgrade'}
          </Link>
          <Link
            to="/b/membership"
            className="flex-1 py-3 min-h-[44px] rounded-xl bg-orange-800/40 border border-white/30 text-white text-sm font-bold text-center hover:opacity-95 transition-all"
          >
            Details
          </Link>
        </div>
      </div>

      {isTrial && tasks.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Trial programme tasks</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Complete these tasks during your trial to get the most out of MCOM VCard.
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-200/70 dark:bg-amber-800/60 text-[11px] font-bold text-amber-900 dark:text-amber-100">
              {tasks.length} task{tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-white/70 dark:bg-gray-900/30 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                    {task.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-amber-700 dark:text-amber-300">
                  {task.deadlineDays > 0 && <span>Due within {task.deadlineDays} days</span>}
                  {task.rewardPoints > 0 && <span>+{task.rewardPoints} points</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
