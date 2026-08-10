import type { ReactNode } from 'react'

export const CONTACT_ICONS = {
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
    share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
}

export const SECTION_STYLES: Record<string, { icon: string; color: string }> = {
    services: { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    appointments: { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' },
    wallet: { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
    rewards: { icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
    exchange: { icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    redeem: { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400' },
    offers: { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400' },
}

export const SERVICES = [
    { name: 'Business Consultancy', desc: 'Strategy & growth planning', price: 'From £75' },
    { name: 'Brand Design', desc: 'Logos, identity, guidelines', price: 'From £120' },
    { name: 'Digital Marketing', desc: 'Social & SEO campaigns', price: 'From £90' },
]

export const APPOINTMENTS = [
    { title: 'Strategy Session', when: 'Tomorrow · 10:30', business: 'GreenLeaf Coffee' },
    { title: 'Brand Review', when: 'Fri · 14:00', business: 'GreenLeaf Coffee' },
]

export const EXCHANGES = [
    { title: 'Coffee Voucher', detail: '2 vouchers available', value: '2 for 1' },
    { title: 'Salon Treat', detail: '1 voucher available', value: 'Free cut' },
]

export const REDEEMS = [
    { title: 'Free Coffee', detail: 'Bronze reward', value: 'Redeem' },
    { title: '10% Off Lunch', detail: 'Weekly offer', value: 'Redeem' },
]

export const OFFERS = [
    { title: 'GreenLeaf Coffee', detail: 'Free pastry with any drink', value: '2km' },
    { title: 'Bloom Beauty Salon', detail: '20% off first visit', value: '1.2km' },
]

export function SectionCard({ title, icon, color, children, locked }: { title: string; icon: string; color: string; children: ReactNode; locked: boolean }) {
    return (
        <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <span className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                    </svg>
                </span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex-1">{title}</h2>
                {locked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wide">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Protected
                    </span>
                )}
            </div>
            <div className="space-y-2.5">{children}</div>
        </section>
    )
}

export function Row({ title, desc, value, icon }: { title: string; desc?: string; value?: string; icon?: keyof typeof CONTACT_ICONS }) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
            <div className="flex items-center gap-3 min-w-0">
                {icon && (
                    <span className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CONTACT_ICONS[icon]} />
                        </svg>
                    </span>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
                    {desc && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</p>}
                </div>
            </div>
            {value && <span className="text-xs font-bold text-accent-500 shrink-0">{value}</span>}
        </div>
    )
}

export function ProtectedDivider() {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-gray-50 dark:bg-gray-950 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Protected Content
                </span>
            </div>
        </div>
    )
}
