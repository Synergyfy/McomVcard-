import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { mockCustomers } from '../../../services/businessDashboardStore'

export default function IssueRewardPage() {
    const [customer, setCustomer] = useState('')
    const [type, setType] = useState('Loyalty Points')
    const [value, setValue] = useState('100')
    const [note, setNote] = useState('')

    const types = ['Loyalty Points', 'Coupon', 'Gift Card', 'Cashback', 'Voucher']

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success(`Reward issued: ${value} ${type}${customer ? ` to ${customer}` : ''}`)
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Give a customer points, a coupon or a gift instantly.</p>
            </div>

            <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Customer</label>
                    <select
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">Select a customer</option>
                        {mockCustomers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reward type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {types.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors min-h-[44px] ${
                                    type === t
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Value</label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={type === 'Loyalty Points' ? 'Points amount' : 'Amount'}
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

                <button type="submit" className="w-full py-3.5 min-h-[48px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity">
                    Issue Reward
                </button>
                <p className="text-center">
                    <Link to="/b/rewards" className="text-xs text-gray-400">Cancel</Link>
                </p>
            </form>
        </div>
    )
}
