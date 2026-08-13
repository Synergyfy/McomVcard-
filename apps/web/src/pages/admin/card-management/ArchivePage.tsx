import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ARCHIVED = [
  { id: 1, name: 'Event Planner VCard', type: 'Business VCard', status: 'Archived', archived: '15 Jul 2026', reason: 'No longer in use', usage: 67, businesses: 1 },
  { id: 2, name: 'Legacy Consumer VCard', type: 'Consumer VCard', status: 'Archived', archived: '10 Jul 2026', reason: 'Replaced by v2', usage: 98, consumers: 1 },
  { id: 3, name: 'Agency Partner Card', type: 'Business Card', status: 'Archived', archived: '05 Jul 2026', reason: 'Rebranding', usage: 89, businesses: 1 },
  { id: 4, name: 'Legacy Consumer Card', type: 'Consumer Card', status: 'Archived', archived: '01 Jul 2026', reason: 'Superseded', usage: 76, consumers: 1 },
  { id: 5, name: 'Betty Boop VCard', type: 'Business VCard', status: 'Archived', archived: '20 Jun 2026', reason: 'Template redesign', usage: 45, businesses: 1 },
]

export default function ArchivePage() {
  const [search, setSearch] = useState('')
  const filtered = ARCHIVED.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <Helmet><title>Archive - Card Management - MCOM VCard</title></Helmet>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/card-management" className="text-[10px] text-orange-600 hover:underline">Card Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Archive</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Retired templates stored for reference. Restore or permanently delete (Super Admin only).</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Search archived templates..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 font-medium">Template</th><th className="text-left px-2 py-1.5 font-medium">Type</th><th className="text-left px-2 py-1.5 font-medium">Archived</th><th className="text-left px-2 py-1.5 font-medium">Reason</th><th className="text-right px-2 py-1.5 font-medium">Previous Usage</th><th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{t.name}</td>
                  <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[9px] font-medium">{t.type}</span></td>
                  <td className="px-2 py-1.5 text-gray-500">{t.archived}</td>
                  <td className="px-2 py-1.5 text-gray-500 italic">{t.reason}</td>
                  <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{t.usage.toLocaleString()} ({(t.businesses || 0) + (t.consumers || 0)} entities)</td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <button onClick={() => toast.success(`${t.name} restored from archive`)} className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-medium hover:bg-green-100">Restore</button>
                      <button onClick={() => toast.success(`${t.name} permanently deleted`)} className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-medium hover:bg-red-100">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-8"><p className="text-xs text-gray-500">No archived templates found</p></div>}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Archive Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Archived', value: '5', color: 'text-gray-900 dark:text-white' },
            { label: 'Business VCards', value: '2', color: 'text-blue-600' },
            { label: 'Consumer VCards', value: '1', color: 'text-purple-600' },
            { label: 'Card Templates', value: '2', color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
