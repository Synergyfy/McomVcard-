import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import {
  loadSectors, upsertSector, deleteSector, newSector,
  type Sector,
} from '../../../services/catalogStore'

const SECTOR_COLORS = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1', '#84CC16']

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>(() => loadSectors())
  const [editing, setEditing] = useState<Sector | null>(null)
  const [isNew, setIsNew] = useState(false)

  const refresh = () => setSectors(loadSectors())

  const openNew = () => { setIsNew(true); setEditing(newSector()) }
  const openEdit = (s: Sector) => { setIsNew(false); setEditing({ ...s }) }

  const save = () => {
    if (!editing) return
    if (!editing.name.trim()) { toast.error('Sector name is required'); return }
    upsertSector({ ...editing, name: editing.name.trim(), color: editing.color || SECTOR_COLORS[0] })
    toast.success(isNew ? 'Sector created' : 'Sector updated')
    setEditing(null)
    refresh()
  }

  const remove = (s: Sector) => {
    if (!window.confirm(`Delete sector "${s.name}"? Cards already assigned to it will keep the assignment.`)) return
    deleteSector(s.id)
    toast.success('Sector deleted')
    refresh()
  }

  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  return (
    <div>
      <Helmet><title>Sectors - Settings - MCOM VCard</title></Helmet>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sectors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create sectors once — they appear in every card and VCard template builder so you can assign templates to one or more sectors.
          </p>
        </div>
        <button onClick={openNew} className="shrink-0 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 dark:shadow-none flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Sector
        </button>
      </div>

      {/* Create / edit form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{isNew ? 'Create Sector' : 'Edit Sector'}</h4>
                <p className="text-[11px] text-gray-400">A sector groups card templates for assignment.</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input autoFocus type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Loyalty, VIP, Corporate" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colour</label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {SECTOR_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setEditing({ ...editing, color: c })}
                        className={`w-7 h-7 rounded-lg transition-transform ${editing.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <input type="color" value={editing.color || SECTOR_COLORS[0]} onChange={e => setEditing({ ...editing, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea rows={2} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="What does this sector cover?" className={`${inputCls} resize-none`} />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
                {isNew ? 'Create Sector' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All sectors</h3>
            <p className="text-[11px] text-gray-400">{sectors.length} sector{sectors.length === 1 ? '' : 's'} · appear in all template builders</p>
          </div>
        </div>
        {sectors.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No sectors yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first sector — it will show up in the template builders automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {sectors.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: s.color }}>
                  {s.name.charAt(0).toUpperCase() || '•'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</p>
                  {s.description && <p className="text-xs text-gray-400 truncate">{s.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => openEdit(s)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500">
                    Edit
                  </button>
                  <button onClick={() => remove(s)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
