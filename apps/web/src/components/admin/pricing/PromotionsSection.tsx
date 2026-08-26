import { useState } from 'react'
import toast from 'react-hot-toast'
import { loadMembershipPricing, PLAN_TIERS } from '../../../services/membershipPricingStore'

/* ------------------------------------------------------------------ */
/*  Promotions & Coupons — merged from the old /admin/membership/       */
/*  promotions page. "Applies to" is fetched from the plans that are    */
/*  actually created in Pricing & Plans, because that is what the       */
/*  discount figure affects. Pausing/activating asks for confirmation.  */
/* ------------------------------------------------------------------ */

interface Promotion {
  id: string
  name: string
  code: string
  discount: string
  appliesTo: string
  active: boolean
  expires: string
}

const KEY = 'mcom_membership_promotions'

const DEFAULTS: Promotion[] = [
  { id: 'PROMO-2026-0024', name: 'Holiday Flash Sale', code: 'HOLIDAY25', discount: '25% off first 3 months', appliesTo: 'All plans', active: true, expires: '31 Dec 2026' },
  { id: 'PROMO-2026-0018', name: 'Launch Discount', code: 'LAUNCH10', discount: '10% off quarterly', appliesTo: 'Silver, Gold, Platinum', active: false, expires: '30 Jun 2026' },
  { id: 'PROMO-2026-0007', name: 'Referral Reward', code: 'FRIEND20', discount: '£20 credit', appliesTo: 'All plans', active: true, expires: 'Never' },
]

function load(): Promotion[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return DEFAULTS.map(p => ({ ...p }))
}

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

/* ------------------------------------------------------------------ */
/*  Grouped plan options — each plan level (Bronze, Silver, Gold,      */
/*  Platinum) expands to show its Normal / Pro / Pro+ tiers, plus      */
/*  an "All plans" option at the top.                                  */
/* ------------------------------------------------------------------ */

interface PlanOptionGroup {
  label: string
  options: { value: string; label: string }[]
}

function buildPlanOptionGroups(): PlanOptionGroup[] {
  try {
    const state = loadMembershipPricing()
    const groups: PlanOptionGroup[] = []
    state.plans.forEach(plan => {
      const tierOptions = PLAN_TIERS.map(tier => ({
        value: `${plan.name} · ${tier}`,
        label: `${plan.name} · ${tier}`,
      }))
      groups.push({
        label: plan.name,
        options: [
          { value: plan.name, label: `${plan.name} (all tiers)` },
          ...tierOptions,
        ],
      })
    })
    return groups
  } catch {
    return []
  }
}

export function PromotionsSection() {
  const [items, setItems] = useState<Promotion[]>(load)
  const [dirty, setDirty] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{ index: number; activate: boolean } | null>(null)

  /* Grouped options built once from the plans actually configured. */
  const [planGroups] = useState<PlanOptionGroup[]>(() => buildPlanOptionGroups())

  const set = (i: number, key: keyof Promotion, v: string | boolean) => {
    setItems(prev => prev.map((p, x) => (x === i ? { ...p, [key]: v } : p)))
    setDirty(true)
  }

  const togglePlanIn = (i: number, value: string) => {
    setItems(prev => prev.map((p, x) => {
      if (x !== i) return p
      if (value === 'All plans') {
        return { ...p, appliesTo: 'All plans' }
      }
      const current = p.appliesTo === 'All plans' ? [] : p.appliesTo.split(',').map(s => s.trim()).filter(Boolean)
      const next = current.includes(value) ? current.filter(s => s !== value) : [...current, value]
      return { ...p, appliesTo: next.length === 0 ? 'None' : next.join(', ') }
    }))
    setDirty(true)
  }

  const isPlanSelected = (p: Promotion, value: string) =>
    value === 'All plans' ? p.appliesTo === 'All plans' : p.appliesTo.split(',').map(s => s.trim()).includes(value)

  const add = () => {
    const n = items.length + 1
    setItems(prev => [{ id: `PROMO-2026-${String(n).padStart(4, '0')}`, name: 'New promotion', code: '', discount: '', appliesTo: 'All plans', active: true, expires: '' }, ...prev])
    setDirty(true)
  }

  const remove = (i: number) => {
    setItems(prev => prev.filter((_, x) => x !== i))
    setDirty(true)
  }

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignore */ }
    setDirty(false)
    toast.success('Promotions saved')
  }

  const reset = () => {
    setItems(DEFAULTS.map(p => ({ ...p })))
    setDirty(true)
  }

  const confirmToggle = () => {
    if (!confirmTarget) return
    const { index, activate } = confirmTarget
    setItems(prev => prev.map((p, x) => (x === index ? { ...p, active: activate } : p)))
    setDirty(true)
    toast.success(activate ? 'Promotion activated' : 'Promotion paused')
    setConfirmTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Promotions & Coupons</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Discounts and offers visitors can apply when choosing a plan.</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">Unsaved</span>}
          <button onClick={reset} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
          <button onClick={add} className="px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-500/40 text-orange-600 text-[10px] font-semibold hover:bg-orange-50 dark:hover:bg-orange-500/10">+ New promotion</button>
          <button onClick={save} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save changes</button>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((p, i) => (
          <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <span className={`w-2 h-2 rounded-full shrink-0 ${p.active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <input value={p.name} onChange={e => set(i, 'name', e.target.value)} className={`${inputCls} max-w-[220px] font-semibold`} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-mono">{p.id}</span>
                {/* Pause / Activate switch */}
                <button
                  onClick={() => setConfirmTarget({ index: i, activate: !p.active })}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${p.active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  title={p.active ? 'Pause promotion' : 'Activate promotion'}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${p.active ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <span className={`text-[9px] font-bold uppercase tracking-wide w-14 ${p.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>{p.active ? 'Active' : 'Paused'}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[9px] text-gray-400 block mb-1">Code</label>
                <input value={p.code} onChange={e => set(i, 'code', e.target.value)} placeholder="e.g. HOLIDAY25" className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 block mb-1">Discount</label>
                <input value={p.discount} onChange={e => set(i, 'discount', e.target.value)} placeholder="e.g. 25% off quarterly" className={inputCls} />
              </div>
              <div className="relative">
                <label className="text-[9px] text-gray-400 block mb-1">Applies to (from plans)</label>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className={`${inputCls} text-left flex items-center justify-between gap-1`}
                >
                  <span className={p.appliesTo ? '' : 'text-gray-400'}>{p.appliesTo || 'Select plans…'}</span>
                  <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openDropdown === i && (
                  <div className="absolute z-20 mt-1 w-full min-w-[220px] max-h-72 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1.5">
                    {/* All plans */}
                    <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={isPlanSelected(p, 'All plans')}
                        onChange={() => togglePlanIn(i, 'All plans')}
                        className="accent-orange-500"
                      />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">All plans</span>
                    </label>
                    {/* Grouped plan options */}
                    {planGroups.map(group => (
                      <div key={group.label}>
                        <p className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">{group.label}</p>
                        {group.options.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 px-3 py-1.5 pl-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPlanSelected(p, opt.value)}
                              onChange={() => togglePlanIn(i, opt.value)}
                              className="accent-orange-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-200">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[9px] text-gray-400 block mb-1">Expires</label>
                <div className="flex items-center gap-1.5">
                  <input value={p.expires} onChange={e => set(i, 'expires', e.target.value)} placeholder="Never" className={inputCls} />
                  <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 p-1 shrink-0" title="Delete">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-[11px] text-gray-400 py-10 border border-dashed border-gray-200 dark:border-gray-600 rounded-2xl">No promotions yet — create one to get started.</p>
        )}
      </div>

      {/* Pause / Activate confirmation */}
      {confirmTarget && (() => {
        const promo = items[confirmTarget.index]
        const activating = confirmTarget.activate
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirmTarget(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${activating ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {activating ? 'Activate this promotion?' : 'Pause this promotion?'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-5">
                {activating
                  ? `"${promo.name}" (${promo.code}) will become available for visitors to apply at checkout on the plans it applies to.`
                  : `"${promo.name}" (${promo.code}) will be hidden and can no longer be applied by visitors. You can re-activate it any time.`}
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmTarget(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={confirmToggle} className={`px-4 py-2 rounded-lg text-[11px] font-semibold text-white ${activating ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                  {activating ? 'Yes, activate' : 'Yes, pause'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}