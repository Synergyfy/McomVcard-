import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

/* ── Types ─────────────────────────────────────────────── */

interface MembershipPlan {
  id: number
  name: string
  internalCode: string
  type: 'Business Membership' | 'Consumer Membership'
  tier: string
  status: 'Active' | 'Draft' | 'Archived'
  price: number
  billingModel: 'Monthly' | 'Annual' | 'Seasonal' | 'One-Time' | 'Free'
  businessesUsing: number
  consumersUsing: number
  createdDate: string
  updatedDate: string
  description: string
  version: string
  trialAvailable: boolean
  trialDays: number
  renewalType: 'Auto' | 'Manual' | 'Expires'
  nextPricingChange: string | null
  validationErrors: string[]
}

const PLANS: MembershipPlan[] = [
  { id: 1, name: 'Bronze', internalCode: 'BRZ-001', type: 'Business Membership', tier: 'Bronze', status: 'Active', price: 49, billingModel: 'Monthly', businessesUsing: 145, consumersUsing: 320, createdDate: '15 Jan 2025', updatedDate: '28 Jul 2026', description: 'Entry-level business membership. Essential VCard features for small businesses starting their digital presence.', version: 'v2.1', trialAvailable: true, trialDays: 14, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 2, name: 'Bronze Pro', internalCode: 'BRZ-PRO-002', type: 'Business Membership', tier: 'Bronze Pro', status: 'Active', price: 79, billingModel: 'Monthly', businessesUsing: 98, consumersUsing: 410, createdDate: '15 Jan 2025', updatedDate: '27 Jul 2026', description: 'Enhanced Bronze with additional Consumer VCard allocations and basic analytics.', version: 'v1.8', trialAvailable: true, trialDays: 14, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 3, name: 'Bronze Pro+', internalCode: 'BRZ-PRP-003', type: 'Business Membership', tier: 'Bronze Pro+', status: 'Draft', price: 119, billingModel: 'Monthly', businessesUsing: 0, consumersUsing: 0, createdDate: '20 Jul 2026', updatedDate: '25 Jul 2026', description: 'Premium Bronze with extended allocation limits and priority support.', version: 'v0.9', trialAvailable: true, trialDays: 7, renewalType: 'Auto', nextPricingChange: null, validationErrors: ['Pricing not finalised', 'Entitlements not defined', 'Upgrade path not configured'] },
  { id: 4, name: 'Silver', internalCode: 'SLV-004', type: 'Business Membership', tier: 'Silver', status: 'Active', price: 149, billingModel: 'Monthly', businessesUsing: 87, consumersUsing: 680, createdDate: '15 Jan 2025', updatedDate: '26 Jul 2026', description: 'Mid-tier business membership. Expanded VCard features, Consumer VCards, and QR capabilities.', version: 'v3.0', trialAvailable: true, trialDays: 14, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 5, name: 'Silver Pro', internalCode: 'SLV-PRO-005', type: 'Business Membership', tier: 'Silver Pro', status: 'Active', price: 219, billingModel: 'Monthly', businessesUsing: 52, consumersUsing: 890, createdDate: '15 Jan 2025', updatedDate: '24 Jul 2026', description: 'Professional Silver with enhanced e-card entitlements and Friends & Family allocations.', version: 'v2.4', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: 'Sep 2026 — +£10/mo', validationErrors: [] },
  { id: 6, name: 'Silver Pro+', internalCode: 'SLV-PRP-006', type: 'Business Membership', tier: 'Silver Pro+', status: 'Active', price: 299, billingModel: 'Monthly', businessesUsing: 31, consumersUsing: 540, createdDate: '1 Mar 2025', updatedDate: '22 Jul 2026', description: 'Premium Silver with maximum mid-tier allocations and dedicated account manager.', version: 'v1.5', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 7, name: 'Gold', internalCode: 'GLD-007', type: 'Business Membership', tier: 'Gold', status: 'Active', price: 449, billingModel: 'Monthly', businessesUsing: 41, consumersUsing: 1200, createdDate: '15 Jan 2025', updatedDate: '20 Jul 2026', description: 'High-tier business membership. Full VCard suite, generous Consumer allocations, premium QR features.', version: 'v3.2', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 8, name: 'Gold Pro', internalCode: 'GLD-PRO-008', type: 'Business Membership', tier: 'Gold Pro', status: 'Active', price: 649, billingModel: 'Monthly', businessesUsing: 22, consumersUsing: 780, createdDate: '15 Jan 2025', updatedDate: '18 Jul 2026', description: 'Professional Gold with expanded e-card values, additional F&F allocations, and advanced analytics.', version: 'v2.0', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 9, name: 'Gold Pro+', internalCode: 'GLD-PRP-009', type: 'Business Membership', tier: 'Gold Pro+', status: 'Active', price: 899, billingModel: 'Monthly', businessesUsing: 15, consumersUsing: 460, createdDate: '1 Jun 2025', updatedDate: '15 Jul 2026', description: 'Premium Gold with near-maximum allocations and priority feature access.', version: 'v1.2', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 10, name: 'Platinum', internalCode: 'PLT-010', type: 'Business Membership', tier: 'Platinum', status: 'Active', price: 1499, billingModel: 'Monthly', businessesUsing: 12, consumersUsing: 2100, createdDate: '15 Jan 2025', updatedDate: '28 Jul 2026', description: 'Enterprise business membership. Maximum limits across all features, dedicated support, and earliest access to new features.', version: 'v4.0', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 11, name: 'Platinum Pro', internalCode: 'PLT-PRO-011', type: 'Business Membership', tier: 'Platinum Pro', status: 'Active', price: 2499, billingModel: 'Monthly', businessesUsing: 7, consumersUsing: 1800, createdDate: '15 Jan 2025', updatedDate: '25 Jul 2026', description: 'Enterprise Pro with unlimited e-card value, maximum F&F allocations, and API access.', version: 'v2.1', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 12, name: 'Platinum Pro+', internalCode: 'PLT-PRP-012', type: 'Business Membership', tier: 'Platinum Pro+', status: 'Active', price: 3999, billingModel: 'Monthly', businessesUsing: 3, consumersUsing: 950, createdDate: '1 Feb 2025', updatedDate: '20 Jul 2026', description: 'Ultimate enterprise membership. Everything included. White-label options. First access to all future MCOM ecosystem integrations.', version: 'v1.0', trialAvailable: false, trialDays: 0, renewalType: 'Auto', nextPricingChange: null, validationErrors: [] },
  { id: 13, name: 'Consumer Bronze', internalCode: 'CNS-BRZ-001', type: 'Consumer Membership', tier: 'Bronze', status: 'Active', price: 0, billingModel: 'Free', businessesUsing: 0, consumersUsing: 4500, createdDate: '15 Jan 2025', updatedDate: '28 Jul 2026', description: 'Entry-level consumer tier. Basic VCard features. Earned through business participation.', version: 'v1.0', trialAvailable: false, trialDays: 0, renewalType: 'Manual', nextPricingChange: null, validationErrors: [] },
  { id: 14, name: 'Consumer Silver', internalCode: 'CNS-SLV-002', type: 'Consumer Membership', tier: 'Silver', status: 'Active', price: 0, billingModel: 'Free', businessesUsing: 0, consumersUsing: 2800, createdDate: '15 Jan 2025', updatedDate: '26 Jul 2026', description: 'Mid-tier consumer level. Enhanced VCard features. Progression from Bronze.', version: 'v1.0', trialAvailable: false, trialDays: 0, renewalType: 'Manual', nextPricingChange: null, validationErrors: [] },
  { id: 15, name: 'Consumer Gold', internalCode: 'CNS-GLD-003', type: 'Consumer Membership', tier: 'Gold', status: 'Active', price: 0, billingModel: 'Free', businessesUsing: 0, consumersUsing: 1200, createdDate: '15 Jan 2025', updatedDate: '24 Jul 2026', description: 'High-tier consumer level. Premium VCard features. Progression from Silver.', version: 'v1.0', trialAvailable: false, trialDays: 0, renewalType: 'Manual', nextPricingChange: null, validationErrors: [] },
  { id: 16, name: 'Consumer Platinum', internalCode: 'CNS-PLT-004', type: 'Consumer Membership', tier: 'Platinum', status: 'Active', price: 0, billingModel: 'Free', businessesUsing: 0, consumersUsing: 450, createdDate: '15 Jan 2025', updatedDate: '22 Jul 2026', description: 'Ultimate consumer tier. Exclusive features and earliest access. Progression from Gold.', version: 'v1.0', trialAvailable: false, trialDays: 0, renewalType: 'Manual', nextPricingChange: null, validationErrors: [] },
]

const BILLING_MODELS = ['All', 'Monthly', 'Annual', 'Seasonal', 'One-Time', 'Free']
const TIERS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const PLAN_STATUSES = ['All', 'Active', 'Draft', 'Archived']
const PLAN_TYPES = ['All', 'Business Membership', 'Consumer Membership']

/* ── Static Computations ─────────────────────────────── */

const totalPlans = PLANS.length
const activePlans = PLANS.filter(p => p.status === 'Active').length
const draftPlans = PLANS.filter(p => p.status === 'Draft').length
const archivedPlans = PLANS.filter(p => p.status === 'Archived').length
const businessPlans = PLANS.filter(p => p.type === 'Business Membership').length
const consumerLevels = PLANS.filter(p => p.type === 'Consumer Membership').length
const totalBusinessSubscribers = PLANS.reduce((s, p) => s + p.businessesUsing, 0)
const totalSubscribers = PLANS.reduce((s, p) => s + p.businessesUsing + p.consumersUsing, 0)
const totalConsumerSubscribers = PLANS.reduce((s, p) => s + p.consumersUsing, 0)
const upgradesThisMonth = 34
const consumerProgressions = 156

const monthlyRevenue = PLANS.filter(p => p.type === 'Business Membership').reduce((s, p) => s + p.price * p.businessesUsing, 0)
const annualRevenue = monthlyRevenue * 12
const avgRevenuePerPlan = totalSubscribers > 0 ? Math.round(monthlyRevenue / Math.max(totalSubscribers, 1)) : 0

/* ── Sub-Components ───────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    'Bronze': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Bronze Pro': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Bronze Pro+': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Silver': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Silver Pro': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Silver Pro+': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Gold': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Gold Pro': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Gold Pro+': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Platinum': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'Platinum Pro': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'Platinum Pro+': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors[tier] || 'bg-gray-100 text-gray-600'}`}>{tier}</span>
}

function KpiCard({ label, value, sub, color, badge }: { label: string; value: string; sub: string; color: string; badge?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 font-medium">{badge}</span>}
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
        {options.map((o) => <option key={o} value={o.toLowerCase() === 'all' ? '' : o}>{o}</option>)}
      </select>
    </div>
  )
}

function SkeletonKpi() {
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"><div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" /><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" /><div className="h-2 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></div>
}

/* ── Plan Details Workspace ───────────────────────────── */

function PlanWorkspace({ plan, onClose }: { plan: MembershipPlan | null; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'pricing' | 'entitlements' | 'allocations' | 'upgrades' | 'visibility' | 'versions' | 'activity'>('overview')
  if (!plan) return null

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'pricing' as const, label: 'Pricing' },
    { key: 'entitlements' as const, label: 'Entitlements' },
    { key: 'allocations' as const, label: 'Allocation Rules' },
    { key: 'upgrades' as const, label: 'Upgrade Paths' },
    { key: 'visibility' as const, label: 'Visibility' },
    { key: 'versions' as const, label: 'Version History' },
    { key: 'activity' as const, label: 'Activity' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <TierBadge tier={plan.tier} />
              <StatusBadge status={plan.status} />
              <span className="text-[9px] font-mono text-gray-400">{plan.internalCode}</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">{plan.type} · {plan.version} · {plan.billingModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success('Plan duplicated')} className="px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100">Duplicate</button>
          {plan.status === 'Draft' && <button onClick={() => toast.success('Plan published')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600">Publish</button>}
          <button onClick={() => toast.success('Plan saved')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600">Save</button>
        </div>
      </div>

      {/* Vertical tab nav */}
      <div className="flex">
        <div className="w-36 shrink-0 border-r border-gray-100 dark:border-gray-700 p-2 space-y-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${tab === t.key ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 max-h-[70vh] overflow-y-auto">
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  {[
                    { label: 'Plan Name', value: plan.name },
                    { label: 'Internal Code', value: plan.internalCode },
                    { label: 'Description', value: plan.description, span: true },
                    { label: 'Plan Type', value: plan.type },
                    { label: 'Status', value: plan.status },
                    { label: 'Version', value: plan.version },
                  ].map(f => (
                    <div key={f.label} className={f.span ? 'col-span-2' : ''}>
                      <span className="text-[10px] text-gray-500 block mb-0.5">{f.label}</span>
                      {f.span ? (
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2">{f.value}</p>
                      ) : (
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">{f.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Businesses Using', value: String(plan.businessesUsing) },
                    { label: 'Consumers on Plan', value: String(plan.consumersUsing) },
                    { label: 'Base Price', value: plan.price === 0 ? 'Free' : `£${plan.price}/mo` },
                    { label: 'Billing Cycle', value: plan.billingModel },
                    { label: 'Trial', value: plan.trialAvailable ? `${plan.trialDays} days` : 'Not available' },
                    { label: 'Renewal', value: plan.renewalType },
                  ].map(s => (
                    <div key={s.label} className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><p className="text-[9px] text-gray-500">{s.label}</p><p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">{s.value}</p></div>
                  ))}
                </div>
                {plan.nextPricingChange && <p className="text-[10px] text-amber-600 mt-2">⏳ {plan.nextPricingChange}</p>}
              </div>

              {/* Linked Features */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Linked Features</h4>
                <div className="flex flex-wrap gap-2">
                  {['Business Memberships', 'Consumer Memberships', 'Allocation Rules', 'Entitlements', 'Promotions'].map(l => (
                    <span key={l} className="px-2 py-1 text-[9px] rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-medium cursor-default">{l}</span>
                  ))}
                </div>
              </div>

              {/* Validation Panel */}
              {plan.status === 'Draft' && plan.validationErrors.length > 0 && (
                <div className="p-3 rounded-xl border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5">
                  <h4 className="text-[10px] font-semibold text-red-700 dark:text-red-400 mb-1">Validation Errors</h4>
                  <p className="text-[9px] text-red-500 mb-2">Fix the following before publishing:</p>
                  <ul className="space-y-1">
                    {plan.validationErrors.map((e, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-300">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.status === 'Draft' && plan.validationErrors.length === 0 && (
                <div className="p-3 rounded-xl border-2 border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/5">
                  <div className="flex items-center gap-2 text-[10px] text-green-700 dark:text-green-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>All validation checks passed — ready to publish</div>
                </div>
              )}
            </div>
          )}

          {tab === 'pricing' && (
            <div className="max-w-lg space-y-4">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Pricing Configuration</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-gray-500 block mb-1">Base Price (£)</label><input type="number" defaultValue={plan.price} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">Billing Model</label><select defaultValue={plan.billingModel} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{BILLING_MODELS.filter(b => b !== 'All').map(b => <option key={b}>{b}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">Trial Available</label><select defaultValue={plan.trialAvailable ? 'Yes' : 'No'} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Yes</option><option>No</option></select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">Trial Days</label><input type="number" defaultValue={plan.trialDays} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">Renewal Type</label><select defaultValue={plan.renewalType} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Auto</option><option>Manual</option><option>Expires</option></select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">Next Pricing Change</label><input type="text" defaultValue={plan.nextPricingChange || ''} placeholder="e.g. Sep 2026 — +£10/mo" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
            </div>
          )}

          {tab === 'entitlements' && (
            <div className="max-w-lg space-y-3">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Plan Entitlements</h4>
              {[
                { label: 'Business VCards', value: plan.tier.includes('Platinum') ? 'Unlimited' : plan.tier.includes('Gold') ? '50' : plan.tier.includes('Silver') ? '20' : '10' },
                { label: 'Consumer VCards', value: plan.tier.includes('Platinum') ? '500' : plan.tier.includes('Gold') ? '200' : plan.tier.includes('Silver') ? '100' : '50' },
                { label: 'Business Cards', value: plan.tier.includes('Platinum') ? 'Unlimited' : plan.tier.includes('Gold') ? '100' : plan.tier.includes('Silver') ? '50' : '25' },
                { label: 'Consumer Cards', value: plan.tier.includes('Platinum') ? '1000' : plan.tier.includes('Gold') ? '500' : plan.tier.includes('Silver') ? '200' : '100' },
                { label: 'F&F Allocations', value: plan.tier.includes('Pro+') ? '50' : plan.tier.includes('Pro') ? '25' : '10' },
                { label: 'E-Card Value', value: plan.tier.includes('Pro+') ? '£5000' : plan.tier.includes('Pro') ? '£2500' : '£1000' },
                { label: 'QR Rules', value: plan.tier.includes('Platinum') ? 'Unlimited' : '10' },
                { label: 'Analytics', value: plan.tier.includes('Pro') ? 'Advanced' : 'Basic' },
              ].map(e => (
                <div key={e.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="text-[10px] text-gray-500">{e.label}</span><span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{e.value}</span></div>
              ))}
            </div>
          )}

          {tab === 'allocations' && (
            <div className="max-w-lg space-y-3">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Allocation Rules</h4>
              {[
                { rule: 'Max VCards per Business', val: plan.tier.includes('Platinum') ? 'Unlimited' : plan.tier.includes('Gold') ? '5' : '3' },
                { rule: 'Max Cards per Business', val: plan.tier.includes('Platinum') ? 'Unlimited' : plan.tier.includes('Gold') ? '10' : '5' },
                { rule: 'Max VCards per Consumer', val: '1' },
                { rule: 'Max Cards per Consumer', val: plan.tier.includes('Pro') ? '5' : '3' },
                { rule: 'F&F Per Business', val: plan.tier.includes('Pro+') ? '50' : plan.tier.includes('Pro') ? '25' : '10' },
                { rule: 'Additional Cards Allowed', val: plan.tier.includes('Pro') ? 'Yes' : 'No' },
              ].map(a => (
                <div key={a.rule} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="text-[10px] text-gray-500">{a.rule}</span><span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{a.val}</span></div>
              ))}
            </div>
          )}

          {tab === 'upgrades' && (
            <div className="max-w-lg space-y-3">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Upgrade Paths</h4>
              {plan.type === 'Business Membership' ? (
                <div className="space-y-1">
                  {[
                    { from: 'Bronze', to: 'Bronze Pro', priceDiff: '+£30/mo' },
                    { from: 'Bronze Pro', to: 'Bronze Pro+', priceDiff: '+£40/mo' },
                    { from: 'Bronze Pro+', to: 'Silver', priceDiff: '+£30/mo' },
                    { from: 'Silver', to: 'Silver Pro', priceDiff: '+£70/mo' },
                    { from: 'Silver Pro', to: 'Silver Pro+', priceDiff: '+£80/mo' },
                    { from: 'Silver Pro+', to: 'Gold', priceDiff: '+£150/mo' },
                    { from: 'Gold', to: 'Gold Pro', priceDiff: '+£200/mo' },
                    { from: 'Gold Pro', to: 'Gold Pro+', priceDiff: '+£250/mo' },
                    { from: 'Gold Pro+', to: 'Platinum', priceDiff: '+£600/mo' },
                    { from: 'Platinum', to: 'Platinum Pro', priceDiff: '+£1000/mo' },
                    { from: 'Platinum Pro', to: 'Platinum Pro+', priceDiff: '+£1500/mo' },
                  ].filter(u => u.from === plan.tier || u.to === plan.tier).map(u => (
                    <div key={u.from + u.to} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2 text-[10px]"><span className="text-gray-500">{u.from}</span><svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg><span className="font-medium text-gray-700 dark:text-gray-300">{u.to}</span></div>
                      <span className="text-[10px] text-orange-600 font-medium">{u.priceDiff}</span>
                    </div>
                  ))}
                  {plan.tier === 'Platinum Pro+' && <p className="text-[10px] text-gray-400 italic">This is the highest tier. No further upgrades available.</p>}
                </div>
              ) : (
                <div className="space-y-1">
                  {[
                    { from: 'Consumer Bronze', to: 'Consumer Silver' },
                    { from: 'Consumer Silver', to: 'Consumer Gold' },
                    { from: 'Consumer Gold', to: 'Consumer Platinum' },
                  ].filter(u => u.from.includes(plan.tier) || u.to.includes(plan.tier)).map(u => (
                    <div key={u.from + u.to} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-[10px]"><span className="text-gray-500">{u.from}</span><svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg><span className="font-medium text-gray-700 dark:text-gray-300">{u.to}</span></div>
                  ))}
                  {plan.tier === 'Platinum' && <p className="text-[10px] text-gray-400 italic">Highest consumer tier. No further progression available.</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'visibility' && (
            <div className="max-w-lg space-y-3">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Visibility Settings</h4>
              <div className="space-y-2">
                {[
                  { label: 'Show in signup flow', val: true },
                  { label: 'Show in comparison table', val: true },
                  { label: 'Show in upgrade paths', val: true },
                  { label: 'Highlight as recommended', val: plan.tier === 'Gold' || plan.tier === 'Silver' },
                  { label: 'Visible to businesses only', val: plan.type === 'Business Membership' },
                  { label: 'Visible to consumers only', val: plan.type === 'Consumer Membership' },
                  { label: 'Internal only (admin view)', val: plan.status === 'Draft' },
                ].map(v => (
                  <label key={v.label} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked={v.val} className="rounded border-gray-300 accent-orange-500" />
                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{v.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === 'versions' && (
            <div className="max-w-lg">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Version History</h4>
              <div className="relative pl-6 space-y-0">
                {[
                  { ver: 'v2.1', date: '28 Jul 2026', by: 'Admin', note: 'Pricing updated for annual billing' },
                  { ver: 'v2.0', date: '15 Jun 2026', by: 'Admin', note: 'Major revision — entitlements expanded' },
                  { ver: 'v1.1', date: '20 Mar 2026', by: 'Designer', note: 'Tier badge colours updated' },
                  { ver: 'v1.0', date: '15 Jan 2025', by: 'Admin', note: 'Initial plan creation' },
                ].map((v, i) => (
                  <div key={i} className="relative pb-4 last:pb-0">
                    {i < 3 && <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-600" />}
                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-white dark:bg-gray-800" />
                    <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{v.ver}</p>
                    <p className="text-[9px] text-gray-500">{v.date} · {v.by}</p>
                    <p className="text-[9px] text-gray-400">{v.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="max-w-lg">
              <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Activity</h4>
              <div className="space-y-1">
                {[
                  { event: 'Plan published', time: '28 Jul 2026 09:21', by: 'Admin' },
                  { event: 'Pricing updated', time: '27 Jul 2026 14:30', by: 'Admin' },
                  { event: 'Entitlement limit changed', time: '25 Jul 2026 11:00', by: 'Admin' },
                  { event: 'Plan created (Draft)', time: '15 Jan 2025 10:00', by: 'Admin' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div><p className="text-[10px] text-gray-700 dark:text-gray-300">{a.event}</p><p className="text-[9px] text-gray-400">{a.time}</p></div>
                    <span className="text-[9px] text-gray-500">{a.by}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────── */

export default function MembershipPlansPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [billingFilter, setBillingFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [workspacePlan, setWorkspacePlan] = useState<MembershipPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = PLANS.filter(p => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.tier.toLowerCase().includes(q) && !p.internalCode.toLowerCase().includes(q)) return false
    }
    if (typeFilter && p.type !== typeFilter) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (tierFilter && p.tier !== tierFilter) return false
    if (billingFilter && p.billingModel !== billingFilter) return false
    return true
  })

  const toggleId = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id))

  const bulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('Select plans first'); return }
    if (action === 'archive') toast.success(`${selectedIds.length} plan(s) archived`)
    else if (action === 'publish') toast.success(`${selectedIds.length} plan(s) published`)
    else if (action === 'duplicate') toast.success(`${selectedIds.length} plan(s) duplicated`)
    else if (action === 'export') toast.success(`Exporting ${selectedIds.length} plan(s)`)
    setSelectedIds([])
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Membership Plans - Membership & Pricing - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonKpi key={i} />)}</div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" /><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div></div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unable to load Membership Plans</p>
          <p className="text-[10px] text-gray-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">Retry</button>
            <button className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Empty ── */
  if (PLANS.length === 0) {
    return (
      <div className="space-y-6">
        <Helmet><title>Membership Plans - Membership & Pricing - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5"><div className="flex items-center gap-2 mb-1"><Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg><h1 className="text-sm font-bold text-gray-900 dark:text-white">Membership Plans</h1></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Membership Plans Found</p>
          <p className="text-[10px] text-gray-500 mb-5">Create your first membership plan to define pricing, entitlements, and allocations.</p>
          <button onClick={() => toast.success('Plan creation started')} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Create Membership Plan</button>
        </div>
      </div>
    )
  }

  /* ── Workspace View ── */
  if (workspacePlan) {
    return (
      <div className="space-y-6">
        <Helmet><title>{workspacePlan.name} - Membership Plans - MCOM VCard</title></Helmet>
        <div className="flex items-center gap-2">
          <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <Link to="/admin/membership/plans" className="text-[10px] text-orange-600 hover:underline">Membership Plans</Link>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">{workspacePlan.name}</h1>
        </div>
        <PlanWorkspace plan={workspacePlan} onClose={() => setWorkspacePlan(null)} />
      </div>
    )
  }

  /* ── List View ── */
  return (
    <div className="space-y-6">
      <Helmet><title>Membership Plans - Membership & Pricing - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Membership Plans</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Master catalogue for every membership plan. Define pricing, entitlements, allocations, and upgrade paths for all tiers across Business and Consumer memberships.</p>
          </div>
          <button onClick={() => toast.success('Plan creation started')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 flex items-center gap-1.5 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Plan
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Plans" value={String(totalPlans)} sub={`${activePlans} Active · ${draftPlans} Draft · ${archivedPlans} Archived`} color="text-gray-900 dark:text-white" badge={String(activePlans) + ' Active'} />
        <KpiCard label="Business Plans" value={String(businessPlans)} sub="12 tiers from Bronze → Platinum Pro+" color="text-blue-600" />
        <KpiCard label="Consumer Levels" value={String(consumerLevels)} sub="4 progression levels" color="text-green-600" />
        <KpiCard label="Active Subscribers" value={totalSubscribers.toLocaleString()} sub={`${totalBusinessSubscribers} Businesses · ${totalConsumerSubscribers} Consumers`} color="text-purple-600" />
        <KpiCard label="Upgrades This Month" value={String(upgradesThisMonth + consumerProgressions)} sub={`${upgradesThisMonth} Business · ${consumerProgressions} Consumer`} color="text-orange-600" />
        <KpiCard label="Monthly Revenue" value={`£${monthlyRevenue.toLocaleString()}`} sub={`£${annualRevenue.toLocaleString()}/yr · Avg £${avgRevenuePerPlan}/plan`} color="text-emerald-600" />
      </div>

      {/* Filters + Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search plan name, tier, internal code..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="w-32"><FilterSelect label="Type" value={typeFilter} options={PLAN_TYPES} onChange={setTypeFilter} /></div>
            <div className="w-24"><FilterSelect label="Status" value={statusFilter} options={PLAN_STATUSES} onChange={setStatusFilter} /></div>
            <div className="w-28"><FilterSelect label="Billing" value={billingFilter} options={BILLING_MODELS} onChange={setBillingFilter} /></div>
            <div className="w-28"><FilterSelect label="Tier" value={tierFilter} options={TIERS} onChange={setTierFilter} /></div>
          </div>
        </div>

        {/* Bulk */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[10px] text-gray-500">{selectedIds.length} selected</span>
            <button onClick={() => bulkAction('publish')} className="px-2 py-1 text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100">Publish</button>
            <button onClick={() => bulkAction('duplicate')} className="px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100">Duplicate</button>
            <button onClick={() => bulkAction('archive')} className="px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-50 dark:bg-gray-500/10 rounded-lg hover:bg-gray-100">Archive</button>
            <button onClick={() => bulkAction('export')} className="px-2 py-1 text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100">Export</button>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-medium text-gray-500 mb-1">No plans match your filters</p>
            <p className="text-[10px] text-gray-400 mb-4">Try adjusting the search term or filter selection</p>
            <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); setTierFilter(''); setBillingFilter('') }} className="px-4 py-2 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">Clear All Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-2 py-1.5 font-medium w-8"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-gray-300" /></th>
                  <th className="text-left px-2 py-1.5 font-medium">Plan Name</th>
                  <th className="text-left px-2 py-1.5 font-medium">Type</th>
                  <th className="text-left px-2 py-1.5 font-medium">Tier</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-left px-2 py-1.5 font-medium">Price</th>
                  <th className="text-left px-2 py-1.5 font-medium">Billing</th>
                  <th className="text-left px-2 py-1.5 font-medium">Businesses</th>
                  <th className="text-left px-2 py-1.5 font-medium">Consumers</th>
                  <th className="text-left px-2 py-1.5 font-medium">Created</th>
                  <th className="text-left px-2 py-1.5 font-medium">Updated</th>
                  <th className="text-left px-2 py-1.5 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer" onClick={() => setWorkspacePlan(p)}>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleId(p.id)} className="rounded border-gray-300" /></td>
                    <td className="px-2 py-2"><div><p className="font-medium text-gray-700 dark:text-gray-300">{p.name}</p><p className="text-[9px] font-mono text-gray-400">{p.internalCode}</p></div></td>
                    <td className="px-2 py-2"><span className={`text-[9px] font-medium ${p.type === 'Business Membership' ? 'text-blue-600' : 'text-green-600'}`}>{p.type === 'Business Membership' ? 'Business' : 'Consumer'}</span></td>
                    <td className="px-2 py-2"><TierBadge tier={p.tier} /></td>
                    <td className="px-2 py-2"><StatusBadge status={p.status} /></td>
                    <td className="px-2 py-2"><span className="font-medium text-gray-700 dark:text-gray-300">{p.price === 0 ? 'Free' : `£${p.price}`}</span></td>
                    <td className="px-2 py-2 text-gray-500">{p.billingModel}</td>
                    <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{p.businessesUsing}</td>
                    <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{p.consumersUsing.toLocaleString()}</td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{p.createdDate}</td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{p.updatedDate}</td>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setWorkspacePlan(p)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500" title="View"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                        <button onClick={() => { toast.success(`Editing ${p.name}`) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500" title="Edit"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => { toast.success(`${p.name} duplicated`) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-purple-500" title="Duplicate"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                        {p.status === 'Draft' && <button onClick={() => { toast.success(`${p.name} published`) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-500" title="Publish"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-3 px-1">
              <span className="text-[10px] text-gray-400">{filtered.length} of {PLANS.length} plans</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30" disabled><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="text-[10px] text-gray-500 px-2">Page 1 of 1</span>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30" disabled><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
