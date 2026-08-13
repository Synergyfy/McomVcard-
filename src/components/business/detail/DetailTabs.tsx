import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AssignedCard, AssignedVCard, BusinessPermissions, DetailTabKey } from '../../../types/business'
import TabBar, { type TabDef } from '../primitives/TabBar'
import Badge from '../primitives/Badge'
import QRCodeBlock from '../primitives/QRCodeBlock'
import EmptyState from '../states/EmptyState'

/* ── Tab definitions (shared by VCard & Card) ────────────────────── */

const ALL_TABS: TabDef[] = [
    { key: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { key: 'content', label: 'Content', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { key: 'share', label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
    { key: 'exchange', label: 'Exchange', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { key: 'redeem', label: 'Redeem', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { key: 'friendsFamily', label: 'Friends & Family', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { key: 'passwordAccess', label: 'Password', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { key: 'qr', label: 'QR', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01' },
    { key: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { key: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const TAB_FEATURE: Record<DetailTabKey, keyof BusinessPermissions['canSee']> = {
    overview: 'content',
    content: 'content',
    share: 'share',
    exchange: 'exchange',
    redeem: 'redeem',
    friendsFamily: 'friendsFamily',
    passwordAccess: 'passwordAccess',
    qr: 'qr',
    analytics: 'analytics',
    history: 'history',
}

interface DetailTabsProps {
    item: AssignedVCard | AssignedCard
    permissions: BusinessPermissions
    isVCard: boolean
}

export default function DetailTabs({ item, permissions, isVCard }: DetailTabsProps) {
    const [active, setActive] = useState<DetailTabKey>('overview')

    // Filter tabs by permission — Admin-disabled features never render
    const visibleTabs = ALL_TABS.filter(t => permissions.canSee[TAB_FEATURE[t.key]])

    const renderTab = () => {
        switch (active) {
            case 'overview': return <OverviewTab item={item} isVCard={isVCard} />
            case 'content': return <ContentTab item={item} isVCard={isVCard} />
            case 'share': return <ShareTab item={item} isVCard={isVCard} />
            case 'exchange': return <ExchangeTab />
            case 'redeem': return <RedeemTab isVCard={isVCard} />
            case 'friendsFamily': return <FriendsFamilyTab isVCard={isVCard} permissions={permissions} />
            case 'passwordAccess': return <PasswordAccessTab isVCard={isVCard} />
            case 'qr': return <QRTab item={item} isVCard={isVCard} />
            case 'analytics': return <AnalyticsTab item={item} isVCard={isVCard} />
            case 'history': return <HistoryTab item={item} isVCard={isVCard} />
            default: return null
        }
    }

    return (
        <div>
            <TabBar tabs={visibleTabs} active={active} onChange={(k) => setActive(k as DetailTabKey)} />
            <div className="mt-6">{renderTab()}</div>
        </div>
    )
}

/* ── Tab panels ──────────────────────────────────────────────────── */

function OverviewTab({ item, isVCard }: { item: AssignedVCard | AssignedCard; isVCard: boolean }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.category} · {item.type}</p>
                    </div>
                    <Badge status={item.status} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        <p className="text-xs text-gray-400">Assigned</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.assignedAt}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Last Admin update</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.lastAdminUpdate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Views</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.views.toLocaleString()}</p>
                    </div>
                    {isVCard && 'urlSlug' in item && (
                        <div className="col-span-2 sm:col-span-3">
                            <p className="text-xs text-gray-400">Public URL</p>
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-0.5">/{item.urlSlug}</p>
                        </div>
                    )}
                    {!isVCard && 'cardNumber' in item && (
                        <div className="col-span-2 sm:col-span-3">
                            <p className="text-xs text-gray-400">Card Number</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{item.cardNumber}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Template sections</h3>
                {isVCard && 'sections' in item ? (
                    <div className="flex flex-wrap gap-2">
                        {item.sections.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">{s}</span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Card design is managed by your Admin. You can update approved fields only.</p>
                )}
            </div>
        </div>
    )
}

function ContentTab({ item, isVCard }: { item: AssignedVCard | AssignedCard; isVCard: boolean }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Approved content fields</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Only fields approved by your Admin are editable. Template structure is fixed.</p>
                </div>
                {isVCard && (
                    <Link
                        to={`/b/vcards/${item.id}/edit`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Open Content Editor
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business name" value="GreenLeaf Coffee" editable />
                <Field label="Description" value={item.description} editable />
                <Field label="Category" value={item.category} locked />
                <Field label="Template type" value={item.type} locked />
                <Field label="Status" value={item.status} locked />
                <Field label="Last admin update" value={item.lastAdminUpdate} locked />
            </div>
        </div>
    )
}

function Field({ label, value, editable, locked }: { label: string; value: string; editable?: boolean; locked?: boolean }) {
    return (
        <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-gray-400">{label}</p>
                {editable && <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Editable</span>}
                {locked && <span className="text-[10px] font-medium text-gray-400">Admin-controlled</span>}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
    )
}

function ShareTab({ item, isVCard }: { item: AssignedVCard | AssignedCard; isVCard: boolean }) {
    const shareUrl = isVCard && 'urlSlug' in item ? `https://mcomvcard.app/${item.urlSlug}` : `https://mcomvcard.app/card/${item.id}`
    const channels = [
        { label: 'WhatsApp', icon: 'M3 5.5A2.5 2.5 0 015.5 3h13A2.5 2.5 0 0121 5.5v9a2.5 2.5 0 01-2.5 2.5H9l-4 4v-4H5.5A2.5 2.5 0 013 14.5v-9z' },
        { label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: 'SMS', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { label: 'Copy link', icon: 'M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5' },
    ]
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Share this {isVCard ? 'VCard' : 'Card'}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Share with customers, partners and on social media.</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 mb-4">
                    <p className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate">{shareUrl}</p>
                    <button onClick={() => navigator.clipboard?.writeText(shareUrl)} className="px-3 py-2 min-h-[44px] text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">Copy</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {channels.map(c => (
                        <button key={c.label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-h-[80px]">
                            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
                            </svg>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share stats</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xl font-bold text-gray-900 dark:text-white">{item.shares}</p><p className="text-xs text-gray-400">Total shares</p></div>
                    <div><p className="text-xl font-bold text-gray-900 dark:text-white">{item.views}</p><p className="text-xs text-gray-400">Total views</p></div>
                    <div><p className="text-xl font-bold text-gray-900 dark:text-white">{item.scans}</p><p className="text-xs text-gray-400">QR scans</p></div>
                </div>
            </div>
        </div>
    )
}

function ExchangeTab() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Exchange contact details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Exchange your business contact details with another party.</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input type="email" placeholder="Partner email address" className="flex-1 px-4 py-3 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button className="px-5 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">Send exchange</button>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent exchanges</h3>
                <EmptyState title="No exchanges yet" message="Exchange your contact details to see history here." />
            </div>
        </div>
    )
}

function RedeemTab({ isVCard }: { isVCard: boolean }) {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Available redemptions</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Redeemable offers and e-card value attached to this {isVCard ? 'VCard' : 'Card'}.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">E-Gift Card value</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">£2,500</p>
                        <p className="text-xs text-gray-400 mt-1">Available face value</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Active offers</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">3</p>
                        <p className="text-xs text-gray-400 mt-1">Seasonal promotions</p>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Redeem history</h3>
                <EmptyState title="No redemptions yet" message="Customer redemptions will appear here." />
            </div>
        </div>
    )
}

function FriendsFamilyTab({ isVCard, permissions }: { isVCard: boolean; permissions: BusinessPermissions }) {
    const limit = permissions.limits.friendsFamily
    const used = 1
    const remaining = limit === null || limit === Infinity ? 'Unlimited' : Math.max(0, limit - used)
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Friends & Family allocations</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Allocate this {isVCard ? 'VCard' : 'Card'} to family and friends.</p>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 mb-4">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{used} used</p>
                        <p className="text-xs text-gray-400">{remaining} remaining of {limit === null || limit === Infinity ? 'Unlimited' : limit}</p>
                    </div>
                    <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${limit === null || limit === Infinity ? 10 : Math.min(100, (used / limit) * 100)}%` }} />
                    </div>
                </div>
                <button className="w-full sm:w-auto px-5 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">Allocate to Family & Friends</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Current allocations</h3>
                <EmptyState title="No allocations yet" message="Allocate this card to family or friends to see them here." />
            </div>
        </div>
    )
}

function PasswordAccessTab({ isVCard }: { isVCard: boolean }) {
    const [enabled, setEnabled] = useState(false)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Password protection</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Restrict access to this {isVCard ? 'VCard' : 'Card'} with a password.</p>
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Require password</p>
                    <p className="text-xs text-gray-400">Visitors must enter a password to view</p>
                </div>
                <button onClick={() => setEnabled(!enabled)} className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} aria-label="Toggle password">
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
            </div>
            {enabled && (
                <div className="space-y-3">
                    <input type="password" placeholder="Set password" className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <button className="w-full sm:w-auto px-5 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">Save password</button>
                </div>
            )}
        </div>
    )
}

function QRTab({ item, isVCard }: { item: AssignedVCard | AssignedCard; isVCard: boolean }) {
    const qrValue = isVCard && 'urlSlug' in item ? `https://mcomvcard.app/${item.urlSlug}` : `https://mcomvcard.app/card/${item.id}`
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QRCodeBlock value={qrValue} title={`${item.name} QR`} subtitle="Scan to open this card" />
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">QR details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-xs text-gray-400">Status</span><span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-400">Scans</span><span className="text-xs font-medium text-gray-900 dark:text-white">{item.scans.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-400">Routing</span><span className="text-xs font-medium text-gray-900 dark:text-white">Dynamic</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-400">Last scan</span><span className="text-xs font-medium text-gray-900 dark:text-white">12 min ago</span></div>
                </div>
            </div>
        </div>
    )
}

function AnalyticsTab({ item }: { item: AssignedVCard | AssignedCard; isVCard: boolean }) {
    const data = [
        { label: 'Mon', value: 34 }, { label: 'Tue', value: 42 }, { label: 'Wed', value: 38 },
        { label: 'Thu', value: 51 }, { label: 'Fri', value: 46 }, { label: 'Sat', value: 62 },
        { label: 'Sun', value: 38 },
    ]
    const max = Math.max(...data.map(d => d.value))
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MiniStat label="Views" value={item.views.toLocaleString()} />
                <MiniStat label="Shares" value={item.shares.toLocaleString()} />
                <MiniStat label="Scans" value={item.scans.toLocaleString()} />
                <MiniStat label="Avg time" value="2m 15s" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Views this week</h3>
                <div className="flex items-end gap-2 h-40">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{d.value}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-700" style={{ height: `${(d.value / max) * 100}%` }} />
                            <span className="text-[10px] text-gray-400">{d.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

function HistoryTab({ item }: { item: AssignedVCard | AssignedCard; isVCard: boolean }) {
    const events = [
        { action: 'Template updated by Admin', time: item.lastAdminUpdate },
        { action: 'QR scanned', time: '12 min ago' },
        { action: 'Shared via WhatsApp', time: '1 hr ago' },
        { action: 'Template assigned', time: item.assignedAt },
    ]
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity history</h2>
            <div className="space-y-0">
                {events.map((e, i) => (
                    <div key={i} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                            {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />}
                        </div>
                        <div className="pb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{e.action}</p>
                            <p className="text-xs text-gray-400">{e.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}