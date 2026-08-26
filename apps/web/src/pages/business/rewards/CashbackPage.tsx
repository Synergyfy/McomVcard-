import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { businessService, type CashbackProgram } from '../../../services/businessApi'

export default function CashbackPage() {
    const [programs, setPrograms] = useState<CashbackProgram[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const data = await businessService.getCashbackPrograms()
                if (!cancelled) setPrograms(data)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const totalEarned = programs.reduce((s, p) => s + p.earned, 0)
    const activeCount = programs.filter((p) => p.status === 'active').length

    const handleToggle = async (p: CashbackProgram) => {
        const newStatus = p.status === 'active' ? 'off' : 'active'
        const updated = await businessService.updateCashbackProgram(p.id, { status: newStatus })
        if (!updated) {
            toast.error('Could not update program')
            return
        }
        setPrograms((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus as CashbackProgram['status'] } : x))
        toast.success(`Program ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Cashback - Rewards - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Rewards
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cashback</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Give money back to your loyal customers.</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
            ) : (
                <>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                        <p className="text-xs text-white/80">Total cashback earned</p>
                        <p className="text-3xl font-bold mt-1">£{totalEarned.toFixed(2)}</p>
                        <p className="text-xs text-white/80 mt-1">Across {activeCount} active program{activeCount !== 1 ? 's' : ''}</p>
                    </div>

                    {programs.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No cashback programs yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {programs.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{p.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rate: {p.rate}% · Earned: £{p.earned.toFixed(2)}</p>
                                        </div>
                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            p.status === 'active'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                            {p.status === 'active' ? 'Active' : 'Off'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => handleToggle(p)}
                                            className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-white text-xs font-bold"
                                        >
                                            {p.status === 'active' ? 'Turn Off' : 'Turn On'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
