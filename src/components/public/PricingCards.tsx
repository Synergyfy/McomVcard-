import { useState } from 'react'
import type { BillingCycle, MembershipPricingState, PlanLevel, PlanTier } from '../../services/membershipPricingStore'
import { formatPounds } from '../../services/membershipPricingStore'

/* ------------------------------------------------------------------ */
/*  Membership pricing primitives.                                     */
/*                                                                     */
/*  Hierarchy used everywhere:                                         */
/*    Level   — Bronze / Silver / Gold / Platinum                      */
/*    Access  — Standard (Normal) / Pro / Pro+                         */
/*                                                                     */
/*  Pro+ is presented as the annual membership option, so its card     */
/*  always quotes the annual price regardless of the billing toggle.   */
/*  No prices or durations are hard-coded here — everything renders    */
/*  from the admin's membershipPricingStore configuration.             */
/* ------------------------------------------------------------------ */

export type PricingAudience = 'business' | 'consumer'

export const ACCESS_META: Record<PlanTier, { label: string; sub: string; annual?: boolean; blurb: string }> = {
  Normal: { label: 'Standard', sub: 'Access', blurb: 'The entry access membership for this level.' },
  Pro: { label: 'Pro', sub: 'Enhanced Access', blurb: 'Everything in Standard, plus additional Pro benefits.' },
  'Pro+': { label: 'Pro+', sub: 'Annual Membership', annual: true, blurb: 'The full Pro+ membership for the year — strongest value and highest access.' },
}

export const TIER_LABEL: Record<PlanTier, string> = {
  Normal: 'Standard',
  Pro: 'Pro',
  'Pro+': 'Pro+',
}

const PLAN_STYLES: Record<string, { chip: string; ring: string; badge: string; gradient: string; selected: string }> = {
  Bronze: {
    chip: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/40',
    badge: 'from-amber-500 to-amber-700',
    gradient: 'from-amber-50 to-amber-100/60 dark:from-amber-500/10 dark:to-amber-500/5',
    selected: 'border-amber-500 ring-2 ring-amber-200',
  },
  Silver: {
    chip: 'bg-slate-200 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-200 dark:ring-slate-500/40',
    badge: 'from-slate-400 to-slate-600',
    gradient: 'from-slate-50 to-slate-100/60 dark:from-slate-500/10 dark:to-slate-500/5',
    selected: 'border-slate-500 ring-2 ring-slate-200',
  },
  Gold: {
    chip: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    ring: 'ring-yellow-300 dark:ring-yellow-500/40',
    badge: 'from-yellow-400 to-amber-600',
    gradient: 'from-yellow-50 to-amber-50/60 dark:from-yellow-500/10 dark:to-amber-500/5',
    selected: 'border-yellow-500 ring-2 ring-yellow-300',
  },
  Platinum: {
    chip: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-200 dark:ring-blue-500/40',
    badge: 'from-blue-500 to-indigo-700',
    gradient: 'from-blue-50 to-indigo-50/60 dark:from-blue-500/10 dark:to-indigo-500/5',
    selected: 'border-blue-500 ring-2 ring-blue-300',
  },
}

export function planStyle(level: PlanLevel) {
  return PLAN_STYLES[level] ?? PLAN_STYLES.Bronze
}

/* ── Business / Consumer switch ──────────────────────────────────── */

export function AudienceSwitch({ audience, onChange }: { audience: PricingAudience; onChange: (a: PricingAudience) => void }) {
  const options: { id: PricingAudience; label: string; note: string }[] = [
    { id: 'business', label: 'Business', note: 'I own or run a business' },
    { id: 'consumer', label: 'Consumer', note: 'Joining as an individual' },
  ]
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            audience === o.id ? 'bg-orange-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
          }`}
        >
          {o.label}
          <span className={`block text-[8px] font-medium ${audience === o.id ? 'text-white/80' : 'text-gray-400'}`}>{o.note}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Step 1 — choose the membership level ────────────────────────── */

export function LevelSelector({ state, level, onChange }: {
  state: MembershipPricingState
  level: PlanLevel
  onChange: (l: PlanLevel) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {state.plans.map(plan => {
        const st = planStyle(plan.id)
        const active = level === plan.id
        return (
          <button
            key={plan.id}
            onClick={() => onChange(plan.id)}
            className={`relative px-5 py-3 min-h-[52px] rounded-2xl text-sm font-bold transition-all duration-200 border bg-white dark:bg-gray-800 ${
              active
                ? `${st.selected} text-gray-900 dark:text-white shadow-md`
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className={`inline-flex items-center gap-2`}>
              <span className={`w-2.5 h-2.5 rounded-full ${active ? `bg-gradient-to-r ${st.badge}` : 'bg-gray-300 dark:bg-gray-600'}`} />
              {plan.name}
            </span>
            {plan.popular && (
              <span className={`absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r ${st.badge} text-white text-[8px] font-bold`}>
                Popular
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Step 1 alt — membership level as a dropdown selector ─────────── */

export function LevelDropdown({ state, level, onChange }: {
  state: MembershipPricingState
  level: PlanLevel
  onChange: (l: PlanLevel) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = state.plans.find(p => p.id === level) ?? state.plans[0]
  const st = planStyle(selected.id)

  const choose = (l: PlanLevel) => {
    onChange(l)
    setOpen(false)
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[52px] rounded-2xl border bg-white dark:bg-gray-800 text-sm font-bold transition-all duration-200 shadow-sm ${
          open
            ? 'border-transparent ring-2 ring-orange-300'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <span className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${st.badge}`} />
          <span className="text-gray-900 dark:text-white">{selected.name}</span>
          <span className="hidden sm:inline text-[10px] font-semibold text-gray-400 truncate max-w-[200px]">{selected.tagline}</span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden animate-fadeIn">
            {state.plans.map(plan => {
              const pst = planStyle(plan.id)
              const active = plan.id === level
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => choose(plan.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-orange-50 dark:bg-orange-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${pst.badge}`} />
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm font-bold ${active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                      {plan.name}
                    </span>
                    <span className="block text-[10px] text-gray-400 truncate">{plan.tagline}</span>
                  </span>
                  {plan.popular && (
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full bg-gradient-to-r ${pst.badge} text-white text-[8px] font-bold`}>
                      Popular
                    </span>
                  )}
                  {active && (
                    <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Step 2 — choose the access level (Standard / Pro / Pro+) ────── */

function accessPrice(plan: MembershipPricingState['plans'][number], tier: PlanTier, billing: BillingCycle): { price: number; periodLabel: string; annual: boolean } {
  if (tier === 'Pro+') {
    return { price: plan.tiers['Pro+'].annual, periodLabel: '/year', annual: true }
  }
  const price = plan.tiers[tier][billing]
  const periodLabel = billing === 'quarterly' ? '/90 days' : billing === 'semiannual' ? '/180 days' : billing === 'annual' ? '/year' : '/month'
  return { price, periodLabel, annual: false }
}

export function AccessCards({ state, level, tier, billing, onSelect, onChoose, selectedOnly }: {
  state: MembershipPricingState
  level: PlanLevel
  tier: PlanTier
  billing: BillingCycle
  onSelect?: (t: PlanTier) => void
  onChoose?: (level: PlanLevel, tier: PlanTier) => void
  selectedOnly?: PlanTier
}) {
  const plan = state.plans.find(p => p.id === level) ?? state.plans[0]
  const st = planStyle(plan.id)
  const tiers: PlanTier[] = ['Normal', 'Pro', 'Pro+']

  const rules = plan.rules.filter(r => r.scope === 'All' || r.scope === 'Public page')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {tiers.map(t => {
        const meta = ACCESS_META[t]
        const { price, periodLabel, annual } = accessPrice(plan, t, billing)
        const active = (selectedOnly ?? tier) === t
        const monthlyEquivalent = annual
          ? Math.round(price / 12)
          : billing === 'annual'
            ? Math.round(price / 12)
            : billing === 'quarterly'
              ? Math.round(price / 3)
              : billing === 'semiannual'
                ? Math.round(price / 6)
                : price

        return (
          <div
            key={t}
            className={`relative flex flex-col rounded-2xl border bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
              active ? `border-transparent ring-2 ${st.ring}` : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {annual && (
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-full text-center py-1 bg-gradient-to-r ${st.badge} text-white text-[10px] font-bold`}>
                Annual Membership
              </span>
            )}

            <button
              type="button"
              onClick={() => onSelect?.(t)}
              className={`text-left p-5 ${annual ? 'pt-8' : 'pt-5'} bg-gradient-to-br ${st.gradient}`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${st.chip}`}>{meta.label}</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-400">{meta.sub}</span>
              </div>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed min-h-[32px]">{meta.blurb}</p>

              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatPounds(price)}</span>
                <span className="text-[10px] text-gray-400 mb-1">{periodLabel}</span>
              </div>
              <p className="text-[9px] text-emerald-600 mt-0.5">
                {annual ? '12 months access · ' : ''}{formatPounds(monthlyEquivalent)}/mo equivalent
              </p>
            </button>

            <div className="p-5 pt-4 flex-1 flex flex-col">
              {t !== 'Normal' && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Everything in {t === 'Pro' ? 'Standard' : 'Pro'}, plus
                </p>
              )}
              <ul className="space-y-2 flex-1">
                {rules.map(r => (
                  <li key={r.label} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-gray-600 dark:text-gray-300">{r.label}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{r.values[t]}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onChoose?.(plan.id, t)}
                className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  annual
                    ? `bg-gradient-to-r ${st.badge} text-white hover:opacity-90 shadow-md`
                    : active
                      ? `bg-gradient-to-r ${st.badge} text-white hover:opacity-90 shadow-md`
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {annual ? `Get ${plan.name} ${meta.label} — Annual` : active ? `Choose ${plan.name} ${meta.label}` : `Select ${meta.label}`}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Step 2 alt — comparison of the three access levels for a level ── */

export function AccessComparison({ state, level }: { state: MembershipPricingState; level: PlanLevel }) {
  const plan = state.plans.find(p => p.id === level) ?? state.plans[0]
  const rules = plan.rules.filter(r => r.scope === 'All' || r.scope === 'Public page')
  const tiers: PlanTier[] = ['Normal', 'Pro', 'Pro+']
  const annualRow = { label: 'Annual membership', values: { Normal: '—', Pro: '—', 'Pro+': '✓' } as Record<PlanTier, string> }
  const rows = [...rules.map(r => ({ label: r.label, values: r.values })), annualRow]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] min-w-[520px]">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-gray-700">
            <th className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-200">Access</th>
            {tiers.map(t => (
              <th key={t} className={`py-2.5 pr-4 font-semibold ${t === 'Pro+' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {TIER_LABEL[t]}
                <span className="block text-[8px] font-medium text-gray-400">{ACCESS_META[t].sub}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{row.label}</td>
              {tiers.map(t => (
                <td key={t} className={`py-2.5 pr-4 font-medium ${row.label === 'Annual membership' && row.values[t] === '✓' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {row.values[t] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Billing toggle (Standard / Pro only) ────────────────────────── */

export function BillingToggle({ billing, onChange }: { billing: BillingCycle; onChange: (b: BillingCycle) => void }) {
  const options: { id: BillingCycle; label: string; note?: string }[] = [
    { id: 'quarterly', label: '90 days', note: 'Access' },
    { id: 'semiannual', label: '180 days', note: 'Access' },
    { id: 'annual', label: 'Annual', note: '12 months' },
  ]
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${billing === o.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
        >
          {o.label}
          {o.note && <span className={`block text-[8px] font-medium ${billing === o.id ? 'text-white/70 dark:text-gray-500' : 'text-gray-400'}`}>{o.note}</span>}
        </button>
      ))}
    </div>
  )
}

/* ── Legacy tier tabs (kept for admin preview + subscription page) ── */

export function PricingTierTabs({ tier, onChange }: { tier: PlanTier; onChange: (t: PlanTier) => void }) {
  const tiers: PlanTier[] = ['Normal', 'Pro', 'Pro+']
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {tiers.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${tier === t ? 'bg-orange-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
        >
          {TIER_LABEL[t]}
          <span className={`block text-[8px] font-medium ${tier === t ? 'text-white/80' : 'text-gray-400'}`}>{ACCESS_META[t].sub}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Legacy 4-level cards (kept for admin preview + subscription) ── */

export function PricingCard({ state, tier, billing, onChoose, currentPlan }: {
  state: MembershipPricingState
  tier: PlanTier
  billing: BillingCycle
  onChoose?: (name: string) => void
  currentPlan?: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {state.plans.map(plan => {
        const st = PLAN_STYLES[plan.id] ?? PLAN_STYLES.Bronze
        const p = plan.tiers[tier]
        const price = p[billing]
        const periodLabel = billing === 'quarterly' ? '/90 days' : billing === 'semiannual' ? '/180 days' : billing === 'annual' ? '/year' : '/month'
        const monthlyEquivalent = billing === 'annual' ? Math.round(price / 12) : billing === 'quarterly' ? Math.round(price / 3) : billing === 'semiannual' ? Math.round(price / 6) : price
        const isCurrent = !!currentPlan && plan.name === currentPlan
        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-6 ${
              plan.popular ? `border-transparent ring-2 ${st.ring}` : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {plan.popular && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${st.badge} text-white text-[10px] font-bold shadow`}>
                Most Popular
              </span>
            )}
            {isCurrent && (
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold shadow whitespace-nowrap">
                Current Plan
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.chip}`}>{plan.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400">{TIER_LABEL[tier]}</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed min-h-[48px]">{plan.tagline}</p>
            <div className="mt-4 mb-1 flex items-end gap-1">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatPounds(price)}</span>
              <span className="text-[10px] text-gray-400 mb-1">{periodLabel}</span>
            </div>
            {billing === 'quarterly' && (
              <p className="text-[9px] text-emerald-600 mb-2">90 days access · £{monthlyEquivalent}/mo</p>
            )}
            {billing === 'semiannual' && (
              <p className="text-[9px] text-emerald-600 mb-2">180 days access · £{monthlyEquivalent}/mo</p>
            )}
            {p.trialDays > 0 && (
              <p className="text-[9px] text-gray-400 mb-2">{p.trialDays}-day free trial{p.setupFee > 0 ? ` · ${formatPounds(p.setupFee)} setup` : ''}</p>
            )}
            <ul className="mt-3 mb-6 space-y-2 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onChoose?.(plan.name)}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                plan.popular
                  ? `bg-gradient-to-r ${st.badge} text-white hover:opacity-90 shadow-md`
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Choose {plan.name}
            </button>
          </div>
        )
      })}
    </div>
  )
}
