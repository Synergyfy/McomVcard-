import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface CampaignData {
  id: number; campaignId: string; name: string; type: string; owner: string; status: string; qrCodes: number; startDate: string; endDate: string; scans: number; conversionRate: number; engagementRate: number; campaignManager: string; lastUpdated: string; objective: string; successCriteria: string; destination: string; audience: string; color: string; template: string; topQR: string;
}

const CAMPAIGNS: CampaignData[] = [
  { id: 1, campaignId: 'CAMP-001', name: 'Summer Campaign 2026', type: 'Marketing', owner: 'Marketing Team', status: 'Active', qrCodes: 6, startDate: '2026-06-01', endDate: '2026-09-01', scans: 12418, conversionRate: 23.9, engagementRate: 72, campaignManager: 'Emily Park', lastUpdated: '2026-07-29', objective: 'Increase bookings during summer', successCriteria: '2,000 bookings completed', destination: 'Campaign Landing — Summer Sale', audience: 'All Businesses & Consumers', color: '#DC2626', template: 'Campaign Bright', topQR: 'QR-CAMP-001' },
  { id: 2, campaignId: 'CAMP-002', name: 'Spring Promotion', type: 'Marketing', owner: 'Marketing Team', status: 'Active', qrCodes: 4, startDate: '2026-03-01', endDate: '2026-08-01', scans: 4890, conversionRate: 25.0, engagementRate: 68, campaignManager: 'James Lee', lastUpdated: '2026-07-28', objective: 'Promote 15% spring discount', successCriteria: '1,500 redemptions', destination: 'Promotion — 15% Discount', audience: 'All Consumers', color: '#B91C1C', template: 'Campaign Bright', topQR: 'QR-PROMO-001' },
  { id: 3, campaignId: 'CAMP-003', name: 'ABC Restaurant Loyalty Drive', type: 'Business', owner: 'ABC Restaurant Ltd', status: 'Active', qrCodes: 3, startDate: '2026-07-01', endDate: '2026-09-30', scans: 3210, conversionRate: 18.4, engagementRate: 64, campaignManager: 'ABC Restaurant Ltd', lastUpdated: '2026-07-27', objective: 'Grow loyalty programme membership', successCriteria: '800 new members', destination: 'Loyalty — Double Points', audience: 'ABC Restaurant Customers', color: '#047857', template: 'Standard Business QR', topQR: 'QR-BV-0001' },
  { id: 4, campaignId: 'CAMP-004', name: 'Music Festival 2026', type: 'Event', owner: 'Events Team', status: 'Active', qrCodes: 2, startDate: '2026-06-10', endDate: '2026-08-15', scans: 2980, conversionRate: 35.0, engagementRate: 81, campaignManager: 'Sofia Martins', lastUpdated: '2026-07-26', objective: 'Drive ticket sales for the festival', successCriteria: '5,000 tickets sold', destination: 'Event Page — Music Festival', audience: 'All Consumers', color: '#7C3AED', template: 'Event Dynamic', topQR: 'QR-EVENT-001' },
  { id: 5, campaignId: 'CAMP-005', name: 'Referral Rewards Programme', type: 'Consumer', owner: 'Marketing Team', status: 'Scheduled', qrCodes: 5, startDate: '2026-08-15', endDate: '2026-11-30', scans: 0, conversionRate: 0, engagementRate: 0, campaignManager: 'Emily Park', lastUpdated: '2026-07-25', objective: 'Increase consumer referrals', successCriteria: '3,000 successful referrals', destination: 'Referral Landing Page', audience: 'All Consumers', color: '#9333EA', template: 'Premium Consumer QR', topQR: '—' },
  { id: 6, campaignId: 'CAMP-006', name: 'Café Mocha Grand Opening', type: 'Business', owner: 'Café Mocha', status: 'Scheduled', qrCodes: 4, startDate: '2026-08-20', endDate: '2026-09-20', scans: 0, conversionRate: 0, engagementRate: 0, campaignManager: 'Café Mocha', lastUpdated: '2026-07-24', objective: 'Announce new store opening', successCriteria: '2,500 visitors to new store page', destination: 'Business VCard — Café Mocha', audience: 'Local Customers', color: '#6B3A2A', template: 'Standard Business QR', topQR: '—' },
  { id: 7, campaignId: 'CAMP-007', name: 'Christmas Promotion 2025', type: 'Marketing', owner: 'Marketing Team', status: 'Completed', qrCodes: 8, startDate: '2025-12-01', endDate: '2025-12-31', scans: 18920, conversionRate: 28.5, engagementRate: 74, campaignManager: 'James Lee', lastUpdated: '2026-01-02', objective: 'Drive end-of-year sales', successCriteria: '10,000 redemptions', destination: 'Campaign — Christmas Sale', audience: 'All Businesses & Consumers', color: '#1D4ED8', template: 'Campaign Bright', topQR: 'QR-CAMP-002' },
  { id: 8, campaignId: 'CAMP-008', name: 'TechCorp Product Launch', type: 'Business', owner: 'TechCorp Inc', status: 'Completed', qrCodes: 3, startDate: '2026-04-01', endDate: '2026-06-30', scans: 6540, conversionRate: 16.2, engagementRate: 58, campaignManager: 'TechCorp Inc', lastUpdated: '2026-07-01', objective: 'Launch new product line', successCriteria: '1,000 product page visits', destination: 'Product — New Product Line', audience: 'TechCorp Customers', color: '#1E3A5F', template: 'Standard Business QR', topQR: 'QR-PROD-001' },
  { id: 9, campaignId: 'CAMP-009', name: 'Winter Sale 2026', type: 'Marketing', owner: 'Marketing Team', status: 'Draft', qrCodes: 0, startDate: '2026-12-01', endDate: '2026-12-31', scans: 0, conversionRate: 0, engagementRate: 0, campaignManager: 'Emily Park', lastUpdated: '2026-07-30', objective: 'Drive end-of-year sales', successCriteria: '8,000 redemptions', destination: 'Not configured', audience: 'All Businesses & Consumers', color: '#1D4ED8', template: 'Campaign Bright', topQR: '—' },
  { id: 10, campaignId: 'CAMP-010', name: 'GreenLeaf Customer Appreciation', type: 'Business', owner: 'GreenLeaf Spa', status: 'Draft', qrCodes: 2, startDate: '2026-10-01', endDate: '2026-10-15', scans: 0, conversionRate: 0, engagementRate: 0, campaignManager: 'GreenLeaf Spa', lastUpdated: '2026-07-29', objective: 'Reward loyal customers', successCriteria: '500 redemptions', destination: 'Loyalty — GreenLeaf', audience: 'GreenLeaf Customers', color: '#047857', template: 'Standard Business QR', topQR: '—' },
  { id: 11, campaignId: 'CAMP-011', name: 'Business Expo 2026', type: 'Event', owner: 'Events Team', status: 'Draft', qrCodes: 1, startDate: '2026-09-15', endDate: '2026-09-17', scans: 0, conversionRate: 0, engagementRate: 0, campaignManager: 'Sofia Martins', lastUpdated: '2026-07-28', objective: 'Drive event registrations', successCriteria: '800 registrations', destination: 'Event Page — Business Expo', audience: 'Business Users', color: '#6B21A8', template: 'Event Dynamic', topQR: '—' },
  { id: 12, campaignId: 'CAMP-012', name: 'Double Points Loyalty', type: 'Consumer', owner: 'Marketing Team', status: 'Active', qrCodes: 7, startDate: '2026-05-01', endDate: '2026-12-31', scans: 15670, conversionRate: 29.8, engagementRate: 77, campaignManager: 'Emily Park', lastUpdated: '2026-07-29', objective: 'Increase loyalty participation', successCriteria: '6,000 active members', destination: 'Loyalty — Double Points', audience: 'All Consumers', color: '#B45309', template: 'Premium Consumer QR', topQR: 'QR-PROMO-005' },
]

const CAMP_TYPES = ['All', 'Business', 'Consumer', 'Marketing', 'Event']
const STATUSES = ['All', 'Draft', 'Scheduled', 'Active', 'Paused', 'Completed', 'Archived']
const DATE_FILTERS = ['All', 'Today', 'This Week', 'This Month', 'Custom']

const tabs = ['overview', 'objectives', 'assignments', 'routing', 'schedule', 'audience', 'branding', 'performance', 'activity']
const tabLabels = ['Overview', 'Objectives', 'QR Assignments', 'Routing', 'Schedule', 'Audience', 'Branding', 'Performance', 'Activity']

const CALENDAR_EVENTS = [
  { name: 'Summer Campaign 2026', date: 'Jun 1 – Sep 1', status: 'Active', color: 'bg-green-500' },
  { name: 'Spring Promotion', date: 'Mar 1 – Aug 1', status: 'Active', color: 'bg-green-500' },
  { name: 'ABC Restaurant Loyalty', date: 'Jul 1 – Sep 30', status: 'Active', color: 'bg-green-500' },
  { name: 'Referral Rewards', date: 'Aug 15 – Nov 30', status: 'Scheduled', color: 'bg-blue-500' },
  { name: 'Café Mocha Grand Opening', date: 'Aug 20 – Sep 20', status: 'Scheduled', color: 'bg-blue-500' },
  { name: 'Winter Sale 2026', date: 'Dec 1 – Dec 31', status: 'Draft', color: 'bg-amber-400' },
  { name: 'GreenLeaf Appreciation', date: 'Oct 1 – Oct 15', status: 'Draft', color: 'bg-amber-400' },
  { name: 'Christmas Promotion 2025', date: 'Dec 1 – Dec 31, 2025', status: 'Completed', color: 'bg-gray-400' },
  { name: 'TechCorp Product Launch', date: 'Apr 1 – Jun 30', status: 'Completed', color: 'bg-gray-400' },
]

const CONFLICTS = [
  { severity: 'warning', message: 'Summer Campaign and Spring Promotion both target QR-BV-0002 (Café Mocha) during July', action: 'Review routing' },
  { severity: 'warning', message: 'Winter Sale 2026 has no QR codes assigned yet', action: 'Assign QR' },
  { severity: 'error', message: 'GreenLeaf Appreciation destination not configured — invalid route', action: 'Configure' },
  { severity: 'info', message: 'Referral Rewards ends 3 days after Café Mocha Grand Opening starts', action: 'Check overlap' },
]

const COMING_SOON = [
  'Campaign Templates — reusable campaign blueprints for seasonal promotions',
  'Multi-Stage Campaigns — campaigns with sequential phases and automatic routing changes',
  'Campaign Approval Workflow — optional approval before activation',
  'Cross-Platform Campaigns — one campaign spanning MCOMVCard, MCOM Rewards, MCOMMall, and future platforms',
  'AI Campaign Optimisation — recommendations for schedules, QR selection, routing, and audience targeting',
]

function CampaignTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = { 'Business': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Consumer': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', 'Marketing': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', 'Event': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[type] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { 'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600', 'Scheduled': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500', 'Completed': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600', 'Paused': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', 'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600' }
  const dots: Record<string, string> = { 'Active': 'bg-green-500', 'Scheduled': 'bg-blue-500', 'Draft': 'bg-gray-400', 'Completed': 'bg-gray-400', 'Paused': 'bg-amber-500', 'Archived': 'bg-gray-400' }
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>
      <span className={"w-1.5 h-1.5 rounded-full " + (dots[status] || 'bg-gray-400')} />{status}
    </span>
  )
}

export default function QRCampaignsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDate, setFilterDate] = useState('All')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const filtered = useMemo(() => {
    return CAMPAIGNS.filter(c => {
      if (search) { const s = search.toLowerCase(); if (!c.campaignId.toLowerCase().includes(s) && !c.name.toLowerCase().includes(s) && !c.owner.toLowerCase().includes(s)) return false }
      if (filterType !== 'All' && c.type !== filterType) return false
      if (filterStatus !== 'All' && c.status !== filterStatus) return false
      if (filterDate !== 'All') {
        const today = new Date(); const start = new Date(c.startDate)
        if (filterDate === 'Today') { const d1 = new Date(today.toDateString()); const d2 = new Date(start.toDateString()); if (d1.getTime() !== d2.getTime()) return false }
        if (filterDate === 'This Week') { const wk = new Date(today); wk.setDate(wk.getDate() - 7); if (start < wk) return false }
        if (filterDate === 'This Month') { if (start.getMonth() !== today.getMonth() || start.getFullYear() !== today.getFullYear()) return false }
      }
      return true
    })
  }, [search, filterType, filterStatus, filterDate])

  const camp = selectedId !== null ? CAMPAIGNS.find(x => String(x.id) === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }

  const totalCampaigns = CAMPAIGNS.length
  const activeCampaigns = CAMPAIGNS.filter(x => x.status === 'Active').length
  const scheduledCampaigns = CAMPAIGNS.filter(x => x.status === 'Scheduled').length
  const draftCampaigns = CAMPAIGNS.filter(x => x.status === 'Draft').length
  const completedCampaigns = CAMPAIGNS.filter(x => x.status === 'Completed').length
  const totalQR = CAMPAIGNS.reduce((s, c) => s + c.qrCodes, 0)
  const totalScans = CAMPAIGNS.reduce((s, c) => s + c.scans, 0)
  const avgConversion = CAMPAIGNS.filter(x => x.status === 'Active' || x.status === 'Completed').reduce((s, c) => s + c.conversionRate, 0) / CAMPAIGNS.filter(x => x.status === 'Active' || x.status === 'Completed').length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load QR Campaigns</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The Campaign Engine could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  if (!camp && selectedId === null) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Campaigns</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create, manage, schedule, and monitor marketing campaigns that use Dynamic QR Codes.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('Creating campaign...')} className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600">Create Campaign</button>
              <button onClick={() => handleAction('Importing campaign...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Import</button>
              <button onClick={() => handleAction('Exporting campaigns...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
              <button onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')} className={'px-3 py-1.5 rounded-lg border text-xs font-medium ' + (viewMode === 'calendar' ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50')}>{viewMode === 'list' ? 'Calendar' : 'List'}</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Total</p><p className="text-sm font-bold text-gray-900 dark:text-white">{totalCampaigns}</p><p className="text-[9px] text-gray-400">{draftCampaigns} Draft · {scheduledCampaigns} Scheduled · {completedCampaigns} Completed</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Active</p><p className="text-sm font-bold text-green-600">{activeCampaigns}</p><p className="text-[9px] text-gray-400">Running now</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Scheduled</p><p className="text-sm font-bold text-blue-600">{scheduledCampaigns}</p><p className="text-[9px] text-gray-400">Upcoming</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Campaign QR</p><p className="text-sm font-bold text-amber-600">{totalQR}</p><p className="text-[9px] text-gray-400">QR codes assigned</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Scan Volume</p><p className="text-sm font-bold text-gray-900 dark:text-white">{totalScans.toLocaleString()}</p><p className="text-[9px] text-gray-400">All campaigns</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Avg Conversion</p><p className="text-sm font-bold text-green-600">{avgConversion.toFixed(1)}%</p><p className="text-[9px] text-gray-400">Across active + completed</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Success Rate</p><p className="text-sm font-bold text-teal-600">75%</p><p className="text-[9px] text-gray-400">Met configured objectives</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-500/10 p-3"><p className="text-[10px] text-amber-500">Alerts</p><p className="text-sm font-bold text-amber-600">{CONFLICTS.length}</p><p className="text-[9px] text-amber-400">Need attention</p></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search campaign name, ID, business, type..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {CAMP_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {DATE_FILTERS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dates' : d}</option>)}
          </select>
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-2 pl-3 font-medium text-gray-400">ID</th>
                  <th className="text-left py-2 font-medium text-gray-400">Name</th>
                  <th className="text-left py-2 font-medium text-gray-400">Type</th>
                  <th className="text-left py-2 font-medium text-gray-400">Owner</th>
                  <th className="text-left py-2 font-medium text-gray-400">Status</th>
                  <th className="text-center py-2 font-medium text-gray-400">QR</th>
                  <th className="text-left py-2 font-medium text-gray-400">Start</th>
                  <th className="text-left py-2 font-medium text-gray-400">End</th>
                  <th className="text-center py-2 font-medium text-gray-400">Perf</th>
                  <th className="text-left py-2 font-medium text-gray-400">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className={'border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ' + (selectedId === c.id ? 'bg-rose-50 dark:bg-rose-500/5' : '')} onClick={() => setSelectedId(c.id)}>
                      <td className="py-2 pl-3 font-mono text-[10px] text-gray-900 dark:text-white">{c.campaignId}</td>
                      <td className="py-2"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} /><span className="font-medium text-gray-900 dark:text-white">{c.name}</span></div></td>
                      <td className="py-2"><CampaignTypeBadge type={c.type} /></td>
                      <td className="py-2 text-gray-500">{c.owner}</td>
                      <td className="py-2"><StatusBadge status={c.status} /></td>
                      <td className="py-2 text-center font-medium text-gray-900 dark:text-white">{c.qrCodes}</td>
                      <td className="py-2 text-gray-400">{c.startDate}</td>
                      <td className="py-2 text-gray-400">{c.endDate}</td>
                      <td className="py-2 text-center">{c.scans > 0 ? <span className="text-green-600 font-medium">{c.conversionRate}%</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="py-2"><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAction('Viewing ' + c.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">View</button>
                        <button onClick={() => handleAction('Editing ' + c.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Edit</button>
                        <button onClick={() => handleAction('Activating ' + c.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">{c.status === 'Draft' ? 'Activate' : c.status === 'Active' ? 'Pause' : 'Resume'}</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div className="text-center py-8"><p className="text-sm text-gray-400">No campaigns match your filters.</p></div>}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Calendar — 2026</h4><div className="flex items-center gap-2 text-[9px] text-gray-400"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Active</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Scheduled</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Draft</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" />Completed</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Attention</span></div></div>
            <div className="grid grid-cols-12 gap-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <div key={m} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 min-h-[120px]">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1">{m}</p>
                  <div className="space-y-1">
                    {CALENDAR_EVENTS.filter(e => e.date.toLowerCase().includes(m.toLowerCase()) || (m === 'Dec' && e.name.includes('Christmas'))).map((e, j) => (
                      <div key={j} className="px-1.5 py-1 rounded text-[8px] font-medium text-white truncate cursor-pointer hover:opacity-80" style={{ backgroundColor: e.color }}>{e.name}</div>
                    ))}
                    {m === 'Jul' && <div className="px-1.5 py-1 rounded text-[8px] font-medium text-white bg-green-500 truncate">Summer Campaign</div>}
                    {m === 'Jul' && <div className="px-1.5 py-1 rounded text-[8px] font-medium text-white bg-green-500 truncate">Loyalty Drive</div>}
                    {m === 'Aug' && <div className="px-1.5 py-1 rounded text-[8px] font-medium text-white bg-blue-500 truncate">Referral Rewards</div>}
                    {m === 'Aug' && <div className="px-1.5 py-1 rounded text-[8px] font-medium text-white bg-blue-500 truncate">Grand Opening</div>}
                    {m === 'Dec' && <div className="px-1.5 py-1 rounded text-[8px] font-medium text-white bg-amber-400 truncate">Winter Sale (Draft)</div>}
                    {m === 'Oct' && <div className="px-1.5 py-1 rounded text-[8px] font-medium text-white bg-amber-400 truncate">Appreciation (Draft)</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Campaign Conflict Detection</h4>
          <div className="space-y-2">
            {CONFLICTS.map((c, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <span className={'text-base shrink-0 ' + (c.severity === 'error' ? 'text-red-500' : c.severity === 'warning' ? 'text-amber-500' : 'text-blue-500')}>{c.severity === 'error' ? '!' : 'i'}</span>
                <div className="flex-1 min-w-0"><p className="text-xs text-gray-700 dark:text-gray-300">{c.message}</p></div>
                <button onClick={() => handleAction(c.action)} className="text-[10px] text-rose-600 hover:underline shrink-0">{c.action}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Coming Soon — Advanced Campaigns</h4>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {COMING_SOON.map((c, i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-amber-100 dark:border-amber-500/10">
                <div className="flex items-center gap-1 mb-1"><svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg><span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">Coming Soon</span></div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: camp!.color }} />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{camp!.name}</h1>
              <p className="text-xs text-gray-500">{camp!.campaignId} · <CampaignTypeBadge type={camp!.type} /> · <StatusBadge status={camp!.status} /></p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Previewing ' + camp!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => handleAction(camp!.status === 'Active' ? 'Pausing ' + camp!.name : 'Activating ' + camp!.name)} className={'px-3 py-1.5 rounded-lg text-xs font-medium text-white ' + (camp!.status === 'Active' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600')}>{camp!.status === 'Active' ? 'Pause' : 'Activate'}</button>
          <button onClick={() => handleAction('Opening analytics for ' + camp!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Analytics</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setWorkspaceTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (workspaceTab === t ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {workspaceTab === 'overview' && camp && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Campaign Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Campaign ID</span><span className="font-mono text-gray-900 dark:text-white">{camp.campaignId}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900 dark:text-white">{camp.name}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Type</span><CampaignTypeBadge type={camp.type} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Status</span><StatusBadge status={camp.status} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Owner</span><span className="text-gray-900 dark:text-white">{camp.owner}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Campaign Manager</span><span className="text-gray-900 dark:text-white">{camp.campaignManager}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Start / End</span><span className="text-gray-500">{camp.startDate} → {camp.endDate}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500">Last Updated</span><span className="text-gray-500">{camp.lastUpdated}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Campaign Snapshot</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Assigned QR Codes</p><p className="text-sm font-bold text-gray-900 dark:text-white">{camp.qrCodes}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Total Scans</p><p className="text-sm font-bold text-gray-900 dark:text-white">{camp.scans > 0 ? camp.scans.toLocaleString() : '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Conversion Rate</p><p className="text-sm font-bold text-green-600">{camp.conversionRate > 0 ? camp.conversionRate + '%' : '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Engagement Rate</p><p className="text-sm font-bold text-purple-600">{camp.engagementRate > 0 ? camp.engagementRate + '%' : '—'}</p></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-3 text-xs"><p className="text-[10px] text-gray-500 mb-1">QR Design Template</p><p className="font-medium text-gray-900 dark:text-white">{camp.template}</p></div>
          </div>
        </div>
      )}

      {workspaceTab === 'objectives' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Objectives</h4>
          <div className="space-y-2 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Objective</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[280px]">{camp.objective}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Success Criteria</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[280px]">{camp.successCriteria}</span></div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
            <span className="text-gray-600 dark:text-gray-400">Objective Progress</span>
            <div className="flex items-center gap-2"><div className="w-40 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5"><div className="bg-rose-500 h-1.5 rounded-full" style={{ width: camp.scans > 0 ? Math.min(100, camp.scans / 100) + '%' : '5%' }} /></div><span className="font-medium text-gray-900 dark:text-white">{camp.scans > 0 ? Math.min(100, Math.round(camp.scans / 100)) + '%' : '5%'}</span></div>
          </div>
          <button onClick={() => handleAction('Editing objectives for ' + camp.name)} className="px-3 py-1.5 bg-rose-500 text-white rounded text-xs font-medium hover:bg-rose-600">Edit Objectives</button>
        </div>
      )}

      {workspaceTab === 'assignments' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Assigned QR Codes</h4><button onClick={() => handleAction('Adding QR to ' + camp.name)} className="px-2 py-1 bg-rose-500 text-white rounded text-[10px] font-medium hover:bg-rose-600">Add QR</button></div>
          <div className="space-y-2">
            {Array.from({ length: Math.max(1, camp.qrCodes) }).map((_, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
                <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-gray-900 dark:text-white">{i === 0 && camp.topQR !== '—' ? camp.topQR : 'QR-' + camp.type.slice(0, 2).toUpperCase() + '-' + String(i + 1).padStart(4, '0')}</span><span className="text-gray-500">{camp.type} QR</span></div>
                <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 rounded text-[9px] font-medium">Assigned</span><button onClick={() => handleAction('Removing QR from ' + camp.name)} className="text-[9px] text-red-500 hover:underline">Remove</button></div>
              </div>
            ))}
            {camp.qrCodes === 0 && <div className="text-center py-4 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20"><p className="text-xs text-amber-700 dark:text-amber-400">No QR codes assigned yet — this campaign cannot activate without QRs.</p></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction('Bulk assigning QRs to ' + camp.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Bulk Assign</button>
            <button onClick={() => handleAction('Replacing QR in ' + camp.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Replace QR</button>
          </div>
        </div>
      )}

      {workspaceTab === 'routing' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Routing</h4>
          <div className="space-y-2 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Campaign Destination</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[280px]">{camp.destination}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Routing Behaviour</span><span className="font-medium text-gray-900 dark:text-white">Temporary override — restored on completion</span></div>
          </div>
          <div className="bg-green-50 dark:bg-green-500/5 rounded-lg p-3 border border-green-200 dark:border-green-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-700 dark:text-green-400">Routing reuses the existing Routing Engine — no logic duplicated here.</span>
          </div>
          <button onClick={() => handleAction('Editing routing for ' + camp.name)} className="px-3 py-1.5 bg-rose-500 text-white rounded text-xs font-medium hover:bg-rose-600">Edit Routing</button>
        </div>
      )}

      {workspaceTab === 'schedule' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Schedule</h4>
          <div className="space-y-2 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Start Date</span><span className="font-medium text-gray-900 dark:text-white">{camp.startDate}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">End Date</span><span className="font-medium text-gray-900 dark:text-white">{camp.endDate}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Time Zone</span><span className="font-medium text-gray-900 dark:text-white">Europe/London</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Activation</span><span className="font-medium text-gray-900 dark:text-white">{camp.status === 'Scheduled' ? 'Automatic' : camp.status === 'Draft' ? 'Manual (on publish)' : 'Automatic'}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Completion</span><span className="font-medium text-gray-900 dark:text-white">Automatic on end date</span></div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Overlap Validation</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-500/70">No conflicting schedules detected for this campaign's QR assignments.</p>
          </div>
          <button onClick={() => handleAction('Editing schedule for ' + camp.name)} className="px-3 py-1.5 bg-rose-500 text-white rounded text-xs font-medium hover:bg-rose-600">Edit Schedule</button>
        </div>
      )}

      {workspaceTab === 'audience' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Audience</h4>
          <div className="space-y-2 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Intended Audience</span><span className="font-medium text-gray-900 dark:text-white text-right">{camp.audience}</span></div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1">Coming Soon — Advanced Segmentation</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-500/70">Geography, behaviour, purchase history, loyalty level, and referral status segmentation are planned for future releases.</p>
          </div>
          <button onClick={() => handleAction('Editing audience for ' + camp.name)} className="px-3 py-1.5 bg-rose-500 text-white rounded text-xs font-medium hover:bg-rose-600">Edit Audience</button>
        </div>
      )}

      {workspaceTab === 'branding' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Branding</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3 text-xs max-w-md">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Campaign Colour</span><div className="flex items-center gap-2"><span className="w-4 h-4 rounded border" style={{ backgroundColor: camp.color }} /><span>{camp.color}</span></div></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">QR Design Template</span><span className="font-medium text-gray-900 dark:text-white">{camp.template}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Template Source</span><span className="font-medium text-gray-900 dark:text-white">QR Design System (8.3)</span></div>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border-2 border-dashed border-gray-200 dark:border-gray-600">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ backgroundColor: camp.color }}>{camp.name.slice(0, 1)}</div>
              <p className="text-[10px] text-gray-500 mt-2">{camp.name} — campaign logo placeholder</p>
              <button onClick={() => handleAction('Uploading campaign assets')} className="mt-2 px-3 py-1 bg-rose-500 text-white rounded text-[10px] font-medium hover:bg-rose-600">Upload Asset</button>
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'performance' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Performance</h4><button onClick={() => handleAction('Exporting report for ' + camp.name)} className="text-[10px] text-rose-600 hover:underline">Export Report</button></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Total Scans</p><p className="text-lg font-bold text-gray-900 dark:text-white">{camp.scans > 0 ? camp.scans.toLocaleString() : '—'}</p></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Engagement Rate</p><p className="text-lg font-bold text-purple-600">{camp.engagementRate > 0 ? camp.engagementRate + '%' : '—'}</p></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Conversion Rate</p><p className="text-lg font-bold text-green-600">{camp.conversionRate > 0 ? camp.conversionRate + '%' : '—'}</p></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Top QR</p><p className="text-sm font-bold text-gray-900 dark:text-white">{camp.topQR !== '—' ? camp.topQR : 'N/A'}</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction('Opening QR analytics for ' + camp.name)} className="px-3 py-1.5 bg-rose-500 text-white rounded text-xs font-medium hover:bg-rose-600">Open QR Analytics</button>
            <button onClick={() => handleAction('Exporting campaign report')} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Export Campaign Report</button>
          </div>
        </div>
      )}

      {workspaceTab === 'activity' && camp && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Timeline</h4>
          <div className="relative pl-6">
            {[
              { action: 'Campaign Updated', detail: 'Details modified by ' + camp.campaignManager, date: camp.lastUpdated + ' 14:30' },
              { action: 'QR Assigned', detail: 'Linked to campaign QR codes', date: camp.startDate + ' 10:00' },
              { action: 'Routing Updated', detail: 'Destination set: ' + camp.destination, date: camp.startDate + ' 09:00' },
              { action: camp.status === 'Active' ? 'Campaign Activated' : 'Schedule Configured', detail: camp.status === 'Active' ? 'Campaign went live' : 'Dates: ' + camp.startDate + ' → ' + camp.endDate, date: camp.startDate + ' 08:00' },
              { action: 'Campaign Created', detail: 'Created by ' + camp.campaignManager, date: camp.startDate + ' 09:00' },
            ].map((a, i) => (
              <div key={i} className="relative pb-4 last:pb-0">
                {i < 4 && <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                <div className="flex items-start gap-3">
                  <div className="absolute left-[-6px] w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-gray-800 mt-0.5" />
                  <div className="text-xs ml-4"><p className="font-medium text-gray-900 dark:text-white">{a.action}</p><p className="text-gray-500">{a.detail}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
