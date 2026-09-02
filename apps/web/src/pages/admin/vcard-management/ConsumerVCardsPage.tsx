import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CONSUMER_VCARDS, type ConsumerVCard } from './consumerVCardData'

interface FriendsFamilyDetail { name: string; relation: string; status: string; allocatedTo: string; activated: string; createdDate: string }

const CONSUMER_SECTIONS = [
  { id: 'welcome', label: 'Welcome Banner', enabled: true, description: 'Personalised hero banner with member name and greeting' },
  { id: 'profile', label: 'Member Profile', enabled: true, description: 'Avatar, name, membership tier, member ID' },
  { id: 'membership', label: 'Membership Information', enabled: true, description: 'Tier details, benefits, expiry date' },
  { id: 'progress', label: 'Membership Progress', enabled: true, description: 'Progress bar to next tier, points earned, points needed' },
  { id: 'wallet', label: 'Wallet Summary', enabled: true, description: 'Reward points, cashback balance, gift cards' },
  { id: 'business', label: 'My Business', enabled: false, description: 'Linked business information' },
  { id: 'local', label: 'My Local Area', enabled: true, description: 'Local offers, nearby businesses, high street' },
  { id: 'recommended', label: 'Recommended Businesses', enabled: true, description: 'Personalised business recommendations' },
  { id: 'share', label: 'Share Section', enabled: true, description: 'Share VCard, share offers, share content' },
  { id: 'exchange', label: 'Exchange Section', enabled: true, description: 'Exchange cards, exchange value, exchange history' },
  { id: 'redeem', label: 'Redeem Section', enabled: false, description: 'Reward redemption — Coming Soon' },
  { id: 'friends', label: 'Friends & Family', enabled: true, description: 'Additional card holders, entitlements, status' },
  { id: 'extra-cards', label: 'Additional Cards', enabled: true, description: 'Extra cards allocation and management' },
  { id: 'qr', label: 'My QR Code', enabled: true, description: 'Dynamic QR for sharing and payments' },
  { id: 'notifications', label: 'Notifications', enabled: true, description: 'Recent alerts and updates' },
  { id: 'community', label: 'Community Updates', enabled: true, description: 'High street announcements and campaigns' },
  { id: 'settings', label: 'Personal Settings', enabled: false, description: 'Preferences, privacy, notification settings' },
  { id: 'footer', label: 'Footer', enabled: true, description: 'Account info, support, legal links' },
]

const STATI = ['All', 'Draft', 'Published', 'Pending Review', 'Suspended', 'Archived']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const QR_STATUSES = ['All', 'Active', 'Scheduled', 'Expired', 'Disabled', 'Inactive']
const PUBLISH_STATUS = ['All', 'Published', 'Unpublished']
const SORT_OPTIONS = ['Newest', 'Oldest', 'Most Viewed', 'Most Shared', 'Most Redeemed', 'Most Exchanged', 'Most Active']
const BUSINESSES = ['All', 'TechCorp Solutions', 'Luxury Hotels Ltd', 'Café Mocha', 'Global Retail Inc', 'Green Energy Co']

const MEMBERSHIP_MAP: Record<string, string> = {
  'Bronze': 'bg-gray-200 text-gray-700', 'Bronze Pro': 'bg-amber-100 text-amber-700', 'Bronze Pro+': 'bg-amber-200 text-amber-800',
  'Silver': 'bg-gray-300 text-gray-800', 'Silver Pro': 'bg-blue-100 text-blue-700', 'Silver Pro+': 'bg-blue-200 text-blue-800',
  'Gold': 'bg-yellow-100 text-yellow-700', 'Gold Pro': 'bg-yellow-200 text-yellow-800', 'Gold Pro+': 'bg-yellow-300 text-yellow-900',
  'Platinum': 'bg-purple-100 text-purple-700', 'Platinum Pro': 'bg-purple-200 text-purple-800', 'Platinum Pro+': 'bg-purple-300 text-purple-900',
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Pending Review': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Suspended': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Archived': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Scheduled': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Expired': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Disabled': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Inactive': 'bg-gray-50 dark:bg-gray-500/10 text-gray-400',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
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

export function PreviewModal({ vcard, onClose }: { vcard: ConsumerVCard | null; onClose: () => void }) {
  if (!vcard) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Preview — {vcard.consumerName}</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 flex justify-center">
            <div className="w-[280px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-inner overflow-y-auto">
              <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-700 flex items-end p-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-purple-600 font-bold text-sm">{vcard.preview}</div>
                  <div><p className="text-xs font-bold text-white">{vcard.consumerName}</p><p className="text-[9px] text-white/80">{vcard.membership}</p></div>
                </div>
              </div>
              <div className="p-3 space-y-3">
                <div className="h-4 bg-orange-100 rounded-full w-3/4" />
                <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Wallet summary</div>
                <div className="h-12 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Local offers</div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-[9px] text-white font-medium">Share</div>
                  <div className="flex-1 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-[9px] text-gray-600 font-medium">Exchange</div>
                </div>
                <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Friends & Family</div>
                <div className="h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-400">QR Code</div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-3">
            <span className="text-[9px] text-gray-400">Mobile</span><span className="text-[9px] text-gray-400">Tablet</span><span className="text-[9px] text-gray-400">Desktop</span>
          </div>
        </div>
      </div>
    </>
  )
}

export function BuilderWorkspace({ vcard, onClose }: { vcard: ConsumerVCard | null; onClose: () => void }) {
  const [sections, setSections] = useState(CONSUMER_SECTIONS)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showFF, setShowFF] = useState(true)

  if (!vcard) return null

  const toggleSection = (id: string) => setSections(prev => prev.map(s => String(s.id) === id ? { ...s, enabled: !s.enabled } : s))
  const moveUp = (i: number) => { if (i === 0) return; const u = [...sections]; [u[i - 1], u[i]] = [u[i], u[i - 1]]; setSections(u) }
  const moveDown = (i: number) => { if (i === sections.length - 1) return; const u = [...sections]; [u[i], u[i + 1]] = [u[i + 1], u[i]]; setSections(u) }

  const mockFF: FriendsFamilyDetail[] = [
    { name: 'Jane Smith', relation: 'Friend', status: 'Activated', allocatedTo: 'Jane Smith', activated: '22 Jan 2026', createdDate: '18 Jan 2026' },
    { name: 'Lily Smith', relation: 'Family', status: 'Activated', allocatedTo: 'Lily Smith', activated: '22 Jan 2026', createdDate: '18 Jan 2026' },
    { name: '—', relation: 'Friend', status: 'Available', allocatedTo: '—', activated: '—', createdDate: '—' },
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Consumer Builder — {vcard.consumerName}</h2>
              <p className="text-[10px] text-gray-500">{vcard.membership} · {vcard.businessSource} · v{vcard.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {(['mobile', 'tablet', 'desktop'] as const).map((m) => (
                <button key={m} onClick={() => setPreviewMode(m)} className={`px-2.5 py-1 rounded text-[10px] font-medium ${previewMode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
            <button onClick={() => toast.success('Draft saved')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Save Draft</button>
            <button onClick={() => toast.success('Submitted for review')} className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600">Submit for Review</button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-57px)]">
          <div className="w-72 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Sections ({sections.filter(s => s.enabled).length}/{sections.length})</h3>
            <div className="space-y-1">
              {sections.map((s, i) => (
                <div key={s.id} className={`rounded-lg border ${activeSection === s.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/5' : 'border-gray-100 dark:border-gray-700'} ${s.enabled ? '' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button onClick={() => toggleSection(s.id)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${s.enabled ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                      {s.enabled && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button onClick={() => setActiveSection(activeSection === s.id ? null : s.id)} className="flex-1 text-left">
                      <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{s.label}</p>
                    </button>
                    <div className="flex gap-0.5">
                      <button onClick={() => moveUp(i)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                      <button onClick={() => moveDown(i)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                    </div>
                  </div>
                  {activeSection === s.id && (
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-50 dark:border-gray-700/50">
                      <p className="text-[9px] text-gray-400">{s.description}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['Visibility', 'Auto-Update', 'Animation', 'Mobile Spacing', 'Desktop Spacing', 'Background', 'Text Style', 'Permissions', 'Scheduling'].map((opt) => (
                          <label key={opt} className="flex items-center gap-1">
                            <input type="checkbox" defaultChecked={opt !== 'Scheduling'} className="w-3 h-3 rounded border-gray-300 text-purple-500 focus:ring-purple-500" />
                            <span className="text-[8px] text-gray-500">{opt}</span>
                          </label>
                        ))}
                      </div>
                      {s.id === 'share' && (
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-[9px] text-gray-500">
                          Share enabled · All types allowed · 5/day limit<br />Featured: Local offers
                        </div>
                      )}
                      {s.id === 'exchange' && (
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-[9px] text-gray-500">
                          Exchange enabled · 10/day limit<br />Rewards/Cashback/Donations: Coming Soon
                        </div>
                      )}
                      {s.id === 'redeem' && (
                        <div className="mt-1 p-2 bg-amber-50 dark:bg-amber-500/10 rounded text-[9px] text-amber-600">
                          Coming Soon — MCOM Rewards / 247GBS Rewards integration pending
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 flex items-start justify-center p-6">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-inner overflow-y-auto ${previewMode === 'mobile' ? 'w-[280px] h-[520px]' : previewMode === 'tablet' ? 'w-[400px] h-[520px]' : 'w-full max-w-3xl h-[520px]'}`}>
              <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-700 flex items-end p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-purple-600 font-bold text-sm">{vcard.preview}</div>
                  <div><p className="text-sm font-bold text-white">{vcard.consumerName}</p><p className="text-[10px] text-white/80">{vcard.membership}</p></div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {sections.filter(s => s.enabled).slice(0, 7).map(s => (
                  <div key={s.id}>
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white mb-1">{s.label}</p>
                    <div className="h-14 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">{s.description}</div>
                  </div>
                ))}
                {sections.filter(s => s.enabled).length > 7 && (
                  <div className="text-center text-[9px] text-gray-400">+ {sections.filter(s => s.enabled).length - 7} more sections</div>
                )}
              </div>
            </div>
          </div>

          <div className="w-72 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4 space-y-5">
            <div>
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Publishing Workflow</h3>
              <div className="space-y-0">
                {[{ label: 'Draft', active: vcard.status === 'Draft', date: 'Current' }, { label: 'Review', active: vcard.status === 'Pending Review', date: '—' }, { label: 'Approved', active: false, date: '—' }, { label: 'Published', active: vcard.status === 'Published', date: '—' }, { label: 'Archived', active: vcard.status === 'Archived', date: '—' }].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5">
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${step.active ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div className="flex-1 flex justify-between">
                      <span className={`text-[10px] ${step.active ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>{step.label}</span>
                      <span className="text-[9px] text-gray-400">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Friends & Family</h3>
                <button onClick={() => setShowFF(!showFF)} className="text-gray-400"><svg className={`w-3 h-3 transition-transform ${showFF ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
              </div>
              {showFF && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Total Entitlement</span><span className="font-semibold text-gray-900 dark:text-white">3</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Allocated</span><span className="font-semibold text-gray-900 dark:text-white">{mockFF.filter(f => f.status === 'Activated').length}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500">Available</span><span className="font-semibold text-green-600">{mockFF.filter(f => f.status === 'Available').length}</span></div>
                  <div className="space-y-1 mt-1">
                    {mockFF.map((f, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded p-1.5">
                        <div className="flex justify-between text-[9px]"><span className="font-medium text-gray-700 dark:text-gray-300">{f.name}</span><StatusBadge status={f.status} /></div>
                        {f.relation !== '—' && <p className="text-[8px] text-gray-400">{f.relation} · {f.activated}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => toast.success('Allocation dialog opened')} className="flex-1 px-1.5 py-1 rounded bg-purple-50 dark:bg-purple-500/10 text-[9px] font-medium text-purple-600 hover:bg-purple-100">Allocate</button>
                    <button onClick={() => toast.success('Lock toggled')} className="flex-1 px-1.5 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[9px] font-medium text-gray-600 hover:bg-gray-200">Lock</button>
                    <button onClick={() => toast.success('History opened')} className="flex-1 px-1.5 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[9px] font-medium text-gray-600 hover:bg-gray-200">History</button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Dynamic QR</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={vcard.qrStatus} /></div>
                <div className="flex justify-between"><span className="text-gray-500">Redirect</span><span className="text-gray-900 dark:text-white font-medium">Profile → Offers</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Expiry</span><span className="text-gray-900 dark:text-white font-medium">30 days</span></div>
                <button onClick={() => toast.success('QR configuration opened')} className="mt-2 w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200">Configure QR</button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Analytics</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Views</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.views.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">QR Scans</span><span className="font-semibold text-gray-900 dark:text-white">{Math.round(vcard.views * 0.7).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shares</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.shares.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Exchanges</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.exchangeCount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Redeems</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.redeemCount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Avg Session</span><span className="font-semibold text-gray-900 dark:text-white">2m 34s</span></div>
                <button onClick={() => toast.success('Full analytics opened')} className="mt-2 w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200">View Full Analytics</button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Membership Progress</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Current</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.membership}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Next Tier</span><span className="font-semibold text-gray-900 dark:text-white">
                  {vcard.membership === 'Bronze' ? 'Silver' : vcard.membership === 'Silver' ? 'Gold' : vcard.membership === 'Gold' ? 'Platinum' : '—'}
                </span></div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between text-[9px]"><span className="text-gray-400">1,250 pts earned</span><span className="text-gray-400">650 pts to next</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ConsumerVCardsPage() {
  const [loading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [qrStatusFilter, setQrStatusFilter] = useState('')
  const [publishFilter, setPublishFilter] = useState('')
  const [sortBy, setSortBy] = useState('Newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewVCard, setPreviewVCard] = useState<ConsumerVCard | null>(null)
  const [builderVCard, setBuilderVCard] = useState<ConsumerVCard | null>(null)

  const filtered = CONSUMER_VCARDS.filter(v => {
    if (statusFilter && v.status !== statusFilter) return false
    if (membershipFilter && v.membership !== membershipFilter) return false
    if (businessFilter && v.businessSource !== businessFilter) return false
    if (qrStatusFilter && v.qrStatus !== qrStatusFilter) return false
    if (publishFilter === 'Published' && v.status !== 'Published') return false
    if (publishFilter === 'Unpublished' && v.status === 'Published') return false
    if (search) {
      const q = search.toLowerCase()
      if (!v.consumerName.toLowerCase().includes(q) && !v.memberId.toLowerCase().includes(q) && !v.email.toLowerCase().includes(q) && !v.phone.includes(q) && !v.businessSource.toLowerCase().includes(q) && !v.membership.toLowerCase().includes(q) && !v.qrId.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { if (allSelected) setSelectedIds([]); else setSelectedIds(filtered.map(v => v.id)) }
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const totalViews = CONSUMER_VCARDS.reduce((s, v) => s + v.views, 0)
  const totalShares = CONSUMER_VCARDS.reduce((s, v) => s + v.shares, 0)
  const totalExchange = CONSUMER_VCARDS.reduce((s, v) => s + v.exchangeCount, 0)
  const totalRedeem = CONSUMER_VCARDS.reduce((s, v) => s + v.redeemCount, 0)
  const totalFF = CONSUMER_VCARDS.reduce((s, v) => s + v.friendsCards + v.familyCards, 0)
  const totalAllocated = CONSUMER_VCARDS.filter(v => v.friendsCards + v.familyCards > 0).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Consumer VCards - VCard Management - MCOM VCard</title></Helmet>
        <div className="h-7 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Helmet><title>Consumer VCards - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unable to load Consumer VCards</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">There was a problem fetching the Consumer VCard list.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setError(false)} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Consumer VCards - VCard Management - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Consumer VCards</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Global operations center for every Consumer VCard — monitor engagement, manage Friends & Family, track membership progression.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => toast.success('Export started')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
            <button onClick={() => toast.success('Report generated')} className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600">Generate Report</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPICard label="Total Consumer VCards" value={String(CONSUMER_VCARDS.length)} sub={`${CONSUMER_VCARDS.filter(v => v.status === 'Published').length} Published · ${CONSUMER_VCARDS.filter(v => v.status === 'Draft').length} Draft · ${CONSUMER_VCARDS.filter(v => v.status === 'Archived').length} Archived`} color="text-purple-600" />
        <KPICard label="Engagement" value={`${totalViews.toLocaleString()} views`} sub={`${totalShares.toLocaleString()} shares · ${totalExchange.toLocaleString()} exchanges · ${totalRedeem.toLocaleString()} redeems`} color="text-indigo-600" />
        <KPICard label="Friends & Family" value={`${totalFF} cards`} sub={`${totalAllocated} consumers with F&F · ${CONSUMER_VCARDS.filter(v => v.friendsCards + v.familyCards === 0).length} without`} color="text-teal-600" />
        <KPICard label="Family Cards" value={String(CONSUMER_VCARDS.reduce((s, v) => s + v.familyCards, 0))} sub="Issued to family members" color="text-rose-600" />
        <KPICard label="Friend Cards" value={String(CONSUMER_VCARDS.reduce((s, v) => s + v.friendsCards, 0))} sub="Issued to friends" color="text-blue-600" />
        <KPICard label="Active QR Codes" value={String(CONSUMER_VCARDS.filter(v => v.qrStatus === 'Active').length)} sub={`${CONSUMER_VCARDS.filter(v => v.qrStatus === 'Scheduled').length} scheduled · ${CONSUMER_VCARDS.filter(v => v.qrStatus === 'Expired').length} expired`} color="text-amber-600" />
        <KPICard label="Membership: Bronze" value={String(CONSUMER_VCARDS.filter(v => v.membership.startsWith('Bronze')).length)} sub="All Bronze tiers" color="text-gray-500" />
        <KPICard label="Membership: Silver" value={String(CONSUMER_VCARDS.filter(v => v.membership.startsWith('Silver')).length)} sub="All Silver tiers" color="text-blue-600" />
        <KPICard label="Membership: Gold" value={String(CONSUMER_VCARDS.filter(v => v.membership.startsWith('Gold')).length)} sub="All Gold tiers" color="text-yellow-600" />
        <KPICard label="Membership: Platinum" value={String(CONSUMER_VCARDS.filter(v => v.membership.startsWith('Platinum')).length)} sub="All Platinum tiers" color="text-purple-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Consumer Name, Email, Member ID, Phone, Business, Membership, QR ID..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            <FilterSelect label="Status" value={statusFilter} options={STATI} onChange={setStatusFilter} />
            <FilterSelect label="Membership" value={membershipFilter} options={MEMBERSHIPS} onChange={setMembershipFilter} />
            <FilterSelect label="Business Source" value={businessFilter} options={BUSINESSES} onChange={setBusinessFilter} />
            <FilterSelect label="QR Status" value={qrStatusFilter} options={QR_STATUSES} onChange={setQrStatusFilter} />
            <FilterSelect label="Publishing" value={publishFilter} options={PUBLISH_STATUS} onChange={setPublishFilter} />
            <FilterSelect label="Sort" value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Consumer VCards Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">Consumer VCards will appear after businesses begin issuing memberships.</p>
          <Link to="/admin/vcard-management/business-vcard-templates" className="inline-block px-4 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600">View Businesses</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="w-8 px-3 py-2.5 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-purple-500 focus:ring-purple-500" /></th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Preview</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Consumer</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Member ID</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Membership</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Business Source</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Version</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">QR Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Friends</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Family</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Views</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Shares</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Exchange</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Redeem</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Created</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Updated</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2.5"><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => toggleOne(v.id)} className="rounded border-gray-300 dark:border-gray-600 text-purple-500 focus:ring-purple-500" /></td>
                    <td className="px-3 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">{v.preview}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setBuilderVCard(v)} className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">{v.consumerName}</button>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-gray-500">{v.memberId}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${MEMBERSHIP_MAP[v.membership] || 'bg-gray-50 text-gray-600'}`}>{v.membership}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{v.businessSource}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{v.version}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={v.status} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={v.qrStatus} /></td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.friendsCards}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.familyCards}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.views.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.shares.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.exchangeCount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.redeemCount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{v.createdDate}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{v.updatedDate}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="relative group inline-block">
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="py-1">
                            <button onClick={() => setBuilderVCard(v)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View</button>
                            <button onClick={() => setPreviewVCard(v)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
                            <button onClick={() => setBuilderVCard(v)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Builder</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            {v.status === 'Published' ? (
                              <button onClick={() => toast.success(`${v.consumerName}'s VCard unpublished`)} className="w-full text-left px-3 py-1.5 text-[11px] text-amber-600 hover:bg-gray-50 dark:hover:bg-gray-700">Unpublish</button>
                            ) : (
                              <button onClick={() => toast.success(`${v.consumerName}'s VCard published`)} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Publish</button>
                            )}
                            <button onClick={() => toast.success('VCard duplicated')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Duplicate</button>
                            <button onClick={() => toast.success('Version history opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Version History</button>
                            <button onClick={() => toast.success('Analytics opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Analytics</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            {v.status === 'Archived' ? (
                              <button onClick={() => toast.success('VCard restored')} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Restore</button>
                            ) : (
                              <button onClick={() => toast.success('VCard archived')} className="w-full text-left px-3 py-1.5 text-[11px] text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
                            )}
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button onClick={() => toast.error('Confirm deletion required')} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Delete</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">{filtered.length} of {CONSUMER_VCARDS.length} records</span>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 mr-1">{selectedIds.length} selected</span>
                <button onClick={() => toast.success('Selected VCards published')} className="px-2 py-1 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100">Publish</button>
                <button onClick={() => toast.success('Selected VCards unpublished')} className="px-2 py-1 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100">Unpublish</button>
                <button onClick={() => toast.success('Selected VCards archived')} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100">Archive</button>
                <button onClick={() => toast.success('Theme assignment opened')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Assign Theme</button>
                <button onClick={() => toast.success('Export started')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Export</button>
              </div>
            )}
          </div>
        </div>
      )}

      <PreviewModal vcard={previewVCard} onClose={() => setPreviewVCard(null)} />
      <BuilderWorkspace vcard={builderVCard} onClose={() => setBuilderVCard(null)} />
    </div>
  )
}
