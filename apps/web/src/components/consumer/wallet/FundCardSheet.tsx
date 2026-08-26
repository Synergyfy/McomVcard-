import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import BottomSheet from '../../business/primitives/BottomSheet'
import { consumerService } from '../../../services/consumer'
import { paymentProviderOptions, mockPaymentService, type PaymentProvider } from '../../../services/payment'

interface FundCardSheetProps {
    open: boolean
    onClose: () => void
    onFunded?: (balance: number) => void
}

const quickAmounts = [10, 25, 50, 100]

const DEMO_CARD = { number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123', name: 'Sarah Johnson' }

export default function FundCardSheet({ open, onClose, onFunded }: FundCardSheetProps) {
    const [balance, setBalance] = useState(0)
    const [amount, setAmount] = useState<number>(25)
    const [custom, setCustom] = useState('')
    const [provider, setProvider] = useState<PaymentProvider | ''>('')
    const [card, setCard] = useState(DEMO_CARD)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (!open) return
        setCustom('')
        setProvider('')
        setCard(DEMO_CARD)
        setBusy(false)
        consumerService.getCardBalance().then(setBalance)
    }, [open])

    const selected = amount

    const handleConfirm = async () => {
        if (!selected || selected <= 0) {
            toast.error('Enter an amount to add')
            return
        }
        if (!provider) {
            toast.error('Choose Stripe or PayPal to pay')
            return
        }
        setBusy(true)
        try {
            // Mock/demo provider processing
            const payment = await mockPaymentService.process(provider, selected)
            // Credit the card balance once the (simulated) payment succeeds
            const next = await consumerService.fundCard(selected, provider)
            toast.success(`Payment ${payment.id} approved — £${selected.toFixed(2)} added to your card`)
            setBalance(next)
            onFunded?.(next)
            onClose()
        } catch {
            toast.error('Payment failed. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="Fund Your Card">
            <div className="rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white shadow-lg mb-5">
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wide">Card balance</p>
                <p className="text-4xl font-extrabold mt-1">£{balance.toFixed(2)}</p>
                <p className="text-xs text-white/80 mt-2">Usable at MCOM Mall, Expo &amp; partner merchants.</p>
            </div>

            {busy ? (
                <div className="py-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-accent-500 border-t-transparent animate-spin mb-4" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Processing payment with {provider === 'paypal' ? 'PayPal' : 'Stripe'}…
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {provider === 'paypal' ? 'Demo PayPal sandbox' : 'Stripe test mode'} · £{selected.toFixed(2)}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">How much do you want to add?</p>
                    <div className="grid grid-cols-4 gap-2.5 mb-3">
                        {quickAmounts.map((q) => (
                            <button
                                key={q}
                                onClick={() => { setAmount(q); setCustom('') }}
                                className={`py-3 rounded-2xl text-sm font-bold border transition-colors ${
                                    !custom && amount === q
                                        ? 'bg-accent-500 text-white border-accent-500 shadow-lg shadow-accent-500/25'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                £{q}
                            </button>
                        ))}
                    </div>
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">Or enter an amount</label>
                        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
                            <span className="text-lg font-bold text-gray-400">£</span>
                            <input
                                type="number"
                                min={1}
                                value={custom}
                                onChange={(e) => { setCustom(e.target.value); setAmount(Number(e.target.value)) }}
                                placeholder="0.00"
                                className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Pay with</p>
                    <div className="space-y-2.5 mb-4">
                        {paymentProviderOptions.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setProvider(p.value)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                                    provider === p.value
                                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                                }`}
                            >
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    provider === p.value ? 'bg-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} />
                                    </svg>
                                </span>
                                <span className="text-left flex-1 min-w-0">
                                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{p.label}</span>
                                    <span className="block text-xs text-gray-400 dark:text-gray-500">{p.sub}</span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                    {p.mode}
                                </span>
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    provider === p.value ? 'border-accent-500' : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                    {provider === p.value && <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />}
                                </span>
                            </button>
                        ))}
                    </div>

                    {provider === 'stripe' && (
                        <div className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Demo card — Stripe test mode</p>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Card number</label>
                                <input
                                    value={card.number}
                                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                                    inputMode="numeric"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Expiry</label>
                                    <input
                                        value={card.expiry}
                                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                                        placeholder="MM/YY"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">CVC</label>
                                    <input
                                        value={card.cvc}
                                        onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                                        inputMode="numeric"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent-500"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400">Use any test card — 4242 4242 4242 4242 is always approved.</p>
                        </div>
                    )}

                    {provider === 'paypal' && (
                        <div className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center text-[10px] font-extrabold tracking-tight">P</span>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">sarah.demo@paypal.com</p>
                                    <p className="text-xs text-gray-400">PayPal demo account</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400">You will be redirected to a simulated PayPal checkout in the real app.</p>
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        className="w-full py-3.5 min-h-[46px] rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors disabled:opacity-50"
                    >
                        {provider ? `Pay £${(selected || 0).toFixed(2)} with ${provider === 'paypal' ? 'PayPal' : 'Stripe'}` : `Add £${(selected || 0).toFixed(2)} to card`}
                    </button>
                </>
            )}
        </BottomSheet>
    )
}
