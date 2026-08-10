import toast from 'react-hot-toast'

export interface AuditTemplateInfo {
  name: string
  version: string
  templateId: string
  status: string
}

function ModalShell({ title, sub, onClose, children }: {
  title: string
  sub: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white">{title}</h4>
            <p className="text-[10px] text-gray-400">{sub}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

const ACTIVITY_FEED = [
  { time: '2 min ago', text: 'Template validated', by: 'You', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { time: '18 min ago', text: 'Banner image updated', by: 'You', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { time: '1 hour ago', text: 'Draft saved', by: 'You', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10', icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4' },
  { time: '3 hours ago', text: 'Template created', by: 'You', color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { time: 'Yesterday', text: 'Version v1.0 published', by: 'System', color: 'text-green-600 bg-green-50 dark:bg-green-500/10', icon: 'M5 13l4 4L19 7' },
]

export function TemplateActivityModal({ template, onClose }: { template: AuditTemplateInfo; onClose: () => void }) {
  return (
    <ModalShell title="Activity" sub={`Everything that has happened to ${template.name}.`} onClose={onClose}>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400">{template.templateId}</span>
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">v{template.version}</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${template.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>{template.status}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Edits', value: '24' },
            { label: 'Saves', value: '7' },
            { label: 'Publishes', value: '2' },
            { label: 'Scans', value: '2,847' },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-center">
              <p className="text-base font-bold text-gray-800 dark:text-white">{k.value}</p>
              <p className="text-[9px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {ACTIVITY_FEED.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200">{a.text}</p>
                <p className="text-[9px] text-gray-400">{a.by}</p>
              </div>
              <span className="text-[9px] text-gray-400 whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  )
}

export function TemplateVersionsModal({ template, onClose }: { template: AuditTemplateInfo; onClose: () => void }) {
  const versions = [
    { v: `v${template.version}`, label: template.status, time: template.status === 'Published' ? 'Published yesterday' : 'Saved 3 hours ago', by: 'System', active: template.status !== 'Published' },
    { v: 'v0.9', label: 'Draft', time: 'Saved 3 hours ago', by: 'You', active: false },
    { v: 'v0.1', label: 'Draft', time: 'Created 1 day ago', by: 'You', active: template.status === 'Draft' },
  ]
  return (
    <ModalShell title="Version History" sub={`Every save and publish of ${template.name} creates a version you can compare or restore.`} onClose={onClose}>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400">{template.templateId}</span>
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">Current: v{template.version}</span>
        </div>
        <div className="space-y-2">
          {versions.map((ver, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">{ver.v}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">{ver.v}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${ver.label === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>{ver.label}</span>
                  {ver.active && <span className="text-[8px] text-gray-400">current draft</span>}
                </div>
                <p className="text-[9px] text-gray-400">{ver.time} · {ver.by}</p>
              </div>
              <button onClick={() => toast.success(`Comparing ${ver.v}`)} className="px-2 py-1 rounded-lg text-[9px] font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50">Compare</button>
              <button onClick={() => toast.success(`${ver.v} restored`)} className="px-2 py-1 rounded-lg text-[9px] font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50">Restore</button>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  )
}
