import { useState } from 'react'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import FamilyQrCode from './FamilyQrCode'
import { familyService, kindFromRelationship } from '../../../services/familyCards'
import type { FamilyCardMember } from '../../../services/familyCards'

interface AddFamilyMemberWizardProps {
    open: boolean
    onClose: () => void
    onCreated: (member: FamilyCardMember) => void
    onShareNow: (member: FamilyCardMember) => void
    familyRemaining: number
    friendRemaining: number
    membership: string
}

const RELATIONSHIPS = ['Wife', 'Husband', 'Son', 'Daughter', 'Parent', 'Brother', 'Sister', 'Friend', 'Other'] as const

const RELATIONSHIP_EMOJIS: Record<string, string> = {
    Wife: '👩',
    Husband: '👨',
    Son: '👦',
    Daughter: '👧',
    Parent: '🧑',
    Brother: '👦',
    Sister: '👧',
    Friend: '🧑‍🤝‍🧑',
    Other: '⭐',
}

const RELATIONSHIP_DESC: Record<string, string> = {
    Wife: 'Family card · shares your wallet',
    Husband: 'Family card · shares your wallet',
    Son: 'Family card · shares your wallet',
    Daughter: 'Family card · shares your wallet',
    Parent: 'Family card · shares your wallet',
    Brother: 'Family card · shares your wallet',
    Sister: 'Family card · shares your wallet',
    Friend: 'Friend card · gift e-cards only',
    Other: 'Family card · shares your wallet',
}

const stepLabels = ['Relationship', 'Details', 'Preview + QR', 'Create', 'Share']

function RelationshipStep({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Who is this card for?</p>
            <div className="grid grid-cols-3 gap-3">
                {RELATIONSHIPS.map((rel) => (
                    <button
                        key={rel}
                        onClick={() => onSelect(rel)}
                        className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl border transition-all min-h-[72px] ${
                            value === rel
                                ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-semibold'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-accent-300'
                        }`}
                    >
                        <span className="text-2xl">{RELATIONSHIP_EMOJIS[rel]}</span>
                        <span className="text-xs">{rel}</span>
                    </button>
                ))}
            </div>
            {value && (
                <div className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold ${
                    value === 'Friend'
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300'
                        : 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                }`}>
                    {value === 'Friend' ? (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    )}
                    {RELATIONSHIP_DESC[value]}
                </div>
            )}
        </div>
    )
}

const AVATAR_GRADIENTS = ['from-pink-400 to-rose-600', 'from-blue-400 to-indigo-600', 'from-emerald-400 to-teal-600', 'from-amber-400 to-orange-600', 'from-purple-400 to-violet-600', 'from-cyan-400 to-sky-600']
const AVATAR_EMOJIS = ['😀', '😊', '😎', '🦸', '🐱', '🐶', '👑', '🌈']

interface DetailsStepProps {
    name: string
    phone: string
    email: string
    dob: string
    avatar: { emoji: string; gradient: string }
    onChange: (patch: { name?: string; phone?: string; email?: string; dob?: string; avatar?: { emoji: string; gradient: string } }) => void
}

function DetailsStep({ name, phone, email, dob, avatar, onChange }: DetailsStepProps) {
    return (
        <div>
            <div className="flex justify-center mb-5">
                <div className="relative">
                    <FamilyAvatar emoji={avatar.emoji} gradient={avatar.gradient} size="xl" name={name} />
                    <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
                {AVATAR_EMOJIS.slice(0, 4).map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => onChange({ avatar: { emoji, gradient: avatar.gradient } })}
                        className={`h-12 rounded-xl border text-2xl transition-all ${avatar.emoji === emoji ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
                {AVATAR_GRADIENTS.slice(0, 3).map((gradient) => (
                    <button
                        key={gradient}
                        onClick={() => onChange({ avatar: { emoji: avatar.emoji, gradient } })}
                        className={`h-7 rounded-full bg-gradient-to-r ${gradient} transition-all ${avatar.gradient === gradient ? 'ring-2 ring-accent-500 ring-offset-2 dark:ring-offset-gray-900' : 'opacity-70'}`}
                    />
                ))}
            </div>

            <div className="space-y-3">
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Full Name <span className="text-red-500">*</span></span>
                    <input
                        value={name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        placeholder="e.g. Sarah Anderson"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Phone <span className="text-red-500">*</span></span>
                    <input
                        value={phone}
                        onChange={(e) => onChange({ phone: e.target.value })}
                        placeholder="+44 7700 900000"
                        inputMode="tel"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Email <span className="text-gray-400">(optional)</span></span>
                    <input
                        value={email}
                        onChange={(e) => onChange({ email: e.target.value })}
                        placeholder="name@email.com"
                        inputMode="email"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Date of Birth <span className="text-gray-400">(optional)</span></span>
                    <input
                        value={dob}
                        onChange={(e) => onChange({ dob: e.target.value })}
                        placeholder="DD MMM YYYY"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
            </div>
        </div>
    )
}

function PreviewStep({ name, phone, relationship, avatar }: { name: string; phone: string; relationship: string; avatar: { emoji: string; gradient: string } }) {
    const isFriend = kindFromRelationship(relationship) === 'Friend'
    const cardId = `CARD-${isFriend ? 'FRD' : 'FAM'}-${name.trim() ? name.trim().toUpperCase().slice(0, 4) : 'XXXX'}`
    const shareLink = `https://mcomvcard.link/${isFriend ? 'f' : 'fam'}/${name.trim().toLowerCase().replace(/\s+/g, '-') || 'member'}`

    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Preview your new card</p>
            <div className="rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white shadow-lg mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <FamilyAvatar emoji={avatar.emoji} gradient={avatar.gradient} size="lg" name={name} />
                        <div className="min-w-0">
                            <p className="text-lg font-extrabold truncate">{name || 'Member Name'}</p>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide mt-1">
                                {relationship}
                            </span>
                        </div>
                    </div>
                    <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">
                        {isFriend ? 'Friend Card' : 'Family Card'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">Bronze Pro</span>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
                <FamilyQrCode value={shareLink} size="md" />
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Instant QR</p>
                    <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Auto-generated</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">A unique link &amp; QR code are generated automatically for {name || 'this card'}.</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                <div className="flex justify-between px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Card ID</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{cardId}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Phone</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{phone || '—'}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Benefit</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isFriend ? 'Gift e-cards only' : 'Shares your membership wallet'}
                    </span>
                </div>
            </div>
        </div>
    )
}

function CreateStep() {
    return (
        <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Everything looks good. Create this card now.</p>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4 flex gap-3 text-left">
                <svg className="w-5 h-5 shrink-0 text-accent-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your membership allowance will be updated. You can share the card right after.
                </p>
            </div>
        </div>
    )
}

function ShareStep({ member, onShareNow, onClose }: { member: FamilyCardMember | null; onShareNow: () => void; onClose: () => void }) {
    return (
        <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-fadeIn">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Card Created!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{member?.name}</span>'s card is ready to share.
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-5">Share this card now?</p>
            <div className="space-y-2.5">
                <button
                    onClick={onShareNow}
                    className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Now
                </button>
                <button
                    onClick={onClose}
                    className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 active:scale-[0.98] transition-transform"
                >
                    Later
                </button>
            </div>
        </div>
    )
}

export default function AddFamilyMemberWizard({ open, onClose, onCreated, onShareNow, familyRemaining, friendRemaining, membership }: AddFamilyMemberWizardProps) {
    const [step, setStep] = useState(1)
    const [relationship, setRelationship] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [dob, setDob] = useState('')
    const [avatar, setAvatar] = useState({ emoji: '😀', gradient: AVATAR_GRADIENTS[0] })
    const [created, setCreated] = useState<FamilyCardMember | null>(null)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!open) return null

    const selectedKind = relationship ? kindFromRelationship(relationship) : null
    const kindRemaining = selectedKind === 'Friend' ? friendRemaining : familyRemaining
    const kindAtLimit = !!selectedKind && kindRemaining <= 0

    const validStep1 = relationship !== ''
    const validStep2 = name.trim() !== '' && phone.trim() !== ''
    const canCreate = validStep1 && validStep2 && !kindAtLimit

    const handleClose = () => {
        setStep(1)
        setRelationship('')
        setName('')
        setPhone('')
        setEmail('')
        setDob('')
        setAvatar({ emoji: '😀', gradient: AVATAR_GRADIENTS[0] })
        setCreated(null)
        setCreating(false)
        setError(null)
        onClose()
    }

    const handleCreate = async () => {
        if (!canCreate || creating) return
        setCreating(true)
        setError(null)
        try {
            const member = await familyService.addMember({
                name,
                relationship,
                kind: kindFromRelationship(relationship),
                phone,
                email,
                dob,
                avatar,
            })
            setCreated(member)
            setStep(5)
            onCreated(member)
        } catch (err: any) {
            setError(err?.message || "We couldn't create this card. Please try again.")
        } finally {
            setCreating(false)
        }
    }

    const handleShareNow = () => {
        handleClose()
        if (created) onShareNow(created)
    }

    return (
        <BottomSheet open={open} onClose={handleClose} title={`Add Card · Step ${step} of 5`}>
            <div className="flex items-center gap-1.5 mb-5">
                {stepLabels.map((label, i) => (
                    <div key={label} className="flex-1">
                        <div className={`h-1 rounded-full transition-all ${i < step ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        <p className={`text-[9px] mt-1 text-center font-semibold ${i === step - 1 ? 'text-accent-600 dark:text-accent-400' : 'text-gray-400 dark:text-gray-500'}`}>{label}</p>
                    </div>
                ))}
            </div>

            {step === 1 && <RelationshipStep value={relationship} onSelect={setRelationship} />}
            {step === 2 && (
                <DetailsStep
                    name={name}
                    phone={phone}
                    email={email}
                    dob={dob}
                    avatar={avatar}
                    onChange={(patch) => {
                        if (patch.name !== undefined) setName(patch.name)
                        if (patch.phone !== undefined) setPhone(patch.phone)
                        if (patch.email !== undefined) setEmail(patch.email)
                        if (patch.dob !== undefined) setDob(patch.dob)
                        if (patch.avatar) setAvatar(patch.avatar)
                    }}
                />
            )}
            {step === 3 && <PreviewStep name={name} phone={phone} relationship={relationship} avatar={avatar} />}
            {step === 4 && <CreateStep />}
            {step === 5 && <ShareStep member={created} onShareNow={handleShareNow} onClose={handleClose} />}

            {error && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-4 py-3">
                    <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {kindAtLimit && step < 5 && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 px-4 py-3">
                    <svg className="w-5 h-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-snug">
                        You've reached your {selectedKind === 'Friend' ? 'friend' : 'family'} card limit for {membership}. Upgrade your membership to add more {selectedKind === 'Friend' ? 'friend' : 'family'} cards.
                    </p>
                </div>
            )}

            {step < 5 && (
                <div className="mt-6 flex gap-3">
                    {step > 1 && step !== 5 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="w-24 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 active:scale-[0.98] transition-transform"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 && (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 ? !validStep1 : !validStep2 || kindAtLimit}
                            className="flex-1 h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                        >
                            Continue
                        </button>
                    )}
                    {step === 3 && (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canCreate}
                            className="flex-1 h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                        >
                            Continue to Create
                        </button>
                    )}
                    {step === 4 && (
                        <button
                            onClick={handleCreate}
                            disabled={!canCreate || creating}
                            className="flex-1 h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                        >
                            {creating ? 'Creating…' : 'Create Card'}
                        </button>
                    )}
                </div>
            )}

            {kindRemaining <= 1 && step < 5 && (
                <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-3">
                    {kindRemaining <= 0 ? 'No slots remaining for this card type.' : 'This will use your last available slot.'}
                </p>
            )}
        </BottomSheet>
    )
}
