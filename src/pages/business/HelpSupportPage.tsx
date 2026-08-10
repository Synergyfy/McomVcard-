import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PageHeader from '../../components/business/primitives/PageHeader'

const FAQS = [
    { q: 'How do I update my business information?', a: 'Business information is synced from MCOM Solutions. To update your name, logo, category or contact details, please update them in MCOM Solutions and they will appear here automatically.' },
    { q: 'Why can I not edit my card template?', a: 'Templates are configured by the Admin dashboard based on your membership, sector and business type. You can only update approved content fields. Contact support if you need a different template.' },
    { q: 'How do I get more VCards or Cards?', a: 'Your allocation is determined by your membership plan. To increase your limits, upgrade your membership through MCOM Solutions.' },
    { q: 'What happens when Admin updates a template?', a: 'When Admin changes a template, every assigned business automatically receives the update. You will see a notification and the template will show "Needs update" until you review it.' },
    { q: 'How do I enable password access?', a: 'Open the VCard or Card, go to the Password tab, and toggle password protection on. This is available if your membership includes password access.' },
]

const TOPICS = [
    {
        title: 'Membership help',
        items: [
            { q: 'How do I upgrade or renew my membership?', a: 'Open Membership from the sidebar. Renewals and upgrades are processed through MCOM Solutions and apply immediately.' },
            { q: 'How do membership limits work?', a: 'VCards, Cards, campaigns and benefits are capped by your plan. Upgrade through MCOM Solutions to unlock more.' },
        ],
    },
    {
        title: 'VCard help',
        items: [
            { q: 'How do I change my VCard template?', a: 'Go to Settings → VCard → Template. Templates are approved by Admin and applied automatically.' },
            { q: 'How do I protect my VCard with a password?', a: 'Open the VCard, go to the Password tab, and set a 6-digit PIN to restrict access.' },
            { q: 'How do I share my VCard?', a: 'Use the Share button or your QR code. Customers scan to save your VCard.' },
        ],
    },
    {
        title: 'Card help',
        items: [
            { q: 'How do I create or edit a Card?', a: 'Open Cards from the sidebar, choose a template and fill the approved content fields.' },
            { q: 'How do I print or download my card?', a: 'Open the card and use Print/Download to export a PDF for physical printing.' },
            { q: 'How do I track my QR scans?', a: 'Open QR Code from the sidebar to see how many times your card QR has been scanned.' },
        ],
    },
    {
        title: 'Rewards help',
        items: [
            { q: 'How do I issue rewards?', a: 'Go to Rewards → Issue Reward, choose points or perks, and select the customer.' },
            { q: 'How do cashback and coupons work?', a: 'Set a cashback rate or create coupon codes. Customers redeem them against your offers.' },
            { q: 'How do I view redeem history?', a: 'Open Rewards → Redeem History to see every completed redemption.' },
        ],
    },
    {
        title: 'Appointment help',
        items: [
            { q: 'How do I set my availability?', a: 'Go to Settings → Appointments → Availability to set your hours and slots.' },
            { q: 'Can I charge for bookings?', a: 'Yes. Enable Free/paid under Settings → Appointments to add a booking fee.' },
            { q: 'How are booking reminders sent?', a: 'Reminders follow your notification preferences — Email, SMS or Push.' },
        ],
    },
]

export default function HelpSupportPage() {
    const [open, setOpen] = useState<number | null>(0)
    const [openTopic, setOpenTopic] = useState<number | null>(0)
    const [sent, setSent] = useState(false)

    return (
        <div>
            <Helmet><title>Help & Support - MCOMVCard</title></Helmet>
            <PageHeader title="Help & Support" subtitle="Find answers and get in touch with our team" />

            {/* Search */}
            <div className="relative mb-6">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search help articles..." className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            {/* FAQ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequently asked questions</h2>
                <div className="space-y-2">
                    {FAQS.map((f, i) => (
                        <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{f.q}</span>
                                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {open === i && (
                                <div className="px-4 pb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{f.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Help by topic */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Help by topic</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Quick answers for the areas you use most.</p>
                <div className="space-y-2">
                    {TOPICS.map((t, i) => (
                        <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOpenTopic(openTopic === i ? null : i)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</span>
                                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openTopic === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {openTopic === i && (
                                <div className="px-4 pb-4 space-y-3">
                                    {t.items.map((item) => (
                                        <div key={item.q}>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-0.5">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Contact support</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Our team typically responds within 24 hours.</p>
                {sent ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Message sent</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">We will get back to you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Subject</label>
                            <input type="text" required placeholder="How can we help?" className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Message</label>
                            <textarea required rows={4} placeholder="Describe your issue..." className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <button type="submit" className="px-5 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                            Send message
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}