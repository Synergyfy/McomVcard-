import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import BottomSheet from '../../business/primitives/BottomSheet'
import FamilyAvatar from './FamilyAvatar'
import { familyService } from '../../../services/familyCards'
import { consumerService } from '../../../services/consumer'
import type { FamilyCardMember } from '../../../services/familyCards'

interface TransferMoneySheetProps {
    open: boolean
    onClose: () => void
    member: FamilyCardMember | null
    onUpdated?: (member: FamilyCardMember) => void
}

const presetAmounts = [5, 10, 20, 50]

export default function TransferMoneySheet({ open, onClose, member, onUpdated }: TransferMoneySheetProps) {
    const [ownerBalance, setOwnerBalance] = useState(0)
    const [amount, setAmount] = useState(10)
    const [custom, setCustom] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (open && member) {
            consumerService.getCardBalance().then(setOwnerBalance)
            setAmount(10)
            setCustom('')
            setSending(false)
        }
    }, [open, member])

    if (!open || !member) return null

    const exceedBalance = amount > ownerBalance
    const canSend = amount > 0 && !exceedBalance && !sending

    const handleTransfer = async () => {
        if (!canSend) return
        setSending(true)
        try {
            const result = await familyService.fundMember(member.id, amount)
            if (!result) {
                toast.error('Could not find that family card')
                return
            }
            toast.success(`£${amount.toFixed(2)} transferred to ${member.name}`)
            onUpdated?.(result.member)
            setOwnerBalance(result.ownerBalance)
            setCustom('')
            setAmount(10)
            onClose()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not transfer money')
        } finally {
            setSending(false)
        }
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="Transfer Money">
            <div className="rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white shadow-lg mb-5">
                <div className="flex items-center gap-4">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="lg" name={member.name} />
                    <div className="min-w-0">
                        <p className="text-base font-extrabold truncate">Transfer to {member.name}</p>
                        <p className="text-xs text-white/80">Money moves instantly from your card balance.</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/15 backdrop-blur px-3.5 py-2.5">
                    <span className="text-xs font-semibold text-white/80">{member.name}'s current card</span>
                    <span className="text-sm font-extrabold">£{member.cardBalance.toFixed(2)}</span>
                </div>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Your card balance</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">£{ownerBalance.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">After transfer</p>
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
                                ? 'bg-accent-500 text-white border-accent-500'
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

            {exceedBalance && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Amount exceeds your available balance. Fund your card first.
                </div>
            )}

            <button
                onClick={handleTransfer}
                disabled={!canSend}
                className="w-full h-12 rounded-2xl bg-accent-500 text-white font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
                {sending ? 'Transferring…' : `Transfer £${(amount || 0).toFixed(2)}`}
            </button>
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-3">
                Funds are available to {member.name} instantly at MCOM Mall, Expo &amp; partners.
            </p>
        </BottomSheet>
    )
}
