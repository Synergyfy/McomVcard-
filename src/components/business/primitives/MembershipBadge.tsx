import { Link } from 'react-router-dom'

interface MembershipBadgeProps {
    planLevel: string
    tier: string
    className?: string
}

export default function MembershipBadge({ planLevel, tier, className = '' }: MembershipBadgeProps) {
    return (
        <Link
            to="/business/membership"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10 border border-orange-200 dark:border-orange-800/40 ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                {planLevel} · {tier}
            </span>
        </Link>
    )
}