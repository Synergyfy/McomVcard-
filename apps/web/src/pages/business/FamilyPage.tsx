import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import InfoTooltip from '../../components/common/InfoTooltip'
import { businessService, type Business, type BusinessFamilyMember, type BusinessFamilyStatus, type BusinessPermissions } from '../../services/businessApi'

const RELATIONSHIPS = ['Family', 'Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Friend', 'Team member', 'Other']
const COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500']
const STATUS: Record<BusinessFamilyStatus, { label: string; cls: string; dot: string }> = {
  allocated: { label: 'Allocated', cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', dot: 'bg-blue-500' },
  active: { label: 'Active', cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', dot: 'bg-emerald-500' },
  suspended: { label: 'Suspended', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', dot: 'bg-amber-500' },
  removed: { label: 'Removed / Replaced', cls: 'bg-red-50 dark:bg-red-900/20 text-red-600', dot: 'bg-red-500' },
}
const occupies = (s: BusinessFamilyStatus) => s === 'active' || s === 'allocated' || s === 'suspended'
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FamilyPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [permissions, setPermissions] = useState<BusinessPermissions | null>(null)
  const [members, setMembers] = useState<BusinessFamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('Family')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [businesses, perms] = await Promise.all([businessService.getMyBusinesses(), businessService.getBusinessPermissions()])
        if (cancelled) return
        const first = businesses[0] ?? null
        setBusiness(first); setPermissions(perms)
        if (first) { const list = await businessService.getFamilyMembers(first.id); if (!cancelled) setMembers(list) }
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const limit = permissions?.limits.friends_family ?? null
  const used = members.filter((m) => occupies(m.status)).length
  const remaining = limit === null ? null : Math.max(0, limit - used)
  const canAllocate = limit === null || (remaining ?? 0) > 0
  const membershipName = permissions?.tier_name || [permissions?.plan_level, permissions?.plan_tier].filter(Boolean).join(' ') || 'No active membership'
  const limitLabel = limit === null ? 'Unlimited' : String(limit)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1_500_000) { toast.error('Choose an image smaller than 1.5 MB'); return }
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Enter the member name.'
    else if (name.trim().length < 2) next.name = 'Name must be at least 2 characters.'
    if (email.trim() && !emailRe.test(email.trim())) next.email = 'Enter a valid email address.'
    if (phone.trim() && phone.replace(/\D/g, '').length < 6) next.phone = 'Enter a valid phone number.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) { toast.error('Create your business profile first.'); return }
    if (!canAllocate) { toast.error('Allocation full — upgrade your membership to add more cards.'); return }
    if (!validate()) return
    setSaving(true)
    try {
      const created = await businessService.createFamilyMember(business.id, {
        name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined,
        relationship: relationship || 'Family', avatar: avatar || undefined,
      })
      if (!created) { toast.error('Could not allocate the card. Check your membership limit.'); return }
      setMembers((prev) => [created, ...prev])
      toast.success(`${created.name} added — card allocated`)
      setShowAdd(false); setName(''); setRelationship('Family'); setEmail(''); setPhone(''); setAvatar(''); setErrors({})
    } finally { setSaving(false) }
  }

  const updateStatus = async (member: BusinessFamilyMember, next: BusinessFamilyStatus) => {
    if (!occupies(member.status) && occupies(next) && !canAllocate) { toast.error('Allocation full — upgrade your membership to add more cards.'); return }
    const updated = await businessService.updateFamilyMemberStatus(member.id, next)
    if (!updated) { toast.error('Could not update this allocation.'); return }
    setMembers((prev) => prev.map((x) => x.id === member.id ? updated : x))
    toast.success(`${member.name} updated`)
  }

  const actions = (m: BusinessFamilyMember) => {
    if (m.status === 'allocated') return [{ label: 'Activate', onClick: () => updateStatus(m, 'active') }, { label: 'Remove', onClick: () => updateStatus(m, 'removed') }, { label: 'Share', onClick: () => toast.success(`Invite re-sent to ${m.name}`) }]
    if (m.status === 'suspended') return [{ label: 'Reactivate', onClick: () => updateStatus(m, 'active') }, { label: 'Replace', onClick: () => updateStatus(m, 'removed') }, { label: 'Share', onClick: () => toast.success(`Share link sent to ${m.name}`) }]
    if (m.status === 'removed') return [{ label: 'Reallocate', onClick: () => updateStatus(m, 'allocated') }]
    return [{ label: 'Suspend', onClick: () => updateStatus(m, 'suspended') }, { label: 'Replace', onClick: () => updateStatus(m, 'removed') }, { label: 'Share', onClick: () => toast.success(`Share link sent to ${m.name}`) }]
  }

  const inputCls = 'w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500'

  return (
    <div className="space-y-6 animate-fadeIn max-w-lg">
      <Helmet><title>Friends & Family - MCOMVCard</title></Helmet>
      <div className="flex items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends & Family</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Extra cards you give to your team.</p></div>
        <button onClick={() => setShowAdd(true)} disabled={!canAllocate} className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{canAllocate ? '+ Add Card' : 'Allocation Full'}</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">★</div>
          <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-gray-400">Current membership</p><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{loading ? 'Loading…' : membershipName}</p></div>
          <span className="ml-auto shrink-0 text-[10px] text-gray-400">Entitlement: {limitLabel} cards</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="Included cards" value={limit === null ? '∞' : limit} tone="text-gray-900 dark:text-white" />
          <Stat label="Used cards" value={used} tone="text-orange-600" />
          <Stat label="Remaining" value={remaining === null ? '∞' : remaining} tone="text-emerald-600" />
        </div>
        <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: limit === null ? '4%' : `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} /></div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{remaining === null ? 'Your membership has unlimited Friends & Family allocations.' : remaining > 0 ? `${remaining} card${remaining === 1 ? '' : 's'} remaining — you cannot exceed your ${membershipName} entitlement.` : 'Allocation full. Remove or replace a card, or upgrade your membership to add more.'}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Card states</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">{(['allocated', 'active', 'suspended', 'removed'] as BusinessFamilyStatus[]).map((s) => <span key={s} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400"><span className={`w-2 h-2 rounded-full ${STATUS[s].dot}`} />{STATUS[s].label}</span>)}</div>
      </div>

      <div className="space-y-3">
        {loading && <p className="py-6 text-center text-sm text-gray-400">Loading your allocations…</p>}
        {!loading && members.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-600 dark:bg-gray-800"><p className="text-sm text-gray-500 dark:text-gray-400">No Friends & Family cards allocated yet.</p></div>}
        {members.map((m, index) => {
          const status = STATUS[m.status]
          return (
            <div key={m.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-center gap-3">
                {m.avatar ? <div className="w-11 h-11 rounded-full overflow-hidden shrink-0"><img src={m.avatar} alt="" className="w-full h-full object-cover" /></div> : <div className={`w-11 h-11 rounded-full ${COLORS[index % COLORS.length]} text-white flex items-center justify-center text-sm font-bold shrink-0`}>{m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div>}
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{m.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.relationship} · allocated {new Date(m.created_at).toLocaleDateString('en-GB')}</p>{m.phone || m.email ? <p className="text-[11px] text-gray-400 truncate">{m.phone}{m.phone && m.email ? ' · ' : ''}{m.email}</p> : null}</div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
              </div>
              <div className="mt-3 flex gap-2">{actions(m).map((a) => <button key={a.label} onClick={a.onClick} className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">{a.label}</button>)}</div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl p-5 animate-slideUp max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Member</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allocate an additional card — {canAllocate ? `${remaining === null ? 'Unlimited' : remaining} of ${limitLabel} remaining.` : 'allocation is full.'}</p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">{avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}</div>
                <div className="flex-1"><label className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300">Photo <span className="ml-1 text-[10px] font-normal text-gray-400">(where permitted)</span><InfoTooltip text="Optional photo shown on the family member's card." /></label><button type="button" onClick={() => document.getElementById('family-photo')?.click()} className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">Upload photo</button><input id="family-photo" type="file" accept="image/*" className="hidden" onChange={handlePhoto} /></div>
              </div>
              <div><label className="mb-1 flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300">Full name<InfoTooltip text="The name shown on the allocated card and in this list." /></label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-invalid={!!errors.name} className={inputCls} />{errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}</div>
              <div><label className="mb-1 flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300">Relationship<InfoTooltip text="How this person is related to you or your business. Used for display only." /></label><select value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputCls}>{RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}</select></div>
              <div><label className="mb-1 flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300">Email address<InfoTooltip text="Optional. Used to send the card invitation and share link." /></label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" aria-invalid={!!errors.email} className={inputCls} />{errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}</div>
              <div><label className="mb-1 flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300">Phone number<InfoTooltip text="Optional contact number for the allocated member." /></label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" aria-invalid={!!errors.phone} className={inputCls} />{errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}</div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3"><p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">{canAllocate ? `Allocating a card uses one of your ${limitLabel} included cards${remaining === null ? '' : ` (${remaining} left)`}. You cannot exceed your membership entitlement.` : 'Allocation full — remove or replace a card, or upgrade your membership to allocate more.'}</p></div>
              <button type="submit" disabled={!canAllocate || saving} className="w-full py-3.5 min-h-[48px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Allocating…' : 'Allocate Card'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-center"><p className={`text-lg font-bold ${tone}`}>{value}</p><p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p></div>
}
