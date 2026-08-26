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

export default function WalletPage() {
  const [rules, setRules] = useState({ min_balance: 0, max_balance: 100000, daily_transaction_limit: 5000, monthly_withdrawal_limit: 25000, freeze_on_suspicious: true, auto_freeze_threshold: 50000, require_kyc_for_withdrawal: true })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <Helmet><title>Wallet - MCOM VCard Social Bio</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Wallet & Assets</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This feature is powered by <strong className="text-gray-700 dark:text-gray-300">MCOM Reward Platform</strong>. Integration coming soon. You will be able to manage points, cashback, gift cards, coupons, and vouchers once connected.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Rules</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Minimum Balance" type="number" value={String(rules.min_balance)} onChange={(e) => setRules({ ...rules, min_balance: Number(e.target.value) })} />
            <InputField label="Maximum Balance" type="number" value={String(rules.max_balance)} onChange={(e) => setRules({ ...rules, max_balance: Number(e.target.value) })} />
            <InputField label="Daily Transaction Limit" type="number" value={String(rules.daily_transaction_limit)} onChange={(e) => setRules({ ...rules, daily_transaction_limit: Number(e.target.value) })} />
            <InputField label="Monthly Withdrawal Limit" type="number" value={String(rules.monthly_withdrawal_limit)} onChange={(e) => setRules({ ...rules, monthly_withdrawal_limit: Number(e.target.value) })} />
          </div>
          <Toggle checked={rules.freeze_on_suspicious} onChange={(v) => setRules({ ...rules, freeze_on_suspicious: v })} label="Auto-freeze on suspicious activity" />
          <InputField label="Auto-freeze Threshold (£)" type="number" value={String(rules.auto_freeze_threshold)} onChange={(e) => setRules({ ...rules, auto_freeze_threshold: Number(e.target.value) })} />
          <Toggle checked={rules.require_kyc_for_withdrawal} onChange={(v) => setRules({ ...rules, require_kyc_for_withdrawal: v })} label="Require KYC for withdrawals" />
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 shadow-sm shadow-orange-200 dark:shadow-none">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
