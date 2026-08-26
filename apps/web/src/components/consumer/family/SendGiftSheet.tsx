import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import { familyService } from '../../../services/familyCards'
import { consumerService } from '../../../services/consumer'
import type { FamilyCardMember } from '../../../services/familyCards'

interface SendGiftSheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onUpdated?: (member: FamilyCardMember) => void
}

const presetAmounts = [5, 10, 20, 50]

const giftChannels = [
    { key: 'whatsapp', label: 'WhatsApp', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', icon: 'M12 2a10 10 0 00-8.66 15l-1.02 3.67a.5.5 0 00.63.63l3.74-.99A10 10 0 1012 2z' },
    { key: 'sms', label: 'SMS', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', icon: 'M8 10h8m-8 4h5m-9.5-9h13a1 1 0 011 1v9a1 1 0 01-1 1H8l-4 4V6a1 1 0 011-1z' },
    { key: 'email', label: 'Email', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
] as const

type GiftChannel = (typeof giftChannels)[number]['key']

export default function SendGiftSheet({ open, onClose, member, onUpdated }: SendGiftSheetProps) {
    const [ownerBalance, setOwnerBalance] = useState(0)
    const [amount, setAmount] = useState(10)
    const [custom, setCustom] = useState('')
    const [message, setMessage] = useState('')
    const [channel, setChannel] = useState<GiftChannel>('whatsapp')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (open && member) {
            consumerService.getCardBalance().then(setOwnerBalance)
            setAmount(10)
            setCustom('')
            setMessage('')
            setChannel('whatsapp')
            setSending(false)
        }
    }, [open, member])

    if (!open || !member) return null

    const exceedBalance = amount > ownerBalance
    const canSend = amount > 0 && !exceedBalance && !sending

    const handleSend = async () => {
        if (!canSend) return
        setSending(true)
        try {
            const result = await familyService.sendGiftCard(member.id, amount, channel)
            if (!result) {
                toast.error('Could not find that card')
                return
            }
            toast.success(`£${amount.toFixed(2)} e-card sent to ${member.name} via ${channel}`)
            onUpdated?.(result.member)
            setOwnerBalance(result.ownerBalance)
            setCustom('')
            setAmount(10)
            setMessage('')
            onClose()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not send the gift')
        } finally {
            setSending(false)
        }
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="Send Gift / E-Card">
            <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-fuchsia-600 p-5 text-white shadow-lg mb-5">
                <div className="flex items-center gap-4">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="lg" name={member.name} />
                    <div className="min-w-0">
                        <p className="text-base font-extrabold truncate">Gift to {member.name}</p>
                        <p className="text-xs text-white/80">An e-card they can spend at MCOM Mall &amp; partners.</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/15 backdrop-blur px-3.5 py-2.5">
                    <span className="text-xs font-semibold text-white/80">Their e-card value</span>
                    <span className="text-sm font-extrabold">£{member.eCardValue.toFixed(2)}</span>
                </div>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Your card balance</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">£{ownerBalance.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">After gift</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
                        £{Math.max(0, ownerBalance - amount).toFixed(2)}
                    </p>
                </div>
            </div>

            <p className="text-xs font-bold text-gray-900 dark:text-white mb-2.5">Amount</p>
            <div className="grid grid-cols-4 gap-2 mb-2.5">
                {presetAmounts.map((a) => (
                    <button
                        key={a}
                        onClick={() => { setAmount(a); setCustom('') }}
                        className={`py-3 rounded-xl text-sm font-bold border transition-colors ${
                            !custom && amount === a
                                ? 'bg-purple-500 text-white border-purple-500'
                                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        £{a}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5">
                    <span className="text-sm font-bold text-gray-400">£</span>
                    <input
                        type="number"
                        min={1}
                        max={ownerBalance}
                        value={custom}
                        onChange={(e) => { setCustom(e.target.value); setAmount(Number(e.target.value) || 0) }}
                        placeholder="Other amount"
                        className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>
            </div>

            <label className="block mb-4">
                <span className="text-xs font-bold text-gray-900 dark:text-white">Gift message <span className="text-gray-400 font-semibold">(optional)</span></span>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Happy Birthday! Enjoy it 🎉"
                    maxLength={120}
                    className="mt-1 w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
            </label>

            <p className="text-xs font-bold text-gray-900 dark:text-white mb-2.5">Send via</p>
            <div className="grid grid-cols-3 gap-2.5 mb-4">
                {giftChannels.map((ch) => (
                    <button
                        key={ch.key}
                        onClick={() => setChannel(ch.key)}
                        className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${
                            channel === ch.key
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center ${ch.color}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ch.icon} />
                            </svg>
                        </span>
                        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{ch.label}</span>
                    </button>
                ))}
            </div>

            {exceedBalance && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Amount exceeds your available balance. Fund your card first.
                </div>
            )}

            <button
                onClick={handleSend}
                disabled={!canSend}
                className="w-full h-12 rounded-2xl bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/25 hover:bg-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
                {sending ? 'Sending…' : `Send £${(amount || 0).toFixed(2)} Gift`}
            </button>
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-3">
                {member.name} will receive the e-card instantly and keep full control of it.
            </p>
        </BottomSheet>
    )
}
