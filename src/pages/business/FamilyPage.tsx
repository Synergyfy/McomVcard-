import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import {
    businessMembership,
    familyAllocationLimit,
    mockFamilyMembers,
    type FamilyMember,
    type FamilyCardStatus,
} from '../../services/businessDashboardStore'

const RELATIONSHIPS = ['Family', 'Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Friend', 'Team member', 'Other']

const AVATAR_COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500']

const STATUS_META: Record<FamilyCardStatus, { label: string; cls: string; dot: string }> = {
    available: { label: 'Available', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500', dot: 'bg-gray-400' },
    allocated: { label: 'Allocated', cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', dot: 'bg-blue-500' },
    active: { label: 'Active', cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', dot: 'bg-emerald-500' },
    suspended: { label: 'Suspended', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', dot: 'bg-amber-500' },
    removed: { label: 'Removed / Replaced', cls: 'bg-red-50 dark:bg-red-900/20 text-red-600', dot: 'bg-red-500' },
}

const ACTION_LABEL: Record<FamilyCardStatus, string> = {
    available: 'made available',
    allocated: 'allocated',
    active: 'activated',
    suspended: 'suspended',
    removed: 'removed — card slot freed',
}

const occupiesSlot = (s: FamilyCardStatus) => s === 'active' || s === 'allocated' || s === 'suspended'

export default function FamilyPage() {
    const [members, setMembers] = useState<FamilyMember[]>(mockFamilyMembers)
    const [showAdd, setShowAdd] = useState(false)
    const [name, setName] = useState('')
    const [relationship, setRelationship] = useState('Family')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [avatar, setAvatar] = useState('')

    const used = members.filter(m => occupiesSlot(m.status)).length
    const remaining = familyAllocationLimit - used
    const canAllocate = remaining > 0

    const updateStatus = (id: number, next: FamilyCardStatus) => {
        const m = members.find(x => x.id === id)
        if (!m) return
        const usedNow = members.filter(x => occupiesSlot(x.status)).length
        if (!occupiesSlot(m.status) && occupiesSlot(next) && usedNow >= familyAllocationLimit) {
            toast.error('Allocation full — upgrade your membership to add more cards.')
            return
        }
        setMembers(prev => prev.map(x => (x.id === id ? { ...x, status: next } : x)))
        toast.success(`${m.name} ${ACTION_LABEL[next]}`)
    }

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setAvatar(String(reader.result))
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!canAllocate) {
            toast.error('Allocation full — upgrade your membership to add more cards.')
            return
        }
        const displayName = name.trim() || 'New member'
        const member: FamilyMember = {
            id: Date.now(),
            name: displayName,
            relationship: relationship || 'Family',
            initials: displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            color: AVATAR_COLORS[members.length % AVATAR_COLORS.length],
            email: email.trim(),
            phone: phone.trim(),
            avatar,
            membership: businessMembership,
            allocatedAt: 'Just now',
            status: 'allocated',
        }
        setMembers(prev => [...prev, member])
        toast.success(`${member.name} added — card allocated · ${remaining - 1} card${remaining - 1 === 1 ? '' : 's'} remaining`)
        setShowAdd(false)
        setName('')
        setRelationship('Family')
        setEmail('')
        setPhone('')
        setAvatar('')
    }

    const memberActions = (m: FamilyMember) => {
        if (m.status === 'allocated') {
            return [
                { label: 'Activate', onClick: () => updateStatus(m.id, 'active') },
                { label: 'Remove', onClick: () => updateStatus(m.id, 'removed') },
                { label: 'Share', onClick: () => toast.success(`Invite re-sent to ${m.name}`) },
            ]
        }
        if (m.status === 'suspended') {
            return [
                { label: 'Reactivate', onClick: () => updateStatus(m.id, 'active') },
                { label: 'Replace', onClick: () => updateStatus(m.id, 'removed') },
                { label: 'Share', onClick: () => toast.success(`Share link sent to ${m.name}`) },
            ]
        }
        if (m.status === 'removed') {
            return [{ label: 'Reallocate', onClick: () => updateStatus(m.id, 'allocated') }]
        }
        return [
            { label: 'Suspend', onClick: () => updateStatus(m.id, 'suspended') },
            { label: 'Replace', onClick: () => updateStatus(m.id, 'removed') },
            { label: 'Share', onClick: () => toast.success(`Share link sent to ${m.name}`) },
        ]
    }

    const inputCls = 'w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500'

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Friends & Family - MCOMVCard</title></Helmet>

            {/* Page header */}
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends & Family</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Extra cards you give to your team.</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    disabled={!canAllocate}
                    className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {canAllocate ? '+ Add Card' : 'Allocation Full'}
                </button>
            </div>

            {/* Membership entitlement */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">★</div>
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">Current membership</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{businessMembership}</p>
                    </div>
                    <span className="ml-auto shrink-0 text-[10px] text-gray-400">Entitlement: {familyAllocationLimit} cards</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <EntitlementStat label="Included cards" value={familyAllocationLimit} tone="text-gray-900 dark:text-white" />
                    <EntitlementStat label="Used cards" value={used} tone="text-orange-600" />
                    <EntitlementStat label="Remaining" value={Math.max(0, remaining)} tone="text-emerald-600" />
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(used / familyAllocationLimit) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {remaining > 0
                        ? `${remaining} card${remaining === 1 ? '' : 's'} remaining — you cannot exceed your ${businessMembership} entitlement.`
                        : 'Allocation full. Remove or replace a card, or upgrade your membership to add more.'}
                </p>
            </div>

            {/* Card states legend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Card states</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    {(Object.keys(STATUS_META) as FamilyCardStatus[]).map((s) => (
                        <span key={s} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
                            {STATUS_META[s].label}
                        </span>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {members.map((m) => {
                    const status = STATUS_META[m.status]
                    const actions = memberActions(m)
                    return (
                        <div key={m.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <div className="flex items-center gap-3">
                                {m.avatar ? (
                                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                                        <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className={`w-11 h-11 rounded-full ${m.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                                        {m.initials}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{m.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.relationship} · allocated {m.allocatedAt}</p>
                                    {m.phone || m.email ? (
                                        <p className="text-[11px] text-gray-400 truncate">{m.phone}{m.phone && m.email ? ' · ' : ''}{m.email}</p>
                                    ) : null}
                                </div>
                                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>
                                    {status.label}
                                </span>
                            </div>
                            {actions.length > 0 && (
                                <div className="mt-3 flex gap-2">
                                    {actions.map((a) => (
                                        <button
                                            key={a.label}
                                            onClick={a.onClick}
                                            className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold"
                                        >
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Add member bottom sheet */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAdd(false)}>
                    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl p-5 animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="mx-auto w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Member</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Allocate an additional card — {canAllocate ? `${remaining} of ${familyAllocationLimit} remaining.` : 'allocation is full.'}
                        </p>
                        <form onSubmit={submit} className="mt-4 space-y-3">
                            {/* Photo (where permitted) */}
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {avatar ? (
                                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Photo <span className="text-[10px] font-normal text-gray-400">(where permitted)</span></label>
                                    <button type="button" onClick={() => document.getElementById('family-photo')?.click()}
                                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Upload photo
                                    </button>
                                    <input id="family-photo" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                                </div>
                            </div>

                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />

                            <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputCls}>
                                {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                            </select>

                            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className={inputCls} />
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" className={inputCls} />

                            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3">
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                                    {canAllocate
                                        ? `Allocating a card uses one of your ${familyAllocationLimit} included cards (${remaining} left). You cannot exceed your membership entitlement.`
                                        : 'Allocation full — remove or replace a card, or upgrade your membership to allocate more.'}
                                </p>
                            </div>

                            <button type="submit" disabled={!canAllocate} className="w-full py-3.5 min-h-[48px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                Allocate Card
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function EntitlementStat({ label, value, tone }: { label: string; value: number; tone: string }) {
    return (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-center">
            <p className={`text-lg font-bold ${tone}`}>{value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}
