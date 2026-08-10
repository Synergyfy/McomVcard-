import { useState } from 'react'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import { familyService } from '../../../services/familyCards'
import type { FamilyCardMember } from '../../../services/familyCards'

interface SuspendSheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onToggled: (member: FamilyCardMember) => void
}

export default function SuspendSheet({ open, onClose, member, onToggled }: SuspendSheetProps) {
    const [working, setWorking] = useState(false)
    if (!open || !member) return null

    const isSuspended = member.status === 'Suspended'

    const handleConfirm = async () => {
        if (working) return
        setWorking(true)
        const updated = await familyService.setStatus(member.id, isSuspended ? 'Active' : 'Suspended')
        if (updated) onToggled(updated)
        setWorking(false)
        onClose()
    }

    return (
        <BottomSheet open={open} onClose={onClose} title={isSuspended ? 'Activate Card' : 'Suspend Card'}>
            <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isSuspended ? 'bg-green-100 dark:bg-green-900/30 text-green-500' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isSuspended ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'} />
                    </svg>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="sm" name={member.name} />
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{member.name}'s Card</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[260px]">
                    {isSuspended
                        ? 'Reactivate this card so it can be used again.'
                        : 'The card cannot be used until reactivated.'}
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
                    className={`h-12 rounded-2xl font-bold text-white disabled:opacity-60 active:scale-[0.98] transition-transform ${isSuspended ? 'bg-green-500' : 'bg-amber-500'}`}
                >
                    {working ? 'Please wait…' : isSuspended ? 'Activate' : 'Suspend'}
                </button>
            </div>
        </BottomSheet>
    )
}
