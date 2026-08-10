import { Link } from 'react-router-dom'
import type { MockConsumer } from '../../../services/mockData'

interface OwnerCardProps {
    profile: MockConsumer
}

export default function OwnerCard({ profile }: OwnerCardProps) {
    return (
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Your Card</h2>
                <Link to="/consumer/settings" className="flex items-center gap-1 text-xs font-semibold text-accent-500">
                    Edit
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </Link>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-500/20">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
                    {profile.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">{profile.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-[10px] font-bold uppercase tracking-wide">Owner</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{profile.cardId}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-accent-600 dark:text-accent-400 text-[10px] font-bold uppercase tracking-wide">
                        {profile.membership}
                    </span>
                </div>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                Your main card is always yours. It cannot be deleted or transferred — only edited.
            </p>
        </section>
    )
}
