import { useState } from 'react'
import toast from 'react-hot-toast'
import type { MembershipPricingState } from '../../../services/membershipPricingStore'

/* ------------------------------------------------------------------ */
/*  Membership Settings — merged from the old /admin/membership/        */
/*  settings page. Currency is bound to the pricing state; the rest is  */
/*  global membership behaviour.                                        */
/* ------------------------------------------------------------------ */

const KEY = 'mcom_membership_settings'

const DEFAULTS = {
  defaultTrialDays: 14,
  taxRate: 20,
  renewalReminderDays: 7,
  gracePeriodDays: 7,
  enableAnnual: true,
  annualSavingEnabled: true,
  setupFeeEnabled: false,
  autoRenew: true,
  taxInclusive: true,
}

type Settings = typeof DEFAULTS

function loadDefaults(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch { /* ignore */ }
  return { ...DEFAULTS }
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

export function SettingsSection({ state, update }: {
  state: MembershipPricingState
  update: (fn: (s: MembershipPricingState) => MembershipPricingState) => void
}) {
  const [settings, setSettings] = useState(loadDefaults)
  const [dirty, setDirty] = useState(false)

  const set = (key: string, v: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: v }))
    setDirty(true)
  }

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch { /* ignore */ }
    setDirty(false)
    toast.success('Membership settings saved')
  }

  const reset = () => {
    setSettings({ ...DEFAULTS })
    setDirty(true)
  }

  const row = (label: string, desc: string, control: React.ReactNode, last = false) => (
    <div className={`flex items-center justify-between gap-4 py-3 ${last ? '' : 'border-b border-gray-50 dark:border-gray-700/50'}`}>
      <div>
        <p className="text-xs font-medium text-gray-800 dark:text-gray-100">{label}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Membership Settings</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Global behaviour for the pricing page and member accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">Unsaved</span>}
          <button onClick={reset} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
          <button onClick={save} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save changes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Billing */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-[11px] font-bold text-gray-800 dark:text-white mb-1">Billing</h3>
          <p className="text-[10px] text-gray-400 mb-2">Currency and price display.</p>
          <div className="space-y-1">
            {row('Currency', 'Symbol used on the pricing page.', (
              <select
                value={state.currency}
                onChange={e => update(s => ({ ...s, currency: e.target.value }))}
                className={inputCls}
              >
                <option value="GBP">£ GBP</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            ))}
            {row('Annual pricing', 'Show the annual / per-year price.', (
              <Toggle on={settings.enableAnnual} onClick={() => set('enableAnnual', !settings.enableAnnual)} />
            ))}
            {row('Annual saving note', 'Show the saving message on annual pricing.', (
              <Toggle on={settings.annualSavingEnabled} onClick={() => set('annualSavingEnabled', !settings.annualSavingEnabled)} />
            ))}
            {row('Annual discount', 'The saving shown on the annual price, as months free or a % off.', (
              <div className="flex items-center gap-1.5">
                <select
                  value={state.annualDiscount.type}
                  onChange={e => update(s => ({ ...s, annualDiscount: { ...s.annualDiscount, type: e.target.value as 'months' | 'percent' } }))}
                  className={inputCls}
                >
                  <option value="months">Months free</option>
                  <option value="percent">% off</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={state.annualDiscount.type === 'months' ? 11 : 99}
                  value={state.annualDiscount.value}
                  onChange={e => update(s => ({ ...s, annualDiscount: { ...s.annualDiscount, value: Number(e.target.value) || 0 } }))}
                  className={`${inputCls} w-20`}
                />
              </div>
            ))}
            {row('Setup fees', 'Allow a one-off setup fee per tier.', (
              <Toggle on={settings.setupFeeEnabled} onClick={() => set('setupFeeEnabled', !settings.setupFeeEnabled)} />
            ))}
            {row('Tax', 'VAT / sales tax rate applied to prices.', (
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} max={100} value={settings.taxRate} onChange={e => set('taxRate', Number(e.target.value) || 0)} className={`${inputCls} w-20`} />
                <span className="text-[10px] text-gray-400">%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Renewals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-[11px] font-bold text-gray-800 dark:text-white mb-1">Trials &amp; renewals</h3>
          <p className="text-[10px] text-gray-400 mb-2">Defaults for new members.</p>
          <div className="space-y-1">
            {row('Default trial', 'Free-trial days when a plan has no trial set.', (
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} value={settings.defaultTrialDays} onChange={e => set('defaultTrialDays', Number(e.target.value) || 0)} className={`${inputCls} w-20`} />
                <span className="text-[10px] text-gray-400">days</span>
              </div>
            ))}
            {row('Renewal reminder', 'How many days before renewal a reminder is sent.', (
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} value={settings.renewalReminderDays} onChange={e => set('renewalReminderDays', Number(e.target.value) || 0)} className={`${inputCls} w-20`} />
                <span className="text-[10px] text-gray-400">days</span>
              </div>
            ))}
            {row('Grace period', 'Time after expiry before the account locks.', (
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} value={settings.gracePeriodDays} onChange={e => set('gracePeriodDays', Number(e.target.value) || 0)} className={`${inputCls} w-20`} />
                <span className="text-[10px] text-gray-400">days</span>
              </div>
            ))}
            {row('Auto-renew', 'Renew plans automatically at the end of each period.', (
              <Toggle on={settings.autoRenew} onClick={() => set('autoRenew', !settings.autoRenew)} />
            ))}
            {row('Prices include tax', 'Display prices as tax-inclusive.', (
              <Toggle on={settings.taxInclusive} onClick={() => set('taxInclusive', !settings.taxInclusive)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
