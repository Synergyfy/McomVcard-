import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockConsumers } from '../../../services/mockData'

const TABS = ['Overview', 'Consumer VCard', 'Consumer Card', 'Membership & Entitlements', 'Activity', 'Account & Integrations']

const statusColors: Record<string, string> = {
  active: 'text-green-600 dark:text-green-400', Active: 'text-green-600',
  suspended: 'text-red-600 dark:text-red-400', Suspended: 'text-red-600',
  inactive: 'text-gray-500', Inactive: 'text-gray-500',
  Pending: 'text-yellow-600', 'Not Assigned': 'text-gray-400',
  'Coming Soon': 'text-gray-400',
}

const statusDots: Record<string, string> = {
  active: 'bg-green-500', Active: 'bg-green-500',
  suspended: 'bg-red-500', Suspended: 'bg-red-500',
  inactive: 'bg-gray-400', Inactive: 'bg-gray-400',
  Pending: 'bg-yellow-500', 'Not Assigned': 'bg-gray-300 dark:bg-gray-600',
  'Coming Soon': 'bg-gray-300 dark:bg-gray-600',
}

function StatBadge({ label, value, color, onClick }: { label: string; value: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-left hover:shadow-sm transition-all">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </button>
  )
}

function InfoRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{value}</span>
    </div>
  )
}

function EmptySection({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{desc}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
      <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
      <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
    </div>
  )
}

export default function ConsumerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState('Overview')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showChangeTemplate, setShowChangeTemplate] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideCardId, setOverrideCardId] = useState<number | null>(null)
  const [cPreviewMode, setCPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showChangeMembership, setShowChangeMembership] = useState(false)
  const [selectedNewPlan, setSelectedNewPlan] = useState('')
  const [newPlanWarning, setNewPlanWarning] = useState('')
  const [activityFilter, setActivityFilter] = useState('all')
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)

  const c = mockConsumers.find(x => x.id === Number(id))
  if (!c) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consumer not found</p>
        <p className="text-xs text-gray-400 mb-4">The consumer you're looking for doesn't exist or has been removed.</p>
        <Link to="/admin/consumers" className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Back to Consumer List</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to Load Consumer</p>
        <p className="text-xs text-gray-400 mb-4">We couldn't retrieve this consumer's information.</p>
        <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Try Again</button>
      </div>
    )
  }

  if (loading) return <LoadingSkeleton />

  const formatDate = (d: string) => d
  const lastActivity = c.recentActivity.length > 0 ? c.recentActivity[0].time : c.lastActivityAt

  return (
    <div className="space-y-6">
      <Helmet><title>{c.name} - Consumer Details - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/admin/consumers" className="hover:text-orange-600">Consumers</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <Link to="/admin/consumers" className="hover:text-orange-600">Consumer List</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">{c.name}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-500">{tab}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">{c.name.charAt(0)}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{c.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.status] || 'text-gray-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.status] || 'bg-gray-400'}`} />
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1">
                <span className="font-mono">{c.consumerId}</span>
                <span>·</span>
                <span>{c.email}</span>
                <span>·</span>
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                <span>Joined: {formatDate(c.joined)}</span>
                <span>·</span>
                <span>Last Active: {lastActivity}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={() => toast.success('Edit consumer profile opened')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Edit Consumer</button>
            {c.status === 'suspended' ? (
              <button onClick={() => toast.success('Account reactivated')} className="px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-500/10">Reactivate</button>
            ) : (
              <button onClick={() => setShowSuspendModal(true)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10">Suspend</button>
            )}
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                More
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showActions && (
                <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg py-1">
                  {[
                    { label: 'View Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', action: () => setTab('Activity') },
                    { label: 'View Integrations', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512a9.025 9.025 0 015.488 5.488z', action: () => setTab('Account & Integrations') },
                    { label: 'Send Password Reset', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', action: () => toast.success('Password reset link sent via MCOM Solutions') },
                    { label: 'Export Consumer Data', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', action: () => toast.success('Consumer data exported') },
                    { label: 'Archive Account', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', action: () => toast.success('Account archived') },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { setShowActions(false); item.action() }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-4">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t}</button>
          ))}
        </div>

        <div className="p-5">
          {/* ============================== OVERVIEW TAB ============================== */}
          {tab === 'Overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBadge label="Membership" value={c.membership} color="text-orange-600" onClick={() => setTab('Membership & Entitlements')} />
                <StatBadge label="Consumer VCard" value={`${c.vcardStatus}`} color={c.vcardStatus === 'Active' ? 'text-green-600' : 'text-gray-500'} onClick={() => setTab('Consumer VCard')} />
                <StatBadge label="Consumer Card" value={`${c.cardStatus}`} color={c.cardStatus === 'Active' ? 'text-purple-600' : 'text-gray-500'} onClick={() => setTab('Consumer Card')} />
                <StatBadge label="Additional Cards" value={`${c.allocatedAdditionalCards} of ${c.additionalEntitlements} Used`} color={c.unallocatedEntitlements > 0 ? 'text-amber-600' : 'text-indigo-600'} onClick={() => setTab('Membership & Entitlements')} />
                <StatBadge label="E-Card Entitlements" value={`${c.additionalEntitlements} Available`} color="text-blue-600" onClick={() => setTab('Membership & Entitlements')} />
                <StatBadge label="Recent Activity" value={`${c.recentActivity.length} Actions`} color="text-gray-700 dark:text-gray-300" onClick={() => setTab('Activity')} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Account Status Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Account Summary</h4>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Consumer ID" value={c.consumerId} />
                    <InfoRow label="Full Name" value={c.name} />
                    <InfoRow label="Email" value={c.email} />
                    <InfoRow label="Phone" value={c.phone} />
                    <InfoRow label="Account Status" value={<span className={`inline-flex items-center gap-1 text-[11px] font-medium ${statusColors[c.status]}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.status]}`} />{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span> as any} />
                    <InfoRow label="Authentication" value="MCOM Solutions" />
                    <InfoRow label="Registration Source" value={c.registrationSource} />
                    <InfoRow label="Registration Date" value={formatDate(c.joined)} />
                    <InfoRow label="Last Activity" value={lastActivity} />
                  </div>
                </div>

                {/* Consumer Acquisition */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Consumer Acquisition</h4>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Source" value={c.registrationSource} />
                    <InfoRow label="Primary Business" value={c.primaryIssuingBusiness} />
                    <InfoRow label="Business ID" value={`BUS-${String(c.primaryIssuingBusinessId).padStart(6, '0')}`} />
                    <InfoRow label="Connected Businesses" value={`${c.businessCount}`} />
                    <InfoRow label="Reward Method" value={c.registrationSource === 'Business' ? 'Reward' : c.registrationSource === 'Campaign' ? 'Campaign' : 'Direct'} />
                    <InfoRow label="Account Created" value={formatDate(c.joined)} />
                  </div>
                  <button onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)} className="mt-3 w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Primary Business →</button>
                </div>

                {/* Consumer VCard Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer VCard</h4>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${statusColors[c.vcardStatus] || 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.vcardStatus] || 'bg-gray-400'}`} />
                      {c.vcardStatus}
                    </span>
                  </div>
                  {c.vcardStatus === 'Not Assigned' ? (
                    <EmptySection title="No Consumer VCard" desc="This consumer does not currently have an active Consumer VCard." />
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      <InfoRow label="Current Level" value={c.membership} />
                      <InfoRow label="Status" value={c.vcardStatus} />
                      <InfoRow label="Issued By" value={c.primaryIssuingBusiness} />
                      <InfoRow label="Issued Date" value={formatDate(c.joined)} />
                      <InfoRow label="Progression" value={`${Math.min(c.stats.scans, 1000)} / 1,000 Points`} />
                      <InfoRow label="Progress" value={`${Math.round((c.stats.scans % 1000) / 10)}%`} />
                    </div>
                  )}
                  <button onClick={() => setTab('Consumer VCard')} className="mt-3 w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">View Consumer VCard →</button>
                </div>

                {/* Consumer Card Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer Card</h4>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${statusColors[c.cardStatus] || 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.cardStatus] || 'bg-gray-400'}`} />
                      {c.cardStatus}
                    </span>
                  </div>
                  {c.cardStatus === 'Not Assigned' ? (
                    <EmptySection title="No Consumer Card" desc="This consumer does not currently have an active Consumer Card." />
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      <InfoRow label="Status" value={c.cardStatus} />
                      <InfoRow label="Card Type" value="Consumer Card" />
                      <InfoRow label="Card Template" value="Standard Consumer Card" />
                      <InfoRow label="Card ID" value={`CARD-${String(c.id).padStart(6, '0')}`} />
                      <InfoRow label="Issued" value={formatDate(c.joined)} />
                      <InfoRow label="Scans" value={`${c.stats.scans}`} />
                    </div>
                  )}
                  <button onClick={() => setTab('Consumer Card')} className="mt-3 w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Manage Consumer Card →</button>
                </div>

                {/* Membership & Entitlements Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Membership & Entitlements</h4>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                    <InfoRow label="Membership" value={c.membership} />
                    <InfoRow label="Status" value={<span className={`inline-flex items-center gap-1 text-[11px] font-medium ${statusColors[c.membershipStatus] || 'text-gray-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.membershipStatus] || 'bg-gray-400'}`} />{c.membershipStatus}</span> as any} />
                    <InfoRow label="Primary VCard" value="1" />
                    <InfoRow label="Additional Entitlements" value={`${c.additionalEntitlements}`} />
                    <InfoRow label="Allocated" value={`${c.allocatedAdditionalCards}`} />
                    <InfoRow label="Remaining" value={`${c.unallocatedEntitlements}`} />
                    <InfoRow label="E-Card Entitlements" value={`${c.additionalEntitlements}`} />
                  </div>
                  {/* F&F Allocation Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-2">Friends & Family Allocation</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 flex-1">Primary Card — {c.name}</span>
                        <span className="text-green-600 font-medium">Active</span>
                      </div>
                      {c.familyAllocations > 0 && Array.from({ length: c.familyAllocations }, (_, i) => (
                        <div key={`family-${i}`} className="flex items-center gap-2 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 flex-1">Family Member {i + 1}</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                      ))}
                      {c.friendAllocations > 0 && Array.from({ length: c.friendAllocations }, (_, i) => (
                        <div key={`friend-${i}`} className="flex items-center gap-2 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 flex-1">Friend {i + 1}</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                      ))}
                      {c.unallocatedEntitlements > 0 && (
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                          <span className="text-gray-400 flex-1">{c.unallocatedEntitlements} Available</span>
                          <span className="text-gray-400">Unallocated</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setTab('Membership & Entitlements')} className="flex-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Manage Membership</button>
                  </div>
                </div>

                {/* Recent Activity + Integrations two-column card */}
                <div className="space-y-5">
                  {/* Recent Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recent Activity</h4>
                      <button onClick={() => setTab('Activity')} className="text-[10px] text-orange-600 hover:underline">View Full Activity →</button>
                    </div>
                    {c.recentActivity.length === 0 ? (
                      <EmptySection title="No Activity Yet" desc="There is no recorded activity for this account." />
                    ) : (
                      <div className="space-y-0">
                        {c.recentActivity.slice(0, 6).map((a, i) => {
                          const dotColors: Record<string, string> = { reward: 'bg-purple-400', earn: 'bg-green-400', referral: 'bg-orange-400', card: 'bg-blue-400', nfc: 'bg-teal-400', booking: 'bg-indigo-400', milestone: 'bg-yellow-400', alert: 'bg-red-400', profile: 'bg-gray-400' }
                          return (
                            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                              <div className={`w-2 h-2 rounded-full ${dotColors[a.type] || 'bg-gray-400'} mt-1 shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-[11px] text-gray-700 dark:text-gray-300">{a.action}</p>
                                <p className="text-[10px] text-gray-400">{a.time}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Integration Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Connected Platforms</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'MCOM Solutions', status: 'Connected', dot: 'bg-green-500' },
                        { name: 'MCOM Rewards', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
                        { name: 'MCOMMall Cashback', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
                        { name: 'MCOMSpin', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
                        { name: 'FundOrDonate', status: 'Coming Soon', dot: 'bg-gray-300 dark:bg-gray-600' },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center gap-2.5 py-1.5">
                          <span className={`w-2 h-2 rounded-full ${p.dot} shrink-0`} />
                          <span className="text-[11px] text-gray-700 dark:text-gray-300 flex-1">{p.name}</span>
                          <span className={`text-[10px] font-medium ${p.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setTab('Account & Integrations')} className="mt-3 w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Account & Integrations →</button>
                  </div>
                </div>
              </div>

              {/* Quick Actions panel */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Edit Consumer', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', action: () => toast.success('Edit consumer profile opened') },
                    { label: 'View VCard', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1', action: () => setTab('Consumer VCard') },
                    { label: 'View Card', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', action: () => setTab('Consumer Card') },
                    { label: 'Manage Membership', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', action: () => setTab('Membership & Entitlements') },
                    { label: 'Manage Allocations', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', action: () => setTab('Membership & Entitlements') },
                    { label: 'View Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', action: () => setTab('Activity') },
                    { label: 'Account & Integrations', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512a9.025 9.025 0 015.488 5.488z', action: () => setTab('Account & Integrations') },
                    { label: c.status === 'suspended' ? 'Reactivate' : 'Suspend', icon: c.status === 'suspended' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', action: () => c.status === 'suspended' ? toast.success('Account reactivated') : setShowSuspendModal(true) },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================== CONSUMER VCARD TAB ============================== */}
          {tab === 'Consumer VCard' && (
            <div className="space-y-6">
              {c.vcardStatus === 'Not Assigned' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No Consumer VCard</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">This consumer does not currently have an active Consumer VCard. VCards are typically issued through business rewards, campaigns, or membership plans.</p>
                </div>
              ) : (
                <>
                  {/* VCard Status Summary */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-500/5 dark:to-orange-600/5 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Consumer VCard</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.vcardStatus] || 'text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.vcardStatus] || 'bg-gray-400'}`} />
                            {c.vcardStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.consumerId} · {c.email} · {c.phone}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                          <span>Membership: <strong className="text-gray-700 dark:text-gray-300">{c.membership}</strong></span>
                          <span>VCard Level: <strong className="text-gray-700 dark:text-gray-300">{c.membership}</strong></span>
                          <span>Status: <strong className={`${c.vcardStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{c.vcardStatus}</strong></span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => toast.success('Opening VCard preview')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Preview VCard</button>
                        <button onClick={() => toast.success('Opening consumer profile overview')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Consumer Profile</button>
                        <div className="relative">
                          <button onClick={() => setShowActions(!showActions)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                            More Actions
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* VCard Summary + Progression */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">VCard Summary</h4>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                        <InfoRow label="Current Level" value={c.membership} />
                        <InfoRow label="Status" value={c.vcardStatus} />
                        <InfoRow label="Acquisition Source" value={c.registrationSource} />
                        <InfoRow label="Issuing Business" value={c.primaryIssuingBusiness} />
                        <InfoRow label="Issue Date" value={c.joined} />
                      </div>
                      {/* Progress bar to next level */}
                      {(() => {
                        const levelIndex = ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'].indexOf(c.membership)
                        const nextLevel = levelIndex >= 0 && levelIndex < 11 ? ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'][levelIndex + 1] : null
                        const progress = Math.min(Math.round((c.stats.scans % 1000) / 10), 99)
                        return (
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-gray-500">Progress to {nextLevel || 'Max Level'}</span>
                              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1.5">{c.stats.scans % 1000} / 1,000 points to {nextLevel || 'maximum level'}</p>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Acquisition Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">VCard Acquisition</h4>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                        <InfoRow label="Source" value={c.registrationSource} />
                        <InfoRow label="Business" value={c.primaryIssuingBusiness} />
                        <InfoRow label="Reward Method" value={c.registrationSource === 'Business' ? 'Points' : c.registrationSource === 'Campaign' ? 'Campaign Reward' : 'Direct Allocation'} />
                        <InfoRow label="Points Required" value={c.registrationSource === 'Business' ? '500' : '—'} />
                        <InfoRow label="Points Achieved" value={c.registrationSource === 'Business' ? '500' : '—'} />
                        <InfoRow label="Issued" value={c.joined} />
                      </div>
                      <button onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Issuing Business →</button>
                    </div>

                    {/* VCard Content - Share */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Share</h4>
                      {c.registrationSource === 'Campaign' ? (
                        <div className="text-center py-4">
                          <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Dynamic Share Content</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Coming Soon — Powered by MCOM Rewards</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                  <th className="text-left px-2 py-1.5 font-medium">Content Type</th>
                                  <th className="text-left px-2 py-1.5 font-medium">Source</th>
                                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                                  <th className="text-left px-2 py-1.5 font-medium">Published</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { type: 'Event', source: c.primaryIssuingBusiness, status: 'Active', published: 'Yes' },
                                  { type: 'Product', source: c.primaryIssuingBusiness, status: 'Active', published: 'Yes' },
                                  { type: 'Offer', source: c.primaryIssuingBusiness, status: 'Active', published: 'Yes' },
                                ].map((s, i) => (
                                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                                    <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{s.type}</td>
                                    <td className="px-2 py-1.5 text-gray-500">{s.source}</td>
                                    <td className="px-2 py-1.5"><span className="text-green-600 font-medium">{s.status}</span></td>
                                    <td className="px-2 py-1.5 text-gray-500">{s.published}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Exchange */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Exchange</h4>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <InfoRow label="Exchange Enabled" value="Yes" />
                        <InfoRow label="Total Exchanges" value={`${Math.floor(c.stats.scans * 0.15)}`} />
                        <InfoRow label="Last Exchange" value={c.recentActivity.length > 0 ? c.recentActivity[0].time : '—'} />
                        <InfoRow label="Exchange Method" value="QR Scan" />
                      </div>
                    </div>

                    {/* Redeem */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Redeem</h4>
                      {c.registrationSource === 'Campaign' ? (
                        <div className="text-center py-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Redemption Engine</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Coming Soon — MCOM Rewards Integration</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                <th className="text-left px-2 py-1.5 font-medium">Business</th>
                                <th className="text-left px-2 py-1.5 font-medium">Reward</th>
                                <th className="text-right px-2 py-1.5 font-medium">Value</th>
                                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.rewardHistory.slice(0, 3).map((r) => (
                                <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50">
                                  <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{c.primaryIssuingBusiness}</td>
                                  <td className="px-2 py-1.5 text-gray-500">{r.reward}</td>
                                  <td className="px-2 py-1.5 text-right font-mono text-gray-700 dark:text-gray-300">${r.points}</td>
                                  <td className="px-2 py-1.5"><span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${r.status === 'redeemed' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : r.status === 'available' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-500'}`}>{r.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Dynamic QR Code */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Dynamic QR Code</h4>
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 text-gray-800" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm1 1h3v3H5V5zm10-2h7v7h-7V3zm1 1v5h5V4h-5zm1 1h3v3h-3V5zM3 14h7v7H3v-7zm1 1v5h5v-5H4zm1 1h3v3H5v-3zm10-2h7v7h-7v-7zm1 1v5h5v-5h-5zm1 1h3v3h-3v-3z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${c.vcardStatus === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${c.vcardStatus === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                              {c.vcardStatus === 'Active' ? 'Active' : 'Inactive'}
                            </span>
                            <button onClick={() => toast.success('QR configuration reset')} className="text-[10px] text-orange-600 hover:underline">Reset QR Config</button>
                          </div>
                          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            <InfoRow label="Current Content" value={`${c.primaryIssuingBusiness} Campaign`} />
                            <InfoRow label="Update Frequency" value={['Daily', 'Weekly', 'Seasonal', 'Campaign-Based'][Math.floor(Math.random() * 4)]} />
                            <InfoRow label="Last Updated" value={c.recentActivity.length > 0 ? c.recentActivity[0].time : '—'} />
                            <InfoRow label="Total Scans" value={`${c.stats.scans}`} />
                            <InfoRow label="Last Scan" value={c.recentActivity.find(a => a.type === 'nfc' || a.type === 'card')?.time || c.lastActivityAt} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connected Businesses */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Connected Businesses</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                              <th className="text-left px-2 py-1.5 font-medium">Business</th>
                              <th className="text-left px-2 py-1.5 font-medium">Relationship</th>
                              <th className="text-left px-2 py-1.5 font-medium">VCard</th>
                              <th className="text-left px-2 py-1.5 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { business: c.primaryIssuingBusiness, rel: 'Rewarded Customer', level: c.membership, status: 'Active' },
                              { business: c.businessCount > 1 ? ['GreenLeaf Coffee', 'TechVision Inc', 'FitLife Studio', 'Coastal Realty'][c.id % 4] : null, rel: 'Loyalty Customer', level: ['Silver', 'Bronze', 'Gold'][c.id % 3], status: 'Active' },
                              { business: c.businessCount > 2 ? ['Downtown BID', 'Bloom Beauty', 'Hotel Splendido'][c.id % 3] : null, rel: 'Campaign Participant', level: ['Bronze Pro', 'Silver Pro', 'Gold Pro'][c.id % 3], status: 'Active' },
                            ].filter(b => b.business).map((b, i) => (
                              <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30" onClick={() => toast.success(`Navigating to ${b.business} business details`)}>
                                <td className="px-2 py-1.5 text-orange-600 font-medium hover:underline">{b.business}</td>
                                <td className="px-2 py-1.5 text-gray-500">{b.rel}</td>
                                <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{b.level}</td>
                                <td className="px-2 py-1.5"><span className="text-green-600 font-medium">{b.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Membership & Entitlements Summary */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Membership & Entitlements</h4>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                          <InfoRow label="Membership" value={c.membership} />
                          <InfoRow label="VCard Level" value={c.membership} />
                          <InfoRow label="Additional Card Entitlement" value={`${c.additionalEntitlements}`} />
                          <InfoRow label="Used" value={`${c.allocatedAdditionalCards}`} />
                          <InfoRow label="Available" value={`${c.unallocatedEntitlements}`} />
                        </div>
                        <button onClick={() => setTab('Membership & Entitlements')} className="mt-3 w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Manage Membership & Entitlements →</button>
                      </div>

                      {/* Friends & Family Summary */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Friends & Family</h4>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                          <InfoRow label="Additional Cards" value={`${c.additionalEntitlements}`} />
                          <InfoRow label="Allocated" value={`${c.allocatedAdditionalCards}`} />
                          <InfoRow label="Unallocated" value={`${c.unallocatedEntitlements}`} />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300 flex-1">Primary — {c.name}</span>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                          {Array.from({ length: c.familyAllocations }, (_, i) => (
                            <div key={`f-${i}`} className="flex items-center gap-2 text-[10px]">
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300 flex-1">{['Spouse', 'Child', 'Parent'][i] || 'Family'}</span>
                              <span className="text-green-600 font-medium">Active</span>
                            </div>
                          ))}
                          {Array.from({ length: c.friendAllocations }, (_, i) => (
                            <div key={`fr-${i}`} className="flex items-center gap-2 text-[10px]">
                              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300 flex-1">Friend {i + 1}</span>
                              <span className="text-green-600 font-medium">Active</span>
                            </div>
                          ))}
                          {c.unallocatedEntitlements > 0 && (
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                              <span className="text-gray-400 flex-1">{c.unallocatedEntitlements} Available</span>
                              <span className="text-gray-400">Unallocated</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* E-Card Entitlement */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">E-Card Entitlements</h4>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                        <InfoRow label="E-Card Entitlements" value={`${c.additionalEntitlements}`} />
                        <InfoRow label="Allocated" value={`${c.allocatedAdditionalCards}`} />
                        <InfoRow label="Available" value={`${c.unallocatedEntitlements}`} />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-500">E-Card Monetary Engine</span>
                          <span className="text-gray-400">Coming Soon</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">E-Card face values and monetary processing will be connected to the relevant MCOM platform.</p>
                      </div>
                    </div>

                    {/* Recent VCard Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recent VCard Activity</h4>
                        <button onClick={() => setTab('Activity')} className="text-[10px] text-orange-600 hover:underline">View Full Activity →</button>
                      </div>
                      {c.recentActivity.length === 0 ? (
                        <EmptySection title="No Activity Yet" desc="There is no recorded activity for this VCard." />
                      ) : (
                        <div className="space-y-0">
                          {c.recentActivity.slice(0, 5).map((a, i) => {
                            const dotColors: Record<string, string> = { reward: 'bg-purple-400', earn: 'bg-green-400', referral: 'bg-orange-400', card: 'bg-blue-400', nfc: 'bg-teal-400', booking: 'bg-indigo-400', milestone: 'bg-yellow-400', alert: 'bg-red-400', profile: 'bg-gray-400' }
                            return (
                              <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                                <div className={`w-2 h-2 rounded-full ${dotColors[a.type] || 'bg-gray-400'} mt-1 shrink-0`} />
                                <div className="min-w-0">
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{a.action}</p>
                                  <p className="text-[10px] text-gray-400">{a.time}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Integration Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Integration Status</h4>
                      <div className="space-y-2">
                        {[
                          { name: 'MCOM Rewards', status: 'Coming Soon', detail: 'Rewards & loyalty engine' },
                          { name: 'MCOMMall Cashback', status: 'Coming Soon', detail: 'Cashback functionality' },
                          { name: 'MCOMSpin', status: 'Coming Soon', detail: 'Gamification' },
                          { name: 'FundOrDonate', status: 'Coming Soon', detail: 'Fundraising & donations' },
                        ].map((p) => (
                          <div key={p.name} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-gray-700 dark:text-gray-300">{p.name}</p>
                              <p className="text-[9px] text-gray-400">{p.detail}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">{p.status}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setTab('Account & Integrations')} className="mt-3 w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Account & Integrations →</button>
                    </div>

                    {/* Admin Actions */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">VCard Actions</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: 'Preview VCard', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', action: () => toast.success('Opening VCard preview') },
                          { label: 'Publish VCard', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: () => toast.success('VCard published') },
                          { label: 'Unpublish VCard', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', action: () => toast.success('VCard unpublished') },
                          { label: 'Suspend VCard', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', action: () => toast.success('VCard suspended') },
                          { label: 'Reset QR Config', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: () => toast.success('QR configuration reset') },
                          { label: 'View Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', action: () => setTab('Activity') },
                          { label: 'View Membership', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', action: () => setTab('Membership & Entitlements') },
                          { label: 'View Integrations', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512a9.025 9.025 0 015.488 5.488z', action: () => setTab('Account & Integrations') },
                        ].map((a) => (
                          <button key={a.label} onClick={a.action} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {/* ============================== CONSUMER CARD TAB ============================== */}
          {tab === 'Consumer Card' && (
            <div className="space-y-6">
              {c.cardStatus === 'Not Assigned' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No Consumer Card</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">This consumer does not currently have an active Consumer Card. Consumer Cards are issued through membership allocations or business rewards programs.</p>
                </div>
              ) : (
                <>
                  {/* Page Header */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Consumer Card</h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.cardStatus] || 'text-gray-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.cardStatus] || 'bg-gray-400'}`} />
                              {c.cardStatus}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {c.name} · Consumer ID: {c.consumerId} · {c.email}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                            <span>Card ID: {c.cardId || `CARD-CNS-${String(c.id).padStart(6, '0')}`}</span>
                            <span>·</span>
                            <span>Created: {c.cardCreated || c.joined}</span>
                            <span>·</span>
                            <span>Updated: {c.cardUpdated || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <button onClick={() => toast.success('Opening card preview')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Preview Card</button>
                        <button onClick={() => toast.success('Edit mode opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit Card</button>
                        <button onClick={() => setTab('Consumer VCard')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open VCard</button>
                        <button onClick={() => setTab('Activity')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Activity</button>
                        <button onClick={() => setShowRevokeConfirm(true)} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10">Revoke</button>
                      </div>
                    </div>
                  </div>

                  {/* Card Overview - Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {[
                      { label: 'Card Status', value: c.cardStatus, color: statusColors[c.cardStatus] || 'text-gray-500', section: 'card-identity' },
                      { label: 'Card Type', value: 'Consumer Card', color: 'text-purple-600', section: 'card-identity' },
                      { label: 'Card Template', value: c.cardTemplate || 'Standard', color: 'text-blue-600', section: 'card-template' },
                      { label: 'Issued By', value: c.primaryIssuingBusiness, color: 'text-orange-600', section: 'business-connection' },
                      { label: 'Issued Date', value: c.cardCreated || c.joined, color: 'text-gray-700 dark:text-gray-300', section: 'card-identity' },
                      { label: 'Membership', value: c.membership, color: 'text-emerald-600', section: 'membership-section' },
                      { label: 'Additional Cards', value: `${c.allocatedAdditionalCards} of ${c.additionalEntitlements}`, color: c.unallocatedEntitlements > 0 ? 'text-amber-600' : 'text-green-600', section: 'additional-cards' },
                      { label: 'E-Card', value: c.eCardStatus === 'Available' ? 'Available' : c.eCardStatus === 'Not Available' ? '—' : c.eCardStatus, color: c.eCardStatus === 'Available' ? 'text-green-600' : 'text-gray-400', section: 'ecard-section' },
                    ].map((s) => (
                      <button key={s.label} onClick={() => toast.success(`Scrolling to ${s.label}`) as any} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2.5 text-left hover:shadow-sm transition-all">
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5 truncate">{s.label}</p>
                        <p className={`text-[11px] font-bold ${s.color} truncate`}>{s.value}</p>
                      </button>
                    ))}
                  </div>

                  {/* Card Identity */}
                  <div id="card-identity" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Identity</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <InfoRow label="Card ID" value={c.cardId || `CARD-CNS-${String(c.id).padStart(6, '0')}`} />
                        <InfoRow label="Consumer ID" value={c.consumerId} />
                        <InfoRow label="Card Type" value="Consumer Card" />
                        <InfoRow label="Card Template" value={c.cardTemplate || 'Standard Consumer Card'} />
                        <InfoRow label="Membership" value={c.membership} />
                        <InfoRow label="Status" value={c.cardStatus} />
                      </div>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <InfoRow label="Created Date" value={c.cardCreated || c.joined} />
                        <InfoRow label="Last Updated" value={c.cardUpdated || '—'} />
                        <InfoRow label="Issued By" value={c.primaryIssuingBusiness} />
                        <InfoRow label="Source" value={c.cardSource || c.registrationSource} />
                        <InfoRow label="Acquisition Method" value={c.cardAcquisitionMethod || '—'} />
                        <InfoRow label="Source Platform" value={c.cardSourcePlatform || 'Coming Soon / External Integration'} />
                      </div>
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Preview</h4>
                      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                        <button onClick={() => setCPreviewMode('desktop')} className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${cPreviewMode === 'desktop' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>Desktop</button>
                        <button onClick={() => setCPreviewMode('mobile')} className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${cPreviewMode === 'mobile' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>Mobile</button>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-br from-purple-700 to-purple-900 rounded-xl p-5 text-white ${cPreviewMode === 'mobile' ? 'max-w-xs mx-auto' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-lg font-bold">{c.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-base">{c.name}</p>
                          <p className="text-[10px] text-purple-200">Consumer Card</p>
                          <p className="text-[10px] text-purple-300">ID: {c.cardId || `CARD-CNS-${String(c.id).padStart(6, '0')}`}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-purple-200 mb-4">
                        <div>
                          <p className="text-[9px] text-purple-300">Email</p>
                          <p className="truncate">{c.email}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-purple-300">Phone</p>
                          <p>{c.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] text-purple-300">Location</p>
                          <p className="truncate">{c.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-purple-600">
                        <div>
                          <p className="text-[9px] text-purple-300">Membership</p>
                          <p className="text-xs font-semibold">{c.membership}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-purple-300">Status</p>
                          <p className="text-xs font-semibold text-green-300">{c.cardStatus}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Template */}
                  <div id="card-template" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Template</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <InfoRow label="Template" value={c.cardTemplate || 'Consumer Card — Standard'} />
                        <InfoRow label="Template ID" value={`TPL-CONS-${String(c.id).padStart(3, '0')}`} />
                        <InfoRow label="Version" value="2.1" />
                        <InfoRow label="Status" value="Published" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toast.success('Viewing template details')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Template</button>
                      <button onClick={() => setShowChangeTemplate(true)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Change Template</button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Content</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 font-medium mb-2">Consumer Information</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{c.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 font-medium mb-2">Social Links</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'X', 'YouTube', 'Website'].map((s) => (
                            <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium ${['Facebook', 'Instagram', 'LinkedIn'].includes(s) ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 font-medium mb-2">Card Links</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-300 shrink-0" />
                            <span className="text-orange-600">Personal Website</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <span className="text-gray-400">Portfolio</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <span className="text-gray-400">Booking Link</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toast.success('Edit mode opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit Content</button>
                  </div>

                  {/* Social / Share Content */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Social / Share Content</h4>
                    {c.shareContent.length === 0 ? (
                      <EmptySection title="No shareable content available" desc="No shareable content is currently available for this consumer's Card." />
                    ) : (
                      <div className="space-y-3">
                        {c.shareContent.map((sc) => (
                          <div key={sc.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{sc.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sc.status === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>{sc.status}</span>
                                <span className="text-[9px] text-gray-400">Available until: {sc.availableUntil}</span>
                              </div>
                              <p className="text-[9px] text-gray-400 mt-0.5">Source: {sc.source}</p>
                            </div>
                            <button onClick={() => toast.success(`Previewing: ${sc.title}`)} className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[9px] font-semibold hover:bg-orange-600 shrink-0">Preview</button>
                          </div>
                        ))}
                        {c.shareContent.some(sc => sc.source === 'External Platform') && (
                          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-2.5 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-[9px] text-amber-700 dark:text-amber-400">Some share content comes from external platforms. Integration status: <strong>Coming Soon</strong>.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dynamic QR Code */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Dynamic QR Code</h4>
                    {c.qrStatus === 'Inactive' ? (
                      <div className="text-center py-4">
                        <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">QR Code Inactive</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">This card's QR code is currently inactive.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 text-gray-800" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm1 1h3v3H5V5zm10-2h7v7h-7V3zm1 1v5h5V4h-5zm1 1h3v3h-3V5zM3 14h7v7H3v-7zm1 1v5h5v-5H4zm1 1h3v3H5v-3zm10-2h7v7h-7v-7zm1 1v5h5v-5h-5zm1 1h3v3h-3v-3z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${c.qrStatus === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.qrStatus === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                QR {c.qrStatus}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">{c.qrId}</span>
                            </div>
                            <button onClick={() => toast.success('QR configuration reset')} className="text-[10px] text-orange-600 hover:underline">Reset QR Config</button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                            <InfoRow label="Destination" value={`${c.primaryIssuingBusiness} Card Experience`} />
                            <InfoRow label="Update Frequency" value={c.qrUpdateFrequency || 'Dynamic'} />
                            <InfoRow label="Last Content Update" value={c.qrLastContentUpdate || '—'} />
                            <InfoRow label="Last Scanned" value={c.qrLastScanned || '—'} />
                            <InfoRow label="Total Scans" value={`${c.stats.scans}`} />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => toast.success('QR downloaded')} className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[9px] font-semibold hover:bg-orange-600">Download QR</button>
                            <button onClick={() => toast.success('Link copied')} className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[9px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Link</button>
                            <button onClick={() => toast.success('QR regenerated')} className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[9px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Regenerate</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Cards / F&F */}
                  <div id="additional-cards" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Additional Card Entitlements</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{c.additionalEntitlements}</p>
                        <p className="text-[10px] text-gray-500">Total Additional Cards</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-blue-600">{c.allocatedAdditionalCards}</p>
                        <p className="text-[10px] text-gray-500">Allocated</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-amber-600">{c.unallocatedEntitlements}</p>
                        <p className="text-[10px] text-gray-500">Unallocated</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                            <th className="text-left px-2 py-1.5 font-medium">Card</th>
                            <th className="text-left px-2 py-1.5 font-medium">Allocation</th>
                            <th className="text-left px-2 py-1.5 font-medium">Relationship</th>
                            <th className="text-left px-2 py-1.5 font-medium">Status</th>
                            <th className="text-left px-2 py-1.5 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-50 dark:border-gray-700/50">
                            <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">Primary</td>
                            <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{c.name}</td>
                            <td className="px-2 py-1.5 text-gray-500">Owner</td>
                            <td className="px-2 py-1.5"><span className="text-green-600 font-medium">Active</span></td>
                            <td className="px-2 py-1.5"><span className="text-gray-400">—</span></td>
                          </tr>
                          {c.additionalCards.map((ac) => (
                            <tr key={ac.id} className="border-b border-gray-50 dark:border-gray-700/50">
                              <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{`Subcard ${ac.id}`}</td>
                              <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{ac.name}</td>
                              <td className="px-2 py-1.5">
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${ac.relationship === 'Family' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600'}`}>{ac.relationship}</span>
                              </td>
                              <td className="px-2 py-1.5">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${ac.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ac.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  {ac.status}
                                  {ac.locked && <svg className="w-2.5 h-2.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                                </span>
                              </td>
                              <td className="px-2 py-1.5">
                                {ac.locked ? (
                                  <button onClick={() => { setOverrideCardId(ac.id); setShowOverrideModal(true) }} className="text-orange-600 hover:underline text-[9px]">Override</button>
                                ) : (
                                  <span className="text-gray-400 text-[9px]">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {Array.from({ length: c.unallocatedEntitlements }, (_, i) => (
                            <tr key={`unalloc-${i}`} className="border-b border-gray-50 dark:border-gray-700/50">
                              <td className="px-2 py-1.5 font-medium text-gray-400">{`Subcard ${c.additionalCards.length + i + 1}`}</td>
                              <td className="px-2 py-1.5 text-gray-400">—</td>
                              <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 text-[9px] font-medium">Unallocated</span></td>
                              <td className="px-2 py-1.5"><span className="text-gray-400">Available</span></td>
                              <td className="px-2 py-1.5"><span className="text-gray-400 text-[9px]">—</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {c.unallocatedEntitlements > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-2.5 mt-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-[9px] text-amber-700 dark:text-amber-400">Allocation is locked once assigned. The consumer chooses allocation from their dashboard. Admin override requires confirmation and audit logging.</p>
                      </div>
                    )}
                  </div>

                  {/* E-Card Entitlement */}
                  <div id="ecard-section" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">E-Card Entitlement</h4>
                    {c.eCardStatus === 'Not Available' ? (
                      <EmptySection title="No e-card entitlement available" desc="This consumer's membership does not include e-card entitlements." />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                          <InfoRow label="Status" value={c.eCardStatus} />
                          <InfoRow label="Face Value" value={c.eCardFaceValue || '—'} />
                          <InfoRow label="Source" value={c.eCardSource || '—'} />
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                          <InfoRow label="E-Card ID" value={c.eCardId || '—'} />
                          <InfoRow label="Issue Date" value={c.eCardIssueDate || '—'} />
                          <InfoRow label="Expiry Date" value={c.eCardExpiryDate || '—'} />
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-3">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">E-Card Monetary Engine</span>
                        <span className="text-gray-400">Coming Soon — External Integration</span>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">The actual monetary e-card engine will be connected from an external platform. MCOMVCard reserves the data structure for e-card ID, face value, issuing business, recipient, status, issue date, expiry date, and redemption status.</p>
                    </div>
                  </div>

                  {/* Business Connection */}
                  <div id="business-connection" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Business Connection</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <InfoRow label="Issuing Business" value={c.primaryIssuingBusiness} />
                        <InfoRow label="Business ID" value={`BUS-${String(c.primaryIssuingBusinessId).padStart(6, '0')}`} />
                        <InfoRow label="Relationship" value="Rewarding Business" />
                      </div>
                      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <InfoRow label="Issued Through" value={c.registrationSource === 'Business' ? 'Business Reward' : c.registrationSource === 'Campaign' ? 'Campaign' : 'MCOM Solutions'} />
                        <InfoRow label="Date Issued" value={c.cardCreated || c.joined} />
                        <InfoRow label="Connected Businesses" value={`${c.businessCount}`} />
                      </div>
                    </div>
                    <button onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)} className="mt-3 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">View Business →</button>
                  </div>

                  {/* Card Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Activity</h4>
                      <button onClick={() => setTab('Activity')} className="text-[10px] text-orange-600 hover:underline">View Full Activity →</button>
                    </div>
                    {c.cardActivity.length === 0 ? (
                      <EmptySection title="No Card activity recorded yet" desc="No Card activity has been recorded yet." />
                    ) : (
                      <div className="space-y-0">
                        {c.cardActivity.slice(0, 6).map((a, i) => {
                          const typeDots: Record<string, string> = { card: 'bg-blue-400', nfc: 'bg-teal-400', reward: 'bg-purple-400', referral: 'bg-orange-400', alert: 'bg-red-400', milestone: 'bg-yellow-400' }
                          return (
                            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                              <div className={`w-2 h-2 rounded-full ${typeDots[a.type] || 'bg-gray-400'} mt-1 shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{a.action}</p>
                                  <span className={`text-[9px] px-1 py-0.5 rounded-full font-medium ${a.status === 'Successful' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : a.status === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'}`}>{a.status}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                                  <span>{a.time}</span>
                                  <span>·</span>
                                  <span>{a.actor}</span>
                                  <span>·</span>
                                  <span>{a.source}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Integrations */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Integrations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {[
                        { name: 'MCOM Solutions', status: 'Connected', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                        { name: 'MCOM Rewards', status: 'Coming Soon', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
                        { name: '247GBS Rewards', status: 'Coming Soon', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { name: 'MCOMMall Cashback', status: 'Coming Soon', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                        { name: 'MCOMSpin', status: 'Coming Soon', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                        { name: 'FundOrDonate', status: 'Coming Soon', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center gap-2.5 py-2 px-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                          <div className={`w-7 h-7 rounded-lg ${p.status === 'Connected' ? 'bg-green-100 dark:bg-green-500/10' : 'bg-gray-100 dark:bg-gray-600'} flex items-center justify-center shrink-0`}>
                            <svg className={`w-3.5 h-3.5 ${p.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{p.name}</p>
                            <span className={`text-[8px] font-medium ${p.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`}>{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Actions</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Preview Card', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', action: () => toast.success('Opening card preview') },
                        { label: 'Edit Card', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', action: () => toast.success('Edit mode opened') },
                        { label: 'Change Status', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', action: () => toast.success('Status change wizard opened') },
                        { label: 'Change Template', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', action: () => setShowChangeTemplate(true) },
                        { label: 'Open VCard', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1', action: () => setTab('Consumer VCard') },
                        { label: 'View Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', action: () => setTab('Activity') },
                        { label: c.cardStatus === 'Active' ? 'Suspend Card' : 'Activate Card', icon: c.cardStatus === 'Active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: () => toast.success(c.cardStatus === 'Active' ? 'Card suspended' : 'Card activated') },
                        { label: 'Revoke Card', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: () => setShowRevokeConfirm(true) },
                      ].map((a) => (
                        <button key={a.label} onClick={a.action} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${a.label.includes('Revoke') ? 'border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : a.label.includes('Suspend') ? 'border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Change Template Modal */}
                  {showChangeTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowChangeTemplate(false)}>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Change Card Template</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select a new template for this Consumer Card. Only the visual design will change — consumer information is preserved. Changing the template will affect the live Card.</p>
                        <div className="space-y-2 mb-4">
                          {[
                            { name: 'Consumer Card — Standard', status: 'Active', desc: 'Clean standard design for consumer cards', current: true },
                            { name: 'Consumer Card — Premium', status: 'Active', desc: 'Premium dark design with gold accents', current: false },
                            { name: 'Consumer Card — Minimal', status: 'Active', desc: 'Clean contemporary minimal design', current: false },
                            { name: 'Consumer Card — Bold', status: 'Active', desc: 'Bold vibrant design with accent colors', current: false },
                            { name: 'Consumer Card — Eco', status: 'Inactive', desc: 'Natural green design', current: false },
                          ].map((t) => (
                            <button key={t.name} onClick={() => toast.success(`Template changed to ${t.name}`)} className={`w-full text-left p-3 rounded-lg border transition-colors ${t.current ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}{t.current && <span className="text-[10px] text-orange-600 ml-2">Current</span>}</p>
                                  <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${t.status === 'Active' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>{t.status}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowChangeTemplate(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                          <button onClick={() => { toast.success('Template applied'); setShowChangeTemplate(false) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Apply Template</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revoke Confirmation Modal */}
                  {showRevokeConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowRevokeConfirm(false)}>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Revoke Consumer Card?</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This will permanently invalidate this consumer Card. The consumer will no longer be able to use this Card. This action cannot be undone.</p>
                        <div className="mb-4">
                          <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Reason for Revocation</label>
                          <input type="text" placeholder="Enter reason" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowRevokeConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                          <button onClick={() => { setShowRevokeConfirm(false); toast.success('Card permanently revoked') }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Revoke Card</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Override Modal */}
                  {showOverrideModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowOverrideModal(false)}>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Admin Override — Locked Allocation</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This allocation is locked. Admin override requires a reason and will be recorded in the audit log.</p>
                        <div className="mb-3">
                          <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Card</label>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.additionalCards.find(ac => ac.id === overrideCardId)?.name || `Subcard ${overrideCardId}`}</p>
                        </div>
                        <div className="mb-4">
                          <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Override Reason</label>
                          <input type="text" placeholder="Enter reason for override" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowOverrideModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                          <button onClick={() => { setShowOverrideModal(false); toast.success('Override applied and logged to audit'); setOverrideCardId(null) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Confirm Override</button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ============================== MEMBERSHIP & ENTITLEMENTS TAB ============================== */}
          {tab === 'Membership & Entitlements' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Consumer Membership & Entitlements</h1>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.membershipStatus] || 'text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.membershipStatus] || 'bg-gray-400'}`} />
                          {c.membershipStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.name} · Consumer ID: {c.consumerId} · {c.email}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                        <span>Membership: <strong className="text-gray-700 dark:text-gray-300">{c.membership}</strong></span>
                        <span>·</span>
                        <span>Joined: {c.joined}</span>
                        <span>·</span>
                        <span>Last Activity: {c.lastActivityAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button onClick={() => setShowChangeMembership(true)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Change Membership</button>
                    <button onClick={() => toast.success('Opening entitlement addition wizard')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Add Entitlement</button>
                    <button onClick={() => toast.success('Opening allocation wizard')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Allocate Additional Card</button>
                    <button onClick={() => setTab('Activity')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Activity</button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-3 border-t border-gray-50 dark:border-gray-700 pt-2">Manage this consumer's membership level, card entitlements, additional card allocations, and associated benefits.</p>
              </div>

              {/* Membership Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Membership Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{c.membership.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.membership}</p>
                        <p className="text-[10px] text-gray-500">Current Plan</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Tier</span><span className="font-medium text-gray-700 dark:text-gray-300">{c.membership.split(' ')[0]}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Plan</span><span className="font-medium text-gray-700 dark:text-gray-300">{c.membership.split(' ').slice(1).join(' ') || 'Standard'}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Status</span><span className={`font-medium ${c.membershipStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{c.membershipStatus}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Started</span><span className="font-medium text-gray-700 dark:text-gray-300">{c.joined}</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-gray-400">Renewal</span><span className="font-medium text-gray-700 dark:text-gray-300">{['Jan 2027', 'Mar 2027', 'Jun 2027', 'Dec 2026'][c.id % 4]}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <p className="text-[10px] text-gray-500 font-medium mb-2">Entitlement Summary</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] text-gray-500">Primary VCard</span>
                        <span className="text-[10px] font-bold text-green-600">1 · Active</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] text-gray-500">Primary Card</span>
                        <span className={`text-[10px] font-bold ${c.cardStatus === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>1{c.cardStatus !== 'Not Assigned' ? ` · ${c.cardStatus}` : ' · Not Issued'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] text-gray-500">Additional Cards</span>
                        <span className="text-[10px] font-bold text-amber-600">{c.allocatedAdditionalCards} of {c.additionalEntitlements}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-[10px] text-gray-500">E-Card Entitlements</span>
                        <span className={`text-[10px] font-bold ${c.eCardStatus === 'Available' ? 'text-green-600' : 'text-gray-400'}`}>{c.eCardStatus || 'Not Available'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <p className="text-[10px] text-gray-500 font-medium mb-2">Allocation Usage</p>
                    <div className="flex items-end gap-3 mb-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.additionalEntitlements}</p>
                        <p className="text-[9px] text-gray-500">Allowed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{c.allocatedAdditionalCards}</p>
                        <p className="text-[9px] text-gray-500">Allocated</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{c.unallocatedEntitlements}</p>
                        <p className="text-[9px] text-gray-500">Available</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${c.additionalEntitlements > 0 ? Math.round((c.allocatedAdditionalCards / c.additionalEntitlements) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <p className="text-[10px] text-gray-500 font-medium mb-2">Quick Links</p>
                    <div className="space-y-2">
                      <button onClick={() => setTab('Consumer VCard')} className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[10px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">View Consumer VCard →</button>
                      <button onClick={() => setTab('Consumer Card')} className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[10px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">View Consumer Card →</button>
                      <button onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)} className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[10px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">View Issuing Business →</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Source */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Membership Source</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Received Through" value={c.cardSource || c.registrationSource} />
                    <InfoRow label="Business" value={c.primaryIssuingBusiness} />
                    <InfoRow label="Issued By" value={c.registrationSource === 'Business' ? 'Business Account' : c.registrationSource === 'MCOM Solutions' ? 'MCOM Solutions' : 'Campaign'} />
                    <InfoRow label="Issued Date" value={c.cardCreated || c.joined} />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Acquisition Method" value={c.cardAcquisitionMethod || c.registrationSource} />
                    <InfoRow label="Source Platform" value={c.cardSourcePlatform || 'MCOMVCard'} />
                    <InfoRow label="Business ID" value={`BUS-${String(c.primaryIssuingBusinessId).padStart(6, '0')}`} />
                    <InfoRow label="Business Membership" value={['Enterprise', 'Business', 'Starter', 'Free'][c.primaryIssuingBusinessId % 4]} />
                  </div>
                </div>
              </div>

              {/* Membership Progression */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Membership Progression</h4>
                {(() => {
                  const levels = ['Bronze', 'Silver', 'Gold', 'Platinum']
                  const variants = ['', ' Pro', ' Pro+']
                  const allTiers: string[] = []
                  levels.forEach(l => variants.forEach(v => allTiers.push(l + v)))
                  const currentIdx = allTiers.indexOf(c.membership)
                  const nextTier = currentIdx >= 0 && currentIdx < allTiers.length - 1 ? allTiers[currentIdx + 1] : null
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center flex-wrap gap-2">
                        {allTiers.map((tier, i) => {
                          const isReached = i <= currentIdx
                          const isCurrent = i === currentIdx
                          const level = levels[Math.floor(i / 3)]
                          const levelColors: Record<string, string> = { Bronze: 'bg-amber-500', Silver: 'bg-gray-400', Gold: 'bg-yellow-500', Platinum: 'bg-emerald-500' }
                          return (
                            <div key={tier} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${isCurrent ? 'ring-2 ring-orange-500 ' : ''}${isReached ? levelColors[level] + ' text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                              {tier}
                              {isCurrent && <span className="ml-0.5">●</span>}
                            </div>
                          )
                        })}
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-[10px]">
                          <div>
                            <span className="text-gray-500">Current: </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{c.membership}</span>
                            {nextTier && <><span className="text-gray-400 mx-1">→</span><span className="text-gray-500">Next: </span><span className="font-medium text-orange-600">{nextTier}</span></>}
                          </div>
                          <span className="text-green-600 font-medium">Progressing</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${currentIdx >= 0 ? Math.round((currentIdx / (allTiers.length - 1)) * 100) : 0}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-400">{currentIdx >= 0 ? Math.round((currentIdx / (allTiers.length - 1)) * 100) : 0}%</span>
                        </div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-2.5 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-[9px] text-amber-700 dark:text-amber-400">Rewards Progression — Coming Soon. Progress determined by external Rewards platform once integrated.</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* VCard Entitlement */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer VCard Entitlement</h4>
                  <button onClick={() => setTab('Consumer VCard')} className="text-[10px] text-orange-600 hover:underline">View Consumer VCard →</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="VCard Status" value={c.vcardStatus} />
                    <InfoRow label="VCard ID" value={c.consumerId.replace('MC-CNS', 'VC-CNS')} />
                    <InfoRow label="Membership Level" value={c.membership} />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Issuing Business" value={c.primaryIssuingBusiness} />
                    <InfoRow label="Date Received" value={c.joined} />
                    <InfoRow label="Activation Status" value={c.vcardStatus === 'Active' ? 'Activated' : c.vcardStatus} />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Current Level" value={c.membership} />
                    <InfoRow label="Progression" value="Active" />
                    <InfoRow label="QR Status" value={c.qrStatus || '—'} />
                  </div>
                </div>
              </div>

              {/* Consumer Card Entitlement */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer Card Entitlement</h4>
                  <button onClick={() => setTab('Consumer Card')} className="text-[10px] text-orange-600 hover:underline">View Consumer Card →</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Card Status" value={c.cardStatus} />
                    <InfoRow label="Card ID" value={c.cardId || `CARD-CNS-${String(c.id).padStart(6, '0')}`} />
                    <InfoRow label="Card Template" value={c.cardTemplate || 'Standard Consumer Card'} />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Issuing Business" value={c.primaryIssuingBusiness} />
                    <InfoRow label="Date Issued" value={c.cardCreated || c.joined} />
                    <InfoRow label="Activation Status" value={c.cardStatus === 'Active' ? 'Activated' : c.cardStatus === 'Suspended' ? 'Suspended' : c.cardStatus} />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Current Membership" value={c.membership} />
                    <InfoRow label="Associated VCard" value={c.vcardStatus === 'Active' ? 'Linked' : 'Not Linked'} />
                    <InfoRow label="Source" value={c.cardSource || c.registrationSource} />
                  </div>
                </div>
              </div>

              {/* Additional Card Entitlements */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Additional Card Entitlements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.additionalEntitlements}</p>
                    <p className="text-[10px] text-gray-500">Membership Allows</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{c.allocatedAdditionalCards}</p>
                    <p className="text-[10px] text-gray-500">Allocated</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{c.unallocatedEntitlements}</p>
                    <p className="text-[10px] text-gray-500">Available</p>
                  </div>
                </div>
                {c.additionalCards.length > 0 || c.unallocatedEntitlements > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left px-2 py-1.5 font-medium">Card</th>
                          <th className="text-left px-2 py-1.5 font-medium">Assigned To</th>
                          <th className="text-left px-2 py-1.5 font-medium">Type</th>
                          <th className="text-left px-2 py-1.5 font-medium">Status</th>
                          <th className="text-left px-2 py-1.5 font-medium">Allocated</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-50 dark:border-gray-700/50">
                          <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">Primary</td>
                          <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{c.name}</td>
                          <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-[9px] font-medium">Owner</span></td>
                          <td className="px-2 py-1.5"><span className="text-green-600 font-medium">Active</span></td>
                          <td className="px-2 py-1.5 text-gray-400">—</td>
                        </tr>
                        {c.additionalCards.map((ac) => (
                          <tr key={ac.id} className="border-b border-gray-50 dark:border-gray-700/50">
                            <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{`Card ${ac.id}`}</td>
                            <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{ac.name}</td>
                            <td className="px-2 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${ac.relationship === 'Family' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600'}`}>{ac.relationship}</span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${ac.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${ac.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                {ac.status}{ac.locked ? ' 🔒' : ''}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-[9px] text-gray-500">{ac.allocatedAt}</td>
                          </tr>
                        ))}
                        {Array.from({ length: c.unallocatedEntitlements }, (_, i) => (
                          <tr key={`unalloc-${i}`} className="border-b border-gray-50 dark:border-gray-700/50">
                            <td className="px-2 py-1.5 font-medium text-gray-400">{`Card ${c.additionalCards.length + i + 1}`}</td>
                            <td className="px-2 py-1.5 text-gray-400">—</td>
                            <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 text-[9px] font-medium">Unallocated</span></td>
                            <td className="px-2 py-1.5"><span className="text-gray-400">Available</span></td>
                            <td className="px-2 py-1.5 text-gray-400">—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptySection title="No additional cards available" desc="This membership does not currently provide additional card entitlements." />
                )}
                <p className="text-[9px] text-gray-400 mt-3">Primary Consumer Card = 1 · Additional Entitlements = {c.additionalEntitlements} · Total Potential Cards = {c.additionalEntitlements + 1}</p>
              </div>

              {/* Friends & Family Allocations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Friends & Family Allocations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Primary</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{c.name}</p>
                    <p className="text-[10px] text-green-600 font-medium">Active</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Family</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{c.familyAllocations} allocated</p>
                    {c.familyAllocations > 0 ? c.additionalCards.filter(ac => ac.relationship === 'Family').map(ac => (
                      <div key={ac.id} className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span className="text-gray-700 dark:text-gray-300">{ac.name}</span>
                        <span className="text-green-600">Active</span>
                        {ac.locked && <span className="text-[9px] text-gray-400">🔒</span>}
                      </div>
                    )) : <p className="text-[10px] text-gray-400 mt-1">None allocated</p>}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Friends</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{c.friendAllocations} allocated</p>
                    {c.friendAllocations > 0 ? c.additionalCards.filter(ac => ac.relationship === 'Friend').map(ac => (
                      <div key={ac.id} className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span className="text-gray-700 dark:text-gray-300">{ac.name}</span>
                        <span className="text-green-600">Active</span>
                        {ac.locked && <span className="text-[9px] text-gray-400">🔒</span>}
                      </div>
                    )) : <p className="text-[10px] text-gray-400 mt-1">None allocated</p>}
                  </div>
                </div>
                {c.unallocatedEntitlements > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-2.5 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-[9px] text-amber-700 dark:text-amber-400">{c.unallocatedEntitlements} additional card entitlement{c.unallocatedEntitlements > 1 ? 's are' : ' is'} available for allocation. Allocation is locked once assigned. Admin override requires confirmation and audit logging.</p>
                  </div>
                )}
                <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-2.5 mt-2 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-[9px] text-amber-700 dark:text-amber-400">Allocation Locked: Once a consumer assigns an additional card as Family or Friend, the allocation is locked. The consumer cannot freely switch between categories. Admin override requires a reason and is recorded in the audit log.</p>
                </div>
              </div>

              {/* E-Card Entitlements */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">E-Card Entitlements</h4>
                {c.eCardStatus === 'Not Available' ? (
                  <EmptySection title="No e-card entitlement available" desc="No e-card entitlement is currently associated with this consumer. E-Card integration is coming soon." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      <InfoRow label="Entitlement" value="E-Card" />
                      <InfoRow label="Face Value" value={c.eCardFaceValue || '—'} />
                      <InfoRow label="Status" value={c.eCardStatus} />
                      <InfoRow label="Usage" value="Restricted" />
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      <InfoRow label="Source" value={c.eCardSource || 'Membership'} />
                      <InfoRow label="E-Card ID" value={c.eCardId || '—'} />
                      <InfoRow label="Issue Date" value={c.eCardIssueDate || '—'} />
                      <InfoRow label="Expiry Date" value={c.eCardExpiryDate || '—'} />
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">E-Card Monetary System</span>
                    <span className="text-gray-400">Coming Soon — External Integration</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">The actual monetary e-card engine will be connected from an external platform. MCOMVCard reserves the data structure for e-card ID, face value, issuing business, recipient, status, issue date, expiry date, and redemption status.</p>
                </div>
              </div>

              {/* Issuing Business */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Issuing Business</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Business" value={c.primaryIssuingBusiness} />
                    <InfoRow label="Business ID" value={`BUS-${String(c.primaryIssuingBusinessId).padStart(6, '0')}`} />
                    <InfoRow label="Business Membership" value={['Enterprise', 'Business', 'Starter', 'Free'][c.primaryIssuingBusinessId % 4]} />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Consumer Reward Issued" value={c.vcardStatus === 'Not Assigned' ? 'Not Yet' : c.cardStatus === 'Not Assigned' ? 'VCard Only' : 'VCard & Card'} />
                    <InfoRow label="Additional Cards Granted" value={`${c.allocatedAdditionalCards} of ${c.additionalEntitlements}`} />
                    <InfoRow label="E-Card Entitlements" value={c.eCardStatus === 'Not Available' ? 'None' : c.eCardStatus} />
                  </div>
                </div>
                <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <p className="text-[9px] text-gray-500 leading-relaxed">
                    <strong className="text-gray-700 dark:text-gray-300">Full Chain:</strong> {c.primaryIssuingBusiness} Membership → Business receives allocation capability → Business rewards Consumer → Consumer receives VCard/Card → Consumer receives {c.membership} level → Membership determines {c.additionalEntitlements} additional cards → Additional cards receive Family/Friend allocation → Associated e-card entitlements.
                  </p>
                </div>
                <button onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)} className="mt-3 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">View Issuing Business →</button>
              </div>

              {/* Entitlement History */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Entitlement & Allocation History</h4>
                  <button onClick={() => setTab('Activity')} className="text-[10px] text-orange-600 hover:underline">View Full Activity →</button>
                </div>
                {c.cardActivity.length === 0 && c.recentActivity.length === 0 ? (
                  <EmptySection title="No entitlement history recorded yet" desc="No entitlement or allocation history has been recorded yet." />
                ) : (
                  <div className="space-y-0">
                    {c.cardActivity.slice(0, 5).map((a, i) => {
                      const typeDots: Record<string, string> = { card: 'bg-blue-400', nfc: 'bg-teal-400', reward: 'bg-purple-400', referral: 'bg-orange-400', alert: 'bg-red-400', milestone: 'bg-yellow-400' }
                      return (
                        <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                          <div className={`w-2 h-2 rounded-full ${typeDots[a.type] || 'bg-gray-400'} mt-1 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] text-gray-700 dark:text-gray-300">{a.action}</p>
                              <span className={`text-[9px] px-1 py-0.5 rounded-full font-medium ${a.status === 'Successful' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600'}`}>{a.status}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                              <span>{a.time}</span>
                              <span>·</span>
                              <span>{a.actor}</span>
                              <span>·</span>
                              <span>{a.source}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {c.recentActivity.slice(0, 3).map((a, i) => {
                      const dotColors: Record<string, string> = { reward: 'bg-purple-400', earn: 'bg-green-400', referral: 'bg-orange-400', card: 'bg-blue-400', nfc: 'bg-teal-400', booking: 'bg-indigo-400', milestone: 'bg-yellow-400', alert: 'bg-red-400', profile: 'bg-gray-400' }
                      return (
                        <div key={`ra-${i}`} className="flex items-start gap-2.5 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                          <div className={`w-2 h-2 rounded-full ${dotColors[a.type] || 'bg-gray-400'} mt-1 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-700 dark:text-gray-300">{a.action}</p>
                            <p className="text-[9px] text-gray-400">{a.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Admin Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { label: 'Change Membership', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', action: () => setShowChangeMembership(true), danger: false },
                    { label: 'Upgrade', icon: 'M13 7l5 5m0 0l-5 5m5-5H6', action: () => toast.success('Upgrade wizard opened'), danger: false },
                    { label: 'Downgrade', icon: 'M11 17l-5-5m0 0l5-5m-5 5h12', action: () => toast.success('Downgrade wizard opened — impact assessment required'), danger: false },
                    { label: c.membershipStatus === 'Active' ? 'Suspend Membership' : 'Reactivate', icon: c.membershipStatus === 'Active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: () => toast.success(c.membershipStatus === 'Active' ? 'Membership suspended' : 'Membership reactivated'), danger: c.membershipStatus === 'Active' },
                    { label: 'Allocate Card', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857', action: () => toast.success('Opening allocation wizard'), danger: false },
                    { label: 'View Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', action: () => setTab('Activity'), danger: false },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${a.danger ? 'border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Membership Modal */}
              {showChangeMembership && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowChangeMembership(false)}>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Change Membership</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select a new membership plan for this consumer. Only active plans from Pricing/Membership Plans are shown.</p>

                    {/* Current Plan */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mb-4">
                      <p className="text-[10px] text-gray-500 mb-1">Current Membership</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{c.membership}</p>
                      <p className="text-[10px] text-gray-500">Additional Cards: {c.additionalEntitlements} · Allocated: {c.allocatedAdditionalCards} · Available: {c.unallocatedEntitlements}</p>
                    </div>

                    {/* New Plan Select */}
                    <div className="mb-4">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1.5">New Membership Plan</label>
                      <select value={selectedNewPlan} onChange={(e) => {
                        const val = e.target.value
                        setSelectedNewPlan(val)
                        if (val) {
                          const newAllocations = [1, 2, 3, 5, 8][['Bronze', 'Bronze Pro', 'Silver', 'Gold', 'Platinum'].indexOf(val.split(' ')[0]) + 1] || 2
                          if (newAllocations < c.allocatedAdditionalCards) {
                            setNewPlanWarning(`This consumer currently has ${c.allocatedAdditionalCards} allocated additional card(s). The selected membership allows only ${newAllocations}. You must resolve the existing allocations before applying this membership change.`)
                          } else {
                            setNewPlanWarning('')
                          }
                        } else {
                          setNewPlanWarning('')
                        }
                      }} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">— Select a plan —</option>
                        {['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'].map((plan) => (
                          <option key={plan} value={plan} disabled={plan === c.membership}>{plan}{plan === c.membership ? ' (current)' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Impact Assessment */}
                    {selectedNewPlan && !newPlanWarning && (
                      <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3 mb-4">
                        <p className="text-[10px] font-medium text-green-700 dark:text-green-400 mb-1">Impact Assessment</p>
                        <div className="text-[9px] text-green-600 dark:text-green-300 space-y-0.5">
                          <p>Current additional cards: {c.additionalEntitlements} → New additional cards: {[1, 2, 3, 5, 8][['Bronze', 'Bronze Pro', 'Silver', 'Gold', 'Platinum'].indexOf(selectedNewPlan.split(' ')[0]) + 1] || 2}</p>
                          <p>Existing allocations: {c.allocatedAdditionalCards} · New available allocations: {([1, 2, 3, 5, 8][['Bronze', 'Bronze Pro', 'Silver', 'Gold', 'Platinum'].indexOf(selectedNewPlan.split(' ')[0]) + 1] || 2) - c.allocatedAdditionalCards}</p>
                        </div>
                      </div>
                    )}

                    {newPlanWarning && (
                      <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-[10px] text-red-700 dark:text-red-400">{newPlanWarning}</p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setShowChangeMembership(false); setNewPlanWarning(''); setSelectedNewPlan('') }} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                      <button onClick={() => { if (!newPlanWarning) { toast.success(`Membership changed to ${selectedNewPlan}`); setShowChangeMembership(false); setNewPlanWarning(''); setSelectedNewPlan('') } else { toast.error('Resolve existing allocations first') } }} className={`px-4 py-2 rounded-lg text-xs font-semibold ${newPlanWarning ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>Apply Change</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================== ACTIVITY TAB ============================== */}
          {tab === 'Activity' && (
            <div className="space-y-6">
              {/* Activity Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Activity Timeline</h4>
                      <span className="text-[10px] text-gray-400">({c.recentActivity.length + c.cardActivity.length} events)</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Complete activity record for {c.name} — membership, VCard/Card events, rewards, allocations, QR activity, admin actions, and external platform events</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toast.success('Activity exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export Activity</button>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(() => {
                  const t: Record<string, number> = {}
                  const ct: Record<string, number> = {}
                  c.recentActivity.forEach(a => { t[a.type] = (t[a.type] || 0) + 1 })
                  c.cardActivity.forEach(a => { ct[a.type] = (ct[a.type] || 0) + 1 })
                  const memberEvents = (t['milestone'] || 0) + (t['alert'] || 0)
                  const rewardEvents = (t['reward'] || 0) + (ct['reward'] || 0) + (t['earn'] || 0) + (t['referral'] || 0)
                  const vcardEvents = (t['profile'] || 0)
                  const cardEvents = (t['card'] || 0) + (ct['card'] || 0) + (ct['nfc'] || 0)
                  const qrEvents = (t['nfc'] || 0)
                  return [
                    { label: 'Total Events', value: c.recentActivity.length + c.cardActivity.length, color: 'text-gray-900 dark:text-white' },
                    { label: 'Membership', value: memberEvents, color: 'text-emerald-600' },
                    { label: 'VCard Activity', value: vcardEvents, color: 'text-orange-600' },
                    { label: 'Card Activity', value: cardEvents, color: 'text-purple-600' },
                    { label: 'Rewards', value: rewardEvents, color: 'text-amber-600' },
                    { label: 'QR Activity', value: qrEvents, color: 'text-blue-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-gray-500">{s.label}</p>
                    </div>
                  ))
                })()}
              </div>

              {/* Category Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-medium mr-1">Filter:</span>
                  {[
                    { key: 'all', label: 'All Events', dot: '' },
                    { key: 'membership', label: 'Membership', dot: 'bg-emerald-400' },
                    { key: 'vcard', label: 'VCard', dot: 'bg-orange-400' },
                    { key: 'card', label: 'Card', dot: 'bg-purple-400' },
                    { key: 'reward', label: 'Rewards', dot: 'bg-amber-400' },
                    { key: 'qr', label: 'QR', dot: 'bg-blue-400' },
                    { key: 'admin', label: 'Admin', dot: 'bg-red-400' },
                    { key: 'external', label: 'External', dot: 'bg-gray-400' },
                  ].map(f => (
                    <button key={f.key} onClick={() => setActivityFilter(f.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${activityFilter === f.key
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-600'}`}>
                      {f.dot && <span className={`inline-block w-1.5 h-1.5 rounded-full ${f.dot} mr-1.5`} />}
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Combined Event Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Timeline</h4>
                {(() => {
                  const catMap: Record<string, string> = { reward: 'reward', earn: 'reward', referral: 'reward', card: 'card', nfc: 'qr', booking: 'external', milestone: 'membership', alert: 'admin', profile: 'vcard' }
                  const catDots: Record<string, string> = { reward: 'bg-amber-400', membership: 'bg-emerald-400', vcard: 'bg-orange-400', card: 'bg-purple-400', qr: 'bg-blue-400', admin: 'bg-red-400', external: 'bg-gray-400' }
                  const catLabels: Record<string, string> = { reward: 'Reward', membership: 'Membership', vcard: 'VCard', card: 'Card', qr: 'QR', admin: 'Admin', external: 'External Platform' }
                  const events = [
                    ...c.recentActivity.map((a, i) => ({ id: `ra-${i}`, action: a.action, time: a.time, category: catMap[a.type] || 'other', status: 'Completed' as const, actor: 'System' as const, source: 'MCOMVCard' as const })),
                    ...c.cardActivity.map((a, i) => ({ id: `ca-${i}`, action: a.action, time: a.time, category: catMap[a.type] || 'other', status: a.status as string, actor: a.actor, source: a.source })),
                  ].filter(e => activityFilter === 'all' || e.category === activityFilter)
                    .sort((a, b) => new Date(b.time.replace(/(\d+)(st|nd|rd|th)/, '$1')).getTime() - new Date(a.time.replace(/(\d+)(st|nd|rd|th)/, '$1')).getTime())

                  if (events.length === 0) {
                    return <EmptySection title="No matching events" desc="No activity matches the current filter. Try selecting a different category." />
                  }
                  return (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {events.map((e) => (
                        <div key={`${e.id}`} className="flex items-start gap-3 py-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${catDots[e.category] || 'bg-gray-400'} mt-1 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[11px] text-gray-700 dark:text-gray-300">{e.action}</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${e.status === 'Successful' || e.status === 'Completed' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : e.status === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-500'}`}>{e.status}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 font-medium">{catLabels[e.category] || e.category}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                              <span>{e.time}</span>
                              <span>·</span>
                              <span>{e.actor}</span>
                              <span>·</span>
                              <span>{e.source}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Activity Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toast.success('Activity exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export All Activity</button>
                  <button onClick={() => toast.success('Filter by date range opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Filter by Date Range</button>
                  <button onClick={() => toast.success('Activity summary generated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Generate Summary</button>
                </div>
              </div>
            </div>
          )}

          {/* ============================== ACCOUNT & INTEGRATIONS TAB ============================== */}
          {tab === 'Account & Integrations' && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Account & Integrations</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.status]}`} />
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.name} · {c.email} · {c.phone}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Central account: {c.centralUserId} · MCOMVCard ID: {c.consumerId}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button onClick={() => toast.success('Account refresh initiated')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Refresh Account</button>
                    <button onClick={() => toast.success('Opening central account')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Central Account</button>
                    <div className="relative">
                      <button onClick={() => setShowActions(!showActions)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
                        Account Actions
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showActions && (
                        <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg py-1">
                          {[
                            { label: 'Refresh Account', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: () => toast.success('Account refresh initiated') },
                            { label: 'Refresh Integrations', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: () => toast.success('Integration status refreshed') },
                            { label: 'Retry Account Linking', icon: 'M13 10V3L4 14h7v7l9-11h-7z', action: () => toast.success('Account linking retried') },
                            { label: c.status === 'suspended' ? 'Reactivate MCOMVCard Access' : 'Suspend MCOMVCard Access', icon: c.status === 'suspended' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', action: () => c.status === 'suspended' ? toast.success('MCOMVCard access reactivated') : toast.success('MCOMVCard access suspended — central account remains active') },
                            { label: 'View Audit Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', action: () => toast.success('Opening audit log') },
                          ].map((item) => (
                            <button key={item.label} onClick={() => { setShowActions(false); item.action() }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ── SECTION 1: CENTRAL ACCOUNT ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Central Account</h4>
                    <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">MCOM Solutions</span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Full Name" value={c.name} />
                    <InfoRow label="Email" value={c.email} />
                    <InfoRow label="Phone" value={c.phone} />
                    <InfoRow label="MCOM User ID" value={c.centralUserId} />
                    <InfoRow label="Account Status" value={<span className={`inline-flex items-center gap-1 text-[11px] font-medium ${statusColors[c.status]}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDots[c.status]}`} />{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span> as any} />
                    <InfoRow label="Account Created" value={c.joined} />
                    <InfoRow label="Last Login" value={c.lastActivityAt} />
                    <InfoRow label="Authentication Provider" value="MCOM Solutions" />
                    <InfoRow label="2FA Status" value="Enabled" />
                    <InfoRow label="Email Verification" value="Verified" />
                    <InfoRow label="Phone Verification" value="Verified" />
                  </div>
                  <div className="mt-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg p-2.5 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-[9px] text-amber-700 dark:text-amber-400">Authentication managed by MCOM Solutions. MCOMVCard does not own consumer login credentials.</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => toast.success('Opening central profile')} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Central Profile</button>
                    <button onClick={() => toast.success('Opening authentication status')} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Auth Status</button>
                  </div>
                </div>

                {/* ── SECTION 2: MCOMVCARD ACCOUNT ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">MCOMVCard Account</h4>
                    <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">Internal</span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    <InfoRow label="Consumer ID" value={c.consumerId} />
                    <InfoRow label="Account Status" value={c.status.charAt(0).toUpperCase() + c.status.slice(1)} />
                    <InfoRow label="Joined MCOMVCard" value={c.joined} />
                    <InfoRow label="Registration Source" value={c.registrationSource} />
                  </div>
                  <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-1.5">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Membership & Cards</p>
                    {[
                      { label: 'Current Membership', value: c.membership, action: () => setTab('Membership & Entitlements'), color: 'text-orange-600' },
                      { label: 'Primary VCard', value: c.vcardStatus, action: () => c.vcardStatus !== 'Not Assigned' ? setTab('Consumer VCard') : undefined, color: c.vcardStatus === 'Active' ? 'text-green-600' : 'text-gray-400' },
                      { label: 'Primary Card', value: c.cardStatus, action: () => c.cardStatus !== 'Not Assigned' ? setTab('Consumer Card') : undefined, color: c.cardStatus === 'Active' ? 'text-purple-600' : 'text-gray-400' },
                      { label: 'Additional Cards', value: `${c.allocatedAdditionalCards} of ${c.additionalEntitlements} allocated`, action: () => setTab('Membership & Entitlements'), color: c.unallocatedEntitlements > 0 ? 'text-amber-600' : 'text-green-600' },
                      { label: 'Business Relationships', value: `${c.businessCount}`, action: undefined, color: 'text-blue-600' },
                    ].map((item) => (
                      <button key={item.label} onClick={item.action}
                        disabled={!item.action}
                        className="w-full flex items-center justify-between py-1 text-[10px] hover:bg-white/50 dark:hover:bg-gray-600/30 rounded px-1.5 -mx-1.5 transition-colors disabled:opacity-100">
                        <span className="text-gray-500">{item.label}</span>
                        <span className={`font-medium ${item.color} ${item.action ? 'hover:underline cursor-pointer' : ''}`}>{item.value}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-3">Account restrictions: None</p>
                </div>

                {/* ── SECTION 3: BUSINESS RELATIONSHIPS ── */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Business Relationships</h4>
                    <button onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)} className="text-[10px] text-orange-600 hover:underline">View Primary Business →</button>
                  </div>
                  {c.savedCards.length === 0 && c.businessCount === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No Business Relationships</p>
                      <p className="text-[10px] text-gray-400 mt-1">This consumer has not yet been connected to a business.</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                              <th className="text-left px-2 py-1.5 font-medium">Business</th>
                              <th className="text-left px-2 py-1.5 font-medium">Relationship</th>
                              <th className="text-left px-2 py-1.5 font-medium">VCard</th>
                              <th className="text-left px-2 py-1.5 font-medium">Card</th>
                              <th className="text-left px-2 py-1.5 font-medium">Membership Source</th>
                              <th className="text-left px-2 py-1.5 font-medium">Status</th>
                              <th className="text-left px-2 py-1.5 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Primary issuing business row */}
                            <tr className="border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              onClick={() => navigate(`/admin/businesses/${c.primaryIssuingBusinessId}`)}>
                              <td className="px-2 py-1.5 text-orange-600 font-medium hover:underline">{c.primaryIssuingBusiness}</td>
                              <td className="px-2 py-1.5">
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[9px] font-medium">
                                  {c.registrationSource === 'Business' ? 'Customer' : c.registrationSource === 'Campaign' ? 'Campaign Participant' : 'VCard Recipient'}
                                </span>
                              </td>
                              <td className="px-2 py-1.5"><span className={c.vcardStatus === 'Active' ? 'text-green-600 font-medium' : 'text-gray-400'}>{c.vcardStatus === 'Active' ? 'Active' : '—'}</span></td>
                              <td className="px-2 py-1.5"><span className={c.cardStatus === 'Active' ? 'text-green-600 font-medium' : 'text-gray-400'}>{c.cardStatus === 'Active' ? 'Active' : '—'}</span></td>
                              <td className="px-2 py-1.5 text-gray-500">{c.registrationSource}</td>
                              <td className="px-2 py-1.5"><span className="text-green-600 font-medium">Active</span></td>
                              <td className="px-2 py-1.5 text-gray-500">{c.joined}</td>
                            </tr>
                            {/* Derived business rows from savedCards */}
                            {c.savedCards.filter(sc => sc.business !== c.primaryIssuingBusiness).map((sc, i) => (
                              <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                onClick={() => toast.success(`Navigating to ${sc.business}`)}>
                                <td className="px-2 py-1.5 text-orange-600 font-medium hover:underline">{sc.business}</td>
                                <td className="px-2 py-1.5">
                                  <span className="px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 text-[9px] font-medium">
                                    {sc.type === 'Loyalty' ? 'Loyalty Member' : sc.type === 'Membership' ? 'Customer' : 'Reward Recipient'}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5 text-gray-400">—</td>
                                <td className="px-2 py-1.5"><span className="text-green-600 font-medium">Active</span></td>
                                <td className="px-2 py-1.5 text-gray-500">Business</td>
                                <td className="px-2 py-1.5"><span className="text-green-600 font-medium">Active</span></td>
                                <td className="px-2 py-1.5 text-gray-500">{c.joined}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-3">Click any business row to view Business Details. Relationship types are controlled by the backend.</p>
                    </>
                  )}
                </div>

                {/* ── SECTION 4: ACCOUNT LINKING ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Account Linking</h4>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Linked</span>
                  </div>
                  <div className="space-y-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Central User ID</p>
                        <p className="text-[10px] text-gray-400 font-mono">{c.centralUserId}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">MCOMVCard Consumer ID</p>
                        <p className="text-[10px] text-gray-400 font-mono">{c.consumerId}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-500/5 rounded-lg p-2.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-[9px] text-green-700 dark:text-green-400">Accounts are linked. The consumer can access MCOMVCard using their MCOM Solutions credentials.</p>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                    <InfoRow label="Link Status" value={<span className="text-green-600 font-medium">Linked</span> as any} />
                    <InfoRow label="Linked Since" value={c.joined} />
                    <InfoRow label="Last Link Verification" value={c.lastActivityAt} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toast.success('Link status refreshed')} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh Link Status</button>
                    <button onClick={() => setShowUnlinkConfirm(true)} className="flex-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 text-[10px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10">Unlink</button>
                  </div>
                </div>

                {/* ── SECTION 5: PLATFORM CONNECTIONS ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Platform Connections</h4>
                  <p className="text-[9px] text-gray-400 mb-3">MCOMVCard does not own all these systems. Platforms show their connection status to this consumer's account.</p>
                  <div className="space-y-2">
                    {[
                      { name: 'MCOM Solutions', purpose: 'Central Login / Signup', status: 'Connected', owner: 'External', dot: 'bg-green-500', textColor: 'text-green-600' },
                      { name: 'MCOM Rewards', purpose: 'Rewards / Loyalty Engine', status: 'Coming Soon', owner: 'External', dot: 'bg-gray-300 dark:bg-gray-600', textColor: 'text-gray-400' },
                      { name: 'MCOMMall Cashback', purpose: 'Cashback Processing', status: 'Coming Soon', owner: 'External', dot: 'bg-gray-300 dark:bg-gray-600', textColor: 'text-gray-400' },
                      { name: 'MCOMSpin', purpose: 'Gamification', status: 'Coming Soon', owner: 'External', dot: 'bg-gray-300 dark:bg-gray-600', textColor: 'text-gray-400' },
                      { name: 'FundOrDonate', purpose: 'Fundraising / Donations', status: 'Coming Soon', owner: 'External', dot: 'bg-gray-300 dark:bg-gray-600', textColor: 'text-gray-400' },
                      { name: 'E-Card Monetary', purpose: 'Face Value Processing', status: 'Coming Soon', owner: 'External', dot: 'bg-gray-300 dark:bg-gray-600', textColor: 'text-gray-400' },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                        <span className={`w-2 h-2 rounded-full ${p.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-700 dark:text-gray-300">{p.name}</p>
                          <p className="text-[9px] text-gray-400">{p.purpose}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-medium ${p.textColor}`}>{p.status}</span>
                          <p className="text-[8px] text-gray-400">{p.owner}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── SECTION 6: INTEGRATION STATUS ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Integration Status</h4>
                  <p className="text-[9px] text-gray-400 mb-3">Health of external service connections for this consumer.</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Central Authentication', status: 'Healthy', lastSync: 'Real-time', lastAttempt: c.lastActivityAt, errors: 0 },
                      { name: 'MCOM Rewards', status: 'Coming Soon', lastSync: '—', lastAttempt: '—', errors: 0 },
                      { name: 'MCOMMall Cashback', status: 'Coming Soon', lastSync: '—', lastAttempt: '—', errors: 0 },
                      { name: 'MCOMSpin', status: 'Coming Soon', lastSync: '—', lastAttempt: '—', errors: 0 },
                      { name: 'FundOrDonate', status: 'Coming Soon', lastSync: '—', lastAttempt: '—', errors: 0 },
                      { name: 'E-Card Monetary', status: 'Coming Soon', lastSync: '—', lastAttempt: '—', errors: 0 },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.status === 'Healthy' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-700 dark:text-gray-300">{p.name}</p>
                          <p className="text-[9px] text-gray-400">Last sync: {p.lastSync} · Last attempt: {p.lastAttempt}</p>
                        </div>
                        <span className={`text-[10px] font-medium shrink-0 ${p.status === 'Healthy' ? 'text-green-600' : 'text-gray-400'}`}>
                          {p.status}
                          {p.errors > 0 && <span className="text-red-500 ml-1">({p.errors} err)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => toast.success('Integration status refreshed')} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh Status</button>
                    <button onClick={() => toast.success('Opening connection check')} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Connection Check</button>
                  </div>
                </div>

                {/* ── SECTION 7: DATA SYNCHRONISATION ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Data Synchronisation</h4>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50 mb-3">
                    <InfoRow label="Central Authentication" value={<span className="text-green-600 font-medium">✓ Healthy</span> as any} />
                    <InfoRow label="MCOM Rewards" value={<span className="text-gray-400">Coming Soon</span> as any} />
                    <InfoRow label="MCOMMall Cashback" value={<span className="text-gray-400">Coming Soon</span> as any} />
                    <InfoRow label="MCOMSpin" value={<span className="text-gray-400">Coming Soon</span> as any} />
                    <InfoRow label="FundOrDonate" value={<span className="text-gray-400">Coming Soon</span> as any} />
                    <InfoRow label="E-Card Monetary" value={<span className="text-gray-400">Coming Soon</span> as any} />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Last Successful Sync</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{c.lastActivityAt}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Sync Frequency</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Real-time</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Error Count</span>
                      <span className="text-green-600 font-medium">0</span>
                    </div>
                  </div>
                  <button onClick={() => toast.success('Manual sync initiated')} className="mt-3 w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Sync All Platforms</button>
                </div>

                {/* ── ADMIN ACTIONS ── */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Admin Actions</h4>
                    <span className="text-[9px] text-gray-400">Audit logging enabled</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Refresh Account', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: () => toast.success('Account refresh initiated · Audit logged'), color: '' },
                      { label: 'Refresh Integrations', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: () => toast.success('Integration status refreshed · Audit logged'), color: '' },
                      { label: 'Retry Account Linking', icon: 'M13 10V3L4 14h7v7l9-11h-7z', action: () => toast.success('Account linking retried · Audit logged'), color: '' },
                      { label: c.status === 'suspended' ? 'Reactivate Access' : 'Suspend MCOMVCard Access', icon: c.status === 'suspended' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', action: () => {
                        if (c.status === 'suspended') {
                          toast.success('MCOMVCard access reactivated · Central account remains active · Audit logged')
                        } else {
                          toast.success('MCOMVCard access suspended · Central account remains active · Audit logged')
                        }
                      }, color: c.status !== 'suspended' ? 'text-red-600 border-red-200 dark:border-red-800' : '' },
                      { label: 'View Audit Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', action: () => toast.success('Opening audit log'), color: '' },
                      { label: 'Export Account Data', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', action: () => toast.success('Account data exported · Audit logged'), color: '' },
                      { label: 'Request Account Review', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', action: () => toast.success('Account review requested — notification sent to MCOM Solutions'), color: '' },
                      { label: 'Open Central Account Management', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1', action: () => toast.success('Opening central account management — MCOM Solutions portal'), color: '' },
                    ].map((a) => (
                      <button key={a.label} onClick={a.action}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${a.color ? `${a.color} hover:bg-red-50 dark:hover:bg-red-500/10` : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unlink Confirmation Modal */}
              {showUnlinkConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowUnlinkConfirm(false)}>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Unlink Account?</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This will remove the association between the MCOMVCard account and the central MCOM Solutions identity. The consumer will not be deleted, but they may be unable to access their MCOMVCard data until the account is linked again.</p>
                    <div className="mb-4">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Reason for Unlinking</label>
                      <input type="text" placeholder="Enter reason" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                    </div>
                    <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-2.5 flex items-start gap-2 mb-4">
                      <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <p className="text-[9px] text-red-700 dark:text-red-400">This action is highly restricted and will be recorded in the audit log.</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowUnlinkConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                      <button onClick={() => { setShowUnlinkConfirm(false); toast.success('Account unlinked · Audit logged · Consumer data preserved') }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Confirm Unlink</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSuspendModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Suspend Consumer?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This will prevent the consumer from accessing MCOMVCard until the account is reactivated.</p>
            <div className="mb-4">
              <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Reason</label>
              <input type="text" placeholder="Enter reason for suspension" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSuspendModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => { setShowSuspendModal(false); toast.success('Consumer suspended') }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Suspend Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
