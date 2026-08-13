import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  loadMembershipPricing, saveMembershipPricing, resetMembershipPricing,
  type MembershipPricingState,
} from '../../../services/membershipPricingStore'
import {
  loadConsumerPricing, saveConsumerPricing, resetConsumerPricing,
} from '../../../services/consumerPricingStore'

type Scope = 'business' | 'consumer'

const loadScope = (scope: Scope): MembershipPricingState =>
  scope === 'business' ? loadMembershipPricing() : loadConsumerPricing()
const saveScope = (scope: Scope, state: MembershipPricingState): MembershipPricingState =>
  scope === 'business' ? saveMembershipPricing(state) : saveConsumerPricing(state)
const resetScope = (scope: Scope): MembershipPricingState =>
  scope === 'business' ? resetMembershipPricing() : resetConsumerPricing()
import { PlansPricingSection } from '../../../components/admin/pricing/PlansPricingSection'
import { EntitlementsSection } from '../../../components/admin/pricing/EntitlementsSection'
import { PromotionsSection } from '../../../components/admin/pricing/PromotionsSection'
import { UpgradesSection } from '../../../components/admin/pricing/UpgradesSection'
import { SettingsSection } from '../../../components/admin/pricing/SettingsSection'

/* ------------------------------------------------------------------ */
/*  Admin — Pricing (/admin/membership/pricing)                        */
/*  One clean page for the whole membership & pricing area. Everything  */
/*  lives inside it: plans & pricing (with live preview), entitlements, */
/*  promotions, upgrades/downgrades and settings. The old separate      */
/*  pages redirect here with a ?section= deep link.                     */
/* ------------------------------------------------------------------ */

type Section = 'plans' | 'entitlements' | 'promotions' | 'upgrades' | 'settings'

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'plans', label: 'Plans & Pricing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'entitlements', label: 'Entitlements', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'promotions', label: 'Promotions', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'upgrades', label: 'Upgrades & Downgrades', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

const toSection = (s: string | null): Section => (s && NAV.some(n => n.id === s) ? (s as Section) : 'plans')

export default function MembershipPricingPage() {
  const [params, setParams] = useSearchParams()
  const [section, setSection] = useState<Section>(() => toSection(params.get('section')))
  const [scope, setScope] = useState<Scope>(() => (params.get('scope') === 'consumer' ? 'consumer' : 'business'))
  const [state, setState] = useState<MembershipPricingState>(() => loadScope(scope))
  const [dirty, setDirty] = useState(false)

  const switchSection = (s: Section) => {
    setSection(s)
    setParams(s === 'plans' ? { scope } : { section: s, scope }, { replace: true })
  }

  const switchScope = (next: Scope) => {
    setScope(next)
    setState(loadScope(next))
    setDirty(false)
    setParams(section === 'plans' ? { scope: next } : { section, scope: next }, { replace: true })
  }

  const update = (fn: (s: MembershipPricingState) => MembershipPricingState) => {
    setState(prev => fn(prev))
    setDirty(true)
  }

  const handleSave = () => {
    const next = saveScope(scope, state)
    setState(next)
    setDirty(false)
    toast.success(scope === 'business' ? 'Business changes saved — live on the public pricing page' : 'Consumer changes saved — live on the consumer plans')
  }

  const handleReset = () => {
    const fresh = resetScope(scope)
    setState(fresh)
    setDirty(true)
    toast.success(scope === 'business' ? 'Reset to default business pricing' : 'Reset to default consumer pricing')
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Pricing &amp; Plans - Membership - MCOM VCard</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Pricing &amp; Plans</h1>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">One place to manage plans, entitlements, promotions, plan changes and settings for businesses and consumers.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 p-0.5 mr-1">
            <button onClick={() => switchScope('business')} className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${scope === 'business' ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Business</button>
            <button onClick={() => switchScope('consumer')} className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${scope === 'consumer' ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Consumers</button>
          </div>
          <span className="text-[10px] text-gray-400 mr-1">{scope === 'consumer' ? 'Consumer' : 'Business'} · Last updated {state.updatedAt} · {state.currency}</span>
          {dirty && <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">Unsaved changes</span>}
          <button onClick={handleReset} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
          <Link to={scope === 'consumer' ? '/membership?audience=consumer' : '/membership'} className="px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-500/40 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10">View Public Page</Link>
          <button onClick={handleSave} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save {scope === 'consumer' ? 'Consumer' : 'Pricing'}</button>
        </div>
      </div>

      {/* Mobile section tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => switchSection(n.id)}
            className={`px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${section === n.id ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {n.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Left rail */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-4 space-y-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => switchSection(n.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                  section === n.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={n.icon} /></svg>
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {section === 'plans' && <PlansPricingSection state={state} update={update} />}
          {section === 'entitlements' && <EntitlementsSection state={state} update={update} />}
          {section === 'promotions' && <PromotionsSection />}
          {section === 'upgrades' && <UpgradesSection />}
          {section === 'settings' && <SettingsSection state={state} update={update} />}
        </main>
      </div>
    </div>
  )
}
