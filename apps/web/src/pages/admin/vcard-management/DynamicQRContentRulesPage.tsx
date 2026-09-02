import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

/* ── Types ─────────────────────────────────────────────── */

interface ScheduledChange {
  date: string; label: string; destination: string
}

interface RuleHistoryEvent {
  date: string; action: string; from?: string; to?: string
}

interface QRRule {
  id: string; name: string; description: string
  qrType: 'Business VCard' | 'Consumer VCard' | 'Business Card' | 'Consumer Card'
  linkedObject: string; linkedId: string
  destinationType: 'Business VCard' | 'Consumer VCard' | 'Business Card' | 'Consumer Card' | 'Campaign' | 'Offer' | 'Event' | 'Booking' | 'External URL' | 'Coming Soon Integration'
  currentDestination: string; nextScheduledChange: string | null
  priority: number
  status: 'Active' | 'Scheduled' | 'Draft' | 'Paused' | 'Expired' | 'Archived'
  lastUpdated: string; createdDate: string
  triggerType: 'Time-based' | 'Manual' | 'Campaign-based' | 'Membership-based' | 'Integration-based'
  scheduledChanges: ScheduledChange[]; history: RuleHistoryEvent[]
  totalScans: number; uniqueScans: number; todayScans: number; weeklyScans: number; monthlyScans: number
  repeatScans: number
}

/* ── Mock Data ─────────────────────────────────────────── */

const SCHEDULED_CHANGES_A: ScheduledChange[] = [
  { date: 'Today', label: 'Business Profile', destination: 'Joe\'s Coffee — Business VCard' },
  { date: 'Tomorrow', label: 'Weekend Promotion', destination: '/campaign/weekend-50-off' },
  { date: 'Next Monday', label: 'Christmas Campaign', destination: '/campaign/christmas-2026' },
  { date: 'January', label: 'Loyalty Programme', destination: '/loyalty/joe-coffee' },
  { date: 'Spring', label: 'Fundraiser Campaign', destination: '/fundraiser/spring-drive' },
]

const SCHEDULED_CHANGES_B: ScheduledChange[] = [
  { date: 'Today', label: 'Gold Welcome', destination: 'Gold Tier Consumer VCard' },
  { date: 'Next Week', label: 'Summer Offer', destination: '/offer/summer-gold' },
  { date: 'August', label: 'Back to School', destination: '/campaign/bts-2026' },
]

const HISTORY_A: RuleHistoryEvent[] = [
  { date: '28 Jul 2026', action: 'Destination changed', from: 'Business Profile', to: 'Summer Campaign' },
  { date: '20 Jul 2026', action: 'Rule paused' },
  { date: '25 Jul 2026', action: 'Rule resumed' },
  { date: '15 Jul 2026', action: 'Rule created' },
]

const HISTORY_B: RuleHistoryEvent[] = [
  { date: '27 Jul 2026', action: 'Destination changed', from: 'Default Welcome', to: 'Gold Welcome' },
  { date: '10 Jul 2026', action: 'Priority changed', from: '5', to: '2' },
  { date: '1 Jul 2026', action: 'Rule created' },
]

const RULES: QRRule[] = [
  { id: '1', name: 'Joe\'s Coffee Dynamic VCard', description: 'Rotates through promotional destinations on a weekly schedule. The QR on Joe\'s printed materials never changes.', qrType: 'Business VCard', linkedObject: 'Joe\'s Coffee', linkedId: 'BIZ-001', destinationType: 'Campaign', currentDestination: 'Joe\'s Coffee — Business VCard', nextScheduledChange: 'Tomorrow — Weekend Promotion', priority: 1, status: 'Active', lastUpdated: '2 hours ago', createdDate: '15 Jan 2025', triggerType: 'Time-based', scheduledChanges: SCHEDULED_CHANGES_A, history: HISTORY_A, totalScans: 12400, uniqueScans: 8900, todayScans: 142, weeklyScans: 980, monthlyScans: 4100, repeatScans: 3500 },
  { id: '2', name: 'Gold Tier Rotating Offer', description: 'Gold members see different content based on the active campaign period.', qrType: 'Consumer VCard', linkedObject: 'Sarah Johnson', linkedId: 'CON-042', destinationType: 'Offer', currentDestination: 'Gold Tier Consumer VCard', nextScheduledChange: 'Next Week — Summer Offer', priority: 2, status: 'Active', lastUpdated: '1 day ago', createdDate: '20 Mar 2025', triggerType: 'Membership-based', scheduledChanges: SCHEDULED_CHANGES_B, history: HISTORY_B, totalScans: 8700, uniqueScans: 5600, todayScans: 89, weeklyScans: 620, monthlyScans: 2800, repeatScans: 3100 },
  { id: '3', name: 'Platinum Seasonal Redirect', description: 'Platinum members are redirected to exclusive seasonal content each quarter.', qrType: 'Consumer VCard', linkedObject: 'James Williams', linkedId: 'CON-089', destinationType: 'Event', currentDestination: 'Q3 Luxury Collection', nextScheduledChange: 'Q4 — Holiday Gala', priority: 3, status: 'Active', lastUpdated: '3 days ago', createdDate: '10 Jun 2025', triggerType: 'Membership-based', scheduledChanges: [], history: [], totalScans: 5400, uniqueScans: 3800, todayScans: 45, weeklyScans: 310, monthlyScans: 1600, repeatScans: 1600 },
  { id: '4', name: 'Summer Menu Campaign', description: 'QR on restaurant tables directs to weekly updated summer menu.', qrType: 'Business VCard', linkedObject: 'Beachside Grill', linkedId: 'BIZ-015', destinationType: 'Campaign', currentDestination: 'Week 4 — Seafood Specials', nextScheduledChange: 'Week 5 — BBQ Night', priority: 4, status: 'Paused', lastUpdated: '5 days ago', createdDate: '1 Aug 2025', triggerType: 'Campaign-based', scheduledChanges: [], history: [], totalScans: 3200, uniqueScans: 2100, todayScans: 0, weeklyScans: 0, monthlyScans: 1200, repeatScans: 1100 },
  { id: '5', name: 'Holiday Card Redirect', description: 'Physical holiday cards redirect to seasonal microsite.', qrType: 'Business Card', linkedObject: 'Holiday Campaign 2026', linkedId: 'CAMP-005', destinationType: 'External URL', currentDestination: 'https://mcomvcard.com/holiday-2026', nextScheduledChange: 'December — Live', priority: 5, status: 'Scheduled', lastUpdated: '1 week ago', createdDate: '15 Sep 2025', triggerType: 'Time-based', scheduledChanges: [], history: [], totalScans: 0, uniqueScans: 0, todayScans: 0, weeklyScans: 0, monthlyScans: 0, repeatScans: 0 },
  { id: '6', name: 'Event Pass Scanner', description: 'QR on event badges validates attendance and shows schedule.', qrType: 'Consumer Card', linkedObject: 'Enterprise Summit', linkedId: 'EVT-003', destinationType: 'Event', currentDestination: 'Day 1 — Keynote Hall', nextScheduledChange: null, priority: 6, status: 'Expired', lastUpdated: '1 month ago', createdDate: '10 Dec 2024', triggerType: 'Manual', scheduledChanges: [], history: [], totalScans: 8900, uniqueScans: 4500, todayScans: 0, weeklyScans: 0, monthlyScans: 0, repeatScans: 4400 },
  { id: '7', name: 'Referral Share Card', description: 'Friends & Family referrals via dynamic QR code.', qrType: 'Consumer VCard', linkedObject: 'Mike Chen', linkedId: 'CON-156', destinationType: 'Business VCard', currentDestination: 'Mike Chen — Referral Page', nextScheduledChange: null, priority: 7, status: 'Active', lastUpdated: '3 days ago', createdDate: '5 Nov 2025', triggerType: 'Membership-based', scheduledChanges: [], history: [], totalScans: 3400, uniqueScans: 2800, todayScans: 67, weeklyScans: 450, monthlyScans: 1800, repeatScans: 600 },
  { id: '8', name: 'Booking Confirmation QR', description: 'Post-booking QR for appointment check-in.', qrType: 'Business Card', linkedObject: 'Wellness Spa', linkedId: 'BIZ-022', destinationType: 'Booking', currentDestination: 'Check-in Portal', nextScheduledChange: null, priority: 8, status: 'Draft', lastUpdated: '2 weeks ago', createdDate: '20 Feb 2026', triggerType: 'Manual', scheduledChanges: [], history: [], totalScans: 0, uniqueScans: 0, todayScans: 0, weeklyScans: 0, monthlyScans: 0, repeatScans: 0 },
  { id: '9', name: 'Rewards Integration', description: 'QR resolves to MCOM Rewards programme page.', qrType: 'Business VCard', linkedObject: 'TechCorp Ltd', linkedId: 'BIZ-031', destinationType: 'Coming Soon Integration', currentDestination: 'Coming Soon — Rewards Hub', nextScheduledChange: null, priority: 9, status: 'Draft', lastUpdated: '1 day ago', createdDate: '1 Jun 2026', triggerType: 'Integration-based', scheduledChanges: [], history: [], totalScans: 0, uniqueScans: 0, todayScans: 0, weeklyScans: 0, monthlyScans: 0, repeatScans: 0 },
]

const QR_TYPES = ['All', 'Business VCard', 'Consumer VCard', 'Business Card', 'Consumer Card']
const STATUSES = ['All', 'Active', 'Scheduled', 'Draft', 'Paused', 'Expired', 'Archived']
const TRIGGER_TYPES = ['All', 'Time-based', 'Manual', 'Campaign-based', 'Membership-based', 'Integration-based']
const DATE_FILTERS = ['All', 'Created', 'Updated', 'Scheduled', 'Expiry']
const PRIORITY_LABELS: Record<number, string> = { 1: 'Emergency Override', 2: 'Manual Rule', 3: 'Campaign Rule', 4: 'Membership Rule', 5: 'Default Rule' }

/* ── Static Computations ─────────────────────────────── */

const activeRules = RULES.filter(r => r.status === 'Active').length
const scheduledRules = RULES.filter(r => r.status === 'Scheduled').length
const expiredRules = RULES.filter(r => r.status === 'Expired').length
const pausedRules = RULES.filter(r => r.status === 'Paused').length
const draftRules = RULES.filter(r => r.status === 'Draft').length
const bizVCardQRCodes = RULES.filter(r => r.qrType === 'Business VCard').length
const conVCardQRCodes = RULES.filter(r => r.qrType === 'Consumer VCard').length
const bizCardQRCodes = RULES.filter(r => r.qrType === 'Business Card').length
const conCardQRCodes = RULES.filter(r => r.qrType === 'Consumer Card').length
const totalScans = RULES.reduce((s, r) => s + r.totalScans, 0)
const uniqueScans = RULES.reduce((s, r) => s + r.uniqueScans, 0)
const todayScans = RULES.reduce((s, r) => s + r.todayScans, 0)
const weeklyScans = RULES.reduce((s, r) => s + r.weeklyScans, 0)
const monthlyScans = RULES.reduce((s, r) => s + r.monthlyScans, 0)
const changesToday = RULES.filter(r => r.scheduledChanges.some(c => c.date === 'Today')).length
const changesThisWeek = RULES.filter(r => r.scheduledChanges.some(c => ['Today', 'Tomorrow', 'Next Monday', 'Next Week'].includes(c.date))).length
const expiringSoon = RULES.filter(r => r.status === 'Expired').length
const invalidDestinations = 2
const brokenRedirects = 0
const disabledRules = pausedRules + draftRules

/* ── Sub-Components ───────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Scheduled': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Paused': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Expired': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Archived': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function TriggerBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Time-based': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'Manual': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
    'Campaign-based': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Membership-based': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Integration-based': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
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

function SkeletonCard() {
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"><div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" /><div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" /><div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></div>
}

function SkeletonRow() {
  return <tr className="border-b border-gray-50 dark:border-gray-700/50"><td colSpan={10} className="px-2 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full animate-pulse" /></td></tr>
}

/* ── Destination Timeline ─────────────────────────────── */

function DestinationTimeline({ changes }: { changes: ScheduledChange[] }) {
  if (changes.length === 0) return <p className="text-[10px] text-gray-400 italic">No scheduled changes configured.</p>
  return (
    <div className="relative pl-6 space-y-0">
      {changes.map((c, i) => (
        <div key={i} className="relative pb-4 last:pb-0">
          {i < changes.length - 1 && <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-600" />}
          <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-white dark:bg-gray-800" />
          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{c.date}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg className="w-3 h-3 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            <span className="text-[10px] text-gray-500">{c.label}</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-0.5 font-mono truncate">{c.destination}</p>
        </div>
      ))}
    </div>
  )
}

/* ── History Timeline ─────────────────────────────────── */

function HistoryTimeline({ events }: { events: RuleHistoryEvent[] }) {
  if (events.length === 0) return <p className="text-[10px] text-gray-400 italic">No history recorded yet.</p>
  return (
    <div className="relative pl-6 space-y-0">
      {events.map((e, i) => (
        <div key={i} className="relative pb-4 last:pb-0">
          {i < events.length - 1 && <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-600" />}
          <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${e.to ? 'border-blue-500' : e.action.includes('paused') ? 'border-amber-500' : e.action.includes('resumed') ? 'border-green-500' : 'border-gray-400'} bg-white dark:bg-gray-800`} />
          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{e.date}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{e.action}</p>
          {e.from && e.to && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-gray-400 line-through">{e.from}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="text-[9px] text-gray-600 dark:text-gray-300 font-medium">{e.to}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── QR Preview Modal ──────────────────────────────────── */

function PreviewModal({ rule, onClose }: { rule: QRRule | null; onClose: () => void }) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('mobile')
  const [view, setView] = useState<'business' | 'consumer'>('business')
  if (!rule) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">QR Scan Preview — {rule.name}</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setMode('desktop')} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${mode === 'desktop' ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>Desktop</button>
              <button onClick={() => setMode('mobile')} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${mode === 'mobile' ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>Mobile</button>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
              <button onClick={() => setView('business')} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${view === 'business' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>Business View</button>
              <button onClick={() => setView('consumer')} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${view === 'consumer' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>Consumer View</button>
            </div>
            <div className={`bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center ${mode === 'mobile' ? 'p-6' : 'p-4'}`}>
              <div className={`bg-white dark:bg-gray-800 rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-inner overflow-hidden ${mode === 'mobile' ? 'w-[280px]' : 'w-full max-w-md'}`}>
                <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600 flex items-end p-3">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-orange-600 font-bold text-[10px]">{rule.linkedObject.slice(0, 2).toUpperCase()}</div>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{rule.currentDestination}</p>
                  <p className="text-[9px] text-gray-500">{rule.qrType} · {rule.destinationType}</p>
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Previewing as: <span className="font-medium text-gray-600 dark:text-gray-300">{view === 'business' ? rule.linkedObject : 'Sample Consumer'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <StatusBadge status={rule.status} />
                    <TriggerBadge type={rule.triggerType} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <p className="text-[9px] font-medium text-gray-500 mb-1.5">Scan Simulation Result</p>
              <p className="text-[10px] text-gray-700 dark:text-gray-300">QR resolves to: <span className="font-mono text-orange-600">{rule.currentDestination}</span></p>
              {rule.nextScheduledChange && <p className="text-[9px] text-gray-400 mt-0.5">Next change: {rule.nextScheduledChange}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Rule Builder Workspace ────────────────────────────── */

function RuleWorkspace({ rule, onClose }: { rule: QRRule | null; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'destination' | 'triggers' | 'preview' | 'analytics' | 'history'>('overview')
  const [showPreview, setShowPreview] = useState(false)

  if (!rule) return null

  const tabs = [
    { key: 'overview' as const, label: 'Basic Info' },
    { key: 'destination' as const, label: 'Destinations' },
    { key: 'triggers' as const, label: 'Triggers' },
    { key: 'preview' as const, label: 'Preview' },
    { key: 'analytics' as const, label: 'Analytics' },
    { key: 'history' as const, label: 'History' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {showPreview && <PreviewModal rule={rule} onClose={() => setShowPreview(false)} />}

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" title="Back to list"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
            <StatusBadge status={rule.status} />
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 ml-8">{rule.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(true)} className="px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Test Scan</button>
          <button onClick={() => toast.success('Rule saved')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600">Save</button>
        </div>
      </div>

      {/* Vertical tab navigation */}
      <div className="flex">
        <div className="w-44 shrink-0 border-r border-gray-100 dark:border-gray-700 p-2 space-y-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${tab === t.key ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 max-h-[70vh] overflow-y-auto">
          {/* ── Basic Info ── */}
          {tab === 'overview' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Rule Name</label>
                <input type="text" defaultValue={rule.name} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Description</label>
                <textarea rows={2} defaultValue={rule.description} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">QR Type</label>
                  <select defaultValue={rule.qrType} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {QR_TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Status</label>
                  <select defaultValue={rule.status} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {STATUSES.filter(t => t !== 'All').map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Linked Record</label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
                    <span className="font-medium">{rule.linkedObject}</span>
                    <span className="text-gray-400">({rule.linkedId})</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Destination Type</label>
                  <select defaultValue={rule.destinationType} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {['Business VCard', 'Consumer VCard', 'Business Card', 'Consumer Card', 'Campaign', 'Offer', 'Event', 'Booking', 'External URL', 'Coming Soon Integration'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Rule Priority</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={1} max={10} defaultValue={rule.priority} className="flex-1 accent-orange-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-16 text-right">{rule.priority} — {PRIORITY_LABELS[rule.priority] || 'Custom'}</span>
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 mt-0.5">
                  <span>1 — Emergency</span>
                  <span>5 — Default</span>
                  <span>10 — Lowest</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Destinations ── */}
          {tab === 'destination' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Current Destination</h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-[10px]">QR</div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{rule.currentDestination}</p>
                    <p className="text-[9px] text-gray-500">{rule.destinationType} · {rule.qrType}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Scheduled Destination Changes</h4>
                <p className="text-[9px] text-gray-400 mb-3">The QR code never changes. Only the destination changes — automatically, on schedule.</p>
                <DestinationTimeline changes={rule.scheduledChanges} />
                {rule.scheduledChanges.length > 0 && (
                  <button onClick={() => toast.success('New change slot added')} className="mt-3 px-3 py-1.5 text-[10px] font-medium rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-orange-500 hover:border-orange-300 w-full flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Scheduled Change
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Triggers ── */}
          {tab === 'triggers' && (
            <div className="space-y-5">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Trigger Configuration</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg border p-3 ${rule.triggerType === 'Time-based' ? 'border-orange-300 bg-orange-50 dark:bg-orange-500/5' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="radio" name="trigger" checked={rule.triggerType === 'Time-based'} readOnly className="accent-orange-500" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Time-based</span>
                  </div>
                  <p className="text-[9px] text-gray-500 mb-2">Start/End dates, daily, weekly, seasonal schedules.</p>
                  <div className="space-y-1.5">
                    <div><label className="text-[8px] text-gray-400">Start Date</label><input type="date" className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700" /></div>
                    <div><label className="text-[8px] text-gray-400">End Date</label><input type="date" className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700" /></div>
                    <div><label className="text-[8px] text-gray-400">Repeat</label><select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] bg-white dark:bg-gray-700"><option>Daily</option><option>Weekly</option><option>Seasonal</option><option>None</option></select></div>
                  </div>
                </div>
                <div className={`rounded-lg border p-3 ${rule.triggerType === 'Manual' ? 'border-orange-300 bg-orange-50 dark:bg-orange-500/5' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="radio" name="trigger" checked={rule.triggerType === 'Manual'} readOnly className="accent-orange-500" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Manual</span>
                  </div>
                  <p className="text-[9px] text-gray-500">Admin switches the destination manually.</p>
                  <button className="mt-2 px-2 py-1 text-[9px] font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Switch Now</button>
                </div>
                <div className={`rounded-lg border p-3 ${rule.triggerType === 'Membership-based' ? 'border-orange-300 bg-orange-50 dark:bg-orange-500/5' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="radio" name="trigger" checked={rule.triggerType === 'Membership-based'} readOnly className="accent-orange-500" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Membership-based</span>
                  </div>
                  <p className="text-[9px] text-gray-500 mb-2">Different content per membership tier.</p>
                  <div className="space-y-1">
                    {['Bronze', 'Silver', 'Gold', 'Platinum'].map(m => (
                      <div key={m} className="flex items-center gap-1.5 text-[9px]">
                        <span className="text-gray-500 w-12">{m}</span>
                        <input type="text" defaultValue={`/${m.toLowerCase()}-experience`} className="flex-1 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-[9px] bg-white dark:bg-gray-700 font-mono" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`rounded-lg border p-3 opacity-60 ${rule.triggerType === 'Campaign-based' ? 'border-orange-300' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="radio" disabled />
                    <span className="text-[10px] font-medium text-gray-400">Campaign-based</span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-500 font-medium">Coming Soon</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Auto-redirect when a campaign starts.</p>
                </div>
                <div className={`rounded-lg border p-3 opacity-60 ${rule.triggerType === 'Integration-based' ? 'border-orange-300' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="radio" disabled />
                    <span className="text-[10px] font-medium text-gray-400">Integration-based</span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-500 font-medium">Coming Soon</span>
                  </div>
                  <p className="text-[9px] text-gray-400">MCOM Rewards, Cashback, FundOrDonate, Spin, Affiliates.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Preview ── */}
          {tab === 'preview' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Scan Simulation</h4>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-800 dark:text-gray-200" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="20" y="20" width="12" height="12" fill="currentColor" /><rect x="40" y="20" width="12" height="12" fill="currentColor" /><rect x="60" y="20" width="12" height="12" fill="currentColor" /><rect x="20" y="40" width="12" height="12" fill="currentColor" /><rect x="60" y="40" width="12" height="12" fill="currentColor" /><rect x="20" y="60" width="12" height="12" fill="currentColor" /><rect x="40" y="60" width="12" height="12" fill="currentColor" /><rect x="60" y="60" width="12" height="12" fill="currentColor" /></svg>
                </div>
                <button onClick={() => toast.success('Scan simulated — destination resolved correctly')} className="px-4 py-2 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">Simulate Scan</button>
                <p className="text-[9px] text-gray-400">Testing as: <span className="text-gray-600 dark:text-gray-300 font-medium">Gold Member · Desktop · English</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowPreview(true) }} className="px-3 py-2 text-[10px] font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Desktop Preview</button>
                <button onClick={() => { setShowPreview(true) }} className="px-3 py-2 text-[10px] font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Mobile Preview</button>
                <button onClick={() => { setShowPreview(true) }} className="px-3 py-2 text-[10px] font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Business View</button>
                <button onClick={() => { setShowPreview(true) }} className="px-3 py-2 text-[10px] font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Consumer View</button>
              </div>
            </div>
          )}

          {/* ── Analytics ── */}
          {tab === 'analytics' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Rule Analytics</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gray-900 dark:text-white">{rule.totalScans.toLocaleString()}</p><p className="text-[9px] text-gray-500">Total Scans</p></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gray-900 dark:text-white">{rule.uniqueScans.toLocaleString()}</p><p className="text-[9px] text-gray-500">Unique Scans</p></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gray-900 dark:text-white">{rule.repeatScans.toLocaleString()}</p><p className="text-[9px] text-gray-500">Repeat Scans</p></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-lg font-bold text-orange-600">{rule.todayScans}</p><p className="text-[9px] text-gray-500">Today</p></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gray-900 dark:text-white">{rule.weeklyScans}</p><p className="text-[9px] text-gray-500">This Week</p></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gray-900 dark:text-white">{rule.monthlyScans}</p><p className="text-[9px] text-gray-500">This Month</p></div>
              </div>

              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mt-4 mb-2">Device Breakdown</h4>
              <div className="space-y-2">
                {[
                  { label: 'Mobile', pct: 72, color: 'bg-orange-500' },
                  { label: 'Desktop', pct: 20, color: 'bg-blue-500' },
                  { label: 'Tablet', pct: 8, color: 'bg-purple-500' },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-500 w-14">{d.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} /></div>
                    <span className="text-[9px] text-gray-500 w-8 text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-gray-400 mt-3 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <span className="font-medium text-amber-600">Coming Soon:</span> Countries, Cities, Referrers, Time-of-day, Day-of-week heat maps.
              </div>
            </div>
          )}

          {/* ── History ── */}
          {tab === 'history' && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Change History</h4>
              <HistoryTimeline events={rule.history} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Global Default Rules Section ──────────────────────── */

function GlobalDefaultsSection() {
  const [globalFreq, setGlobalFreq] = useState('Weekly')
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Global Default Rules</h3>
      <p className="text-[9px] text-gray-400 mb-4">These apply platform-wide unless a specific rule overrides them. Ensures every QR always resolves to something meaningful.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <h4 className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Fallback Destinations</h4>
          <div className="space-y-2">
            {[
              { label: 'Inactive Business', val: '/fallback/business-inactive' },
              { label: 'Archived Card', val: '/fallback/card-archived' },
              { label: 'Expired Membership', val: '/fallback/membership-expired' },
              { label: 'Suspended Account', val: '/fallback/account-suspended' },
              { label: 'Maintenance Page', val: '/maintenance' },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500 w-32">{d.label}</span>
                <input type="text" defaultValue={d.val} className="flex-1 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-2">Default Refresh Frequency</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Daily', 'Weekly', 'Seasonal', 'Campaign-Based', 'Custom'].map(f => (
                <button key={f} onClick={() => setGlobalFreq(f)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${globalFreq === f ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-2">Security Controls</h4>
            <div className="space-y-1.5">
              {['Prevent redirect loops', 'Validate internal destinations before publish', 'Validate external URLs', 'Block invalid destinations', 'Audit every change'].map(c => (
                <label key={c} className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300"><input type="checkbox" defaultChecked className="rounded border-gray-300" />{c}</label>
              ))}
            </div>
          </div>
          <button onClick={() => toast.success('Global defaults saved')} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">Save Global Defaults</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────── */

export default function DynamicQRContentRulesPage() {
  const [search, setSearch] = useState('')
  const [qrTypeFilter, setQrTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [triggerFilter, setTriggerFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewRule, setPreviewRule] = useState<QRRule | null>(null)
  const [selectedRule, setSelectedRule] = useState<QRRule | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = RULES.filter(r => {
    if (search) {
      const q = search.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.linkedObject.toLowerCase().includes(q) && !r.linkedId.toLowerCase().includes(q) && !r.currentDestination.toLowerCase().includes(q) && !r.id.toString().includes(q)) return false
    }
    if (qrTypeFilter && r.qrType !== qrTypeFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (triggerFilter && r.triggerType !== triggerFilter) return false
    return true
  })

  const toggleId = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(r => r.id))

  const bulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('Select rules first'); return }
    toast.success(`${selectedIds.length} rule(s) ${action}`)
    setSelectedIds([])
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Dynamic QR Rules - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></div>
        <div className="grid grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unable to load Dynamic QR Rules</p>
          <p className="text-[10px] text-gray-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">Retry</button>
            <button className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Empty State (when no rules at all) ── */
  if (RULES.length === 0) {
    return (
      <div className="space-y-6">
        <Helmet><title>Dynamic QR Rules - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Dynamic QR Rules</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Dynamic QR Rules Found</p>
          <p className="text-[10px] text-gray-500 mb-5 max-w-sm mx-auto">Create your first QR rule to start delivering dynamic experiences. The QR code stays constant; what users see evolves automatically.</p>
          <button onClick={() => toast.success('New rule creation started')} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 flex items-center gap-1.5 mx-auto"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Create QR Rule</button>
        </div>
      </div>
    )
  }

  /* ── Rule Workspace (full-width when rule selected) ── */
  if (selectedRule) {
    return (
      <div className="space-y-6">
        <Helmet><title>{selectedRule.name} - Dynamic QR Rules - MCOM VCard</title></Helmet>
        {previewRule && <PreviewModal rule={previewRule} onClose={() => setPreviewRule(null)} />}
        <div className="flex items-center gap-2">
          <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <Link to="/admin/vcard-management/dynamic-qr" className="text-[10px] text-orange-600 hover:underline">Dynamic QR Rules</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">{selectedRule.name}</h1>
        </div>
        <RuleWorkspace rule={selectedRule} onClose={() => setSelectedRule(null)} />
      </div>
    )
  }

  /* ── Dashboard / List View ── */
  return (
    <div className="space-y-6">
      <Helmet><title>Dynamic QR Rules - VCard Management - MCOM VCard</title></Helmet>

      {previewRule && <PreviewModal rule={previewRule} onClose={() => setPreviewRule(null)} />}

      {/* Breadcrumb + Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Dynamic QR Rules</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">The QR code never changes. The destination behind it does. Manage every rule, schedule, and trigger from here.</p>
          </div>
          <button onClick={() => toast.success('New rule creation started')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 flex items-center gap-1.5 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create QR Rule
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="Total Dynamic QR Rules" value={String(RULES.length)} sub={`${activeRules} Active · ${scheduledRules} Scheduled · ${expiredRules} Expired · ${pausedRules} Paused`} color="text-gray-900 dark:text-white" badge={`${activeRules} Active`} />
        <KpiCard label="Total QR Codes" value={String(RULES.length)} sub={`${bizVCardQRCodes} Biz VCard · ${conVCardQRCodes} Con VCard · ${bizCardQRCodes} Biz Card · ${conCardQRCodes} Con Card`} color="text-blue-600" />
        <KpiCard label="QR Activity" value={totalScans.toLocaleString()} sub={`${uniqueScans.toLocaleString()} unique · ${todayScans} today · ${weeklyScans} this week · ${monthlyScans} this month`} color="text-green-600" />
        <KpiCard label="Scheduled Changes" value={String(changesToday + changesThisWeek)} sub={`${changesToday} changing today · ${changesThisWeek} this week · ${expiringSoon} expiring soon`} color="text-purple-600" />
        <KpiCard label="Failed Rules" value={String(invalidDestinations + brokenRedirects + disabledRules)} sub={`${invalidDestinations} invalid destinations · ${brokenRedirects} broken redirects · ${disabledRules} disabled`} color="text-red-600" />
      </div>

      {/* Global Defaults Collapsible */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 dark:hover:bg-gray-750">
          <span>Global Default Rules</span>
          <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </summary>
        <div className="mt-3"><GlobalDefaultsSection /></div>
      </details>

      {/* Filters + Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search rule name, QR ID, business, consumer, card ID, destination..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="w-32"><FilterSelect label="QR Type" value={qrTypeFilter} options={QR_TYPES} onChange={setQrTypeFilter} /></div>
            <div className="w-28"><FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} /></div>
            <div className="w-32"><FilterSelect label="Trigger" value={triggerFilter} options={TRIGGER_TYPES} onChange={setTriggerFilter} /></div>
            <div className="w-28"><FilterSelect label="Date" value={dateFilter} options={DATE_FILTERS} onChange={setDateFilter} /></div>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] text-gray-500">{selectedIds.length} selected</span>
            <button onClick={() => bulkAction('paused')} className="px-2 py-1 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded-lg hover:bg-amber-100">Pause</button>
            <button onClick={() => bulkAction('resumed')} className="px-2 py-1 text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100">Resume</button>
            <button onClick={() => bulkAction('archived')} className="px-2 py-1 text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100">Archive</button>
            <button onClick={() => bulkAction('duplicated')} className="px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100">Duplicate</button>
            <button onClick={() => bulkAction('exported')} className="px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-50 dark:bg-gray-500/10 rounded-lg hover:bg-gray-100">Export</button>
            <button onClick={() => bulkAction('scheduled for activation')} className="px-2 py-1 text-[10px] font-medium text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg hover:bg-cyan-100">Schedule Activation</button>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            <p className="text-sm font-medium text-gray-500 mb-1">No matching rules</p>
            <p className="text-[10px] text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); setQrTypeFilter(''); setStatusFilter(''); setTriggerFilter(''); setDateFilter('') }} className="px-4 py-2 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">Clear Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-2 py-1.5 font-medium w-8"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-gray-300" /></th>
                  <th className="text-left px-2 py-1.5 font-medium">Rule Name</th>
                  <th className="text-left px-2 py-1.5 font-medium">QR Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">Linked Object</th>
                  <th className="text-left px-2 py-1.5 font-medium">Destination Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-left px-2 py-1.5 font-medium">Current Destination</th>
                  <th className="text-left px-2 py-1.5 font-medium">Next Scheduled Change</th>
                  <th className="text-left px-2 py-1.5 font-medium">Priority</th>
                  <th className="text-left px-2 py-1.5 font-medium">Last Updated</th>
                  <th className="text-left px-2 py-1.5 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer" onClick={() => setSelectedRule(r)}>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleId(r.id)} className="rounded border-gray-300" /></td>
                    <td className="px-2 py-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.name}</td>
                    <td className="px-2 py-2"><span className="px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-[9px] font-medium">{r.qrType}</span></td>
                    <td className="px-2 py-2">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{r.linkedObject}</p>
                        <p className="text-[9px] text-gray-400">{r.linkedId}</p>
                      </div>
                    </td>
                    <td className="px-2 py-2"><span className="text-gray-600 dark:text-gray-400">{r.destinationType}</span></td>
                    <td className="px-2 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-2 py-2 max-w-[160px]"><span className="text-gray-600 dark:text-gray-400 truncate block" title={r.currentDestination}>{r.currentDestination}</span></td>
                    <td className="px-2 py-2"><span className={`text-gray-500 ${r.nextScheduledChange ? 'font-medium text-blue-600' : ''}`}>{r.nextScheduledChange || '—'}</span></td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{r.priority}</span>
                        <span className="text-[8px] text-gray-400 hidden lg:inline">· {PRIORITY_LABELS[r.priority] || 'Custom'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{r.lastUpdated}</td>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedRule(r)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500" title="Edit"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => setPreviewRule(r)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500" title="Preview Scan"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button onClick={() => { toast.success(`Rule "${r.name}" ${r.status === 'Active' ? 'paused' : 'resumed'}`) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-500" title={r.status === 'Active' ? 'Pause' : 'Resume'}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={r.status === 'Active' ? 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' : 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'} /></svg></button>
                        <button onClick={() => { toast.success(`Rule "${r.name}" duplicated`) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-purple-500" title="Duplicate"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-3 px-1">
              <span className="text-[10px] text-gray-400">{filtered.length} of {RULES.length} rules</span>
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
