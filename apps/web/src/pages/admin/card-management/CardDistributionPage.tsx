import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface DistributionRecord {
  id: string
  cardId: string
  cardType: 'Business Card' | 'Business VCard' | 'Consumer Card' | 'Consumer VCard'
  template: string
  business: string
  consumer: string
  membership: string
  allocationSource: string
  friendsFamily: { total: number; used: number; remaining: number }
  eCardValue: string
  status: string
  activationDate: string
  expiryDate: string
  lastActivity: string
}

interface FriendsFamilyAllocation {
  consumer: string
  membership: string
  total: number
  used: number
  remaining: number
  allocations: { name: string; relation: string; status: string }[]
}

interface ECardEntitlement {
  id: string
  faceValue: string
  availableBalance: string
  redeemedAmount: string
  remainingBalance: string
  expiry: string
  status: string
}

interface TimelineItem {
  label: string
  date: string
  active: boolean
}

interface DrawerData {
  cardId: string
  cardType: string
  template: string
  version: string
  status: string
  createdDate: string
  publishedDate: string
  business: { name: string; membership: string; vcard: string; card: string }
  consumer: { name: string; membership: string; vcard: string; card: string; ffAllocation: string }
  allocation: { from: string; detail: string }
  qr: { id: string; type: string; lastScan: string; scanCount: number }
  timeline: TimelineItem[]
}

const MOCK: DistributionRecord[] = [
  { id: '1', cardId: 'CRD-000001', cardType: 'Business Card', template: 'Standard Business Card', business: 'TechCorp Solutions', consumer: '—', membership: 'Gold Pro', allocationSource: 'Membership', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£0.00', status: 'Activated', activationDate: '15 Jan 2026', expiryDate: '15 Jan 2027', lastActivity: '2 hours ago' },
  { id: '2', cardId: 'CRD-000002', cardType: 'Business VCard', template: 'Modern Café VCard', business: 'Café Mocha', consumer: '—', membership: 'Silver', allocationSource: 'Membership', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£0.00', status: 'Activated', activationDate: '10 Jan 2026', expiryDate: '10 Jan 2027', lastActivity: '1 day ago' },
  { id: '3', cardId: 'CRD-000003', cardType: 'Consumer Card', template: 'Gold Premium Card', business: 'TechCorp Solutions', consumer: 'John Smith', membership: 'Gold Pro', allocationSource: 'Membership', friendsFamily: { total: 3, used: 2, remaining: 1 }, eCardValue: '£50.00', status: 'Activated', activationDate: '20 Jan 2026', expiryDate: '20 Jan 2027', lastActivity: '5 mins ago' },
  { id: '4', cardId: 'CRD-000004', cardType: 'Consumer VCard', template: 'Platinum Elite VCard', business: 'Luxury Hotels Ltd', consumer: 'Sarah Johnson', membership: 'Platinum', allocationSource: 'Campaign', friendsFamily: { total: 5, used: 3, remaining: 2 }, eCardValue: '£200.00', status: 'Activated', activationDate: '5 Feb 2026', expiryDate: '5 Feb 2027', lastActivity: '1 hour ago' },
  { id: '5', cardId: 'CRD-000005', cardType: 'Business Card', template: 'Enterprise Business Card', business: 'Global Retail Inc', consumer: '—', membership: 'Platinum Pro+', allocationSource: 'Admin', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£0.00', status: 'Allocated', activationDate: '—', expiryDate: '—', lastActivity: '3 days ago' },
  { id: '6', cardId: 'CRD-000006', cardType: 'Consumer Card', template: 'Silver Rewards Card', business: 'Café Mocha', consumer: 'Emily Davis', membership: 'Silver', allocationSource: 'Membership', friendsFamily: { total: 1, used: 1, remaining: 0 }, eCardValue: '£25.00', status: 'Activated', activationDate: '12 Feb 2026', expiryDate: '12 Feb 2027', lastActivity: '3 hours ago' },
  { id: '7', cardId: 'CRD-000007', cardType: 'Consumer VCard', template: 'Bronze Consumer VCard', business: 'TechCorp Solutions', consumer: 'Michael Brown', membership: 'Bronze', allocationSource: 'Manual', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£0.00', status: 'Suspended', activationDate: '8 Jan 2026', expiryDate: '8 Jan 2027', lastActivity: '1 week ago' },
  { id: '8', cardId: 'CRD-000008', cardType: 'Business VCard', template: 'Modern Café VCard', business: 'Café Mocha', consumer: '—', membership: 'Silver', allocationSource: 'Membership', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£0.00', status: 'Expired', activationDate: '10 Jan 2025', expiryDate: '10 Jan 2026', lastActivity: '6 months ago' },
  { id: '9', cardId: 'CRD-000009', cardType: 'Consumer Card', template: 'Platinum Elite Card', business: 'Luxury Hotels Ltd', consumer: 'James Wilson', membership: 'Platinum', allocationSource: 'Promotion', friendsFamily: { total: 5, used: 1, remaining: 4 }, eCardValue: '£500.00', status: 'Activated', activationDate: '1 Mar 2026', expiryDate: '1 Mar 2027', lastActivity: '30 mins ago' },
  { id: '10', cardId: 'CRD-000010', cardType: 'Business Card', template: 'Standard Business Card', business: 'Green Energy Co', consumer: '—', membership: 'Gold', allocationSource: 'Membership', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£0.00', status: 'Not Allocated', activationDate: '—', expiryDate: '—', lastActivity: '—' },
  { id: '11', cardId: 'CRD-000011', cardType: 'Consumer VCard', template: 'Silver Pro VCard', business: 'Global Retail Inc', consumer: 'Olivia Taylor', membership: 'Silver Pro', allocationSource: 'Reward', friendsFamily: { total: 2, used: 0, remaining: 2 }, eCardValue: '£75.00', status: 'Allocated', activationDate: '—', expiryDate: '—', lastActivity: '5 days ago' },
  { id: '12', cardId: 'CRD-000012', cardType: 'Consumer Card', template: 'Bronze Consumer Card', business: 'TechCorp Solutions', consumer: 'Daniel Anderson', membership: 'Bronze', allocationSource: 'Membership', friendsFamily: { total: 0, used: 0, remaining: 0 }, eCardValue: '£10.00', status: 'Redeemed', activationDate: '20 Dec 2025', expiryDate: '20 Dec 2026', lastActivity: '2 months ago' },
]

const CARD_TYPES = ['All', 'Business Card', 'Business VCard', 'Consumer Card', 'Consumer VCard']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const STATUSES = ['All', 'Not Allocated', 'Allocated', 'Activated', 'Shared', 'Exchanged', 'Redeemed', 'Suspended', 'Expired']
const ALLOCATION_SOURCES = ['All', 'Membership', 'Campaign', 'Admin', 'Promotion', 'Reward', 'Manual']
const BUSINESSES = ['All', 'TechCorp Solutions', 'Café Mocha', 'Luxury Hotels Ltd', 'Global Retail Inc', 'Green Energy Co']

const MOCK_FF: FriendsFamilyAllocation[] = [
  { consumer: 'John Smith', membership: 'Gold Pro', total: 3, used: 2, remaining: 1, allocations: [{ name: 'Jane Smith', relation: 'Wife', status: 'Activated' }, { name: 'Lily Smith', relation: 'Daughter', status: 'Activated' }] },
  { consumer: 'Sarah Johnson', membership: 'Platinum', total: 5, used: 3, remaining: 2, allocations: [{ name: 'Mark Johnson', relation: 'Husband', status: 'Activated' }, { name: 'Emma Johnson', relation: 'Daughter', status: 'Activated' }, { name: 'Noah Johnson', relation: 'Son', status: 'Pending' }] },
  { consumer: 'James Wilson', membership: 'Platinum', total: 5, used: 1, remaining: 4, allocations: [{ name: 'Lisa Wilson', relation: 'Wife', status: 'Activated' }] },
  { consumer: 'Emily Davis', membership: 'Silver', total: 1, used: 1, remaining: 0, allocations: [{ name: 'Tom Davis', relation: 'Brother', status: 'Activated' }] },
  { consumer: 'Olivia Taylor', membership: 'Silver Pro', total: 2, used: 0, remaining: 2, allocations: [] },
]

const MOCK_ECARDS: ECardEntitlement[] = [
  { id: 'EC-0001', faceValue: '£50.00', availableBalance: '£50.00', redeemedAmount: '£0.00', remainingBalance: '£50.00', expiry: '20 Jan 2027', status: 'Active' },
  { id: 'EC-0002', faceValue: '£200.00', availableBalance: '£150.00', redeemedAmount: '£50.00', remainingBalance: '£150.00', expiry: '5 Feb 2027', status: 'Active' },
  { id: 'EC-0003', faceValue: '£25.00', availableBalance: '£25.00', redeemedAmount: '£0.00', remainingBalance: '£25.00', expiry: '12 Feb 2027', status: 'Active' },
  { id: 'EC-0004', faceValue: '£500.00', availableBalance: '£500.00', redeemedAmount: '£0.00', remainingBalance: '£500.00', expiry: '1 Mar 2027', status: 'Active' },
  { id: 'EC-0005', faceValue: '£75.00', availableBalance: '£75.00', redeemedAmount: '£0.00', remainingBalance: '£75.00', expiry: '—', status: 'Pending' },
  { id: 'EC-0006', faceValue: '£10.00', availableBalance: '£0.00', redeemedAmount: '£10.00', remainingBalance: '£0.00', expiry: '20 Dec 2026', status: 'Fully Redeemed' },
]

const DRAWER_DATA: Record<number, DrawerData> = {
  1: { cardId: 'CRD-000001', cardType: 'Business Card', template: 'Standard Business Card', version: '1.2', status: 'Activated', createdDate: '10 Jan 2026', publishedDate: '12 Jan 2026', business: { name: 'TechCorp Solutions', membership: 'Gold Pro', vcard: 'VCRD-TC-001', card: 'CRD-TC-001' }, consumer: { name: '—', membership: '—', vcard: '—', card: '—', ffAllocation: '—' }, allocation: { from: 'Membership', detail: 'Gold Pro — 700 Cards' }, qr: { id: 'QR-TC-001', type: 'Dynamic', lastScan: '2 hours ago', scanCount: 145 }, timeline: [{ label: 'Membership Purchased', date: '10 Jan 2026', active: false }, { label: 'Allocation Created', date: '10 Jan 2026', active: false }, { label: 'Business Received Cards', date: '12 Jan 2026', active: false }, { label: 'Activated', date: '15 Jan 2026', active: true }, { label: 'Shared', date: '—', active: false }, { label: 'Reward Redeemed', date: '—', active: false }, { label: 'Membership Renewed', date: '—', active: false }] },
  3: { cardId: 'CRD-000003', cardType: 'Consumer Card', template: 'Gold Premium Card', version: '3.0', status: 'Activated', createdDate: '15 Jan 2026', publishedDate: '18 Jan 2026', business: { name: 'TechCorp Solutions', membership: 'Gold Pro', vcard: 'VCRD-TC-001', card: 'CRD-TC-001' }, consumer: { name: 'John Smith', membership: 'Gold Pro', vcard: 'VCRD-JS-001', card: 'CRD-JS-001', ffAllocation: '3 additional cards' }, allocation: { from: 'Membership', detail: 'Gold Pro — Consumer Allocation' }, qr: { id: 'QR-JS-001', type: 'Dynamic', lastScan: '5 mins ago', scanCount: 89 }, timeline: [{ label: 'Membership Purchased', date: '15 Jan 2026', active: false }, { label: 'Allocation Created', date: '15 Jan 2026', active: false }, { label: 'Business Received Cards', date: '16 Jan 2026', active: false }, { label: 'Consumer Received Card', date: '18 Jan 2026', active: false }, { label: 'Activated', date: '20 Jan 2026', active: true }, { label: 'Shared (2 F&F)', date: '22 Jan 2026', active: true }, { label: 'Reward Redeemed', date: '—', active: false }, { label: 'Membership Renewed', date: '—', active: false }] },
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Activated': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Allocated': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Not Allocated': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Suspended': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Expired': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Redeemed': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Shared': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600',
    'Exchanged': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Pending': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Fully Redeemed': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function KPICard({ label, value, sub, color, trending, onClick }: { label: string; value: string; sub: string; color: string; trending?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
      {trending && <p className="text-[9px] text-green-600 mt-0.5">{trending}</p>}
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
      <span className="text-[10px] font-medium text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  )
}

export default function CardDistributionPage() {
  const [loading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [drawerRecord, setDrawerRecord] = useState<DrawerData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const totalBusinessCards = MOCK.filter(r => r.cardType === 'Business Card').length
  const totalBusinessVCards = MOCK.filter(r => r.cardType === 'Business VCard').length
  const totalConsumerCards = MOCK.filter(r => r.cardType === 'Consumer Card').length
  const totalConsumerVCards = MOCK.filter(r => r.cardType === 'Consumer VCard').length
  const pendingDistribution = MOCK.filter(r => r.status === 'Not Allocated' || r.status === 'Allocated').length
  const activeCards = MOCK.filter(r => r.status === 'Activated').length
  const expiredCards = MOCK.filter(r => r.status === 'Expired').length
  const suspendedCards = MOCK.filter(r => r.status === 'Suspended').length

  const filtered = MOCK.filter(r => {
    if (typeFilter && r.cardType !== typeFilter) return false
    if (membershipFilter && r.membership !== membershipFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (sourceFilter && r.allocationSource !== sourceFilter) return false
    if (businessFilter && r.business !== businessFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.cardId.toLowerCase().includes(q) && !r.business.toLowerCase().includes(q) && !r.consumer.toLowerCase().includes(q) && !r.membership.toLowerCase().includes(q) && !r.template.toLowerCase().includes(q) && !r.cardId.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { if (allSelected) setSelectedIds([]); else setSelectedIds(filtered.map(r => r.id)) }
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const openDrawer = (record: DistributionRecord) => {
    setDrawerRecord(DRAWER_DATA[Number(record.id)] || null)
    setDrawerOpen(true)
  }

  const [showFF, setShowFF] = useState(true)
  const [showECard, setShowECard] = useState(true)
  const [showTimeline, setShowTimeline] = useState(true)

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Card Distribution & Assignment - MCOM VCard</title></Helmet>
        <div className="h-7 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Helmet><title>Card Distribution & Assignment - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unable to load distribution data</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">There was a problem fetching card distribution records.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setError(false)} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">View System Status</button>
          </div>
          <p className="text-[9px] text-gray-400 mt-3">If the problem persists, contact your system administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Card Distribution & Assignment - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Card Distribution & Assignment</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Central control room for every card in the platform — who owns it, who received it, how it was allocated, and its current status.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toast.success('Distribution report generated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Generate Report</button>
            <button onClick={() => toast.success('Refreshing distribution data')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Refresh</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Total Business Cards" value={String(totalBusinessCards)} sub="Distributed across all businesses" color="text-blue-600" trending="+12% this month" onClick={() => toast('Business Card Distribution Report coming soon')} />
        <KPICard label="Total Business VCards" value={String(totalBusinessVCards)} sub="2 Published · 1 Active · 1 Draft" color="text-teal-600" onClick={() => toast('Navigating to Business VCard list')} />
        <KPICard label="Total Consumer Cards" value={String(totalConsumerCards)} sub="4 Allocated · 3 Activated · 1 Waiting" color="text-purple-600" onClick={() => toast('Navigating to Consumer Card Distribution')} />
        <KPICard label="Total Consumer VCards" value={String(totalConsumerVCards)} sub="1 Issued · 1 Active · 1 Pending" color="text-emerald-600" />
        <KPICard label="Pending Distribution" value={String(pendingDistribution)} sub="Cards waiting to be distributed" color="text-amber-600" />
        <KPICard label="Active Cards" value={String(activeCards)} sub="Currently in use" color="text-green-600" />
        <KPICard label="Expired Cards" value={String(expiredCards)} sub="Membership/campaign/manual expiry" color="text-gray-500" />
        <KPICard label="Suspended Cards" value={String(suspendedCards)} sub="Temporarily disabled" color="text-red-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Business, Consumer, ID, QR, Email, Phone..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <FilterSelect label="Card Type" value={typeFilter} options={CARD_TYPES} onChange={setTypeFilter} />
            <FilterSelect label="Membership" value={membershipFilter} options={MEMBERSHIPS} onChange={setMembershipFilter} />
            <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
            <FilterSelect label="Allocation Source" value={sourceFilter} options={ALLOCATION_SOURCES} onChange={setSourceFilter} />
            <FilterSelect label="Business" value={businessFilter} options={BUSINESSES} onChange={setBusinessFilter} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No card distributions found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">Once businesses begin issuing VCards and Cards, all allocations and assignment activity will appear here.</p>
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
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Card ID</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Template</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Business</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Consumer</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Membership</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Source</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">F&F</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">E-Card</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Activation</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Expiry</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Last Activity</th>
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
                        <button onClick={() => openDrawer(r)} className="font-mono text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:underline">{r.cardId}</button>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.cardType}</td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.template}</td>
                      <td className="px-3 py-2.5">
                        <Link to="/admin/businesses" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{r.business}</Link>
                      </td>
                      <td className="px-3 py-2.5">
                        {r.consumer !== '—' ? <Link to="/admin/consumers" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{r.consumer}</Link> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">{r.membership}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.allocationSource}</td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                        {r.friendsFamily.total > 0 ? `${r.friendsFamily.used}/${r.friendsFamily.total}` : '—'}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-gray-700 dark:text-gray-300">{r.eCardValue}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.activationDate}</td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{r.expiryDate}</td>
                      <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{r.lastActivity}</td>
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
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Card</button>
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview Template</button>
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View QR</button>
                              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reassign</button>
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Suspend</button>
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Reactivate</button>
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel Allocation</button>
                              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                              <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Download History</button>
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
              <span className="text-[10px] text-gray-500">{filtered.length} of {MOCK.length} records</span>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 mr-1">{selectedIds.length} selected</span>
                  <button onClick={() => toast.success('Exporting selected records')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Export</button>
                  <button onClick={() => toast.success('Selected cards suspended')} className="px-2 py-1 rounded text-[10px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20">Suspend</button>
                  <button onClick={() => toast.success('Selected cards reactivated')} className="px-2 py-1 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20">Reactivate</button>
                  <button onClick={() => toast.success('Expiry extended for selected')} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20">Extend Expiry</button>
                  <button onClick={() => toast.success('Report generated')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Generate Report</button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button onClick={() => setShowFF(!showFF)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Friends & Family Allocation</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Additional card entitlements per consumer</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showFF ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showFF && (
                <div className="px-4 pb-4 space-y-3">
                  {MOCK_FF.map((ff, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{ff.consumer}</p>
                          <p className="text-[10px] text-gray-500">{ff.membership}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{ff.used}/{ff.total} Used</p>
                          <p className="text-[10px] text-gray-500">{ff.remaining} remaining</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(ff.used / ff.total) * 100}%` }} />
                      </div>
                      {ff.allocations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {ff.allocations.map((a, j) => (
                            <div key={j} className="flex items-center justify-between py-1 px-2 bg-white dark:bg-gray-800 rounded">
                              <div>
                                <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{a.name}</p>
                                <p className="text-[9px] text-gray-400">{a.relation}</p>
                              </div>
                              <StatusBadge status={a.status} />
                            </div>
                          ))}
                        </div>
                      )}
                      {ff.remaining > 0 && (
                        <p className="text-[10px] text-green-600 mt-1.5 font-medium">{ff.remaining} allocation{ff.remaining > 1 ? 's' : ''} available</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button onClick={() => setShowECard(!showECard)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">E-Card Entitlements</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monetary benefits associated with issued cards</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showECard ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showECard && (
                <div className="px-4 pb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">E-Card ID</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">Face Value</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">Available</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">Redeemed</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">Remaining</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">Expiry</th>
                          <th className="px-2 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {MOCK_ECARDS.map((e) => (
                          <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-2 py-1.5 font-mono text-[11px] text-orange-600 dark:text-orange-400">{e.id}</td>
                            <td className="px-2 py-1.5 font-mono text-gray-700 dark:text-gray-300">{e.faceValue}</td>
                            <td className="px-2 py-1.5 font-mono text-gray-700 dark:text-gray-300">{e.availableBalance}</td>
                            <td className="px-2 py-1.5 font-mono text-gray-700 dark:text-gray-300">{e.redeemedAmount}</td>
                            <td className="px-2 py-1.5 font-mono text-gray-700 dark:text-gray-300">{e.remainingBalance}</td>
                            <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{e.expiry}</td>
                            <td className="px-2 py-1.5"><StatusBadge status={e.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2">Transactions are read-only within MCOM VCard. Full management via Rewards/Cashback platforms when integrated.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setShowTimeline(!showTimeline)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Distribution Timeline</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Visual chronological history of the card lifecycle</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showTimeline ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showTimeline && (
              <div className="px-4 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-1">
                  {[
                    { label: 'Membership Purchased', date: 'Start' },
                    { label: 'Allocation Created', date: '+1d' },
                    { label: 'Business Received', date: '+2d' },
                    { label: 'Consumer Received', date: '+3d' },
                    { label: 'Activated', date: '+5d' },
                    { label: 'Shared', date: '+7d' },
                    { label: 'Reward Redeemed', date: '+30d' },
                    { label: 'Membership Renewed', date: '+365d' },
                    { label: 'Allocation Increased', date: '+365d' },
                  ].map((item, i, arr) => (
                    <div key={i} className="flex items-center w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${i <= 4 ? 'bg-orange-500 border-orange-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`} />
                        <div className="text-left">
                          <p className={`text-[10px] font-medium ${i <= 4 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>{item.label}</p>
                          <p className="text-[8px] text-gray-400">{item.date}</p>
                        </div>
                      </div>
                      {i < arr.length - 1 && <div className={`h-0.5 w-full sm:w-8 mx-2 ${i <= 4 ? 'bg-orange-500/30' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </div>
                  ))}
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
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Distribution Details</h3>
                <p className="text-[10px] font-mono text-gray-500">{drawerRecord.cardId}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-5">
              <DrawerSection title="Card Information">
                <DrawerField label="Card ID" value={drawerRecord.cardId} />
                <DrawerField label="Card Type" value={drawerRecord.cardType} />
                <DrawerField label="Template" value={drawerRecord.template} />
                <DrawerField label="Version" value={drawerRecord.version} />
                <DrawerField label="Status" value={drawerRecord.status} />
                <DrawerField label="Created" value={drawerRecord.createdDate} />
                <DrawerField label="Published" value={drawerRecord.publishedDate} />
              </DrawerSection>

              <DrawerSection title="Business">
                <DrawerField label="Name" value={drawerRecord.business.name} />
                <DrawerField label="Membership" value={drawerRecord.business.membership} />
                <DrawerField label="Business VCard" value={drawerRecord.business.vcard} />
                <DrawerField label="Business Card" value={drawerRecord.business.card} />
              </DrawerSection>

              <DrawerSection title="Consumer">
                <DrawerField label="Name" value={drawerRecord.consumer.name} />
                <DrawerField label="Membership" value={drawerRecord.consumer.membership} />
                <DrawerField label="Consumer VCard" value={drawerRecord.consumer.vcard} />
                <DrawerField label="Consumer Card" value={drawerRecord.consumer.card} />
                <DrawerField label="F&F Allocation" value={drawerRecord.consumer.ffAllocation} />
              </DrawerSection>

              <DrawerSection title="Allocation">
                <DrawerField label="Allocated From" value={drawerRecord.allocation.from} />
                <DrawerField label="Detail" value={drawerRecord.allocation.detail} />
              </DrawerSection>

              <DrawerSection title="QR">
                <DrawerField label="QR ID" value={drawerRecord.qr.id} />
                <DrawerField label="Type" value={drawerRecord.qr.type} />
                <DrawerField label="Last Scan" value={drawerRecord.qr.lastScan} />
                <DrawerField label="Scan Count" value={String(drawerRecord.qr.scanCount)} />
              </DrawerSection>

              <DrawerSection title="Timeline">
                <div className="space-y-0">
                  {drawerRecord.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${t.active ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <div className="flex-1 flex justify-between">
                        <span className={`text-[10px] ${t.active ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.label}</span>
                        <span className="text-[9px] text-gray-400">{t.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerSection>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
