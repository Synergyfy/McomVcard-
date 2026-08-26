import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface ActivityRecord {
  id: number; activityId: string; timestamp: string; activityType: string
  cardType: string; cardId: string; business: string; consumer: string
  membership: string; qr: string; device: string; status: string; performedBy: string
}

interface DrawerData {
  activity: { id: string; date: string; time: string; event: string; status: string; duration: string }
  card: { type: string; template: string; version: string; currentStatus: string; publishedVersion: string }
  business: { name: string; membership: string; vcard: string; card: string }
  consumer: { name: string; membership: string; vcard: string; card: string; ffAllocation: string }
  qr: { id: string; type: string; destination: string; scanCount: number; lastScan: string; rotationRule: string }
  device: { browser: string; os: string; deviceType: string; ip: string }
  integrations: { reward: string; cashback: string; donation: string; spin: string }
}

const ACTIVITY_RECORDS: ActivityRecord[] = [
  { id: 1, activityId: 'ACT-000001', timestamp: '10:35 AM · 28 Jul 2026', activityType: 'Published', cardType: 'Business VCard', cardId: 'VCRD-001', business: 'ABC Restaurant', consumer: '—', membership: 'Gold', qr: 'QR-ABC-001', device: 'Chrome / Windows', status: 'Successful', performedBy: 'Admin' },
  { id: 2, activityId: 'ACT-000002', timestamp: '10:37 AM · 28 Jul 2026', activityType: 'Activated', cardType: 'Consumer Card', cardId: 'CRD-003', business: 'TechCorp Solutions', consumer: 'Sarah Johnson', membership: 'Gold Pro', qr: 'QR-SJ-001', device: 'Safari / iOS', status: 'Successful', performedBy: 'Sarah Johnson' },
  { id: 3, activityId: 'ACT-000003', timestamp: '10:39 AM · 28 Jul 2026', activityType: 'Shared', cardType: 'Consumer VCard', cardId: 'VCRD-004', business: 'Luxury Hotels Ltd', consumer: 'John Smith', membership: 'Platinum', qr: 'QR-JS-002', device: 'Chrome / Android', status: 'Successful', performedBy: 'John Smith' },
  { id: 4, activityId: 'ACT-000004', timestamp: '10:42 AM · 28 Jul 2026', activityType: 'QR Scanned', cardType: 'Business VCard', cardId: 'VCRD-001', business: 'ABC Restaurant', consumer: '—', membership: 'Gold', qr: 'QR-ABC-001', device: 'Camera App / iOS', status: 'Successful', performedBy: 'External User' },
  { id: 5, activityId: 'ACT-000005', timestamp: '10:50 AM · 28 Jul 2026', activityType: 'Exchanged', cardType: 'Consumer VCard', cardId: 'VCRD-005', business: 'Global Retail Inc', consumer: 'Emily Davis', membership: 'Silver Pro', qr: 'QR-ED-001', device: 'Chrome / Windows', status: 'Successful', performedBy: 'Emily Davis' },
  { id: 6, activityId: 'ACT-000006', timestamp: '10:55 AM · 28 Jul 2026', activityType: 'Membership Upgraded', cardType: 'Consumer Card', cardId: 'CRD-009', business: 'Luxury Hotels Ltd', consumer: 'James Wilson', membership: 'Platinum', qr: 'QR-JW-001', device: 'Safari / macOS', status: 'Successful', performedBy: 'System' },
  { id: 7, activityId: 'ACT-000007', timestamp: '11:00 AM · 28 Jul 2026', activityType: 'Created', cardType: 'Business Card', cardId: 'CRD-010', business: 'Green Energy Co', consumer: '—', membership: 'Gold', qr: 'QR-GE-001', device: 'Chrome / Windows', status: 'Successful', performedBy: 'Admin' },
  { id: 8, activityId: 'ACT-000008', timestamp: '11:05 AM · 28 Jul 2026', activityType: 'Shared', cardType: 'Consumer Card', cardId: 'CRD-006', business: 'Café Mocha', consumer: 'Emily Davis', membership: 'Silver', qr: 'QR-ED-002', device: 'Firefox / Windows', status: 'Successful', performedBy: 'Emily Davis' },
  { id: 9, activityId: 'ACT-000009', timestamp: '11:12 AM · 28 Jul 2026', activityType: 'QR Scanned', cardType: 'Consumer VCard', cardId: 'VCRD-004', business: 'Luxury Hotels Ltd', consumer: 'John Smith', membership: 'Platinum', qr: 'QR-JS-002', device: 'Camera App / Android', status: 'Successful', performedBy: 'External User' },
  { id: 10, activityId: 'ACT-000010', timestamp: '11:20 AM · 28 Jul 2026', activityType: 'Suspended', cardType: 'Consumer VCard', cardId: 'VCRD-007', business: 'TechCorp Solutions', consumer: 'Michael Brown', membership: 'Bronze', qr: 'QR-MB-001', device: '—', status: 'Successful', performedBy: 'Support Agent' },
  { id: 11, activityId: 'ACT-000011', timestamp: '11:25 AM · 28 Jul 2026', activityType: 'Redeemed', cardType: 'Consumer Card', cardId: 'CRD-003', business: 'TechCorp Solutions', consumer: 'Sarah Johnson', membership: 'Gold Pro', qr: 'QR-SJ-001', device: 'Safari / iOS', status: 'Successful', performedBy: 'Sarah Johnson' },
  { id: 12, activityId: 'ACT-000012', timestamp: '11:30 AM · 28 Jul 2026', activityType: 'Expired', cardType: 'Business VCard', cardId: 'VCRD-008', business: 'Café Mocha', consumer: '—', membership: 'Silver', qr: 'QR-CM-001', device: '—', status: 'Successful', performedBy: 'System' },
  { id: 13, activityId: 'ACT-000013', timestamp: '11:35 AM · 28 Jul 2026', activityType: 'Updated', cardType: 'Business Card', cardId: 'CRD-001', business: 'TechCorp Solutions', consumer: '—', membership: 'Gold Pro', qr: 'QR-TC-001', device: 'Chrome / Windows', status: 'Successful', performedBy: 'Admin' },
  { id: 14, activityId: 'ACT-000014', timestamp: '11:40 AM · 28 Jul 2026', activityType: 'Archived', cardType: 'Consumer VCard', cardId: 'VCRD-009', business: 'Luxury Hotels Ltd', consumer: 'Lisa Wilson', membership: 'Platinum', qr: 'QR-LW-001', device: '—', status: 'Successful', performedBy: 'Admin' },
  { id: 15, activityId: 'ACT-000015', timestamp: '11:45 AM · 28 Jul 2026', activityType: 'Exchanged', cardType: 'Business VCard', cardId: 'VCRD-002', business: 'Café Mocha', consumer: '—', membership: 'Silver', qr: 'QR-CM-002', device: 'Chrome / Android', status: 'Failed', performedBy: 'External User' },
  { id: 16, activityId: 'ACT-000016', timestamp: '11:50 AM · 28 Jul 2026', activityType: 'Assigned', cardType: 'Consumer Card', cardId: 'CRD-011', business: 'Global Retail Inc', consumer: 'Olivia Taylor', membership: 'Silver Pro', qr: 'QR-OT-001', device: '—', status: 'Successful', performedBy: 'Admin' },
  { id: 17, activityId: 'ACT-000017', timestamp: 'Yesterday · 4:15 PM', activityType: 'Published', cardType: 'Business Card', cardId: 'CRD-012', business: 'TechCorp Solutions', consumer: '—', membership: 'Gold Pro', qr: 'QR-TC-002', device: 'Chrome / Windows', status: 'Successful', performedBy: 'Admin' },
  { id: 18, activityId: 'ACT-000018', timestamp: 'Yesterday · 3:00 PM', activityType: 'QR Scanned', cardType: 'Consumer Card', cardId: 'CRD-003', business: 'TechCorp Solutions', consumer: 'Sarah Johnson', membership: 'Gold Pro', qr: 'QR-SJ-001', device: 'Camera App / iOS', status: 'Successful', performedBy: 'External User' },
  { id: 19, activityId: 'ACT-000019', timestamp: 'Yesterday · 2:30 PM', activityType: 'Activated', cardType: 'Consumer Card', cardId: 'CRD-011', business: 'Global Retail Inc', consumer: 'Olivia Taylor', membership: 'Silver Pro', qr: 'QR-OT-001', device: 'Chrome / Android', status: 'Pending', performedBy: 'Olivia Taylor' },
  { id: 20, activityId: 'ACT-000020', timestamp: 'Yesterday · 1:00 PM', activityType: 'Assigned', cardType: 'Business VCard', cardId: 'VCRD-010', business: 'Green Energy Co', consumer: '—', membership: 'Gold', qr: 'QR-GE-002', device: '—', status: 'Successful', performedBy: 'Admin' },
]

const CARD_TYPES = ['All', 'Business Card', 'Business VCard', 'Consumer Card', 'Consumer VCard']
const ACTIVITY_TYPES = ['All', 'Created', 'Published', 'Assigned', 'Activated', 'Viewed', 'Opened', 'QR Scanned', 'Shared', 'Exchanged', 'Redeemed', 'Updated', 'Suspended', 'Expired', 'Archived', 'Deleted']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const DATE_RANGES = ['All', 'Today', 'Yesterday', '7 Days', '30 Days', 'Custom']
const STATUSES = ['All', 'Successful', 'Pending', 'Failed', 'Cancelled']
const BUSINESSES = ['All', 'ABC Restaurant', 'TechCorp Solutions', 'Luxury Hotels Ltd', 'Café Mocha', 'Global Retail Inc', 'Green Energy Co']

const LIVE_FEED = [
  { time: '11:50 AM', business: 'Global Retail Inc', event: 'Assigned Consumer Card to Olivia Taylor.', type: 'assignment' },
  { time: '11:45 AM', business: 'Café Mocha', event: 'Business VCard exchange failed — QR expired.', type: 'error' },
  { time: '11:40 AM', business: 'Luxury Hotels Ltd', event: 'Archived Consumer VCard (Lisa Wilson).', type: 'archive' },
  { time: '11:35 AM', business: 'TechCorp Solutions', event: 'Updated Business Card template.', type: 'update' },
  { time: '11:30 AM', business: 'Café Mocha', event: 'Business VCard expired.', type: 'expiry' },
  { time: '11:25 AM', business: 'TechCorp Solutions', event: 'Sarah Johnson redeemed a reward.', type: 'reward' },
  { time: '11:20 AM', business: 'TechCorp Solutions', event: 'Michael Brown\'s VCard suspended.', type: 'suspension' },
  { time: '11:12 AM', business: 'Luxury Hotels Ltd', event: 'QR scanned — John Smith\'s VCard.', type: 'scan' },
  { time: '11:05 AM', business: 'Café Mocha', event: 'Emily Davis shared Consumer Card.', type: 'share' },
  { time: '10:55 AM', business: 'Luxury Hotels Ltd', event: 'James Wilson\'s membership upgraded.', type: 'upgrade' },
]

const TIMELINE_EVENTS = [
  { time: '09:10', event: 'Business Card Published', active: true },
  { time: '09:15', event: 'Consumer Received Card', active: true },
  { time: '09:18', event: 'Card Activated', active: true },
  { time: '09:20', event: 'QR Scanned', active: true },
  { time: '09:22', event: 'Business Shared Promotion', active: true },
  { time: '09:24', event: 'Consumer Shared Card', active: true },
  { time: '09:35', event: 'Reward Redeemed', future: true },
  { time: '10:00', event: 'Cashback Issued', future: true },
]

const DRAWER_RECORDS: Record<number, DrawerData> = {
  1: {
    activity: { id: 'ACT-000001', date: '28 Jul 2026', time: '10:35 AM', event: 'Published', status: 'Successful', duration: '—' },
    card: { type: 'Business VCard', template: 'Modern Café VCard', version: '2.1', currentStatus: 'Active', publishedVersion: '2.1' },
    business: { name: 'ABC Restaurant', membership: 'Gold', vcard: 'VCRD-ABC-001', card: 'CRD-ABC-001' },
    consumer: { name: '—', membership: '—', vcard: '—', card: '—', ffAllocation: '—' },
    qr: { id: 'QR-ABC-001', type: 'Dynamic', destination: 'https://mcomvcard.com/v/abc-restaurant', scanCount: 12400, lastScan: '10:42 AM', rotationRule: 'Monthly' },
    device: { browser: 'Chrome 126', os: 'Windows 11', deviceType: 'Desktop', ip: '192.168.1.100' },
    integrations: { reward: 'Coming Soon', cashback: 'Coming Soon', donation: 'Coming Soon', spin: 'Coming Soon' },
  },
  3: {
    activity: { id: 'ACT-000003', date: '28 Jul 2026', time: '10:39 AM', event: 'Shared', status: 'Successful', duration: '—' },
    card: { type: 'Consumer VCard', template: 'Platinum Elite VCard', version: '1.5', currentStatus: 'Active', publishedVersion: '1.5' },
    business: { name: 'Luxury Hotels Ltd', membership: 'Platinum', vcard: 'VCRD-LH-001', card: 'CRD-LH-001' },
    consumer: { name: 'John Smith', membership: 'Platinum', vcard: 'VCRD-JS-001', card: 'CRD-JS-001', ffAllocation: '3 additional cards' },
    qr: { id: 'QR-JS-002', type: 'Dynamic', destination: 'https://mcomvcard.com/v/john-smith', scanCount: 3400, lastScan: '11:12 AM', rotationRule: 'Weekly' },
    device: { browser: 'Chrome 125', os: 'Android 14', deviceType: 'Mobile', ip: '10.0.0.45' },
    integrations: { reward: 'Coming Soon', cashback: 'Coming Soon', donation: 'Coming Soon', spin: 'Coming Soon' },
  },
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Successful': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Pending': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Cancelled': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function KPICard({ label, value, sub, color, trending, onClick }: { label: string; value: string; sub: string; color: string; trending?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
      {trending && <p className={`text-[9px] mt-0.5 ${trending.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trending}</p>}
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

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">{title}</h4>
      {children}
    </div>
  )
}

function DrawerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-[10px] font-medium text-gray-900 dark:text-white text-right max-w-[55%]">{value}</span>
    </div>
  )
}

function ChartBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{value}</span>
    </div>
  )
}

export default function CardActivityPage() {
  const [loading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activityFilter, setActivityFilter] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [drawerRecord, setDrawerRecord] = useState<DrawerData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const todayCount = ACTIVITY_RECORDS.filter(r => r.timestamp.includes('Today') || r.timestamp.includes('28 Jul 2026')).length
  const yesterdayCount = ACTIVITY_RECORDS.filter(r => r.timestamp.includes('Yesterday')).length
  const activeCards = ACTIVITY_RECORDS.filter(r => r.status === 'Successful').length
  const shareCount = ACTIVITY_RECORDS.filter(r => r.activityType === 'Shared').length
  const exchangeCount = ACTIVITY_RECORDS.filter(r => r.activityType === 'Exchanged').length
  const redemptionCount = ACTIVITY_RECORDS.filter(r => r.activityType === 'Redeemed').length
  const qrScanCount = ACTIVITY_RECORDS.filter(r => r.activityType === 'QR Scanned').length
  const activeBiz = [...new Set(ACTIVITY_RECORDS.filter(r => r.timestamp.includes('Today') || r.timestamp.includes('28 Jul 2026')).map(r => r.business))].length
  const activeCons = [...new Set(ACTIVITY_RECORDS.filter(r => (r.timestamp.includes('Today') || r.timestamp.includes('28 Jul 2026')) && r.consumer !== '—').map(r => r.consumer))].length

  const filtered = ACTIVITY_RECORDS.filter(r => {
    if (typeFilter && r.cardType !== typeFilter) return false
    if (activityFilter && r.activityType !== activityFilter) return false
    if (businessFilter && r.business !== businessFilter) return false
    if (membershipFilter && r.membership !== membershipFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.activityId.toLowerCase().includes(q) && !r.business.toLowerCase().includes(q) && !r.consumer.toLowerCase().includes(q) && !r.cardId.toLowerCase().includes(q) && !r.membership.toLowerCase().includes(q) && !r.qr.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { if (allSelected) setSelectedIds([]); else setSelectedIds(filtered.map(r => r.id)) }
  const toggleOne = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const openDrawer = (record: ActivityRecord) => {
    setDrawerRecord(DRAWER_RECORDS[record.id] || null)
    setDrawerOpen(true)
  }

  const [showAnalytics, setShowAnalytics] = useState(true)

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Card Activity - MCOM VCard</title></Helmet>
        <div className="h-7 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Helmet><title>Card Activity - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unable to retrieve card activity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">There was a problem loading the activity feed.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setError(false)} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">View Platform Status</button>
          </div>
          <p className="text-[9px] text-gray-400 mt-3">If the issue persists, contact your system administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Card Activity - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Card Activity</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Central activity monitoring for every Card and VCard across the platform — usage, lifecycle events, and real-time feed.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toast.success('Activity report generated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export Report</button>
            <button onClick={() => toast.success('Activity feed refreshed')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Refresh</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Total Activities Today" value={String(todayCount)} sub="Across all cards" color="text-indigo-600" trending={`+${todayCount - yesterdayCount > 0 ? todayCount - yesterdayCount : 0} vs yesterday`} onClick={() => toast('Today\'s Activity Report coming soon')} />
        <KPICard label="Active Cards" value={String(activeCards)} sub={`${ACTIVITY_RECORDS.filter(r => r.cardType === 'Business Card' && r.status === 'Successful').length} Biz · ${ACTIVITY_RECORDS.filter(r => r.cardType === 'Consumer Card' && r.status === 'Successful').length} Con`} color="text-green-600" />
        <KPICard label="Total Shares" value={String(shareCount)} sub="Cards shared today" color="text-teal-600" />
        <KPICard label="Total Exchanges" value={String(exchangeCount)} sub="VCards exchanged today" color="text-blue-600" />
        <KPICard label="Total Redemptions" value={String(redemptionCount)} sub="Reward redemptions — Coming Soon" color="text-purple-600" />
        <KPICard label="QR Scans" value={String(qrScanCount)} sub={`Today · ${qrScanCount * 7} weekly · ${qrScanCount * 30} monthly`} color="text-amber-600" />
        <KPICard label="Active Businesses" value={String(activeBiz)} sub="Businesses active today" color="text-emerald-600" />
        <KPICard label="Active Consumers" value={String(activeCons)} sub="Consumers active today" color="text-rose-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Activity Timeline — Today</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-1">
          {TIMELINE_EVENTS.map((item, i, arr) => (
            <div key={i} className="flex items-center w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${item.active ? 'bg-indigo-500 border-indigo-500' : item.future ? 'bg-white dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`} />
                <div className="text-left">
                  <p className={`text-[10px] font-medium ${item.active ? 'text-indigo-600 dark:text-indigo-400' : item.future ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`}>{item.event}</p>
                  <p className="text-[8px] text-gray-400">{item.time}</p>
                </div>
              </div>
              {i < arr.length - 1 && <div className={`h-0.5 w-full sm:w-8 mx-2 ${item.active ? 'bg-indigo-500/30' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3">
          <span className="text-[9px] text-indigo-500 font-medium">● Active Events</span>
          <span className="text-[9px] text-gray-400">○ Completed</span>
          <span className="text-[9px] text-gray-300 dark:text-gray-600">- - Coming Soon</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Business, Consumer, Card ID, VCard ID, QR, Email, Phone..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            <FilterSelect label="Card Type" value={typeFilter} options={CARD_TYPES} onChange={setTypeFilter} />
            <FilterSelect label="Activity" value={activityFilter} options={ACTIVITY_TYPES} onChange={setActivityFilter} />
            <FilterSelect label="Business" value={businessFilter} options={BUSINESSES} onChange={setBusinessFilter} />
            <FilterSelect label="Membership" value={membershipFilter} options={MEMBERSHIPS} onChange={setMembershipFilter} />
            <FilterSelect label="Date Range" value={dateFilter} options={DATE_RANGES} onChange={setDateFilter} />
            <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Live Activity Feed</h3>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-600 font-medium">Live</span>
            </span>
          </div>
          <div className="space-y-1">
            {LIVE_FEED.map((item, i) => {
              const colors: Record<string, string> = { assignment: 'text-blue-600', error: 'text-red-600', archive: 'text-gray-500', update: 'text-indigo-600', expiry: 'text-amber-600', reward: 'text-purple-600', suspension: 'text-red-600', scan: 'text-teal-600', share: 'text-green-600', upgrade: 'text-emerald-600' }
              return (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <span className="text-[9px] text-gray-400 font-mono w-14 shrink-0">{item.time}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium w-32 shrink-0">{item.business}</span>
                  <span className={`text-[10px] ${colors[item.type] || 'text-gray-700 dark:text-gray-300'}`}>{item.event}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Today's Events by Type</h3>
          <div className="space-y-2.5">
            {[
              { label: 'QR Scanned', value: qrScanCount, color: 'bg-teal-500' },
              { label: 'Shared', value: shareCount, color: 'bg-green-500' },
              { label: 'Exchanged', value: exchangeCount, color: 'bg-blue-500' },
              { label: 'Activated', value: ACTIVITY_RECORDS.filter(r => r.activityType === 'Activated').length, color: 'bg-indigo-500' },
              { label: 'Published', value: ACTIVITY_RECORDS.filter(r => r.activityType === 'Published').length, color: 'bg-purple-500' },
              { label: 'Redeemed', value: redemptionCount, color: 'bg-amber-500' },
              { label: 'Suspended', value: ACTIVITY_RECORDS.filter(r => r.activityType === 'Suspended').length, color: 'bg-red-500' },
              { label: 'Expired', value: ACTIVITY_RECORDS.filter(r => r.activityType === 'Expired').length, color: 'bg-gray-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No card activity recorded yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">As businesses publish cards and consumers begin interacting with them, activity will appear here automatically.</p>
          <button onClick={() => toast.success('Refreshing data')} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Refresh</button>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="w-8 px-3 py-2.5 text-left">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Activity ID</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Timestamp</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Activity</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Card Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Card ID</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Business</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Consumer</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Membership</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Performed By</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleOne(r.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => openDrawer(r)} className="font-mono text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:underline">{r.activityId}</button>
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-gray-500 dark:text-gray-400">{r.timestamp}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          r.activityType === 'QR Scanned' || r.activityType === 'Shared' || r.activityType === 'Exchanged' || r.activityType === 'Activated' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' :
                          r.activityType === 'Suspended' || r.activityType === 'Expired' || r.activityType === 'Archived' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' :
                          r.activityType === 'Redeemed' || r.activityType === 'Membership Upgraded' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' :
                          'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                        }`}>{r.activityType}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.cardType}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-gray-700 dark:text-gray-300">{r.cardId}</td>
                      <td className="px-3 py-2.5">
                        <Link to="/admin/businesses" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{r.business}</Link>
                      </td>
                      <td className="px-3 py-2.5">
                        {r.consumer !== '—' ? <Link to="/admin/consumers" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{r.consumer}</Link> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">{r.membership}</span>
                      </td>
                      <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.performedBy}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="relative group inline-block">
                          <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="py-1">
                              <button onClick={() => openDrawer(r)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Details</button>
                              <Link to="/admin/businesses" className="block px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Business</Link>
                              <Link to="/admin/consumers" className="block px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Consumer</Link>
                              <Link to="/admin/card-management/template-builder" className="block px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open VCard Builder</Link>
                              <Link to="/admin/qr-codes" className="block px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open QR Management</Link>
                              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Flag Suspicious</button>
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
              <span className="text-[10px] text-gray-500">{filtered.length} of {ACTIVITY_RECORDS.length} records</span>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 mr-1">{selectedIds.length} selected</span>
                  <button onClick={() => toast.success('Exporting selected activities')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Export CSV</button>
                  <button onClick={() => toast.success('Exporting as Excel')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Export Excel</button>
                  <button onClick={() => toast.success('PDF report generated')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">PDF Report</button>
                  <button onClick={() => toast.success('Selected records archived')} className="px-2 py-1 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100">Archive</button>
                  <button onClick={() => toast.success('Flagged for review')} className="px-2 py-1 rounded text-[10px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100">Flag Suspicious</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setShowAnalytics(!showAnalytics)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity Analytics</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Usage trends, top performers, and engagement metrics</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showAnalytics ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showAnalytics && (
              <div className="px-4 pb-4 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Activity by Hour</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: '06:00', value: 2 }, { label: '08:00', value: 5 }, { label: '10:00', value: 18 },
                        { label: '12:00', value: 12 }, { label: '14:00', value: 15 }, { label: '16:00', value: 8 },
                        { label: '18:00', value: 6 }, { label: '20:00', value: 3 },
                      ].map((h) => (
                        <ChartBar key={h.label} label={h.label} value={h.value} max={18} color="bg-indigo-400" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Activity by Card Type</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Business Cards', value: ACTIVITY_RECORDS.filter(r => r.cardType === 'Business Card').length, color: 'bg-blue-500' },
                        { label: 'Business VCards', value: ACTIVITY_RECORDS.filter(r => r.cardType === 'Business VCard').length, color: 'bg-teal-500' },
                        { label: 'Consumer Cards', value: ACTIVITY_RECORDS.filter(r => r.cardType === 'Consumer Card').length, color: 'bg-purple-500' },
                        { label: 'Consumer VCards', value: ACTIVITY_RECORDS.filter(r => r.cardType === 'Consumer VCard').length, color: 'bg-emerald-500' },
                      ].map((c) => {
                        const vals = [ACTIVITY_RECORDS.filter(x => x.cardType === 'Business Card').length, ACTIVITY_RECORDS.filter(x => x.cardType === 'Business VCard').length, ACTIVITY_RECORDS.filter(x => x.cardType === 'Consumer Card').length, ACTIVITY_RECORDS.filter(x => x.cardType === 'Consumer VCard').length]
                        const barMax = Math.max(...vals)
                        return (
                          <div key={c.label}>
                            <div className="flex justify-between text-[10px] mb-0.5">
                              <span className="text-gray-600 dark:text-gray-400">{c.label}</span>
                              <span className="font-medium text-gray-900 dark:text-white">{c.value}</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${c.color}`} style={{ width: `${(c.value / barMax) * 100}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Most Shared Cards</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'John Smith\'s VCard', value: 45 },
                        { label: 'Sarah Johnson\'s Card', value: 38 },
                        { label: 'Emily Davis\'s Card', value: 29 },
                        { label: 'Café Mocha VCard', value: 24 },
                        { label: 'ABC Restaurant VCard', value: 18 },
                      ].map((s) => (
                        <ChartBar key={s.label} label={s.label} value={s.value} max={45} color="bg-green-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Most Scanned QR Codes</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'ABC Restaurant', value: 12400 },
                        { label: 'TechCorp Solutions', value: 9800 },
                        { label: 'Luxury Hotels Ltd', value: 7200 },
                        { label: 'Café Mocha', value: 5600 },
                        { label: 'Global Retail Inc', value: 4100 },
                      ].map((q) => (
                        <ChartBar key={q.label} label={q.label} value={Math.round(q.value / 100)} max={124} color="bg-teal-400" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Most Active Businesses</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'TechCorp Solutions', value: 28 },
                        { label: 'Luxury Hotels Ltd', value: 22 },
                        { label: 'Café Mocha', value: 18 },
                        { label: 'Global Retail Inc', value: 14 },
                        { label: 'ABC Restaurant', value: 10 },
                      ].map((b) => (
                        <ChartBar key={b.label} label={b.label} value={b.value} max={28} color="bg-emerald-400" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Most Active Consumers</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Sarah Johnson', value: 15 },
                        { label: 'Emily Davis', value: 12 },
                        { label: 'John Smith', value: 10 },
                        { label: 'James Wilson', value: 7 },
                        { label: 'Olivia Taylor', value: 4 },
                      ].map((c) => (
                        <ChartBar key={c.label} label={c.label} value={c.value} max={15} color="bg-rose-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Activity Heat Map by Region <span className="text-[9px] text-amber-500 font-medium ml-1">Coming Soon</span></p>
                  <p className="text-[9px] text-gray-400 mt-1">Usage patterns by location and High Street will appear here once location tracking is enabled.</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {drawerOpen && drawerRecord && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center justify-between z-10">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity Details</h3>
                <p className="text-[10px] font-mono text-gray-500">{drawerRecord.activity.id}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-5">
              <DrawerSection title="Activity Information">
                <DrawerField label="Activity ID" value={drawerRecord.activity.id} />
                <DrawerField label="Date" value={drawerRecord.activity.date} />
                <DrawerField label="Time" value={drawerRecord.activity.time} />
                <DrawerField label="Event" value={drawerRecord.activity.event} />
                <DrawerField label="Status" value={drawerRecord.activity.status} />
                <DrawerField label="Duration" value={drawerRecord.activity.duration} />
              </DrawerSection>

              <DrawerSection title="Card Information">
                <DrawerField label="Card Type" value={drawerRecord.card.type} />
                <DrawerField label="Template" value={drawerRecord.card.template} />
                <DrawerField label="Version" value={drawerRecord.card.version} />
                <DrawerField label="Current Status" value={drawerRecord.card.currentStatus} />
                <DrawerField label="Published Version" value={drawerRecord.card.publishedVersion} />
              </DrawerSection>

              <DrawerSection title="Business Information">
                <DrawerField label="Business Name" value={drawerRecord.business.name} />
                <DrawerField label="Membership" value={drawerRecord.business.membership} />
                <DrawerField label="Business VCard" value={drawerRecord.business.vcard} />
                <DrawerField label="Business Card" value={drawerRecord.business.card} />
              </DrawerSection>

              <DrawerSection title="Consumer Information">
                <DrawerField label="Consumer Name" value={drawerRecord.consumer.name} />
                <DrawerField label="Membership" value={drawerRecord.consumer.membership} />
                <DrawerField label="Consumer VCard" value={drawerRecord.consumer.vcard} />
                <DrawerField label="Consumer Card" value={drawerRecord.consumer.card} />
                <DrawerField label="F&F Allocation" value={drawerRecord.consumer.ffAllocation} />
              </DrawerSection>

              <DrawerSection title="QR Details">
                <DrawerField label="QR ID" value={drawerRecord.qr.id} />
                <DrawerField label="Type" value={drawerRecord.qr.type} />
                <DrawerField label="Destination" value={drawerRecord.qr.destination} />
                <DrawerField label="Total Scan Count" value={String(drawerRecord.qr.scanCount)} />
                <DrawerField label="Last Scan" value={drawerRecord.qr.lastScan} />
                <DrawerField label="Rotation Rule" value={drawerRecord.qr.rotationRule} />
              </DrawerSection>

              <DrawerSection title="Device Information">
                <DrawerField label="Browser" value={drawerRecord.device.browser} />
                <DrawerField label="Operating System" value={drawerRecord.device.os} />
                <DrawerField label="Device Type" value={drawerRecord.device.deviceType} />
                <DrawerField label="IP (Admin Only)" value={drawerRecord.device.ip} />
              </DrawerSection>

              <DrawerSection title="Integration Events">
                {[
                  { label: 'Reward', value: drawerRecord.integrations.reward },
                  { label: 'Cashback', value: drawerRecord.integrations.cashback },
                  { label: 'Donation', value: drawerRecord.integrations.donation },
                  { label: 'Spin', value: drawerRecord.integrations.spin },
                ].map((int) => (
                  <div key={int.label} className="flex justify-between py-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{int.label}</span>
                    <span className="text-[10px] font-medium text-amber-500">{int.value}</span>
                  </div>
                ))}
              </DrawerSection>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
