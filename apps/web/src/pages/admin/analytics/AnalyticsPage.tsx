import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import StatsCard from '../../../components/admin/StatsCard'

const MONTHLY = [
  { month: 'Jan', views: 12000, scans: 3400, redemptions: 890, revenue: 8200, users: 450, signups: 320 },
  { month: 'Feb', views: 14500, scans: 4200, redemptions: 1100, revenue: 9400, users: 520, signups: 380 },
  { month: 'Mar', views: 16800, scans: 5100, redemptions: 1350, revenue: 10800, users: 610, signups: 440 },
  { month: 'Apr', views: 19200, scans: 5800, redemptions: 1500, revenue: 12400, users: 690, signups: 490 },
  { month: 'May', views: 17500, scans: 5300, redemptions: 1400, revenue: 11500, users: 650, signups: 460 },
  { month: 'Jun', views: 21000, scans: 6400, redemptions: 1700, revenue: 14200, users: 760, signups: 530 },
  { month: 'Jul', views: 23800, scans: 7200, redemptions: 1900, revenue: 15600, users: 840, signups: 590 },
]

const DEVICES = [
  { device: 'Mobile', percentage: 68, count: 84500, color: 'bg-blue-500' },
  { device: 'Desktop', percentage: 22, count: 27400, color: 'bg-green-500' },
  { device: 'Tablet', percentage: 7, count: 8700, color: 'bg-purple-500' },
  { device: 'Other', percentage: 3, count: 3700, color: 'bg-amber-500' },
]

const TOP_CAMPAIGNS = [
  { name: 'Summer Sale 2026', type: 'Seasonal', reach: 28400, conversions: 1840, roi: 320, status: 'active' },
  { name: 'Referral Bonus Q3', type: 'Referral', reach: 15200, conversions: 980, roi: 285, status: 'active' },
  { name: 'New User Welcome', type: 'Gift', reach: 32100, conversions: 2100, roi: 410, status: 'active' },
  { name: 'Flash Friday Deals', type: 'Seasonal', reach: 18900, conversions: 1230, roi: 178, status: 'ended' },
  { name: 'QR Code Hunt', type: 'QR', reach: 9800, conversions: 670, roi: 245, status: 'active' },
]

const REFERRAL_SOURCES = [
  { source: 'Direct', percentage: 35, color: 'bg-blue-500' },
  { source: 'Social Media', percentage: 28, color: 'bg-green-500' },
  { source: 'Referral', percentage: 18, color: 'bg-purple-500' },
  { source: 'Email', percentage: 12, color: 'bg-orange-500' },
  { source: 'Other', percentage: 7, color: 'bg-gray-400' },
]

const LOCATIONS = [
  { country: 'United States', visits: 45200, percentage: 36 },
  { country: 'United Kingdom', visits: 18200, percentage: 15 },
  { country: 'Germany', visits: 12400, percentage: 10 },
  { country: 'Canada', visits: 9800, percentage: 8 },
  { country: 'Australia', visits: 7200, percentage: 6 },
  { country: 'Others', visits: 31600, percentage: 25 },
]

const maxViews = Math.max(...MONTHLY.map((m) => m.views))
const maxScans = Math.max(...MONTHLY.map((m) => m.scans))
const maxRedeem = Math.max(...MONTHLY.map((m) => m.redemptions))


export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d')
  return (
    <div className="space-y-6">
      <Helmet><title>Analytics - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform-wide metrics and insights</p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          {['24h', '7d', '30d', '90d', '1y'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Card Views" value="124,560" color="blue" subtitle="+12.5% vs last period" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
        <StatsCard title="QR Scans" value="37,400" color="green" subtitle="+8.3% vs last period" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>} />
        <StatsCard title="Redemptions" value="9,840" color="purple" subtitle="+15.2% vs last period" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        <StatsCard title="Conversion Rate" value="7.9%" color="orange" subtitle="+1.2% vs last period" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12,480</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active Users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3,240</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Businesses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">8,760</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Consumers</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">4m 32s</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Avg Session Duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Card Views & Scans</h2>
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-end gap-2">
              {MONTHLY.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '100%' }}>
                    <div className="w-1/3 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(m.views / maxViews) * 100}%` }} title={`Views: ${m.views.toLocaleString()}`} />
                    <div className="w-1/3 bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(m.scans / maxScans) * 100}%` }} title={`Scans: ${m.scans.toLocaleString()}`} />
                    <div className="w-1/3 bg-purple-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(m.redemptions / maxRedeem) * 100}%` }} title={`Redemptions: ${m.redemptions.toLocaleString()}`} />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500" /> Views</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> Scans</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500" /> Redemptions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Breakdown</h2>
          <div className="space-y-4">
            {DEVICES.map((d) => (
              <div key={d.device}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{d.device}</span>
                  <span className="text-gray-500 dark:text-gray-400">{d.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${d.color} h-2 rounded-full transition-all`} style={{ width: `${d.percentage}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{d.count.toLocaleString()} visits</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-end gap-2">
              {MONTHLY.map((m) => {
                const maxRev = Math.max(...MONTHLY.map((x) => x.revenue))
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-[70%] bg-orange-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(m.revenue / maxRev) * 100}%` }} title={`Revenue: £${m.revenue.toLocaleString()}`} />
                    <span className="text-[10px] text-gray-400 mt-1">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Referral Sources</h2>
          <div className="space-y-4">
            {REFERRAL_SOURCES.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{s.source}</span>
                  <span className="text-gray-500 dark:text-gray-400">{s.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${s.color} h-2 rounded-full transition-all`} style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h2>
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-end gap-2">
              {MONTHLY.map((m) => {
                const maxU = Math.max(...MONTHLY.map((x) => x.users))
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-[70%] bg-teal-500 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(m.users / maxU) * 100}%` }} title={`Users: ${m.users.toLocaleString()}`} />
                    <span className="text-[10px] text-gray-400 mt-1">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500" /> Total Users</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cyan-500" /> New Signups</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Geographic Distribution</h2>
          <div className="space-y-3">
            {LOCATIONS.map((loc) => (
              <div key={loc.country}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{loc.country}</span>
                  <span className="text-gray-500 dark:text-gray-400">{loc.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${loc.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Campaigns</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reach</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ROI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {TOP_CAMPAIGNS.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.reach.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.conversions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm"><span className="text-green-600 font-medium">{c.roi}%</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
