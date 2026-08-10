import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { MockConsumer } from '../../services/mockData'
import QRExpandOverlay from './vcard/QRExpandOverlay'

interface ConsumerVCardProps {
    profile: MockConsumer
    onTap?: () => void
}

function getMembershipGradient(membership: string): string {
    const m = membership.toLowerCase()
    if (m.includes('platinum')) return 'from-slate-600 via-slate-800 to-slate-950'
    if (m.includes('gold')) return 'from-amber-400 via-yellow-500 to-amber-700'
    if (m.includes('silver')) return 'from-slate-300 via-slate-400 to-slate-600'
    return 'from-amber-500 via-orange-600 to-amber-800'
}

function getMembershipBadge(membership: string): string {
    const m = membership.toLowerCase()
    if (m.includes('platinum')) return 'bg-white/15 text-white border-white/30'
    if (m.includes('gold')) return 'bg-amber-200/25 text-amber-100 border-amber-200/40'
    if (m.includes('silver')) return 'bg-white/15 text-white border-white/30'
    return 'bg-orange-200/25 text-orange-50 border-orange-200/40'
}

function getSeason(): string {
    const m = new Date().getMonth() + 1
    if (m >= 3 && m <= 5) return 'Spring 2026'
    if (m >= 6 && m <= 8) return 'Summer 2026'
    if (m >= 9 && m <= 11) return 'Autumn 2026'
    return 'Winter 2026'
}

export default function ConsumerVCard({ profile, onTap }: ConsumerVCardProps) {
    const [qrOpen, setQrOpen] = useState(false)
    const qrRef = useRef<HTMLCanvasElement>(null)
    const gradient = getMembershipGradient(profile.membership)
    const badge = getMembershipBadge(profile.membership)

    const qrValue = `https://mcomvcard.link/c/${profile.cardId || 'card'}`

    const connectedBusinesses = useMemo(() => {
        const list: { name: string; isPrimary: boolean }[] = []
        if (profile.primaryIssuingBusiness) list.push({ name: profile.primaryIssuingBusiness, isPrimary: true })
        ;(profile.savedCards || []).forEach((c) => {
            if (!list.some((b) => b.name === c.business)) list.push({ name: c.business, isPrimary: false })
        })
        return list
    }, [profile])

    useEffect(() => {
        if (qrRef.current) {
            QRCode.toCanvas(qrRef.current, qrValue, { width: 92, margin: 1, errorCorrectionLevel: 'H' })
                .catch(() => { /* ignore */ })
        }
    }, [qrValue])

    const handleTap = () => {
        onTap?.()
        setQrOpen(true)
    }

    return (
        <>
            <button
                onClick={handleTap}
                className="w-full text-left group relative overflow-hidden rounded-[28px] p-6 shadow-2xl shadow-black/30 transition-transform active:scale-[0.98] animate-zoomPulse"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                {/* Animated shine sweep */}
                <div className="absolute inset-0 overflow-hidden rounded-[28px]">
                    <div className="absolute -inset-x-20 top-0 h-full w-44 bg-white/15 blur-2xl rotate-12 animate-shine" />
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 animate-float" />
                <div className="absolute -bottom-24 -left-12 w-60 h-60 rounded-full bg-black/10" />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

                <div className="relative">
                    {/* Top row: badges */}
                    <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badge}`}>
                            {profile.membership}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold border border-white/25">
                            {getSeason()}
                        </span>
                    </div>

                    {/* Card body: identity + QR */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border border-white/25 shadow-inner shrink-0">
                                {profile.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-lg font-bold leading-tight truncate">{profile.name}</p>
                                <p className="text-white/70 text-xs mt-0.5 font-mono tracking-wide">{profile.cardId}</p>
                                <p className="text-white/60 text-xs mt-1 truncate">Issued by {profile.primaryIssuingBusiness}</p>
                            </div>
                        </div>
                        <div className="shrink-0 bg-white rounded-2xl p-2.5 shadow-lg">
                            <canvas ref={qrRef} className="w-[84px] h-[84px]" />
                        </div>
                    </div>

                    {/* Connected businesses */}
                    {connectedBusinesses.length > 0 && (
                        <div className="mt-4">
                            <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mb-1.5 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Connected businesses
                            </p>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-white/25 border-white/40 text-white min-w-0">
                                    <span className="w-4 h-4 rounded-md bg-white/20 flex items-center justify-center text-[9px] font-bold shrink-0">
                                        {connectedBusinesses[0].name.charAt(0)}
                                    </span>
                                    <span className="truncate max-w-[130px]">{connectedBusinesses[0].name}</span>
                                    <span className="text-[8px] uppercase tracking-wider text-white/70 shrink-0">Issuer</span>
                                </span>
                                {connectedBusinesses.length > 1 && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-white/10 border-white/20 text-white/85 shrink-0">
                                        +{connectedBusinesses.length - 1}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom hint */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20h2m-2-4h4m0-8h.01M17 8h.01" />
                            </svg>
                            Tap to show QR code
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h4m0-10V7a2 2 0 00-2-2H8a2 2 0 00-2 2v10a2 2 0 002 2h4a2 2 0 002-2v-3" />
                            </svg>
                            NFC Ready
                        </div>
                    </div>
                </div>
            </button>

            <QRExpandOverlay open={qrOpen} onClose={() => setQrOpen(false)} profile={profile} />
        </>
    )
}
