import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/user'
import { mockVCardViewStats, mockVcards, mockAdminBookings } from '../../services/mockData'
import type { UserDashboardStats, VCard } from '../../types'
import VCardPreviewModal from '../../components/common/VCardPreviewModal'

const BUSINESS_ID = 1

const QUICK_ACTIONS = [
  { label: 'Manage vCards', to: '/user/vcards', color: 'blue', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0' },
  { label: 'Browse Templates', to: '/user/templates', color: 'purple', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { label: 'My Cards', to: '/user/cards', color: 'orange', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { label: 'Appointments', to: '/user/appointments', color: 'green', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Analytics', to: '/user/analytics', color: 'pink', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Subscription', to: '/user/subscription', color: 'teal', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600', ring: 'ring-blue-100 dark:ring-blue-800/30' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600', ring: 'ring-purple-100 dark:ring-purple-800/30' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600', ring: 'ring-orange-100 dark:ring-orange-800/30' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600', ring: 'ring-green-100 dark:ring-green-800/30' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', icon: 'text-pink-600', ring: 'ring-pink-100 dark:ring-pink-800/30' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'text-teal-600', ring: 'ring-teal-100 dark:ring-teal-800/30' },
}

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewVcard, setPreviewVcard] = useState<VCard | null>(null)

  useEffect(() => {
    userService.getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const vcardStats = mockVCardViewStats.find((s) => s.business_id === BUSINESS_ID)
  const myVcards = mockVcards.filter((v) => v.user_id === BUSINESS_ID)
  const myBookings = mockAdminBookings.filter((b) => b.business_id === BUSINESS_ID)
  const pendingBookings = myBookings.filter((b) => b.status === 'pending')
  const confirmedBookings = myBookings.filter((b) => b.status === 'confirmed')
  const completedBookings = myBookings.filter((b) => b.status === 'completed')
  const totalRevenue = myBookings.reduce((a, b) => a + (b.amount || 0), 0)

  const pieData = [
    { label: 'Pending', value: pendingBookings.length, color: '#F59E0B' },
    { label: 'Confirmed', value: confirmedBookings.length, color: '#10B981' },
    { label: 'Completed', value: completedBookings.length, color: '#3B82F6' },
    { label: 'Cancelled', value: myBookings.filter((b) => b.status === 'cancelled').length, color: '#EF4444' },
  ]
  const pieTotal = pieData.reduce((a, d) => a + d.value, 0)

  return (
    <div>
      <Helmet><title>Dashboard - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0] || 'Business'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your digital cards</p>
        </div>
        <Link to="/user/vcards/create" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Create vCard
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stats Cards with colors ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                </div>
                <span className="text-xs text-white/60">+2 this month</span>
              </div>
              <p className="text-3xl font-bold">{stats?.total_vcards ?? 0}</p>
              <p className="text-xs text-white/70 mt-1">My vCards</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-green-200 dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <span className="text-xs text-white/60">{vcardStats?.views_today ?? 0} today</span>
              </div>
              <p className="text-3xl font-bold">{vcardStats?.total_views?.toLocaleString() ?? 0}</p>
              <p className="text-xs text-white/70 mt-1">Total Views</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white shadow-lg shadow-purple-200 dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs text-white/60">Revenue</span>
              </div>
              <p className="text-3xl font-bold">£{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Booking Revenue</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg shadow-orange-200 dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-xs text-white/60">{pendingBookings.length} pending</span>
              </div>
              <p className="text-3xl font-bold">{myBookings.length}</p>
              <p className="text-xs text-white/70 mt-1">Total Bookings</p>
            </div>
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart — Views */}
            {vcardStats && (
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Views</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{vcardStats.views_this_week} this week · {vcardStats.unique_visitors} unique visitors</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{vcardStats.total_views.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">avg. {vcardStats.avg_time_spent} spent</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {vcardStats.daily_views.map((d, i) => {
                    const max = Math.max(...vcardStats.daily_views.map((x) => x.count))
                    const h = (d.count / max) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{d.count}</span>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 hover:from-blue-700 hover:to-blue-500" style={{ height: `${h}%` }} />
                        <span className="text-[10px] text-gray-400">{d.date.split(' ')[1]}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {vcardStats.top_locations.slice(0, 3).map((loc, i) => (
                    <span key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />{loc.country}: {loc.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pie Chart — Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Booking Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{myBookings.length} total bookings</p>
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 100 100" className="w-36 h-36">
                  {(() => {
                    let cumulative = 0
                    return pieData.filter((d) => d.value > 0).map((d, i) => {
                      const pct = (d.value / pieTotal) * 100
                      const dashArray = `${pct} ${100 - pct}`
                      const dashOffset = `${-cumulative}`
                      cumulative += pct
                      return <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={d.color} strokeWidth="12" strokeDasharray={dashArray} strokeDashoffset={dashOffset} className="transition-all duration-700" />
                    })
                  })()}
                  <text x="50" y="48" textAnchor="middle" className="fill-gray-900 dark:fill-white text-[14px] font-bold">{pieTotal}</text>
                  <text x="50" y="58" textAnchor="middle" className="fill-gray-400 text-[6px]">bookings</text>
                </svg>
              </div>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map((a) => {
                const c = colorMap[a.color]
                return (
                  <Link key={a.to} to={a.to} className={`${c.bg} rounded-xl p-4 hover:shadow-md transition-all ring-1 ${c.ring}`}>
                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-2 ring-1 ${c.ring}`}>
                      <svg className={`w-5 h-5 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.label}</p>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── My vCards + Recent Bookings ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My vCards</h2>
                <Link to="/user/vcards" className="text-sm text-orange-600 hover:text-orange-700 font-medium">View All</Link>
              </div>
              {myVcards.length ? (
                <div className="space-y-3">
                  {myVcards.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <Link to={`/user/vcards/${v.id}/edit`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{v.name.charAt(0)}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{v.name}</p>
                          <p className="text-xs text-gray-400 truncate">/{v.url_slug}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {v.status ? 'Active' : 'Inactive'}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); setPreviewVcard(v); }} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Preview">
                          <svg className="w-3.5 h-3.5 text-gray-400 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No vCards yet</p>
                  <Link to="/user/vcards/create" className="text-sm text-orange-600 hover:text-orange-700 font-medium">Create your first vCard</Link>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
                <Link to="/user/appointments" className="text-sm text-orange-600 hover:text-orange-700 font-medium">View All</Link>
              </div>
              {myBookings.slice(0, 5).length ? (
                <div className="space-y-3">
                  {myBookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                          {b.customer_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer_name}</p>
                          <p className="text-xs text-gray-400">{b.type} · {b.date} {b.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          b.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          b.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>{b.status}</span>
                        {b.amount ? <p className="text-xs text-gray-500 mt-1">£{b.amount}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <VCardPreviewModal vcard={previewVcard} onClose={() => setPreviewVcard(null)} />
    </div>
  )
}
