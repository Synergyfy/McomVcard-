import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface NotificationSetting { event: string; inApp: boolean; email: boolean; sms: boolean; whatsapp: boolean }
interface Integration { name: string; status: string; config: string }
interface ApprovalWorkflow { name: string; steps: number; escalation: string; enabled: boolean }
interface AuditEvent { event: string; enabled: boolean; retention: string }
interface Permission { role: string; access: string; }

const currencies = ['GBP', 'USD', 'EUR', 'NGN', 'CAD', 'AUD', 'JPY', 'CHF']
const timezones = ['Europe/London', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Asia/Tokyo', 'Asia/Dubai', 'Asia/Singapore', 'Australia/Sydney', 'Africa/Lagos', 'Africa/Cairo', 'Africa/Johannesburg']
const languages = ['English', 'French', 'Spanish', 'German', 'Arabic', 'Portuguese', 'Japanese', 'Chinese']
const defaultStatuses = ['Draft', 'Active', 'Pending Approval']
const gracePeriods = ['7 Days', '14 Days', '30 Days']
const expiryBehaviours = ['Suspend Access', 'Restrict Allocations', 'Read-Only Dashboard', 'Immediate Deactivation']
const reinstatementRules = ['Automatic After Renewal', 'Manual Approval', 'Restore Previous Entitlements']
const renewalBehaviours = ['Automatic', 'Manual', 'Admin Approval']
const allocationBehaviours = ['Fixed', 'Unlimited', 'Pool', 'Promotional']
const expiryTypes = ['Never Expire', 'Membership Expiry', 'Time-Based', 'Promotional']
const logLevels = ['Basic', 'Standard', 'Detailed', 'Debug']
const retentionPeriods = ['1 Year', '3 Years', '7 Years', 'Never Delete']
const permissions: Permission[] = [
  { role: 'Super Admin', access: 'Full Configuration Access' },
  { role: 'Platform Administrator', access: 'Manage Operational Settings' },
  { role: 'Commercial Director', access: 'View Pricing & Lifecycle' },
  { role: 'Operations Manager', access: 'View Workflows & Notifications' },
]
const integrations: Integration[] = [
  { name: 'MCOM Solutions', status: 'Connected', config: 'Authentication' },
  { name: 'MCOM Rewards', status: 'Coming Soon', config: 'Membership Sync' },
  { name: 'MCOMMall', status: 'Coming Soon', config: 'Shopping Benefits' },
  { name: 'FundOrDonate', status: 'Coming Soon', config: 'Donation Eligibility' },
  { name: 'MCOM Spin', status: 'Coming Soon', config: 'Promotional Eligibility' },
  { name: 'Affiliate Platform', status: 'Coming Soon', config: 'Referral Eligibility' },
]
const approvalWorkflows: ApprovalWorkflow[] = [
  { name: 'Business Upgrade', steps: 1, escalation: '48 Hours', enabled: true },
  { name: 'Business Downgrade', steps: 2, escalation: '48 Hours', enabled: true },
  { name: 'Complimentary Membership', steps: 1, escalation: '24 Hours', enabled: false },
  { name: 'Manual Allocation Increase', steps: 2, escalation: '7 Days', enabled: true },
  { name: 'Consumer Manual Promotion', steps: 1, escalation: '24 Hours', enabled: true },
  { name: 'Consumer Manual Demotion', steps: 2, escalation: '48 Hours', enabled: true },
  { name: 'Consumer Business Transfer', steps: 1, escalation: '7 Days', enabled: false },
  { name: 'Publish Campaign', steps: 1, escalation: '24 Hours', enabled: true },
  { name: 'High Value Discount', steps: 2, escalation: '48 Hours', enabled: true },
  { name: 'Unlimited Allocation', steps: 2, escalation: '7 Days', enabled: true },
]
const notificationEvents: NotificationSetting[] = [
  { event: 'Business Welcome', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Renewal Reminder', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Expiry Warning', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Upgrade Complete', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Consumer Membership Created', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Card Issued', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Promotion Applied', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Membership Progressed', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Approval Required', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'Allocation Warning', inApp: true, email: false, sms: false, whatsapp: false },
  { event: 'System Error', inApp: true, email: false, sms: false, whatsapp: false },
]
const auditEvents: AuditEvent[] = [
  { event: 'Membership Changes', enabled: true, retention: '7 Years' },
  { event: 'Allocation Changes', enabled: true, retention: '7 Years' },
  { event: 'Promotions', enabled: true, retention: '3 Years' },
  { event: 'Overrides', enabled: true, retention: '7 Years' },
  { event: 'Renewals', enabled: true, retention: '3 Years' },
  { event: 'Approval Decisions', enabled: true, retention: '3 Years' },
]

const tabs = ['general', 'lifecycle', 'business-defaults', 'consumer-defaults', 'allocation-defaults', 'approval-workflows', 'notifications', 'security', 'integrations', 'audit-logging']
const tabLabels = ['General', 'Lifecycle', 'Business Defaults', 'Consumer Defaults', 'Allocation Defaults', 'Approval Workflows', 'Notifications', 'Security', 'Integrations', 'Audit & Logging']

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button onClick={() => onChange(!enabled)} className={'relative w-10 h-5 rounded-full transition-colors ' + (enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600')}>
        <span className={'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ' + (enabled ? 'translate-x-5' : 'translate-x-0')} />
      </button>
    </div>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-48 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-48 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500" />
    </div>
  )
}

export default function MembershipSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const [membershipPrefix, setMembershipPrefix] = useState('MEM-')
  const [businessPrefix, setBusinessPrefix] = useState('BUS-')
  const [consumerPrefix, setConsumerPrefix] = useState('CON-')
  const [defaultCurrency, setDefaultCurrency] = useState('GBP')
  const [defaultTimezone, setDefaultTimezone] = useState('Europe/London')
  const [defaultLanguage, setDefaultLanguage] = useState('English')
  const [defaultStatus, setDefaultStatus] = useState('Draft')

  const [trialEnabled, setTrialEnabled] = useState(true)
  const [trialLength, setTrialLength] = useState('14 Days')
  const [maxTrialExtensions, setMaxTrialExtensions] = useState('1')
  const [renewalBehaviour, setRenewalBehaviour] = useState('Automatic')
  const [gracePeriod, setGracePeriod] = useState('14 Days')
  const [expiryBehaviour, setExpiryBehaviour] = useState('Restrict Allocations')
  const [reinstatementRule, setReinstatementRule] = useState('Automatic After Renewal')

  const [defaultBusinessPlan, setDefaultBusinessPlan] = useState('Bronze')
  const [businessDashboardDefaults, setBusinessDashboardDefaults] = useState(['Products', 'Services', 'Gallery', 'Bookings', 'Events', 'Contact Forms'])
  const [businessVCardTheme, setBusinessVCardTheme] = useState('Professional')
  const [businessVCardQR, setBusinessVCardQR] = useState(true)
  const [businessCardDigital, setBusinessCardDigital] = useState(true)
  const [businessCardPrinted, setBusinessCardPrinted] = useState(false)
  const [businessCardQR, setBusinessCardQR] = useState(true)
  const [defaultBusinessCardTemplate, setDefaultBusinessCardTemplate] = useState('Standard')

  const [defaultConsumerLevel, setDefaultConsumerLevel] = useState('Bronze')
  const [consumerVCardShare, setConsumerVCardShare] = useState(true)
  const [consumerVCardExchange, setConsumerVCardExchange] = useState(true)
  const [consumerVCardRedeem, setConsumerVCardRedeem] = useState(true)
  const [consumerCardQR, setConsumerCardQR] = useState(true)
  const [consumerECard, setConsumerECard] = useState(true)
  const [defaultConsumerCardTemplate, setDefaultConsumerCardTemplate] = useState('Standard')
  const [ffDefaultAllocation, setFfDefaultAllocation] = useState('5')
  const [ffRelationshipRules, setFfRelationshipRules] = useState('Open')

  const [businessVCardsDefault, setBusinessVCardsDefault] = useState('50')
  const [businessCardsDefault, setBusinessCardsDefault] = useState('100')
  const [consumerVCardsDefault, setConsumerVCardsDefault] = useState('10')
  const [consumerCardsDefault, setConsumerCardsDefault] = useState('20')
  const [ffDefault, setFfDefault] = useState('5')
  const [additionalCardsDefault, setAdditionalCardsDefault] = useState('10')
  const [ecardsDefault, setEcardsDefault] = useState('Unlimited')
  const [allocationBehaviour, setAllocationBehaviour] = useState('Fixed')
  const [allocationExpiry, setAllocationExpiry] = useState('Membership Expiry')
  const [restrictedAllocationMode, setRestrictedAllocationMode] = useState(true)

  const [draftEditing, setDraftEditing] = useState(true)
  const [activeEditing, setActiveEditing] = useState(false)
  const [archivedEditing, setArchivedEditing] = useState(false)
  const [overrideCreatePermission, setOverrideCreatePermission] = useState('Super Admin')
  const [overrideRemovePermission, setOverrideRemovePermission] = useState('Super Admin')
  const [complimentaryPermission, setComplimentaryPermission] = useState('Platform Administrator')
  const [increaseAllocationPermission, setIncreaseAllocationPermission] = useState('Platform Administrator')
  const [confirmDeletion, setConfirmDeletion] = useState(true)
  const [confirmAllocationReset, setConfirmAllocationReset] = useState(true)
  const [confirmDowngrade, setConfirmDowngrade] = useState(true)
  const [confirmCancellation, setConfirmCancellation] = useState(true)
  const [sessionLogging, setSessionLogging] = useState(true)

  const [logLevel, setLogLevel] = useState('Standard')
  const [retentionPeriod, setRetentionPeriod] = useState('7 Years')

  function toggleDashboardFeature(feature: string) {
    setBusinessDashboardDefaults(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature])
  }

  function toggleNotification(index: number, channel: 'inApp' | 'email' | 'sms' | 'whatsapp') {
    const newEvents = [...notificationEvents]
    newEvents[index] = { ...newEvents[index], [channel]: !newEvents[index][channel] }
    notificationEvents.splice(0, notificationEvents.length, ...newEvents)
    toast.success(channel === 'inApp' ? 'In-app toggled' : channel + ' toggled (' + (newEvents[index][channel] ? 'On' : 'Off') + ')')
    setTab(tab)
  }

  function toggleAuditEvent(index: number) {
    auditEvents[index].enabled = !auditEvents[index].enabled
    toast.success('Audit event ' + (auditEvents[index].enabled ? 'enabled' : 'disabled'))
    setTab(tab)
  }

  function validate(): string[] {
    const errors: string[] = []
    if (!membershipPrefix) errors.push('Membership prefix is required')
    if (!businessPrefix) errors.push('Business prefix is required')
    if (!consumerPrefix) errors.push('Consumer prefix is required')
    if ([membershipPrefix, businessPrefix, consumerPrefix].some((v, i, a) => a.indexOf(v) !== i)) errors.push('Numbering prefixes must be unique')
    if (!defaultCurrency) errors.push('Default currency is required')
    if (!defaultTimezone) errors.push('Default time zone is required')
    if (!defaultLanguage) errors.push('Default language is required')
    if (trialEnabled && !trialLength) errors.push('Trial length is required when trial is enabled')
    if (!gracePeriod) errors.push('Grace period is required')
    if (parseInt(businessVCardsDefault) < 0) errors.push('Business VCards default must be valid')
    if (parseInt(consumerCardsDefault) < 0) errors.push('Consumer Cards default must be valid')
    return errors
  }

  function handleSave() {
    const errors = validate()
    if (errors.length > 0) {
      toast.error('Validation failed: ' + errors.join(', '))
      return
    }
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success('Membership settings saved successfully') }, 1200)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load Membership Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The configuration service could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Membership Settings</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure global Membership Engine behaviour for the entire platform.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Membership Engine</div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-sm font-semibold text-green-600">Healthy</span></div></div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Plans</div><div className="text-sm font-semibold">12 Active</div></div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Business Memberships</div><div className="text-sm font-semibold">2,430 Active</div></div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Consumer Memberships</div><div className="text-sm font-semibold">31,520 Active</div></div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pending Renewals</div><div className="flex items-center gap-2"><span className="text-sm font-semibold text-amber-600">41</span></div></div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-3"><div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Failed Jobs / Promotion</div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-sm font-semibold text-green-600">0 / Healthy</span></div></div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="space-y-4">
          <Section title="Membership Number Format" desc="Configure prefixes for auto-generated membership IDs across the platform.">
            <Input label="Membership Prefix" value={membershipPrefix} onChange={setMembershipPrefix} placeholder="MEM-" />
            <Input label="Business Prefix" value={businessPrefix} onChange={setBusinessPrefix} placeholder="BUS-" />
            <Input label="Consumer Prefix" value={consumerPrefix} onChange={setConsumerPrefix} placeholder="CON-" />
          </Section>
          <Section title="Platform Defaults" desc="These values apply across the entire platform unless overridden by a Business.">
            <Select label="Default Currency" value={defaultCurrency} options={currencies} onChange={setDefaultCurrency} />
            <Select label="Default Time Zone" value={defaultTimezone} options={timezones} onChange={setDefaultTimezone} />
            <Select label="Default Language" value={defaultLanguage} options={languages} onChange={setDefaultLanguage} />
            <Select label="Default Membership Status" value={defaultStatus} options={defaultStatuses} onChange={setDefaultStatus} />
          </Section>
        </div>
      )}

      {tab === 'lifecycle' && (
        <div className="space-y-4">
          <Section title="Trial Settings" desc="Configure how trial memberships behave across the platform.">
            <Toggle label="Trial Enabled" enabled={trialEnabled} onChange={setTrialEnabled} />
            <Select label="Trial Length" value={trialLength} options={['7 Days', '14 Days', '30 Days', '60 Days']} onChange={setTrialLength} />
            <Select label="Max Trial Extensions" value={maxTrialExtensions} options={['0', '1', '2', '3', 'Unlimited']} onChange={setMaxTrialExtensions} />
          </Section>
          <Section title="Renewal & Expiry" desc="Configure renewal behaviour, grace periods, and what happens when memberships expire.">
            <Select label="Renewal Behaviour" value={renewalBehaviour} options={renewalBehaviours} onChange={setRenewalBehaviour} />
            <Select label="Grace Period" value={gracePeriod} options={gracePeriods} onChange={setGracePeriod} />
            <Select label="Expiry Behaviour" value={expiryBehaviour} options={expiryBehaviours} onChange={setExpiryBehaviour} />
            <Select label="Reinstatement Rule" value={reinstatementRule} options={reinstatementRules} onChange={setReinstatementRule} />
          </Section>
        </div>
      )}

      {tab === 'business-defaults' && (
        <div className="space-y-4">
          <Section title="Default Business Membership" desc="Choose the default plan assigned to new businesses.">
            <Select label="Default Plan" value={defaultBusinessPlan} options={['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro']} onChange={setDefaultBusinessPlan} />
          </Section>
          <Section title="Business Dashboard Defaults" desc="Enable or disable dashboard sections by default. Plans may override these.">
            {['Products', 'Services', 'Gallery', 'Bookings', 'Events', 'Contact Forms'].map(f => (
              <Toggle key={f} label={f} enabled={businessDashboardDefaults.includes(f)} onChange={() => toggleDashboardFeature(f)} />
            ))}
          </Section>
          <Section title="Business VCard Defaults" desc="Default VCard configuration for new businesses.">
            <Select label="Default Theme" value={businessVCardTheme} options={['Professional', 'Modern', 'Classic', 'Minimal', 'Bold']} onChange={setBusinessVCardTheme} />
            <Toggle label="QR Code Enabled" enabled={businessVCardQR} onChange={setBusinessVCardQR} />
          </Section>
          <Section title="Business Card Defaults" desc="Default card configuration for new businesses.">
            <Select label="Default Template" value={defaultBusinessCardTemplate} options={['Standard', 'Premium', 'Compact', 'Wide']} onChange={setDefaultBusinessCardTemplate} />
            <Toggle label="Digital Card Enabled" enabled={businessCardDigital} onChange={setBusinessCardDigital} />
            <Toggle label="Printed Card Enabled" enabled={businessCardPrinted} onChange={setBusinessCardPrinted} />
            <Toggle label="QR Code Enabled" enabled={businessCardQR} onChange={setBusinessCardQR} />
          </Section>
        </div>
      )}

      {tab === 'consumer-defaults' && (
        <div className="space-y-4">
          <Section title="Default Consumer Level" desc="The starting level for new consumers.">
            <Select label="Default Level" value={defaultConsumerLevel} options={['Bronze', 'Silver', 'Gold', 'Platinum']} onChange={setDefaultConsumerLevel} />
          </Section>
          <Section title="Consumer VCard Defaults" desc="Default VCard sharing and exchange behaviour.">
            <Toggle label="Share Enabled" enabled={consumerVCardShare} onChange={setConsumerVCardShare} />
            <Toggle label="Exchange Enabled" enabled={consumerVCardExchange} onChange={setConsumerVCardExchange} />
            <Toggle label="Redeem Enabled" enabled={consumerVCardRedeem} onChange={setConsumerVCardRedeem} />
          </Section>
          <Section title="Consumer Card Defaults" desc="Default card configuration for new consumers.">
            <Select label="Default Template" value={defaultConsumerCardTemplate} options={['Standard', 'Premium', 'Compact']} onChange={setDefaultConsumerCardTemplate} />
            <Toggle label="QR Code Enabled" enabled={consumerCardQR} onChange={setConsumerCardQR} />
            <Toggle label="eCard Enabled" enabled={consumerECard} onChange={setConsumerECard} />
          </Section>
          <Section title="Friends & Family Defaults" desc="Default F&F allocation and relationship rules. Plans may override these.">
            <Select label="Default Allocation" value={ffDefaultAllocation} options={['1', '3', '5', '10', '20', 'Unlimited']} onChange={setFfDefaultAllocation} />
            <Select label="Relationship Rules" value={ffRelationshipRules} options={['Open', 'Restricted', 'Approval Required']} onChange={setFfRelationshipRules} />
          </Section>
        </div>
      )}

      {tab === 'allocation-defaults' && (
        <div className="space-y-4">
          <Section title="Default Allocations" desc="Platform-wide default allocation values. Plans and overrides may change these per entity.">
            <Input label="Business VCards" value={businessVCardsDefault} onChange={setBusinessVCardsDefault} />
            <Input label="Business Cards" value={businessCardsDefault} onChange={setBusinessCardsDefault} />
            <Input label="Consumer VCards" value={consumerVCardsDefault} onChange={setConsumerVCardsDefault} />
            <Input label="Consumer Cards" value={consumerCardsDefault} onChange={setConsumerCardsDefault} />
            <Input label="Friends & Family" value={ffDefault} onChange={setFfDefault} />
            <Input label="Additional Cards" value={additionalCardsDefault} onChange={setAdditionalCardsDefault} />
            <Select label="eCards" value={ecardsDefault} options={['Unlimited', '10', '25', '50', '100']} onChange={setEcardsDefault} />
          </Section>
          <Section title="Allocation Behaviour" desc="How allocations are managed across the platform.">
            <Select label="Allocation Type" value={allocationBehaviour} options={allocationBehaviours} onChange={setAllocationBehaviour} />
            <Select label="Expiry Behaviour" value={allocationExpiry} options={expiryTypes} onChange={setAllocationExpiry} />
          </Section>
          <Section title="Restricted Allocation Mode" desc="When enabled, downgrades preserve issued cards but block new issuances until usage drops below the new entitlement.">
            <Toggle label="Restricted Allocation Mode" enabled={restrictedAllocationMode} onChange={setRestrictedAllocationMode} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: Enabled. Prevents data loss while enforcing plan limits.</p>
          </Section>
        </div>
      )}

      {tab === 'approval-workflows' && (
        <div className="space-y-4">
          <Section title="Approval Workflows" desc="Define which actions require approval and the approval chain.">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="text-left py-2 font-medium text-gray-500">Action</th><th className="text-left py-2 font-medium text-gray-500">Approval Steps</th><th className="text-left py-2 font-medium text-gray-500">Escalation</th><th className="text-left py-2 font-medium text-gray-500">Enabled</th></tr></thead>
                <tbody>
                  {approvalWorkflows.map((w, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white">{w.name}</td>
                      <td className="py-2">{w.steps}-Step</td>
                      <td className="py-2 text-gray-500">{w.escalation}</td>
                      <td className="py-2"><span className={'px-2 py-0.5 rounded text-[10px] font-medium ' + (w.enabled ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{w.enabled ? 'Active' : 'Disabled'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          <Section title="Escalation Rules" desc="If approval is not completed within the defined timeframe, higher-level administrators are notified automatically.">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">24 Hours</div><div className="text-xs font-medium mt-1">Immediate Escalation</div></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">48 Hours</div><div className="text-xs font-medium mt-1">Senior Admin Notified</div></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">7 Days</div><div className="text-xs font-medium mt-1">Super Admin Notified</div></div>
            </div>
          </Section>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-4">
          <Section title="Notification Configuration" desc="Configure which events trigger notifications and through which channels.">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="text-left py-2 font-medium text-gray-500">Event</th><th className="text-center py-2 font-medium text-gray-500">In-App</th><th className="text-center py-2 font-medium text-gray-500">Email</th><th className="text-center py-2 font-medium text-gray-500">SMS</th><th className="text-center py-2 font-medium text-gray-500">WhatsApp</th></tr></thead>
                <tbody>
                  {notificationEvents.map((n, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white">{n.event}</td>
                      {(['inApp', 'email', 'sms', 'whatsapp'] as const).map(ch => (
                        <td key={ch} className="text-center py-2">
                          <button onClick={() => toggleNotification(i, ch)} className={'inline-block w-4 h-4 rounded border ' + (n[ch] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600')}>
                            {n[ch] && <svg className="w-3 h-3 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">Email, SMS, and WhatsApp channels are marked as Coming Soon in the platform. In-app notifications are active.</p>
          </Section>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4">
          <Section title="Membership Editing" desc="Control which membership states can be edited by administrators.">
            <Toggle label="Draft Memberships" enabled={draftEditing} onChange={setDraftEditing} />
            <Toggle label="Active Memberships" enabled={activeEditing} onChange={setActiveEditing} />
            <Toggle label="Archived Memberships" enabled={archivedEditing} onChange={setArchivedEditing} />
          </Section>
          <Section title="Override Permissions" desc="Define who can create and remove overrides across the platform.">
            <Select label="Create Overrides" value={overrideCreatePermission} options={['Super Admin', 'Platform Administrator']} onChange={setOverrideCreatePermission} />
            <Select label="Remove Overrides" value={overrideRemovePermission} options={['Super Admin', 'Platform Administrator']} onChange={setOverrideRemovePermission} />
            <Select label="Grant Complimentary" value={complimentaryPermission} options={['Super Admin', 'Platform Administrator']} onChange={setComplimentaryPermission} />
            <Select label="Increase Allocations" value={increaseAllocationPermission} options={['Super Admin', 'Platform Administrator']} onChange={setIncreaseAllocationPermission} />
          </Section>
          <Section title="Sensitive Actions" desc="Require confirmation before executing destructive operations.">
            <Toggle label="Membership Deletion" enabled={confirmDeletion} onChange={setConfirmDeletion} />
            <Toggle label="Allocation Reset" enabled={confirmAllocationReset} onChange={setConfirmAllocationReset} />
            <Toggle label="Downgrade" enabled={confirmDowngrade} onChange={setConfirmDowngrade} />
            <Toggle label="Cancellation" enabled={confirmCancellation} onChange={setConfirmCancellation} />
          </Section>
          <Section title="Session Logging" desc="Track administrator sessions for security and audit purposes.">
            <Toggle label="Session Logging Enabled" enabled={sessionLogging} onChange={setSessionLogging} />
            {sessionLogging && <p className="text-xs text-gray-500">Tracking: User, Device, Browser, IP Address, Timestamp</p>}
          </Section>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <Section title="Platform Integrations" desc="Current integration status across the MCOM ecosystem.">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="text-left py-2 font-medium text-gray-500">Platform</th><th className="text-left py-2 font-medium text-gray-500">Status</th><th className="text-left py-2 font-medium text-gray-500">Configuration</th></tr></thead>
                <tbody>
                  {integrations.map((int, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 text-gray-900 dark:text-white font-medium">{int.name}</td>
                      <td className="py-2"><span className={'px-2 py-0.5 rounded text-[10px] font-medium ' + (int.status === 'Connected' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600')}>{int.status}</span></td>
                      <td className="py-2 text-gray-500">{int.config}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">No business logic should be enabled until those platforms are integrated. All integrations except MCOM Solutions are marked as Coming Soon.</p>
          </Section>
        </div>
      )}

      {tab === 'audit-logging' && (
        <div className="space-y-4">
          <Section title="Audit Configuration" desc="Configure how membership events are recorded and retained.">
            <Select label="Log Level" value={logLevel} options={logLevels} onChange={setLogLevel} />
            <Select label="Retention Policy" value={retentionPeriod} options={retentionPeriods} onChange={setRetentionPeriod} />
          </Section>
          <Section title="Event Recording" desc="Select which events are logged for audit purposes.">
            <div className="space-y-2">
              {auditEvents.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <div><span className="text-sm text-gray-700 dark:text-gray-300">{a.event}</span><span className="text-xs text-gray-400 ml-2">({a.retention})</span></div>
                  <button onClick={() => toggleAuditEvent(i)} className={'relative w-10 h-5 rounded-full transition-colors ' + (a.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600')}>
                    <span className={'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ' + (a.enabled ? 'translate-x-5' : 'translate-x-0')} />
                  </button>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Export Options" desc="Supported export formats for audit logs.">
            <div className="flex gap-2">
              {['CSV', 'Excel', 'PDF', 'JSON'].map(f => (
                <span key={f} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">{f}</span>
              ))}
            </div>
          </Section>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Permissions</h3>
            <div className="grid grid-cols-4 gap-3">
              {permissions.map((p, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5"><div className="text-xs font-medium text-gray-900 dark:text-white">{p.role}</div><div className="text-[10px] text-gray-500 mt-0.5">{p.access}</div></div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">All other roles have read-only or no access depending on their role configuration.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
