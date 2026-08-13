import { Link } from 'react-router-dom'
import type { MockConsumer } from '../../services/mockData'

interface FamilyPreviewProps {
    profile: MockConsumer
}

export default function FamilyPreview({ profile }: FamilyPreviewProps) {
    const used = profile.allocatedAdditionalCards
    const total = profile.additionalEntitlements
    const remaining = Math.max(0, total - used)
    const cards = profile.additionalCards || []

    return (
        <Link
            to="/c/family"
            className="block bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 active:scale-[0.99] transition-transform"
        >
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Friends &amp; Family</h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-accent-500">
                    Manage
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>

            <div className="flex items-end justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-extrabold text-gray-900 dark:text-white text-xl">{used}</span>
                    <span className="text-gray-400"> / {total} used</span>
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{remaining} remaining</p>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500" style={{ width: `${Math.min(100, (used / total) * 100)}%` }} />
            </div>

            <div className="flex -space-x-3">
                {cards.slice(0, 4).map((card) => (
                    <div key={card.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {card.name.charAt(0)}
                    </div>
                ))}
                {remaining > 0 && (
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-2.5">
                {cards.slice(0, 2).map((card) => (
                    <div key={card.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-xs font-bold text-orange-600">
                            {card.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate">{card.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">{card.relationship}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Link>
    )
}
