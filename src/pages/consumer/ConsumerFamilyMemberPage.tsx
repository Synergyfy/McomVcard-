import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { familyService } from '../../services/familyCards'
import type { FamilyCardMember } from '../../services/familyCards'
import FamilyCardPreview from '../../components/consumer/family/FamilyCardPreview'
import ShareFamilyCardSheet from '../../components/consumer/family/ShareFamilyCardSheet'
import TransferMoneySheet from '../../components/consumer/family/TransferMoneySheet'
import SendGiftSheet from '../../components/consumer/family/SendGiftSheet'
import EditFamilyMemberSheet from '../../components/consumer/family/EditFamilyMemberSheet'
import SuspendSheet from '../../components/consumer/family/SuspendSheet'
import RemoveSheet from '../../components/consumer/family/RemoveSheet'
import AvatarPickerSheet from '../../components/consumer/family/AvatarPickerSheet'
import WishListSection from '../../components/consumer/family/WishListSection'
import CardProtectionPanel from '../../components/consumer/settings/CardProtectionPanel'
import ErrorState from '../../components/common/ErrorState'

export default function ConsumerFamilyMemberPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [member, setMember] = useState<FamilyCardMember | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const [shareOpen, setShareOpen] = useState(false)
    const [transferOpen, setTransferOpen] = useState(false)
    const [giftOpen, setGiftOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [suspendOpen, setSuspendOpen] = useState(false)
    const [removeOpen, setRemoveOpen] = useState(false)
    const [avatarOpen, setAvatarOpen] = useState(false)

    const memberId = Number(id)

    const loadMember = () => {
        setLoading(true)
        setError(false)
        familyService.getMember(memberId)
            .then((m) => {
                setMember(m || null)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadMember()
    }, [memberId])

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>Family Member - Consumer - MCOM VCard</title></Helmet>
                <div className="lg:max-w-2xl">
                    <ErrorState title="We couldn't load this family member" message="Please try again in a moment." onRetry={loadMember} />
                </div>
            </div>
        )
    }

    if (!member) {
        return (
            <div className="py-16 text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Member not found</p>
                <button
                    onClick={() => navigate('/consumer/family')}
                    className="mt-4 px-6 h-11 rounded-xl bg-accent-500 text-white text-sm font-bold"
                >
                    Back to Family
                </button>
            </div>
        )
    }

    const handleUpdated = (m: FamilyCardMember) => setMember(m)
    const handleRemoved = () => navigate('/consumer/family')

    const scrollToWishlist = () => {
        document.getElementById('wishlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const infoRows = [
        { label: 'Relationship', value: member.relationship, icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
        { label: 'Card Type', value: member.cardType, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { label: 'Membership', value: member.membership, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { label: 'Created', value: member.createdAt, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { label: 'Last Used', value: member.lastUsed, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Reward Balance', value: `${member.rewardBalance} pts`, icon: 'M11 3.055A9 9 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
        { label: 'Card Balance', value: `£${member.cardBalance.toFixed(2)}`, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { label: 'E-Card Value', value: `£${member.eCardValue.toFixed(2)}`, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4m8-10v10l-8 4' },
    ]

    const actions = [
        { key: 'share', label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/10 hover:bg-accent-100 dark:hover:bg-accent-500/20', onClick: () => setShareOpen(true) },
        { key: 'suspend', label: member.status === 'Active' ? 'Suspend' : 'Activate', icon: member.status === 'Active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20', onClick: () => setSuspendOpen(true) },
        { key: 'edit', label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700', onClick: () => setEditOpen(true) },
        { key: 'photo', label: 'Photo', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700', onClick: () => setAvatarOpen(true) },
        { key: 'rename', label: 'Rename', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700', onClick: () => setEditOpen(true) },
        { key: 'remove', label: 'Remove', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20', onClick: () => setRemoveOpen(true) },
    ]

    return (
        <div className="space-y-4 pb-2 lg:pb-4">
            <Helmet><title>{member.name} - Family Member - MCOM VCard</title></Helmet>

            {/* Header */}
            <div className="flex items-center justify-between -mx-4 px-4 pt-1">
                <button
                    onClick={() => navigate('/consumer/family')}
                    className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300"
                    aria-label="Back"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="text-center">
                    <p className="text-base font-bold text-gray-900 dark:text-white">Family Member</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.relationship}</p>
                </div>
                <button
                    onClick={() => setShareOpen(true)}
                    className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center text-accent-500"
                    aria-label="Share"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start">
            <FamilyCardPreview member={member} />

            {/* Quick stats */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Card Details</h2>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {infoRows.map((row) => (
                        <div key={row.label} className="flex items-center gap-3 py-3">
                            <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={row.icon} />
                                </svg>
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{row.label}</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{row.value}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={scrollToWishlist}
                    className="mt-4 w-full h-12 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    View Wish List
                </button>
            </section>

            {/* Actions */}
            <section>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Manage Card</h2>
                {member.kind === 'Friend' ? (
                    <button
                        onClick={() => setGiftOpen(true)}
                        className="w-full h-14 mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Send Gift / E-Card
                    </button>
                ) : (
                    <button
                        onClick={() => setTransferOpen(true)}
                        className="w-full h-14 mb-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Transfer Money
                    </button>
                )}
                <div className="grid grid-cols-3 gap-2.5">
                    {actions.map((action) => (
                        <button
                            key={action.key}
                            onClick={action.onClick}
                            className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl min-h-[76px] transition-colors ${action.color}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                            </svg>
                            <span className="text-[11px] font-semibold">{action.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Card Protection */}
            <section>
                <CardProtectionPanel
                    cardId={member.cardId}
                    title={`Protect ${member.name}'s Card`}
                    description={`Require a passcode to open ${member.name}'s shared card`}
                />
            </section>

            {/* Recent activity */}
            <section>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Recent Activity</h2>
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                    {member.recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-4">
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-accent-50 dark:bg-accent-500/10 text-accent-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 8a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17h3.839a.75.75 0 00.53-.919c-.083-.322-.173-.657-.263-1.003m0 0a15.976 15.976 0 00-2.595-6.625' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'} />
                                </svg>
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.action}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Wish list */}
            <section id="wishlist" className="scroll-mt-4">
                <WishListSection member={member} onUpdated={handleUpdated} />
            </section>

            </div>

            <ShareFamilyCardSheet open={shareOpen} onClose={() => setShareOpen(false)} member={member} onUpdated={handleUpdated} />
            <TransferMoneySheet open={transferOpen} onClose={() => setTransferOpen(false)} member={member} onUpdated={handleUpdated} />
            <SendGiftSheet open={giftOpen} onClose={() => setGiftOpen(false)} member={member} onUpdated={handleUpdated} />
            <EditFamilyMemberSheet open={editOpen} onClose={() => setEditOpen(false)} member={member} onUpdated={handleUpdated} />
            <SuspendSheet open={suspendOpen} onClose={() => setSuspendOpen(false)} member={member} onToggled={handleUpdated} />
            <RemoveSheet open={removeOpen} onClose={() => setRemoveOpen(false)} member={member} onRemoved={handleRemoved} />
            <AvatarPickerSheet open={avatarOpen} onClose={() => setAvatarOpen(false)} member={member} onUpdated={handleUpdated} />
        </div>
    )
}
