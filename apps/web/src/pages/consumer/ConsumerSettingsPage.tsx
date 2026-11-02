import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService, type ConsumerProfile } from '../../services/consumer'
import CardProtectionPanel from '../../components/consumer/settings/CardProtectionPanel'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../services/api'

const NOTIFICATION_PREFS = [
  { key: 'reward_reminders', label: 'Reward Reminders', desc: 'Get notified when rewards are about to expire' },
  { key: 'new_rewards', label: 'New Rewards Available', desc: 'When new rewards or offers are added to your account' },
  { key: 'booking_confirmations', label: 'Booking Confirmations', desc: 'When appointments are confirmed or rescheduled' },
  { key: 'referral_updates', label: 'Referral Updates', desc: 'When your referrals join or earn rewards' },
  { key: 'points_earned', label: 'Points Earned', desc: 'Daily summary of points earned from activities' },
  { key: 'promotional_offers', label: 'Promotional Offers', desc: 'Special deals and offers from saved businesses' },
] as const

const PREF_KEY = 'mcom.consumer.notification-prefs'
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'tr', label: 'Turkish' },
  { value: 'zh', label: 'Chinese' },
]

export default function ConsumerSettingsPage() {
  const [profile, setProfile] = useState<ConsumerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { logout, user, updateUser } = useAuth()

  useEffect(() => {
    consumerService.getProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '' })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security' | 'notifications' | 'preferences' | 'privacy'>('profile')
  const [confirmLogout, setConfirmLogout] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [language, setLanguage] = useState('en')
  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      /* ignore corrupt preferences */
    }
    return Object.fromEntries(NOTIFICATION_PREFS.map((pref) => [pref.key, true]))
  })

  useEffect(() => {
    if (profile) setForm({ name: profile.name, email: profile.email, phone: profile.phone, location: profile.location })
  }, [profile])

  useEffect(() => {
    api.get('/users/me/settings')
      .then((res) => {
        const settings = res.data as { language?: string }
        if (settings?.language) setLanguage(settings.language)
      })
      .catch(() => { /* keep default */ })
  }, [])

  const updateNotificationPref = (key: string, value: boolean) => {
    const next = { ...notificationPrefs, [key]: value }
    setNotificationPrefs(next)
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota errors */
    }
  }

  const updateLanguage = async (value: string) => {
    setLanguage(value)
    try {
      await api.patch('/users/me/settings', { language: value })
    } catch {
      /* keep the selected value; the server will be retried on next change */
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!profile) return <div className="text-center py-20 text-gray-500">Failed to load profile.</div>

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setSaveError('Enter your full name.')
      return
    }
    if (trimmedName.length > 100) {
      setSaveError('Your name must be 100 characters or fewer.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setSaveError('Enter a valid email address.')
      return
    }
    if (form.phone.trim() && !/^[+()\d\s-]{6,30}$/.test(form.phone.trim())) {
      setSaveError('Enter a valid phone number.')
      return
    }

    setSaving(true)
    try {
      const updated = await consumerService.updateProfile({
        name: trimmedName,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        location: form.location.trim(),
      })
      setProfile(updated)
      if (user) {
        updateUser({
          ...user,
          name: updated.name,
          first_name: updated.name.split(' ')[0] || null,
          last_name: updated.name.split(' ').slice(1).join(' ') || null,
          email: updated.email,
          phone: updated.phone,
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'We could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const accountRows = [
    { label: 'Consumer ID', value: profile.consumerId },
    { label: 'MCOM Account', value: profile.centralUserId },
    { label: 'Registration source', value: profile.registrationSource || 'MCOM Solutions' },
    { label: 'Member since', value: new Date(profile.joined).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) },
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
              <p className="text-xs text-gray-400">Member since {new Date(profile.joined).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input id="settings-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  title="Your full name as it appears on your customer card"
                  placeholder="Jane Smith" maxLength={100} required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-[11px] text-gray-400">Shown on your card and activity.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input id="settings-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  title="Contact email. Changing it requires re-verification."
                  placeholder="jane@example.com" required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-[11px] text-gray-400">We use this for receipts and account notices.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="settings-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input id="settings-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  title="Optional contact phone number"
                  placeholder="+44 7700 900123" maxLength={40}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-[11px] text-gray-400">Optional — used by businesses you book with.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="settings-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input id="settings-location" type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  title="Your city or region — shown on your shared card"
                  placeholder="London, UK" maxLength={255}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-[11px] text-gray-400">Helps businesses show relevant nearby offers.</p>
              </div>
            </div>

            {saveError && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
            )}
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Password &amp; Sign-in</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your password, multi-factor settings and sessions are managed by the MCOM Central Hub Solution.
              Change them from your Central Hub account; this dashboard never stores a separate customer password.
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Signed in as <span className="font-medium text-gray-700 dark:text-gray-300">{profile.email}</span>
            </p>
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
            {NOTIFICATION_PREFS.map((n) => (
              <label key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0" title={n.desc}>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</p>
                  <p className="text-xs text-gray-500">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs[n.key] !== false}
                  onChange={(e) => updateNotificationPref(n.key, e.target.checked)}
                  aria-label={n.label}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-5 h-5"
                />
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
              <label className="relative inline-flex items-center cursor-pointer" title="Switch between light and dark appearance">
                <input type="checkbox" className="sr-only peer" checked={theme === 'dark'} onChange={toggleTheme} aria-label="Dark mode" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500" />
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">NFC Tap Sound</p>
                <p className="text-xs text-gray-500">Play sound on successful NFC scan</p>
              </div>
              <input type="checkbox" checked={notificationPrefs.nfc_tap_sound !== false} onChange={(e) => updateNotificationPref('nfc_tap_sound', e.target.checked)} aria-label="NFC tap sound" title="Play a short sound when your card is tapped" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-5 h-5" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Location Services</p>
                <p className="text-xs text-gray-500">Allow businesses to see nearby check-ins</p>
              </div>
              <input type="checkbox" checked={notificationPrefs.location_services !== false} onChange={(e) => updateNotificationPref('location_services', e.target.checked)} aria-label="Location services" title="Allow nearby offers based on your approximate location" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-5 h-5" />
            </div>
            <div className="py-3">
              <label htmlFor="settings-language" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Language</label>
              <select
                id="settings-language"
                value={language}
                onChange={(e) => updateLanguage(e.target.value)}
                title="Choose the language used across your account"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
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
