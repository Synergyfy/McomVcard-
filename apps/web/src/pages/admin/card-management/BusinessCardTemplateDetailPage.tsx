import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getCardTemplate,
  type CardFaces,
  type FriendsFamilyConfig,
} from '../../../services/cardTemplateStore'
import { TemplateActivityModal, TemplateVersionsModal } from '../../../components/admin/TemplateAuditModals'
import { CardPreviewModal, buildMockFaces, LayoutFaceContent } from '../../../components/admin/CardPreview'
import { MOCK, toRow, DetailRow, EditCardWarningModal, type CardRow } from './BusinessCardTemplatesPage'

function useCardRow(id: number): CardRow | null {
  const mock = MOCK.find(m => m.id === id) ?? null
  if (mock) return mock
  const stored = getCardTemplate(id)
  return stored ? toRow(stored) : null
}

function useCardFaces(row: CardRow): CardFaces {
  if (row.isStored) {
    const stored = getCardTemplate(row.id)
    if (stored) return stored.builder.faces
  }
  return buildMockFaces({
    name: row.name,
    templateId: row.templateId,
    cardType: 'business',
    theme: row.theme,
    category: row.category,
    qrPosition: row.qrPosition,
    qrSize: row.qrSize,
    hasSecurity: row.hasSecurity,
    ffIndicator: row.ffIndicator,
    progressDisplay: row.progressDisplay,
  })
}

function useCardFf(row: CardRow) {
  if (row.isStored) {
    const stored = getCardTemplate(row.id)
    if (stored) return stored.builder.friendsFamily
  }
  return undefined
}

function CardFlipPreview({ faces, ff }: { faces: CardFaces; ff?: FriendsFamilyConfig }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div style={{ perspective: '1200px' }}>
      <div
        className="relative w-[340px] max-w-full aspect-[85/55] cursor-pointer transition-transform duration-700 select-none"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onClick={() => setFlipped(!flipped)}
        title="Click to flip"
      >
        <div className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg" style={{ backfaceVisibility: 'hidden' }}>
          <LayoutFaceContent face="front" sections={faces.front} ff={ff} />
        </div>
        <div className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <LayoutFaceContent face="back" sections={faces.back} ff={ff} />
        </div>
      </div>
      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-2">
        {flipped ? 'Back' : 'Front'} · click the card to flip · 85 × 55 mm
      </p>
    </div>
  )
}

export default function BusinessCardTemplateDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const row = useCardRow(Number(id))
  const faces = row ? useCardFaces(row) : null
  const ff = row ? useCardFf(row) : undefined

  const [editFor, setEditFor] = useState<CardRow | null>(null)
  const [activityFor, setActivityFor] = useState<CardRow | null>(null)
  const [versionsFor, setVersionsFor] = useState<CardRow | null>(null)
  const [previewFor, setPreviewFor] = useState<{ row: CardRow; faces: CardFaces } | null>(null)

  if (!row || !faces) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card template not found.</p>
        <Link to="/admin/card-management/business-card-templates" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Back to Business Card Templates</Link>
      </div>
    )
  }

  const confirmEdit = () => {
    if (!editFor) return
    if (editFor.isStored) {
      navigate(`/admin/card-management/card-template-builder?type=business&id=${editFor.id}`)
    } else {
      toast.success(`Editing ${editFor.name}`)
    }
    setEditFor(null)
  }

  const openPreview = () => setPreviewFor({ row, faces })

  return (
    <div className="space-y-5">
      <Helmet><title>{row.name} - Business Card Templates - MCOM VCard</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link to="/admin/card-management" className="text-[10px] text-orange-600 hover:underline">Card Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <Link to="/admin/card-management/business-card-templates" className="text-[10px] text-orange-600 hover:underline">Business Card Templates</Link>
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
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${row.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : row.status === 'Draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{row.status}</span>
          </div>
          <div className="rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-6 flex justify-center">
            <CardFlipPreview faces={faces} ff={ff} />
          </div>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-3 text-center">
            Click the card to flip between the front and back design.
          </p>
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Card Details</h4>
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50 text-[10px] px-3 py-1">
            <DetailRow label="Template ID" value={row.templateId} />
            <DetailRow label="Version" value={`v${row.version}`} />
            <DetailRow label="Category" value={row.category} />
            <DetailRow label="Status" value={row.status} />
            <DetailRow label="Businesses Using" value={row.businessesUsing.toLocaleString()} />
            <DetailRow label="Cards Issued" value={row.cardsIssued.toLocaleString()} />
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
            <button onClick={() => setEditFor(row)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 text-white text-[11px] font-semibold hover:bg-orange-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Card
            </button>
            <button onClick={openPreview} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
            <button onClick={() => navigate(`/admin/card-management/card-template-builder?tab=assignment&type=business`)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Assignment</button>
            <button onClick={() => setActivityFor(row)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Activity</button>
            <button onClick={() => setVersionsFor(row)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Versions</button>
            <button onClick={() => toast.success(`Exporting ${row.name} (front & back print files)`)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
          </div>
        </div>
      </div>

      {activityFor && (
        <TemplateActivityModal
          template={{ name: activityFor.name, version: activityFor.version, templateId: activityFor.templateId, status: activityFor.status }}
          onClose={() => setActivityFor(null)}
        />
      )}
      {versionsFor && (
        <TemplateVersionsModal
          template={{ name: versionsFor.name, version: versionsFor.version, templateId: versionsFor.templateId, status: versionsFor.status }}
          onClose={() => setVersionsFor(null)}
        />
      )}
      {previewFor && (
        <CardPreviewModal
          name={previewFor.row.name}
          templateId={previewFor.row.templateId}
          cardType="business"
          faces={previewFor.faces}
          badge={previewFor.row.category}
          onEdit={() => setEditFor(previewFor.row)}
          onClose={() => setPreviewFor(null)}
        />
      )}
      {editFor && (
        <EditCardWarningModal
          row={editFor}
          onClose={() => setEditFor(null)}
          onConfirm={confirmEdit}
        />
      )}
    </div>
  )
}
