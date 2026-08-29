import { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'
import { adminService } from '../../../services/admin'
import { mockAdminBookings } from '../../../services/mockData'
import type { AdminBooking } from '../../../types'
import ActionDropdown from '../../../components/common/ActionDropdown'

const PAGE_SIZE = 10

const TYPE_ICONS: Record<string, string> = {
  Appointment: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  Consultation: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  Class: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  Reservation: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  Event: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
}

export default function BookingListPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminBooking[]>(mockAdminBookings)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    adminService.getBookings().then((res) => {
      if (res.data?.length) setData(res.data)
    }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let list = data
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((b) =>
        b.customer_name.toLowerCase().includes(q) ||
        b.business_name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'All') list = list.filter((b) => b.status === statusFilter)
    if (typeFilter !== 'All') list = list.filter((b) => b.type === typeFilter)
    return list
  }, [data, search, statusFilter, typeFilter])

  const today = '2026-07-16'
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const updateStatus = async (id: string, status: AdminBooking['status']) => {
    try {
      await adminService.updateBookingStatus(id, status)
      setData((prev) => prev.map((b) => String(b.id) === id ? { ...b, status } : b))
      toast.success(`Booking #${id} ${status}`)
    } catch { toast.error('Failed to update booking') }
  }

  const deleteBooking = async (id: string) => {
    try {
      await adminService.deleteBooking(String(id))
      setData((prev) => prev.filter((b) => String(b.id) !== id))
      toast.success('Booking deleted')
    } catch { toast.error('Failed to delete booking') }
  }

  const statusBadge = (status: string) => {
    const maps: Record<string, { color: string; bg: string }> = {
      confirmed: { color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-500/20' },
      pending: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/20' },
      cancelled: { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-500/20' },
      completed: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    }
    const m = maps[status] || maps.pending
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.color}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Bookings - MCOM VCard Social Bio</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Appointments, reservations, and events across all businesses — {data.length} total bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings" value={data.length} color="blue" subtitle={`${data.filter((b) => b.status === 'completed').length} completed`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatsCard title="Confirmed" value={data.filter((b) => b.status === 'confirmed').length} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Pending" value={data.filter((b) => b.status === 'pending').length} color="orange" subtitle={`${data.filter((b) => b.status === 'cancelled').length} cancelled`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Today" value={data.filter((b) => b.date === today).length} color="purple" subtitle="Jul 16, 2026" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search customers, businesses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="All">All Types</option>
              <option value="Appointment">Appointment</option>
              <option value="Consultation">Consultation</option>
              <option value="Class">Class</option>
              <option value="Reservation">Reservation</option>
              <option value="Event">Event</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center ml-auto">{filtered.length} of {data.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Business</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Type</th>
                <th className="text-left px-5 py-3 font-medium">Date / Time</th>
                <th className="text-left px-5 py-3 font-medium">Duration</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{b.customer_name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer_name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{b.customer_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <button onClick={() => navigate(`/admin/businesses/${b.business_id}`)} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">{b.business_name}</button>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={TYPE_ICONS[b.type] || TYPE_ICONS.Appointment} /></svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{b.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{b.date}<span className="text-xs ml-1.5 text-gray-400">{b.time}</span></td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{b.duration_minutes}m</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{b.amount ? `£${b.amount}` : '—'}</td>
                  <td className="px-5 py-3.5">{statusBadge(b.status)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionDropdown actions={[
                        ...(b.status === 'pending' ? [
                          { label: 'Confirm', icon: 'M5 13l4 4L19 7', onClick: () => updateStatus(b.id, 'confirmed') },
                          { label: 'Cancel', icon: 'M6 18L18 6M6 6l12 12', destructive: true, onClick: () => updateStatus(b.id, 'cancelled') },
                        ] : []),
                        ...(b.status === 'confirmed' ? [
                          { label: 'Mark Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => updateStatus(b.id, 'completed') },
                        ] : []),
                        { label: '', divider: true },
                        { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => deleteBooking(b.id) },
                      ]} />
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-gray-400 dark:text-gray-500">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500">Page {safePage} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${p === safePage ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{p}</button>
              ))}
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
