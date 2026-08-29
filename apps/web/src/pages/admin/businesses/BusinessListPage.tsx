import { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockBusinesses } from '../../../services/mockData'
import { getFeaturedIds, toggleFeatured } from '../../../services/participatingBusinesses'

const PAGE_SIZES = [25, 50, 100]
const ACCOUNT_STATUSES = ['All', 'Active', 'Pending', 'Suspended', 'Deactivated']
const MEMBERSHIPS = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Pro', 'Pro+', 'Enterprise', 'Free']
const BIZ_VCARD_STATUSES = ['All', 'Active', 'Inactive', 'Not Created', 'Suspended']
const BIZ_CARD_STATUSES = ['All', 'Active', 'Inactive', 'Not Created', 'Suspended']
const CONSUMER_ALLOCATION_OPTIONS = ['All', 'Has Available', 'Low Allocation', 'Exhausted', 'None']
const DATE_RANGES = ['All', 'Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range']
const ACTIVITY_RANGES = ['All', 'Today', 'Last 7 Days', 'Last 30 Days', 'No Recent Activity']
const SUSPEND_REASONS = ['Policy violation', 'Account issue', 'Payment issue', 'Security concern', 'Admin decision', 'Other']
const FEATURED_OPTIONS = ['All', 'Featured', 'Not Featured']

type SortKey = 'name' | 'owner' | 'membership' | 'status' | 'vcard' | 'card' | 'consumerVCards' | 'consumerCards' | 'lastActivity' | 'joined'
type SortDir = 'asc' | 'desc'

function relativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return 'Just now'
  if (hoursAgo < 2) return '1 hour ago'
  if (hoursAgo < 24) return `${hoursAgo} hours ago`
  const days = Math.floor(hoursAgo / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
}

function lastActivityLabel(hoursAgo: number): string {
  if (hoursAgo < 1) return 'Today'
  if (hoursAgo < 24) return 'Today'
  if (hoursAgo < 48) return 'Yesterday'
  return `${Math.floor(hoursAgo / 24)} days ago`
}

const bizData = mockBusinesses.map((b) => {
  const planMap: Record<string, string> = { Free: 'Free', Starter: 'Bronze', Business: 'Silver', Enterprise: 'Enterprise' }
  const membership = planMap[b.plan] || 'Bronze'
  const hasVCard = b.status === 'verified'
  const hasCard = b.cards > 0
  const businessVCard: string = hasVCard ? 'Active' : (b.status === 'pending' ? 'Not Created' : b.status === 'suspended' ? 'Suspended' : 'Inactive')
  const businessCard: string = hasCard ? 'Active' : (b.status === 'pending' ? 'Not Created' : b.status === 'suspended' ? 'Suspended' : 'Inactive')
  const consumerVCardsUsed = Math.floor(Math.random() * 200) + 20
  const consumerVCardsTotal = b.plan === 'Free' ? 10 : b.plan === 'Starter' ? 100 : b.plan === 'Business' ? 500 : 1000
  const consumerCardsUsed = Math.floor(Math.random() * 180) + 10
  const consumerCardsTotal = b.plan === 'Free' ? 5 : b.plan === 'Starter' ? 50 : b.plan === 'Business' ? 500 : 1000
  const hoursAgo = Math.floor(Math.random() * 336)
  const membershipStatus = b.status === 'suspended' ? 'Expired' : b.status === 'pending' ? 'Pending' : 'Active'
  const lowVCardAlloc = consumerVCardsTotal > 0 && (consumerVCardsUsed / consumerVCardsTotal) >= 0.8
  const lowCardAlloc = consumerCardsTotal > 0 && (consumerCardsUsed / consumerCardsTotal) >= 0.8
  const requiresAttention = businessVCard === 'Not Created' || businessCard === 'Not Created' || b.status === 'suspended' || lowVCardAlloc || lowCardAlloc || membershipStatus === 'Expired'

  return {
    ...b,
    businessId: `BUS-${String(b.id).padStart(6, '0')}`,
    membership,
    membershipStatus,
    businessVCard,
    businessCard,
    consumerVCardsUsed,
    consumerVCardsTotal,
    consumerCardsUsed,
    consumerCardsTotal,
    hoursAgo,
    lastActivityLabel: lastActivityLabel(hoursAgo),
    lastActivity: relativeTime(hoursAgo),
    requiresAttention,
    vcardPercent: consumerVCardsTotal > 0 ? Math.round((consumerVCardsUsed / consumerVCardsTotal) * 100) : 0,
    cardPercent: consumerCardsTotal > 0 ? Math.round((consumerCardsUsed / consumerCardsTotal) * 100) : 0,
  }
})

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    verified: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    suspended: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{status}</span>
}

function EntityBadge({ val }: { val: string }) {
  if (val === 'Active') return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">Active</span>
  if (val === 'Inactive') return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Inactive</span>
  if (val === 'Not Created') return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-400">Not Created</span>
  if (val === 'Suspended') return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">Suspended</span>
  return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-400">--</span>
}

function AllocationBar({ used, total, percent }: { used: number; total: number; percent: number }) {
  const color = percent >= 90 ? 'bg-red-500' : percent >= 80 ? 'bg-orange-500' : percent >= 50 ? 'bg-blue-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{used}/{total}</span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-700/50">
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 animate-pulse" /></td>
      ))}
    </tr>
  )
}

function SkeletonKPI() {
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"><div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse mb-2" /><div className="h-6 bg-gray-100 dark:bg-gray-700 rounded w-1/3 animate-pulse" /></div>
}

export default function BusinessListPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [membershipFilter, setMembershipFilter] = useState('All')
  const [bizVcardFilter, setBizVcardFilter] = useState('All')
  const [bizCardFilter, setBizCardFilter] = useState('All')
  const [consumerVAlloc, setConsumerVAlloc] = useState('All')
  const [consumerCAlloc, setConsumerCAlloc] = useState('All')
  const [dateRange, setDateRange] = useState('All')
  const [activityRange, setActivityRange] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('joined')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selected, setSelected] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [suspendTarget, setSuspendTarget] = useState<typeof bizData[0] | null>(null)
  const [reactivateTarget, setReactivateTarget] = useState<typeof bizData[0] | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendReasonOther, setSuspendReasonOther] = useState('')
  const [reactivateReason, setReactivateReason] = useState('')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectSearch, setConnectSearch] = useState('')
  const [kpiFilter, setKpiFilter] = useState<string | null>(null)
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(() => getFeaturedIds())
  const [featuredFilter, setFeaturedFilter] = useState('All')

  useEffect(() => {
    const t = setTimeout(() => { setLoading(false) }, 600)
    return () => clearTimeout(t)
  }, [])

  const activeFilters = useMemo(() => {
    const f: { label: string; onClear: () => void }[] = []
    if (statusFilter !== 'All') f.push({ label: `Status: ${statusFilter}`, onClear: () => { setStatusFilter('All'); setKpiFilter(null) } })
    if (membershipFilter !== 'All') f.push({ label: `Plan: ${membershipFilter}`, onClear: () => setMembershipFilter('All') })
    if (bizVcardFilter !== 'All') f.push({ label: `Biz VCard: ${bizVcardFilter}`, onClear: () => setBizVcardFilter('All') })
    if (bizCardFilter !== 'All') f.push({ label: `Biz Card: ${bizCardFilter}`, onClear: () => setBizCardFilter('All') })
    if (consumerVAlloc !== 'All') f.push({ label: `Consumer VCards: ${consumerVAlloc}`, onClear: () => setConsumerVAlloc('All') })
    if (consumerCAlloc !== 'All') f.push({ label: `Consumer Cards: ${consumerCAlloc}`, onClear: () => setConsumerCAlloc('All') })
    if (dateRange !== 'All') f.push({ label: `Added: ${dateRange}`, onClear: () => setDateRange('All') })
    if (activityRange !== 'All') f.push({ label: `Activity: ${activityRange}`, onClear: () => setActivityRange('All') })
    if (search) f.push({ label: `Search: "${search}"`, onClear: () => setSearch('') })
    if (featuredFilter !== 'All') f.push({ label: `Featured: ${featuredFilter}`, onClear: () => setFeaturedFilter('All') })
    if (kpiFilter) f.push({ label: `KPI: ${kpiFilter}`, onClear: () => setKpiFilter(null) })
    return f
  }, [statusFilter, membershipFilter, bizVcardFilter, bizCardFilter, consumerVAlloc, consumerCAlloc, dateRange, activityRange, search, featuredFilter, kpiFilter])

  const clearAllFilters = () => {
    setSearch(''); setStatusFilter('All'); setMembershipFilter('All')
    setBizVcardFilter('All'); setBizCardFilter('All'); setConsumerVAlloc('All')
    setConsumerCAlloc('All'); setDateRange('All'); setActivityRange('All')
    setFeaturedFilter('All')
    setKpiFilter(null); setPage(0)
  }

  const handleToggleFeatured = (b: typeof bizData[0]) => {
    const on = toggleFeatured(b.id)
    setFeaturedIds(getFeaturedIds())
    toast.success(on ? `${b.name} featured on the home page` : `${b.name} removed from home page featured`)
  }

  const filtered = useMemo(() => {
    let items = [...bizData]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.businessId.toLowerCase().includes(q) ||
        b.owner.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.includes(q)
      )
    }
    if (kpiFilter === 'Active') items = items.filter(b => b.status === 'verified')
    else if (kpiFilter === 'Pending') items = items.filter(b => b.status === 'pending')
    else if (kpiFilter === 'Suspended') items = items.filter(b => b.status === 'suspended')
    else if (kpiFilter === 'Attention') items = items.filter(b => b.requiresAttention)
    else if (kpiFilter === 'Featured') items = items.filter(b => featuredIds.has(b.id))
    else {
      if (statusFilter !== 'All') items = items.filter(b => b.status === statusFilter.toLowerCase())
    }
    if (membershipFilter !== 'All') items = items.filter(b => b.membership === membershipFilter)
    if (featuredFilter === 'Featured') items = items.filter(b => featuredIds.has(b.id))
    else if (featuredFilter === 'Not Featured') items = items.filter(b => !featuredIds.has(b.id))
    if (bizVcardFilter !== 'All') items = items.filter(b => b.businessVCard === bizVcardFilter)
    if (bizCardFilter !== 'All') items = items.filter(b => b.businessCard === bizCardFilter)
    if (consumerVAlloc === 'Low Allocation') items = items.filter(b => b.vcardPercent >= 80)
    else if (consumerVAlloc === 'Exhausted') items = items.filter(b => b.consumerVCardsUsed >= b.consumerVCardsTotal)
    else if (consumerVAlloc === 'None') items = items.filter(b => b.consumerVCardsTotal === 0)
    else if (consumerVAlloc === 'Has Available') items = items.filter(b => b.consumerVCardsUsed < b.consumerVCardsTotal)
    if (consumerCAlloc === 'Low Allocation') items = items.filter(b => b.cardPercent >= 80)
    else if (consumerCAlloc === 'Exhausted') items = items.filter(b => b.consumerCardsUsed >= b.consumerCardsTotal)
    else if (consumerCAlloc === 'None') items = items.filter(b => b.consumerCardsTotal === 0)
    else if (consumerCAlloc === 'Has Available') items = items.filter(b => b.consumerCardsUsed < b.consumerCardsTotal)
    if (dateRange === 'Today') items = items.filter(b => b.hoursAgo < 24)
    else if (dateRange === 'Last 7 Days') items = items.filter(b => b.hoursAgo < 168)
    else if (dateRange === 'Last 30 Days') items = items.filter(b => b.hoursAgo < 720)
    if (activityRange === 'Today') items = items.filter(b => b.hoursAgo < 24)
    else if (activityRange === 'Last 7 Days') items = items.filter(b => b.hoursAgo < 168)
    else if (activityRange === 'Last 30 Days') items = items.filter(b => b.hoursAgo < 720)
    else if (activityRange === 'No Recent Activity') items = items.filter(b => b.hoursAgo >= 720)
    items.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'owner') cmp = a.owner.localeCompare(b.owner)
      else if (sortKey === 'membership') cmp = a.membership.localeCompare(b.membership)
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else if (sortKey === 'vcard') cmp = a.businessVCard.localeCompare(b.businessVCard)
      else if (sortKey === 'card') cmp = a.businessCard.localeCompare(b.businessCard)
      else if (sortKey === 'consumerVCards') cmp = a.vcardPercent - b.vcardPercent
      else if (sortKey === 'consumerCards') cmp = a.cardPercent - b.cardPercent
      else if (sortKey === 'lastActivity') cmp = a.hoursAgo - b.hoursAgo
      else if (sortKey === 'joined') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const parse = (s: string) => { const [m, y] = s.split(' '); return parseInt(y) * 12 + months.indexOf(m) }
        cmp = parse(a.joined) - parse(b.joined)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return items
  }, [search, statusFilter, membershipFilter, bizVcardFilter, bizCardFilter, consumerVAlloc, consumerCAlloc, dateRange, activityRange, sortKey, sortDir, kpiFilter, featuredFilter, featuredIds])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'joined' ? 'desc' : 'asc') }
  }

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(b => b.id))

  const handleKpiClick = (label: string | null) => {
    setKpiFilter(prev => prev === label ? null : label)
    setPage(0)
  }

  const sortArrow = (key: SortKey) => (
    sortKey === key ? <svg className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg> : null
  )

  const thClass = (hide?: string) =>
    `text-left px-3 py-3 font-medium text-[11px] uppercase tracking-wider ${hide ? `hidden ${hide}` : ''}`

  const KpiCard = ({ label, value, sub, color, kpiKey, attention }: { label: string; value: number | string; sub?: string; color: string; kpiKey: string | null; attention?: boolean }) => (
    <button onClick={() => handleKpiClick(kpiKey)} className={`text-left bg-white dark:bg-gray-800 rounded-xl border ${kpiFilter === kpiKey ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-100 dark:border-gray-700'} shadow-sm p-4 hover:shadow-md transition-all ${attention ? 'relative overflow-hidden' : ''}`}>
      {attention && <div className="absolute top-0 right-0 w-16 h-16"><div className="absolute top-0 right-0 border-t-[16px] border-r-[16px] border-t-orange-400 border-r-orange-400" /></div>}
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </button>
  )

  const totalBiz = bizData.length
  const activeBiz = bizData.filter(b => b.status === 'verified').length
  const pendingBiz = bizData.filter(b => b.status === 'pending').length
  const suspendedBiz = bizData.filter(b => b.status === 'suspended').length
  const attentionBiz = bizData.filter(b => b.requiresAttention).length
  const featuredBiz = bizData.filter(b => b.status === 'verified' && featuredIds.has(b.id)).length

  const renderDesktopRow = (b: typeof bizData[0]) => (
    <tr key={b.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">{b.name.charAt(0)}</div>
          <div>
            <div className="flex items-center gap-1">
              <Link to={`/admin/businesses/${b.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600">{b.name}</Link>
              {b.status === 'verified' && (
                <button
                  onClick={() => handleToggleFeatured(b)}
                  title={featuredIds.has(b.id) ? 'Remove from home page featured' : 'Feature on home page'}
                  className={`p-0.5 rounded transition-colors ${featuredIds.has(b.id) ? 'text-purple-500 hover:text-purple-700' : 'text-gray-300 hover:text-purple-400'}`}
                >
                  <svg className="w-4 h-4" fill={featuredIds.has(b.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">{b.businessId}</span>
              <button onClick={() => { navigator.clipboard.writeText(b.businessId); toast.success('ID copied') }} className="text-gray-300 hover:text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <Link to={`/admin/businesses/${b.id}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600">{b.owner}</Link>
        <p className="text-[10px] text-gray-400">User: U-{String(b.id).padStart(5, '0')}</p>
      </td>
      <td className="px-3 py-3 hidden xl:table-cell">
        <p className="text-sm text-gray-700 dark:text-gray-300">{b.email}</p>
        <p className="text-[11px] text-gray-400">{b.phone}</p>
      </td>
      <td className="px-3 py-3">
        <Link to={`/admin/businesses/${b.id}`} className="hover:opacity-80"><EntityBadge val={b.businessVCard} /></Link>
      </td>
      <td className="px-3 py-3">
        <Link to={`/admin/businesses/${b.id}`} className="hover:opacity-80"><EntityBadge val={b.businessCard} /></Link>
      </td>
      <td className="px-3 py-3">
        <Link to={`/admin/businesses/${b.id}`} className="hover:opacity-80">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${b.membership === 'Enterprise' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : b.membership === 'Free' ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>{b.membership}</span>
          <p className={`text-[10px] mt-0.5 ${b.membershipStatus === 'Active' ? 'text-green-500' : b.membershipStatus === 'Expired' ? 'text-red-400' : 'text-yellow-500'}`}>{b.membershipStatus}</p>
        </Link>
      </td>
      <td className="px-3 py-3 hidden lg:table-cell">
        <Link to={`/admin/businesses/${b.id}`} className="block hover:opacity-80">
          <AllocationBar used={b.consumerVCardsUsed} total={b.consumerVCardsTotal} percent={b.vcardPercent} />
        </Link>
      </td>
      <td className="px-3 py-3 hidden xl:table-cell">
        <Link to={`/admin/businesses/${b.id}`} className="block hover:opacity-80">
          <AllocationBar used={b.consumerCardsUsed} total={b.consumerCardsTotal} percent={b.cardPercent} />
        </Link>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          {b.requiresAttention && b.status !== 'suspended' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Requires attention" />}
          <StatusBadge status={b.status} />
        </div>
      </td>
      <td className="px-3 py-3">
        <Link to={`/admin/businesses/${b.id}`} className="hover:opacity-80">
          <p className="text-sm text-gray-600 dark:text-gray-400">{b.lastActivityLabel}</p>
          <p className="text-[10px] text-gray-400">{b.lastActivity}</p>
        </Link>
      </td>
      <td className="px-3 py-3 text-right relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Link to={`/admin/businesses/${b.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="View Business">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </Link>
          <button onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
          </button>
        </div>
        {openMenuId === b.id && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1.5 z-50 text-left" onClick={() => setOpenMenuId(null)}>
            <Link to={`/admin/businesses/${b.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Business</Link>
            <Link to={`/admin/businesses/${b.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Business VCard</Link>
            <Link to={`/admin/businesses/${b.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Business Card</Link>
            <Link to={`/admin/businesses/${b.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Membership</Link>
            <Link to={`/admin/businesses/${b.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Activity</Link>
            <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
            {b.status === 'verified' && (
              <button onClick={() => handleToggleFeatured(b)} className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                {featuredIds.has(b.id) ? 'Unfeature from Home Page' : 'Feature on Home Page'}
              </button>
            )}
            {b.status === 'suspended' ? (
              <button onClick={() => { setReactivateTarget(b); setReactivateReason('') }} className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700">Reactivate Business</button>
            ) : (
              <button onClick={() => { setSuspendTarget(b); setSuspendReason(''); setSuspendReasonOther('') }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700">Suspend Business</button>
            )}
            <button onClick={() => { navigator.clipboard.writeText(b.businessId); toast.success('Business ID copied') }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Business ID</button>
          </div>
        )}
      </td>
    </tr>
  )

  const renderMobileCard = (b: typeof bizData[0]) => (
    <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{b.name.charAt(0)}</div>
          <div>
            <Link to={`/admin/businesses/${b.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600">{b.name}</Link>
            <p className="text-[10px] text-gray-400">{b.businessId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {b.requiresAttention && <span className="w-2 h-2 rounded-full bg-orange-400" />}
          {b.status === 'verified' && (
            <button
              onClick={() => handleToggleFeatured(b)}
              title={featuredIds.has(b.id) ? 'Remove from home page featured' : 'Feature on home page'}
              className={`p-1 rounded transition-colors ${featuredIds.has(b.id) ? 'text-purple-500' : 'text-gray-300 hover:text-purple-400'}`}
            >
              <svg className="w-4 h-4" fill={featuredIds.has(b.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </button>
          )}
          <StatusBadge status={b.status} />
          <button onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
          </button>
        </div>
      </div>
      {openMenuId === b.id && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 -mt-2 mb-1" onClick={() => setOpenMenuId(null)}>
          <Link to={`/admin/businesses/${b.id}`} className="block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded">View Business</Link>
          <Link to={`/admin/businesses/${b.id}`} className="block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded">View Business VCard</Link>
          <Link to={`/admin/businesses/${b.id}`} className="block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded">View Business Card</Link>
          <Link to={`/admin/businesses/${b.id}`} className="block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded">View Membership</Link>
          <Link to={`/admin/businesses/${b.id}`} className="block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded">View Activity</Link>
          <div className="my-1 border-t border-gray-200 dark:border-gray-600" />
          {b.status === 'verified' && (
            <button onClick={() => handleToggleFeatured(b)} className="w-full text-left px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-gray-700 rounded">
              {featuredIds.has(b.id) ? 'Unfeature from Home Page' : 'Feature on Home Page'}
            </button>
          )}
          {b.status === 'suspended' ? (
            <button onClick={() => { setReactivateTarget(b); setReactivateReason('') }} className="w-full text-left px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded">Reactivate Business</button>
          ) : (
            <button onClick={() => { setSuspendTarget(b); setSuspendReason(''); setSuspendReasonOther('') }} className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-gray-700 rounded">Suspend Business</button>
          )}
          <button onClick={() => { navigator.clipboard.writeText(b.businessId); toast.success('Business ID copied') }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded">Copy Business ID</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-[11px] text-gray-500">Owner</span><p className="text-gray-700 dark:text-gray-300">{b.owner}</p></div>
        <div><span className="text-[11px] text-gray-500">Contact</span><p className="text-gray-700 dark:text-gray-300">{b.email}</p><p className="text-[11px] text-gray-400">{b.phone}</p></div>
        <div><span className="text-[11px] text-gray-500">Membership</span><div className="flex items-center gap-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${b.membership === 'Enterprise' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>{b.membership}</span><span className={`text-[10px] ${b.membershipStatus === 'Active' ? 'text-green-500' : 'text-red-400'}`}>{b.membershipStatus}</span></div></div>
        <div><span className="text-[11px] text-gray-500">Biz VCard</span><EntityBadge val={b.businessVCard} /></div>
        <div><span className="text-[11px] text-gray-500">Biz Card</span><EntityBadge val={b.businessCard} /></div>
        <div><span className="text-[11px] text-gray-500">Last Activity</span><p className="text-gray-700 dark:text-gray-300">{b.lastActivityLabel}</p></div>
      </div>
      <div className="space-y-1.5">
        <div><span className="text-[11px] text-gray-500">Consumer VCards</span><AllocationBar used={b.consumerVCardsUsed} total={b.consumerVCardsTotal} percent={b.vcardPercent} /></div>
        <div><span className="text-[11px] text-gray-500">Consumer Cards</span><AllocationBar used={b.consumerCardsUsed} total={b.consumerCardsTotal} percent={b.cardPercent} /></div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to Load Businesses</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We couldn't retrieve the business list right now.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 600) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">Try Again</button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Helmet><title>Businesses - MCOM VCard Social Bio</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Businesses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage businesses, Business VCards, Business Cards, memberships, consumer card allocations, and account activity.</p>
        </div>
        <button onClick={() => setShowConnectModal(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add / Connect Business
        </button>
      </div>

      {/* KPI Strip */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonKPI key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total Businesses" value={totalBiz} sub={`${activeBiz} active`} color="text-gray-900 dark:text-white" kpiKey={null} />
          <KpiCard label="Active" value={activeBiz} sub={`${Math.round(activeBiz / totalBiz * 100)}% of total`} color="text-green-600 dark:text-green-400" kpiKey="Active" />
          <KpiCard label="Pending" value={pendingBiz} sub="Awaiting completion" color="text-yellow-600 dark:text-yellow-400" kpiKey="Pending" />
          <KpiCard label="Suspended" value={suspendedBiz} sub="Access restricted" color="text-red-600 dark:text-red-400" kpiKey="Suspended" />
          <KpiCard label="Requires Attention" value={attentionBiz} sub="Missing VCard, Card, or low allocation" color="text-orange-600 dark:text-orange-400" kpiKey="Attention" attention />
          <KpiCard label="Featured" value={featuredBiz} sub="Shown on home page" color="text-purple-600 dark:text-purple-400" kpiKey="Featured" />
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search businesses by name, ID, owner, email, VCard ID, or Card ID" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${showFilters ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
              {activeFilters.length > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{activeFilters.length}</span>}
            </button>
            <div className="relative">
              <button onClick={() => toast.success('Export started')} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Account Status</label>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); setKpiFilter(null) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {ACCOUNT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Membership Plan</label>
                <select value={membershipFilter} onChange={(e) => { setMembershipFilter(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {MEMBERSHIPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Business VCard</label>
                <select value={bizVcardFilter} onChange={(e) => { setBizVcardFilter(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {BIZ_VCARD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Business Card</label>
                <select value={bizCardFilter} onChange={(e) => { setBizCardFilter(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {BIZ_CARD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Consumer VCard Allocation</label>
                <select value={consumerVAlloc} onChange={(e) => { setConsumerVAlloc(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {CONSUMER_ALLOCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Consumer Card Allocation</label>
                <select value={consumerCAlloc} onChange={(e) => { setConsumerCAlloc(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {CONSUMER_ALLOCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Date Added</label>
                <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {DATE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Last Activity</label>
                <select value={activityRange} onChange={(e) => { setActivityRange(e.target.value); setPage(0) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {ACTIVITY_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Featured</label>
                <select value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(0); if (kpiFilter === 'Featured') setKpiFilter(null) }} className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                  {FEATURED_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={clearAllFilters} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Clear All Filters</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-xs font-medium text-orange-700 dark:text-orange-300">
              {f.label}
              <button onClick={f.onClear} className="ml-0.5 text-orange-400 hover:text-orange-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </span>
          ))}
          <button onClick={clearAllFilters} className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Clear All</button>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20 p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selected.length} selected</span>
          <div className="flex gap-2">
            <button onClick={() => toast.success(`Exporting ${selected.length} businesses`)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export
            </button>
            <button onClick={() => setSelected([])} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Clear</button>
          </div>
        </div>
      )}

      {/* Table (Desktop) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-3 py-3 w-10"><input type="checkbox" checked={paginated.length > 0 && selected.length === paginated.length} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></th>
                <th className={thClass()}><button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('name')} Business</button></th>
                <th className={thClass()}><button onClick={() => toggleSort('owner')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('owner')} Owner</button></th>
                <th className={thClass('xl:table-cell')}>Contact</th>
                <th className={thClass()}><button onClick={() => toggleSort('vcard')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('vcard')} Biz VCard</button></th>
                <th className={thClass()}><button onClick={() => toggleSort('card')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('card')} Biz Card</button></th>
                <th className={thClass()}><button onClick={() => toggleSort('membership')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('membership')} Membership</button></th>
                <th className={thClass('lg:table-cell')}><button onClick={() => toggleSort('consumerVCards')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('consumerVCards')} Consumer VCards</button></th>
                <th className={thClass('xl:table-cell')}><button onClick={() => toggleSort('consumerCards')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('consumerCards')} Consumer Cards</button></th>
                <th className={thClass()}><button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('status')} Status</button></th>
                <th className={thClass()}><button onClick={() => toggleSort('lastActivity')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">{sortArrow('lastActivity')} Last Activity</button></th>
                <th className="text-right px-3 py-3 font-medium text-[11px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {search || statusFilter !== 'All' || membershipFilter !== 'All' || bizVcardFilter !== 'All' || bizCardFilter !== 'All' || consumerVAlloc !== 'All' || consumerCAlloc !== 'All' || dateRange !== 'All' || activityRange !== 'All' || featuredFilter !== 'All' || kpiFilter ? (
                        <>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Matching Businesses</h3>
                          <p className="text-xs text-gray-400 mb-3">No businesses match the selected filters.</p>
                          <button onClick={clearAllFilters} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">Clear All Filters</button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Businesses Yet</h3>
                          <p className="text-xs text-gray-400 mb-3">No businesses have been connected to MCOMVCard yet.</p>
                          <button onClick={() => setShowConnectModal(true)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">Connect Business</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(renderDesktopRow)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-1/2 animate-pulse" /><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 animate-pulse" /><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse" /></div>)
        ) : paginated.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <p className="text-sm text-gray-500">No businesses match your criteria.</p>
            <button onClick={clearAllFilters} className="mt-3 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">Clear All Filters</button>
          </div>
        ) : paginated.map(renderMobileCard)}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length} businesses
            </span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }} className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} per page</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) pageNum = i
              else if (page < 3) pageNum = i
              else if (page > totalPages - 4) pageNum = totalPages - 7 + i
              else pageNum = page - 3 + i
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page === pageNum ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  {pageNum + 1}
                </button>
              )
            })}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              Next
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSuspendTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Suspend Business?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              You are about to suspend <strong className="text-gray-700 dark:text-gray-300">{suspendTarget.name}</strong>. The business will no longer be able to use MCOMVCard features according to the suspension rules.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason for suspension</label>
            <select value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="">Select a reason</option>
              {SUSPEND_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {suspendReason === 'Other' && (
              <input type="text" placeholder="Enter reason" value={suspendReasonOther} onChange={(e) => setSuspendReasonOther(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSuspendTarget(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button disabled={!suspendReason} onClick={() => { toast.success(`${suspendTarget.name} suspended`); setSuspendTarget(null) }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">Suspend Business</button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal */}
      {reactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setReactivateTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reactivate Business?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Reactivating <strong className="text-gray-700 dark:text-gray-300">{reactivateTarget.name}</strong> will restore its MCOMVCard access according to its current membership and account status.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason</label>
            <input type="text" placeholder="Enter reason for reactivation" value={reactivateReason} onChange={(e) => setReactivateReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setReactivateTarget(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button disabled={!reactivateReason} onClick={() => { toast.success(`${reactivateTarget.name} reactivated`); setReactivateTarget(null) }} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">Reactivate Business</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Connect Business Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConnectModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Add / Connect Business</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Search for a business registered in MCOM Solutions. The business must first be registered through MCOM Solutions before it can be connected to MCOMVCard.
            </p>
            <div className="relative mb-4">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search Business ID or Central Account ID" value={connectSearch} onChange={(e) => setConnectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
            </div>
            {connectSearch && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Search MCOM Solutions for the business account.</p>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 mb-4">
              <svg className="w-4 h-4 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">This business must first be registered through <strong>MCOM Solutions</strong>. If the business does not exist in MCOM Solutions, please register it there first.</p>
            </div>
            <div className="flex gap-2 justify-between">
              <button onClick={() => { toast.success('Redirecting to MCOM Solutions...'); setShowConnectModal(false) }} className="px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10">Go to MCOM Solutions</button>
              <button onClick={() => setShowConnectModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
