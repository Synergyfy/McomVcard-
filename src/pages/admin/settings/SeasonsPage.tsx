import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { SeasonCountdown } from '../../../components/admin/SeasonCountdown'
import {
  loadSeasons, upsertSeason, deleteSeason, newSeason, seasonStatus,
  type Season,
} from '../../../services/catalogStore'

const SEASON_COLORS = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1', '#84CC16']

const STATUS_CHIP: Record<string, { cls: string; label: string }> = {
  active: { cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600', label: 'Active' },
  upcoming: { cls: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600', label: 'Upcoming' },
  ended: { cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500', label: 'Ended' },
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>(() => loadSeasons())
  const [editing, setEditing] = useState<Season | null>(null)
  const [isNew, setIsNew] = useState(false)

  const refresh = () => setSeasons(loadSeasons())

  const openNew = () => { setIsNew(true); setEditing(newSeason()) }
  const openEdit = (s: Season) => { setIsNew(false); setEditing({ ...s }) }

  const save = () => {
    if (!editing) return
    if (!editing.name.trim()) { toast.error('Season name is required'); return }
    if (!editing.startDate || !editing.endDate) { toast.error('Season start and end dates are required'); return }
    if (new Date(editing.endDate) < new Date(editing.startDate)) { toast.error('End date must be after the start date'); return }
    upsertSeason({ ...editing, name: editing.name.trim(), color: editing.color || SEASON_COLORS[0] })
    toast.success(isNew ? 'Season created' : 'Season updated')
    setEditing(null)
    refresh()
  }

  const remove = (s: Season) => {
    if (!window.confirm(`Delete season "${s.name}"?`)) return
    deleteSeason(s.id)
    toast.success('Season deleted')
    refresh()
  }

  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  return (
    <div>
      <Helmet><title>Seasons - Settings - MCOM VCard</title></Helmet>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seasons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define seasonal windows with start &amp; end dates. Cards with a countdown section show a live D : H : M : S timer while a season is active.
          </p>
        </div>
        <button onClick={openNew} className="shrink-0 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 dark:shadow-none flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Season
        </button>
      </div>

      {/* Create / edit form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{isNew ? 'Create Season' : 'Edit Season'}</h4>
                <p className="text-[11px] text-gray-400">Cards count down to the end date while active.</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input autoFocus type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Summer Sale 2026" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start</label>
                  <input type="datetime-local" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End</label>
                  <input type="datetime-local" value={editing.endDate} onChange={e => setEditing({ ...editing, endDate: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colour</label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {SEASON_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setEditing({ ...editing, color: c })}
                        className={`w-7 h-7 rounded-lg transition-transform ${editing.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <input type="color" value={editing.color || SEASON_COLORS[0]} onChange={e => setEditing({ ...editing, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea rows={2} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="What is this season about?" className={`${inputCls} resize-none`} />
              </div>
              {editing.startDate && editing.endDate && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-3">
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Countdown preview</label>
                  <SeasonCountdown seasonIds={editing.id} label={`${editing.name || 'Season'} ends in`} color={editing.color || '#F97316'} size="sm" showIdle />
                  <p className="text-[9px] text-gray-400 mt-1.5">
                    Status: <span className="font-semibold">{STATUS_CHIP[seasonStatus(editing)].label}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
                {isNew ? 'Create Season' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All seasons</h3>
            <p className="text-[11px] text-gray-400">{seasons.length} season{seasons.length === 1 ? '' : 's'} · usable by the countdown section in template builders</p>
          </div>
        </div>
        {seasons.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No seasons yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first season window to enable countdowns on cards.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {seasons.map(s => {
              const st = seasonStatus(s)
              const chip = STATUS_CHIP[st]
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: s.color }}>
                    {s.name.charAt(0).toUpperCase() || '•'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${chip.cls}`}>{chip.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.startDate ? new Date(s.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      {' → '}
                      {s.endDate ? new Date(s.endDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </p>
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
