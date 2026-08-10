import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockConsumers } from '../../services/mockData'
import CardProtectionPanel from '../../components/consumer/settings/CardProtectionPanel'
import { useAuth } from '../../contexts/AuthContext'

const CONSUMER_ID = 1

export default function ConsumerSettingsPage() {
  const profile = mockConsumers.find((x) => x.id === CONSUMER_ID) || mockConsumers[0]
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone, location: profile.location })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security' | 'notifications' | 'preferences' | 'privacy'>('profile')

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwNotice, setPwNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwNotice({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }
    if (pwForm.next.length < 8) {
      setPwNotice({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwNotice({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setPwSaving(true)
    setPwNotice(null)
    setTimeout(() => {
      setPwSaving(false)
      setPwForm({ current: '', next: '', confirm: '' })
      setPwNotice({ type: 'success', text: 'Password updated. Your MCOM account is shared across MCOM Solutions.' })
    }, 800)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const accountRows = [
    { label: 'Consumer ID', value: profile.consumerId },
    { label: 'MCOM Account', value: profile.centralUserId },
    { label: 'Registration source', value: profile.registrationSource || 'MCOM Solutions' },
    { label: 'Member since', value: profile.joined },
    { label: 'Membership', value: profile.membership },
  ]

  return (
    <div>
      <Helmet><title>Settings - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['profile', 'account', 'security', 'notifications', 'preferences', 'privacy'] as const).map((tab) => (
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

      {activeTab === 'account' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
            <dl className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {accountRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">{row.label}</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">MCOM Account Relationship</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your VCard consumer account is linked to your central <span className="font-medium text-gray-900 dark:text-white">MCOM Solutions</span> identity
              ({profile.centralUserId}), registered via <span className="font-medium text-gray-900 dark:text-white">{profile.registrationSource || 'MCOM Solutions'}</span>.
              Sign-in, password, and session are managed centrally by MCOM Solutions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Business Relationship</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your card is issued by <span className="font-medium text-gray-900 dark:text-white">{profile.primaryIssuingBusiness}</span>.
              You are connected to <span className="font-medium text-gray-900 dark:text-white">{profile.businessCount}</span> business{profile.businessCount === 1 ? '' : 'es'} through your shared card.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Managed centrally by MCOM Solutions and shared across your MCOM account.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input type="password" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              {pwNotice && (
                <p className={`text-sm font-medium ${pwNotice.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {pwNotice.text}
                </p>
              )}
              <button type="submit" disabled={pwSaving}
                className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Session</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">You are signed in via MCOM Solutions. Signing out ends your session on this device.</p>
            {!confirmLogout ? (
              <button onClick={() => setConfirmLogout(true)}
                className="px-6 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">
                Log Out
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Sign out of your MCOM account?</p>
                <div className="flex gap-3">
                  <button onClick={handleLogout}
                    className="px-6 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">
                    Confirm Sign Out
                  </button>
                  <button onClick={() => setConfirmLogout(false)}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
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
      {activeTab === 'privacy' && (
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Privacy &amp; Security</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Control who can see what inside your shared card.</p>
          </div>
          <CardProtectionPanel
            cardId={profile.cardId}
            title="Protect My Shared Card"
            description="Require a passcode to open your shared card"
          />
        </div>
      )}
    </div>
  )
}
