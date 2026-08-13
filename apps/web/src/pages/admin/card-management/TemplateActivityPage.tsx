import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ACTIVITY = [
  { action: 'Template created', template: 'Gold Consumer Card', type: 'Consumer Card', by: 'Admin', time: '2 hours ago', detail: 'Created from scratch' },
  { action: 'Template edited', template: 'Standard Business VCard', type: 'Business VCard', by: 'Admin', time: '5 hours ago', detail: 'Updated header block' },
  { action: 'Template published', template: 'Modern Café VCard', type: 'Business VCard', by: 'Admin', time: '1 day ago', detail: 'Published to production' },
  { action: 'Template unpublished', template: 'Legacy Consumer VCard', type: 'Consumer VCard', by: 'Admin', time: '2 days ago', detail: 'Replaced by v2' },
  { action: 'Template archived', template: 'Event Planner VCard', type: 'Business VCard', by: 'Admin', time: '3 days ago', detail: 'No longer in use' },
  { action: 'Template assigned', template: 'Standard Business VCard', type: 'Business VCard', by: 'Admin', time: '4 days ago', detail: 'Assigned to GreenLeaf Coffee' },
  { action: 'QR content updated', template: 'Enterprise Pro VCard', type: 'Business VCard', by: 'System', time: '5 days ago', detail: 'Seasonal content refresh' },
  { action: 'Template version created', template: 'Gold Tier Consumer VCard', type: 'Consumer VCard', by: 'Admin', time: '1 week ago', detail: 'Version v2.1 saved' },
  { action: 'Template duplicated', template: 'Fitness Studio VCard', type: 'Business VCard', by: 'Admin', time: '1 week ago', detail: 'Cloned from Standard BV' },
  { action: 'Template restored', template: 'Legacy Consumer VCard', type: 'Consumer VCard', by: 'Admin', time: '2 weeks ago', detail: 'Restored from archive' },
]

const ACTIONS = ['All', 'Created', 'Edited', 'Published', 'Unpublished', 'Archived', 'Assigned', 'QR Update', 'Version', 'Duplicated', 'Restored']

export default function TemplateActivityPage() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? ACTIVITY : ACTIVITY.filter(a => a.action.toLowerCase().includes(filter.toLowerCase().replace(' ', '')))

  return (
    <div className="space-y-6">
      <Helmet><title>Template Activity - VCard Management - MCOM VCard</title></Helmet>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Template Activity</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Complete audit trail of template-related actions across VCard Management.</p>
          </div>
          <button onClick={() => toast.success('Activity log exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Export Log</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ACTIONS.map(a => (
            <button key={a} onClick={() => setFilter(a)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${filter === a ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>{a}</button>
          ))}
        </div>
        <div className="space-y-0">
          {filtered.map((a, i) => {
            const dotMap: Record<string, string> = { created: 'bg-green-400', edited: 'bg-blue-400', published: 'bg-emerald-400', unpublished: 'bg-amber-400', archived: 'bg-gray-400', assigned: 'bg-purple-400', 'qr update': 'bg-teal-400', version: 'bg-indigo-400', duplicated: 'bg-orange-400', restored: 'bg-cyan-400' }
            const key = a.action.toLowerCase().split(' ')[0]
            return (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-2.5 h-2.5 rounded-full ${dotMap[key] || 'bg-gray-400'} mt-1 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{a.action}</span>
                    <span className="text-[11px] text-gray-500">—</span>
                    <span className="text-[11px] text-orange-600 font-medium">{a.template}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[9px] font-medium">{a.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                    <span>by {a.by}</span>
                    <span>·</span>
                    <span>{a.time}</span>
                    <span>·</span>
                    <span>{a.detail}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && <div className="text-center py-8"><p className="text-xs text-gray-500">No matching activity</p></div>}
      </div>
    </div>
  )
}
