import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { mockAdminBookings, mockVcards } from '../../../services/mockData'
import type { AdminBooking } from '../../../types'

const BUSINESS_ID = 1
const myVcards = mockVcards.filter((v) => v.user_id === BUSINESS_ID)
const allBookingsInit = mockAdminBookings.filter((b) => b.business_id === BUSINESS_ID)

type Tab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'setup'

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [bookings, setBookings] = useState<AdminBooking[]>(allBookingsInit)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const types = [...new Set(bookings.map((b) => b.type))]

  const filtered = bookings.filter((b) => {
    const matchTab = tab === 'all' || b.status === tab
    const matchSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) || b.customer_email.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || b.type === typeFilter
    return matchTab && matchSearch && matchType
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    revenue: bookings.reduce((a, b) => a + (b.amount || 0), 0),
  }

  const updateBooking = (id: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    setBookings(bookings.map((b) => b.id === id ? { ...b, status: newStatus } : b))
    setOpenMenuId(null)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
    { key: 'setup', label: 'Booking Setup', count: 0 },
  ]

  return (
    <div>
      <Helmet><title>Appointments & Bookings - MCOM VCard Social Bio</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments & Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your appointment slots and view customer bookings</p>
        </div>
        <Link to="/user/vcards" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Manage vCards
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-orange-600">£{stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${tab === t.key ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {t.label} {t.count > 0 && `(${t.count})`}
          </button>
        ))}
      </div>

      {tab === 'setup' ? (
        /* ── Booking Setup Tab ── */
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configure how customers can book appointments through your vCard. These settings apply to all your vCards with booking enabled.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Buffer Time Between Appointments</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Bookings Per Slot</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>1</option>
                  <option>2</option>
                  <option>5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Minimum Notice (hours)</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>4 hours</option>
                  <option>24 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Future Booking (days)</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                </select>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-9 h-5 rounded-full bg-orange-500">
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm translate-x-4" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Allow customers to cancel bookings</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-9 h-5 rounded-full bg-orange-500">
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm translate-x-4" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Require admin confirmation before booking</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-9 h-5 rounded-full bg-gray-300 dark:bg-gray-600">
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto-confirm bookings (skip approval)</span>
              </label>
            </div>
            <button className="mt-6 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Save Settings
            </button>
          </div>

          {/* Appointment Slots per vCard */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Slots by vCard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Define your available hours for each vCard. Customers will see these slots when booking.</p>
            {myVcards.map((v) => (
              <div key={v.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{v.name}</p>
                      <p className="text-xs text-gray-400">/{v.url_slug}</p>
                    </div>
                  </div>
                  <Link to={`/user/vcards/${v.id}/edit`} className="text-xs text-orange-600 hover:text-orange-700 font-medium">Edit Slots</Link>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className={`text-center p-2 rounded-lg text-[10px] font-medium ${i < 5 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>
                      <p className="mb-1">{day}</p>
                      {i < 5 ? <p className="text-[9px]">9:00-17:00</p> : <p className="text-[9px]">Closed</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Bookings List ── */
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Bookings Table */}
          {filtered.length ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {filtered.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                              {b.customer_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer_name}</p>
                              <p className="text-[11px] text-gray-400">{b.customer_email}</p>
                              {b.customer_phone && <p className="text-[11px] text-gray-400">{b.customer_phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">{b.type}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-900 dark:text-white">{b.date}</p>
                          <p className="text-xs text-gray-400">{b.time}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{b.duration_minutes} min</td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{b.amount ? `£${b.amount}` : '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
                          {b.notes && <p className="text-[10px] text-gray-400 mt-1 max-w-[120px] truncate" title={b.notes}>{b.notes}</p>}
                        </td>
                        <td className="px-5 py-4 relative">
                          <button onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                          </button>
                          {openMenuId === b.id && (
                            <div className="absolute right-5 top-8 z-10 w-40 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg py-1">
                              <button onClick={() => setOpenMenuId(null)} className="w-full px-4 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                View Details
                              </button>
                              {b.status === 'pending' && (
                                <>
                                  <button onClick={() => updateBooking(b.id, 'confirmed')} className="w-full px-4 py-2 text-left text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Confirm
                                  </button>
                                  <button onClick={() => updateBooking(b.id, 'cancelled')} className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Cancel
                                  </button>
                                </>
                              )}
                              {b.status === 'confirmed' && (
                                <button onClick={() => updateBooking(b.id, 'completed')} className="w-full px-4 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Mark Complete
                                </button>
                              )}
                              {b.status === 'pending' && (
                                <button onClick={() => updateBooking(b.id, 'completed')} className="w-full px-4 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Mark Complete
                                </button>
                              )}
                              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                              <button onClick={() => setOpenMenuId(null)} className="w-full px-4 py-2 text-left text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Close Menu
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No bookings found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bookings will appear here when customers book through your vCard</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
