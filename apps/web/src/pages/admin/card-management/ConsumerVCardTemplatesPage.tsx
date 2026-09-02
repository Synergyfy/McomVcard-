import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  loadUserTemplatesByType,
  archiveUserTemplate,
  deleteUserTemplate,
  type StoredTemplate,
  type StoredSection,
} from '../../../services/vcardTemplateStore'
import { ensureStoredTemplate } from '../../../services/vcardTemplateActions'
import { claimedConsumerCount } from '../vcard-management/consumerVCardData'
import ScrollingVCard from '../../../components/common/ScrollingVCard'
import ConsumerVCardWorkspace, { buildPublishedSections } from './ConsumerVCardWorkspace'
import ActionDropdown from '../../../components/common/ActionDropdown'
import { TemplateActivityModal, TemplateVersionsModal } from '../../../components/admin/TemplateAuditModals'
import TemplateConfirmModal from '../../../components/admin/TemplateConfirmModal'
import { combineConTemplates, type ConTemplate } from '../../../services/vcardTemplateCatalogue'

export type { ConTemplate } from '../../../services/vcardTemplateCatalogue'

export default function ConsumerVCardTemplatesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [previewTemplate, setPreviewTemplate] = useState<{ name: string; templateId: string; sections: unknown } | null>(null)
  const [workspaceTemplate, setWorkspaceTemplate] = useState<ConTemplate | null>(null)
  const [activityFor, setActivityFor] = useState<ConTemplate | null>(null)
  const [versionsFor, setVersionsFor] = useState<ConTemplate | null>(null)
  const [deleteFor, setDeleteFor] = useState<ConTemplate | null>(null)
  const [archiveFor, setArchiveFor] = useState<ConTemplate | null>(null)
  const [stored, setStored] = useState<StoredTemplate[]>(() => loadUserTemplatesByType('consumer'))

  const refresh = () => setStored(loadUserTemplatesByType('consumer'))

  const isStored = (id: string) => stored.some(s => String(s.id) === id)
  const all = combineConTemplates(stored)

  /* Ensure a template exists as a stored (localStorage) template so every
     row action works on both platform and user-created templates. */
  const ensureStored = (t: ConTemplate): StoredTemplate => {
    const s = ensureStoredTemplate(t, 'consumer', buildPublishedSections(t) as unknown as StoredSection[])
    refresh()
    return s
  }

  const handleDuplicate = (t: ConTemplate) => {
    const s = ensureStored(t)
    navigate(`/admin/vcard-management/template-builder?duplicate=${s.id}`)
  }

  const handleEditBuilder = (t: ConTemplate) => {
    const s = ensureStored(t)
    navigate(`/admin/vcard-management/template-builder?id=${s.id}`)
  }

  const handleArchive = (t: ConTemplate) => setArchiveFor(t)

  const confirmArchive = () => {
    if (!archiveFor) return
    const s = ensureStored(archiveFor)
    archiveUserTemplate(s.id)
    refresh()
    toast.success(`${archiveFor.name} archived`)
    setArchiveFor(null)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleExport = (t: ConTemplate) => {
    const s = stored.find(x => x.id === t.id) ?? stored.find(x => x.templateId === t.templateId)
    const builder = s?.builder ?? {
      templateName: t.name,
      templateCategory: t.category,
      layoutPreset: 'preset-1',
      sections: buildPublishedSections(t) as unknown as StoredSection[],
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      kind: 'Consumer VCard Template',
      template: {
        id: t.id,
        templateId: t.templateId,
        name: t.name,
        version: t.version,
        description: t.description,
        status: t.status,
        category: t.category,
        levels: t.levels,
        membershipSupport: t.membershipSupport,
        features: t.features,
        builder,
      },
    }
    downloadFile(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${t.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${t.templateId}.json`)
    toast.success(`${t.name} exported`)
  }

  const confirmDelete = () => {
    if (!deleteFor) return
    const s = ensureStored(deleteFor)
    deleteUserTemplate(s.id)
    refresh()
    toast.success(`${deleteFor.name} deleted`)
    setDeleteFor(null)
  }

  const filtered = all.filter(t => {
    const ms = t.name.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'all' || t.status.toLowerCase() === filter
    return ms && mf
  })

  if (workspaceTemplate) {
    return <ConsumerVCardWorkspace template={workspaceTemplate} onBack={() => setWorkspaceTemplate(null)} />
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Consumer VCard Templates - VCard Management - MCOM VCard</title></Helmet>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Consumer VCard Templates</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer engagement hub templates — membership, wallet, Friends & Family, Share, Exchange, Redeem, and more. Click a template to see the consumers using it.</p>
          </div>
          <button onClick={() => navigate('/admin/vcard-management/template-builder?type=consumer')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Template</button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['all', 'published', 'draft', 'archived'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 font-medium">Template</th>
                <th className="text-left px-2 py-1.5 font-medium">ID</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-right px-2 py-1.5 font-medium">Consumers</th>
                <th className="text-right px-2 py-1.5 font-medium">Usage</th>
                <th className="text-right px-2 py-1.5 font-medium">Claimed</th>
                <th className="text-left px-2 py-1.5 font-medium">Member Levels</th>
                <th className="text-left px-2 py-1.5 font-medium">Modified</th>
                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onClick={() => setWorkspaceTemplate(t)} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                  <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{t.name}</td>
                  <td className="px-2 py-1.5 font-mono text-gray-400">{t.templateId}</td>
                  <td className="px-2 py-1.5"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${t.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : t.status === 'Draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{t.status}</span></td>
                  <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{t.consumers}</td>
                  <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{t.usage.toLocaleString()}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 text-[9px] font-semibold">
                      {isStored(String(t.id)) ? 0 : claimedConsumerCount(t.id)} claimed
                    </span>
                  </td>
                  <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[9px] font-medium">{t.levels}</span></td>
                  <td className="px-2 py-1.5 text-gray-500">{t.modified}</td>
                  <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                    <ActionDropdown actions={[
                      { label: 'Open', icon: 'M5 12h14M12 5l7 7-7 7', onClick: () => setWorkspaceTemplate(t) },
                      {
                        label: 'Preview', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
                        onClick: () => {
                           if (isStored(String(t.id))) {
                            const s = stored.find(x => x.id === t.id)!
                            setPreviewTemplate({ name: t.name, templateId: t.templateId, sections: s.builder.sections })
                          } else {
                            setPreviewTemplate({ name: t.name, templateId: t.templateId, sections: buildPublishedSections(t) })
                          }
                        },
                      },
                      {
                        label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
                        onClick: () => handleDuplicate(t),
                      },
                      { label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => setActivityFor(t) },
                      { label: 'Version History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zm0 0l2-2m-2 2l2 2', onClick: () => setVersionsFor(t) },
                      { divider: true },
                      { label: 'Edit in Builder', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => handleEditBuilder(t) },
                      { label: 'Assign', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', onClick: () => navigate('/admin/vcard-management/assignment') },
                      { label: 'Archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', onClick: () => handleArchive(t) },
                      { label: 'Export', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', onClick: () => handleExport(t) },
                      { divider: true },
                      {
                        label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true,
                        onClick: () => setDeleteFor(t),
                      },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-8"><p className="text-xs text-gray-500">No templates found</p></div>}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Configurable Consumer VCard Blocks</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {['Membership Info', 'Wallet', 'Friends & Family', 'Share', 'Exchange', 'Redeem', 'Local Campaigns', 'Wishlist', 'Community Updates', 'Dynamic QR', 'Password Sections', 'Rewards', 'Bookings', 'Referrals'].map(b => (
            <div key={b} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 text-center">
              <p className="text-[9px] text-gray-600 dark:text-gray-300 font-medium">{b}</p>
              <p className="text-[8px] text-gray-400 mt-0.5">Configurable</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-scroll preview modal for stored templates */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">{previewTemplate.name} — Auto-Scroll Preview</h4>
                <p className="text-[10px] text-gray-400">Scans through the whole card — hover to scroll (desktop), tap to scroll or pause (mobile)</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" onClick={() => setPreviewTemplate(null)}>
              <div onClick={e => e.stopPropagation()}>
                <ScrollingVCard sections={previewTemplate.sections} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity & Version History modals */}
      {activityFor && (
        <TemplateActivityModal
          template={{ name: activityFor.name, version: activityFor.version, templateId: activityFor.templateId, status: activityFor.status }}
          onClose={() => setActivityFor(null)} />
      )}
      {versionsFor && (
        <TemplateVersionsModal
          template={{ name: versionsFor.name, version: versionsFor.version, templateId: versionsFor.templateId, status: versionsFor.status }}
          onClose={() => setVersionsFor(null)} />
      )}

      {/* Delete / Archive confirmation modals */}
      {deleteFor && (
        <TemplateConfirmModal
          name={deleteFor.name}
          templateIdNum={deleteFor.id}
          status={deleteFor.status}
          usageLabel="Consumers"
          usageCount={deleteFor.consumers}
          impactLabel="Affected VCards"
          impact={deleteFor.consumers + (deleteFor.status === 'Published' ? 1 : 0)}
          mode="delete"
          onClose={() => setDeleteFor(null)}
          onConfirm={confirmDelete} />
      )}
      {archiveFor && (
        <TemplateConfirmModal
          name={archiveFor.name}
          templateIdNum={archiveFor.id}
          status={archiveFor.status}
          usageLabel="Consumers"
          usageCount={archiveFor.consumers}
          impactLabel="Affected VCards"
          impact={archiveFor.consumers + (archiveFor.status === 'Published' ? 1 : 0)}
          mode="archive"
          onClose={() => setArchiveFor(null)}
          onConfirm={confirmArchive} />
      )}
    </div>
  )
}
