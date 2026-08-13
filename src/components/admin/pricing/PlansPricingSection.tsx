import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import {
  type BillingCycle, type MembershipPricingState, type PlanTier, type PlanCard,
} from '../../../services/membershipPricingStore'
import { SYSTEM_RESOURCES, systemResource, resourceUsage } from '../../../services/membershipResources'
import { parseLimit } from '../../../services/membershipEnforcement'
import { BillingToggle, PricingCard, PricingTierTabs } from '../../public/PricingCards'

/* ------------------------------------------------------------------ */
/*  Plans & Pricing — a single comparison-table editor (Stripe-style).  */
/*  Columns are the plan cards. Tagline sits above Price; Price,        */
/*  Feature and Rule are collapsible sections, each with a title and a  */
/*  short description. The live preview below mirrors the public page.  */
/*                                                                     */
/*  Rule values are interactive: each input shows the live usage from   */
/*  the page/feature it controls, supports "Unlimited", and links to    */
/*  the page it drives.                                                 */
/* ------------------------------------------------------------------ */

const PLAN_COLORS: Record<string, string> = {
  Bronze: 'bg-amber-500',
  Silver: 'bg-slate-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-blue-600',
}

function Num({ value, onChange, prefix }: { value: number; onChange: (v: number) => void; prefix?: string }) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-[10px] text-gray-400 shrink-0">{prefix}</span>}
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="w-full min-w-[70px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400"
      />
    </div>
  )
}

const cellInput = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

const rowLabel = 'text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap'

/* ------------------------------------------------------------------ */
/*  RuleValueInput — interactive input for a rule's per-tier value.     */
/*  Shows live usage from the page it controls, supports "Unlimited",   */
/*  and links to the page it drives.                                    */
/* ------------------------------------------------------------------ */

function RuleValueInput({ label, value, onChange, tier }: {
  label: string
  value: string
  onChange: (v: string) => void
  tier: PlanTier
}) {
  const usage = resourceUsage(label)
  const limit = parseLimit(value)
  const unlimited = limit === Infinity
  const isCurrency = label.toLowerCase().includes('e-card') || label.toLowerCase().includes('face value')

  const used = usage?.used ?? 0
  const pct = !unlimited && limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const atLimit = !unlimited && limit !== null && used >= limit
  const nearLimit = !unlimited && limit !== null && used >= limit * 0.8 && !atLimit

  const usageColor = atLimit
    ? 'text-red-600 dark:text-red-400'
    : nearLimit
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400'

  const usageBarColor = atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-400' : 'bg-emerald-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-[8px] text-gray-400 w-4 shrink-0">{tier === 'Pro+' ? 'P+' : tier.slice(0, 1)}</span>
        {isCurrency ? (
          <div className="flex items-center gap-0.5 flex-1">
            <span className="text-[9px] text-gray-400 shrink-0">£</span>
            <input
              value={value.replace(/[£,\s]/g, '')}
              onChange={e => onChange(e.target.value ? `£${e.target.value}` : '')}
              placeholder="—"
              className={cellInput}
            />
          </div>
        ) : (
          <input
            value={unlimited ? 'Unlimited' : value}
            onChange={e => onChange(e.target.value)}
            placeholder="—"
            className={cellInput}
          />
        )}
        {/* Unlimited toggle */}
        <button
          type="button"
          onClick={() => onChange(unlimited ? '' : 'Unlimited')}
          title={unlimited ? 'Click to set a number' : 'Set to Unlimited'}
          className={`px-1.5 py-1 rounded text-[8px] font-bold shrink-0 transition-colors ${unlimited ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-emerald-500'}`}
        >
          ∞
        </button>
      </div>
      {/* Live usage indicator */}
      {usage && (
        <div className="flex items-center gap-1.5 pl-5">
          <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${usageBarColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-[8px] font-medium whitespace-nowrap ${usageColor}`}>
            {usage.display ? usage.display : `${used} used`}
          </span>
        </div>
      )}
    </div>
  )
}

/* Section header: title + collapsible chevron + editable description. */
function SectionHeader({ title, count, open, onToggle, description, onDescription, accent }: {
  title: string
  count?: number
  open: boolean
  onToggle: () => void
  description: string
  onDescription: (v: string) => void
  accent: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2">
      <button type="button" onClick={onToggle} className="flex items-center gap-2 text-left group">
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''} text-gray-400 group-hover:text-orange-500`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className={`w-2 h-2 rounded-full ${accent}`} />
        <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wide">{title}</span>
        {typeof count === 'number' && <span className="text-[9px] text-gray-400 font-medium">({count})</span>}
      </button>
      <input
        value={description}
        onChange={e => onDescription(e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder={`${title} description…`}
        className="flex-1 min-w-[200px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      />
    </div>
  )
}

export function PlansPricingSection({ state, update }: {
  state: MembershipPricingState
  update: (fn: (s: MembershipPricingState) => MembershipPricingState) => void
}) {
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')
  const [open, setOpen] = useState<'price' | 'feature' | 'rule' | null>(null)

  const colSpan = state.plans.length + 1
  const toggle = (k: 'price' | 'feature' | 'rule') => setOpen(prev => (prev === k ? null : k))
  const setSectionDesc = (k: 'price' | 'feature' | 'rule', v: string) =>
    update(s => ({ ...s, sections: { ...s.sections, [k]: { description: v } } }))

  const patchPlan = (id: string, fn: (p: PlanCard) => PlanCard) =>
    update(s => ({ ...s, plans: s.plans.map(p => (p.id === id ? fn(p) : p)) }))

  const newRule = () => ({ label: '', values: { Normal: '' as const, Pro: '' as const, 'Pro+': '' as const }, description: '', scope: 'All' as const })

  const setPrice = (id: string, v: number) =>
    patchPlan(id, p => ({ ...p, tiers: { ...p.tiers, [tier]: { ...p.tiers[tier], [billing]: v } } }))

  const setTierNum = (id: string, key: 'setupFee' | 'trialDays', v: number) =>
    patchPlan(id, p => ({ ...p, tiers: { ...p.tiers, [tier]: { ...p.tiers[tier], [key]: v } } }))

  const setTagline = (id: string, v: string) => patchPlan(id, p => ({ ...p, tagline: v }))

  const setFeature = (id: string, i: number, v: string) =>
    patchPlan(id, p => {
      const features = [...p.features]
      features[i] = { ...features[i], text: v }
      return { ...p, features }
    })

  const addFeatureRow = () => update(s => ({ ...s, plans: s.plans.map(p => ({ ...p, features: [...p.features, { text: '', description: '', scope: 'All' as const }] })) }))
  const removeFeatureRow = (i: number) => update(s => ({ ...s, plans: s.plans.map(p => ({ ...p, features: p.features.filter((_, x) => x !== i) })) }))

  const setRuleResource = (i: number, label: string) => {
    const res = systemResource(label)
    update(s => ({
      ...s, plans: s.plans.map(p => {
        const rules = [...p.rules]
        while (rules.length <= i) rules.push(newRule())
        rules[i] = { ...rules[i], label, description: res?.description ?? rules[i].description, scope: res?.scope ?? rules[i].scope }
        return { ...p, rules }
      })
    }))
  }

  const setRuleValue = (id: string, i: number, tier: PlanTier, value: string) =>
    patchPlan(id, p => {
      const rules = [...p.rules]
      while (rules.length <= i) rules.push(newRule())
      rules[i] = { ...rules[i], values: { ...rules[i].values, [tier]: value } }
      return { ...p, rules }
    })

  const addRuleRow = () => update(s => {
    const used = new Set(s.plans[0]?.rules.map(r => r.label) ?? [])
    const next = SYSTEM_RESOURCES.find(r => !used.has(r.label)) ?? SYSTEM_RESOURCES[0]
    return {
      ...s,
      plans: s.plans.map(p => ({
        ...p,
        rules: [...p.rules, {
          label: next?.label ?? '',
          values: { Normal: '', Pro: '', 'Pro+': '' },
          description: next?.description ?? '',
          scope: next?.scope ?? 'All',
        }],
      })),
    }
  })
  const removeRuleRow = (i: number) => update(s => ({ ...s, plans: s.plans.map(p => ({ ...p, rules: p.rules.filter((_, x) => x !== i) })) }))

  const maxFeatures = Math.max(1, ...state.plans.map(p => p.features.length))
  const maxRules = Math.max(0, ...state.plans.map(p => p.rules.length))

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Plans & Pricing</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Edit tagline, price, setup, trial, features and rules. Price, Feature and Rule are collapsible sections.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PricingTierTabs tier={tier} onChange={setTier} />
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>
      </div>

      {/* Comparison table editor */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/30">
                <th className="w-56 px-4 py-3 text-left">
                  <span className={rowLabel}>Plan</span>
                </th>
                {state.plans.map(plan => (
                  <th key={plan.id} className="min-w-[180px] px-3 py-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[plan.id] ?? 'bg-gray-400'}`} />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{plan.name}</span>
                      </span>
                      <button
                        onClick={() => patchPlan(plan.id, p => ({ ...p, popular: !p.popular }))}
                        title="Toggle 'Most Popular'"
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${plan.popular ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-orange-500'}`}
                      >
                        ★ {plan.popular ? 'Popular' : 'Mark'}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-left">
              {/* Tagline */}
              <tr className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="px-4 py-3">
                  <p className={rowLabel}>Tagline</p>
                  <p className="text-[9px] text-gray-400">One line under the plan name</p>
                </td>
                {state.plans.map(plan => (
                  <td key={plan.id} className="px-3 py-3">
                    <input value={plan.tagline} onChange={e => setTagline(plan.id, e.target.value)} placeholder="Short description…" className={cellInput} />
                  </td>
                ))}
              </tr>

              {/* Price section header */}
              <tr className="bg-gray-50/70 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                <td colSpan={colSpan} className="p-0">
                  <SectionHeader
                    title="Price"
                    open={open === 'price'}
                    onToggle={() => toggle('price')}
                    description={state.sections.price.description}
                    onDescription={v => setSectionDesc('price', v)}
                    accent="bg-orange-500"
                  />
                </td>
              </tr>
              {open === 'price' && (
                <>
                  {/* Price */}
                  <tr className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-3">
                      <p className={rowLabel}>Price</p>
                      <p className="text-[9px] text-gray-400">{billing === 'quarterly' ? 'per 90 days' : billing === 'semiannual' ? 'per 180 days' : billing === 'annual' ? 'per year' : 'per month'} · {tier} tier</p>
                    </td>
                    {state.plans.map(plan => (
                      <td key={plan.id} className="px-3 py-3">
                        <Num prefix={state.currency === 'USD' ? '$' : '£'} value={plan.tiers[tier][billing]} onChange={v => setPrice(plan.id, v)} />
                      </td>
                    ))}
                  </tr>
                  {/* Setup + trial */}
                  <tr className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-3">
                      <p className={rowLabel}>Setup & trial</p>
                      <p className="text-[9px] text-gray-400">One-off setup fee and free-trial days for {tier}</p>
                    </td>
                    {state.plans.map(plan => (
                      <td key={plan.id} className="px-3 py-3 space-y-1.5">
                        <Num prefix={state.currency === 'USD' ? '$' : '£'} value={plan.tiers[tier].setupFee} onChange={v => setTierNum(plan.id, 'setupFee', v)} />
                        <Num value={plan.tiers[tier].trialDays} onChange={v => setTierNum(plan.id, 'trialDays', v)} />
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Feature section header */}
              <tr className="bg-gray-50/70 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                <td colSpan={colSpan} className="p-0">
                  <SectionHeader
                    title="Feature"
                    count={maxFeatures}
                    open={open === 'feature'}
                    onToggle={() => toggle('feature')}
                    description={state.sections.feature.description}
                    onDescription={v => setSectionDesc('feature', v)}
                    accent="bg-emerald-500"
                  />
                </td>
              </tr>
              {open === 'feature' && (
                <>
                  {Array.from({ length: maxFeatures }).map((_, i) => (
                    <tr key={`f-${i}`} className="border-b border-gray-50 dark:border-gray-700/50">
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className={rowLabel}>Feature {i + 1}</p>
                          <button
                            onClick={() => removeFeatureRow(i)}
                            disabled={maxFeatures <= 1}
                            className="text-gray-300 hover:text-red-500 disabled:opacity-30 p-0.5"
                            title="Remove this feature row"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </td>
                      {state.plans.map(plan => (
                        <td key={plan.id} className="px-3 py-2">
                          <input value={plan.features[i]?.text ?? ''} onChange={e => setFeature(plan.id, i, e.target.value)} placeholder="e.g. 50 Business VCards" className={cellInput} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-2.5">
                      <button onClick={addFeatureRow} className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add feature row
                      </button>
                    </td>
                  </tr>
                </>
              )}

              {/* Rule section header */}
              <tr className="bg-gray-50/70 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                <td colSpan={colSpan} className="p-0">
                  <SectionHeader
                    title="Rule"
                    count={maxRules}
                    open={open === 'rule'}
                    onToggle={() => toggle('rule')}
                    description={state.sections.rule.description}
                    onDescription={v => setSectionDesc('rule', v)}
                    accent="bg-blue-500"
                  />
                </td>
              </tr>
              {open === 'rule' && (
                <>
                  {Array.from({ length: maxRules }).map((_, i) => {
                    const currentLabel = state.plans[0]?.rules[i]?.label ?? ''
                    const res = systemResource(currentLabel)
                    return (
                      <tr key={`r-${i}`} className="border-b border-gray-50 dark:border-gray-700/50">
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <select
                                value={currentLabel}
                                onChange={e => setRuleResource(i, e.target.value)}
                                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                              >
                                {currentLabel && !systemResource(currentLabel) && (
                                  <option value={currentLabel}>{currentLabel} (custom)</option>
                                )}
                                {SYSTEM_RESOURCES.map(s => (
                                  <option key={s.label} value={s.label}>{s.label}</option>
                                ))}
                              </select>
                              <button onClick={() => removeRuleRow(i)} className="text-gray-300 hover:text-red-500 p-0.5 shrink-0" title="Remove this rule">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {res && (
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[9px] text-gray-400 leading-snug">{res.description}</p>
                                <span className="px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8px] font-semibold whitespace-nowrap">{res.scope}</span>
                              </div>
                            )}
                            {/* Link to the page this rule controls */}
                            {res && res.pages.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {res.pages.map((p, pi) => (
                                  <Link
                                    key={pi}
                                    to={p.href}
                                    className="inline-flex items-center gap-1 text-[8px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-fit"
                                  >
                                    <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    {p.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        {state.plans.map(plan => (
                          <td key={plan.id} className="px-3 py-2">
                            <RuleValueInput
                              label={currentLabel}
                              value={plan.rules[i]?.values[tier] ?? ''}
                              onChange={v => setRuleValue(plan.id, i, tier, v)}
                              tier={tier}
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                  <tr className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-2.5">
                      <button onClick={addRuleRow} className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add rule row
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-[9px] text-gray-400 bg-gray-50/50 dark:bg-gray-900/20">
          Rules drive the comparison table on the public page and the limits enforced for admin setup, business usage and consumer usage. Features render as check-list items. Each rule value shows live usage from the page it controls.
        </p>
      </div>

      {/* Live preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Live preview</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Exactly how the public pricing page renders.</p>
          </div>
          <Link to="/membership" className="text-[10px] font-medium text-blue-600 hover:underline">Open public page →</Link>
        </div>
        <PricingCard state={state} tier={tier} billing={billing} onChoose={name => toast.success(`${name} — visitors can choose this on the public page`)} />
      </div>
    </div>
  )
}