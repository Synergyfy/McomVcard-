import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LayoutFaceContent, CardPreviewModal } from '../../components/admin/CardPreview'
import { DetailRow } from '../admin/card-management/BusinessCardTemplatesPage'
import {
  getBusinessCardRow,
  getCardEditorContent,
  sectionsToFaces,
  getCardPasswordInfo,
  setCardPassword,
  BIZ_CARD_SECTIONS,
  type BizCardSectionState,
} from '../../services/businessCardEditorStore'
import type { CardRow } from '../../services/businessCardEditorStore'

/* ------------------------------------------------------------------ */
/*  Flip preview (front / back, 85 × 55 mm)                            */
/* ------------------------------------------------------------------ */

function CardFlipPreview({ sections }: { sections: BizCardSectionState[] }) {
  const [flipped, setFlipped] = useState(false)
  const faces = sectionsToFaces(sections)
  return (
    <div style={{ perspective: '1200px' }}>
      <div
        className="relative w-[340px] max-w-full aspect-[85/55] cursor-pointer transition-transform duration-700 select-none mx-auto"
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
      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-2">
        {flipped ? 'Back' : 'Front'} · click the card to flip · 85 × 55 mm
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Content sections approval list row                                 */
/* ------------------------------------------------------------------ */

const SECTION_ICONS = new Map(BIZ_CARD_SECTIONS.map(s => [`${s.face}-${s.id}`, s.icon]))

function SectionRow({ schemaId, face, name, locked }: { schemaId: string; face: string; name: string; locked: boolean }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${locked ? 'bg-gray-200 dark:bg-gray-600 text-gray-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600'}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={SECTION_ICONS.get(`${face}-${schemaId}`) ?? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z'} />
        </svg>
      </div>
      <p className="flex-1 text-[11px] font-medium text-gray-900 dark:text-white truncate">{name}</p>
      {locked
        ? <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 text-[8px] font-medium whitespace-nowrap">Admin-managed</span>
        : <span className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-[8px] font-medium whitespace-nowrap">Editable</span>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Password protection modal                                          */
/* ------------------------------------------------------------------ */

function PasswordModal({ row, sections, onClose }: { row: CardRow; sections: BizCardSectionState[]; onClose: () => void }) {
  const info = getCardPasswordInfo(sections)
  const [password, setPassword] = useState(info.password)
  const [hint, setHint] = useState(info.hint)

  const handleSave = () => {
    setCardPassword(row.id, password, hint, info.message)
    toast.success('Password protection saved')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center gap-3 border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">Password Protection — {row.name}</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Set the PIN customers must enter before the card unlocks.</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Require password to unlock</p>
              <p className="text-[9px] text-gray-400">The lock switch is Admin-managed and fixed on the template.</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-[9px] font-semibold ${info.enabled ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              {info.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="e.g. 1234"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400" />
            <p className="text-[8px] text-gray-400 mt-1">Leave empty to disable the PIN while keeping the Admin lock flag intact.</p>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Password Hint (optional)</label>
            <input type="text" value={hint} onChange={e => setHint(e.target.value)} placeholder="Ask staff for the PIN"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={handleSave} className="px-3.5 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-sm">Save Password</button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const row = getBusinessCardRow(Number(id))

  const [previewFor, setPreviewFor] = useState<CardRow | null>(null)
  const [passwordFor, setPasswordFor] = useState(false)

  if (!row) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Helmet><title>Card not found - MCOMVCard</title></Helmet>
        <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card not found.</p>
        <Link to="/b/cards" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Back to My Cards</Link>
      </div>
    )
  }

  const sections = getCardEditorContent(row.id)
  const faces = sectionsToFaces(sections)
  const passwordInfo = getCardPasswordInfo(sections)
  const storefrontUrl = `https://mcomvcard.app/c/${row.templateId}`

  const copyLink = () => {
    try { navigator.clipboard?.writeText(storefrontUrl) } catch { /* ignore */ }
    toast.success('Card link copied')
  }

  const statusCls = row.status === 'Published'
    ? 'bg-green-50 dark:bg-green-500/10 text-green-600'
    : row.status === 'Draft'
      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'

  const frontSections = sections.filter(s => s.face === 'front')
  const backSections = sections.filter(s => s.face === 'back')

  return (
    <div className="space-y-5">
      <Helmet><title>{row.name} - My Cards - MCOMVCard</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link to="/b/dashboard" className="text-[10px] text-orange-600 hover:underline">Business Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <Link to="/b/cards" className="text-[10px] text-orange-600 hover:underline">My Cards</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">{row.name}</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.templateId} · v{row.version} · {row.category} · 85 × 55 mm</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0">
            ← Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Card design */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Card Design</h4>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusCls}`}>{row.status}</span>
          </div>
          <div className="rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-6">
            <CardFlipPreview sections={sections} />
          </div>
          <div className="flex items-center gap-2 mt-3 text-[9px] text-gray-400 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Rendering live from the content you saved in the Content Editor
          </div>
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Card Details</h4>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50 text-[10px] px-3 py-1">
            <DetailRow label="Template ID" value={row.templateId} />
            <DetailRow label="Version" value={`v${row.version}`} />
            <DetailRow label="Category" value={row.category} />
            <DetailRow label="Status" value={row.status} />
            <DetailRow label="QR Position" value={row.qrPosition} />
            <DetailRow label="QR Size" value={row.qrSize} />
            <DetailRow label="Security" value={row.hasSecurity ? 'Enabled' : 'Disabled'} />
            <DetailRow label="F&F Indicator" value={row.ffIndicator} />
            <DetailRow label="Progress Display" value={row.progressDisplay} />
            <DetailRow label="Theme" value={row.theme} />
            <DetailRow label="Updated" value={row.lastUpdated} />
            <DetailRow label="Updated By" value={row.updatedBy} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <Link to={`/b/cards/${row.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 text-white text-[11px] font-semibold hover:bg-orange-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Content
            </Link>
            <button onClick={() => setPasswordFor(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 text-[11px] font-semibold hover:bg-amber-50 dark:hover:bg-amber-500/10">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Password Protection
            </button>
            <button onClick={() => setPreviewFor(row)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          </div>
        </div>
      </div>

      {/* Content sections approval list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Front Face — Content Sections</h4>
            <span className="text-[10px] text-gray-400">{frontSections.filter(s => !s.locked).length} editable</span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Green sections are editable by you. Grey sections are managed by your Admin and fixed on the template.</p>
          <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
            {frontSections.map(s => (
              <SectionRow key={s.uid} schemaId={s.schemaId} face={s.face} name={s.name} locked={s.locked} />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Back Face — Content Sections</h4>
            <span className="text-[10px] text-gray-400">{backSections.filter(s => !s.locked).length} editable</span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Contact info and signature are editable — everything else comes from your Admin template.</p>
          <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
            {backSections.map(s => (
              <SectionRow key={s.uid} schemaId={s.schemaId} face={s.face} name={s.name} locked={s.locked} />
            ))}
          </div>
        </div>
      </div>

      {/* Storefront link + password status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Storefront Link</h4>
          <p className="text-[10px] text-gray-400 mb-2.5">Share this link so customers can open your card on any device.</p>
          <div className="flex items-center gap-2">
            <input readOnly value={storefrontUrl} onFocus={e => e.currentTarget.select()}
              className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50" />
            <button onClick={copyLink} className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 shrink-0">Copy</button>
          </div>
          <div className="flex items-center gap-2 mt-2.5 text-[9px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Live on the web — anyone with this link can view your card.
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Password Protection</h4>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${passwordInfo.enabled && passwordInfo.hasPassword ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              {passwordInfo.enabled && passwordInfo.hasPassword ? 'Locked' : 'Off'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Require a password before the card unlocks. The lock flag is Admin-managed — you set the PIN value.</p>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-700 dark:text-gray-200">
                {passwordInfo.enabled && passwordInfo.hasPassword
                  ? passwordInfo.password
                    ? 'PIN ' + '•'.repeat(Math.max(4, passwordInfo.password.length))
                    : 'PIN locked'
                  : 'No PIN set yet'}
              </p>
              <p className="text-[9px] text-gray-400 truncate">{passwordInfo.hint || 'No hint set'}</p>
            </div>
            <button onClick={() => setPasswordFor(true)} className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 shrink-0">Manage</button>
          </div>
        </div>
      </div>

      {previewFor && (
        <CardPreviewModal
          name={previewFor.name}
          templateId={previewFor.templateId}
          cardType="business"
          faces={faces}
          badge={previewFor.category}
          onEdit={() => { setPreviewFor(null); navigate(`/b/cards/${previewFor.id}/edit`) }}
          onClose={() => setPreviewFor(null)}
        />
      )}
      {passwordFor && (
        <PasswordModal row={row} sections={sections} onClose={() => setPasswordFor(false)} />
      )}
    </div>
  )
}
