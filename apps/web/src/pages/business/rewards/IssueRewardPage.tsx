import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { businessService } from '../../../services/businessApi'

const REWARD_TYPES = [
    { value: 'EARN', label: 'Loyalty Points', description: 'Give points to a customer' },
    { value: 'ADJUST', label: 'Adjustment', description: 'Manual balance adjustment' },
] as const

export default function IssueRewardPage() {
    const [customers, setCustomers] = useState<{ name: string; email: string }[]>([])
    const [customer, setCustomer] = useState('')
    const [type, setType] = useState<string>('EARN')
    const [value, setValue] = useState('100')
    const [note, setNote] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        businessService.getCustomers().then((list) => {
            setCustomers(list.map((c) => ({ name: c.name, email: c.email })))
        })
    }, [])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        const amount = Number(value)
        if (!amount || amount <= 0) {
            toast.error('Enter a valid amount')
            return
        }
        setSubmitting(true)
        try {
            // Ensure balance exists (idempotent)
            await businessService.createRewardBalance()

            const desc = note.trim() || `Issued to ${customer || 'customer'}`
            const tx = await businessService.createRewardTransaction({
                type: type as 'EARN' | 'ADJUST',
                amount,
                description: desc,
            })
            if (!tx) {
                toast.error('Could not issue reward — check the customer balance')
                return
            }
            toast.success(`Reward issued: ${amount} ${type === 'EARN' ? 'points' : 'adjustment'}${customer ? ` to ${customer}` : ''}`)
            setNote('')
            setValue('100')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Issue Reward - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issue Reward</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Give a customer points or a manual adjustment.</p>
            </div>

            <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Customer (reference)</label>
                    <select
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">Select a customer</option>
                        {customers.map((c) => <option key={c.email} value={c.name}>{c.name}</option>)}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">Rewards are tracked on your business balance ledger.</p>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reward type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {REWARD_TYPES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors min-h-[44px] ${
                                    type === t.value
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
                    <input
                        type="number"
                        min="1"
                        step="any"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={type === 'EARN' ? 'Points to give' : 'Adjustment amount'}
                        className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Note (optional)</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Why are you rewarding this customer?"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 min-h-[48px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                    {submitting ? 'Issuing…' : 'Issue Reward'}
                </button>
                <p className="text-center">
                    <Link to="/b/rewards" className="text-xs text-gray-400">Cancel</Link>
                </p>
            </form>
        </div>
    )
}
