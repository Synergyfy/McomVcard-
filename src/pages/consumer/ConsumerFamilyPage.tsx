import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import { familyService } from '../../services/familyCards'
import { getConsumerEntitlements } from '../../services/consumerMembership'
import type { MockConsumer } from '../../services/mockData'
import type { FamilyCardMember } from '../../services/familyCards'
import MembershipSummaryCard from '../../components/consumer/family/MembershipSummaryCard'
import OwnerCard from '../../components/consumer/family/OwnerCard'
import FamilyMemberCard from '../../components/consumer/family/FamilyMemberCard'
import AddFamilyMemberWizard from '../../components/consumer/family/AddFamilyMemberWizard'
import ShareFamilyCardSheet from '../../components/consumer/family/ShareFamilyCardSheet'
import EditFamilyMemberSheet from '../../components/consumer/family/EditFamilyMemberSheet'
import SuspendSheet from '../../components/consumer/family/SuspendSheet'
import RemoveSheet from '../../components/consumer/family/RemoveSheet'
import ErrorState from '../../components/common/ErrorState'

export default function ConsumerFamilyPage() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState<MockConsumer | null>(null)
    const [members, setMembers] = useState<FamilyCardMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const [wizardOpen, setWizardOpen] = useState(false)
    const [shareTarget, setShareTarget] = useState<FamilyCardMember | null>(null)
    const [editTarget, setEditTarget] = useState<FamilyCardMember | null>(null)
    const [suspendTarget, setSuspendTarget] = useState<FamilyCardMember | null>(null)
    const [removeTarget, setRemoveTarget] = useState<FamilyCardMember | null>(null)

    const loadFamily = () => {
        setLoading(true)
        setError(false)
        Promise.all([consumerService.getProfile(), familyService.getMembers()])
            .then(([p, m]) => {
                setProfile(p)
                setMembers(m)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadFamily()
    }, [])

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error || !profile) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>Friends &amp; Family - Consumer - MCOM VCard</title></Helmet>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Friends &amp; Family</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Share your membership with the people you love</p>
                </div>
                <div className="lg:max-w-2xl">
                    <ErrorState title="We couldn't load your family cards" message="Please try again in a moment." onRetry={loadFamily} />
                </div>
            </div>
        )
    }

    const entitlements = getConsumerEntitlements(profile.membership)
    const familyUsed = members.filter((m) => m.kind === 'Family').length
    const friendUsed = members.filter((m) => m.kind === 'Friend').length
    const familyRemaining = Math.max(0, entitlements.familyCards - familyUsed)
    const friendRemaining = Math.max(0, entitlements.friendCards - friendUsed)
    const atLimit = familyRemaining <= 0 && friendUsed >= entitlements.friendCards

    const handleUpsert = (member: FamilyCardMember) => {
        setMembers((prev) => {
            const exists = prev.some((m) => m.id === member.id)
            return exists ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member]
        })
    }

    const handleShareCreated = (member: FamilyCardMember) => {
        setShareTarget(member)
    }

    const handleRemove = (id: number) => {
        setMembers((prev) => prev.filter((m) => m.id !== id))
    }

    return (
        <div className="space-y-4 pb-16 lg:pb-8">
            <Helmet><title>Friends &amp; Family - Consumer - MCOM VCard</title></Helmet>

            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Friends &amp; Family</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Share your membership with the people you love</p>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start">
                <MembershipSummaryCard profile={profile} familyUsed={familyUsed} friendUsed={friendUsed} />
                <OwnerCard profile={profile} />
            </div>

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Family &amp; Friends</h2>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        {familyUsed}/{entitlements.familyCards} family · {friendUsed}/{entitlements.friendCards} friends
                    </span>
                </div>

                {members.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">No Family Cards Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[260px] mx-auto">
                            Invite your family and friends to enjoy your membership benefits.
                        </p>
                        <button
                            onClick={() => setWizardOpen(true)}
                            className="mt-6 h-12 px-6 rounded-2xl bg-accent-500 text-white font-bold active:scale-[0.98] transition-transform"
                        >
                            Add First Family Member
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                        {members.map((member) => (
                            <FamilyMemberCard
                                key={member.id}
                                member={member}
                                onEdit={setEditTarget}
                                onShare={setShareTarget}
                                onToggleSuspend={setSuspendTarget}
                                onRemove={setRemoveTarget}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* FAB / upgrade bar */}
            {!atLimit ? (
                <div className="fixed bottom-24 lg:bottom-8 left-0 right-0 lg:left-64 z-40 pointer-events-none">
                    <div className="max-w-md lg:max-w-5xl mx-auto px-4 lg:px-8 flex justify-end pointer-events-auto">
                        <button
                            onClick={() => setWizardOpen(true)}
                            aria-label="Add Family Member"
                            className="w-14 h-14 rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/30 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => navigate('/consumer/membership')}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Upgrade Membership to Add More Cards
                </button>
            )}

            <AddFamilyMemberWizard
                open={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onCreated={handleUpsert}
                onShareNow={handleShareCreated}
                familyRemaining={familyRemaining}
                friendRemaining={friendRemaining}
                membership={profile.membership}
            />
            <ShareFamilyCardSheet open={!!shareTarget} onClose={() => setShareTarget(null)} member={shareTarget} onUpdated={handleUpsert} />
            <EditFamilyMemberSheet open={!!editTarget} onClose={() => setEditTarget(null)} member={editTarget} onUpdated={handleUpsert} />
            <SuspendSheet open={!!suspendTarget} onClose={() => setSuspendTarget(null)} member={suspendTarget} onToggled={handleUpsert} />
            <RemoveSheet open={!!removeTarget} onClose={() => setRemoveTarget(null)} member={removeTarget} onRemoved={handleRemove} />
        </div>
    )
}
