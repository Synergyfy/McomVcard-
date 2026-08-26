import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'

const MOCK = [
  { id: 1, batch: 'NFC-Batch-001', assigned: 'GreenLeaf Coffee', type: 'Business', count: 50, activated: 42, status: 'active', created: 'Jan 2026' },
  { id: 2, batch: 'NFC-Batch-002', assigned: 'TechVision Inc', type: 'Enterprise', count: 200, activated: 180, status: 'active', created: 'Feb 2026' },
  { id: 3, batch: 'NFC-Batch-003', assigned: 'FitLife Studio', type: 'Business', count: 30, activated: 25, status: 'active', created: 'Apr 2026' },
  { id: 4, batch: 'NFC-Batch-004', assigned: 'Pizza Roma', type: 'Starter', count: 20, activated: 15, status: 'active', created: 'May 2026' },
  { id: 5, batch: 'NFC-Batch-005', assigned: 'Coastal Realty', type: 'Business', count: 100, activated: 0, status: 'pending', created: 'Jul 2026' },
  { id: 6, batch: 'NFC-Batch-006', assigned: 'Bloom Beauty Salon', type: 'Starter', count: 15, activated: 0, status: 'pending', created: 'Jul 2026' },
]

export default function NFCCardListPage() {
  const [data] = useState(MOCK)
  return (
    <div className="space-y-6">
      <Helmet><title>NFC Cards - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">NFC Cards</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">NFC inventory, assignment & activation — {data.length} batches</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Batches" value={data.length} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
        <StatsCard title="Total Cards" value={data.reduce((s, n) => s + n.count, 0)} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>} />
        <StatsCard title="Activated" value={data.reduce((s, n) => s + n.activated, 0)} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Pending Activation" value={data.reduce((s, n) => s + (n.count - n.activated), 0)} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead><tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <th className="text-left px-4 py-3 font-medium">Batch</th>
            <th className="text-left px-4 py-3 font-medium">Assigned To</th>
            <th className="text-left px-4 py-3 font-medium">Total</th>
            <th className="text-left px-4 py-3 font-medium">Activated</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {data.map((n) => (
              <tr key={n.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{n.batch}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{n.assigned}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{n.count}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{n.activated}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${n.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${n.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    {n.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button onClick={() => toast.success('Viewing NFC batch details')} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
