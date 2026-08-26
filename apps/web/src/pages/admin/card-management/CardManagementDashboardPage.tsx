import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const KPIS = [
  { label: 'Total Templates', value: '44', sub: '12 BV · 14 BC · 8 CV · 10 CC', color: 'text-gray-900 dark:text-white' },
  { label: 'Published', value: '32', sub: '73% of all templates', color: 'text-green-600' },
  { label: 'Draft', value: '8', sub: 'Awaiting publication', color: 'text-amber-600' },
  { label: 'Archived', value: '4', sub: '9% of all templates', color: 'text-gray-500' },
  { label: 'Businesses Using', value: '12', sub: '18 templates in use', color: 'text-blue-600' },
  { label: 'Consumers Using', value: '10', sub: '22 templates in use', color: 'text-purple-600' },
  { label: 'Dynamic QR', value: '18', sub: '41% of templates', color: 'text-teal-600' },
  { label: 'Membership-Aware', value: '12', sub: 'Tier-gated content', color: 'text-emerald-600' },
  { label: 'International', value: '6', sub: 'Multi-language config', color: 'text-indigo-600' },
  { label: 'Password Protected', value: '9', sub: 'Restricted sections', color: 'text-red-600' },
]

const RECENT = [
  { name: 'Modern Café VCard', type: 'Business VCard', by: 'Admin', date: '2 hours ago', status: 'Published' },
  { name: 'Gold Consumer Card', type: 'Consumer Card', by: 'Admin', date: '5 hours ago', status: 'Draft' },
  { name: 'Enterprise Business Card', type: 'Business Card', by: 'Admin', date: '1 day ago', status: 'Published' },
  { name: 'Platinum Pro VCard', type: 'Consumer VCard', by: 'Admin', date: '2 days ago', status: 'Draft' },
  { name: 'Seasonal Campaign VCard', type: 'Business VCard', by: 'Admin', date: '3 days ago', status: 'Published' },
]

const POPULAR = [
  { name: 'Standard Business VCard', assignments: 8, scans: 12400, shares: 3400, engagement: 92 },
  { name: 'Premium Consumer Card', assignments: 6, scans: 9800, shares: 2800, engagement: 88 },
  { name: 'Modern Café VCard', assignments: 5, scans: 7200, shares: 2100, engagement: 85 },
  { name: 'Gold Business Card', assignments: 4, scans: 5600, shares: 1800, engagement: 81 },
]

const PENDING = [
  { name: 'Gold Consumer Card', type: 'Consumer Card', updated: '5 hours ago' },
  { name: 'Platinum Pro VCard', type: 'Consumer VCard', updated: '2 days ago' },
  { name: 'Boutique Hotel VCard', type: 'Business VCard', updated: '4 days ago' },
]

export default function CardManagementDashboardPage() {
  return (
    <div className="space-y-6">
      <Helmet><title>Card Management Dashboard - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Card Management Dashboard</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Central workspace for template creation, publishing, distribution, and governance across the MCOM platform.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/card-management/template-builder" className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Template</Link>
            <Link to="/admin/card-management/assignment" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Assign Templates</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{k.label}</p>
            <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Recently Modified Templates</h4>
          <div className="space-y-0">
            {RECENT.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'Published' ? 'bg-green-400' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{r.name}</p>
                  <p className="text-[9px] text-gray-400">{r.type} · by {r.by} · {r.date}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${r.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>{r.status}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/card-management/activity" className="mt-3 block w-full text-center px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View All Activity →</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Most Used Templates</h4>
          <div className="space-y-0">
            {POPULAR.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-500 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{p.name}</p>
                  <p className="text-[9px] text-gray-400">{p.assignments} assignments · {p.scans.toLocaleString()} scans</p>
                </div>
                <span className="text-[10px] font-medium text-green-600">{p.engagement}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <p className="text-[9px] text-gray-500">Ranked by assignments, QR scans, shares, and consumer engagement.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Awaiting Publication</h4>
          {PENDING.length === 0 ? (
            <p className="text-[10px] text-gray-400 text-center py-4">No draft templates awaiting publication.</p>
          ) : (
            <div className="space-y-2">
              {PENDING.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-700 dark:text-gray-300">{p.name}</p>
                    <p className="text-[9px] text-gray-400">{p.type} · {p.updated}</p>
                  </div>
                  <button onClick={() => toast.success(`Publishing ${p.name}`)} className="text-[9px] text-orange-600 hover:underline shrink-0">Publish</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Template Version History</h4>
          {[
            { name: 'Standard Business VCard', version: 'v3.2', date: 'Today' },
            { name: 'Premium Consumer Card', version: 'v2.8', date: 'Yesterday' },
            { name: 'Modern Café VCard', version: 'v4.1', date: '3 days ago' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-700 dark:text-gray-300">{v.name}</p>
                <p className="text-[9px] text-gray-400">{v.version} · {v.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Integration Status</h4>
          <div className="space-y-2">
            {[
              { name: 'MCOM Solutions', status: 'Connected', dot: 'bg-green-500' },
              { name: 'MCOM Rewards', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
              { name: 'Cashback', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
              { name: 'FundOrDonate', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
              { name: 'MCOM Spin', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-2.5 py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span className={`w-2 h-2 rounded-full ${p.dot} shrink-0`} />
                <span className="text-[11px] text-gray-700 dark:text-gray-300 flex-1">{p.name}</span>
                <span className={`text-[10px] font-medium ${p.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
