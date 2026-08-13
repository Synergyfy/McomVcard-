import { useState, type ReactNode } from 'react'
import type { FamilyCardMember } from '../../services/familyCards'
import type { CardProtectionState, ProtectedSectionKey } from '../../services/cardProtection'
import ProtectedCardGate from './ProtectedCardGate'
import FamilyAvatar from '../consumer/family/FamilyAvatar'
import { SectionCard, Row, ProtectedDivider, SECTION_STYLES, SERVICES, APPOINTMENTS, EXCHANGES, REDEEMS, OFFERS } from './sharedCardSections'

interface SharedFamilyCardViewProps {
    member: FamilyCardMember
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

export default function SharedFamilyCardView({ member, protection }: SharedFamilyCardViewProps) {
    const [unlocked, setUnlocked] = useState(false)
    const enabled = protection.enabled
    const expired = enabled && protection.expiresAt !== null && Date.now() > new Date(protection.expiresAt).getTime()

    const sections: SectionDef[] = [
        { key: 'wallet', ...SECTION_STYLES.wallet, title: 'Wallet', content: (
            <div className="grid grid-cols-3 gap-2.5">
                {[
                    { label: 'Reward Balance', value: `${member.rewardBalance} pts` },
                    { label: 'Card Type', value: member.cardType },
                    { label: 'Last Used', value: member.lastUsed },
                ].map((w) => (
                    <div key={w.label} className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{w.value}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">{w.label}</p>
                    </div>
                ))}
            </div>
        ) },
        { key: 'rewards', ...SECTION_STYLES.rewards, title: 'Wish List', content: member.wishlist.length > 0
            ? member.wishlist.map((w, i) => <Row key={i} title={w.title} desc={w.price || 'No price set'} value="Wish" image={w.image} />)
            : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">No wishes added yet.</p> },
        { key: 'services', ...SECTION_STYLES.services, title: 'Services', content: SERVICES.map((s, i) => <Row key={i} title={s.name} desc={s.desc} value={s.price} />) },
        { key: 'appointments', ...SECTION_STYLES.appointments, title: 'Appointments', content: APPOINTMENTS.map((a, i) => <Row key={i} title={a.title} desc={a.when} value={a.business} />) },
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
            {/* Identity header — always public */}
            <header className="rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 sm:p-8 shadow-lg shadow-accent-500/20 overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-black/10" />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="xl" name={member.name} />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-extrabold">{member.name}</h1>
                            <span className="px-2.5 py-1 rounded-full bg-white/20 border border-white/25 text-[10px] font-bold uppercase tracking-wide">{member.relationship}</span>
                            <span className="px-2.5 py-1 rounded-full bg-white/20 border border-white/25 text-[10px] font-bold uppercase tracking-wide">{member.status}</span>
                        </div>
                        <p className="text-white/80 text-sm mt-1">{member.cardType} · {member.membership}</p>
                        <p className="text-white/70 text-xs mt-0.5 font-mono tracking-wide">{member.cardId}</p>
                        <p className="text-white/60 text-xs mt-1">Issued by {member.issuedBy}</p>
                    </div>
                </div>
            </header>

            {/* Basic contact — always public */}
            <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Contact</h2>
                <div className="space-y-2.5">
                    <Row title={member.phone} icon="phone" value="Call" />
                    {member.email && <Row title={member.email} icon="email" value="Email" />}
                    {member.dob && <Row title={`Date of Birth · ${member.dob}`} value="Details" />}
                </div>
            </section>

            {expired ? (
                <ExpiredNotice />
            ) : (
                <>
                    {alwaysSections.map((s) => (
                        <SectionCard key={s.key} title={s.title} icon={s.icon} color={s.color} locked={false}>
                            {s.content}
                        </SectionCard>
                    ))}

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
                                <ProtectedCardGate cardId={member.cardId} onUnlock={() => setUnlocked(true)} />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}
