import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'



export default function PrintOrderListPage() {
  const [data] = useState<any[]>([])
  return (
    <div className="space-y-6">
      <Helmet><title>Print Orders - MCOM VCard Social Bio</title></Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Print Orders</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Physical card print orders — {data.length} orders</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Orders" value={data.length} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <StatsCard title="Total Cards" value={data.reduce((s, o) => s + o.qty, 0).toLocaleString()} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>} />
        <StatsCard title="Revenue" value={`$${data.reduce((s, o) => s + o.total, 0).toFixed(2)}`} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Pending" value={data.filter((o) => o.status === 'pending' || o.status === 'printing').length} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead><tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <th className="text-left px-4 py-3 font-medium">Order</th>
            <th className="text-left px-4 py-3 font-medium">Business</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
            <th className="text-left px-4 py-3 font-medium">Qty</th>
            <th className="text-left px-4 py-3 font-medium">Total</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {data.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{o.order}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{o.business}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{o.type}</td>
                <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{o.qty}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">${o.total.toFixed(2)}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    o.status === 'delivered' ? 'text-green-600 dark:text-green-400' :
                    o.status === 'shipped' ? 'text-blue-600 dark:text-blue-400' :
                    o.status === 'printing' ? 'text-purple-600 dark:text-purple-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      o.status === 'delivered' ? 'bg-green-500' :
                      o.status === 'shipped' ? 'bg-blue-500' :
                      o.status === 'printing' ? 'bg-purple-500' : 'bg-orange-500'
                    }`} />
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button onClick={() => toast.success('Viewing order details')} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
