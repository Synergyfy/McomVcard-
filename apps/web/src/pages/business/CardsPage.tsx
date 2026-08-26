import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import BottomSheet from '../../components/business/primitives/BottomSheet'
import QRCodeBlock from '../../components/business/primitives/QRCodeBlock'
import { LayoutFaceContent } from '../../components/admin/CardPreview'
import type { CardFaces } from '../../services/cardTemplateStore'
import type { CardSectionState } from '../../services/cardTemplateStore'
import { BIZ_CARD_SECTIONS } from '../../services/businessCardEditorStore'
import { businessService, type Business, type VCard, type VCardSection, type Template, type BusinessPermissions } from '../../services/businessApi'

/* ── Map API card sections onto the preview renderer's state shape ── */

function faceOf(schemaId: string): 'front' | 'back' {
    return BIZ_CARD_SECTIONS.find(d => d.id === schemaId)?.face ?? 'front'
}

export function apiSectionsToFaces(sections: VCardSection[]): CardFaces {
    const toState = (s: VCardSection): CardSectionState => {
        const raw = (s.content ?? {}) as Record<string, unknown>
        const values = ((raw.values ?? raw) as Record<string, string>) || {}
        const items = ((raw.items ?? {}) as Record<string, Record<string, string>[]>) || {}
        return {
            uid: s.id,
            face: faceOf(s.schema_id),
            schemaId: s.schema_id,
            name: s.name,
            enabled: s.enabled,
            values,
            items,
            blocks: [],
        }
    }
    return {
        front: sections.filter(s => faceOf(s.schema_id) === 'front').map(toState),
        back: sections.filter(s => faceOf(s.schema_id) === 'back').map(toState),
    }
}

function formatDate(value: string | null): string {
    if (!value) return '—'
    try { return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '—' }
}

export default function BusinessCardsPage() {
    const [showTemplates, setShowTemplates] = useState(false)
    const [showQR, setShowQR] = useState(false)
    const [loading, setLoading] = useState(true)
    const [business, setBusiness] = useState<Business | null>(null)
    const [cards, setCards] = useState<VCard[]>([])
    const [templates, setTemplates] = useState<Template[]>([])
    const [permissions, setPermissions] = useState<BusinessPermissions | null>(null)
    const [activeCardId, setActiveCardId] = useState<string | null>(null)
    const [claiming, setClaiming] = useState(false)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const businesses = await businessService.getMyBusinesses()
                if (cancelled) return
                const biz = businesses[0] ?? null
                setBusiness(biz)

                const [myCards, tpl, perms] = await Promise.all([
                    biz ? businessService.getVCardsByBusiness(biz.id) : businessService.getMyVCards(),
                    businessService.listTemplates(),
                    businessService.getBusinessPermissions(),
                ])
                if (cancelled) return
                const bizCards = biz ? myCards : myCards.filter(c => c.type === 'BUSINESS')
                setCards(bizCards)
                setTemplates(tpl)
                setPermissions(perms)
                setActiveCardId(prev => (prev && bizCards.some(c => c.id === prev)) ? prev : (bizCards[0]?.id ?? null))
            } catch {
                // leave empty states
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const activeCard = cards.find(c => c.id === activeCardId) ?? cards[0]
    const activeFaces = activeCard ? apiSectionsToFaces(activeCard.sections ?? []) : { front: [], back: [] }

    const totals = {
        views: cards.reduce((s, c) => s + (c.views ?? 0), 0),
        scans: cards.reduce((s, c) => s + (c.scans ?? 0), 0),
        shares: cards.reduce((s, c) => s + (c.shares ?? 0), 0),
    }

    const selectTemplate = async (template: Template) => {
        if (!template.id) {
            toast.error('Template not available')
            return
        }
        setClaiming(true)
        try {
            if (activeCard) {
                // Replace the template on the active card — saved section content is kept where ids match.
                const applied = await businessService.applyTemplate(activeCard.id, template.id)
                if (!applied) {
                    toast.error('Could not apply this template')
                    return
                }
                setCards(prev => prev.map(c => (c.id === applied.id ? applied : c)))
                setActiveCardId(applied.id)
                toast.success(`"${template.name}" applied to ${applied.name ?? 'your card'}`)
            } else {
                if (!business) {
                    toast.error('Create your business profile first')
                    return
                }
                const claimed = await businessService.claimTemplate(business.id, template.id)
                if (!claimed) {
                    toast.error('Could not apply this template')
                    return
                }
                setCards(prev => [claimed, ...prev])
                setActiveCardId(claimed.id)
                toast.success(`"${template.name}" applied — new Business Card created`)
            }
            setShowTemplates(false)
        } finally {
            setClaiming(false)
        }
    }

    const duplicateActiveCard = async () => {
        if (!activeCard) return
        setClaiming(true)
        try {
            const copy = await businessService.duplicateCard(activeCard.id)
            if (!copy) {
                toast.error('Could not duplicate this card')
                return
            }
            setCards(prev => [copy, ...prev])
            setActiveCardId(copy.id)
            toast.success('Card duplicated')
        } finally {
            setClaiming(false)
        }
    }

    const qrValue = activeCard ? `${window.location.origin}/c/${activeCard.url_slug || activeCard.slug}?src=qr` : ''

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>Cards - Business Dashboard - MCOMVCard</title></Helmet>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-orange-600">Business Dashboard</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            <h1 className="text-sm font-bold text-gray-900 dark:text-white">My Business Cards</h1>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Static 85 × 55 mm identity cards assigned to your business by Admin — design and structure are fixed, you choose the template and customize your content.</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                            <span>{cards.length} allocated</span>
                            {permissions && (
                                <>
                                    <span>·</span>
                                    <span>{permissions.remaining.business_cards === null ? 'Unlimited' : `${permissions.remaining.business_cards} remaining`}</span>
                                    <span>·</span>
                                    <span>{permissions.plan_level} {permissions.plan_tier !== 'Normal' ? permissions.plan_tier : ''} plan</span>
                                </>
                            )}
                            {business && <><span>·</span><span>{business.name}</span></>}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTemplates(true)}
                        disabled={claiming}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shrink-0 disabled:opacity-50"
                    >
                        Choose a Template
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Cards</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{cards.length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Active</p>
                        <p className="text-lg font-bold text-green-600">{cards.filter(c => c.status === 'active').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Needs Update</p>
                        <p className="text-lg font-bold text-amber-600">{cards.filter(c => c.status === 'needs_update').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Locked</p>
                        <p className="text-lg font-bold text-gray-400">{cards.filter(c => c.status === 'locked').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Views</p>
                        <p className="text-lg font-bold text-blue-600">{totals.views.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Scans</p>
                        <p className="text-lg font-bold text-indigo-600">{totals.scans.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Total Shares</p>
                        <p className="text-lg font-bold text-purple-600">{totals.shares.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {!loading && cards.length > 0 && (
                <BusinessCardSection
                    card={activeCard}
                    faces={activeFaces}
                    onUseTemplate={() => setShowTemplates(true)}
                    onShowQR={() => setShowQR(true)}
                    onDuplicate={duplicateActiveCard}
                />
            )}

            {!loading && cards.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No business cards yet</p>
                    <p className="text-xs text-gray-400 mb-4">{business ? 'Choose a published template to create your first Business Card.' : 'Create your business profile first, then choose a template.'}</p>
                    <button onClick={() => setShowTemplates(true)} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Choose a Template</button>
                </div>
            )}

            {loading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <p className="text-xs text-gray-400">Loading your business cards…</p>
                </div>
            )}

            {cards.length > 0 && (
                <NoteLine text="Structure and design are set by Admin. Use Customize to update your logo, member details, signature, contacts and security password — just like the Admin's card template builder." />
            )}

            {/* Template chooser — admin published templates */}
            <BottomSheet
                open={showTemplates}
                onClose={() => setShowTemplates(false)}
                title="Choose Business Card Template"
                className="sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-full sm:max-w-3xl sm:rounded-2xl"
            >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    These templates were published by Admin. Tap one and it is applied instantly{activeCard ? ' — saved content on matching sections is kept.' : ' — your first Business Card is created.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            role="button"
                            onClick={() => selectTemplate(t)}
                            className={`rounded-2xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                                activeCard?.template_id === t.id ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-500/30' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                            }`}
                        >
                            <div
                                className="w-full aspect-[85/55] flex items-end p-2"
                                style={{ background: `linear-gradient(135deg, ${t.primary_color ?? '#0F172A'}, ${t.secondary_color ?? '#334155'})` }}
                            >
                                <span className="text-[8px] font-bold text-white/80 uppercase tracking-wide truncate">{t.category ?? 'Business'}</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.name}</p>
                                <p className="text-[11px] text-gray-500">{t.category} · used {t.usage}×</p>
                                {activeCard?.template_id === t.id && <span className="inline-block mt-1 text-[10px] font-bold text-orange-600">● In use</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {templates.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No published templates yet</p>
                        <p className="text-xs text-gray-400 mb-4">Your Admin has not published any Business Card templates to choose from.</p>
                    </div>
                )}
            </BottomSheet>

            {/* QR sheet */}
            {activeCard && (
                <BottomSheet open={showQR} onClose={() => setShowQR(false)} title="Business Card QR Code">
                    <QRCodeBlock
                        value={qrValue}
                        title={activeCard.name ?? business?.name ?? 'Business Card'}
                        subtitle="Points customers to your Business Card"
                    />
                </BottomSheet>
            )}

            {/* Templates link row for convenience */}
            <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Looking for more designs?</span>
                <button onClick={() => setShowTemplates(true)} className="font-semibold text-orange-600 dark:text-orange-400">
                    Browse templates
                </button>
            </div>
        </div>
    )
}

/* ── Flip card preview (front / back, 85 × 55 mm) ────────────────── */

function FlipCard({ faces, widthClass = 'w-[300px] sm:w-[340px]', flipHint = true }: {
    faces: CardFaces
    widthClass?: string
    flipHint?: boolean
}) {
    const [flipped, setFlipped] = useState(false)
    return (
        <div style={{ perspective: '1200px' }}>
            <div
                className={`relative ${widthClass} max-w-full aspect-[85/55] cursor-pointer transition-transform duration-700 select-none mx-auto`}
                style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                onClick={() => setFlipped(!flipped)}
                title="Click to flip"
            >
                <div className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg" style={{ backfaceVisibility: 'hidden' }}>
                    <LayoutFaceContent face="front" sections={faces.front} />
                </div>
                <div className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <LayoutFaceContent face="back" sections={faces.back} />
                </div>
            </div>
            {flipHint && (
                <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-2">
                    {flipped ? 'Back' : 'Front'} · click the card to flip · 85 × 55 mm
                </p>
            )}
        </div>
    )
}

/* ── Business Card preview + actions ─────────────────────────────── */

function BusinessCardSection({ card, faces, onUseTemplate, onShowQR, onDuplicate }: {
    card: VCard | undefined
    faces: CardFaces
    onUseTemplate: () => void
    onShowQR: () => void
    onDuplicate: () => void
}) {
    const navigate = useNavigate()
    const isActive = card?.status === 'active'

    const actions = [
        { label: 'Use Template', icon: 'M5 13l4 4L19 7', onClick: onUseTemplate, primary: true },
        { label: 'Replace Template', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: onUseTemplate },
        { label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', onClick: () => { if (card) businessService.trackCardEvent(card.url_slug || card.slug, 'share'); navigate('/b/vcards') } },
        { label: 'Download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', onClick: () => toast.success('Business Card downloaded as PNG') },
        { label: 'Print', icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z', onClick: () => toast.success('Print sheet opened') },
        { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: onDuplicate },
        { label: 'QR Code', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01', onClick: onShowQR },
        { label: 'Customize', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => card && navigate(`/b/cards/${card.id}/edit`) },
    ]

    return (
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{card?.name ?? 'Business Card'}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        85 × 55 mm · identity card · assigned {formatDate(card?.assigned_at ?? null)}
                    </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} /> {isActive ? 'Active' : (card?.status ?? '—')}
                </span>
            </div>

            {/* Preview — flip front / back, fixed card size even on desktop */}
            <div className="px-5 pb-5">
                <div className="rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-6">
                    <FlipCard faces={faces} />
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Using template: <span className="font-semibold text-gray-900 dark:text-white">{card?.name ?? 'Business Card'}</span> · Assigned by Admin
                </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 p-4 pt-0">
                {actions.map((a) => (
                    <button
                        key={a.label}
                        onClick={a.onClick}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors min-h-[64px] ${
                            a.primary
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md hover:opacity-95'
                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                        </svg>
                        {a.label}
                    </button>
                ))}
            </div>
        </section>
    )
}

/* ── Note line ───────────────────────────────────────────────────── */

function NoteLine({ text }: { text: string }) {
    return (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            <svg className="w-4 h-4 inline-block mr-1 -mt-0.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {text}
        </p>
    )
}
