import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockConsumers } from '../../services/mockData'
import { cardProtectionService } from '../../services/cardProtection'
import type { CardProtectionState } from '../../services/cardProtection'
import SharedCardView from '../../components/public/SharedCardView'
import ConsumerWelcomeGate from '../../components/consumer/ConsumerWelcomeGate'
import { useAuth } from '../../contexts/AuthContext'
import { consumerService } from '../../services/consumer'

export default function SharedCardPage() {
    const { cardId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [protection, setProtection] = useState<CardProtectionState | null>(null)

    const isClaim = searchParams.get('claim') === '1'
    const business = searchParams.get('business') || undefined

    const profile = mockConsumers.find((c) => c.cardId === cardId) || null
    const businessName = business || profile?.primaryIssuingBusiness

    useEffect(() => {
        if (cardId) {
            cardProtectionService.getState(cardId).then(setProtection)
        }
    }, [cardId])

    // Claim flow: an authenticated consumer arriving from a business/card link
    // gets the card associated and is taken to setup (if new) or their Dashboard.
    useEffect(() => {
        if (isClaim && isAuthenticated && cardId) {
            consumerService
                .associateCard(cardId, businessName)
                .then(() => consumerService.getProfileByEmail(user?.email || ''))
                .then((existing) => {
                    if (existing) {
                        navigate('/consumer', { replace: true })
                    } else {
                        navigate(`/consumer/setup?card=${encodeURIComponent(cardId)}&business=${encodeURIComponent(businessName || '')}`, { replace: true })
                    }
                })
                .catch(() => {})
        }
    }, [isClaim, isAuthenticated, cardId, businessName, navigate, user?.email])

    if (isClaim && !isAuthenticated) {
        return <ConsumerWelcomeGate cardId={cardId || ''} business={businessName} />
    }

    if (!protection) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <Helmet>
                <title>{profile ? `${profile.name} - MCOMVCard` : 'MCOMVCard'}</title>
            </Helmet>

            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-md lg:max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </span>
                        <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">MCOMVCard</span>
                    </Link>
                    {profile && (
                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                            protection.expiresAt !== null && Date.now() > new Date(protection.expiresAt).getTime()
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                                : 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                        }`}>
                            {protection.enabled && protection.expiresAt !== null && Date.now() > new Date(protection.expiresAt).getTime() ? 'Access Expired' : protection.enabled ? 'Protected' : 'Shared Card'}
                        </span>
                    )}
                </div>
            </header>

            <main className="max-w-md lg:max-w-2xl mx-auto px-4 py-6 pb-16">
                {!profile ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Card not found</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This card may have been removed or the link is incorrect.</p>
                    </div>
                ) : (
                    <SharedCardView profile={profile} protection={protection} />
                )}
            </main>

            <footer className="pb-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-600">Powered by MCOM VCard</p>
            </footer>
        </div>
    )
}
