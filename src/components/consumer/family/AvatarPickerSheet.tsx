import { useState, useEffect } from 'react'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import { familyService } from '../../../services/familyCards'
import type { FamilyCardMember } from '../../../services/familyCards'

interface AvatarPickerSheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onUpdated: (member: FamilyCardMember) => void
}

const EMOJIS = ['😀', '😊', '😎', '🦸', '🐱', '🐶', '👑', '🌈']
const GRADIENTS = ['from-pink-400 to-rose-600', 'from-blue-400 to-indigo-600', 'from-emerald-400 to-teal-600', 'from-amber-400 to-orange-600', 'from-purple-400 to-violet-600', 'from-cyan-400 to-sky-600']

export default function AvatarPickerSheet({ open, onClose, member, onUpdated }: AvatarPickerSheetProps) {
    const [emoji, setEmoji] = useState('😀')
    const [gradient, setGradient] = useState(GRADIENTS[0])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!open || !member) return
        setEmoji(member.avatar.emoji)
        setGradient(member.avatar.gradient)
    }, [open, member])

    if (!open || !member) return null

    const handleSave = async () => {
        if (saving) return
        setSaving(true)
        const updated = await familyService.updateMember(member.id, { avatar: { emoji, gradient } })
        if (updated) onUpdated(updated)
        setSaving(false)
        onClose()
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="Replace Photo">
            <div className="flex justify-center mb-5">
                <FamilyAvatar emoji={emoji} gradient={gradient} size="xl" name={member.name} />
            </div>

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Emoji</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
                {EMOJIS.map((e) => (
                    <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`h-12 rounded-xl border text-2xl transition-all ${emoji === e ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        {e}
                    </button>
                ))}
            </div>

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Colour</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
                {GRADIENTS.map((g) => (
                    <button
                        key={g}
                        onClick={() => setGradient(g)}
                        className={`h-8 rounded-full bg-gradient-to-r ${g} transition-all ${gradient === g ? 'ring-2 ring-accent-500 ring-offset-2 dark:ring-offset-gray-900' : 'opacity-70'}`}
                    />
                ))}
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-60 active:scale-[0.98] transition-transform"
            >
                {saving ? 'Saving…' : 'Save Photo'}
            </button>
        </BottomSheet>
    )
}
