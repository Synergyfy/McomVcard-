import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { homeKpiPages, mockCashback, mockGiftCards, mockRedeemHistory, mockSmartMoneySolutions } from '../../services/businessDashboardStore'
import { mockAssignedCards } from '../../services/businessStore'

const walletValue = homeKpiPages[1][1].value
const rewardsRedeemed = homeKpiPages[0][3].value

/* Smart Money = everything a business can use, earned across the MCOM
   platform (MCOM Rewards, MCOM Wallet, MCOM Mall). MCOMVCard never runs
   its own rewards engine — the owning MCOM platform is always shown. */
const cashbackEarned = mockCashback.reduce((sum, c) => sum + parseFloat(c.earned.replace('£', '')), 0)
const giftCardRevenue = mockGiftCards.reduce((sum, g) => sum + g.sold * parseFloat(g.price.replace('£', '')), 0)
const giftCardsSold = mockGiftCards.reduce((sum, g) => sum + g.sold, 0)
const eCardFaceValue = mockAssignedCards.find(c => c.name === 'E-Gift Card')?.faceValue ?? '£0'
const creditsBalance = '£245.00'

const statusCls: Record<string, string> = {
    active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    off: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    paused: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
}

/* Money & rewards received into the business wallet. */
const received = [
    { id: 1, label: 'Gift card sales', detail: `${giftCardsSold} cards sold`, value: `+£${giftCardRevenue.toLocaleString('en-GB')}`, source: 'MCOM Mall, Expo & partner merchants' },
    { id: 2, label: 'Cashback earned', detail: 'Loyalty Cashback · 3%', value: '+£127.40', source: 'MCOM Rewards' },
    { id: 3, label: 'Cashback earned', detail: 'Coffee Subscription · 5%', value: '+£54.20', source: 'MCOM Rewards' },
    { id: 4, label: 'Rewards redeemed', detail: `${rewardsRedeemed} by customers`, value: `+${rewardsRedeemed}`, source: 'MCOM Rewards' },
]

/* Money & rewards used — customer redemptions paid out. */
const used = mockRedeemHistory
    .filter(r => r.status === 'completed')
    .map(r => ({
        id: r.id,
        label: r.item,
        detail: `${r.customer} · ${r.type}`,
        value: `−${r.value}`,
        source: r.type === 'Gift Card' ? 'MCOM Mall, Expo & partner merchants' : 'MCOM Rewards',
    }))

const tiles = [
    { label: 'Cashback', value: `£${cashbackEarned.toFixed(2)}`, sub: 'Earned via MCOM Rewards', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Rewards', value: rewardsRedeemed, sub: 'Redeemed via MCOM Rewards', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'E-Card value', value: eCardFaceValue, sub: 'Face value · Gold Pro', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Credits', value: creditsBalance, sub: 'Store credit · MCOM Rewards', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
]

export default function WalletPage() {
    const balance = walletValue.replace('£', '').replace(',', '')

    return (
        <div className="space-y-6 animate-fadeIn max-w-lg">
            <Helmet><title>Wallet - Business Dashboard - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet / Smart Money</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything your business can use, earned across the MCOM platform.</p>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                <p className="text-xs text-white/80">Available balance</p>
                <p className="text-3xl font-bold mt-1">{walletValue}</p>
                <p className="text-xs text-white/80 mt-1">Smart Money · via MCOM Wallet</p>
            </div>

            {/* Smart Money components */}
            <div className="grid grid-cols-2 gap-3">
                {tiles.map((t) => (
                    <div key={t.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                        <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center mb-3`}>
                            <svg className={`w-4 h-4 ${t.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                            </svg>
                        </div>
                        <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{t.value}</p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{t.sub}</p>
                    </div>
                ))}
            </div>

            {/* Platform attribution */}
            <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3">
                <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    Cashback, rewards and e-card value are provided by <span className="font-semibold text-gray-700 dark:text-gray-300">MCOM Rewards</span>, funded and held via <span className="font-semibold text-gray-700 dark:text-gray-300">MCOM Wallet</span>. Gift cards are redeemed at <span className="font-semibold text-gray-700 dark:text-gray-300">MCOM Mall, Expo &amp; partner merchants</span>. MCOMVCard surfaces these balances for your business.
                </p>
            </div>

            {/* Available Smart Money Solutions */}
            <section>
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Available Smart Money Solutions</h2>
                    <Link to="/b/integrations" className="text-xs font-semibold text-orange-600 dark:text-orange-400">All integrations</Link>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                    A connected MCOM ecosystem that returns money and value to your business — each service is owned and run by its MCOM platform, not by MCOMVCard.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mockSmartMoneySolutions.map((s) => (
                        <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                                    </svg>
                                </div>
                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                    s.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                        : s.status === 'available' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                    {s.status === 'active' ? 'Active' : s.status === 'available' ? 'Available' : s.status === 'coming-soon' ? 'Coming soon' : 'Future'}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-2.5">{s.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.description}</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-300">Owned &amp; run by</span> {s.platform}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Money & rewards received */}
            <section>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Money &amp; rewards received</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {received.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.detail} · {r.source}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-emerald-600">{r.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Money & rewards used */}
            <section>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Money &amp; rewards used</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {used.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.detail} · {r.source}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-rose-500">{r.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cashback programs */}
            <section>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Cashback programs</h2>
                    <Link to="/b/rewards/cashback" className="text-xs font-semibold text-orange-600 dark:text-orange-400">Manage</Link>
                </div>
                <div className="space-y-3">
                    {mockCashback.map((c) => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.rate} cashback · {c.earned} earned · MCOM Rewards</p>
                                </div>
                                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusCls[c.status]}`}>
                                    {c.status === 'active' ? 'Active' : 'Off'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Gift cards */}
            <section>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Gift cards on sale</h2>
                    <Link to="/b/rewards/gift-cards" className="text-xs font-semibold text-orange-600 dark:text-orange-400">Manage</Link>
                </div>
                <div className="space-y-3">
                    {mockGiftCards.map((g) => (
                        <div key={g.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{g.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{g.sold} sold · MCOM Mall, Expo &amp; partner merchants</p>
                                </div>
                                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusCls[g.status]}`}>
                                    {g.status === 'active' ? 'Active' : 'Paused'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent money activity */}
            <section>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Recent activity</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {mockRedeemHistory.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.customer}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.item} · {r.type} · {r.date}</p>
                            </div>
                            <span className={`shrink-0 text-sm font-bold ${r.status === 'completed' ? 'text-emerald-600' : 'text-gray-400'}`}>{r.value}</span>
                        </div>
                    ))}
                    {mockRedeemHistory.length === 0 && (
                        <div className="px-4 py-6 text-center text-xs text-gray-400">No money activity yet.</div>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Included balance shown is illustrative · {Number(balance).toLocaleString('en-GB')}</p>
            </section>
        </div>
    )
}
