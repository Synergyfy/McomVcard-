import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService, type ConsumerBooking } from '../../services/consumer'
import ErrorState from '../../components/common/ErrorState'

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(value: string) {
  if (!value) return ''
  const [hours, minutes] = value.split(':')
  if (hours === undefined) return value
  const date = new Date()
  date.setHours(Number(hours), Number(minutes || 0), 0, 0)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function ConsumerBookingsPage() {
  const [bookings, setBookings] = useState<ConsumerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadBookings = () => {
    setLoading(true)
    setError(false)
    consumerService.getBookings(1, 100)
      .then((page) => setBookings(page.items || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (error) {
    return (
      <div>
        <Helmet><title>Bookings - Consumer - MCOM VCard</title></Helmet>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h1>
        <div className="lg:max-w-2xl">
          <ErrorState title="We couldn't load your bookings" message="Please try again in a moment." onRetry={loadBookings} />
        </div>
      </div>
    )
  }

  const now = new Date()
  const upcoming = bookings.filter((b) => {
    const date = new Date(`${b.date}T${b.time || '00:00:00'}`)
    return Number.isNaN(date.getTime()) || date >= now
  })
  const past = bookings.filter((b) => !upcoming.includes(b))

  const renderBooking = (b: ConsumerBooking) => (
    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">
          {b.business.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{b.business}</p>
          <p className="text-xs text-gray-500 truncate">{b.service}</p>
          {b.notes && <p className="text-[11px] text-gray-400 truncate">{b.notes}</p>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(b.date)}</p>
        <p className="text-xs text-gray-500">{formatTime(b.time)}</p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
          b.status === 'confirmed'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : b.status === 'cancelled'
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
        }`}>
          {b.status}
        </span>
      </div>
    </div>
  )

  return (
    <div>
      <Helmet><title>Bookings - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">You have no upcoming appointments.</p>
        ) : (
          <div className="space-y-3">{upcoming.map(renderBooking)}</div>
        )}
      </div>

      {past.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Past Appointments</h2>
          <div className="space-y-3">{past.map(renderBooking)}</div>
        </div>
      )}
    </div>
  )
}
