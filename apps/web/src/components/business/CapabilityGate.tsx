import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCapabilities } from '../../hooks/useCapabilities'
import { PLAN_CAPABILITY_LABELS } from '../../services/planCapabilitySchema'

/**
 * UI gate for a business-dashboard feature.
 *
 * The API's CapabilityGuard remains authoritative. This component only prevents
 * a business from opening a page/module its current plan variant does not
 * include. If capabilities cannot be loaded (e.g. a legacy membership or a
 * transient API failure) the page is allowed through so existing users are not
 * locked out; the backend still enforces the plan.
 */
export default function CapabilityGate({
  capability,
  children,
}: {
  capability: string
  children: ReactNode
}) {
  const { capabilities, loading, error } = useCapabilities()

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !capabilities || !capabilities.allowed) return <>{children}</>

  const resolved = capabilities.capabilities[capability]
  if (!resolved || resolved.enabled) return <>{children}</>

  const label = PLAN_CAPABILITY_LABELS[capability] ?? capability

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm dark:border-orange-500/30 dark:bg-gray-800">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white">{label} is not included</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Your current plan does not include {label.toLowerCase()}. Upgrade your plan to unlock it.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/plans"
            className="min-h-[44px] rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 dark:shadow-none"
          >
            View plans
          </Link>
          <Link
            to="/b/membership"
            className="min-h-[44px] rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-orange-700 dark:border-orange-500/40 dark:text-orange-300"
          >
            My plan
          </Link>
        </div>
      </div>
    </div>
  )
}
