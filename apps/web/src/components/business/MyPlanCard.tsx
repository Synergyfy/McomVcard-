import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mcomService, type ActivePlan } from '../../services/mcom'

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

/**
 * "My Plan" card driven by the user's real MCOM VCard plan (`active_plan` from
 * GET /v1/auth/sso/status). Falls back to a helpful empty state when the user
 * has no purchased MCOM package.
 */
export default function MyPlanCard() {
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    mcomService
      .getStatus(true)
      .then((res) => {
        if (cancelled) return
        setActivePlan(res.active_plan ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load your plan. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
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
          Pick a plan to unlock the full VCard suite. Payments are processed securely by MCOM Solutions.
        </p>
        <Link
          to="/b/payment"
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
  const quotas = activePlan.configuration?.quotas ?? {}
  const featureFlags = activePlan.configuration?.featureFlags ?? {}

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/70">Your current plan</p>
        <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wide">
          {activePlan.status === 'active' ? (activePlan.trialDays ? 'Trial' : 'Active') : activePlan.status}
        </span>
      </div>

      <p className="text-2xl font-bold mt-1.5">{activePlan.name}</p>
      <p className="text-xs text-white/80 mt-0.5">{activePlan.level} · VCard business plan</p>

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

      {activePlan.trialDays ? (
        <p className="text-xs text-white/80 mt-1">
          {activePlan.trialDays}-day free trial{expires ? ` · ends ${expires}` : ''}
        </p>
      ) : expires ? (
        <p className="text-xs text-white/80 mt-1">Renews / expires {expires}</p>
      ) : null}

      {quarterly || annual ? (
        <p className="text-[11px] text-white/70 mt-0.5">
          {quarterly ? `£${activePlan.quarterlyPrice}/quarter` : ''}
          {quarterly && annual ? ' · ' : ''}
          {annual ? `£${activePlan.annualPrice}/year` : ''}
        </p>
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

      <div className="mt-5 flex gap-2">
        <Link
          to="/b/payment"
          className="flex-1 py-3 min-h-[44px] rounded-xl bg-white text-orange-600 text-sm font-bold text-center hover:opacity-95 transition-all"
        >
          Upgrade
        </Link>
        <Link
          to="/b/membership"
          className="flex-1 py-3 min-h-[44px] rounded-xl bg-orange-800/40 border border-white/30 text-white text-sm font-bold text-center hover:opacity-95 transition-all"
        >
          Details
        </Link>
      </div>
    </div>
  )
}