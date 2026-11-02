import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import MyPlanCard from '../../components/business/MyPlanCard'
import { businessService, type Membership, type MembershipBenefit, type Season } from '../../services/businessApi'

export default function MembershipPage() {
  const navigate = useNavigate()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [benefits, setBenefits] = useState<MembershipBenefit[]>([])
  const [season, setSeason] = useState<Season | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [memberships, allBenefits, seasons] = await Promise.all([businessService.getMyMemberships(), businessService.getBenefits(), businessService.getSeasons()])
        if (cancelled) return
        const active = memberships.find((m) => m.status === 'active') ?? memberships[0] ?? null
        setMembership(active); setSeason(seasons.find((s) => s.status === 'active') ?? seasons[0] ?? null)
        if (active?.tier?.id) {
          const tierBenefits = await businessService.getTierBenefits(active.tier.id)
          if (!cancelled) setBenefits(tierBenefits.length > 0 ? tierBenefits : allBenefits)
        } else if (!cancelled) setBenefits(allBenefits)
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const daysRemaining = membership?.expires_at ? Math.max(0, Math.ceil((new Date(membership.expires_at).getTime() - Date.now()) / 86400000)) : null
  const totalDays = membership?.started_at && membership?.expires_at ? Math.max(1, Math.ceil((new Date(membership.expires_at).getTime() - new Date(membership.started_at).getTime()) / 86400000)) : null
  const progress = totalDays && daysRemaining !== null ? Math.round(((totalDays - daysRemaining) / totalDays) * 100) : 0
  const seasonDays = season?.ends_at ? Math.max(0, Math.ceil((new Date(season.ends_at).getTime() - Date.now()) / 86400000)) : null

  return (
    <div className="space-y-6 animate-fadeIn max-w-lg">
      <Helmet><title>Membership - MCOMVCard</title></Helmet>
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membership</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your plan, benefits and what happens next.</p></div>
      <MyPlanCard />
      {loading ? <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">Loading your membership…</div> : (
        <>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-none">
            <div className="flex items-center justify-between"><p className="text-xs text-white/70">Current plan</p><span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wide">{membership?.status ?? 'No plan'}</span></div>
            <p className="text-3xl font-bold mt-2">{membership?.tier?.name ?? 'Choose a plan'}</p>
            <p className="text-sm text-white/80 mt-1">{membership ? `${season?.name ?? 'Membership'}${membership.expires_at ? ` · renews ${new Date(membership.expires_at).toLocaleDateString('en-GB')}` : ''}` : 'A membership unlocks your business cards, campaigns and rewards.'}</p>
            {membership && totalDays && daysRemaining !== null && <div className="mt-5"><div className="flex items-center justify-between text-xs text-white/80 mb-1.5"><span>{totalDays - daysRemaining} of {totalDays} days</span><span className="font-semibold text-white">{daysRemaining} days left</span></div><div className="h-2.5 rounded-full bg-white/25 overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div></div>}
            <div className="mt-5 flex gap-2"><button onClick={() => navigate('/plans')} className="flex-1 py-3 min-h-[44px] rounded-xl bg-white text-orange-600 text-sm font-bold">{membership ? 'Renew' : 'Choose plan'}</button><button onClick={() => navigate('/b/membership/plans')} className="flex-1 py-3 min-h-[44px] rounded-xl bg-orange-800/40 border border-white/30 text-white text-sm font-bold">Upgrade</button></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Season</p>
            {season ? <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: season.color || '#f97316' }} /><span className="text-sm font-bold text-gray-900 dark:text-white">{season.name}</span></div><span className="text-xs text-gray-500">{seasonDays === null ? '—' : `${seasonDays} days left`}</span></div> : <p className="text-xs text-gray-400">No active season right now.</p>}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2"><p className="text-sm font-bold text-gray-900 dark:text-white">Your benefits</p><p className="text-xs text-gray-500 dark:text-gray-400">Included with your {membership?.tier?.name ?? 'current'} plan</p></div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {benefits.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">No benefits configured for this plan yet.</div>}
              {benefits.map((b) => <div key={b.id} className="px-4 py-3 flex items-center justify-between gap-3"><div className="min-w-0"><span className="text-sm text-gray-900 dark:text-white">{b.name}</span>{b.description && <p className="text-[11px] text-gray-400 mt-0.5">{b.description}</p>}</div><span className={`text-xs font-semibold ${b.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>{b.status === 'active' ? 'Active' : 'Included'}</span></div>)}
            </div>
          </div>
          <button onClick={() => navigate('/b/membership/plans')} className="w-full py-3.5 min-h-[48px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold">Compare Plans</button>
          <p className="text-xs text-gray-400 text-center">Membership is managed by the Admin dashboard. Contact MCOM Solutions to change your plan, or <Link to="/plans" className="text-orange-600 font-semibold">checkout here</Link>.</p>
        </>
      )}
    </div>
  )
}
