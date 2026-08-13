import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CENTRES } from '../../admin/card-management/TemplateBuilderPage'
import {
  buildBusinessCentres,
  getBusinessCentreControls,
  type BusinessCentreId,
  type BizSectionState,
} from '../../../services/businessVCardEditorStore'

const ACCENT: Record<string, { text: string; border: string; bg: string; dot: string }> = {
  blue: { text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', bg: 'bg-blue-50 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  amber: { text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  green: { text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', bg: 'bg-green-50 dark:bg-green-500/10', dot: 'bg-green-500' },
}

const CENTRE_IDS: BusinessCentreId[] = ['share', 'exchange', 'redeem']

export default function ShareExchangeRedeemPanel({ vcardId, sections }: {
  vcardId: number
  sections: BizSectionState[]
}) {
  const [open, setOpen] = useState<BusinessCentreId | null>(null)
  const centres = buildBusinessCentres(sections, getBusinessCentreControls(vcardId))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">Share · Exchange · Redeem</p>
            <p className="text-[9px] text-gray-400">The three core actions on your VCard — see what customers can do.</p>
          </div>
        </div>
        <Link to={`/b/vcards/${vcardId}/edit`}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit Content
        </Link>
      </div>

      {CENTRE_IDS.map((centreId) => {
        const centre = centres[centreId]
        const meta = CENTRES.find(c => c.id === centreId)!
        const accent = ACCENT[meta.accent] ?? ACCENT.blue
        const expanded = open === centreId
        const items = centre.items ?? []

        return (
          <div key={centreId} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
            {/* Header */}
            <button onClick={() => setOpen(expanded ? null : centreId)}
              className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent.bg} ${accent.text}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{meta.name}</p>
                <p className="text-[9px] text-gray-400 truncate">{items.length} item{items.length === 1 ? '' : 's'} on your card</p>
              </div>
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-semibold ${accent.bg} ${accent.text}`}>
                {items.length}
              </span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {expanded && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-3.5 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{centre.contentTitle || meta.desc}</p>
                <div className="space-y-1.5 mb-3">
                  {items.length === 0 && (
                    <p className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-2.5 py-2">No items set yet.</p>
                  )}
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 dark:bg-gray-700/30 px-2.5 py-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 truncate">{item.title || 'Untitled'}</p>
                        {item.description && <p className="text-[9px] text-gray-400 truncate">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(item.value || item.price) && <span className="text-[9px] font-bold text-gray-500">{item.value || item.price}</span>}
                        {item.linkLabel && <span className="text-[9px] font-semibold text-orange-500">{item.linkLabel}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <Link to={`/b/vcards/${vcardId}/edit?centre=${centreId}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit in Content Editor
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
