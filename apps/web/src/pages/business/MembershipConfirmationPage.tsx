import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { loadMembershipPricing, type PlanTier } from '../../services/membershipPricingStore'
import { getRuleValue } from '../../services/membershipEnforcement'
import { businessService, type Business, type Membership, type Season, type Template } from '../../services/businessApi'

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try { return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '—' }
}
function resolveLevel(m: Membership | null): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  const n = m?.tier?.name?.toLowerCase() ?? ''
  if (n.includes('platinum')) return 'Platinum'; if (n.includes('gold')) return 'Gold'; if (n.includes('silver')) return 'Silver'; return 'Bronze'
}
function resolveTier(m: Membership | null): PlanTier {
  const n = m?.tier?.name?.toLowerCase() ?? ''
  if (n.includes('pro+')) return 'Pro+'; if (n.includes('pro')) return 'Pro'; return 'Normal'
}

export default function MembershipConfirmationPage() {
  const navigate = useNavigate()
  const [business, setBusiness] = useState<Business | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [season, setSeason] = useState<Season | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([businessService.getMyBusinesses(), businessService.getMyMemberships(), businessService.getSeasons(), businessService.listTemplates()])
      .then(([businesses, memberships, seasons, templateList]) => {
        if (cancelled) return
        setBusiness(businesses[0] ?? null)
        setMembership(memberships.find((m) => m.status === 'active') ?? memberships[0] ?? null)
        setSeason(seasons.find((s) => s.status === 'active') ?? seasons[0] ?? null)
        setTemplates(templateList)
      }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const state = loadMembershipPricing()
  const planLevel = resolveLevel(membership)
  const tier = resolveTier(membership)
  const plan = state.plans.find((p) => p.id === planLevel)
  const planName = membership?.tier?.name ?? 'No active plan'
  const availableTemplates = templates.filter((t) => t.status === 'published' && t.is_business).length
  const features = (plan?.features ?? []).filter((f) => f.scope === 'All' || f.scope === 'Public page')
  const summary = [
    { label: 'Membership', value: planName }, { label: 'Season', value: season?.name ?? '—' },
    { label: 'Start date', value: fmtDate(membership?.started_at) }, { label: 'End date', value: fmtDate(membership?.expires_at) },
    { label: 'Membership status', value: membership?.status ?? 'Inactive' }, { label: 'Available templates', value: `${availableTemplates} templates` },
    { label: 'Available business cards', value: getRuleValue(state, planLevel, 'Business Cards', tier) ?? '—' },
    { label: 'Available consumer cards', value: getRuleValue(state, planLevel, 'Consumer Cards', tier) ?? '—' },
    { label: 'Friends & Family allowance', value: `${getRuleValue(state, planLevel, 'Friends & Family', tier) ?? '—'} allocations` },
  ]

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <Helmet><title>Membership Confirmation - My Business - MCOMVCard</title></Helmet>
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-500/30 shadow-sm p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
        <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{loading ? 'Loading your membership…' : membership ? 'Membership active' : 'Payment successful — welcome'}</h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{membership ? <>Your <span className="font-semibold text-gray-900 dark:text-white">{planName}</span> membership is active for <span className="font-semibold text-gray-900 dark:text-white">{business?.name ?? 'your business'}</span>.</> : 'Choose a plan to activate your business membership.'}</p>
      </div>
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Membership confirmed</h2>
        <p className="text-[11px] text-gray-400 mt-0.5 mb-4">{planLevel} · {tier} tier — everything below is included with your membership.</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">{summary.map((s) => <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 px-3.5 py-3"><dt className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{s.label}</dt><dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{s.value}</dd></div>)}</dl>
      </div>
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Available features</h3>
        {features.length === 0 ? <p className="mt-3 text-xs text-gray-400">Feature details will appear once your plan catalogue is configured.</p> : <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">{features.map((f, i) => <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"><svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>{f.text}</li>)}</ul>}
      </div>
      <button onClick={() => navigate('/b/dashboard')} className="w-full py-3.5 min-h-[48px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity">Continue to Dashboard</button>
      <button onClick={() => navigate('/b/membership/plans')} className="w-full py-3 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold">View Plans &amp; Pricing</button>
    </div>
  )
}
