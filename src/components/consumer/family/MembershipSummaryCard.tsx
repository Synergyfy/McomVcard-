import type { MockConsumer } from '../../../services/mockData'
import { getConsumerEntitlements } from '../../../services/consumerMembership'

interface MembershipSummaryCardProps {
    profile: MockConsumer
    familyUsed: number
    friendUsed: number
}

export default function MembershipSummaryCard({ profile, familyUsed, friendUsed }: MembershipSummaryCardProps) {
    const entitlements = getConsumerEntitlements(profile.membership)
    const familyRemaining = Math.max(0, entitlements.familyCards - familyUsed)
    const atLimit = familyUsed >= entitlements.familyCards

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl p-5 text-white shadow-lg shadow-accent-500/20">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-8 w-44 h-44 rounded-full bg-black/10" />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Current Membership</p>
                        <p className="text-xl font-extrabold mt-0.5">{profile.membership}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/20 border border-white/25 text-[11px] font-bold">
                        {profile.membershipStatus}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-white/70">Allowed</p>
                        <p className="text-lg font-extrabold">{entitlements.familyCards}</p>
                        <p className="text-[10px] text-white/70">family cards</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-white/70">Used</p>
                        <p className="text-lg font-extrabold">{familyUsed}</p>
                        <p className="text-[10px] text-white/70">cards</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-white/70">Remaining</p>
                        <p className="text-lg font-extrabold">{familyRemaining}</p>
                        <p className="text-[10px] text-white/70">cards</p>
                    </div>
                </div>

                {/* Segmented progress: ■■□□□□ */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    {Array.from({ length: entitlements.familyCards }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${i < familyUsed ? 'bg-white' : 'bg-white/30'}`}
                        />
                    ))}
                </div>
                <p className="text-xs text-white/80">
                    <span className="font-bold">{familyUsed}</span> of {entitlements.familyCards} family cards used ·{' '}
                    <span className="font-bold">{friendUsed}</span>/{entitlements.friendCards} friend cards
                </p>

                {atLimit && (
                    <div className="mt-4 rounded-2xl bg-black/20 backdrop-blur p-3.5 flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="text-xs font-semibold leading-snug">
                            You've reached your family card limit. Upgrade your membership to add more cards.
                        </p>
                    </div>
                )}

                <p className="text-[10px] text-white/70 mt-3">
                    Allowance comes from your {profile.membership} membership — upgrade to unlock more.
                </p>
            </div>
        </section>
    )
}
