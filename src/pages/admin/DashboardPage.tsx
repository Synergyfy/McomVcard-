import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import StatsCard from '../../components/admin/StatsCard'

const MOCK = {
  revenue: { total: 128450, prev: 98400, growth: 30.5 },
  active_businesses: 384,
  active_consumers: 8642,
  total_vcards: 12560,
  nfc_devices: 1247,
  wallet_txns: 8920,
  campaigns_running: 18,
  print_orders: 43,
  revenue_chart: [
    { month: 'Jan', revenue: 8200, businesses: 10, consumers: 180 },
    { month: 'Feb', revenue: 9400, businesses: 14, consumers: 220 },
    { month: 'Mar', revenue: 10800, businesses: 18, consumers: 290 },
    { month: 'Apr', revenue: 12400, businesses: 22, consumers: 340 },
    { month: 'May', revenue: 11500, businesses: 20, consumers: 310 },
    { month: 'Jun', revenue: 14200, businesses: 28, consumers: 420 },
    { month: 'Jul', revenue: 15600, businesses: 32, consumers: 480 },
    { month: 'Aug', revenue: 13800, businesses: 30, consumers: 450 },
    { month: 'Sep', revenue: 16200, businesses: 36, consumers: 510 },
    { month: 'Oct', revenue: 18500, businesses: 40, consumers: 590 },
    { month: 'Nov', revenue: 17200, businesses: 38, consumers: 560 },
    { month: 'Dec', revenue: 20650, businesses: 46, consumers: 670 },
  ],
  plan_distribution: [
    { name: 'Free', count: 5200, color: '#94a3b8' },
    { name: 'Starter', count: 2100, color: '#3b82f6' },
    { name: 'Business', count: 890, color: '#f59e0b' },
    { name: 'Enterprise', count: 312, color: '#10b981' },
    { name: 'Premium NFC', count: 140, color: '#8b5cf6' },
  ],
  recent_activity: [
    { user: 'GreenLeaf Coffee', action: 'activated NFC bundle (50 tags)', time: '12 min ago', type: 'business' },
    { user: 'Emma Rodriguez', action: 'redeemed loyalty reward ($15)', time: '28 min ago', type: 'consumer' },
    { user: 'TechVision Inc', action: 'launched summer campaign', time: '1 hour ago', type: 'business' },
    { user: 'James Chen', action: 'created digital business card', time: '2 hours ago', type: 'consumer' },
    { user: 'Pizza Roma', action: 'upgraded to Business plan', time: '3 hours ago', type: 'business' },
    { user: 'Sarah Wilson', action: 'completed NFC tap & connect', time: '4 hours ago', type: 'consumer' },
    { user: 'FitLife Studio', action: 'placed print order (500 cards)', time: '6 hours ago', type: 'business' },
    { user: 'Mike Patel', action: 'earned bronze badge level', time: '8 hours ago', type: 'consumer' },
  ],
}

const PLAN_TOTAL = MOCK.plan_distribution.reduce((s, p) => s + p.count, 0)
const PIE_SEGMENTS = MOCK.plan_distribution.map((p) => ({
  ...p,
  percentage: (p.count / PLAN_TOTAL) * 100,
}))
let cumPct = 0
const PIE_CONIC = PIE_SEGMENTS.map((p) => {
  const start = cumPct
  cumPct += p.percentage
  return `${p.color} ${start}% ${cumPct}%`
}).join(', ')

const maxRev = Math.max(...MOCK.revenue_chart.map((m) => m.revenue))
const maxBiz = Math.max(...MOCK.revenue_chart.map((m) => m.businesses))
const maxCon = Math.max(...MOCK.revenue_chart.map((m) => m.consumers))

export default function AdminDashboardPage() {
  const [stats] = useState(MOCK)
  const period = 'This Month'

  const quickActions = [
    { to: '/admin/users/create', label: 'Add Business', icon: 'M19 7l-7 5-7-5m14 10V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2z', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'hover:border-orange-500' },
    { to: '/admin/templates', label: 'Templates', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'hover:border-purple-500' },
    { to: '/admin/subscribed-plans', label: 'Subscriptions', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'hover:border-green-500' },
    { to: '/admin/front-cms', label: 'Edit CMS', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'hover:border-teal-500' },
    { to: '/admin/plans/create', label: 'New Plan', icon: 'M12 4v16m8-8H4', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'hover:border-blue-500' },
    { to: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'hover:border-gray-500' },
  ]

  return (
    <div className="space-y-6">
      <Helmet><title>Dashboard - MCOM VCard Social Bio</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Your platform at a glance — {period}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">System</span> Online
          </div>
          <Link
            to="/admin/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Switch to</span> Site
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={`£${stats.revenue.total.toLocaleString()}`} color="orange" subtitle={`${stats.revenue.growth > 0 ? '+' : ''}${stats.revenue.growth}% vs last month`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Active Businesses" value={stats.active_businesses.toLocaleString()} color="blue" subtitle="With active subscriptions" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
        <StatsCard title="Active Consumers" value={stats.active_consumers.toLocaleString()} color="green" subtitle="Engaged in last 30 days" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <StatsCard title="Total vCards" value={stats.total_vcards.toLocaleString()} color="purple" subtitle={`${stats.nfc_devices.toLocaleString()} NFC devices active`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>} />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Wallet Transactions" value={stats.wallet_txns.toLocaleString()} color="teal" subtitle="This month" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} />
        <StatsCard title="Campaigns Running" value={stats.campaigns_running} color="pink" subtitle="Across all businesses" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>} />
        <StatsCard title="Print Orders" value={stats.print_orders} color="orange" subtitle="Pending fulfillment" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>} />
        <StatsCard title="Rewards Distributed" value="14,280" color="green" subtitle="Points & cashback" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h2>
          <div className="relative h-52">
            <div className="absolute inset-0 flex items-end gap-2">
              {stats.revenue_chart.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '100%' }}>
                    <div
                      className="w-1/2 bg-orange-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                      title={`Revenue: £${m.revenue.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500" /> Revenue</div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Distribution</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${PIE_CONIC})` }} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {stats.plan_distribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{p.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business & Consumer Growth</h2>
        <div className="relative h-48">
          <div className="absolute inset-0 flex items-end gap-2">
            {stats.revenue_chart.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '100%' }}>
                  <div
                    className="w-1/3 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${(m.businesses / maxBiz) * 100}%` }}
                    title={`Businesses: ${m.businesses}`}
                  />
                  <div
                    className="w-1/3 bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${(m.consumers / maxCon) * 100}%` }}
                    title={`Consumers: ${m.consumers}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500" /> Businesses</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> Consumers</div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 ${action.border} hover:shadow-md transition-all bg-white dark:bg-gray-800/50 group`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} ${action.text} group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">Live</span>
          </div>
          <div className="space-y-0">
            {stats.recent_activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${
                  a.type === 'business'
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                    : 'bg-gradient-to-br from-green-400 to-green-600'
                }`}>
                  {a.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{a.user}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">{a.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.time}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  a.type === 'business'
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                }`}>
                  {a.type === 'business' ? 'Biz' : 'User'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
