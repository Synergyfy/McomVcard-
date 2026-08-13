import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockCampaigns, type RewardCampaign } from '../../../services/businessDashboardStore'

interface AvailableCampaign {
    name: string
    type: string
    description: string
}

const AVAILABLE_CAMPAIGNS: AvailableCampaign[] = [
    { name: 'Spring Expo Promo', type: 'Seasonal', description: 'Seasonal push timed to the Spring Expo — drive footfall and limited-time offers.' },
    { name: 'Loyalty Boost', type: 'Evergreen', description: 'Always-on points boost to keep customers coming back all year round.' },
    { name: 'Referral Rewards', type: 'Referral', description: 'Reward customers who bring friends into your business.' },
]

function budgetPct(c: RewardCampaign): number {
    const b = parseInt(c.budget.replace(/[^0-9]/g, ''), 10) || 0
    const r = parseInt(c.remaining.replace(/[^0-9]/g, ''), 10) || 0
    if (b <= 0) return 0
    return Math.min(100, Math.round(((b - r) / b) * 100))
}

export default function CampaignsPage() {
    const navigate = useNavigate()
    const [activated, setActivated] = useState<string[]>([])

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Campaigns - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Launch and manage promotions your customers will love.</p>
                </div>
                <button className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md">
                    New Campaign
                </button>
            </div>

            <div className="space-y-3">
                {mockCampaigns.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.type} · {c.redemptions} redemptions</p>
                            </div>
                            <StatusPill status={c.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                                <p className="text-[11px] font-semibold text-gray-400">Participation</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{c.participants} customers</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                                <p className="text-[11px] font-semibold text-gray-400">Campaign reward</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{c.reward}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-500">Reached</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">{c.performance.impressions.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-500">Converted</span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">{c.performance.conversions.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Budget used</span>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{c.budget} · {c.remaining} left</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${budgetPct(c)}%` }} />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                            <div className="flex items-center gap-2 min-w-0">
                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6v6m-9 3l9-9" />
                                </svg>
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.link}</span>
                            </div>
                            <button
                                onClick={() => { navigator.clipboard?.writeText(`https://${c.link}`); toast.success('Campaign link copied') }}
                                className="shrink-0 text-xs font-semibold text-orange-600 dark:text-orange-400"
                            >
                                Copy link
                            </button>
                        </div>

                        <div className="flex gap-2 mt-3">
                            {c.status === 'paused' && <button className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-emerald-500 text-white text-xs font-bold">Resume</button>}
                            {c.status === 'active' && <button className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-white text-xs font-bold">Pause</button>}
                            <button onClick={() => navigate('/b/analytics')} className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">View Analytics</button>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Available campaigns</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">Curated templates — activate the ones that fit your business.</p>
                <div className="space-y-3">
                    {AVAILABLE_CAMPAIGNS.map((a) => {
                        const isActive = activated.includes(a.name)
                        return (
                            <div key={a.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{a.name}</p>
                                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${a.type === 'Seasonal' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>{a.type}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.description}</p>
                                <button
                                    onClick={() => {
                                        if (isActive) return
                                        setActivated([...activated, a.name])
                                        toast.success(`${a.name} activated`)
                                    }}
                                    disabled={isActive}
                                    className={`mt-3 w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-colors ${
                                        isActive
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md hover:opacity-95'
                                    }`}
                                >
                                    {isActive ? 'Activated' : 'Activate'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            <button
                onClick={() => navigate('/b/integrations')}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4"
            >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">MCOM Campaigns</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Campaign creation and promotion run on the MCOM platform. Connect to build seasonal and evergreen campaigns into events and Expos.</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                    Coming soon
                </span>
            </button>

            <p className="text-center text-xs text-gray-400">
                Campaign templates are managed by Admin. Create, then activate the one you want.
                <Link to="/b/rewards" className="text-orange-500 ml-1 font-semibold">Rewards</Link>
            </p>
        </div>
    )
}

function StatusPill({ status }: { status: 'active' | 'paused' | 'ended' }) {
    const styles = {
        active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        paused: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        ended: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>
}
