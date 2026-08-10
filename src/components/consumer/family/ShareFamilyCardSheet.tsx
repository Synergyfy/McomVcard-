import { useState, useEffect } from 'react'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import FamilyQrCode from './FamilyQrCode'
import TransferMoneySheet from './TransferMoneySheet'
import SendGiftSheet from './SendGiftSheet'
import type { FamilyCardMember } from '../../../services/familyCards'
import { cardProtectionService } from '../../../services/cardProtection'
import type { CardProtectionState } from '../../../services/cardProtection'

interface ShareFamilyCardSheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onUpdated?: (member: FamilyCardMember) => void
}

const shareChannels = [
    { key: 'whatsapp', label: 'WhatsApp', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', icon: 'M12 2a10 10 0 00-8.66 15l-1.02 3.67a.5.5 0 00.63.63l3.74-.99A10 10 0 1012 2z' },
    { key: 'sms', label: 'SMS', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', icon: 'M8 10h8m-8 4h5m-9.5-9h13a1 1 0 011 1v9a1 1 0 01-1 1H8l-4 4V6a1 1 0 011-1z' },
    { key: 'email', label: 'Email', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key: 'link', label: 'Share Link', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
] as const

export default function ShareFamilyCardSheet({ open, onClose, member, onUpdated }: ShareFamilyCardSheetProps) {
    const [copied, setCopied] = useState(false)
    const [protection, setProtection] = useState<CardProtectionState | null>(null)
    const [transferOpen, setTransferOpen] = useState(false)
    const [giftOpen, setGiftOpen] = useState(false)

    useEffect(() => {
        if (open && member) {
            cardProtectionService.getState(member.cardId).then(setProtection)
        }
    }, [open, member])

    if (!open || !member) return null

    const isFriend = member.kind === 'Friend'
    const protectedCard = protection?.enabled ?? false
    const expiry = protection?.expiresAt
        ? ` · access ends ${new Date(protection.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        : ''

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(member.shareLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleUpdated = (m: FamilyCardMember) => {
        onUpdated?.(m)
    }

    return (
        <BottomSheet open={open} onClose={onClose} title={isFriend ? 'Share Friend Card' : 'Share Family Card'}>
            <div className={`rounded-3xl p-5 text-white shadow-lg mb-5 ${isFriend ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600' : 'bg-gradient-to-br from-accent-500 to-accent-600'}`}>
                <div className="flex items-center gap-4">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="lg" name={member.name} />
                    <div>
                        <p className="text-base font-extrabold">{member.name}'s {isFriend ? 'Friend' : 'Family'} Card</p>
                        <p className="text-xs text-white/80">
                            {isFriend
                                ? 'A gift card they control — send e-cards anytime.'
                                : "They'll enjoy your membership benefits instantly."}
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/15 backdrop-blur px-3.5 py-2.5">
                    <span className="text-xs font-semibold text-white/80">
                        {isFriend ? 'E-Card value' : 'Card balance'}
                    </span>
                    <span className="text-sm font-extrabold">
                        £{(isFriend ? member.eCardValue : member.cardBalance).toFixed(2)}
                    </span>
                </div>
                {protectedCard && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur px-3.5 py-2.5">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-xs font-bold uppercase tracking-wide">Passcode Protected · ON{expiry}</p>
                    </div>
                )}
            </div>

            {/* Action: family=Transfer, friend=Send Gift */}
            {isFriend ? (
                <button
                    onClick={() => setGiftOpen(true)}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mb-4 active:scale-[0.99] transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Send Gift / E-Card
                </button>
            ) : (
                <button
                    onClick={() => setTransferOpen(true)}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2 mb-4 active:scale-[0.99] transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Transfer Money
                </button>
            )}

            <div className="flex gap-5 items-center justify-center mb-5">
                <FamilyQrCode value={member.shareLink} size="lg" />
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Link</p>
                    <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> QR Code</p>
                    <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" /> Instant</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5 mb-5">
                {shareChannels.map((ch) => (
                    <button
                        key={ch.key}
                        onClick={handleCopy}
                        className="flex flex-col items-center gap-2 py-3 rounded-2xl min-h-[68px] transition-transform active:scale-95"
                    >
                        <span className={`w-11 h-11 rounded-full flex items-center justify-center ${ch.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ch.icon} />
                            </svg>
                        </span>
                        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{ch.label}</span>
                    </button>
                ))}
            </div>

            <button
                onClick={handleCopy}
                className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
                {copied ? (
                    <>
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        Copy Link
                    </>
                )}
            </button>

            <TransferMoneySheet open={transferOpen} onClose={() => setTransferOpen(false)} member={member} onUpdated={handleUpdated} />
            <SendGiftSheet open={giftOpen} onClose={() => setGiftOpen(false)} member={member} onUpdated={handleUpdated} />
        </BottomSheet>
    )
}
