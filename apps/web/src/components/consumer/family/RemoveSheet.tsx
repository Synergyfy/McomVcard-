import { useState } from 'react'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import { familyService } from '../../../services/familyCards'
import type { FamilyCardMember } from '../../../services/familyCards'

interface RemoveSheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onRemoved: (id: number) => void
}

export default function RemoveSheet({ open, onClose, member, onRemoved }: RemoveSheetProps) {
    const [working, setWorking] = useState(false)
    if (!open || !member) return null

    const handleConfirm = async () => {
        if (working) return
        setWorking(true)
        await familyService.removeMember(member.id)
        onRemoved(member.id)
        setWorking(false)
        onClose()
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="Remove Family Card">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 text-red-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="sm" name={member.name} />
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">Remove {member.name}'s Card?</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[260px]">
                    This frees one membership slot.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onClose}
                    className="h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 active:scale-[0.98] transition-transform"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={working}
                    className="h-12 rounded-2xl bg-red-500 font-bold text-white disabled:opacity-60 active:scale-[0.98] transition-transform"
                >
                    {working ? 'Removing…' : 'Remove'}
                </button>
            </div>
        </BottomSheet>
    )
}
