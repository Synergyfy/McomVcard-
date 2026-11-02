import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { accessPassesService, type AccessPass } from '../../../services/accessPasses'
import { PLAN_CAPABILITY_LABELS } from '../../../services/planCapabilitySchema'

function capabilityLabel(key: string): string {
  return (
    PLAN_CAPABILITY_LABELS[key] ??
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()).trim()
  )
}

function quotaLabel(value: number | boolean): string {
  if (value === -1 || value === true) return 'Unlimited'
  if (value === false || value === 0) return 'Disabled'
  return String(value)
}

function currencySymbol(currency?: string): string {
  return currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
}

function durationLabel(days: number): string {
  if (days >= 365 && days % 365 === 0) return days === 365 ? '1 year' : `${days / 365} years`
  return `${days} days`
}

export default function AccessPassDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [pass, setPass] = useState<AccessPass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    accessPassesService
      .get(id)
      .then(setPass)
      .catch(() => navigate('/admin/access-passes'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleToggleStatus = async () => {
    if (!pass) return
    try {
      const updated = await accessPassesService.update(pass.id, {
        status: pass.status === 'active' ? 'inactive' : 'active',
      })
      setPass(updated)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update the access pass.')
    }
  }

  const handleDuplicate = async () => {
    if (!pass) return
    try {
      const created = await accessPassesService.create({
        name: `${pass.name} (Copy)`,
        description: pass.description,
        price: pass.price,
        durationDays: pass.durationDays,
        currency: pass.currency,
        status: 'inactive',
        features: pass.features,
        configuration: pass.configuration ?? undefined,
        stripePriceId: pass.stripePriceId ?? undefined,
        paypalPlanId: pass.paypalPlanId ?? undefined,
        popular: false,
      })
      navigate(`/admin/access-passes/${created.id}/edit`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not duplicate the access pass.')
    }
  }

  const handleDelete = async () => {
    if (!pass || !confirm('Delete this access pass? Purchases will also be removed.')) return
    try {
      await accessPassesService.remove(pass.id)
      navigate('/admin/access-passes')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not delete the access pass.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (!pass) return null

  const symbol = currencySymbol(pass.currency)
  const quotas = pass.configuration?.quotas ?? {}
  const featureFlags = pass.configuration?.featureFlags ?? {}
  const enabledFeatures = Object.entries(featureFlags).filter(([, value]) => value === true)

  return (
    <div className="max-w-5xl">
      <Helmet><title>{pass.name} - Access Passes - Mobile VCard Link</title></Helmet>

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/access-passes" className="transition-colors hover:text-orange-600">
          Access Passes
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900 dark:text-white">{pass.name}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{pass.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pass.status === 'active' ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
                {pass.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              {pass.popular && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">Popular</span>
              )}
            </div>
            <p className="max-w-2xl text-sm text-blue-100">{pass.description || 'No description'}</p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black">{symbol}{pass.price.toLocaleString()}</span>
              <span className="text-sm font-semibold text-blue-100">for {durationLabel(pass.durationDays)}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/admin/access-passes/${pass.id}/edit`}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDuplicate}
              className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/25"
            >
              Duplicate
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
            Included features
          </h2>
          {(pass.features ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No features configured.</p>
          ) : (
            <ul className="space-y-2">
              {pass.features.map((feature, index) => (
                <li key={`${feature.text}-${index}`} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-0.5 text-green-500">✓</span>
                  <span>
                    {feature.text}
                    {feature.description && <span className="block text-[11px] text-gray-400">{feature.description}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
            Access & limits
          </h2>
          <div className="space-y-1 text-xs">
            {Object.keys(quotas).length === 0 && enabledFeatures.length === 0 ? (
              <p className="text-sm text-gray-400">No capabilities configured.</p>
            ) : (
              <>
                {Object.entries(quotas).map(([key, value]) => (
                  <div key={`q-${key}`} className="flex justify-between gap-2 border-b border-gray-50 py-1.5 dark:border-gray-700/50">
                    <span className="text-gray-500">{capabilityLabel(key)}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{quotaLabel(value)}</span>
                  </div>
                ))}
                {Object.entries(featureFlags).map(([key, value]) => (
                  <div key={`f-${key}`} className="flex justify-between gap-2 border-b border-gray-50 py-1.5 dark:border-gray-700/50">
                    <span className="text-gray-500">{capabilityLabel(key)}</span>
                    <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
                      {value ? 'Included' : 'Not included'}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleStatus}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {pass.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-lg bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          Delete access pass
        </button>
      </div>
    </div>
  )
}
