import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'

const statusColors: Record<string, string> = {
  available: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  redeemed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  expired: 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

export default function ConsumerRewardsPage() {
  const [rewards, setRewards] = useState<Array<{ id: number; reward: string; points: number; date: string; status: string }>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    consumerService.getRewardHistory().then(setRewards).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? rewards : rewards.filter((r) => r.status === filter)

  const counts = {
    all: rewards.length,
    available: rewards.filter((r) => r.status === 'available').length,
    redeemed: rewards.filter((r) => r.status === 'redeemed').length,
    expired: rewards.filter((r) => r.status === 'expired').length,
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <Helmet><title>Rewards - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Rewards</h1>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { key: 'all', label: 'All', value: counts.all, color: 'text-gray-900' },
          { key: 'available', label: 'Available', value: counts.available, color: 'text-green-600' },
          { key: 'redeemed', label: 'Redeemed', value: counts.redeemed, color: 'text-blue-600' },
          { key: 'expired', label: 'Expired', value: counts.expired, color: 'text-gray-400' },
        ].map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-4 text-left transition-all ${
              filter === s.key ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
            }`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400 text-sm">
            No {filter === 'all' ? '' : filter} rewards found
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  r.status === 'available' ? 'bg-green-50 dark:bg-green-900/20' : r.status === 'redeemed' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}>
                  <svg className={`w-5 h-5 ${
                    r.status === 'available' ? 'text-green-600 dark:text-green-400' : r.status === 'redeemed' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.reward}</p>
                  <p className="text-xs text-gray-500">{r.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-orange-600">{r.points.toLocaleString()} pts</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColors[r.status] || ''}`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
