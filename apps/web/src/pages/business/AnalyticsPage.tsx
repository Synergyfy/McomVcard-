import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  businessService,
  type BusinessPermissions,
  type DashboardStats,
  type Membership,
  type MembershipBenefit,
} from '../../services/businessApi'
import { useCapabilities } from '../../hooks/useCapabilities'

interface SeriesPoint { label: string; value: number }
interface AnalyticsSeries { key: string; label: string; icon: string; color: string; total: string; points: SeriesPoint[] }

const ICONS = {
  views: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  shares: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  rewards: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  customers: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  appointments: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  qr: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h.01M5 20H4m0-4h.01M6 4h.01M8 4h.01M4 8h.01M20 8h.01M20 4h.01M20 12h.01',
}

function fmt(n: number): string { return n.toLocaleString('en-GB') }

function groupPoints(rows: { date: string; eventType: string; count: number }[], types: string[], days = 30): SeriesPoint[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    if (!types.includes(row.eventType)) continue
    const key = new Date(row.date).toISOString().slice(0, 10)
    map.set(key, (map.get(key) ?? 0) + row.count)
  }
  const points: SeriesPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    points.push({ label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), value: map.get(key) ?? 0 })
  }
  return points
}

export default function AnalyticsPage() {
  const { capabilities } = useCapabilities()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeseries, setTimeseries] = useState<{ date: string; eventType: string; count: number }[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [allBenefits, setAllBenefits] = useState<MembershipBenefit[]>([])
  const [tierBenefits, setTierBenefits] = useState<MembershipBenefit[]>([])
  const [permissions, setPermissions] = useState<BusinessPermissions | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [s, t, memberships, benefits, perms] = await Promise.all([
          businessService.getDashboardStats(),
          businessService.getAnalyticsTimeseries(30),
          businessService.getMyMemberships(),
          businessService.getBenefits(),
          businessService.getBusinessPermissions(),
        ])
        if (cancelled) return
        setStats(s); setTimeseries(t); setAllBenefits(benefits); setPermissions(perms)
        const active = memberships.find((m) => m.status === 'active') ?? memberships[0] ?? null
        setMembership(active)
        if (active?.tier?.id) {
          const tb = await businessService.getTierBenefits(active.tier.id)
          if (!cancelled) setTierBenefits(tb)
        }
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const series: AnalyticsSeries[] = useMemo(() => {
    const viewPoints = groupPoints(timeseries, ['card_view', 'profile_view', 'view'])
    const scanPoints = groupPoints(timeseries, ['card_scan', 'qr_scan', 'scan'])
    const sharePoints = groupPoints(timeseries, ['card_share', 'share'])
    return [
      { key: 'views', label: 'Views', icon: ICONS.views, color: 'from-orange-500 to-amber-500', total: fmt(viewPoints.reduce((a, p) => a + p.value, 0)), points: viewPoints },
      { key: 'qrScans', label: 'QR scans', icon: ICONS.qr, color: 'from-violet-500 to-purple-600', total: fmt(scanPoints.reduce((a, p) => a + p.value, 0)), points: scanPoints },
      { key: 'shares', label: 'Shares', icon: ICONS.shares, color: 'from-blue-500 to-blue-600', total: fmt(stats?.totalShares ?? 0), points: sharePoints },
      { key: 'appointments', label: 'Bookings', icon: ICONS.appointments, color: 'from-cyan-500 to-cyan-600', total: fmt(stats?.totalAppointments ?? 0), points: groupPoints(timeseries, []) },
      { key: 'rewards', label: 'Rewards redeemed', icon: ICONS.rewards, color: 'from-purple-500 to-purple-600', total: fmt(stats?.totalRewardsRedeemed ?? 0), points: groupPoints(timeseries, []) },
      { key: 'customers', label: 'Customers', icon: ICONS.customers, color: 'from-emerald-500 to-green-600', total: fmt(stats?.totalAppointments ?? 0), points: groupPoints(timeseries, []) },
    ]
  }, [timeseries, stats])

  const benefits = tierBenefits.length > 0 ? tierBenefits : allBenefits
  const membershipDays = membership?.expires_at ? Math.max(0, Math.ceil((new Date(membership.expires_at).getTime() - Date.now()) / 86400000)) : null
  const entitlementLimit = (key: string): string => {
    const capability = capabilities?.capabilities[key]
    if (!capability) return 'Unlimited'
    if (capability.mode === 'unlimited') return 'Unlimited'
    if (capability.mode === 'disabled') return '0'
    return String(capability.limit ?? 0)
  }
  const entitlements = permissions ? [
    { resource: 'Business VCards', used: permissions.allocated.vcards, limit: entitlementLimit('maxVCards') },
    { resource: 'Business Cards', used: permissions.allocated.business_cards, limit: entitlementLimit('maxBusinessCards') },
    { resource: 'Friends & Family', used: 0, limit: entitlementLimit('maxFriendsFamily') },
    { resource: 'QR routing rules', used: 0, limit: entitlementLimit('qrRoutingRules') },
  ] : []

  return (
    <div className="space-y-6 animate-fadeIn">
      <Helmet><title>Analytics - MCOMVCard</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Swipe through the metrics that matter.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">Loading your analytics…</div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {series.map((s) => {
              const max = Math.max(1, ...s.points.map((p) => p.value))
              return (
                <div key={s.key} className="snap-center shrink-0 w-[85%] max-w-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{s.total}</p>
                  <div className="flex items-end justify-between gap-1 mt-5 h-28">
                    {s.points.slice(-14).map((p, index) => (
                      <div key={`${p.label}-${index}`} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full rounded-md bg-gray-100 dark:bg-gray-700 flex items-end overflow-hidden" style={{ height: '100%' }}>
                          <div className={`w-full rounded-md bg-gradient-to-t ${s.color}`} style={{ height: `${(p.value / max) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-400">{p.label.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-gray-400">Swipe to see more metrics. Full reports available in Reports.</p>
        </>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Membership</p>
          </div>
          <Link to="/b/membership" className="text-xs font-semibold text-orange-600 dark:text-orange-400">View plan</Link>
        </div>
        <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Current membership</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{membership?.tier?.name ?? 'No active membership'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {membership ? `${membership.status}${membershipDays !== null ? ` · ${membershipDays} days left` : ''}${membership.expires_at ? ` · expires ${new Date(membership.expires_at).toLocaleDateString('en-GB')}` : ''}` : 'Choose a plan to unlock business features.'}
          </p>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Benefits included</p>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{benefits.length} included</span>
          </div>
          {benefits.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {benefits.slice(0, 8).map((b) => <span key={b.id} className="rounded-full bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">{b.name}</span>)}
            </div>
          ) : <p className="text-xs text-gray-400">No benefits configured yet.</p>}
        </div>
        <div className="mt-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Entitlements used</p>
          <div className="space-y-2">
            {entitlements.map((u) => {
              const limitNum = u.limit === 'Unlimited' ? null : Number(u.limit)
              const pct = limitNum === null || limitNum <= 0 ? 0 : Math.min(100, (u.used / limitNum) * 100)
              return (
                <div key={u.resource}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-600 dark:text-gray-300">{u.resource}</span>
                    <span className="text-[10px] text-gray-400">{u.used} / {u.limit}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
