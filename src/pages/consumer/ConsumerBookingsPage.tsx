import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'

export default function ConsumerBookingsPage() {
  const [profile, setProfile] = useState<{ name: string; savedCards: Array<{ id: number; name: string; business: string; type: string }> } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    consumerService.getProfile().then(setProfile).finally(() => setLoading(false))
  }, [])

  const bookingBusinesses = profile?.savedCards.filter((c) => c.type === 'Appointment' || c.type === 'Membership') || []

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <Helmet><title>Bookings - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Upcoming Appointments</h2>
        <div className="space-y-3">
          {[
            { business: 'Dr. Smith Dentistry', service: 'Dental Checkup', date: '15 Jul 2026', time: '10:30 AM', status: 'confirmed' },
            { business: 'Bloom Beauty Salon', service: 'Haircut & Style', date: '18 Jul 2026', time: '2:00 PM', status: 'pending' },
            { business: 'FitLife Studio', service: 'Personal Training', date: '20 Jul 2026', time: '7:00 AM', status: 'confirmed' },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                  {b.business.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.business}</p>
                  <p className="text-xs text-gray-500">{b.service}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{b.date}</p>
                <p className="text-xs text-gray-500">{b.time}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${b.status === 'confirmed' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Bookable Businesses</h2>
        {bookingBusinesses.length === 0 ? (
          <p className="text-sm text-gray-400">No bookable businesses yet. Save a card with appointment type to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookingBusinesses.map((c) => (
              <button key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-lg">
                  {c.business.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.business}</p>
                  <p className="text-xs text-gray-500">{c.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
