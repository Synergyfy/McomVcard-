import { useState } from 'react'
import type { MockConsumer } from '../../../services/mockData'
import QRExpandOverlay from './QRExpandOverlay'

interface VCardHeroProps {
    profile: MockConsumer
}

function getMembershipGradient(membership: string): string {
    const m = membership.toLowerCase()
    if (m.includes('platinum')) return 'from-slate-700 via-slate-800 to-slate-950'
    if (m.includes('gold')) return 'from-amber-400 via-yellow-500 to-amber-700'
    if (m.includes('silver')) return 'from-slate-300 via-slate-400 to-slate-600'
    return 'from-amber-600 via-orange-700 to-amber-900'
}

function getMembershipBadge(membership: string): string {
    const m = membership.toLowerCase()
    if (m.includes('platinum')) return 'bg-slate-200/20 text-slate-100 border-slate-200/30'
    if (m.includes('gold')) return 'bg-amber-200/20 text-amber-100 border-amber-200/30'
    if (m.includes('silver')) return 'bg-slate-200/20 text-slate-100 border-slate-200/30'
    return 'bg-orange-200/20 text-orange-100 border-orange-200/30'
}

export default function VCardHero({ profile }: VCardHeroProps) {
    const [qrOpen, setQrOpen] = useState(false)
    const gradient = getMembershipGradient(profile.membership)
    const badge = getMembershipBadge(profile.membership)

    return (
        <>
            <button
                onClick={() => setQrOpen(true)}
                className={`w-full text-left group relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br ${gradient} shadow-2xl shadow-black/20 transition-transform active:scale-[0.98]`}
            >
                {/* Animated shine sweep */}
                <div className="absolute inset-0 overflow-hidden rounded-[28px]">
                    <div className="absolute -inset-x-20 top-0 h-full w-40 bg-white/10 blur-2xl rotate-12 animate-shine" />
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
                <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-black/10" />

                <div className="relative">
                    {/* Top row: badges */}
                    <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge}`}>
                            {profile.membership}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold border border-white/20">
                            Season 2026
                        </span>
                    </div>

                    {/* Card body */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border border-white/25 shadow-inner">
                            {profile.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-lg font-bold leading-tight truncate">{profile.name}</p>
                            <p className="text-white/70 text-xs mt-0.5">{profile.cardId}</p>
                            <p className="text-white/70 text-xs mt-0.5">Issued by {profile.primaryIssuingBusiness}</p>
                        </div>
                    </div>

                    {/* QR hint */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20h2m-2-4h4m0-8h.01M17 8h.01" />
                            </svg>
                            Tap to show QR code
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/25">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20h2m-2-4h4m0-8h.01M17 8h.01" />
                            </svg>
                        </div>
                    </div>
                </div>
            </button>

            <QRExpandOverlay open={qrOpen} onClose={() => setQrOpen(false)} profile={profile} />
        </>
    )
}