import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

interface PublishRecord {
  id: string; preview: string; name: string; type: 'Business VCard' | 'Consumer VCard'
  owner: string; business: string; version: number; status: string; reviewStatus: string
  publishDate: string; expiryDate: string; updatedBy: string; lastUpdated: string; membership: string
  theme: string; qrValid: boolean; validationPassed: boolean
}

const RECORDS: PublishRecord[] = [
  { id: '1', preview: 'MC', name: 'Modern Café VCard', type: 'Business VCard', owner: 'Admin', business: 'Modern Café', version: 4, status: 'Published', reviewStatus: 'Approved', publishDate: '28 Jul 2026', expiryDate: '—', updatedBy: 'Admin', lastUpdated: '2 hours ago', membership: 'Gold', theme: 'Restaurant', qrValid: true, validationPassed: true },
  { id: '2', preview: 'SJ', name: 'Sarah Johnson VCard', type: 'Consumer VCard', owner: 'Sarah Johnson', business: 'Luxury Hotels Ltd', version: 2, status: 'Published', reviewStatus: 'Approved', publishDate: '27 Jul 2026', expiryDate: '—', updatedBy: 'Admin', lastUpdated: '1 day ago', membership: 'Platinum', theme: 'Consumer Default', qrValid: true, validationPassed: true },
  { id: '3', preview: 'TC', name: 'TechCorp Solutions VCard', type: 'Business VCard', owner: 'Admin', business: 'TechCorp Solutions', version: 3, status: 'Pending Review', reviewStatus: 'Under Review', publishDate: '—', expiryDate: '—', updatedBy: 'Designer', lastUpdated: '3 hours ago', membership: 'Platinum Pro+', theme: 'Corporate', qrValid: true, validationPassed: true },
  { id: '4', preview: 'ED', name: 'Emily Davis Consumer VCard', type: 'Consumer VCard', owner: 'Emily Davis', business: 'Café Mocha', version: 1, status: 'Ready For Review', reviewStatus: 'Pending', publishDate: '—', expiryDate: '—', updatedBy: 'Emily Davis', lastUpdated: '5 hours ago', membership: 'Silver', theme: 'Consumer Default', qrValid: false, validationPassed: false },
  { id: '5', preview: 'GR', name: 'Global Retail Inc VCard', type: 'Business VCard', owner: 'Admin', business: 'Global Retail Inc', version: 2, status: 'Draft', reviewStatus: 'Not Submitted', publishDate: '—', expiryDate: '—', updatedBy: 'Admin', lastUpdated: '1 day ago', membership: 'Silver Pro', theme: 'Retail', qrValid: false, validationPassed: false },
  { id: '6', preview: 'JW', name: 'James Wilson VCard', type: 'Consumer VCard', owner: 'James Wilson', business: 'Luxury Hotels Ltd', version: 1, status: 'Approved', reviewStatus: 'Approved', publishDate: 'Scheduled', expiryDate: '—', updatedBy: 'Admin', lastUpdated: '2 days ago', membership: 'Platinum', theme: 'Consumer Premium', qrValid: true, validationPassed: true },
  { id: '7', preview: 'LH', name: 'Luxury Hotels VCard', type: 'Business VCard', owner: 'Admin', business: 'Luxury Hotels Ltd', version: 5, status: 'Scheduled', reviewStatus: 'Approved', publishDate: '1 Aug 2026', expiryDate: '31 Aug 2026', updatedBy: 'Admin', lastUpdated: '1 week ago', membership: 'Platinum', theme: 'Corporate', qrValid: true, validationPassed: true },
  { id: '8', preview: 'MB', name: 'Michael Brown VCard', type: 'Consumer VCard', owner: 'Michael Brown', business: 'TechCorp Solutions', version: 1, status: 'Suspended', reviewStatus: 'Rejected', publishDate: '—', expiryDate: '—', updatedBy: 'Support', lastUpdated: '1 month ago', membership: 'Bronze', theme: 'Consumer Default', qrValid: true, validationPassed: true },
  { id: '9', preview: 'BH', name: 'Boutique Hotel VCard', type: 'Business VCard', owner: 'Designer', business: 'Boutique Hotel', version: 1, status: 'Archived', reviewStatus: 'Approved', publishDate: '15 Jun 2026', expiryDate: '15 Jul 2026', updatedBy: 'Admin', lastUpdated: '2 months ago', membership: 'Silver', theme: 'Default', qrValid: true, validationPassed: true },
  { id: '10', preview: 'AK', name: 'Anna Kelly Consumer VCard', type: 'Consumer VCard', owner: 'Anna Kelly', business: 'Global Retail Inc', version: 1, status: 'Ready For Review', reviewStatus: 'Pending', publishDate: '—', expiryDate: '—', updatedBy: 'Anna Kelly', lastUpdated: '3 days ago', membership: 'Silver Pro+', theme: 'Consumer Default', qrValid: true, validationPassed: true },
  { id: '11', preview: 'GE', name: 'Green Energy VCard', type: 'Business VCard', owner: 'Admin', business: 'Green Energy Co', version: 1, status: 'Pending Review', reviewStatus: 'Under Review', publishDate: '—', expiryDate: '—', updatedBy: 'Designer', lastUpdated: '1 week ago', membership: 'Gold', theme: 'Corporate', qrValid: true, validationPassed: true },
  { id: '12', preview: 'TT', name: 'Tom Thompson VCard', type: 'Consumer VCard', owner: 'Tom Thompson', business: 'Green Energy Co', version: 1, status: 'Draft', reviewStatus: 'Not Submitted', publishDate: '—', expiryDate: '—', updatedBy: 'Tom Thompson', lastUpdated: '3 weeks ago', membership: 'Gold Pro', theme: 'Consumer Default', qrValid: false, validationPassed: false },
]

const HISTORY = [
  { action: 'Published', by: 'Admin', date: 'Today', time: '09:12' },
  { action: 'Approved', by: 'Admin', date: 'Today', time: '09:10' },
  { action: 'Submitted for Review', by: 'Designer', date: 'Today', time: '08:45' },
  { action: 'Archived', by: 'Admin', date: 'Yesterday', time: '16:30' },
  { action: 'Restored', by: 'Admin', date: 'Yesterday', time: '14:15' },
  { action: 'Published', by: 'Admin', date: 'Yesterday', time: '10:00' },
  { action: 'Scheduled', by: 'Marketing', date: '2 days ago', time: '11:20' },
  { action: 'Rejected', by: 'Admin', date: '3 days ago', time: '15:45' },
  { action: 'Approved', by: 'Admin', date: '4 days ago', time: '09:30' },
  { action: 'Submitted', by: 'Business', date: '5 days ago', time: '14:00' },
]

const CALENDAR_EVENTS = [
  { day: 'Mon 28 Jul', events: [{ title: 'Modern Café VCard publishes', type: 'publish' }] },
  { day: 'Tue 29 Jul', events: [{ title: 'Restaurant B expires', type: 'expiry' }] },
  { day: 'Wed 30 Jul', events: [{ title: 'Consumer Campaign starts', type: 'publish' }, { title: 'Boutique Hotel unpublishes', type: 'unpublish' }] },
  { day: 'Thu 31 Jul', events: [{ title: 'Global Retail VCard scheduled', type: 'schedule' }] },
  { day: 'Fri 1 Aug', events: [{ title: 'Luxury Hotels campaign goes live', type: 'publish' }] },
  { day: 'Sat 2 Aug', events: [] },
  { day: 'Sun 3 Aug', events: [] },
]

const TYPES = ['All', 'Business VCard', 'Consumer VCard']
const STATUSES = ['All', 'Draft', 'Ready For Review', 'Pending Review', 'Approved', 'Scheduled', 'Published', 'Suspended', 'Archived', 'Expired']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Ready For Review': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Pending Review': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Under Review': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Approved': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600',
    'Scheduled': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Suspended': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Expired': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Rejected': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Pending': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Not Submitted': 'bg-gray-50 dark:bg-gray-500/10 text-gray-400',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
        {options.map((o) => <option key={o} value={o.toLowerCase() === 'all' ? '' : o}>{o}</option>)}
      </select>
    </div>
  )
}

function ReviewWorkspace({ record, onClose }: { record: PublishRecord | null; onClose: () => void }) {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [reviewNote, setReviewNote] = useState('')
  if (!record) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Review — {record.name}</h2>
              <p className="text-[10px] text-gray-500">{record.type} · v{record.version} · {record.business}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {(['mobile', 'tablet', 'desktop'] as const).map((m) => (
                <button key={m} onClick={() => setPreviewMode(m)} className={`px-2.5 py-1 rounded text-[10px] font-medium ${previewMode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
            <button onClick={() => toast.success('VCard approved!')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">Approve</button>
            <button onClick={() => toast.success('VCard rejected. Sent back to draft.')} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Reject</button>
          </div>
        </div>
        <div className="flex h-[calc(100vh-57px)]">
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 flex items-start justify-center p-6">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-inner overflow-y-auto ${previewMode === 'mobile' ? 'w-[280px] h-[520px]' : previewMode === 'tablet' ? 'w-[400px] h-[520px]' : 'w-full max-w-3xl h-[520px]'}`}>
              <div className={`h-32 bg-gradient-to-br ${record.type === 'Business VCard' ? 'from-teal-400 to-teal-600' : 'from-purple-400 to-purple-700'} flex items-end p-4`}>
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-lg font-bold">{record.preview}</div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{record.name}</p>
                <p className="text-[10px] text-gray-500">{record.type} · v{record.version}</p>
                <div className="h-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">About Section</div>
                <div className="h-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Contact Section</div>
                <div className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Gallery Preview</div>
                <div className="flex gap-2">
                  <div className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[9px] text-white font-medium ${record.type === 'Business VCard' ? 'bg-teal-500' : 'bg-purple-500'}`}>Share</div>
                  <div className="flex-1 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-[9px] text-gray-600 font-medium">Exchange</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-72 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Validation</h3>
              <div className="space-y-1">
                {[
                  { label: 'Logo exists', pass: true }, { label: 'Banner exists', pass: true }, { label: 'Business Name', pass: true },
                  { label: 'Contact Details', pass: true }, { label: 'QR configured', pass: record.qrValid },
                  { label: 'Buttons working', pass: true }, { label: 'Sections enabled', pass: record.validationPassed },
                  { label: 'Images uploaded', pass: true }, { label: 'No broken URLs', pass: true },
                  { label: 'Required fields', pass: record.validationPassed },
                ].map((check) => (
                  <div key={check.label} className="flex items-center justify-between py-0.5">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">{check.label}</span>
                    {check.pass ? <span className="text-green-500 text-[10px]">✓</span> : <span className="text-red-500 text-[10px]">✗</span>}
                  </div>
                ))}
              </div>
              {!record.validationPassed && <p className="text-[9px] text-red-500 mt-1">Publishing blocked — validation failed.</p>}
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">QR Validation</h3>
              <div className="space-y-1">
                {[
                  { label: 'QR Exists', pass: record.qrValid }, { label: 'Destination Exists', pass: true },
                  { label: 'QR Active', pass: record.qrValid }, { label: 'Dynamic Rule Valid', pass: true },
                  { label: 'No Broken Redirect', pass: record.qrValid },
                ].map((check) => (
                  <div key={check.label} className="flex items-center justify-between py-0.5">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">{check.label}</span>
                    {check.pass ? <span className="text-green-500 text-[10px]">✓</span> : <span className="text-red-500 text-[10px]">✗</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Review Notes</h3>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={3} placeholder="Add review feedback..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
              <button onClick={() => toast.success('Review note saved')} className="mt-2 w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200">Save Note</button>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Publish Options</h3>
              <div className="space-y-1.5">
                <button onClick={() => toast.success('Published now!')} className="w-full px-2 py-1.5 rounded bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Publish Now</button>
                <button onClick={() => toast.success('Scheduling dialog opened')} className="w-full px-2 py-1.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-semibold hover:bg-indigo-100">Schedule Later</button>
                <button onClick={() => toast.success('Private preview link generated')} className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Private Preview</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ScheduleModal({ record, onClose }: { record: PublishRecord | null; onClose: () => void }) {
  if (!record) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Schedule Publishing</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-[10px] text-gray-500">Schedule publishing for <strong className="text-gray-900 dark:text-white">{record.name}</strong></p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Date</label><input type="date" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Time</label><input type="time" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
            </div>
            <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Timezone</label><select className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><option>UTC</option><option>GMT</option><option>EST</option><option>PST</option></select></div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Auto Unpublish</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Expiry Date</label><input type="date" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Expiry Time</label><input type="time" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
              </div>
              <label className="flex items-center gap-2 mt-2"><input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /><span className="text-[10px] text-gray-600 dark:text-gray-400">Archive automatically on expiry</span></label>
            </div>
            <button onClick={() => { toast.success('Publishing scheduled'); onClose() }} className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Schedule</button>
          </div>
        </div>
      </div>
    </>
  )
}

function RollbackModal({ record, onClose }: { record: PublishRecord | null; onClose: () => void }) {
  if (!record) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Version Rollback</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-2">
            <p className="text-[10px] text-gray-500 mb-2">Select a version to restore for <strong className="text-gray-900 dark:text-white">{record.name}</strong></p>
            {[10, 9, 8, 7, 6, 5].map((v) => (
              <div key={v} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div>
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">Version {v}</p>
                  <p className="text-[9px] text-gray-400">{v === record.version ? 'Current' : v > record.version ? 'Future' : 'Past'} · {['Admin', 'Designer', 'Admin', 'Admin', 'Business', 'Admin'][v - 1]} · {['28 Jul', '20 Jul', '10 Jul', '25 Jun', '1 Jun', '15 May'][v - 1]}</p>
                </div>
                <button onClick={() => toast.success(`Version ${v} restored`)} disabled={v === record.version} className={`px-2 py-1 rounded text-[10px] font-medium ${v === record.version ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100'}`}>{v === record.version ? 'Current' : 'Restore'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function VCardPublishingPage() {
  const [loading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [reviewRecord, setReviewRecord] = useState<PublishRecord | null>(null)
  const [scheduleRecord, setScheduleRecord] = useState<PublishRecord | null>(null)
  const [rollbackRecord, setRollbackRecord] = useState<PublishRecord | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [showPolicies, setShowPolicies] = useState(false)

  const filtered = RECORDS.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (membershipFilter && r.membership !== membershipFilter) return false
    if (activeTab === 'pending') { if (r.status !== 'Pending Review' && r.status !== 'Ready For Review') return false }
    if (activeTab === 'scheduled') { if (r.status !== 'Scheduled') return false }
    if (activeTab === 'recent') { if (r.status !== 'Published') return false }
    if (activeTab === 'archived') { if (r.status !== 'Archived') return false }
    if (search) {
      const q = search.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.business.toLowerCase().includes(q) && !r.owner.toLowerCase().includes(q) && !r.membership.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { if (allSelected) setSelectedIds([]); else setSelectedIds(filtered.map(r => r.id)) }
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Publishing - MCOM VCard</title></Helmet>
        <div className="h-7 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1,2,3,4,5,6,7].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Publishing - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unable to load Publishing Queue</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">There was a problem fetching publishing data.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setError(false)} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>VCard Publishing - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">VCard Publishing</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise publishing centre — review, approve, schedule, and manage the lifecycle of every VCard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowPolicies(!showPolicies)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Publishing Policies</button>
            <button onClick={() => toast.success('Export started')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard label="Total VCards" value={String(RECORDS.length)} sub={`${RECORDS.filter(r => r.type === 'Business VCard').length} Biz · ${RECORDS.filter(r => r.type === 'Consumer VCard').length} Con`} color="text-rose-600" />
        <KPICard label="Pending Review" value={String(RECORDS.filter(r => r.status === 'Pending Review' || r.status === 'Ready For Review').length)} sub={`${RECORDS.filter(r => r.status === 'Pending Review').length} in review · ${RECORDS.filter(r => r.status === 'Ready For Review').length} ready`} color="text-amber-600" />
        <KPICard label="Published" value={String(RECORDS.filter(r => r.status === 'Published').length)} sub="Currently live" color="text-green-600" />
        <KPICard label="Scheduled" value={String(RECORDS.filter(r => r.status === 'Scheduled').length)} sub="Publishing later" color="text-indigo-600" />
        <KPICard label="Archived" value={String(RECORDS.filter(r => r.status === 'Archived').length)} sub="No longer active" color="text-gray-500" />
        <KPICard label="Suspended" value={String(RECORDS.filter(r => r.status === 'Suspended').length)} sub="Temporarily disabled" color="text-red-600" />
        <KPICard label="Failed" value={String(RECORDS.filter(r => !r.validationPassed).length)} sub="Validation errors" color="text-rose-500" />
      </div>

      {showPolicies && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Publishing Policies</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[{ label: 'Require approval before publish', value: 'Yes' }, { label: 'Allow automatic publishing', value: 'No' }, { label: 'Allow businesses to publish', value: 'No' }, { label: 'Allow consumer publishing', value: 'No' }].map((p) => (
              <div key={p.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{p.label}</span>
                <span className={`text-[10px] font-semibold ${p.value === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700">
          {[
            { id: 'all', label: 'All VCards' }, { id: 'pending', label: 'Pending Review' },
            { id: 'scheduled', label: 'Scheduled' }, { id: 'recent', label: 'Recently Published' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap px-4 py-2.5 text-[10px] font-medium transition-all ${activeTab === tab.id ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-500 bg-rose-50/50 dark:bg-rose-500/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Business, Consumer, Member ID, Business ID, VCard ID, Email, Phone..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FilterSelect label="Type" value={typeFilter} options={TYPES} onChange={setTypeFilter} />
            <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
            <FilterSelect label="Membership" value={membershipFilter} options={MEMBERSHIPS} onChange={setMembershipFilter} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No VCards Waiting For Publishing</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Everything is currently up to date.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="w-8 px-3 py-2.5 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-rose-500 focus:ring-rose-500" /></th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Preview</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">VCard</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Owner</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Business</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Version</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Review</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Publish Date</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Expiry</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Updated By</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Updated</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2.5"><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleOne(r.id)} className="rounded border-gray-300 dark:border-gray-600 text-rose-500 focus:ring-rose-500" /></td>
                    <td className="px-3 py-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-[10px] ${r.type === 'Business VCard' ? 'from-teal-400 to-teal-600' : 'from-purple-400 to-purple-600'}`}>{r.preview}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setReviewRecord(r)} className="font-medium text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400">{r.name}</button>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium ${r.type === 'Business VCard' ? 'text-teal-600' : 'text-purple-600'}`}>{r.type === 'Business VCard' ? 'Biz' : 'Con'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.owner}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.business}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">v{r.version}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={r.reviewStatus} /></td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.publishDate || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.expiryDate || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.updatedBy}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{r.lastUpdated}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="relative group inline-block">
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="py-1">
                            <button onClick={() => setReviewRecord(r)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
                            <button onClick={() => { setReviewRecord(r); toast('Opening builder workspace') }} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Builder</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            {(r.status === 'Pending Review' || r.status === 'Ready For Review') && (
                              <>
                                <button onClick={() => { setReviewRecord(r) }} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Approve</button>
                                <button onClick={() => { setReviewRecord(r) }} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Reject</button>
                              </>
                            )}
                            {(r.status === 'Approved' || r.status === 'Draft') && (
                              <button onClick={() => toast.success(`${r.name} published!`)} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Publish</button>
                            )}
                            {r.status !== 'Scheduled' && (
                              <button onClick={() => setScheduleRecord(r)} className="w-full text-left px-3 py-1.5 text-[11px] text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700">Schedule</button>
                            )}
                            {r.status !== 'Archived' && (
                              <button onClick={() => toast.success(`${r.name} archived`)} className="w-full text-left px-3 py-1.5 text-[11px] text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
                            )}
                            {r.status === 'Suspended' && (
                              <button onClick={() => toast.success(`${r.name} restored`)} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Restore</button>
                            )}
                            <button onClick={() => toast.success(`${r.name} suspended`)} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Suspend</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button onClick={() => setRollbackRecord(r)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Version History</button>
                            <button onClick={() => toast.success('Analytics opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Analytics</button>
                            <button onClick={() => toast.error('Confirm deletion required')} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Delete</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">{filtered.length} of {RECORDS.length} records</span>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 mr-1">{selectedIds.length} selected</span>
                <button onClick={() => toast.success('Selected VCards published')} className="px-2 py-1 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100">Publish</button>
                <button onClick={() => toast.success('Scheduling dialog opened')} className="px-2 py-1 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100">Schedule</button>
                <button onClick={() => toast.success('Selected VCards archived')} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100">Archive</button>
                <button onClick={() => toast.success('Selected VCards suspended')} className="px-2 py-1 rounded text-[10px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100">Suspend</button>
                <button onClick={() => toast.success('Export started')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Export</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Publishing Calendar — This Week</h3>
          <div className="grid grid-cols-7 gap-1">
            {CALENDAR_EVENTS.map((day) => (
              <div key={day.day} className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 min-h-[60px]">
                <p className="text-[8px] font-medium text-gray-500 mb-1">{day.day.split(' ')[0]}<br />{day.day.split(' ')[1]} {day.day.split(' ')[2]}</p>
                {day.events.map((ev, i) => {
                  const colors: Record<string, string> = { publish: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400', expiry: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400', unpublish: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400', schedule: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' }
                  return <p key={i} className={`text-[7px] px-1 rounded ${colors[ev.type] || 'bg-gray-100'} mb-0.5 truncate`}>{ev.title}</p>
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Publishing History</h3>
          <div className="space-y-1">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-start gap-2 py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                  h.action === 'Published' ? 'bg-green-500' : h.action === 'Approved' ? 'bg-teal-500' : h.action === 'Rejected' || h.action === 'Archived' ? 'bg-red-500' : h.action === 'Scheduled' ? 'bg-indigo-500' : h.action === 'Restored' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 flex justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-gray-900 dark:text-white">{h.action}</span>
                    <span className="text-[9px] text-gray-400 ml-1">by {h.by}</span>
                  </div>
                  <span className="text-[9px] text-gray-400">{h.date} · {h.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReviewWorkspace record={reviewRecord} onClose={() => setReviewRecord(null)} />
      <ScheduleModal record={scheduleRecord} onClose={() => setScheduleRecord(null)} />
      <RollbackModal record={rollbackRecord} onClose={() => setRollbackRecord(null)} />
    </div>
  )
}
