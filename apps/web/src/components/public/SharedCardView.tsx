import { useState, useMemo, type ReactNode } from 'react'
import type { MockConsumer } from '../../services/mockData'
import type { CardProtectionState, ProtectedSectionKey } from '../../services/cardProtection'
import ProtectedCardGate from './ProtectedCardGate'
import ConsumerVCard from '../consumer/ConsumerVCard'
import { SectionCard, Row, ProtectedDivider, SECTION_STYLES, SERVICES, APPOINTMENTS, EXCHANGES, REDEEMS, OFFERS } from './sharedCardSections'

interface SharedCardViewProps {
    profile: MockConsumer
    protection: CardProtectionState
}

interface SectionDef {
    key: ProtectedSectionKey
    title: string
    icon: string
    color: string
    content: ReactNode
}

function ExpiredNotice() {
    return (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-2">Access Expired</p>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Temporary access has expired</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                The card owner set a time limit on this link. Ask them to renew access before you can open the card again.
            </p>
        </div>
    )
}

export default function SharedCardView({ profile, protection }: SharedCardViewProps) {
    const [unlocked, setUnlocked] = useState(false)
    const enabled = protection.enabled
    const expired = enabled && protection.expiresAt !== null && Date.now() > new Date(protection.expiresAt).getTime()

    const connectedBusinesses = useMemo(() => {
        const list: { name: string; isPrimary: boolean }[] = []
        if (profile.primaryIssuingBusiness) list.push({ name: profile.primaryIssuingBusiness, isPrimary: true })
        ;(profile.savedCards || []).forEach((c) => {
            if (!list.some((b) => b.name === c.business)) list.push({ name: c.business, isPrimary: false })
        })
        return list
    }, [profile])

    const sections: SectionDef[] = [
        { key: 'services', ...SECTION_STYLES.services, title: 'Services', content: SERVICES.map((s, i) => <Row key={i} title={s.name} desc={s.desc} value={s.price} />) },
        { key: 'appointments', ...SECTION_STYLES.appointments, title: 'Appointments', content: APPOINTMENTS.map((a, i) => <Row key={i} title={a.title} desc={a.when} value={a.business} />) },
        {
            key: 'wallet', ...SECTION_STYLES.wallet, title: 'Wallet', content: (
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { label: 'Cashback', value: `£${profile.wallet.cashback.toFixed(0)}` },
                        { label: 'Points', value: profile.wallet.points.toString() },
                        { label: 'Vouchers', value: profile.wallet.vouchers.toString() },
                    ].map((w) => (
                        <div key={w.label} className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                            <p className="text-base font-extrabold text-gray-900 dark:text-white">{w.value}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{w.label}</p>
                        </div>
                    ))}
                </div>
            ),
        },
        { key: 'rewards', ...SECTION_STYLES.rewards, title: 'Rewards', content: profile.rewardHistory.slice(0, 3).map((r, i) => <Row key={i} title={r.reward} desc={r.status} value={`${r.points} pts`} />) },
        { key: 'exchange', ...SECTION_STYLES.exchange, title: 'Exchange', content: EXCHANGES.map((e, i) => <Row key={i} title={e.title} desc={e.detail} value={e.value} />) },
        { key: 'redeem', ...SECTION_STYLES.redeem, title: 'Redeem', content: REDEEMS.map((r, i) => <Row key={i} title={r.title} desc={r.detail} value={r.value} />) },
        { key: 'offers', ...SECTION_STYLES.offers, title: 'Offers', content: OFFERS.map((o, i) => <Row key={i} title={o.title} desc={o.detail} value={o.value} />) },
    ]

    const alwaysSections = expired
        ? []
        : sections.filter((s) => !enabled || !protection.protectedSections[s.key])
    const protectedSections = enabled && !expired ? sections.filter((s) => protection.protectedSections[s.key]) : []

    return (
        <div className="space-y-5">
            {/* Membership card — always public, first section */}
            <ConsumerVCard profile={profile} />

            {/* Connected businesses — always public */}
            <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </span>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white flex-1">Connected Businesses</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold">{connectedBusinesses.length}</span>
                </div>
                <div className="space-y-2.5">
                    {connectedBusinesses.map((b) => (
                        <div key={b.name} className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
                                    {b.name.charAt(0)}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{b.name}</p>
                                    {b.isPrimary && <p className="text-xs text-gray-500 dark:text-gray-400">Primary issuing business</p>}
                                </div>
                            </div>
                            {b.isPrimary && (
                                <span className="text-[10px] font-bold uppercase tracking-wide text-accent-500 shrink-0">Primary</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Basic contact — always public */}
            <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Contact</h2>
                <div className="space-y-2.5">
                    <Row title={profile.phone} icon="phone" value="Call" />
                    <Row title={profile.email} icon="email" value="Email" />
                    <Row title={profile.location} icon="location" value="Map" />
                    <Row title={`${profile.name} on socials`} icon="share" value="Follow" />
                </div>
            </section>

            {expired ? (
                <ExpiredNotice />
            ) : (
                <>
                    {/* Public sections (toggled OFF or protection disabled) */}
                    {alwaysSections.map((s) => (
                        <SectionCard key={s.key} title={s.title} icon={s.icon} color={s.color} locked={false}>
                            {s.content}
                        </SectionCard>
                    ))}

                    {/* Protected content */}
                    {enabled && protectedSections.length > 0 && (
                        <>
                            <ProtectedDivider />

                            {unlocked ? (
                                <div className="space-y-5 animate-fadeIn">
                                    {protectedSections.map((s) => (
                                        <SectionCard key={s.key} title={s.title} icon={s.icon} color={s.color} locked>
                                            {s.content}
                                        </SectionCard>
                                    ))}
                                </div>
                            ) : (
                                <ProtectedCardGate cardId={profile.cardId} onUnlock={() => setUnlocked(true)} />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}
