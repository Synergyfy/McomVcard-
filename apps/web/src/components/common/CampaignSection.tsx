import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export interface CampaignItem {
    id: number | string
    title: string
    subtitle?: string
    value?: string
    status?: string
    to?: string
    icon?: string
    gradient?: string
}

interface CampaignSectionProps {
    title?: string
    campaigns: CampaignItem[]
    emptyTitle?: string
    emptyMessage?: string
    viewAllTo?: string
    viewAllLabel?: string
}

const DEFAULT_ICON = 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z'

export default function CampaignSection({
    title = 'Current Campaigns',
    campaigns,
    emptyTitle = 'No campaigns available',
    emptyMessage = 'Check back soon — your businesses may run new campaigns.',
    viewAllTo,
    viewAllLabel = 'View All',
}: CampaignSectionProps) {
    return (
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
                {viewAllTo && campaigns.length > 0 && (
                    <Link to={viewAllTo} className="flex items-center gap-1 text-xs font-semibold text-accent-500">
                        {viewAllLabel}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                )}
            </div>

            {campaigns.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-11 h-11 mx-auto rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={DEFAULT_ICON} />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{emptyTitle}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{emptyMessage}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((campaign) => {
                        const inner = (
                            <>
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${campaign.gradient || 'from-accent-400 to-accent-600'} flex items-center justify-center text-white shrink-0 shadow-md`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={campaign.icon || DEFAULT_ICON} />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{campaign.title}</p>
                                        {campaign.status && <StatusBadge status={campaign.status} />}
                                    </div>
                                    {campaign.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{campaign.subtitle}</p>}
                                </div>
                                {campaign.value && <span className="text-xs font-bold text-accent-500 shrink-0">{campaign.value}</span>}
                            </>
                        )
                        const cls = 'flex items-center gap-3.5 p-3 rounded-2xl transition-colors active:scale-[0.99]'
                        return campaign.to ? (
                            <Link key={campaign.id} to={campaign.to} className={`${cls} hover:bg-gray-50 dark:hover:bg-gray-800/60`}>
                                {inner}
                            </Link>
                        ) : (
                            <div key={campaign.id} className={`${cls} bg-gray-50 dark:bg-gray-800/60`}>
                                {inner}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
