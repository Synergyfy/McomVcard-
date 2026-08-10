import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getCustomerById, type CustomerActivity } from '../../services/businessDashboardStore'
import { getBusinessPermissions } from '../../services/businessStore'
import { CONSUMER_LEVELS } from '../../services/consumerMembership'
import BottomSheet from '../../components/business/primitives/BottomSheet'

const TABS = ['Rewards', 'Membership', 'Transactions', 'Exchanges', 'Appointments', 'Activity', 'Redeemed Offers', 'Notes'] as const

const ACTIVITY_META: Record<CustomerActivity['type'], { icon: string; iconCls: string }> = {
    reward: { icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', iconCls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
    purchase: { icon: 'M3 10h18M7 15h3m-5-7a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V8z', iconCls: 'bg-gray-100 dark:bg-gray-700 text-gray-500' },
    exchange: { icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', iconCls: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600' },
    redemption: { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', iconCls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
    appointment: { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', iconCls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    upgrade: { icon: 'M5 10l7-7m0 0l7 7m-7-7v18', iconCls: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
    card: { icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2', iconCls: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600' },
    note: { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', iconCls: 'bg-gray-100 dark:bg-gray-700 text-gray-500' },
}

export default function BusinessCustomerDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const customer = getCustomerById(Number(id))
    const perms = getBusinessPermissions()
    const canUpgrade = perms.canSee.membership
    const currentLevelIdx = customer ? CONSUMER_LEVELS.indexOf(customer.tier as (typeof CONSUMER_LEVELS)[number]) : -1
    const upgradeOptions = customer ? CONSUMER_LEVELS.slice(currentLevelIdx + 1) : []
    const [tab, setTab] = useState<(typeof TABS)[number]>('Rewards')
    const [upgradeOpen, setUpgradeOpen] = useState(false)
    const [upgradeTier, setUpgradeTier] = useState<string>(upgradeOptions[0] ?? 'Gold')
    const [upgrades, setUpgrades] = useState(customer?.membershipUpgrades ?? [])

    if (!customer) {
        return (
            <div className="text-center py-20">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Customer not found</p>
                <Link to="/business/customers" className="text-sm text-orange-600 mt-2 inline-block">Back to customers</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>{customer.name} - Customers - MCOMVCard</title></Helmet>

            {/* Back */}
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
            </button>

            {/* Customer header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${customer.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {customer.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{customer.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {customer.tier} member · since {customer.memberSince}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{customer.phone} · {customer.email}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    customer.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                    customer.status === 'new' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                    'bg-red-50 dark:bg-red-900/20 text-red-600'
                }`}>
                    {customer.status === 'active' ? 'Active' : customer.status === 'new' ? 'New' : 'At risk'}
                </span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
                <QuickStat label="Rewards Issued" value={String(customer.rewardsCount)} />
                <QuickStat label="Rewards Redeemed" value={String(customer.redeemedOffers.filter(o => o.status === 'redeemed').length)} />
                <QuickStat label="Cards Issued" value={String(customer.cardsIssued)} />
                <QuickStat label="Exchanges" value={String(customer.exchanges.length)} />
                <QuickStat label="Appointments" value={String(customer.appointments.length)} />
                <QuickStat label="Upgrades" value={String(customer.membershipUpgrades.length)} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 border-b border-gray-200 dark:border-gray-800">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`shrink-0 px-4 py-2.5 min-h-[44px] text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                            tab === t ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Rewards' && (
                <div className="space-y-3">
                    <RewardHeader total={customer.rewards.length} onIssue={() => navigate('/business/rewards/issue')} />
                    {customer.rewards.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.value}</p>
                            </div>
                            <StatusPill status={r.status} />
                        </div>
                    ))}
                </div>
            )}

            {tab === 'Membership' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">★</div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{customer.tier} Member</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Member since {customer.memberSince}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <MemberInfo label="Total Spend" value={customer.totalSpend} />
                        <MemberInfo label="Rewards Earned" value={String(customer.rewardsCount)} />
                        <MemberInfo label="Transactions" value={String(customer.transactions.length)} />
                        <MemberInfo label="Notes" value={String(customer.notes.length)} />
                    </div>

                    <div className="mt-5">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Membership upgrades</p>
                        {upgrades.length > 0 ? (
                            <div className="space-y-2">
                                {upgrades.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.tier}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{u.reason}</p>
                                        </div>
                                        <span className="text-[11px] text-gray-400 shrink-0">{u.date}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No upgrades yet — reward loyal customers with a membership upgrade.</p>
                        )}
                    </div>

                    {canUpgrade && upgradeOptions.length > 0 && (
                        <button
                            onClick={() => { setUpgradeTier(upgradeOptions[0]); setUpgradeOpen(true) }}
                            className="mt-4 w-full py-3.5 min-h-[46px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
                        >
                            Upgrade membership
                        </button>
                    )}
                    {canUpgrade && upgradeOptions.length === 0 && (
                        <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">This customer is already on the highest tier.</p>
                        </div>
                    )}

                    <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                            <span className="font-semibold">Tip:</span> you can grant a membership upgrade as a reward — loyal customers move up a tier when they reach milestones.
                        </p>
                    </div>
                </div>
            )}

            {tab === 'Transactions' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    {customer.transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.type}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.date}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{t.amount}</span>
                        </div>
                    ))}
                    {customer.transactions.length === 0 && <EmptyNote text="No transactions yet." />}
                </div>
            )}

            {tab === 'Exchanges' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    {customer.exchanges.map((x) => (
                        <div key={x.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{x.item}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{x.date}</p>
                            </div>
                            <ExchangePill status={x.status} />
                        </div>
                    ))}
                    {customer.exchanges.length === 0 && <EmptyNote text="No exchanges yet." />}
                </div>
            )}

            {tab === 'Appointments' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    {customer.appointments.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.service}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.date}</p>
                            </div>
                            <ApptPill status={a.status} />
                        </div>
                    ))}
                    {customer.appointments.length === 0 && <EmptyNote text="No appointments yet." />}
                </div>
            )}

            {tab === 'Activity' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{customer.activity.length} activity events</p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {customer.activity.map((a) => {
                            const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.note
                            return (
                                <div key={a.id} className="flex items-start gap-3 p-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.iconCls}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={meta.icon} />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.detail}</p>
                                    </div>
                                    <span className="text-[11px] text-gray-400 shrink-0">{a.date}</span>
                                </div>
                            )
                        })}
                        {customer.activity.length === 0 && <EmptyNote text="No activity yet." />}
                    </div>
                </div>
            )}

            {tab === 'Redeemed Offers' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    {customer.redeemedOffers.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{o.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{o.date}</p>
                            </div>
                            <OfferPill status={o.status} />
                        </div>
                    ))}
                    {customer.redeemedOffers.length === 0 && <EmptyNote text="No offers redeemed yet." />}
                </div>
            )}

            {tab === 'Notes' && (
                <div className="space-y-3">
                    {customer.notes.map((n) => (
                        <div key={n.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-sm text-gray-700 dark:text-gray-200">{n.text}</p>
                            <p className="text-[11px] text-gray-400 mt-2">{n.date}</p>
                        </div>
                    ))}
                    {customer.notes.length === 0 && (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No notes for this customer yet.</p>
                        </div>
                    )}
                </div>
            )}

            <BottomSheet open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title="Upgrade membership">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Reward loyal customers by moving them up a membership tier. Upgrades are granted on their MCOM card.
                </p>
                <div className="space-y-2 mb-6">
                    {upgradeOptions.map((t) => (
                        <button
                            key={t}
                            onClick={() => setUpgradeTier(t)}
                            className={`w-full px-4 py-3.5 min-h-[46px] rounded-xl text-sm font-semibold border text-left transition-colors ${
                                upgradeTier === t
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => {
                        setUpgrades([{ id: Date.now(), tier: upgradeTier, reason: 'Granted by business owner', date: 'Just now' }, ...upgrades])
                        setUpgradeOpen(false)
                        toast.success(`${customer.name} upgraded to ${upgradeTier}`)
                    }}
                    className="w-full py-3.5 min-h-[46px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
                >
                    Confirm upgrade
                </button>
            </BottomSheet>
        </div>
    )
}

function RewardHeader({ total, onIssue }: { total: number; onIssue: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{total} reward entries</p>
            <button onClick={onIssue} className="text-sm font-semibold text-orange-600 dark:text-orange-400">Issue reward</button>
        </div>
    )
}

function StatusPill({ status }: { status: 'available' | 'pending' | 'redeemed' }) {
    const styles = {
        available: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        redeemed: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    }
    const labels = { available: 'Available', pending: 'Pending', redeemed: 'Redeemed' }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
}

function ApptPill({ status }: { status: 'completed' | 'confirmed' | 'pending' | 'cancelled' }) {
    const styles = {
        completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        confirmed: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
        pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    }
    const labels = { completed: 'Completed', confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled' }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>{labels[status]}</span>
}

function ExchangePill({ status }: { status: 'pending' | 'completed' | 'cancelled' }) {
    const styles = {
        pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    }
    const labels = { pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>{labels[status]}</span>
}

function OfferPill({ status }: { status: 'redeemed' | 'active' | 'expired' }) {
    const styles = {
        redeemed: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
        active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        expired: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    }
    return <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>
}

function QuickStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

function MemberInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
    )
}

function EmptyNote({ text }: { text: string }) {
    return <div className="p-8 text-center text-sm text-gray-400">{text}</div>
}
