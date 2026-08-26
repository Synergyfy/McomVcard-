import { useState } from 'react'
import toast from 'react-hot-toast'

/* ------------------------------------------------------------------ */
/*  Upgrades & Downgrades — merged from the old /admin/membership/      */
/*  upgrades page. Policy toggles + a compact recent-transitions list.  */
/* ------------------------------------------------------------------ */

const KEY = 'mcom_membership_upgrades'

const DEFAULT_SETTINGS = {
  allowAutoUpgrade: true,
  requireApproval: false,
  prorate: true,
  allowDowngradeAnytime: true,
  downgradeTakesEffect: 'End of billing period' as string,
}

const RECENT = [
  { id: 'TR-2026-0341', member: 'Acme Retail Ltd', from: 'Silver', to: 'Gold', type: 'Upgrade', status: 'Completed', date: '2 Aug 2026' },
  { id: 'TR-2026-0339', member: 'BlueWave Café', from: 'Gold', to: 'Silver', type: 'Downgrade', status: 'Scheduled', date: '1 Aug 2026' },
  { id: 'TR-2026-0334', member: 'Nova Fitness', from: 'Bronze', to: 'Silver', type: 'Upgrade', status: 'Pending approval', date: '31 Jul 2026' },
  { id: 'TR-2026-0330', member: 'Harbor Legal', from: 'Platinum', to: 'Gold', type: 'Downgrade', status: 'Completed', date: '29 Jul 2026' },
]

type UpgradesSettings = typeof DEFAULT_SETTINGS

function loadSettings(): UpgradesSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<UpgradesSettings>) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
  Scheduled: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  'Pending approval': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
}

export function UpgradesSection() {
  const [settings, setSettings] = useState(loadSettings)
  const [dirty, setDirty] = useState(false)

  const set = (key: string, v: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: v }))
    setDirty(true)
  }

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch { /* ignore */ }
    setDirty(false)
    toast.success('Upgrade & downgrade policy saved')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Upgrades &amp; Downgrades</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">How members move between plans.</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">Unsaved</span>}
          <button onClick={save} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save changes</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-[11px] font-bold text-gray-800 dark:text-white mb-3">Policy</h3>
        <div className="space-y-1">
          {[
            { key: 'allowAutoUpgrade', label: 'Automatic upgrades', desc: 'Allow instant upgrades to a higher plan without approval.' },
            { key: 'requireApproval', label: 'Require approval', desc: 'Manual review before a plan change is applied.' },
            { key: 'prorate', label: 'Prorate charges', desc: 'Adjust billing pro-rata when a member changes plan mid-cycle.' },
            { key: 'allowDowngradeAnytime', label: 'Allow downgrades anytime', desc: 'Let members move to a lower plan at any point.' },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between gap-4 py-2.5">
              <div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-100">{s.label}</p>
                <p className="text-[10px] text-gray-400">{s.desc}</p>
              </div>
              <Toggle on={Boolean(settings[s.key as keyof typeof settings])} onClick={() => set(s.key, !settings[s.key as keyof typeof settings])} />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5 border-t border-gray-50 dark:border-gray-700/50">
            <div>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-100">Downgrade takes effect</p>
              <p className="text-[10px] text-gray-400">When a scheduled downgrade is applied.</p>
            </div>
            <select
              value={settings.downgradeTakesEffect}
              onChange={e => set('downgradeTakesEffect', e.target.value)}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              <option>End of billing period</option>
              <option>Immediately</option>
              <option>At renewal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-gray-800 dark:text-white">Recent transitions</h3>
          <span className="text-[9px] text-gray-400">Latest activity</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-700/50 text-[9px] uppercase tracking-wider text-gray-400">
              <th className="px-4 py-2 font-medium">Request</th>
              <th className="px-3 py-2 font-medium">Member</th>
              <th className="px-3 py-2 font-medium">Change</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT.map(t => (
              <tr key={t.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <td className="px-4 py-2.5 text-[10px] font-mono text-gray-500">{t.id}</td>
                <td className="px-3 py-2.5 text-[10px] text-gray-700 dark:text-gray-200">{t.member}</td>
                <td className="px-3 py-2.5 text-[10px] text-gray-600">{t.from} → {t.to}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${t.type === 'Upgrade' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600'}`}>{t.type}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_STYLES[t.status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
