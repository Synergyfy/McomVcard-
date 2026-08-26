import { useEffect, useState } from 'react'
import { cardProtectionService, isValidPasscode } from '../../services/cardProtection'
import PasscodeInput from '../consumer/settings/PasscodeInput'

interface ProtectedCardGateProps {
    cardId: string
    onUnlock: () => void
}

const SESSION_KEY = (cardId: string) => `card_unlock_session:${cardId}`

export default function ProtectedCardGate({ cardId, onUnlock }: ProtectedCardGateProps) {
    const [passcode, setPasscode] = useState('')
    const [error, setError] = useState(false)
    const [checking, setChecking] = useState(false)

    // Restore a previously unlocked card for this browser session, as long as
    // protection is still active and any temporary access has not expired.
    useEffect(() => {
        let cancelled = false
        cardProtectionService.getState(cardId).then((s) => {
            if (cancelled || !s.enabled) return
            const expired = s.expiresAt !== null && Date.now() > new Date(s.expiresAt).getTime()
            if (!expired && sessionStorage.getItem(SESSION_KEY(cardId)) === '1') {
                onUnlock()
            }
        })
        return () => { cancelled = true }
    }, [cardId, onUnlock])

    const handleOpen = async () => {
        if (!isValidPasscode(passcode) || checking) return
        setChecking(true)
        const ok = await cardProtectionService.verify(cardId, passcode)
        setChecking(false)
        if (ok) {
            setError(false)
            sessionStorage.setItem(SESSION_KEY(cardId), '1')
            onUnlock()
        } else {
            setError(true)
            setPasscode('')
        }
    }

    return (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Protected Card</p>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">This card requires a passcode</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Ask the card owner for the 6-digit passcode to continue.
            </p>

            <div className="mt-6 max-w-xs mx-auto">
                <PasscodeInput
                    value={passcode}
                    onChange={(v) => { setPasscode(v); setError(false) }}
                    placeholder="6-digit passcode"
                    className={`w-full h-13 min-h-[52px] px-4 rounded-2xl border-2 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none transition-colors text-center font-bold tracking-[0.4em] ${
                        error
                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-700 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20'
                    }`}
                />
                {error && (
                    <p className="text-xs font-semibold text-red-500 mt-2 flex items-center justify-center gap-1.5 animate-fadeIn">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Incorrect Passcode. Try Again.
                    </p>
                )}
                <button
                    onClick={handleOpen}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleOpen() }}
                    disabled={!isValidPasscode(passcode) || checking}
                    className="mt-3 w-full h-13 min-h-[52px] rounded-2xl bg-accent-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                >
                    {checking ? 'Checking…' : 'Open Card'}
                </button>
            </div>
        </div>
    )
}
