import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ActionDropdown from '../../../components/common/ActionDropdown'
import {
  accessPassesService,
  type AccessPass,
  type AccessPassPayload,
} from '../../../services/accessPasses'

function currencySymbol(currency?: string): string {
  return currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
}

function durationLabel(days: number): string {
  if (days >= 365 && days % 365 === 0) return days === 365 ? '1 year' : `${days / 365} years`
  return `${days} days`
}

export default function AccessPassListPage() {
  const navigate = useNavigate()
  const [passes, setPasses] = useState<AccessPass[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    accessPassesService
      .list()
      .then(setPasses)
      .catch(() => setError('Could not load access passes. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this access pass? Purchases will also be removed.')) return
    try {
      await accessPassesService.remove(id)
      setPasses((current) => current.filter((pass) => pass.id !== id))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not delete the access pass.')
    }
  }

  const handleToggleStatus = async (pass: AccessPass) => {
    const nextStatus = pass.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await accessPassesService.update(pass.id, { status: nextStatus })
      setPasses((current) => current.map((item) => (item.id === pass.id ? updated : item)))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update the access pass.')
    }
  }

  const handleDuplicate = async (pass: AccessPass) => {
    const payload: AccessPassPayload = {
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
    }

    try {
      const created = await accessPassesService.create(payload)
      setPasses((current) => [...current, created])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not duplicate the access pass.')
    }
  }

  const filtered = passes.filter((pass) => {
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      pass.name.toLowerCase().includes(q) ||
      (pass.description ?? '').toLowerCase().includes(q)
    const matchStatus = status === 'all' || pass.status === status
    return matchSearch && matchStatus
  })

  const activeCount = passes.filter((pass) => pass.status === 'active').length

  return (
    <div>
      <Helmet><title>Access Passes - Mobile VCard Link</title></Helmet>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Passes</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            One-off passes that grant configured features for a fixed number of days.
          </p>
        </div>
        <Link
          to="/admin/access-passes/create"
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add access pass
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wider text-gray-500">Total passes</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{passes.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wider text-gray-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wider text-gray-500">Durations</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {new Set(passes.map((pass) => pass.durationDays)).size}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4 dark:border-gray-700">
          <div className="relative min-w-[200px] flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search access passes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No access passes yet. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Access pass</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((pass) => {
                  const symbol = currencySymbol(pass.currency)
                  return (
                    <tr
                      key={pass.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      onClick={() => navigate(`/admin/access-passes/${pass.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                            {pass.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pass.name}
                              {pass.popular && (
                                <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                  Popular
                                </span>
                              )}
                            </p>
                            <p className="line-clamp-1 max-w-[320px] text-[11px] text-gray-400">
                              {pass.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {symbol}{pass.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {durationLabel(pass.durationDays)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          pass.status === 'active'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {pass.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown
                          actions={[
                            { label: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick: () => navigate(`/admin/access-passes/${pass.id}`) },
                            { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/admin/access-passes/${pass.id}/edit`) },
                            { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => handleDuplicate(pass) },
                            { divider: true },
                            { label: pass.status === 'active' ? 'Deactivate' : 'Activate', icon: pass.status === 'active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => handleToggleStatus(pass) },
                            { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(pass.id) },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
