import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

/* ── Types ─────────────────────────────────────────────── */

interface ActivityEvent {
  id: string
  time: string
  activityType: string
  vcardType: 'Business VCard' | 'Consumer VCard'
  business: string
  businessId: string
  consumer: string
  consumerId: string
  performedBy: string
  source: string
  status: 'Success' | 'Pending' | 'Failed' | 'Cancelled' | 'Scheduled' | 'Processing'
  referenceId: string
  details: string
  ipAddress: string
  device: string
  browser: string
  relatedRecords: { label: string; to: string }[]
  timeline: { time: string; event: string }[]
}

interface KPIGroup {
  label: string
  value: string
  sub: string
  color: string
  badge?: string
}

const ACTIVITY_CATEGORIES = [
  'All', 'Publishing', 'QR', 'Sharing', 'Exchange', 'Redeem',
  'Membership', 'Templates', 'Components', 'Validation', 'Security', 'System',
]

const VCARD_TYPES = ['All', 'Business VCard', 'Consumer VCard']
const USER_TYPES = ['All', 'Admin', 'Business', 'Consumer', 'System']
const STATUSES = ['All', 'Success', 'Failed', 'Pending', 'Cancelled']
const DATE_RANGES = ['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']

/* ── Mock Data ─────────────────────────────────────────── */

const ACTIVITIES: ActivityEvent[] = [
  { id: '1', time: '2 mins ago', activityType: 'QR Scanned', vcardType: 'Business VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: '—', consumerId: '—', performedBy: 'System', source: 'Dynamic QR Engine', status: 'Success', referenceId: 'QR-20260730-0042', details: 'QR code on table 12 scanned. Resolved to Summer Menu campaign.', ipAddress: '192.168.1.42', device: 'Mobile (iPhone 15)', browser: 'Safari 18', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'QR Rule', to: '/admin/vcard-management/dynamic-qr' }], timeline: [
    { time: '09:23:00', event: 'QR scanned from iPhone 15' }, { time: '09:23:01', event: 'Rule #1 matched — Joe\'s Coffee Dynamic VCard' }, { time: '09:23:02', event: 'Destination resolved: Summer Menu Campaign' }, { time: '09:23:03', event: 'Redirect successful' },
  ]},
  { id: '2', time: '5 mins ago', activityType: 'Published', vcardType: 'Business VCard', business: 'TechCorp Ltd', businessId: 'BIZ-031', consumer: '—', consumerId: '—', performedBy: 'Admin', source: 'Publishing Engine', status: 'Success', referenceId: 'PUB-20260730-0018', details: 'v3.1 published after approval. Scheduled changes activated.', ipAddress: '10.0.0.15', device: 'Desktop (MacBook Pro)', browser: 'Chrome 126', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'Publishing Record', to: '/admin/vcard-management/publishing' }], timeline: [
    { time: '09:18:00', event: 'Draft submitted for review' }, { time: '09:19:00', event: 'Validation passed' }, { time: '09:20:00', event: 'Approved by Admin' }, { time: '09:21:00', event: 'Published to production' },
  ]},
  { id: '3', time: '12 mins ago', activityType: 'Shared', vcardType: 'Consumer VCard', business: '—', businessId: '—', consumer: 'Sarah Johnson', consumerId: 'CON-042', performedBy: 'Consumer', source: 'Consumer Dashboard', status: 'Success', referenceId: 'SHR-20260730-0096', details: 'VCard shared via WhatsApp to 3 contacts.', ipAddress: '192.168.1.88', device: 'Mobile (Samsung Galaxy S25)', browser: 'Samsung Internet', relatedRecords: [{ label: 'Consumer VCard', to: '/admin/vcard-management/consumer-vcards' }], timeline: [
    { time: '09:10:00', event: 'Share initiated from Consumer Dashboard' }, { time: '09:10:02', event: 'WhatsApp platform selected' }, { time: '09:10:05', event: 'Shared with 3 recipients' }, { time: '09:10:06', event: 'Delivery confirmed' },
  ]},
  { id: '4', time: '18 mins ago', activityType: 'Exchange Completed', vcardType: 'Consumer VCard', business: '—', businessId: '—', consumer: 'James Williams', consumerId: 'CON-089', performedBy: 'Consumer', source: 'Consumer Dashboard', status: 'Success', referenceId: 'EXC-20260730-0033', details: 'Digital card exchange completed between James Williams and Mike Chen.', ipAddress: '192.168.1.55', device: 'Mobile (Pixel 9)', browser: 'Chrome 126', relatedRecords: [{ label: 'Consumer VCard', to: '/admin/vcard-management/consumer-vcards' }, { label: 'Consumer Profile', to: '/admin/consumers' }], timeline: [
    { time: '09:04:00', event: 'Exchange request sent to Mike Chen' }, { time: '09:05:00', event: 'Exchange accepted' }, { time: '09:05:30', event: 'Contact details exchanged' }, { time: '09:06:00', event: 'Exchange completed' },
  ]},
  { id: '5', time: '25 mins ago', activityType: 'Redeem Completed', vcardType: 'Consumer VCard', business: 'Modern Café', businessId: 'BIZ-001', consumer: 'Maria Garcia', consumerId: 'CON-201', performedBy: 'Consumer', source: 'Consumer Dashboard', status: 'Success', referenceId: 'RDM-20260730-0012', details: 'Gold member redeemed "Free Coffee" reward. Discount applied.', ipAddress: '192.168.1.72', device: 'Mobile (iPhone 14)', browser: 'Safari 18', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'Consumer Profile', to: '/admin/consumers' }], timeline: [
    { time: '08:57:00', event: 'Reward selected: Free Coffee' }, { time: '08:57:30', event: 'Redemption initiated' }, { time: '08:58:00', event: 'Redemption approved' }, { time: '08:58:30', event: 'Redemption completed — QR validated at POS' },
  ]},
  { id: '6', time: '32 mins ago', activityType: 'Rule Failed', vcardType: 'Business VCard', business: 'Beachside Grill', businessId: 'BIZ-015', consumer: '—', consumerId: '—', performedBy: 'System', source: 'Dynamic QR Engine', status: 'Failed', referenceId: 'ERR-20260730-0008', details: 'QR rule #4 — Summer Menu Campaign destination URL returned 404. Fallback applied.', ipAddress: '—', device: '—', browser: '—', relatedRecords: [{ label: 'QR Rule', to: '/admin/vcard-management/dynamic-qr' }, { label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }], timeline: [
    { time: '08:50:00', event: 'QR scan triggered rule #4' }, { time: '08:50:01', event: 'Destination URL resolved: /menu/beachside/summer-week4' }, { time: '08:50:02', event: 'HTTP 404 returned' }, { time: '08:50:03', event: 'Fallback destination applied' },
  ]},
  { id: '7', time: '1 hour ago', activityType: 'Created', vcardType: 'Business VCard', business: 'GreenLeaf Coffee', businessId: 'BIZ-042', consumer: '—', consumerId: '—', performedBy: 'Admin', source: 'Admin', status: 'Success', referenceId: 'VC-20260730-0004', details: 'Business VCard created using "Standard Business VCard" template v2.4 with custom branding.', ipAddress: '10.0.0.15', device: 'Desktop (MacBook Pro)', browser: 'Chrome 126', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'Business Profile', to: '/admin/businesses' }], timeline: [
    { time: '08:22:00', event: 'Admin opened template selector' }, { time: '08:24:00', event: 'Template "Standard Business VCard" selected' }, { time: '08:27:00', event: 'Branding customizations applied' }, { time: '08:30:00', event: 'VCard created and saved as Draft' },
  ]},
  { id: '8', time: '1 hour ago', activityType: 'Membership Updated', vcardType: 'Consumer VCard', business: '—', businessId: '—', consumer: 'David Kim', consumerId: 'CON-178', performedBy: 'System', source: 'System', status: 'Success', referenceId: 'MEM-20260730-0006', details: 'Membership upgraded from Silver Pro to Gold Pro. VCard content updated to reflect new tier.', ipAddress: '—', device: '—', browser: '—', relatedRecords: [{ label: 'Consumer VCard', to: '/admin/vcard-management/consumer-vcards' }, { label: 'Consumer Profile', to: '/admin/consumers' }, { label: 'Membership Plans', to: '/admin/plans' }], timeline: [
    { time: '08:15:00', event: 'Membership change triggered' }, { time: '08:15:01', event: 'Silver Pro → Gold Pro upgrade applied' }, { time: '08:15:05', event: 'VCard sections updated for Gold tier' }, { time: '08:15:10', event: 'QR rule re-evaluated for new membership' },
  ]},
  { id: '9', time: '2 hours ago', activityType: 'Template Changed', vcardType: 'Business VCard', business: 'Luxury Hotels Ltd', businessId: 'BIZ-003', consumer: '—', consumerId: '—', performedBy: 'Designer', source: 'Business Dashboard', status: 'Success', referenceId: 'TMP-20260730-0015', details: 'Template switched from "Corporate Elegance" to "Luxury Hospitality" v1.2.', ipAddress: '10.0.0.32', device: 'Desktop (Windows PC)', browser: 'Edge 125', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'VCard Templates', to: '/admin/vcard-management/business-vcard-templates' }], timeline: [
    { time: '07:45:00', event: 'Designer opened template library' }, { time: '07:47:00', event: 'Template previewed: Luxury Hospitality v1.2' }, { time: '07:50:00', event: 'Template applied to VCard' }, { time: '07:52:00', event: 'VCard content re-mapped to new template' },
  ]},
  { id: '10', time: '2 hours ago', activityType: 'Validation Failed', vcardType: 'Business VCard', business: 'Real Estate Partners', businessId: 'BIZ-010', consumer: '—', consumerId: '—', performedBy: 'System', source: 'Publishing Engine', status: 'Failed', referenceId: 'VAL-20260730-0003', details: 'Publishing validation failed: required section "Contact Details" is empty. Business logo missing.', ipAddress: '—', device: '—', browser: '—', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'Publishing Record', to: '/admin/vcard-management/publishing' }], timeline: [
    { time: '07:30:00', event: 'Publish attempt for v0.9' }, { time: '07:30:01', event: 'Validation check #1: Required sections — FAILED' }, { time: '07:30:02', event: 'Validation check #2: Business logo — FAILED' }, { time: '07:30:03', event: 'Publishing blocked. Errors reported back to Admin.' },
  ]},
  { id: '11', time: '3 hours ago', activityType: 'Version Restored', vcardType: 'Consumer VCard', business: '—', businessId: '—', consumer: 'Emily Roberts', consumerId: 'CON-055', performedBy: 'Admin', source: 'Admin', status: 'Success', referenceId: 'VER-20260730-0002', details: 'VCard restored from v1.2 (snapshot from 15 Jul 2026). 3 edits undone.', ipAddress: '10.0.0.15', device: 'Desktop (MacBook Pro)', browser: 'Chrome 126', relatedRecords: [{ label: 'Consumer VCard', to: '/admin/vcard-management/consumer-vcards' }, { label: 'Version History', to: '/admin/vcard-management/version-history' }], timeline: [
    { time: '06:45:00', event: 'Admin navigated to Version History' }, { time: '06:46:00', event: 'Version v1.2 selected for comparison' }, { time: '06:48:00', event: '3 changes detected since v1.2' }, { time: '06:50:00', event: 'Restore confirmed. VCard reverted to v1.2.' },
  ]},
  { id: '12', time: '3 hours ago', activityType: 'Deleted', vcardType: 'Business VCard', business: 'Event Planner Pro', businessId: 'BIZ-050', consumer: '—', consumerId: '—', performedBy: 'Admin', source: 'Admin', status: 'Success', referenceId: 'DEL-20260730-0001', details: 'Permanently deleted. VCard had been archived for 90 days. 1 QR rule deactivated.', ipAddress: '10.0.0.15', device: 'Desktop (MacBook Pro)', browser: 'Chrome 126', relatedRecords: [], timeline: [
    { time: '06:30:00', event: 'Admin selected "Permanently Delete"' }, { time: '06:30:05', event: 'Confirmation dialog acknowledged' }, { time: '06:30:10', event: 'VCard removed from database' }, { time: '06:30:12', event: 'Linked QR rule deactivated' },
  ]},
  { id: '13', time: '4 hours ago', activityType: 'Component Updated', vcardType: 'Consumer VCard', business: '—', businessId: '—', consumer: 'Alex Turner', consumerId: 'CON-112', performedBy: 'Consumer', source: 'Consumer Dashboard', status: 'Success', referenceId: 'CMP-20260730-0009', details: '"Profile Photo" component updated. New image uploaded.', ipAddress: '192.168.1.34', device: 'Mobile (OnePlus 12)', browser: 'Chrome 126', relatedRecords: [{ label: 'Consumer VCard', to: '/admin/vcard-management/consumer-vcards' }, { label: 'Components Library', to: '/admin/vcard-management/components-library' }], timeline: [
    { time: '05:40:00', event: 'Consumer opened VCard editor' }, { time: '05:41:00', event: 'Profile Photo component selected' }, { time: '05:42:00', event: 'New image uploaded and cropped' }, { time: '05:43:00', event: 'Component saved' },
  ]},
  { id: '14', time: '5 hours ago', activityType: 'Unpublished', vcardType: 'Business VCard', business: 'ABC Restaurant', businessId: 'BIZ-008', consumer: '—', consumerId: '—', performedBy: 'Admin', source: 'Admin', status: 'Success', referenceId: 'PUB-20260729-0099', details: 'VCard unpublished due to membership suspension. Fallback QR destination activated.', ipAddress: '10.0.0.15', device: 'Desktop (MacBook Pro)', browser: 'Chrome 126', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'Publishing Record', to: '/admin/vcard-management/publishing' }], timeline: [
    { time: '04:15:00', event: 'Membership suspension detected' }, { time: '04:15:01', event: 'VCard unpublished automatically' }, { time: '04:15:05', event: 'QR fallback destination activated' }, { time: '04:15:10', event: 'Notification sent to business owner' },
  ]},
  { id: '15', time: '6 hours ago', activityType: 'Exchange Started', vcardType: 'Consumer VCard', business: '—', businessId: '—', consumer: 'Lisa Park', consumerId: 'CON-234', performedBy: 'Consumer', source: 'Consumer Dashboard', status: 'Pending', referenceId: 'EXC-20260730-0015', details: 'Exchange request sent to Fitness Studio Pro VCard. Awaiting acceptance.', ipAddress: '192.168.1.91', device: 'Mobile (iPhone 14)', browser: 'Safari 18', relatedRecords: [{ label: 'Consumer VCard', to: '/admin/vcard-management/consumer-vcards' }], timeline: [
    { time: '03:30:00', event: 'Exchange initiated from Consumer Dashboard' }, { time: '03:30:05', event: 'Recipient: Fitness Studio Pro' }, { time: '03:30:06', event: 'Request sent — awaiting acceptance' },
  ]},
  { id: '16', time: '6 hours ago', activityType: 'Redeem Started', vcardType: 'Consumer VCard', business: 'Health & Wellness Spa', businessId: 'BIZ-009', consumer: 'Nina Patel', consumerId: 'CON-067', performedBy: 'Consumer', source: 'Consumer Dashboard', status: 'Processing', referenceId: 'RDM-20260730-0005', details: 'Redemption initiated for "20% Off Spa Treatment". Awaiting confirmation from business.', ipAddress: '192.168.1.12', device: 'Mobile (Pixel 9)', browser: 'Chrome 126', relatedRecords: [{ label: 'Business VCard', to: '/admin/vcard-management/business-vcard-templates' }, { label: 'Consumer Profile', to: '/admin/consumers' }], timeline: [
    { time: '02:45:00', event: 'Reward selected: 20% Off Spa Treatment' }, { time: '02:45:30', event: 'Redemption initiated' }, { time: '02:46:00', event: 'Pending business confirmation' },
  ]},
]

const todayBusiness = ACTIVITIES.filter(a => a.vcardType === 'Business VCard').length
const todayConsumer = ACTIVITIES.filter(a => a.vcardType === 'Consumer VCard').length
const qrActivity = ACTIVITIES.filter(a => ['QR Scanned', 'Rule Failed'].includes(a.activityType)).length
const pubActivity = ACTIVITIES.filter(a => ['Published', 'Unpublished', 'Scheduled', 'Archived'].includes(a.activityType) || a.source === 'Publishing Engine').length
const sharedActivity = ACTIVITIES.filter(a => a.activityType === 'Shared').length
const exchangeActivity = ACTIVITIES.filter(a => a.activityType.startsWith('Exchange')).length
const redeemActivity = ACTIVITIES.filter(a => a.activityType.startsWith('Redeem')).length
const systemEvents = ACTIVITIES.filter(a => a.source === 'System').length

const qrScans = ACTIVITIES.filter(a => a.activityType === 'QR Scanned').length
const failedScans = ACTIVITIES.filter(a => a.activityType === 'Rule Failed').length
const successfulShares = ACTIVITIES.filter(a => a.activityType === 'Shared' && a.status === 'Success').length
const failedShares = 0
const exchangesCompleted = ACTIVITIES.filter(a => a.activityType === 'Exchange Completed').length
const exchangesFailed = 0
const redeemCompleted = ACTIVITIES.filter(a => a.activityType === 'Redeem Completed').length
const redeemFailed = 0

/* ── Sub-Components ───────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Success': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Pending': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Cancelled': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Scheduled': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Processing': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function ActivityTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Created': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Edited': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Duplicated': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Published': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
    'Unpublished': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Deleted': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'QR Scanned': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'QR Updated': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600',
    'Shared': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Exchange Started': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
    'Exchange Completed': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Redeem Started': 'bg-pink-50 dark:bg-pink-500/10 text-pink-600',
    'Redeem Completed': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
    'Membership Updated': 'bg-violet-50 dark:bg-violet-500/10 text-violet-600',
    'Template Changed': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600',
    'Component Updated': 'bg-lime-50 dark:bg-lime-500/10 text-lime-600',
    'Version Restored': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Rule Applied': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Rule Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Validation Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${colors[type] || 'bg-gray-50 text-gray-600'}`}>{type}</span>
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    'Admin': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
    'Business Dashboard': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Consumer Dashboard': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Dynamic QR Engine': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'Publishing Engine': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Component Library': 'bg-lime-50 dark:bg-lime-500/10 text-lime-600',
    'System': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
    'API': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors[source] || 'bg-gray-50 text-gray-600'}`}>{source}</span>
}

function KpiCard({ label, value, sub, color, badge }: KPIGroup) {
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

/* ── Activity Detail Panel ─────────────────────────────── */

function ActivityDetailPanel({ activity, onClose }: { activity: ActivityEvent | null; onClose: () => void }) {
  const [detailTab, setDetailTab] = useState<'general' | 'related' | 'timeline'>('general')
  if (!activity) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 shadow-2xl">
        <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Details</h3>
              <p className="text-[10px] text-gray-500">#{activity.referenceId}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {([{ key: 'general', label: 'General' }, { key: 'related', label: 'Related Records' }, { key: 'timeline', label: 'Timeline' }] as const).map(t => (
              <button key={t.key} onClick={() => setDetailTab(t.key)} className={`flex-1 px-3 py-2 text-[10px] font-medium text-center transition-colors border-b-2 ${detailTab === t.key ? 'text-orange-600 border-orange-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>{t.label}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {detailTab === 'general' && (
              <div className="space-y-3">
                {[
                  { label: 'Activity ID', value: `#${activity.referenceId}` },
                  { label: 'Timestamp', value: activity.time },
                  { label: 'Activity Type', value: activity.activityType },
                  { label: 'Status', value: activity.status },
                  { label: 'Performed By', value: activity.performedBy },
                  { label: 'Origin', value: activity.source },
                  { label: 'IP Address', value: activity.performedBy === 'Admin' ? activity.ipAddress : '—' },
                  { label: 'Device', value: activity.device || '—' },
                  { label: 'Browser', value: activity.browser || '—' },
                ].map(f => (
                  <div key={f.label} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-gray-500 shrink-0 w-24">{f.label}</span>
                    <span className="text-[10px] text-gray-700 dark:text-gray-300 text-right">{f.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] text-gray-500 block mb-1">Details</span>
                  <p className="text-[10px] text-gray-700 dark:text-gray-300">{activity.details}</p>
                </div>
              </div>
            )}

            {detailTab === 'related' && (
              <div>
                {activity.relatedRecords.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">No related records available.</p>
                ) : (
                  <div className="space-y-1.5">
                    {activity.relatedRecords.map((r, i) => (
                      <Link key={i} to={r.to} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 text-[10px] text-gray-700 dark:text-gray-300">
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        {r.label}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                  <p className="text-[9px] text-amber-600 font-medium">Quick Navigation</p>
                  <p className="text-[9px] text-amber-500 mt-0.5">Click a related record to navigate directly to that page.</p>
                </div>
              </div>
            )}

            {detailTab === 'timeline' && (
              <div className="relative pl-6 space-y-0">
                {activity.timeline.map((t, i) => (
                  <div key={i} className="relative pb-4 last:pb-0">
                    {i < activity.timeline.length - 1 && <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-600" />}
                    <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${i === activity.timeline.length - 1 ? 'border-orange-500 bg-orange-100 dark:bg-orange-500/20' : 'border-gray-400 bg-white dark:bg-gray-800'}`} />
                    <p className="text-[9px] font-mono text-gray-400">{t.time}</p>
                    <p className="text-[10px] text-gray-700 dark:text-gray-300 mt-0.5">{t.event}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <button onClick={() => { navigator.clipboard?.writeText(activity.referenceId); toast.success('Reference ID copied') }} className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100">Copy ID</button>
            <button onClick={() => toast.success('Activity flagged for investigation')} className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100">Flag for Review</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Main Page ─────────────────────────────────────────── */

export default function VCardActivityPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [vcardTypeFilter, setVcardTypeFilter] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailActivity, setDetailActivity] = useState<ActivityEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = ACTIVITIES.filter(a => {
    if (search) {
      const q = search.toLowerCase()
      if (!a.business.toLowerCase().includes(q) && !a.consumer.toLowerCase().includes(q) && !a.businessId.toLowerCase().includes(q) && !a.consumerId.toLowerCase().includes(q) && !a.referenceId.toLowerCase().includes(q) && !a.activityType.toLowerCase().includes(q)) return false
    }
    if (vcardTypeFilter && a.vcardType !== vcardTypeFilter) return false
    if (statusFilter && a.status !== statusFilter) return false
    if (userTypeFilter && a.performedBy !== userTypeFilter) return false
    if (categoryFilter) {
      const catMap: Record<string, string[]> = {
        'Publishing': ['Published', 'Unpublished', 'Archived'],
        'QR': ['QR Scanned', 'QR Updated', 'Rule Applied', 'Rule Failed'],
        'Sharing': ['Shared'],
        'Exchange': ['Exchange Started', 'Exchange Completed'],
        'Redeem': ['Redeem Started', 'Redeem Completed'],
        'Membership': ['Membership Updated'],
        'Templates': ['Template Changed'],
        'Components': ['Component Updated'],
        'Validation': ['Validation Failed'],
        'System': ['Created', 'Deleted', 'Version Restored'],
      }
      if (!catMap[categoryFilter]?.includes(a.activityType) && a.source !== categoryFilter) return false
    }
    return true
  })

  const toggleId = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(a => a.id))

  const bulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('Select activities first'); return }
    if (action === 'export csv') { toast.success(`Exporting ${selectedIds.length} records as CSV`) }
    else if (action === 'export excel') { toast.success(`Exporting ${selectedIds.length} records as Excel`) }
    else if (action === 'export pdf') { toast.success(`Exporting ${selectedIds.length} records as PDF`) }
    else if (action === 'export json') { toast.success(`Exporting ${selectedIds.length} records as JSON`) }
    else if (action === 'flag') { toast.success(`${selectedIds.length} activities flagged for investigation`) }
    else if (action === 'assign') { toast.success('Assigned to support team') }
    setSelectedIds([])
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Activity - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></div>
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">{Array.from({ length: 7 }).map((_, i) => <SkeletonKpi key={i} />)}</div>
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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unable to load VCard Activity</p>
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
  if (ACTIVITIES.length === 0) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Activity - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">VCard Activity</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No VCard Activity Found</p>
          <p className="text-[10px] text-gray-500">There is currently no activity matching the selected filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>VCard Activity - VCard Management - MCOM VCard</title></Helmet>

      {detailActivity && <ActivityDetailPanel activity={detailActivity} onClose={() => setDetailActivity(null)} />}

      {/* Breadcrumb + Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">VCard Activity</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Platform-wide operational history for every Business VCard and Consumer VCard. Audit, investigate, and export activity across the entire ecosystem.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => bulkAction('export csv')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export
            </button>
            <select onChange={(e) => { if (e.target.value) bulkAction(e.target.value); e.target.value = '' }} className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <option value="">Export As...</option>
              <option value="export csv">CSV</option>
              <option value="export excel">Excel</option>
              <option value="export pdf">PDF</option>
              <option value="export json">JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KpiCard label="Activities Today" value={String(ACTIVITIES.length)} sub={`${todayBusiness} Business · ${todayConsumer} Consumer`} color="text-gray-900 dark:text-white" />
        <KpiCard label="QR Activity" value={String(qrActivity)} sub={`${qrScans} scans · ${failedScans} failed`} color="text-cyan-600" badge={`${qrScans} scans`} />
        <KpiCard label="Publishing" value={String(pubActivity)} sub="Published, updated, archived" color="text-emerald-600" />
        <KpiCard label="Share Activity" value={String(sharedActivity)} sub={`${successfulShares} successful · ${failedShares} failed`} color="text-indigo-600" />
        <KpiCard label="Exchange Activity" value={String(exchangeActivity)} sub={`${exchangesCompleted} completed · ${exchangesFailed} failed`} color="text-orange-600" />
        <KpiCard label="Redeem Activity" value={String(redeemActivity)} sub={`${redeemCompleted} completed · ${redeemFailed} failed`} color="text-rose-600" />
        <KpiCard label="System Events" value={String(systemEvents)} sub="Automated updates, jobs" color="text-gray-500" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search business, consumer, ID, reference, activity type..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="w-28"><FilterSelect label="Category" value={categoryFilter} options={ACTIVITY_CATEGORIES} onChange={setCategoryFilter} /></div>
            <div className="w-28"><FilterSelect label="VCard Type" value={vcardTypeFilter} options={VCARD_TYPES} onChange={setVcardTypeFilter} /></div>
            <div className="w-24"><FilterSelect label="User" value={userTypeFilter} options={USER_TYPES} onChange={setUserTypeFilter} /></div>
            <div className="w-24"><FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} /></div>
            <div className="w-28"><FilterSelect label="Date" value={dateFilter} options={DATE_RANGES} onChange={setDateFilter} /></div>
            <div className="w-28"><FilterSelect label="Membership" value={membershipFilter} options={MEMBERSHIPS} onChange={setMembershipFilter} /></div>
          </div>
        </div>

        {/* Activity Category chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ACTIVITY_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategoryFilter(categoryFilter === c ? '' : c)} className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-colors ${categoryFilter === c ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{c}</button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] text-gray-500">{selectedIds.length} selected</span>
            <button onClick={() => bulkAction('export csv')} className="px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100">Export CSV</button>
            <button onClick={() => bulkAction('flag')} className="px-2 py-1 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded-lg hover:bg-amber-100">Flag for Investigation</button>
            <button onClick={() => bulkAction('assign')} className="px-2 py-1 text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100">Assign to Support</button>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-medium text-gray-500 mb-1">No activity matches your filters</p>
            <p className="text-[10px] text-gray-400 mb-4">Try adjusting the search term or filter selection</p>
            <button onClick={() => { setSearch(''); setCategoryFilter(''); setVcardTypeFilter(''); setUserTypeFilter(''); setStatusFilter(''); setDateFilter(''); setMembershipFilter('') }} className="px-4 py-2 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">Clear All Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-2 py-1.5 font-medium w-8"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-gray-300" /></th>
                  <th className="text-left px-2 py-1.5 font-medium">Time</th>
                  <th className="text-left px-2 py-1.5 font-medium">Activity Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">VCard Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">Business</th>
                  <th className="text-left px-2 py-1.5 font-medium">Consumer</th>
                  <th className="text-left px-2 py-1.5 font-medium">Performed By</th>
                  <th className="text-left px-2 py-1.5 font-medium">Source</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-left px-2 py-1.5 font-medium">Reference ID</th>
                  <th className="text-left px-2 py-1.5 font-medium w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer" onClick={() => setDetailActivity(a)}>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleId(a.id)} className="rounded border-gray-300" /></td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{a.time}</td>
                    <td className="px-2 py-2"><ActivityTypeBadge type={a.activityType} /></td>
                    <td className="px-2 py-2"><span className={`text-[9px] font-medium ${a.vcardType === 'Business VCard' ? 'text-blue-600' : 'text-green-600'}`}>{a.vcardType === 'Business VCard' ? 'Biz' : 'Con'}</span></td>
                    <td className="px-2 py-2">
                      {a.business !== '—' ? <div><p className="text-gray-700 dark:text-gray-300 font-medium">{a.business}</p><p className="text-[9px] text-gray-400">{a.businessId}</p></div> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-2 py-2">
                      {a.consumer !== '—' ? <div><p className="text-gray-700 dark:text-gray-300 font-medium">{a.consumer}</p><p className="text-[9px] text-gray-400">{a.consumerId}</p></div> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{a.performedBy}</td>
                    <td className="px-2 py-2"><SourceBadge source={a.source} /></td>
                    <td className="px-2 py-2"><StatusBadge status={a.status} /></td>
                    <td className="px-2 py-2"><span className="font-mono text-[9px] text-gray-500">{a.referenceId}</span></td>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailActivity(a)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500" title="View Details"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                        <button onClick={() => { navigator.clipboard?.writeText(a.referenceId); toast.success('Reference ID copied') }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500" title="Copy ID"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-3 px-1">
              <span className="text-[10px] text-gray-400">{filtered.length} of {ACTIVITIES.length} events</span>
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
