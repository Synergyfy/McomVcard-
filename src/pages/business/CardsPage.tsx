import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import BottomSheet from '../../components/business/primitives/BottomSheet'
import QRCodeBlock from '../../components/business/primitives/QRCodeBlock'
import { LayoutFaceContent } from '../../components/admin/CardPreview'
import type { CardFaces } from '../../services/cardTemplateStore'
import { mockAssignedCards, mockBusinessProfile, getBusinessPermissions, businessVCardLink } from '../../services/businessStore'
import { getBusinessCardRows, getBusinessCardRow, getCardEditorContent, sectionsToFaces, type CardRow } from '../../services/businessCardEditorStore'

const CARD_URL = 'https://vcard.greenleaf.coffee/c/bc-1001-3490'

export default function BusinessCardsPage() {
    const [showTemplates, setShowTemplates] = useState(false)
    const [showQR, setShowQR] = useState(false)
    const [activeRowId, setActiveRowId] = useState(1)

    const perms = getBusinessPermissions()
    const limit = perms.limits.businessCards
    const assigned = mockAssignedCards
    const used = assigned.length
    const remaining = limit === null || limit === Infinity ? 'Unlimited' : Math.max(0, limit - used)

    const activeRow = getBusinessCardRow(activeRowId) ?? getBusinessCardRows()[0]
    const activeFaces = activeRow ? sectionsToFaces(getCardEditorContent(activeRow.id)) : { front: [], back: [] }

    const adminTemplates = getBusinessCardRows().filter(r => r.status === 'Published')

    const totals = {
        views: assigned.reduce((s, c) => s + c.views, 0),
        scans: assigned.reduce((s, c) => s + c.scans, 0),
        shares: assigned.reduce((s, c) => s + c.shares, 0),
    }

    const selectTemplate = (row: CardRow) => {
        setActiveRowId(row.id)
        toast.success(`${row.name} template applied to your Business Card`)
        setShowTemplates(false)
    }

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
                            <span>{used} allocated · {remaining} remaining</span>
                            <span>·</span>
                            <span>{perms.planLevel} {perms.tier} plan</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shrink-0"
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
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{assigned.length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Active</p>
                        <p className="text-lg font-bold text-green-600">{assigned.filter(c => c.status === 'active').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Needs Update</p>
                        <p className="text-lg font-bold text-amber-600">{assigned.filter(c => c.status === 'needs_update').length}</p>
                    </div>
                    <div className="p-2.5">
                        <p className="text-[10px] text-gray-400">Locked</p>
                        <p className="text-lg font-bold text-gray-400">{assigned.filter(c => c.status === 'locked').length}</p>
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

            <BusinessCardSection
                row={activeRow}
                faces={activeFaces}
                onUseTemplate={() => setShowTemplates(true)}
                onShowQR={() => setShowQR(true)}
            />
            <NoteLine text="Structure and design are set by Admin. Use Customize to update your logo, member details, signature, contacts and security password — just like the Admin's card template builder." />

            {/* Template chooser — admin business card templates */}
            <BottomSheet
                open={showTemplates}
                onClose={() => setShowTemplates(false)}
                title="Choose Business Card Template"
                className="sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-full sm:max-w-3xl sm:rounded-2xl"
            >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    These templates were designed by Admin. Tap one and it's instantly applied — tap the card to flip front / back.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {adminTemplates.map((t) => (
                        <div
                            key={t.id}
                            role="button"
                            onClick={() => selectTemplate(t)}
                            className={`rounded-2xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                                activeRowId === t.id ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-500/30' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="p-2 bg-gray-100 dark:bg-gray-700/40">
                                <MiniFlipCard faces={sectionsToFaces(getCardEditorContent(t.id))} />
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.name}</p>
                                <p className="text-[11px] text-gray-500">{t.category} · v{t.version}</p>
                                {activeRowId === t.id && <span className="inline-block mt-1 text-[10px] font-bold text-orange-600">● In use</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {adminTemplates.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No published templates yet</p>
                        <p className="text-xs text-gray-400 mb-4">Your Admin has not published any Business Card templates to choose from.</p>
                    </div>
                )}
            </BottomSheet>

            {/* QR sheet */}
            <BottomSheet open={showQR} onClose={() => setShowQR(false)} title="Business Card QR Code">
                <QRCodeBlock
                    value={CARD_URL}
                    title={mockBusinessProfile.name}
                    subtitle="Points customers to your Business Card"
                />
            </BottomSheet>

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

/* Small card preview for the template chooser — flips front / back. */
function MiniFlipCard({ faces }: { faces: CardFaces }) {
    const [flipped, setFlipped] = useState(false)
    return (
        <div
            className="relative w-full aspect-[85/55] rounded-lg overflow-hidden cursor-pointer"
            style={{ perspective: '1200px' }}
            onClick={e => { e.stopPropagation(); setFlipped(!flipped) }}
            title="Click to flip"
        >
            <div className="absolute inset-0 transition-transform duration-700" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                    <LayoutFaceContent face="front" sections={faces.front} />
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <LayoutFaceContent face="back" sections={faces.back} />
                </div>
            </div>
        </div>
    )
}

/* ── Business Card preview + actions ─────────────────────────────── */

function BusinessCardSection({ row, faces, onUseTemplate, onShowQR }: {
    row: CardRow | undefined
    faces: CardFaces
    onUseTemplate: () => void
    onShowQR: () => void
}) {
    const navigate = useNavigate()

    const actions = [
        { label: 'Use Template', icon: 'M5 13l4 4L19 7', onClick: onUseTemplate, primary: true },
        { label: 'Replace Template', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: onUseTemplate },
        { label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', onClick: () => navigate(businessVCardLink('share')) },
        { label: 'Download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', onClick: () => toast.success('Business Card downloaded as PNG') },
        { label: 'Print', icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z', onClick: () => toast.success('Print sheet opened') },
        { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => toast.success('Card duplicated') },
        { label: 'QR Code', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01', onClick: onShowQR },
        { label: 'Customize', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/business/cards/${row?.id ?? 1}/edit`) },
    ]

    return (
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{row?.name ?? 'Business Card'}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">85 × 55 mm · identity card</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
            </div>

            {/* Preview — flip front / back, fixed card size even on desktop */}
            <div className="px-5 pb-5">
                <div className="rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-6">
                    <FlipCard faces={faces} />
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Using template: <span className="font-semibold text-gray-900 dark:text-white">{row?.name ?? 'Business Card'}</span> · Assigned by Admin
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
