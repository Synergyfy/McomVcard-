import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { mockConsumers } from '../../services/mockData'

const CONSUMER_ID = 1

export default function ConsumerSettingsPage() {
  const profile = mockConsumers.find((x) => x.id === CONSUMER_ID) || mockConsumers[0]
  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone, location: profile.location })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <Helmet><title>Settings - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['profile', 'notifications', 'preferences'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
              {profile.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <p className="text-xs text-gray-400">Member since {profile.joined}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-2xl">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Reward Reminders', desc: 'Get notified when rewards are about to expire' },
              { label: 'New Rewards Available', desc: 'When new rewards or offers are added to your account' },
              { label: 'Booking Confirmations', desc: 'When appointments are confirmed or rescheduled' },
              { label: 'Referral Updates', desc: 'When your referrals join or earn rewards' },
              { label: 'Points Earned', desc: 'Daily summary of points earned from activities' },
              { label: 'Promotional Offers', desc: 'Special deals and offers from saved businesses' },
            ].map((n) => (
              <label key={n.label} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</p>
                  <p className="text-xs text-gray-500">{n.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-5 h-5" />
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-2xl">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500">Toggle dark/light theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" onChange={() => {
                  const el = document.documentElement
                  el.classList.toggle('dark')
                }} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500" />
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">NFC Tap Sound</p>
                <p className="text-xs text-gray-500">Play sound on successful NFC scan</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-5 h-5" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Location Services</p>
                <p className="text-xs text-gray-500">Allow businesses to see nearby check-ins</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-5 h-5" />
            </div>
            <div className="py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Language</p>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
