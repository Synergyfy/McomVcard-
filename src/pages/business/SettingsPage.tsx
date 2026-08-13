import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { mockBusinessProfile } from '../../services/businessStore'

type Group = { title: string; icon: string; items: { label: string; subtitle: string; action?: 'toggle' | 'link'; to?: string }[] }

const HOURS_ICON = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
const PIN_ICON = 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
const MAP_ICON = 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 0v13m0 0l-6 3'
const PHONE_ICON = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
const MAIL_ICON = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
const WEB_ICON = 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
const LINK_ICON = 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'

const groups: Group[] = [
    {
        title: 'Account',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        items: [
            { label: 'Name', subtitle: 'Owner & business contact name' },
            { label: 'Email', subtitle: 'Primary account email' },
            { label: 'Password', subtitle: 'Update your password' },
            { label: 'Security', subtitle: 'Logins, sessions & protection' },
            { label: 'Two-factor authentication', subtitle: 'Add extra security', action: 'toggle' },
        ],
    },
    {
        title: 'Business',
        icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M15 9h.01M15 12h.01M15 15h.01',
        items: [
            { label: 'Business profile', subtitle: 'Name, logo, description' },
            { label: 'Contact', subtitle: 'Phone, email, website' },
            { label: 'Location', subtitle: 'Address & map pin' },
            { label: 'Opening hours', subtitle: 'When customers can reach you' },
        ],
    },
    {
        title: 'VCard',
        icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
        items: [
            { label: 'Template', subtitle: 'Choose your VCard style', action: 'link', to: '/b/cards' },
            { label: 'Visibility', subtitle: 'Who can find your VCard' },
            { label: 'Sections', subtitle: 'Which sections to show' },
            { label: 'Password protection', subtitle: 'Restrict access with a PIN' },
            { label: 'QR', subtitle: 'Your VCard QR code', action: 'link', to: '/b/qr' },
        ],
    },
    {
        title: 'Business Card',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        items: [
            { label: 'Template', subtitle: 'Choose your card style', action: 'link', to: '/b/cards' },
            { label: 'Visibility', subtitle: 'Who can see your card' },
            { label: 'QR', subtitle: 'Where your QR points to', action: 'link', to: '/b/qr' },
            { label: 'Print/download', subtitle: 'Get a printable PDF' },
        ],
    },
    {
        title: 'Appointments',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        items: [
            { label: 'Availability', subtitle: 'Your booking hours & slots' },
            { label: 'Free / paid', subtitle: 'Charge for bookings or not' },
            { label: 'Booking rules', subtitle: 'Lead time, reminders, no-shows' },
        ],
    },
    {
        title: 'Notifications',
        icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        items: [
            { label: 'Email notifications', subtitle: 'Reports & updates', action: 'toggle' },
            { label: 'SMS notifications', subtitle: 'Text message alerts', action: 'toggle' },
            { label: 'Push notifications', subtitle: 'On-device alerts', action: 'toggle' },
            { label: 'In-app notifications', subtitle: 'Activity alerts', action: 'toggle' },
        ],
    },
    {
        title: 'Rewards',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        items: [
            { label: 'Reward preferences', subtitle: 'Points, coupons, cashback', action: 'link', to: '/b/rewards' },
            { label: 'Redemption rules', subtitle: 'Set how rewards are used' },
        ],
    },
    {
        title: 'Integrations',
        icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
        items: [
            { label: 'MCOM Solutions', subtitle: 'Connected MCOM platform services', action: 'link', to: '/b/integrations' },
            { label: 'MCOM Rewards', subtitle: 'Points, coupons & cashback', action: 'link', to: '/b/integrations' },
            { label: 'MCOMMall', subtitle: 'List products for sale', action: 'link', to: '/b/integrations' },
            { label: 'Payment', subtitle: 'Payments & Global Pay' },
            { label: 'Other approved integrations', subtitle: 'More approved solutions' },
        ],
    },
]

export default function BusinessSettingsPage() {
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        'Email notifications': true,
        'SMS notifications': true,
        'Push notifications': true,
        'In-app notifications': true,
        'Two-factor authentication': false,
    })

    const click = (item: Group['items'][number]) => {
        if (item.to) {
            window.location.href = item.to
            return
        }
        toast.success(`${item.label} opened`)
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Settings - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything you need, right here.</p>
            </div>

            {/* ── Business profile (read-only, from central profile) ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                        </svg>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Profile</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {mockBusinessProfile.verificationStatus === 'verified' ? 'Verified' : mockBusinessProfile.verificationStatus.charAt(0).toUpperCase() + mockBusinessProfile.verificationStatus.slice(1)}
                    </span>
                </div>

                <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                            {mockBusinessProfile.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{mockBusinessProfile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mockBusinessProfile.category} · {mockBusinessProfile.sector}</p>
                            <p className="text-[11px] text-gray-400 truncate">Owner · {mockBusinessProfile.owner}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">About</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{mockBusinessProfile.description}</p>
                    </div>

                    {/* Contact & hours */}
                    <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                        <ProfileRow icon={HOURS_ICON} label="Opening hours" value={mockBusinessProfile.openingHours} />
                        <ProfileRow icon={PIN_ICON} label="Address" value={mockBusinessProfile.address} />
                        <ProfileRow icon={MAP_ICON} label="Location" value={mockBusinessProfile.location} />
                        <ProfileRow icon={PHONE_ICON} label="Phone" value={mockBusinessProfile.phone} href={`tel:${mockBusinessProfile.phone.replace(/\s/g, '')}`} />
                        <ProfileRow icon={MAIL_ICON} label="Email" value={mockBusinessProfile.email} href={`mailto:${mockBusinessProfile.email}`} />
                        <ProfileRow icon={WEB_ICON} label="Website" value={mockBusinessProfile.website} href={mockBusinessProfile.website} />
                    </div>

                    {/* Social links */}
                    <div className="mt-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Social links</p>
                        <div className="flex flex-wrap gap-1.5">
                            {mockBusinessProfile.socialLinks.map(s => (
                                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 text-[10px] font-medium text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={LINK_ICON} /></svg>
                                    {s.platform}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Business images */}
                    <div className="mt-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Business images</p>
                        <div className="flex gap-2">
                            {mockBusinessProfile.businessImages.map((img, i) => (
                                <div key={i} className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden relative">
                                    {mockBusinessProfile.name.charAt(0)}
                                    <img src={img} alt={`${mockBusinessProfile.name} image ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Identity & affiliation (admin-managed) */}
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">Identity & affiliation</p>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <IdentityRow label="Brand ID" value={mockBusinessProfile.brandId} managed />
                        <IdentityRow label="MCOM Affiliate ID" value={mockBusinessProfile.affiliateId} managed />
                        <div className="py-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">QR branding</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your dynamic QR is branded with your business name and MCOM marks, styled per the MCOM QR design system.</p>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-semibold">Fixed</span>
                        </div>
                    </div>
                </div>
            </div>

            {groups.map((g) => (
                <div key={g.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={g.icon} />
                        </svg>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{g.title}</p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {g.items.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => item.action === 'toggle' ? setToggles(t => ({ ...t, [item.label]: !t[item.label] })) : click(item)}
                                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.subtitle}</p>
                                </div>
                                {item.action === 'toggle' ? (
                                    <span className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${toggles[item.label] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${toggles[item.label] ? 'translate-x-5' : ''}`} />
                                    </span>
                                ) : (
                                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <p className="text-xs text-gray-400 text-center">
                Business configuration and templates are managed by the Admin dashboard through MCOM Solutions.
            </p>
        </div>
    )
}

function IdentityRow({ label, value, managed }: { label: string; value: string; managed?: boolean }) {
    const copy = () => {
        try { navigator.clipboard?.writeText(value) } catch { /* ignore */ }
        toast.success(`${label} copied`)
    }
    return (
        <div className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-all font-mono">{value}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {managed && <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-semibold">Admin-managed</span>}
                <button onClick={copy} title={`Copy ${label}`} className="text-orange-500 hover:text-orange-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
            </div>
        </div>
    )
}

function ProfileRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
    return (
        <div className="py-3 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 dark:text-white break-all hover:text-orange-600">{value}</a>
                ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
                )}
            </div>
        </div>
    )
}
