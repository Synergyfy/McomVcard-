import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { businessService, type Campaign, type CampaignTemplate } from '../../../services/businessApi'

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
        return '—'
    }
}

export default function CampaignsPage() {
    const navigate = useNavigate()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [templates, setTemplates] = useState<CampaignTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [activated, setActivated] = useState<string[]>([])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const [c, t] = await Promise.all([
                    businessService.getCampaigns(),
                    businessService.getCampaignTemplates(),
                ])
                if (!cancelled) {
                    setCampaigns(c)
                    setTemplates(t)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const handleToggleStatus = async (c: Campaign) => {
        const newStatus = c.status === 'active' ? 'paused' : 'active'
        const updated = await businessService.updateCampaign(c.id, { status: newStatus })
        if (!updated) {
            toast.error('Could not update campaign')
            return
        }
        setCampaigns((prev) => prev.map((x) => x.id === c.id ? { ...x, status: newStatus as Campaign['status'] } : x))
        toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`)
    }

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
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No campaigns yet. Create one below.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((c) => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.type}{c.description ? ` · ${c.description}` : ''}</p>
                                </div>
                                <StatusPill status={c.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                                    <p className="text-[11px] font-semibold text-gray-400">Budget</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{c.budget ? `£${c.budget}` : 'Not set'}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                                    <p className="text-[11px] font-semibold text-gray-400">Duration</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{fmtDate(c.starts_at)} – {fmtDate(c.ends_at)}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                {c.status === 'paused' && <button onClick={() => handleToggleStatus(c)} className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-emerald-500 text-white text-xs font-bold">Resume</button>}
                                {c.status === 'active' && <button onClick={() => handleToggleStatus(c)} className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-white text-xs font-bold">Pause</button>}
                                {(c.status === 'draft' || c.status === 'ended') && <button onClick={() => handleToggleStatus(c)} className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-emerald-500 text-white text-xs font-bold">Activate</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Available campaign templates</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">Curated templates — activate the ones that fit your business.</p>
                {templates.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 p-6 text-center">
                        <p className="text-xs text-gray-400">No templates available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {templates.map((t) => {
                            const isActive = activated.includes(t.id)
                            return (
                                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${t.type === 'Seasonal' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>{t.type}</span>
                                    </div>
                                    {t.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>}
                                    {t.suggested_reward && <p className="text-[11px] text-orange-500 mt-1">Reward: {t.suggested_reward}</p>}
                                    <button
                                        onClick={() => {
                                            if (isActive) return
                                            setActivated([...activated, t.id])
                                            toast.success(`${t.name} activated`)
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
                )}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Campaign creation and promotion run on the MCOM platform.</p>
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

function StatusPill({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        draft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
        paused: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        ended: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] ?? styles.draft}`}>{status}</span>
}
