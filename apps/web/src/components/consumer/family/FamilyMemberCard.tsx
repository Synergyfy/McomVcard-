import { useNavigate } from 'react-router-dom'
import type { FamilyCardMember } from '../../../services/familyCards'
import FamilyAvatar from './FamilyAvatar'

interface FamilyMemberCardProps {
    member: FamilyCardMember
    onEdit: (member: FamilyCardMember) => void
    onShare: (member: FamilyCardMember) => void
    onToggleSuspend: (member: FamilyCardMember) => void
    onRemove: (member: FamilyCardMember) => void
}

const cardActions = [
    { key: 'view', label: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800' },
    { key: 'edit', label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800' },
    { key: 'share', label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', color: 'text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-500/10' },
    { key: 'suspend', label: 'Suspend', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', color: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10' },
    { key: 'remove', label: 'Remove', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' },
] as const

export default function FamilyMemberCard({ member, onEdit, onShare, onToggleSuspend, onRemove }: FamilyMemberCardProps) {
    const navigate = useNavigate()

    const handleAction = (key: (typeof cardActions)[number]['key']) => {
        if (key === 'view') navigate(`/c/family/${member.id}`)
        if (key === 'edit') onEdit(member)
        if (key === 'share') onShare(member)
        if (key === 'suspend') onToggleSuspend(member)
        if (key === 'remove') onRemove(member)
    }

    return (
        <article className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-4">
                <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="lg" name={member.name} />
                <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.relationship}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            member.status === 'Active'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                            {member.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
                            {member.cardType}
                        </span>
                    </div>
                </div>
            </div>

            {/* Membership / card level */}
            <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300 text-[10px] font-bold uppercase tracking-wide">
                    {member.membership}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wide">
                    {member.kind}
                </span>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Card</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">£{member.cardBalance.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Rewards</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{member.rewardBalance} pts</p>
                </div>
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">E-Card</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">£{member.eCardValue.toFixed(2)}</p>
                </div>
            </div>

            {/* Last activity */}
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5 mb-3">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    Last activity · <span className="font-semibold text-gray-700 dark:text-gray-200">{member.lastUsed}</span>
                </p>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
                {cardActions.map((action) => (
                    <button
                        key={action.key}
                        onClick={() => handleAction(action.key)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-semibold min-h-[48px] transition-colors ${action.color}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                        </svg>
                        {action.label}
                    </button>
                ))}
            </div>
        </article>
    )
}
