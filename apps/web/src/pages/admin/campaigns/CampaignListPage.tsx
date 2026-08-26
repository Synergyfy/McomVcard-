import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import InputField from '../../../components/auth/InputField'

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <label className="flex items-center gap-2.5 cursor-pointer">
    <div className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
)

export default function CampaignListPage() {
  const [rules, setRules] = useState({ require_approval: true, default_duration_days: 30, max_budget: 50000, min_budget: 100, max_campaigns_per_day: 10, allow_auto_renew: true, cooldown_days: 7 })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <Helmet><title>Campaigns - MCOM VCard Social Bio</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Campaigns</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">This feature is powered by <strong className="text-gray-700 dark:text-gray-300">MCOM Campaign Platform</strong>.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Integration coming soon. You will be able to create seasonal, referral, QR, and event campaigns once connected.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Rules</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
          <Toggle checked={rules.require_approval} onChange={(v) => setRules({ ...rules, require_approval: v })} label="Require admin approval for campaigns" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Default Duration (days)" type="number" value={String(rules.default_duration_days)} onChange={(e) => setRules({ ...rules, default_duration_days: Number(e.target.value) })} />
            <InputField label="Max Budget (£)" type="number" value={String(rules.max_budget)} onChange={(e) => setRules({ ...rules, max_budget: Number(e.target.value) })} />
            <InputField label="Min Budget (£)" type="number" value={String(rules.min_budget)} onChange={(e) => setRules({ ...rules, min_budget: Number(e.target.value) })} />
            <InputField label="Max Campaigns Per Day" type="number" value={String(rules.max_campaigns_per_day)} onChange={(e) => setRules({ ...rules, max_campaigns_per_day: Number(e.target.value) })} />
          </div>
          <Toggle checked={rules.allow_auto_renew} onChange={(v) => setRules({ ...rules, allow_auto_renew: v })} label="Allow auto-renew campaigns" />
          <InputField label="Cooldown Between Campaigns (days)" type="number" value={String(rules.cooldown_days)} onChange={(e) => setRules({ ...rules, cooldown_days: Number(e.target.value) })} />
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
