import { useState, useEffect } from 'react'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import { familyService } from '../../../services/familyCards'
import type { FamilyCardMember } from '../../../services/familyCards'

interface EditFamilyMemberSheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onUpdated: (member: FamilyCardMember) => void
}

export default function EditFamilyMemberSheet({ open, onClose, member, onUpdated }: EditFamilyMemberSheetProps) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [dob, setDob] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open || !member) return
        setName(member.name)
        setPhone(member.phone)
        setEmail(member.email || '')
        setDob(member.dob || '')
    }, [open, member])

    if (!open || !member) return null

    const handleSave = async () => {
        if (name.trim() === '' || saving) return
        setSaving(true)
        const updated = await familyService.updateMember(member.id, { name, phone, email, dob })
        if (updated) onUpdated(updated)
        setSaving(false)
        onClose()
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="Edit Family Member">
            <div className="flex items-center gap-4 mb-5">
                <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="lg" name={member.name} />
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.relationship} · {member.cardType}</p>
                </div>
            </div>

            <div className="space-y-3">
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Full Name <span className="text-red-500">*</span></span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Phone</span>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        inputMode="tel"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Email <span className="text-gray-400">(optional)</span></span>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        inputMode="email"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Date of Birth <span className="text-gray-400">(optional)</span></span>
                    <input
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        placeholder="DD MMM YYYY"
                        className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                    />
                </label>
            </div>

            <button
                onClick={handleSave}
                disabled={name.trim() === '' || saving}
                className="mt-6 w-full h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
            >
                {saving ? 'Saving…' : 'Save Changes'}
            </button>
        </BottomSheet>
    )
}
