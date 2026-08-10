import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { mockAppointments } from '../../services/businessDashboardStore'

type Filter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
]

const statusStyles = {
    pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    confirmed: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
} as const

export default function AppointmentsPage() {
    const [filter, setFilter] = useState<Filter>('all')
    const [paidOnly, setPaidOnly] = useState(false)

    const list = mockAppointments.filter(a =>
        (filter === 'all' || a.status === filter) && (!paidOnly || a.paid)
    )

    const togglePaid = () => {
        toast.success('Appointment payment updated')
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Appointments - MCOMVCard</title></Helmet>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Today's schedule at a glance.</p>
                </div>
                <button className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md">
                    + New Booking
                </button>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`shrink-0 px-3.5 py-2 min-h-[40px] rounded-full text-xs font-semibold transition-colors ${
                            filter === f.key
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Paid toggle */}
            <label className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Paid appointments only</span>
                <button
                    onClick={() => setPaidOnly(v => !v)}
                    className={`w-11 h-6 rounded-full transition-colors ${paidOnly ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                    <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${paidOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
            </label>

            {/* List */}
            <div className="space-y-3">
                {list.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">No appointments match this filter.</p>
                )}
                {list.map((a) => (
                    <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-full ${a.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                                {a.customer.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{a.customer}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{a.service} · {a.time}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[a.status]}`}>
                                {a.status}
                            </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={togglePaid}
                                className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold ${
                                    a.paid
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                {a.paid ? 'Paid' : 'Mark Paid'}
                            </button>
                            {a.status !== 'cancelled' && (
                                <button className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">
                                    {a.status === 'confirmed' ? 'Complete' : 'Confirm'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
