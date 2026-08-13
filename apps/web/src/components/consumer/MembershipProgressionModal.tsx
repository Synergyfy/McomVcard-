import { useEffect } from 'react'
import type { MockConsumer } from '../../services/mockData'

export const LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const
export const TIERS = ['Standard', 'Pro', 'Pro+'] as const

export function parseMembership(name: string): { level: string; tier: string } {
    const parts = name.trim().split(/\s+/)
    return { level: parts[0] || 'Bronze', tier: parts.slice(1).join(' ') || 'Standard' }
}

export function buildLadder(): string[] {
    return LEVELS.flatMap((l) => TIERS.map((t) => `${l} ${t}`))
}

export interface Requirement {
    label: string
    icon: string
    used: number
    target: number
    unit?: string
    hint?: string
}

export function qualificationRequirements(profile: MockConsumer, target: string): Requirement[] {
    const { level, tier } = parseMembership(target)
    const li = LEVELS.indexOf(level as (typeof LEVELS)[number])
    const ti = TIERS.indexOf(tier as (typeof TIERS)[number])
    const liSafe = li >= 0 ? li : 0
    const tiSafe = ti >= 0 ? ti : 0
    const mult = liSafe + 1
    return [
        {
            label: 'Loyalty points',
            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
            used: profile.wallet.points,
            target: 250 * mult * (tiSafe + 1),
            unit: 'pts',
            hint: 'Earn points from every tap, purchase and offer you use.',
        },
        {
            label: 'Referrals',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
            used: profile.referrals?.length ?? 0,
            target: 2 * mult + tiSafe,
            unit: 'friends',
            hint: 'Invite friends through your referral link.',
        },
        {
            label: 'Card scans',
            icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 8a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17h3.839a.75.75 0 00.53-.919c-.083-.322-.173-.657-.263-1.003m0 0a15.976 15.976 0 00-2.595-6.625',
            used: profile.stats?.scans ?? 0,
            target: 150 * mult * (tiSafe + 1),
            unit: 'scans',
            hint: 'Scan and tap cards across participating businesses.',
        },
        {
            label: 'Connected businesses',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            used: profile.savedCards?.length ?? 0,
            target: 3 + liSafe + tiSafe,
            unit: 'businesses',
            hint: 'Connect cards from different businesses.',
        },
    ]
}

interface MembershipProgressionModalProps {
    open: boolean
    onClose: () => void
    profile: MockConsumer
    current: string
    target: string
    nextLevel?: string
}

export default function MembershipProgressionModal({ open, onClose, profile, current, target, nextLevel }: MembershipProgressionModalProps) {
    const requirements = qualificationRequirements(profile, target)
    const { level: targetLevel } = parseMembership(target)
    const isNextLevel = !!nextLevel && targetLevel === nextLevel

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    const allMet = requirements.every((r) => r.used >= r.target)

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="shrink-0 bg-gradient-to-br from-accent-500 to-accent-600 px-6 pt-6 pb-5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-start justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                                {isNextLevel ? 'Next Available Level' : 'Next Step'}
                            </p>
                            <button onClick={onClose} className="p-1.5 -m-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors" aria-label="Close">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white mt-1">{target}</h2>
                        <p className="text-sm text-white/80 mt-1">
                            {isNextLevel && nextLevel
                                ? `Unlocks the ${nextLevel} level — the next milestone after ${current}.`
                                : `What it takes to move from ${current} to ${target}.`}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div className={`p-3 rounded-2xl border text-center text-sm font-semibold ${
                        allMet
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                        {allMet
                            ? 'You have met every requirement — you are ready to progress!'
                            : 'Keep building your activity. Every requirement below must be met to qualify.'}
                    </div>

                    {requirements.map((r) => {
                        const pct = Math.min(100, Math.round((r.used / r.target) * 100))
                        const met = r.used >= r.target
                        return (
                            <div key={r.label} className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    met
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                                }`}>
                                    {met ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={r.icon} />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.label}</p>
                                        <p className={`text-xs font-bold whitespace-nowrap ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {r.used.toLocaleString()} / {r.target.toLocaleString()} {r.unit}
                                        </p>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-1.5">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${met ? 'bg-emerald-500' : 'bg-gradient-to-r from-accent-400 to-accent-600'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{r.hint}</p>
                                </div>
                            </div>
                        )
                    })}

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">How it works</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            Your membership is earned through activity with businesses on MCOMVCard — there is nothing to buy.
                            Once you meet the requirements above, you can progress to <strong className="text-gray-700 dark:text-gray-200">{target}</strong>{' '}
                            automatically at the start of the next season.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}
