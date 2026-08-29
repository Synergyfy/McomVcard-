import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'
import { MiniCardPreview, CardFlip } from '../../../components/admin/BusinessCardPreview'
import { mockCardDesigns } from '../../../services/mockData'
import type { MockCardDesign } from '../../../services/mockData'
import ActionDropdown from '../../../components/common/ActionDropdown'

type CardDesign = MockCardDesign

const TABS = [
  { key: 'Business' as const, label: 'Business Cards', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'Consumer' as const, label: 'Consumer Cards', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]



function ConfirmModal({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string; confirmColor: string; onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: confirmColor + '20' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: confirmColor }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={() => { onConfirm(); onCancel() }} className="px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90" style={{ backgroundColor: confirmColor }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function EditDesignModal({ design, onClose, onSave }: { design: CardDesign; onClose: () => void; onSave: (d: CardDesign) => void }) {
  const [form, setForm] = useState({ ...design })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Design</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Style</label>
            <input type="text" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Primary</label>
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Secondary</label>
              <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Accent</label>
              <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Layout</label>
            <select value={form.layout} onChange={(e) => setForm({ ...form, layout: e.target.value as CardDesign['layout'] })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="split">Split</option>
              <option value="centered">Centered</option>
              <option value="header">Header</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
              <option value="diagonal">Diagonal</option>
            </select>
          </div>
          <div className="aspect-[1.75/1] bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
            <MiniCardPreview d={form} className="shadow-md" />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600">Save Changes</button>
        </div>
      </div>
    </div>
  )
}

export default function CardListPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(mockCardDesigns)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'Business' | 'Consumer'>('Business')
  const [previewDesign, setPreviewDesign] = useState<CardDesign | null>(null)
  const [editDesign, setEditDesign] = useState<CardDesign | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ design: CardDesign; action: 'suspend' | 'archive' } | null>(null)

  const tabData = data.filter((d) => d.type === tab && d.status !== 'archived')
  const filtered = tabData.filter((d) => {
    const q = search.toLowerCase()
    return d.name.toLowerCase().includes(q) || d.style.toLowerCase().includes(q)
  })

  const updateDesign = (updated: CardDesign) => {
    setData((prev) => prev.map((x) => x.id === updated.id ? updated : x))
    toast.success(`"${updated.name}" updated`)
  }

  const cloneDesign = (d: CardDesign) => {
    const newId = String(Math.max(...data.map((x) => Number(x.id))) + 1)
    const clone: CardDesign = { ...d, id: newId, name: `${d.name} (Clone)`, usage: 0, created: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }) }
    setData((prev) => [...prev, clone])
    toast.success(`"${clone.name}" created`)
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Card Designs - MCOM VCard Social Bio</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Card Designs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Business card design blueprints — {data.length} designs ({data.filter((d) => d.status === 'archived').length} archived)</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-1 inline-flex gap-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch('') }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === t.key ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder={`Search ${tab.toLowerCase()} card designs...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
        </div>
        <button onClick={() => toast.success(`Creating new ${tab.toLowerCase()} card design`)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create {tab} Card
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title={`Total ${tab} Cards`} value={tabData.length} color="blue" subtitle={`${tabData.filter((d) => d.status === 'active').length} active`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>} />
        <StatsCard title="Styles" value={new Set(tabData.map((d) => d.style)).size} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />
        <StatsCard title="Total Usage" value={tabData.reduce((s, d) => s + d.usage, 0).toLocaleString()} color="orange" subtitle="Across all cards" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <StatsCard title="Active" value={tabData.filter((d) => d.status === 'active').length} color="green" subtitle={`${Math.round((tabData.filter((d) => d.status === 'active').length / tabData.length) * 100)}% of total`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-xl transition-all group" onClick={() => setPreviewDesign(d)}>
            <div className="aspect-[1.75/1] bg-gray-50 dark:bg-gray-700/50 p-3 cursor-pointer">
              <MiniCardPreview d={d} className="shadow-md group-hover:shadow-xl transition-shadow" />
            </div>
            <div className="p-3.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{d.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.style}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${
                  d.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
                  'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300'
                }`}>{d.status}</span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{d.usage.toLocaleString()} used · Created {d.created}</p>
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-50 dark:border-gray-700">
                <ActionDropdown actions={[
                  { label: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick: () => setPreviewDesign(d) },
                  { label: 'Manage', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', onClick: () => navigate(`/admin/cards/${d.id}`) },
                  { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => setEditDesign(d) },
                  { label: 'Clone', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', onClick: () => cloneDesign(d) },
                  { label: '', divider: true },
                  { label: d.status === 'active' ? 'Suspend' : 'Activate', icon: d.status === 'active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', destructive: d.status === 'active', onClick: () => setConfirmAction({ design: d, action: 'suspend' }) },
                  { label: 'Archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', destructive: true, onClick: () => setConfirmAction({ design: d, action: 'archive' }) },
                ]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreviewDesign(null)}>
          <div className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">{previewDesign.name}</p>
              <button onClick={() => setPreviewDesign(null)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <CardFlip d={previewDesign} />
          </div>
        </div>
      )}

      {editDesign && <EditDesignModal design={editDesign} onClose={() => setEditDesign(null)} onSave={updateDesign} />}

      <ConfirmModal
        open={confirmAction !== null}
        title={confirmAction?.action === 'suspend' ? (confirmAction.design.status === 'active' ? 'Suspend Design' : 'Activate Design') : 'Archive Design'}
        message={confirmAction?.action === 'suspend'
          ? (confirmAction?.design.status === 'active' ? `"${confirmAction?.design.name}" will be suspended. Businesses using it won't be able to assign it to new cards.` : `"${confirmAction?.design.name}" will be reactivated.`)
          : `"${confirmAction?.design.name}" will be archived and hidden from selection. This can be reversed later.`}
        confirmLabel={confirmAction?.action === 'suspend' ? (confirmAction?.design.status === 'active' ? 'Suspend' : 'Activate') : 'Archive'}
        confirmColor={confirmAction?.action === 'suspend' ? (confirmAction?.design.status === 'active' ? '#D97706' : '#059669') : '#DC2626'}
        onConfirm={() => {
          if (!confirmAction) return
          if (confirmAction.action === 'suspend') {
            const updated = { ...confirmAction.design, status: confirmAction.design.status === 'active' ? 'inactive' as const : 'active' as const }
            setData((prev) => prev.map((x) => x.id === updated.id ? updated : x))
            toast.success(`"${updated.name}" ${updated.status === 'active' ? 'activated' : 'suspended'}`)
          } else {
            setData((prev) => prev.map((x) => x.id === confirmAction.design.id ? { ...x, status: 'archived' as const } : x))
            toast.success(`"${confirmAction.design.name}" archived`)
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
