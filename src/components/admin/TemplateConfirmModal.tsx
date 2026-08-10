import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Delete / Archive confirmation modal for VCard templates.           */
/*  Both actions are disruptive, so the admin must read the risk        */
/*  summary and type the exact confirmation word to unlock the button.  */
/* ------------------------------------------------------------------ */

export default function TemplateConfirmModal({ name, templateIdNum, status, usageLabel, usageCount, impactLabel, impact, mode, onClose, onConfirm }: {
  name: string
  templateIdNum: number
  status: string
  usageLabel: string
  usageCount: number
  impactLabel: string
  impact: number
  mode: 'delete' | 'archive'
  onClose: () => void
  onConfirm: () => void
}) {
  const [typed, setTyped] = useState('')
  const confirmWord = mode === 'delete' ? 'Delete Template' : 'Archive Template'
  const confirmed = typed.trim() === confirmWord
  const isDelete = mode === 'delete'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDelete
          ? 'border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10'
          : 'border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDelete
            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isDelete
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />}
            </svg>
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isDelete ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {isDelete ? `Delete "${name}"?` : `Archive "${name}"?`}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {isDelete
                ? 'This will permanently delete the template and cannot be undone.'
                : 'Archiving hides the template from active use. The template can be restored later.'}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className={`rounded-xl border p-3.5 space-y-2 ${isDelete
            ? 'border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5'
            : 'border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5'}`}>
            <p className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDelete ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Risks before you continue
            </p>
            <ul className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
              {isDelete ? (
                <>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>Deleting removes the template, its layout, content sections and version history permanently.</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>Any business or consumer currently using this template will instantly lose their design and will fall back to the platform default template.</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>Public links (<span className="font-mono text-[10px]">/t/{templateIdNum}</span>) and any printed QR codes pointing at this template will stop resolving.</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>Assignments and membership rules referencing this template will be broken and must be re-mapped.</li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Archiving removes the template from active lists and it can no longer be assigned to new businesses.</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Businesses already using it keep their current design, but will no longer receive updates or fixes to this template.</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>Dynamic QR rules, campaign links and public previews pointing at this template are paused.</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span>The template is not deleted — you can restore it from the Archive at any time.</li>
                </>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{usageCount.toLocaleString()}</p>
              <p className="text-[9px] text-gray-400">{usageLabel}</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{status}</p>
              <p className="text-[9px] text-gray-400">Current status</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{impact.toLocaleString()}</p>
              <p className="text-[9px] text-gray-400">{impactLabel}</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Type <span className={`font-mono font-bold ${isDelete ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{confirmWord}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder={confirmWord}
              autoFocus
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              confirmed
                ? isDelete
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {confirmWord}
          </button>
        </div>
      </div>
    </div>
  )
}
