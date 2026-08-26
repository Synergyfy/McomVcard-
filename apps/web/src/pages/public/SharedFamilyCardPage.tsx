import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { familyService } from '../../services/familyCards'
import type { FamilyCardMember } from '../../services/familyCards'
import { cardProtectionService } from '../../services/cardProtection'
import type { CardProtectionState } from '../../services/cardProtection'
import SharedFamilyCardView from '../../components/public/SharedFamilyCardView'

export default function SharedFamilyCardPage() {
    const { id } = useParams()
    const memberId = Number(id)
    const [member, setMember] = useState<FamilyCardMember | null>(null)
    const [protection, setProtection] = useState<CardProtectionState | null>(null)

    useEffect(() => {
        familyService.getMember(memberId).then((m) => {
            setMember(m || null)
            if (m) {
                cardProtectionService.getState(m.cardId).then(setProtection)
            } else {
                setProtection(null)
            }
        })
    }, [memberId])

    if (!member || !protection) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    const suspended = member.status === 'Suspended'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <Helmet>
                <title>{member.name} - Family Card - MCOMVCard</title>
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
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                        suspended
                            ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                            : protection.expiresAt !== null && Date.now() > new Date(protection.expiresAt).getTime()
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                                : 'bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                    }`}>
                        {suspended ? 'Suspended' : protection.enabled ? 'Protected' : 'Family Card'}
                    </span>
                </div>
            </header>

            <main className="max-w-md lg:max-w-2xl mx-auto px-4 py-6 pb-16">
                {suspended ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Card unavailable</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This family card has been suspended by the card owner.</p>
                    </div>
                ) : (
                    <SharedFamilyCardView member={member} protection={protection} />
                )}
            </main>

            <footer className="pb-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-600">Powered by MCOM VCard</p>
            </footer>
        </div>
    )
}
