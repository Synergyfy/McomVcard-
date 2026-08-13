import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import Badge from '../../components/business/primitives/Badge'
import ErrorState from '../../components/business/states/ErrorState'
import ScrollingVCard, { type ScrollingVCardHandle } from '../../components/common/ScrollingVCard'
import { getVCardById, mockBusinessProfile } from '../../services/businessStore'
import { BIZ_SECTIONS, buildBusinessCentres, getVCardEditorContent, getVCardProtection, clearVCardProtection, getBusinessCentreControls } from '../../services/businessVCardEditorStore'
import ShareExchangeRedeemPanel from './vcard/ShareExchangeRedeemPanel'
import BottomSheet from '../../components/business/primitives/BottomSheet'
import QRCodeBlock from '../../components/business/primitives/QRCodeBlock'

const SECTION_ICONS = new Map(BIZ_SECTIONS.map(s => [s.id, s.icon]))

function getSeason(): string {
    const m = new Date().getMonth() + 1
    if (m >= 3 && m <= 5) return 'Spring 2026'
    if (m >= 6 && m <= 8) return 'Summer 2026'
    if (m >= 9 && m <= 11) return 'Autumn 2026'
    return 'Winter 2026'
}

function SectionRow({ schemaId, name, locked }: { schemaId: string; name: string; locked: boolean }) {
    return (
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${locked ? 'bg-gray-200 dark:bg-gray-600 text-gray-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={SECTION_ICONS.get(schemaId) ?? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z'} />
                </svg>
            </div>
            <p className="flex-1 text-[11px] font-medium text-gray-900 dark:text-white truncate">{name}</p>
            {locked
                ? <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 text-[8px] font-medium whitespace-nowrap">Admin-managed</span>
                : <span className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-[8px] font-medium whitespace-nowrap">Editable</span>}
        </div>
    )
}

export default function VCardDetailPage() {
    const { id } = useParams<{ id: string }>()
    const vcard = getVCardById(Number(id))
    const [params] = useSearchParams()

    const scrollRef = useRef<ScrollingVCardHandle>(null)
    const [scrollActive, setScrollActive] = useState(false)
    const [qrOpen, setQrOpen] = useState(false)
    const [confirmingReset, setConfirmingReset] = useState(false)
    const sections = getVCardEditorContent(Number(id) || 0)
    const centreControls = getBusinessCentreControls(Number(id) || 0)
    const protection = getVCardProtection(Number(id) || 0)

    const centre = params.get('centre')

    useEffect(() => {
        if (!centre) return
        const t = setTimeout(() => {
            const el = document.getElementById(`vcard-centre-${centre}`)
            if (el) {
                const scroller = el.closest('.overflow-y-auto') as HTMLElement | null
                if (scroller) {
                    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
                    scroller.scrollTo({ top: Math.max(0, top - 48), behavior: 'smooth' })
                } else {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }
            /* Pause any auto-scroll so the jump isn't fought. */
            window.dispatchEvent(new CustomEvent('vcard-jump'))
        }, 400)
        return () => clearTimeout(t)
    }, [centre])

    if (!vcard) {
        return (
            <div>
                <Helmet><title>VCard not found - MCOMVCard</title></Helmet>
                <ErrorState title="VCard not found" message="This VCard may have been removed by your Admin." />
            </div>
        )
    }

    const storefrontUrl = `https://mcomvcard.app/${vcard.urlSlug}`

    const copyLink = () => {
        try { navigator.clipboard?.writeText(storefrontUrl) } catch { /* ignore */ }
        toast.success('VCard link copied')
    }

    const shareVCard = () => {
        if (navigator.share) {
            navigator.share({ title: vcard.name, text: vcard.description || '', url: storefrontUrl }).catch(() => { /* ignore */ })
        } else {
            copyLink()
            toast.success('VCard link copied — share it anywhere')
        }
    }

    const publishVCard = () => toast.success('VCard published — your update is now live')

    const resetProtection = () => {
        if (!confirmingReset) {
            setConfirmingReset(true)
            window.setTimeout(() => setConfirmingReset(false), 3000)
            return
        }
        clearVCardProtection(vcard.id)
        setConfirmingReset(false)
        toast.success('Password protection reset — sections are now public')
    }

    return (
        <div className="space-y-6">
            <Helmet><title>{vcard.name} - My Business VCards - MCOMVCard</title></Helmet>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Link to="/b/vcards" className="hover:text-orange-600">My Business VCards</Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-900 dark:text-white font-medium">{vcard.name}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-orange-600 font-medium">Published View</span>
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{vcard.name}</h1>
                            <Badge status={vcard.status} />
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">{vcard.type}</span>
                            <span className="text-[10px] text-gray-400">{vcard.category}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{vcard.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                            <span>Assigned {vcard.assignedAt}</span>
                            <span>·</span>
                            <span>Last admin update {vcard.lastAdminUpdate}</span>
                            <span>·</span>
                            <span>/{vcard.urlSlug}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2.5 text-[10px]">
                            <span><span className="text-gray-400">Template · </span><span className="font-medium text-gray-700 dark:text-gray-300">{vcard.name}</span></span>
                            <span><span className="text-gray-400">Sector · </span><span className="font-medium text-gray-700 dark:text-gray-300">{vcard.category}</span></span>
                            <span><span className="text-gray-400">Membership · </span><span className="font-medium text-gray-700 dark:text-gray-300">{mockBusinessProfile.membership} {mockBusinessProfile.tier}</span></span>
                            <span><span className="text-gray-400">Season · </span><span className="font-medium text-gray-700 dark:text-gray-300">{getSeason()}</span></span>
                            <span><span className="text-gray-400">Status · </span><span className="font-medium text-green-600 dark:text-green-400">{vcard.status === 'active' ? 'Active' : 'Draft'}</span></span>
                            <span><span className="text-gray-400">Customisation · </span><span className="font-medium text-gray-700 dark:text-gray-300">Limited to approved fields</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <button onClick={() => window.open(storefrontUrl, '_blank', 'noopener')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View VCard</button>
                        <button onClick={() => setQrOpen(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">QR Code</button>
                        <button onClick={shareVCard} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Share</button>
                        <button onClick={copyLink} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy VCard Link</button>
                        <Link to="/b/vcards" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Change Template</Link>
                        <button onClick={publishVCard} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700">Publish / Update</button>
                        <Link to={`/b/vcards/${vcard.id}/edit`} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Edit Content</Link>
                    </div>
                </div>
            </div>

            {/* Main published layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Phone preview */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Published Preview</h4>
                            <p className="text-[10px] text-gray-400">Exactly how this long scrolling VCard renders on your live business profile — hover to scroll (desktop), tap to scroll or pause (mobile).</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button onClick={() => scrollRef.current?.toggle()} className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium hover:bg-gray-200 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={!scrollActive ? 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM19 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m0 0a2 2 0 002 2h12a2 2 0 002-2m-2 4v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' : 'M4 4v5a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2zm10 0v5a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2h-4a2 2 0 00-2 2zM4 15v5a2 2 0 002 2h4a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2zm10 0v5a2 2 0 002 2h4a2 2 0 002-2v-5a2 2 0 00-2-2h-4a2 2 0 00-2 2z'} /></svg>
                                {scrollActive ? 'Pause' : 'Resume'}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl py-8">
                        <ScrollingVCard ref={scrollRef} sections={sections} centres={buildBusinessCentres(sections, centreControls)} protection={getVCardProtection(vcard.id)} heightClass="h-[62vh]" widthClass="w-[280px] sm:w-[320px]" onStateChange={setScrollActive} />
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Rendering live from the content you saved in the Content Editor
                    </div>
                </div>

                {/* Side info */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Performance */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Performance</h4>
                            <span className="text-[10px] text-gray-400">{mockBusinessProfile.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-center">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{vcard.views.toLocaleString()}</p>
                                <p className="text-[9px] text-gray-400">Views</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-center">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{vcard.scans.toLocaleString()}</p>
                                <p className="text-[9px] text-gray-400">QR Scans</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-center">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{vcard.shares.toLocaleString()}</p>
                                <p className="text-[9px] text-gray-400">Shares</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px]"><span className="text-gray-400">Assigned</span><span className="font-medium text-gray-700 dark:text-gray-300">{vcard.assignedAt}</span></div>
                            <div className="flex justify-between text-[10px]"><span className="text-gray-400">Last admin update</span><span className="font-medium text-gray-700 dark:text-gray-300">{vcard.lastAdminUpdate}</span></div>
                            <div className="flex justify-between text-[10px]"><span className="text-gray-400">Membership</span><span className="font-medium text-gray-700 dark:text-gray-300">{mockBusinessProfile.membership} {mockBusinessProfile.tier}</span></div>
                        </div>
                    </div>

                    {/* Content sections */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Content Sections</h4>
                            <span className="text-[10px] text-gray-400">{sections.length} sections</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-3">Green sections are editable by you. Grey sections are managed by your Admin and fixed on the template.</p>
                        <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1 mb-3">
                            {sections.map(s => (
                                <SectionRow key={s.uid} schemaId={s.schemaId} name={s.name} locked={s.locked} />
                            ))}
                        </div>
                        <Link to={`/b/vcards/${vcard.id}/edit`} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Open Content Editor
                        </Link>
                    </div>

                    {/* Password protection */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Password Protection</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${protection.enabled ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                {protection.enabled ? 'Locked' : 'Off'}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-3">Available on your {mockBusinessProfile.membership} {mockBusinessProfile.tier} plan — lock sections of this VCard behind a 6-digit PIN on the published card.</p>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-gray-700 dark:text-gray-200">
                                        {protection.enabled
                                            ? 'PIN ' + '•'.repeat(Math.max(4, protection.password.length))
                                            : 'No PIN set yet'}
                                    </p>
                                    <p className="text-[9px] text-gray-400 truncate">{protection.hint || 'No hint set'}</p>
                                    <p className="text-[9px] text-gray-400 truncate">
                                        {protection.enabled
                                            ? `${protection.sections.length} protected section${protection.sections.length === 1 ? '' : 's'}: ${protection.sections.map(s => BIZ_SECTIONS.find(d => d.id === s)?.name ?? s).join(', ')}`
                                            : 'All sections are public'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {protection.enabled && (
                                        <button onClick={resetProtection} className={`px-2 py-1 rounded-lg border text-[10px] font-medium ${confirmingReset ? 'border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            {confirmingReset ? 'Confirm reset?' : 'Reset'}
                                        </button>
                                    )}
                                    <Link to={`/b/vcards/${vcard.id}/edit`} className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 shrink-0">Manage</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Storefront link */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Storefront Link</h4>
                        <p className="text-[10px] text-gray-400 mb-2.5">Share this link so customers can open your VCard on any device.</p>
                        <div className="flex items-center gap-2">
                            <input readOnly value={storefrontUrl} onFocus={e => e.currentTarget.select()}
                                className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50" />
                            <button onClick={copyLink} className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 shrink-0">Copy</button>
                        </div>
                        <div className="flex items-center gap-2 mt-2.5 text-[9px] text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            Live on the web — anyone with this link can view your VCard.
                        </div>
                    </div>
                </div>
            </div>

            {/* Share · Exchange · Redeem — collapsible, read-only content */}
            <ShareExchangeRedeemPanel vcardId={vcard.id} sections={sections} />

            {/* QR sheet */}
            <BottomSheet open={qrOpen} onClose={() => setQrOpen(false)} title="VCard QR Code">
                <QRCodeBlock value={storefrontUrl} title={vcard.name} subtitle="Scan to open your live VCard on any device" />
            </BottomSheet>
        </div>
    )
}
