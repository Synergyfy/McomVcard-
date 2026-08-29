import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

/* ── Types ─────────────────────────────────────────────── */

interface VersionRecord {
  id: string
  vcardName: string
  type: 'Business VCard' | 'Consumer VCard'
  business: string
  businessId: string
  consumer: string
  consumerId: string
  versionNumber: string
  createdBy: string
  createdDate: string
  status: 'Current' | 'Historical' | 'Published' | 'Archived' | 'Locked' | 'Restored'
  releaseType: 'Auto Save' | 'Manual Save' | 'Draft' | 'Review' | 'Published' | 'Hotfix' | 'Rollback' | 'Archived'
  notes: string
  tags: string[]
  locked: boolean
  snapshotSummary: { label: string; value: string }[]
  components: { name: string; version: string }[]
  qrConfig: string
  changes: { section: string; type: 'added' | 'removed' | 'modified'; detail: string }[]
}

interface ComparisonItem {
  section: string
  oldValue: string
  newValue: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
}

const VERSION_STATUSES = ['All', 'Current', 'Historical', 'Published', 'Archived', 'Locked', 'Restored']
const VCARD_TYPES = ['All', 'Business VCard', 'Consumer VCard']
const RELEASE_TYPES = ['All', 'Draft', 'Auto Save', 'Manual Save', 'Published', 'Rollback']
const DATE_RANGES = ['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom']
const AUTHORS = ['All', 'Admin', 'Designer', 'Business', 'Consumer', 'System']

/* ── Mock Data ─────────────────────────────────────────── */

const VERSIONS: VersionRecord[] = [
  { id: '1', vcardName: 'Modern Café VCard', type: 'Business VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: '—', consumerId: '—', versionNumber: 'v2.4', createdBy: 'Admin', createdDate: '28 Jul 2026 09:21', status: 'Current', releaseType: 'Published', notes: 'Final version for Summer Campaign. Banner updated, gallery refreshed with seasonal images.', tags: ['Stable', 'Campaign'], locked: true, snapshotSummary: [
    { label: 'Components', value: '14 active' }, { label: 'Images', value: '8' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Weekly refresh' }, { label: 'Theme', value: 'Restaurant v3' },
  ], components: [
    { name: 'Banner Component', version: 'v4' }, { name: 'Gallery Component', version: 'v2' }, { name: 'Share Component', version: 'v8' }, { name: 'Contact Component', version: 'v3' },
  ], qrConfig: 'Rule #1 — Joe\'s Coffee Dynamic VCard (Active, Weekly refresh)', changes: [
    { section: 'Banner', type: 'modified', detail: 'Updated from blue gradient to summer orange theme' },
    { section: 'Gallery', type: 'added', detail: 'Added 4 new seasonal images' },
    { section: 'Testimonials', type: 'modified', detail: 'Added 2 new customer reviews' },
  ]},
  { id: '2', vcardName: 'Modern Café VCard', type: 'Business VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: '—', consumerId: '—', versionNumber: 'v2.3', createdBy: 'Designer', createdDate: '25 Jul 2026 14:30', status: 'Historical', releaseType: 'Manual Save', notes: 'Pre-summer backup. Gallery reorganized.', tags: ['Pre-Campaign'], locked: false, snapshotSummary: [
    { label: 'Components', value: '13 active' }, { label: 'Images', value: '4' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Weekly refresh' }, { label: 'Theme', value: 'Restaurant v2' },
  ], components: [
    { name: 'Banner Component', version: 'v3' }, { name: 'Gallery Component', version: 'v1' }, { name: 'Share Component', version: 'v8' }, { name: 'Contact Component', version: 'v3' },
  ], qrConfig: 'Rule #1 — Joe\'s Coffee Dynamic VCard (Active, Weekly refresh)', changes: [
    { section: 'Gallery', type: 'modified', detail: 'Reordered images' },
  ]},
  { id: '3', vcardName: 'Modern Café VCard', type: 'Business VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: '—', consumerId: '—', versionNumber: 'v2.2', createdBy: 'System', createdDate: '22 Jul 2026 00:00', status: 'Historical', releaseType: 'Auto Save', notes: 'Auto-save triggered by component library update.', tags: ['Auto'], locked: false, snapshotSummary: [
    { label: 'Components', value: '13 active' }, { label: 'Images', value: '4' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Weekly refresh' }, { label: 'Theme', value: 'Restaurant v2' },
  ], components: [
    { name: 'Banner Component', version: 'v2' }, { name: 'Gallery Component', version: 'v1' }, { name: 'Share Component', version: 'v8' }, { name: 'Contact Component', version: 'v3' },
  ], qrConfig: 'Rule #1 — Joe\'s Coffee Dynamic VCard (Active, Weekly refresh)', changes: [
    { section: 'Banner Component', type: 'modified', detail: 'Updated from v2 to v3' },
  ]},
  { id: '4', vcardName: 'Modern Café VCard', type: 'Business VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: '—', consumerId: '—', versionNumber: 'v2.1', createdBy: 'Designer', createdDate: '20 Jul 2026 10:15', status: 'Restored', releaseType: 'Manual Save', notes: 'Manual checkpoint before QR rule change.', tags: ['Checkpoint'], locked: false, snapshotSummary: [
    { label: 'Components', value: '12 active' }, { label: 'Images', value: '4' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Daily refresh' }, { label: 'Theme', value: 'Restaurant v2' },
  ], components: [
    { name: 'Banner Component', version: 'v2' }, { name: 'Gallery Component', version: 'v1' }, { name: 'Share Component', version: 'v7' }, { name: 'Contact Component', version: 'v3' },
  ], qrConfig: 'Rule #1 — Joe\'s Coffee Dynamic VCard (Active, Daily refresh — prior config)', changes: []},
  { id: '5', vcardName: 'Modern Café VCard', type: 'Business VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: '—', consumerId: '—', versionNumber: 'v2.0', createdBy: 'Admin', createdDate: '15 Jul 2026 16:00', status: 'Published', releaseType: 'Published', notes: 'Major release — full redesign with new branding guidelines.', tags: ['Stable', 'Major Release'], locked: true, snapshotSummary: [
    { label: 'Components', value: '12 active' }, { label: 'Images', value: '4' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Daily refresh' }, { label: 'Theme', value: 'Restaurant v2' },
  ], components: [
    { name: 'Banner Component', version: 'v2' }, { name: 'Gallery Component', version: 'v1' }, { name: 'Share Component', version: 'v7' }, { name: 'Contact Component', version: 'v2' },
  ], qrConfig: 'Rule #1 — Joe\'s Coffee Dynamic VCard (Active, Daily refresh)', changes: []},
  { id: '6', vcardName: 'Sarah Johnson VCard', type: 'Consumer VCard', business: '—', businessId: '—', consumer: 'Sarah Johnson', consumerId: 'CON-042', versionNumber: 'v3.1', createdBy: 'Consumer', createdDate: '27 Jul 2026 19:45', status: 'Current', releaseType: 'Manual Save', notes: 'Updated profile photo and contact details.', tags: [], locked: false, snapshotSummary: [
    { label: 'Components', value: '10 active' }, { label: 'Images', value: '3' }, { label: 'Videos', value: '0' }, { label: 'Dynamic QR', value: 'Active — Gold tier' }, { label: 'Theme', value: 'Gold Elegance' },
  ], components: [
    { name: 'Profile Component', version: 'v5' }, { name: 'Contact Component', version: 'v3' }, { name: 'Share Component', version: 'v8' },
  ], qrConfig: 'Rule #2 — Gold Tier Rotating Offer (Active, Membership-based)', changes: [
    { section: 'Profile Photo', type: 'modified', detail: 'New profile photo uploaded' },
    { section: 'Contact Details', type: 'modified', detail: 'Phone number updated' },
  ]},
  { id: '7', vcardName: 'Sarah Johnson VCard', type: 'Consumer VCard', business: '—', businessId: '—', consumer: 'Sarah Johnson', consumerId: 'CON-042', versionNumber: 'v3.0', createdBy: 'Admin', createdDate: '20 Jul 2026 11:00', status: 'Published', releaseType: 'Published', notes: 'Gold tier upgrade — VCard updated with premium styling.', tags: ['Stable', 'Upgrade'], locked: true, snapshotSummary: [
    { label: 'Components', value: '10 active' }, { label: 'Images', value: '2' }, { label: 'Videos', value: '0' }, { label: 'Dynamic QR', value: 'Active — Silver tier' }, { label: 'Theme', value: 'Silver Classic' },
  ], components: [
    { name: 'Profile Component', version: 'v4' }, { name: 'Contact Component', version: 'v2' }, { name: 'Share Component', version: 'v7' },
  ], qrConfig: 'Rule #2 — Gold Tier Rotating Offer (Active, Membership-based)', changes: []},
  { id: '8', vcardName: 'TechCorp Ltd VCard', type: 'Business VCard', business: 'TechCorp Ltd', businessId: 'BIZ-031', consumer: '—', consumerId: '—', versionNumber: 'v1.2', createdBy: 'Designer', createdDate: '26 Jul 2026 08:30', status: 'Historical', releaseType: 'Draft', notes: 'WIP — new product showcase section being built. Not ready for review.', tags: ['WIP', 'Internal Review'], locked: false, snapshotSummary: [
    { label: 'Components', value: '9 active' }, { label: 'Images', value: '2' }, { label: 'Videos', value: '0' }, { label: 'Dynamic QR', value: 'Inactive' }, { label: 'Theme', value: 'Corporate v1' },
  ], components: [
    { name: 'Products Component', version: 'v3-beta' }, { name: 'Banner Component', version: 'v2' }, { name: 'Contact Component', version: 'v3' },
  ], qrConfig: 'No active rule', changes: [
    { section: 'Products', type: 'added', detail: 'New product showcase with 6 items' },
    { section: 'Services', type: 'modified', detail: 'Updated service descriptions' },
  ]},
  { id: '9', vcardName: 'TechCorp Ltd VCard', type: 'Business VCard', business: 'TechCorp Ltd', businessId: 'BIZ-031', consumer: '—', consumerId: '—', versionNumber: 'v1.1', createdBy: 'System', createdDate: '25 Jul 2026 00:00', status: 'Historical', releaseType: 'Auto Save', notes: 'Auto-save after component update.', tags: ['Auto'], locked: false, snapshotSummary: [
    { label: 'Components', value: '8 active' }, { label: 'Images', value: '2' }, { label: 'Videos', value: '0' }, { label: 'Dynamic QR', value: 'Inactive' }, { label: 'Theme', value: 'Corporate v1' },
  ], components: [
    { name: 'Banner Component', version: 'v2' }, { name: 'Contact Component', version: 'v3' },
  ], qrConfig: 'No active rule', changes: []},
  { id: '10', vcardName: 'TechCorp Ltd VCard', type: 'Business VCard', business: 'TechCorp Ltd', businessId: 'BIZ-031', consumer: '—', consumerId: '—', versionNumber: 'v1.0', createdBy: 'Admin', createdDate: '20 Jul 2026 14:00', status: 'Archived', releaseType: 'Published', notes: 'Initial release — corporate profile with basic sections.', tags: ['Stable'], locked: false, snapshotSummary: [
    { label: 'Components', value: '7 active' }, { label: 'Images', value: '1' }, { label: 'Videos', value: '0' }, { label: 'Dynamic QR', value: 'Inactive' }, { label: 'Theme', value: 'Corporate v1' },
  ], components: [
    { name: 'Banner Component', version: 'v1' }, { name: 'Contact Component', version: 'v2' },
  ], qrConfig: 'No active rule', changes: []},
  { id: '11', vcardName: 'Luxury Hotels Ltd VCard', type: 'Business VCard', business: 'Luxury Hotels Ltd', businessId: 'BIZ-003', consumer: '—', consumerId: '—', versionNumber: 'v1.8', createdBy: 'Admin', createdDate: '27 Jul 2026 10:00', status: 'Current', releaseType: 'Hotfix', notes: 'Emergency fix — booking widget was not loading on mobile devices.', tags: ['Emergency Fix'], locked: false, snapshotSummary: [
    { label: 'Components', value: '16 active' }, { label: 'Images', value: '12' }, { label: 'Videos', value: '2' }, { label: 'Dynamic QR', value: 'Active — Seasonal' }, { label: 'Theme', value: 'Luxury Hospitality v2' },
  ], components: [
    { name: 'Booking Component', version: 'v4-hotfix1' }, { name: 'Gallery Component', version: 'v3' }, { name: 'Banner Component', version: 'v4' },
  ], qrConfig: 'Rule #3 — Platinum Seasonal Redirect (Active, Membership-based)', changes: [
    { section: 'Booking Widget', type: 'modified', detail: 'Fixed mobile responsiveness issue' },
  ]},
  { id: '12', vcardName: 'Fitness Studio Pro VCard', type: 'Business VCard', business: 'Fitness Studio Pro', businessId: 'BIZ-007', consumer: '—', consumerId: '—', versionNumber: 'v1.5', createdBy: 'Designer', createdDate: '27 Jul 2026 15:30', status: 'Current', releaseType: 'Manual Save', notes: 'New class schedule added. Trainer profiles expanded.', tags: ['Update'], locked: false, snapshotSummary: [
    { label: 'Components', value: '11 active' }, { label: 'Images', value: '6' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Daily' }, { label: 'Theme', value: 'Fitness Pro v2' },
  ], components: [
    { name: 'Schedule Component', version: 'v2' }, { name: 'Team Component', version: 'v3' }, { name: 'Share Component', version: 'v8' },
  ], qrConfig: 'Rule #7 — Referral Share Card (Active, Membership-based)', changes: [
    { section: 'Class Schedule', type: 'modified', detail: 'Updated weekly class times' },
    { section: 'Trainer Profiles', type: 'added', detail: 'Added 2 new trainer profiles' },
  ]},
  { id: '13', vcardName: 'Boutique Hotel VCard', type: 'Business VCard', business: 'Boutique Hotel', businessId: 'BIZ-006', consumer: '—', consumerId: '—', versionNumber: 'v1.0', createdBy: 'Admin', createdDate: '20 Oct 2025 09:00', status: 'Archived', releaseType: 'Archived', notes: 'Business closed. VCard archived per retention policy.', tags: [], locked: false, snapshotSummary: [
    { label: 'Components', value: '10 active' }, { label: 'Images', value: '5' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Inactive' }, { label: 'Theme', value: 'Hospitality v1' },
  ], components: [
    { name: 'Booking Component', version: 'v2' }, { name: 'Gallery Component', version: 'v2' },
  ], qrConfig: 'Disabled', changes: []},
  { id: '14', vcardName: 'James Williams VCard', type: 'Consumer VCard', business: '—', businessId: '—', consumer: 'James Williams', consumerId: 'CON-089', versionNumber: 'v2.3', createdBy: 'Admin', createdDate: '25 Jul 2026 13:00', status: 'Current', releaseType: 'Manual Save', notes: 'Updated after Platinum tier upgrade. Exclusive content sections enabled.', tags: ['Upgrade'], locked: false, snapshotSummary: [
    { label: 'Components', value: '12 active' }, { label: 'Images', value: '4' }, { label: 'Videos', value: '1' }, { label: 'Dynamic QR', value: 'Active — Platinum' }, { label: 'Theme', value: 'Platinum Prestige' },
  ], components: [
    { name: 'Profile Component', version: 'v5' }, { name: 'Gallery Component', version: 'v3' }, { name: 'Share Component', version: 'v8' },
  ], qrConfig: 'Rule #3 — Platinum Seasonal Redirect (Active, Membership-based)', changes: [
    { section: 'Exclusive Content', type: 'added', detail: 'Platinum-only offers section enabled' },
    { section: 'Gallery', type: 'modified', detail: 'Added 2 premium images' },
  ]},
]

const totalVersions = VERSIONS.length
const bizVersions = VERSIONS.filter(v => v.type === 'Business VCard').length
const conVersions = VERSIONS.filter(v => v.type === 'Consumer VCard').length
const todayChanges = VERSIONS.filter(v => v.createdDate.startsWith('28 Jul 2026')).length
const manualCheckpoints = VERSIONS.filter(v => v.releaseType === 'Manual Save').length
const autoSaves = VERSIONS.filter(v => v.releaseType === 'Auto Save').length
const restoredToday = 1
const restoredWeek = 2
const failedRestorations = 0
const publishedVersions = VERSIONS.filter(v => ['Published', 'Current'].includes(v.status) && v.releaseType === 'Published').length
const taggedReleases = VERSIONS.filter(v => v.tags.length > 0 && !v.tags.includes('Auto')).length
const lockedReleases = VERSIONS.filter(v => v.locked).length
const draftVersions = VERSIONS.filter(v => v.releaseType === 'Draft').length
const pendingReview = VERSIONS.filter(v => v.releaseType === 'Review').length

/* ── Sub-Components ───────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Current': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Historical': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Published': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
    'Archived': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Locked': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Restored': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function ReleaseTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Auto Save': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Manual Save': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Draft': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Review': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Hotfix': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Rollback': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
    'Archived': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors[type] || 'bg-gray-50 text-gray-600'}`}>{type}</span>
}

function KpiCard({ label, value, sub, color, badge }: { label: string; value: string; sub: string; color: string; badge?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 font-medium">{badge}</span>}
      </div>
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

function SkeletonKpi() {
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"><div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" /><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" /><div className="h-2 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></div>
}

/* ── Comparison View ──────────────────────────────────── */

function ComparisonView({ versionA, versionB, onClose }: { versionA: VersionRecord | null; versionB: VersionRecord | null; onClose: () => void }) {
  if (!versionA || !versionB) return null

  const allSections = [...new Set([...versionA.changes, ...versionB.changes].map(c => c.section))]
  const comparisons: ComparisonItem[] = allSections.map(section => {
    const changeA = versionA.changes.find(c => c.section === section)
    const changeB = versionB.changes.find(c => c.section === section)
    if (changeA && !changeB) return { section, oldValue: changeA.detail, newValue: '—', type: 'removed' as const }
    if (!changeA && changeB) return { section, oldValue: '—', newValue: changeB.detail, type: 'added' as const }
    if (changeA && changeB && changeA.detail !== changeB.detail) return { section, oldValue: changeA.detail, newValue: changeB.detail, type: 'modified' as const }
    return { section, oldValue: changeA?.detail || '—', newValue: changeB?.detail || '—', type: 'unchanged' as const }
  })

  const diffCount = comparisons.filter(c => c.type !== 'unchanged').length

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comparing {versionA.versionNumber} with {versionB.versionNumber}</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 text-center flex-1 mr-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{versionA.versionNumber}</p>
                <p className="text-[9px] text-gray-500">{versionA.createdDate} · {versionA.createdBy}</p>
                <StatusBadge status={versionA.status} />
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 text-center flex-1 ml-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{versionB.versionNumber}</p>
                <p className="text-[9px] text-gray-500">{versionB.createdDate} · {versionB.createdBy}</p>
                <StatusBadge status={versionB.status} />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-gray-500">Snapshot Comparison</span>
              <span className="text-[10px] text-gray-500">{diffCount} difference{diffCount !== 1 ? 's' : ''} found</span>
            </div>

            {/* Snapshot side-by-side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                {versionA.snapshotSummary.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="text-[9px] text-gray-500">{s.label}</span><span className="text-[9px] font-medium text-gray-700 dark:text-gray-300">{s.value}</span></div>
                ))}
              </div>
              <div className="space-y-1.5">
                {versionB.snapshotSummary.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="text-[9px] text-gray-500">{s.label}</span><span className="text-[9px] font-medium text-gray-700 dark:text-gray-300">{s.value}</span></div>
                ))}
              </div>
            </div>

            {/* Content Comparison */}
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Content Comparison</h4>
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-2 py-1 text-[9px] text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
                  <span>{versionA.versionNumber}</span>
                  <span className="w-16 text-center">Change</span>
                  <span>{versionB.versionNumber}</span>
                </div>
                {comparisons.map((c, i) => (
                  <div key={i} className={`grid grid-cols-[1fr_auto_1fr] gap-2 px-2 py-2 rounded-lg text-[10px] ${c.type === 'added' ? 'bg-green-50 dark:bg-green-500/5' : c.type === 'removed' ? 'bg-red-50 dark:bg-red-500/5' : c.type === 'modified' ? 'bg-amber-50 dark:bg-amber-500/5' : ''}`}>
                    <span className={`text-gray-700 dark:text-gray-300 ${c.type === 'removed' ? 'line-through text-red-500' : ''}`}>{c.oldValue}</span>
                    <div className="flex items-center justify-center w-16">
                      {c.type === 'added' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-600 font-medium">Added</span>}
                      {c.type === 'removed' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-600 font-medium">Removed</span>}
                      {c.type === 'modified' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-600 font-medium">Modified</span>}
                      {c.type === 'unchanged' && <span className="text-[9px] text-gray-400">—</span>}
                    </div>
                    <span className={`text-gray-700 dark:text-gray-300 ${c.type === 'added' ? 'font-medium text-green-600' : ''}`}>{c.newValue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Comparison */}
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Layout Comparison</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] text-gray-500 mb-1.5">Components in {versionA.versionNumber}:</p>
                  <div className="space-y-1">
                    {versionA.components.map((c, i) => (
                      <div key={i} className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-700/30 rounded text-[9px]">
                        <span className="text-gray-700 dark:text-gray-300">{c.name}</span>
                        <span className="text-gray-400 font-mono">{c.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 mb-1.5">Components in {versionB.versionNumber}:</p>
                  <div className="space-y-1">
                    {versionB.components.map((c, i) => {
                      const oldComp = versionA.components.find(oc => oc.name === c.name)
                      const changed = oldComp && oldComp.version !== c.version
                      return (
                        <div key={i} className={`flex items-center justify-between px-2 py-1 rounded text-[9px] ${changed ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                          <span className="text-gray-700 dark:text-gray-300">{c.name}</span>
                          <span className={`font-mono ${changed ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>{c.version} {changed ? `(was ${oldComp?.version})` : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-[9px] text-gray-500 mb-0.5">Dynamic QR ({versionA.versionNumber})</p>
                <p className="text-[9px] text-gray-700 dark:text-gray-300">{versionA.qrConfig}</p>
              </div>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-[9px] text-gray-500 mb-0.5">Dynamic QR ({versionB.versionNumber})</p>
                <p className="text-[9px] text-gray-700 dark:text-gray-300">{versionB.qrConfig}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Version Details Workspace ─────────────────────────── */

function VersionWorkspace({ version, versions, onClose }: { version: VersionRecord; versions: VersionRecord[]; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'changes' | 'components' | 'qr'>('overview')
  const [compareTo, setCompareTo] = useState<string | ''>('')
  const [showComparison, setShowComparison] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [restoreReason, setRestoreReason] = useState('')

  const otherVersions = versions.filter(v => v.id !== version.id && v.vcardName === version.vcardName)
  const compareVersion = compareTo ? versions.find(v => v.id === compareTo) || null : null

  const handleRestore = () => {
    if (!restoreReason.trim()) { toast.error('Please provide a reason for the restore'); return }
    toast.success(`Version ${version.versionNumber} restored. Current version preserved as snapshot.`)
    setShowRestore(false)
    setRestoreReason('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {showComparison && compareVersion && <ComparisonView versionA={compareVersion} versionB={version} onClose={() => setShowComparison(false)} />}

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{version.vcardName}</h3>
              <ReleaseTypeBadge type={version.releaseType} />
              <StatusBadge status={version.status} />
              {version.locked && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 font-medium flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Locked</span>}
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">{version.versionNumber} · {version.createdDate} · by {version.createdBy}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <select value={compareTo} onChange={(e) => setCompareTo(e.target.value ? e.target.value : '')} className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <option value="">Compare with...</option>
              {otherVersions.map(v => <option key={v.id} value={v.id}>{v.versionNumber} ({v.createdDate})</option>)}
            </select>
            <button onClick={() => { if (compareTo) setShowComparison(true); else toast.error('Select a version to compare') }} className="px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100">Compare</button>
          </div>
          {!version.locked && (
            <button onClick={() => setShowRestore(true)} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Restore
            </button>
          )}
        </div>
      </div>

      {/* Restore Dialog */}
      {showRestore && (
        <div className="mx-5 mt-4 p-4 rounded-xl border-2 border-orange-300 bg-orange-50 dark:bg-orange-500/5 dark:border-orange-500/30">
          <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2">Restore Version {version.versionNumber}?</h4>
          <p className="text-[10px] text-orange-600 dark:text-orange-300 mb-3">The current version will be preserved as a new snapshot before restoration. Nothing will be lost.</p>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium text-orange-700 dark:text-orange-400 block mb-1">Reason for restore</label>
              <input type="text" value={restoreReason} onChange={(e) => setRestoreReason(e.target.value)} placeholder="e.g. Accidental publish, client requested rollback" className="w-full border border-orange-300 dark:border-orange-500/50 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRestore} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">Confirm Restore</button>
              <button onClick={() => setShowRestore(false)} className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700 px-5">
        {([{ key: 'overview', label: 'Overview' }, { key: 'changes', label: 'Changes' }, { key: 'components', label: 'Components' }, { key: 'qr', label: 'QR Config' }] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-[10px] font-medium transition-colors border-b-2 ${tab === t.key ? 'text-orange-600 border-orange-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">General Information</h4>
              {[
                { label: 'Version Number', value: version.versionNumber },
                { label: 'Version ID', value: `#VER-${String(version.id).padStart(4, '0')}` },
                { label: 'Created By', value: version.createdBy },
                { label: 'Created Date', value: version.createdDate },
                { label: 'Save Type', value: version.releaseType },
                { label: 'Published Status', value: version.status },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between"><span className="text-[10px] text-gray-500">{f.label}</span><span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">{f.value}</span></div>
              ))}
              <div>
                <span className="text-[10px] text-gray-500 block mb-1">Notes</span>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2">{version.notes}</p>
              </div>
              {version.tags.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {version.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">{t}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Snapshot Summary</h4>
              <div className="grid grid-cols-2 gap-2">
                {version.snapshotSummary.map((s, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><p className="text-[9px] text-gray-500">{s.label}</p><p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">{s.value}</p></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'changes' && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Changes in this version</h4>
            {version.changes.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic">No specific changes recorded for this version.</p>
            ) : (
              <div className="space-y-1">
                {version.changes.map((c, i) => (
                  <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg text-[10px] ${c.type === 'added' ? 'bg-green-50 dark:bg-green-500/5' : c.type === 'removed' ? 'bg-red-50 dark:bg-red-500/5' : 'bg-amber-50 dark:bg-amber-500/5'}`}>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${c.type === 'added' ? 'bg-green-100 dark:bg-green-500/20 text-green-600' : c.type === 'removed' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'}`}>{c.type}</span>
                    <div><span className="font-medium text-gray-700 dark:text-gray-300">{c.section}</span><p className="text-gray-500 mt-0.5">{c.detail}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'components' && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Component Versions in this Snapshot</h4>
            <div className="space-y-1 max-w-md">
              {version.components.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <span className="text-[10px] text-gray-700 dark:text-gray-300">{c.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">{c.version}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-3">If a component is later updated, Admin can check which VCards depend on the previous version.</p>
          </div>
        )}

        {tab === 'qr' && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Dynamic QR Snapshot</h4>
            <div className="max-w-lg bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              {version.qrConfig === 'Disabled' || version.qrConfig === 'No active rule' ? (
                <div className="flex items-center gap-2 text-[10px] text-gray-500"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>{version.qrConfig}</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px]"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-gray-700 dark:text-gray-300">{version.qrConfig}</span></div>
                </div>
              )}
            </div>
            <p className="text-[9px] text-gray-400 mt-2">This version stores the complete QR configuration, including active rule, scheduled changes, and default destination.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────── */

export default function VCardVersionHistoryPage() {
  const [search, setSearch] = useState('')
  const [vcardTypeFilter, setVcardTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [releaseTypeFilter, setReleaseTypeFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [workspaceVersion, setWorkspaceVersion] = useState<VersionRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = VERSIONS.filter(v => {
    if (search) {
      const q = search.toLowerCase()
      if (!v.vcardName.toLowerCase().includes(q) && !v.business.toLowerCase().includes(q) && !v.consumer.toLowerCase().includes(q) && !v.versionNumber.toLowerCase().includes(q) && !v.createdBy.toLowerCase().includes(q)) return false
    }
    if (vcardTypeFilter && v.type !== vcardTypeFilter) return false
    if (statusFilter && v.status !== statusFilter) return false
    if (releaseTypeFilter && v.releaseType !== releaseTypeFilter) return false
    if (authorFilter && v.createdBy !== authorFilter) return false
    return true
  })

  const toggleId = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(v => v.id))

  const bulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('Select versions first'); return }
    if (action === 'tag') toast.success(`${selectedIds.length} version(s) tagged`)
    else if (action === 'lock') toast.success(`${selectedIds.length} version(s) locked`)
    else if (action === 'unlock') toast.success(`${selectedIds.length} version(s) unlocked`)
    else if (action === 'export') toast.success(`Exporting ${selectedIds.length} version(s)`)
    else if (action === 'archive') toast.success(`${selectedIds.length} draft version(s) archived`)
    setSelectedIds([])
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Version History - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></div>
        <div className="grid grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonKpi key={i} />)}</div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
        </div>
      </div>
    )
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unable to load Version History</p>
          <p className="text-[10px] text-gray-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">Retry</button>
            <button className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Empty State ── */
  if (VERSIONS.length === 0) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Version History - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">VCard Version History</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Version History Available</p>
          <p className="text-[10px] text-gray-500 mb-5">Version history will appear automatically as VCards are created and updated.</p>
          <Link to="/admin/vcard-management/business-vcard-templates" className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create First VCard
          </Link>
        </div>
      </div>
    )
  }

  /* ── Workspace View ── */
  if (workspaceVersion) {
    return (
      <div className="space-y-6">
        <Helmet><title>{workspaceVersion.vcardName} - VCard Version History - MCOM VCard</title></Helmet>
        <div className="flex items-center gap-2">
          <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <Link to="/admin/vcard-management/version-history" className="text-[10px] text-orange-600 hover:underline">Version History</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">{workspaceVersion.versionNumber} — {workspaceVersion.vcardName}</h1>
        </div>
        <VersionWorkspace version={workspaceVersion} versions={VERSIONS} onClose={() => setWorkspaceVersion(null)} />
      </div>
    )
  }

  /* ── List View ── */
  return (
    <div className="space-y-6">
      <Helmet><title>VCard Version History - VCard Management - MCOM VCard</title></Helmet>

      {/* Breadcrumb + Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">VCard Version History</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise version control for every Business VCard and Consumer VCard. Every save creates a snapshot — compare, restore, and audit with confidence.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toast.success('Export started')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export All
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Versions" value={String(totalVersions)} sub={`${bizVersions} Business · ${conVersions} Consumer`} color="text-gray-900 dark:text-white" />
        <KpiCard label="Today's Changes" value={String(todayChanges)} sub={`${manualCheckpoints} checkpoints · ${autoSaves} auto-saves`} color="text-blue-600" badge={`${todayChanges} new`} />
        <KpiCard label="Restorations" value={String(restoredToday)} sub={`${restoredWeek} this week · ${failedRestorations} failed`} color="text-purple-600" />
        <KpiCard label="Major Releases" value={String(publishedVersions)} sub={`${taggedReleases} tagged · ${lockedReleases} locked`} color="text-green-600" />
        <KpiCard label="Draft Versions" value={String(draftVersions)} sub={`${pendingReview} pending review`} color="text-amber-600" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search business, consumer, version number, VCard ID, author..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="w-28"><FilterSelect label="VCard Type" value={vcardTypeFilter} options={VCARD_TYPES} onChange={setVcardTypeFilter} /></div>
            <div className="w-28"><FilterSelect label="Status" value={statusFilter} options={VERSION_STATUSES} onChange={setStatusFilter} /></div>
            <div className="w-28"><FilterSelect label="Release Type" value={releaseTypeFilter} options={RELEASE_TYPES} onChange={setReleaseTypeFilter} /></div>
            <div className="w-24"><FilterSelect label="Author" value={authorFilter} options={AUTHORS} onChange={setAuthorFilter} /></div>
            <div className="w-28"><FilterSelect label="Date" value={dateFilter} options={DATE_RANGES} onChange={setDateFilter} /></div>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] text-gray-500">{selectedIds.length} selected</span>
            <button onClick={() => bulkAction('tag')} className="px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100">Tag</button>
            <button onClick={() => bulkAction('lock')} className="px-2 py-1 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded-lg hover:bg-amber-100">Lock</button>
            <button onClick={() => bulkAction('unlock')} className="px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-50 dark:bg-gray-500/10 rounded-lg hover:bg-gray-100">Unlock</button>
            <button onClick={() => bulkAction('export')} className="px-2 py-1 text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100">Export</button>
            <button onClick={() => bulkAction('archive')} className="px-2 py-1 text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100">Archive Drafts</button>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
            <p className="text-sm font-medium text-gray-500 mb-1">No versions match your filters</p>
            <p className="text-[10px] text-gray-400 mb-4">Try adjusting the search term or filter selection</p>
            <button onClick={() => { setSearch(''); setVcardTypeFilter(''); setStatusFilter(''); setReleaseTypeFilter(''); setAuthorFilter(''); setDateFilter('') }} className="px-4 py-2 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">Clear All Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-2 py-1.5 font-medium w-8"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-gray-300" /></th>
                  <th className="text-left px-2 py-1.5 font-medium">Version ID</th>
                  <th className="text-left px-2 py-1.5 font-medium">VCard Name</th>
                  <th className="text-left px-2 py-1.5 font-medium">Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">Business / Consumer</th>
                  <th className="text-left px-2 py-1.5 font-medium">Version</th>
                  <th className="text-left px-2 py-1.5 font-medium">Created By</th>
                  <th className="text-left px-2 py-1.5 font-medium">Created Date</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-left px-2 py-1.5 font-medium">Release Type</th>
                  <th className="text-left px-2 py-1.5 font-medium w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer" onClick={() => setWorkspaceVersion(v)}>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => toggleId(v.id)} className="rounded border-gray-300" /></td>
                    <td className="px-2 py-2 font-mono text-[9px] text-gray-500">VER-{String(v.id).padStart(4, '0')}</td>
                    <td className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{v.vcardName}</td>
                    <td className="px-2 py-2"><span className={`text-[9px] font-medium ${v.type === 'Business VCard' ? 'text-blue-600' : 'text-green-600'}`}>{v.type === 'Business VCard' ? 'Biz' : 'Con'}</span></td>
                    <td className="px-2 py-2">
                      {v.business !== '—' ? <div><p className="text-gray-700 dark:text-gray-300 text-[10px]">{v.business}</p><p className="text-[9px] text-gray-400">{v.businessId}</p></div> : <div><p className="text-gray-700 dark:text-gray-300 text-[10px]">{v.consumer}</p><p className="text-[9px] text-gray-400">{v.consumerId}</p></div>}
                    </td>
                    <td className="px-2 py-2"><span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{v.versionNumber}</span></td>
                    <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{v.createdBy}</td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap text-[9px]">{v.createdDate}</td>
                    <td className="px-2 py-2"><StatusBadge status={v.status} /></td>
                    <td className="px-2 py-2"><ReleaseTypeBadge type={v.releaseType} /></td>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setWorkspaceVersion(v)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500" title="View"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                        <button onClick={() => { navigator.clipboard?.writeText(`VER-${String(v.id).padStart(4, '0')}`); toast.success('Version ID copied') }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500" title="Copy ID"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                        {!v.locked && <button onClick={() => { toast.success(`Version ${v.versionNumber} restored. Current version preserved.`) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-500" title="Restore"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-3 px-1">
              <span className="text-[10px] text-gray-400">{filtered.length} of {VERSIONS.length} versions</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30" disabled><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="text-[10px] text-gray-500 px-2">Page 1 of 1</span>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30" disabled><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
