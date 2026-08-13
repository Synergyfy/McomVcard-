import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const DEVICES = [
  { name: 'Mobile', w: '375px', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', cls: 'w-[375px]' },
  { name: 'Tablet', w: '768px', icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', cls: 'w-[600px]' },
  { name: 'Desktop', w: '100%', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cls: 'w-full max-w-[800px]' },
  { name: 'Large Desktop', w: '1440px', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cls: 'w-full max-w-[1100px]' },
]

const BUSINESS_CATEGORIES = ['Restaurant', 'Coach', 'Estate Agent', 'Dentist', 'Retail Shop', 'Beauty Salon', 'Hotel', 'Gym', 'Professional Services', 'Construction', 'Healthcare', 'Education']
const MEMBERSHIPS = ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const SCENARIOS = ['New Visitor', 'First-Time Customer', 'Returning Customer', 'Loyal Customer', 'VIP Customer', 'Friend', 'Family Member', 'Guest']
const QR_SCENARIOS = ['Today — Summer Offer', 'Tomorrow — Restaurant Menu', 'Christmas — Holiday Promotion', 'Black Friday — Flash Sale', 'Campaign — Loyalty Rewards', 'Event — Grand Opening']
const TIME_SLOTS = ['Morning (09:00)', 'Afternoon (14:00)', 'Evening (19:00)', 'Weekend', 'Holiday', 'Seasonal Campaign', 'Promotion Start', 'Promotion End']
const SHARE_CHANNELS = ['Facebook', 'WhatsApp', 'LinkedIn', 'Email', 'SMS', 'Copy Link', 'QR']
const EXCHANGE_TYPES = ['Digital Voucher', 'Coupon', 'Offer', 'Referral', 'Event Ticket', 'Gift']
const REDEEM_TYPES = ['Redeem Coupon', 'Redeem Offer', 'Redeem QR', 'Redeem Voucher', 'Redeem Cashback (Coming Soon)', 'Redeem Reward (Coming Soon)']

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-3.5 left-0.5' : 'left-0.5'}`} />
    </button>
  )
}

function SectionCard({ title, desc, defaultOpen = false, children }: { title: string; desc?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function Badge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
      active === undefined ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' :
      active ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'
    }`}>{label}</span>
  )
}

export default function PreviewTestingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [device, setDevice] = useState(0)
  const [membership, setMembership] = useState('Gold')
  const [scenario, setScenario] = useState('Returning Customer')
  const [category, setCategory] = useState('Restaurant')
  const [qrScenario, setQrScenario] = useState(0)
  const [timeSlot, setTimeSlot] = useState('Afternoon (14:00)')
  const [shareChannel, setShareChannel] = useState('WhatsApp')
  const [exchangeType, setExchangeType] = useState('Digital Voucher')
  const [selectedBusiness] = useState('Demo — Gourmet Bistro')
  const [showSharePreview, setShowSharePreview] = useState(false)
  const [showExchangePreview, setShowExchangePreview] = useState(false)
  const [showRedeemPreview, setShowRedeemPreview] = useState(false)
  const [showQrResult, setShowQrResult] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'Business information configured': true,
    'Required sections complete': true,
    'Membership visibility verified': true,
    'QR configuration tested': false,
    'Share tested': false,
    'Exchange tested': false,
    'Redeem tested': false,
    'Responsive layout verified': true,
    'Accessibility verified': false,
    'No validation errors': false,
  })

  const allPassed = Object.values(checklist).every(v => v)

  const toggleChecklist = (item: string) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to generate preview.</p>
        <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Retry</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Helmet><title>Business VCard Preview & Testing - MCOM VCard</title></Helmet>

      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <Link to="/admin/vcard-management/business-vcard-templates" className="text-[10px] text-orange-600 hover:underline">Business VCard Templates</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Preview & Testing</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">QA and Experience Simulator — verify every aspect of a Business VCard before publishing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success('Test results saved')} className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Save Test Results</button>
          <button onClick={() => toast.success(!allPassed ? 'Complete all checklist items first' : 'Template published successfully')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold ${allPassed ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'}`}
            disabled={!allPassed}>Publish Template</button>
        </div>
      </div>

      {/* Top bar: template selector + status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Template:</span>
          <select className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>Corporate Professional v4.2</option>
            <option>Restaurant Premium v3.1</option>
            <option>Real Estate Pro v5.0</option>
          </select>
          <span className="text-[10px] text-gray-400">Version 4.2</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600`}>Draft</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => toast.success('Draft saved')} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Save Draft</button>
          <button onClick={() => toast.success('Preview link generated')} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Generate Preview Link</button>
          <button onClick={() => toast.success('Publication scheduled')} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Schedule</button>
        </div>
      </div>

      {/* Main grid: preview + controls */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left panel — Simulation Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* SECTION 1 — Device Preview */}
          <SectionCard title="1. Preview Device" desc="Mobile-first — preview on multiple screen sizes." defaultOpen>
            <div className="flex gap-1.5">
              {DEVICES.map((d, i) => (
                <button key={d.name} onClick={() => setDevice(i)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    device === i ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                  }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d.icon} /></svg>
                  <span className="text-[9px] font-medium">{d.name}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 2 — Business Simulation */}
          <SectionCard title="2. Business Simulation" desc="Test with real business data." defaultOpen>
            <div className="space-y-2">
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select a business category...</option>
                {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Or search existing business..." className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
              <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-[10px] text-gray-500">Selected Business</span>
                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{selectedBusiness}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-gray-500">
                {['Business Name', 'Category', 'Membership', 'Logo', 'Images', 'Description', 'Brand Colors', 'Social Links', 'Offers', 'Location'].map(f => (
                  <div key={f} className="flex items-center gap-1"><Badge label={f} active={true} /> <span className="text-gray-400">✓</span></div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success('Demo data loaded for ' + category)} className="flex-1 px-2 py-1 rounded bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Load Demo Data</button>
                <button onClick={() => toast.success('Business data reset')} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-[10px] text-gray-500 hover:bg-gray-50">Reset</button>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 3 — Membership Simulation */}
          <SectionCard title="3. Membership Simulation" desc="Instantly switch membership levels to verify visibility rules.">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {MEMBERSHIPS.map(m => (
                  <button key={m} onClick={() => setMembership(m)}
                    className={`px-2 py-0.5 rounded text-[8px] font-medium border transition-colors ${
                      membership === m ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                    }`}>{m}</button>
                ))}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-[10px] text-gray-600 dark:text-gray-300">
                {membership === 'Bronze' && 'Basic sections only — logo, name, contact, share.'}
                {membership === 'Silver' && 'Bronze + gallery, social links, basic offers.'}
                {membership === 'Gold' && 'Silver + premium banner, appointment booking, exchange.'}
                {membership === 'Platinum' && 'Gold + redeem, analytics, all features unlocked.'}
                {membership.includes('Pro') && `${membership} — Full access including all premium blocks, integrations, and customization.`}
              </div>
            </div>
          </SectionCard>

          {/* SECTION 4 — Consumer Scenario Simulation */}
          <SectionCard title="4. Consumer Scenario Simulation" desc="Simulate different consumer journeys.">
            <div className="flex flex-wrap gap-1">
              {SCENARIOS.map(s => (
                <button key={s} onClick={() => setScenario(s)}
                  className={`px-2 py-0.5 rounded text-[8px] font-medium border transition-colors ${
                    scenario === s ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                  }`}>{s}</button>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 5 — Share Simulation */}
          <SectionCard title="5. Share Simulation" desc="Verify what consumers will share.">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {SHARE_CHANNELS.map(ch => (
                  <button key={ch} onClick={() => { setShareChannel(ch); setShowSharePreview(true) }}
                    className={`px-2 py-0.5 rounded text-[8px] font-medium border transition-colors ${
                      shareChannel === ch && showSharePreview ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                    }`}>{ch}</button>
                ))}
              </div>
              {showSharePreview && (
                <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Gourmet Bistro</p>
                      <p className="text-[8px] text-gray-400">via {shareChannel}</p>
                    </div>
                  </div>
                  <div className="w-full h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[9px] text-gray-400 mb-2">[Share Image Preview]</div>
                  <p className="text-[9px] font-medium text-gray-700 dark:text-gray-300">Discover Gourmet Bistro — Exclusive Offer!</p>
                  <p className="text-[8px] text-gray-400 mt-0.5">Visit us today and enjoy 20% off your first order. Valid until Dec 2026.</p>
                  <div className="text-[8px] text-gray-400 mt-1">🔗 https://vcard.mcom/gourmet-bistro/offer</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge label="Image OK" active />
                    <Badge label="URL OK" active />
                    <Badge label="Branding OK" active />
                    <Badge label="Tracking OK" active />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* SECTION 6 — Exchange Simulation */}
          <SectionCard title="6. Exchange Simulation" desc="Test voucher, coupon, and offer exchange flows.">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {EXCHANGE_TYPES.map(ex => (
                  <button key={ex} onClick={() => { setExchangeType(ex); setShowExchangePreview(true) }}
                    className={`px-2 py-0.5 rounded text-[8px] font-medium border transition-colors ${
                      exchangeType === ex && showExchangePreview ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                    }`}>{ex}</button>
                ))}
              </div>
              {showExchangePreview && (
                <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{exchangeType}</h4>
                    <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[8px] font-medium">Eligible</span>
                  </div>
                  <div className="text-[9px] text-gray-500 space-y-0.5">
                    <p>Rule: Valid for Gold+ members · 1 use per customer · Expires 31 Dec 2026</p>
                    <p>Success: ✓ Voucher issued — share code: GOURMET-20-OFF</p>
                    <p className="text-gray-300">Failure: ✗ Would show "Not eligible" for non-Gold members</p>
                  </div>
                  <button onClick={() => toast.success('Exchange simulation complete')} className="mt-2 px-2 py-1 rounded bg-orange-500 text-white text-[9px] font-semibold hover:bg-orange-600">Simulate Exchange</button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* SECTION 7 — Redeem Simulation */}
          <SectionCard title="7. Redeem Simulation" desc="Test all redemption scenarios.">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {REDEEM_TYPES.map(r => (
                  <button key={r} onClick={() => setShowRedeemPreview(true)}
                    className={`px-2 py-0.5 rounded text-[8px] font-medium border ${r.includes('Coming Soon') ? 'border-dashed border-gray-200 dark:border-gray-600 text-gray-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'} transition-colors`}>
                    {r}</button>
                ))}
              </div>
              {showRedeemPreview && (
                <div className="space-y-1">
                  {[
                    { scenario: 'Valid redemption', status: 'success' },
                    { scenario: 'Expired', status: 'error' },
                    { scenario: 'Already used', status: 'error' },
                    { scenario: 'Not eligible (wrong membership)', status: 'error' },
                    { scenario: 'Wrong business', status: 'error' },
                  ].map(r => (
                    <div key={r.scenario} className="flex items-center justify-between py-1 px-2 rounded bg-gray-50 dark:bg-gray-700/30">
                      <span className="text-[9px] text-gray-600 dark:text-gray-300">{r.scenario}</span>
                      <Badge label={r.status === 'success' ? 'Pass' : 'Fail'} active={r.status === 'success'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* SECTION 8 — Dynamic QR Simulation */}
          <SectionCard title="8. Dynamic QR Simulation" desc="Same QR code — different destination based on rules.">
            <div className="space-y-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {QR_SCENARIOS.map((qs, i) => (
                  <button key={i} onClick={() => { setQrScenario(i); setShowQrResult(true) }}
                    className={`shrink-0 px-2 py-1 rounded text-[8px] font-medium border transition-colors ${
                      qrScenario === i && showQrResult ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                    }`}>{qs}</button>
                ))}
              </div>
              {showQrResult && (
                <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{QR_SCENARIOS[qrScenario]}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">Destination: https://vcard.mcom/{QR_SCENARIOS[qrScenario].toLowerCase().replace(/\s+/g, '-').replace(/[—]/g, '')}</p>
                      <p className="text-[8px] text-gray-400">Same QR · Different destination · Rule: Active</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* SECTION 9 — Time-Based Simulation */}
          <SectionCard title="9. Time-Based Simulation" desc="Preview at different dates and times.">
            <div className="flex flex-wrap gap-1">
              {TIME_SLOTS.map(t => (
                <button key={t} onClick={() => setTimeSlot(t)}
                  className={`px-2 py-0.5 rounded text-[8px] font-medium border transition-colors ${
                    timeSlot === t ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'
                  }`}>{t}</button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right side — Live Preview + Reports */}
        <div className="lg:col-span-3 space-y-4">
          {/* Live Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Preview</h4>
                <span className="text-[9px] text-gray-400">— {category} · {membership} · {scenario}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-400">{DEVICES[device].name} · {timeSlot}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-center">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all ${DEVICES[device].cls}`}>
                {/* VCard Header */}
                <div className="h-20 bg-gradient-to-r from-orange-400 to-orange-600 relative">
                  <div className="absolute -bottom-6 left-3 w-12 h-12 rounded-lg bg-white dark:bg-gray-700 shadow flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-500">GB</span>
                  </div>
                </div>
                <div className="pt-7 px-3 pb-2">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">{selectedBusiness}</h3>
                  <p className="text-[9px] text-gray-400">Fine dining · {category} · {membership}</p>
                </div>
                <div className="px-3 pb-3 space-y-1">
                  {[
                    { name: 'Business Info', vis: true },
                    { name: 'Contact Details', vis: true },
                    { name: 'Gallery', vis: membership !== 'Bronze' },
                    { name: 'Share Offer', vis: true },
                    { name: 'Exchange Voucher', vis: membership === 'Gold' || membership === 'Platinum' || membership.includes('Pro') },
                    { name: 'Redeem Coupon', vis: membership === 'Platinum' || membership.includes('Pro') },
                    { name: 'Premium Banner', vis: membership.includes('Gold') || membership.includes('Platinum') },
                    { name: 'Analytics Summary', vis: membership === 'Platinum' || membership.includes('Pro') },
                    { name: 'Dynamic QR', vis: true },
                  ].map(b => (
                    <div key={b.name} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${b.vis ? 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'}`}>
                      <span className={`text-[9px] font-medium ${b.vis ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{b.name}</span>
                      {b.vis ? <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        : <span className="text-[7px] text-gray-300 dark:text-gray-600">Hidden</span>}
                    </div>
                  ))}
                </div>
                {scenario === 'Guest' && (
                  <div className="mx-3 mb-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center text-[9px] text-gray-400">Guest view — limited to basic information only</div>
                )}
                {scenario === 'VIP Customer' && (
                  <div className="mx-3 mb-3 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-center text-[9px] text-amber-700 dark:text-amber-300">VIP — Premium rewards and exclusive offers unlocked</div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 10 — Integration Preview */}
          <SectionCard title="10. Integration Preview (Coming Soon)" desc="See where future integrations will appear.">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { name: 'MCOM Rewards', desc: 'Reward balances' },
                { name: 'MCOMMall Cashback', desc: 'Cashback blocks' },
                { name: 'FundOrDonate', desc: 'Fundraising widgets' },
                { name: 'MCOM Spin', desc: 'Gamification' },
                { name: '247GBS Audit', desc: 'Recommendations' },
                { name: 'Expo', desc: 'Events & expos' },
              ].map(f => (
                <div key={f.name} className="p-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-[10px] font-medium text-gray-400">{f.name}</p>
                  <p className="text-[8px] text-gray-300 dark:text-gray-600">{f.desc}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 text-[7px]">Coming Soon</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 11 — Accessibility Testing */}
          <SectionCard title="11. Accessibility Testing" desc="Ensure the VCard is usable for everyone.">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { check: 'Text Contrast', status: 'Pass', active: true },
                { check: 'Button Size (≥44px)', status: 'Pass', active: true },
                { check: 'Touch Targets', status: 'Pass', active: true },
                { check: 'Font Scaling', status: 'Warn', active: false },
                { check: 'Screen Reader Labels', status: 'Pass', active: true },
                { check: 'Keyboard Navigation', status: 'Pass', active: true },
              ].map(a => (
                <div key={a.check} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-[9px] text-gray-600 dark:text-gray-300">{a.check}</span>
                  <Badge label={a.status} active={a.active} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 12 — Performance Analysis */}
          <SectionCard title="12. Performance Analysis" desc="Estimated metrics for this template.">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: 'Template Size', value: '1.2 MB', warn: false },
                { label: 'Images', value: '8', warn: false },
                { label: 'Videos', value: '2', warn: false },
                { label: 'Mobile Load Time', value: '2.4s', warn: true },
                { label: 'External Requests', value: '12', warn: false },
                { label: 'Optimization Score', value: '86/100', warn: false },
              ].map(p => (
                <div key={p.label} className="p-2 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[9px] text-gray-400">{p.label}</p>
                  <p className={`text-xs font-bold mt-0.5 ${p.warn ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>{p.value}</p>
                  {p.warn && <p className="text-[7px] text-amber-500 mt-0.5">⚠ May affect load time</p>}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 13 — Validation Report */}
          <SectionCard title="13. Validation Report" desc="Automatic checks on template completeness." defaultOpen>
            <div className="space-y-1">
              {[
                { check: 'Logo present', pass: true },
                { check: 'Contact information complete', pass: true },
                { check: 'Required fields completed', pass: true },
                { check: 'QR configured', pass: true },
                { check: 'Share links valid', pass: true },
                { check: 'Images optimized', pass: true },
                { check: 'Responsive layout passed', pass: true },
                { check: 'Membership rules valid', pass: true },
                { check: 'Dynamic rules valid', pass: true },
                { check: 'No broken links', pass: true },
              ].map(v => (
                <div key={v.check} className="flex items-center gap-2 py-1">
                  <svg className={`w-3.5 h-3.5 ${v.pass ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.pass ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                  </svg>
                  <span className="text-[10px] text-gray-600 dark:text-gray-300">{v.check}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 14 — Publishing Checklist */}
          <SectionCard title="14. Publishing Checklist" desc="All items must pass before publishing." defaultOpen>
            <div className="space-y-1.5">
              {Object.entries(checklist).map(([item, passed]) => (
                <div key={item} onClick={() => toggleChecklist(item)} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${passed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    {passed && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-[10px] flex-1 ${passed ? 'text-gray-700 dark:text-gray-300 line-through opacity-60' : 'text-gray-500'}`}>{item}</span>
                  <Badge label={passed ? 'Pass' : 'Pending'} active={passed} />
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg border text-center text-xs font-medium ${allPassed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}">
              {allPassed ? '✓ All checks passed — template ready to publish' : `${Object.values(checklist).filter(v => !v).length} item(s) remaining — complete all checks to enable publishing`}
            </div>
          </SectionCard>

          {/* SECTION 15 — Preview Links */}
          <SectionCard title="15. Preview Links" desc="Generate temporary preview links for review.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 dark:text-gray-300">Preview URL</span>
                  <button onClick={() => { navigator.clipboard.writeText('https://preview.mcomvcard.com/t/abc123'); toast.success('URL copied') }} className="text-[9px] text-orange-500 hover:underline">Copy</button>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-[9px] text-gray-500 font-mono break-all">https://preview.mcomvcard.com/t/abc123</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 dark:text-gray-300">QR Preview</span>
                  <button onClick={() => toast.success('QR preview generated')} className="text-[9px] text-orange-500 hover:underline">Generate</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Set Expiration</span><select className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[9px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>24 hours</option><option>7 days</option><option>30 days</option><option>No expiration</option></select></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Password Protect</span><Toggle on={false} onClick={() => toast.success('Password protection toggled')} /></div>
                <div className="flex gap-2">
                  <button onClick={() => toast.success('Preview URL generated')} className="flex-1 px-2 py-1 rounded bg-orange-500 text-white text-[9px] font-semibold hover:bg-orange-600">Generate URL</button>
                  <button onClick={() => toast.success('QR preview generated')} className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-[9px] text-gray-600 dark:text-gray-300 hover:bg-gray-50">Generate QR</button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SECTION 16 — Collaboration & Approval */}
          <SectionCard title="16. Collaboration & Approval" desc="Review and approve before publishing.">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="Leave a review comment..." className="flex-1 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                <button onClick={() => toast.success('Comment added')} className="px-3 py-1.5 rounded bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Comment</button>
              </div>
              <div className="space-y-1">
                {[
                  { user: 'Admin', action: 'Requested changes — update gallery images', time: '2 hrs ago' },
                  { user: 'QA Reviewer', action: 'Approved — all tests passed', time: '1 hr ago' },
                  { user: 'Platform Admin', action: 'Changes applied, re-requesting review', time: '30 min ago' },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-700/50">
                    <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[8px] font-medium text-gray-500 shrink-0">{c.user.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-700 dark:text-gray-300"><span className="font-medium">{c.user}</span> {c.action}</p>
                      <p className="text-[8px] text-gray-400">{c.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success('Template approved')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Approve</button>
                <button onClick={() => toast.success('Changes requested')} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-[10px] font-medium text-red-500 hover:bg-red-50">Request Changes</button>
                <button onClick={() => toast.success('Revision comparison opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Compare Revisions</button>
              </div>
            </div>
          </SectionCard>

          {/* Permissions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { role: 'Super Admin', level: 'Full access', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
              { role: 'Platform Admin', level: 'Test & publish', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
              { role: 'Template Designer', level: 'Test only, cannot publish', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { role: 'QA Reviewer', level: 'Test & approve, cannot edit', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { role: 'Support', level: 'Read-only', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            ].map(p => (
              <div key={p.role} className={`p-2 rounded-lg ${p.bg} text-center`}>
                <p className={`text-[10px] font-bold ${p.color}`}>{p.role}</p>
                <p className="text-[8px] text-gray-500 mt-0.5">{p.level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
