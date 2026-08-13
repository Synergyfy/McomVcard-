import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import InputField from '../../../components/auth/InputField'
import type { DashboardMeta, EmailSetting, PaymentSetting } from '../../../types'

type Tab = 'general' | 'branding' | 'email' | 'payment' | 'sms' | 'notifications' | 'booking'

export default function SettingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('general')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // General
  const [meta, setMeta] = useState<DashboardMeta>({ site_title: '', home_title: '', meta_keyword: '', meta_description: '', google_analytics: '' })

  // Email
  const [email, setEmail] = useState<EmailSetting>({ mail_driver: '', mail_host: '', mail_port: '', mail_username: '', mail_password: '', mail_encryption: '', mail_from_address: '', mail_from_name: '' })

  // Payment
  const [payment, setPayment] = useState<PaymentSetting>({ stripe_key: '', stripe_secret: '', stripe_enabled: false, paypal_client_id: '', paypal_secret: '', paypal_enabled: false, currency: '' })

  // Branding
  const [branding, setBranding] = useState({ logo_url: '/logo.png', favicon_url: '/favicon.ico', primary_color: '#FF5C00', secondary_color: '#1F2937', accent_color: '#10B981', custom_css: '', custom_js: '' })

  // SMS
  const [sms, setSms] = useState({ twilio_sid: '', twilio_token: '', twilio_phone: '', sms_provider: 'twilio', enable_sms_otp: false, enable_sms_notifications: true })

  // Notifications
  const [notifications, setNotifications] = useState({ email_notifications: true, push_notifications: false, sms_notifications: true, welcome_email: true, password_reset: true, payment_confirmation: true, campaign_alerts: true, support_tickets: true, weekly_digest: true })

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({ buffer_minutes: 15, max_bookings_per_slot: 1, allow_cancellation: true, cancellation_deadline_hours: 24, require_confirmation: true, max_future_days: 60, min_notice_hours: 2, auto_confirm: false })

  useEffect(() => {
    adminService.getGeneralSettings().then(setMeta).catch(() => {})
    adminService.getEmailSettings().then(setEmail).catch(() => {})
    adminService.getPaymentSettings().then(setPayment).catch(() => {})
  }, [])

  const showSuccess = () => { setMessage(t('admin.saved')); setTimeout(() => setMessage(''), 3000) }

  const handleGeneralSave = async () => { setLoading(true); setMessage(''); try { await adminService.updateGeneralSettings(meta); showSuccess() } catch {} finally { setLoading(false) } }
  const handleEmailSave = async () => { setLoading(true); setMessage(''); try { await adminService.updateEmailSettings(email); showSuccess() } catch {} finally { setLoading(false) } }
  const handlePaymentSave = async () => { setLoading(true); setMessage(''); try { await adminService.updatePaymentSettings(payment); showSuccess() } catch {} finally { setLoading(false) } }
  const handleBrandingSave = async () => { setLoading(true); setMessage(''); try { showSuccess() } catch {} finally { setLoading(false) } }
  const handleSmsSave = async () => { setLoading(true); setMessage(''); try { showSuccess() } catch {} finally { setLoading(false) } }
  const handleNotificationsSave = async () => { setLoading(true); setMessage(''); try { showSuccess() } catch {} finally { setLoading(false) } }
  const handleBookingSave = async () => { setLoading(true); setMessage(''); try { showSuccess() } catch {} finally { setLoading(false) } }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { key: 'branding', label: 'Branding', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { key: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key: 'payment', label: 'Payment', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { key: 'sms', label: 'SMS', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { key: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { key: 'booking', label: 'Booking', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  )

  return (
    <div>
      <Helmet><title>{t('admin.nav.settings')} - Mobile VCard Link</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('admin.nav.settings')}</h1>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-sm text-green-700 dark:text-green-400">{message}</div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setMessage('') }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.key ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-3xl">
        {tab === 'general' && (
          <form onSubmit={(e) => { e.preventDefault(); handleGeneralSave() }} className="space-y-4">
            <InputField label={t('admin.site_title')} value={meta.site_title} onChange={(e) => setMeta({ ...meta, site_title: e.target.value })} />
            <InputField label={t('admin.home_title')} value={meta.home_title} onChange={(e) => setMeta({ ...meta, home_title: e.target.value })} />
            <InputField label={t('admin.meta_keyword')} value={meta.meta_keyword} onChange={(e) => setMeta({ ...meta, meta_keyword: e.target.value })} />
            <InputField label={t('admin.meta_description')} value={meta.meta_description} onChange={(e) => setMeta({ ...meta, meta_description: e.target.value })} />
            <InputField label={t('admin.google_analytics')} value={meta.google_analytics} onChange={(e) => setMeta({ ...meta, google_analytics: e.target.value })} />
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}

        {tab === 'branding' && (
          <form onSubmit={(e) => { e.preventDefault(); handleBrandingSave() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
                <input type="text" value={branding.logo_url} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon URL</label>
                <input type="text" value={branding.favicon_url} onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                  <input type="text" value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                  <input type="text" value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                  <input type="text" value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom CSS</label>
              <textarea value={branding.custom_css} onChange={(e) => setBranding({ ...branding, custom_css: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="/* custom styles */" />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}

        {tab === 'email' && (
          <form onSubmit={(e) => { e.preventDefault(); handleEmailSave() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField label={t('admin.mail_driver')} value={email.mail_driver} onChange={(e) => setEmail({ ...email, mail_driver: e.target.value })} />
              <InputField label={t('admin.mail_host')} value={email.mail_host} onChange={(e) => setEmail({ ...email, mail_host: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label={t('admin.mail_port')} value={email.mail_port} onChange={(e) => setEmail({ ...email, mail_port: e.target.value })} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.mail_encryption')}</label>
                <select value={email.mail_encryption} onChange={(e) => setEmail({ ...email, mail_encryption: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">None</option>
                  <option value="ssl">SSL</option>
                  <option value="tls">TLS</option>
                </select>
              </div>
            </div>
            <InputField label={t('admin.mail_username')} value={email.mail_username} onChange={(e) => setEmail({ ...email, mail_username: e.target.value })} />
            <InputField label={t('admin.mail_password')} type="password" value={email.mail_password} onChange={(e) => setEmail({ ...email, mail_password: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <InputField label={t('admin.mail_from_address')} value={email.mail_from_address} onChange={(e) => setEmail({ ...email, mail_from_address: e.target.value })} />
              <InputField label={t('admin.mail_from_name')} value={email.mail_from_name} onChange={(e) => setEmail({ ...email, mail_from_name: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}

        {tab === 'payment' && (
          <form onSubmit={(e) => { e.preventDefault(); handlePaymentSave() }} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.stripe')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <InputField label={t('admin.stripe_key')} value={payment.stripe_key} onChange={(e) => setPayment({ ...payment, stripe_key: e.target.value })} />
              <InputField label={t('admin.stripe_secret')} type="password" value={payment.stripe_secret} onChange={(e) => setPayment({ ...payment, stripe_secret: e.target.value })} />
            </div>
            <Toggle checked={payment.stripe_enabled} onChange={(v) => setPayment({ ...payment, stripe_enabled: v })} label={t('admin.enable_stripe')} />
            <hr className="border-gray-100 dark:border-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">PayPal</h3>
            <div className="grid grid-cols-2 gap-3">
              <InputField label={t('admin.paypal_client_id')} value={payment.paypal_client_id} onChange={(e) => setPayment({ ...payment, paypal_client_id: e.target.value })} />
              <InputField label={t('admin.paypal_secret')} type="password" value={payment.paypal_secret} onChange={(e) => setPayment({ ...payment, paypal_secret: e.target.value })} />
            </div>
            <Toggle checked={payment.paypal_enabled} onChange={(v) => setPayment({ ...payment, paypal_enabled: v })} label={t('admin.enable_paypal')} />
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}

        {tab === 'sms' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSmsSave() }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMS Provider</label>
              <select value={sms.sms_provider} onChange={(e) => setSms({ ...sms, sms_provider: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="twilio">Twilio</option>
                <option value="vonage">Vonage (Nexmo)</option>
                <option value="plivo">Plivo</option>
                <option value="aws-sns">AWS SNS</option>
              </select>
            </div>
            <InputField label="Twilio Account SID" value={sms.twilio_sid} onChange={(e) => setSms({ ...sms, twilio_sid: e.target.value })} />
            <InputField label="Twilio Auth Token" type="password" value={sms.twilio_token} onChange={(e) => setSms({ ...sms, twilio_token: e.target.value })} />
            <InputField label="Twilio Phone Number" value={sms.twilio_phone} onChange={(e) => setSms({ ...sms, twilio_phone: e.target.value })} />
            <Toggle checked={sms.enable_sms_otp} onChange={(v) => setSms({ ...sms, enable_sms_otp: v })} label="Enable SMS OTP verification" />
            <Toggle checked={sms.enable_sms_notifications} onChange={(v) => setSms({ ...sms, enable_sms_notifications: v })} label="Enable SMS notifications" />
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}

        {tab === 'notifications' && (
          <form onSubmit={(e) => { e.preventDefault(); handleNotificationsSave() }} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Channel Preferences</h3>
            <Toggle checked={notifications.email_notifications} onChange={(v) => setNotifications({ ...notifications, email_notifications: v })} label="Email notifications" />
            <Toggle checked={notifications.push_notifications} onChange={(v) => setNotifications({ ...notifications, push_notifications: v })} label="Push notifications" />
            <Toggle checked={notifications.sms_notifications} onChange={(v) => setNotifications({ ...notifications, sms_notifications: v })} label="SMS notifications" />
            <hr className="border-gray-100 dark:border-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Email Triggers</h3>
            <Toggle checked={notifications.welcome_email} onChange={(v) => setNotifications({ ...notifications, welcome_email: v })} label="Send welcome email on registration" />
            <Toggle checked={notifications.password_reset} onChange={(v) => setNotifications({ ...notifications, password_reset: v })} label="Send password reset emails" />
            <Toggle checked={notifications.payment_confirmation} onChange={(v) => setNotifications({ ...notifications, payment_confirmation: v })} label="Send payment confirmation emails" />
            <Toggle checked={notifications.campaign_alerts} onChange={(v) => setNotifications({ ...notifications, campaign_alerts: v })} label="Campaign status alerts" />
            <Toggle checked={notifications.support_tickets} onChange={(v) => setNotifications({ ...notifications, support_tickets: v })} label="New support ticket alerts" />
            <Toggle checked={notifications.weekly_digest} onChange={(v) => setNotifications({ ...notifications, weekly_digest: v })} label="Weekly email digest" />
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}

        {tab === 'booking' && (
          <form onSubmit={(e) => { e.preventDefault(); handleBookingSave() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Buffer Time (minutes)" type="number" value={String(bookingSettings.buffer_minutes)} onChange={(e) => setBookingSettings({ ...bookingSettings, buffer_minutes: Number(e.target.value) })} />
              <InputField label="Max Bookings Per Slot" type="number" value={String(bookingSettings.max_bookings_per_slot)} onChange={(e) => setBookingSettings({ ...bookingSettings, max_bookings_per_slot: Number(e.target.value) })} />
              <InputField label="Cancellation Deadline (hours)" type="number" value={String(bookingSettings.cancellation_deadline_hours)} onChange={(e) => setBookingSettings({ ...bookingSettings, cancellation_deadline_hours: Number(e.target.value) })} />
              <InputField label="Max Future Booking (days)" type="number" value={String(bookingSettings.max_future_days)} onChange={(e) => setBookingSettings({ ...bookingSettings, max_future_days: Number(e.target.value) })} />
              <InputField label="Min Notice (hours)" type="number" value={String(bookingSettings.min_notice_hours)} onChange={(e) => setBookingSettings({ ...bookingSettings, min_notice_hours: Number(e.target.value) })} />
            </div>
            <Toggle checked={bookingSettings.allow_cancellation} onChange={(v) => setBookingSettings({ ...bookingSettings, allow_cancellation: v })} label="Allow customers to cancel bookings" />
            <Toggle checked={bookingSettings.require_confirmation} onChange={(v) => setBookingSettings({ ...bookingSettings, require_confirmation: v })} label="Require admin confirmation for bookings" />
            <Toggle checked={bookingSettings.auto_confirm} onChange={(v) => setBookingSettings({ ...bookingSettings, auto_confirm: v })} label="Auto-confirm bookings (skip approval)" />
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
              {loading ? t('common.loading') : t('admin.save')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
