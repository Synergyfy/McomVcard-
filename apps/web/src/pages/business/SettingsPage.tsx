import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import InfoTooltip from '../../components/common/InfoTooltip'
import { useAuth } from '../../contexts/AuthContext'
import { businessService, type Business, type BusinessCategory, type Membership } from '../../services/businessApi'

const HOURS_ICON = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
const PIN_ICON = 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
const MAP_ICON = 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 0v13m0 0l-6 3'
const PHONE_ICON = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
const MAIL_ICON = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
const WEB_ICON = 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlRe = /^https?:\/\/.+/i

type Group = { title: string; icon: string; items: { label: string; subtitle: string; action?: 'toggle' | 'link' | 'edit' | 'hours' | 'profile'; to?: string }[] }
const groups: Group[] = [
  { title: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', items: [
    { label: 'Name', subtitle: 'Owner & business contact name', action: 'profile' }, { label: 'Email', subtitle: 'Primary account email', action: 'profile' },
    { label: 'Password', subtitle: 'Update your password' }, { label: 'Security', subtitle: 'Logins, sessions & protection' },
    { label: 'Two-factor authentication', subtitle: 'Add extra security', action: 'toggle' },
  ] },
  { title: 'Business', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M15 9h.01M15 12h.01M15 15h.01', items: [
    { label: 'Business profile', subtitle: 'Name, logo, description', action: 'edit' }, { label: 'Contact', subtitle: 'Phone, email, website', action: 'edit' },
    { label: 'Location', subtitle: 'Address & map pin', action: 'edit' }, { label: 'Opening hours', subtitle: 'When customers can reach you', action: 'hours' },
  ] },
  { title: 'VCard', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0', items: [
    { label: 'Template', subtitle: 'Choose your VCard style', action: 'link', to: '/b/cards' }, { label: 'Visibility', subtitle: 'Who can find your VCard' },
    { label: 'Sections', subtitle: 'Which sections to show' }, { label: 'Password protection', subtitle: 'Restrict access with a PIN' },
    { label: 'QR', subtitle: 'Your VCard QR code', action: 'link', to: '/b/qr' },
  ] },
  { title: 'Business Card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', items: [
    { label: 'Template', subtitle: 'Choose your card style', action: 'link', to: '/b/cards' }, { label: 'Visibility', subtitle: 'Who can see your card' },
    { label: 'QR', subtitle: 'Where your QR points to', action: 'link', to: '/b/qr' }, { label: 'Print/download', subtitle: 'Get a printable PDF' },
  ] },
  { title: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', items: [
    { label: 'Availability', subtitle: 'Your booking hours & slots' }, { label: 'Free / paid', subtitle: 'Charge for bookings or not' }, { label: 'Booking rules', subtitle: 'Lead time, reminders, no-shows' },
  ] },
  { title: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', items: [
    { label: 'Email notifications', subtitle: 'Reports & updates', action: 'toggle' }, { label: 'SMS notifications', subtitle: 'Text message alerts', action: 'toggle' },
    { label: 'Push notifications', subtitle: 'On-device alerts', action: 'toggle' }, { label: 'In-app notifications', subtitle: 'Activity alerts', action: 'toggle' },
  ] },
  { title: 'Rewards', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', items: [
    { label: 'Reward preferences', subtitle: 'Points, coupons, cashback', action: 'link', to: '/b/rewards' }, { label: 'Redemption rules', subtitle: 'Set how rewards are used' },
  ] },
  { title: 'Integrations', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', items: [
    { label: 'MCOM Solutions', subtitle: 'Connected MCOM platform services', action: 'link', to: '/b/integrations' }, { label: 'MCOM Rewards', subtitle: 'Points, coupons & cashback', action: 'link', to: '/b/integrations' },
    { label: 'MCOMMall', subtitle: 'List products for sale', action: 'link', to: '/b/integrations' }, { label: 'Payment', subtitle: 'Payments & Global Pay' }, { label: 'Other approved integrations', subtitle: 'More approved solutions' },
  ] },
]

export default function BusinessSettingsPage() {
  const { user } = useAuth()
  const [toggles, setToggles] = useState<Record<string, boolean>>({ 'Email notifications': true, 'SMS notifications': true, 'Push notifications': true, 'In-app notifications': true, 'Two-factor authentication': false })
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [hoursOpen, setHoursOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', email: '', phone: '', website: '', category_id: '' })
  const [locationForm, setLocationForm] = useState({ address: '', city: '', state: '', country: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hours, setHours] = useState(() => DAYS.map((_, day) => ({ day_of_week: day, opens_at: '09:00', closes_at: '17:00', is_closed: day === 0, id: '' })))

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [businesses, cats, memberships] = await Promise.all([businessService.getMyBusinesses(), businessService.getCategories(), businessService.getMyMemberships()])
        if (cancelled) return
        setCategories(cats); setMembership(memberships.find((m) => m.status === 'active') ?? memberships[0] ?? null)
        const first = businesses[0] ?? null
        if (first) {
          const detailed = await businessService.getBusiness(first.id)
          if (cancelled) return
          setBusiness(detailed)
          setForm({ name: detailed.name ?? '', description: detailed.description ?? '', email: detailed.email ?? '', phone: detailed.phone ?? '', website: detailed.website ?? '', category_id: detailed.category_id ?? '' })
          const loc = detailed.locations?.[0]
          if (loc) setLocationForm({ address: loc.address ?? '', city: loc.city ?? '', state: loc.state ?? '', country: loc.country ?? '' })
          setHours(DAYS.map((_, day) => { const h = detailed.hours?.find((x) => x.day_of_week === day); return { day_of_week: day, opens_at: h?.opens_at?.slice(0, 5) ?? '09:00', closes_at: h?.closes_at?.slice(0, 5) ?? '17:00', is_closed: h?.is_closed ?? day === 0, id: h?.id ?? '' } }))
        }
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const verification = business ? (business.status === 'active' ? 'Verified' : business.status) : 'Not created'
  const displayName = business?.name || 'Your Business'
  const categoryName = business?.category?.name || 'Business'
  const locationText = business?.locations?.[0] ? [business.locations[0].address, business.locations[0].city, business.locations[0].state, business.locations[0].country].filter(Boolean).join(', ') : 'No location saved'
  const openingHours = business?.hours?.length ? business.hours.map((h) => `${DAYS[h.day_of_week]?.slice(0, 3)} ${h.is_closed ? 'Closed' : `${h.opens_at?.slice(0, 5)}–${h.closes_at?.slice(0, 5)}`}`).join(' · ') : 'No opening hours saved'

  const handleAction = (item: Group['items'][number]) => {
    if (item.to) { window.location.href = item.to; return }
    if (item.action === 'edit' || item.action === 'profile') { setErrors({}); setEditOpen(true); return }
    if (item.action === 'hours') { setHoursOpen(true); return }
    if (item.action === 'toggle') { setToggles((t) => ({ ...t, [item.label]: !t[item.label] })); return }
    toast(`${item.label} is managed by MCOM Solutions.`)
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Business name is required.'
    else if (form.name.trim().length < 2) next.name = 'Business name must be at least 2 characters.'
    if (form.email && !emailRe.test(form.email.trim())) next.email = 'Enter a valid business email.'
    if (form.website && !urlRe.test(form.website.trim())) next.website = 'Website must start with http:// or https://.'
    if (form.phone && form.phone.replace(/\D/g, '').length < 6) next.phone = 'Enter a valid phone number.'
    if (form.description.length > 2000) next.description = 'Description must be 2,000 characters or fewer.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveBusiness = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || undefined, email: form.email.trim() || undefined, phone: form.phone.trim() || undefined, website: form.website.trim() || undefined, category_id: form.category_id || undefined }
      const saved = business ? await businessService.updateBusiness(business.id, payload) : await businessService.createBusiness(payload)
      if (!saved) { toast.error('Could not save your business profile.'); return }
      const locationPayload = { address: locationForm.address.trim() || undefined, city: locationForm.city.trim() || undefined, state: locationForm.state.trim() || undefined, country: locationForm.country.trim() || undefined }
      if (saved.locations?.[0]) await businessService.upsertLocation(saved.id, saved.locations[0].id, locationPayload)
      else if (Object.values(locationPayload).some(Boolean)) await businessService.upsertLocation(saved.id, null, locationPayload)
      setBusiness(await businessService.getBusiness(saved.id)); setEditOpen(false); toast.success('Business profile saved')
    } finally { setSaving(false) }
  }

  const saveHours = async () => {
    if (!business) { toast.error('Create your business profile first.'); return }
    setSaving(true)
    try {
      for (const h of hours) {
        const saved = await businessService.upsertHour(business.id, h.id || null, { day_of_week: h.day_of_week, opens_at: h.is_closed ? undefined : h.opens_at, closes_at: h.is_closed ? undefined : h.closes_at, is_closed: h.is_closed })
        if (!saved) { toast.error(`Could not save ${DAYS[h.day_of_week]} hours.`); return }
        h.id = saved.id
      }
      setBusiness(await businessService.getBusiness(business.id)); setHoursOpen(false); toast.success('Opening hours saved')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full px-3.5 py-3 min-h-[46px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500'

  return (
    <div className="space-y-6 animate-fadeIn max-w-lg">
      <Helmet><title>Settings - MCOMVCard</title></Helmet>
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything you need, right here.</p></div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Profile</p></div><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{verification}</span></div>
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shrink-0">{displayName.charAt(0)}</div>
            <div className="min-w-0 flex-1"><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{loading ? 'Loading…' : displayName}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{categoryName}{membership?.tier?.name ? ` · ${membership.tier.name}` : ''}</p><p className="text-[11px] text-gray-400 truncate">Owner · {user?.name || user?.email || '—'}</p></div>
            <button type="button" onClick={() => { setErrors({}); setEditOpen(true) }} className="shrink-0 rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white hover:bg-orange-600">Edit</button>
          </div>
          <div className="mt-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">About</p><p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{business?.description || 'No business description yet. Use Edit to add one.'}</p></div>
          <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
            <ProfileRow icon={HOURS_ICON} label="Opening hours" value={openingHours} />
            <ProfileRow icon={PIN_ICON} label="Address" value={locationText} />
            <ProfileRow icon={MAP_ICON} label="Location" value={locationForm.city || locationForm.country ? [locationForm.city, locationForm.country].filter(Boolean).join(', ') : '—'} />
            <ProfileRow icon={PHONE_ICON} label="Phone" value={business?.phone || '—'} href={business?.phone ? `tel:${business.phone.replace(/\s/g, '')}` : undefined} />
            <ProfileRow icon={MAIL_ICON} label="Email" value={business?.email || '—'} href={business?.email ? `mailto:${business.email}` : undefined} />
            <ProfileRow icon={WEB_ICON} label="Website" value={business?.website || '—'} href={business?.website || undefined} />
          </div>
          <div className="mt-3"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Social links</p><p className="rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-400 dark:bg-gray-700/40">No social links connected yet. Social links added to your VCard appear here.</p></div>
          <div className="mt-3"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Business images</p><p className="rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-400 dark:bg-gray-700/40">Add images from your VCard editor. They will be listed here.</p></div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">Identity & affiliation</p>
          <div className="divide-y divide-gray-100 dark:divide-gray-700"><IdentityRow label="Business ID" value={business?.id ?? '—'} /><IdentityRow label="MCOM Affiliate ID" value={user?.is_affiliate ? 'Linked' : 'Not linked'} /></div>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2"><svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={g.icon} /></svg><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{g.title}</p></div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {g.items.map((item) => (
              <button key={item.label} onClick={() => handleAction(item)} className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.subtitle}</p></div>
                {item.action === 'toggle' ? <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${toggles[item.label] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${toggles[item.label] ? 'translate-x-5' : ''}`} /></span> : <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center">Business configuration and templates are managed by the Admin dashboard through MCOM Solutions.</p>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setEditOpen(false)}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-gray-800 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700 sm:hidden" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit business profile</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Changes are saved to your business record and appear on your public profile.</p>
            <div className="mt-4 space-y-3">
              <Field label="Business name" tooltip="The public name customers see on your VCard, cards and business profile." required error={errors.name}><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
              <Field label="Category" tooltip="The business category used for directory search and template eligibility."><select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputCls}><option value="">No category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Description" tooltip="A short introduction shown on your public business profile." error={errors.description}><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} /></Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Business email" tooltip="Customer-facing email address. Used for enquiries and support replies." error={errors.email}><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field><Field label="Phone" tooltip="Customer-facing phone number, shown on your profile." error={errors.phone}><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field></div>
              <Field label="Website" tooltip="Full URL including https://. Shown as a link on your profile." error={errors.website}><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" className={inputCls} /></Field>
              <p className="pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Location</p>
              <Field label="Address" tooltip="Street address for your primary location."><input value={locationForm.address} onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })} className={inputCls} /></Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Field label="City" tooltip="City or town for your primary location."><input value={locationForm.city} onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })} className={inputCls} /></Field><Field label="State/Region" tooltip="State, county or region."><input value={locationForm.state} onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })} className={inputCls} /></Field><Field label="Country" tooltip="Country for your primary location."><input value={locationForm.country} onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })} className={inputCls} /></Field></div>
            </div>
            <div className="mt-5 flex gap-2"><button onClick={() => setEditOpen(false)} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">Cancel</button><button onClick={saveBusiness} disabled={saving} className="flex-1 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button></div>
          </div>
        </div>
      )}

      {hoursOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setHoursOpen(false)}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-gray-800 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700 sm:hidden" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Opening hours</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Set the hours customers can reach you. Closed days are hidden from bookings.</p>
            <div className="mt-4 space-y-2">{hours.map((h, index) => <div key={h.day_of_week} className="rounded-xl border border-gray-100 p-3 dark:border-gray-700"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-gray-900 dark:text-white">{DAYS[h.day_of_week]}</span><label className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">Closed<input type="checkbox" checked={h.is_closed} onChange={(e) => setHours((prev) => prev.map((x, i) => i === index ? { ...x, is_closed: e.target.checked } : x))} className="h-4 w-4 rounded border-gray-300 text-orange-500" /></label></div>{!h.is_closed && <div className="mt-2 grid grid-cols-2 gap-2"><div><label className="mb-1 flex items-center text-[10px] font-semibold text-gray-400">Opens<InfoTooltip text="Time the business opens on this day." /></label><input type="time" value={h.opens_at} onChange={(e) => setHours((prev) => prev.map((x, i) => i === index ? { ...x, opens_at: e.target.value } : x))} className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div><div><label className="mb-1 flex items-center text-[10px] font-semibold text-gray-400">Closes<InfoTooltip text="Time the business closes on this day." /></label><input type="time" value={h.closes_at} onChange={(e) => setHours((prev) => prev.map((x, i) => i === index ? { ...x, closes_at: e.target.value } : x))} className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div></div>}</div>)}</div>
            <div className="mt-5 flex gap-2"><button onClick={() => setHoursOpen(false)} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">Cancel</button><button onClick={saveHours} disabled={saving} className="flex-1 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50">{saving ? 'Saving…' : 'Save hours'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, tooltip, required, error, children }: { label: string; tooltip: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300">{label}{required && <span className="ml-0.5 text-red-500">*</span>}<InfoTooltip text={tooltip} /></label>{children}{error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}</div>
}
function IdentityRow({ label, value }: { label: string; value: string }) {
  const copy = () => { try { navigator.clipboard?.writeText(value) } catch {} toast.success(`${label} copied`) }
  return <div className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-all font-mono">{value}</p></div><button onClick={copy} title={`Copy ${label}`} className="text-orange-500 hover:text-orange-600 shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button></div>
}
function ProfileRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return <div className="py-3 flex items-start gap-2.5"><div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg></div><div className="min-w-0"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 dark:text-white break-all hover:text-orange-600">{value}</a> : <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>}</div></div>
}
