import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { businessService, type CashbackProgram, type GiftCard, type RewardBalance, type RewardTransaction, type Wallet, type WalletTransaction } from '../../services/businessApi'
import { useCapabilities } from '../../hooks/useCapabilities'

const SOLUTIONS = [
  { id: 'rewards', name: 'MCOM Rewards', platform: 'MCOM Rewards', description: 'Customers earn and redeem points, cashback and perks that return money and loyalty to your business.', status: 'active', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.085 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z' },
  { id: 'expo', name: 'Promo / Expo', platform: 'MCOM Expo Center', description: 'Run promotions and appear at MCOM events and expos — turning attention into leads and footfall for you.', status: 'available', icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z' },
  { id: 'pay', name: 'Global Pay', platform: 'MCOM Global Pay', description: 'Accept secure payments from your VCard and storefront — money settles straight back to your business.', status: 'coming-soon', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'mall', name: 'MCOM Mall', platform: 'MCOM Mall', description: 'List products and gift cards for sale across the MCOM Mall and partner merchant network.', status: 'available', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
]

const statusCls: Record<string, string> = { active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', off: 'bg-gray-100 dark:bg-gray-700 text-gray-500', paused: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' }
const sym = (currency?: string) => currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency && currency !== 'GBP' ? `${currency} ` : '£'
const fmtDate = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'

export default function WalletPage() {
  const { can } = useCapabilities()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [cashback, setCashback] = useState<CashbackProgram[]>([])
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [rewardBalance, setRewardBalance] = useState<RewardBalance | null>(null)
  const [rewardTx, setRewardTx] = useState<RewardTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      businessService.getWallet(), businessService.getWalletTransactions(), businessService.getCashbackPrograms(),
      businessService.getGiftCards(), businessService.getRewardBalance(), businessService.getRewardTransactions(),
    ]).then(([w, tx, cb, gc, rb, rt]) => {
      if (cancelled) return
      setWallet(w); setTransactions(tx); setCashback(cb); setGiftCards(gc); setRewardBalance(rb); setRewardTx(rt)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const symbol = sym(wallet?.currency)
  const balance = wallet?.available_balance ?? wallet?.balance ?? 0
  const cashbackEarned = useMemo(() => cashback.reduce((s, c) => s + c.earned, 0), [cashback])
  const giftRevenue = useMemo(() => giftCards.reduce((s, g) => s + g.sold * g.price, 0), [giftCards])
  const giftSold = useMemo(() => giftCards.reduce((s, g) => s + g.sold, 0), [giftCards])
  const eCardValue = useMemo(() => giftCards.reduce((s, g) => s + g.value, 0), [giftCards])
  const redeemed = rewardTx.filter((t) => t.type === 'REDEEM').reduce((s, t) => s + Math.abs(t.amount), 0)
  const credits = transactions.filter((t) => Number(t.amount) > 0)
  const debits = transactions.filter((t) => Number(t.amount) < 0)

  const tiles = [
    { label: 'Cashback', value: `${symbol}${cashbackEarned.toFixed(2)}`, sub: 'Earned via MCOM Rewards', color: 'text-emerald-600' },
    { label: 'Rewards', value: redeemed.toLocaleString('en-GB'), sub: 'Redeemed via MCOM Rewards', color: 'text-purple-600' },
    { label: 'E-Card value', value: `${symbol}${eCardValue.toFixed(2)}`, sub: `${giftCards.length} gift card${giftCards.length === 1 ? '' : 's'} on sale`, color: 'text-blue-600' },
    { label: 'Credits', value: `${(rewardBalance?.balance ?? 0).toLocaleString('en-GB')} pts`, sub: 'Store credit · MCOM Rewards', color: 'text-rose-600' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn max-w-lg">
      <Helmet><title>Wallet - Business Dashboard - MCOMVCard</title></Helmet>
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet / Smart Money</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything your business can use, earned across the MCOM platform.</p></div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
        <p className="text-xs text-white/80">Available balance</p>
        <p className="text-3xl font-bold mt-1">{loading ? '—' : `${symbol}${balance.toFixed(2)}`}</p>
        <p className="text-xs text-white/80 mt-1">Smart Money · via MCOM Wallet</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <p className={`text-lg font-extrabold leading-tight ${t.color}`}>{loading ? '—' : t.value}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{t.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3">
        <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Cashback, rewards and e-card value are provided by <span className="font-semibold text-gray-700 dark:text-gray-300">MCOM Rewards</span>, funded and held via <span className="font-semibold text-gray-700 dark:text-gray-300">MCOM Wallet</span>. Gift cards are redeemed at <span className="font-semibold text-gray-700 dark:text-gray-300">MCOM Mall, Expo &amp; partner merchants</span>.</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-1"><h2 className="text-sm font-bold text-gray-900 dark:text-white">Available Smart Money Solutions</h2><Link to="/b/integrations" className="text-xs font-semibold text-orange-600">All integrations</Link></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOLUTIONS.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg></div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : s.status === 'available' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{s.status === 'active' ? 'Active' : s.status === 'available' ? 'Available' : 'Coming soon'}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-2.5">{s.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.description}</p>
              <p className="text-[10px] text-gray-400 mt-2"><span className="font-semibold text-gray-500">Owned &amp; run by</span> {s.platform}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Money &amp; rewards received</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
          {credits.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">No incoming wallet activity yet.</div>}
          {credits.map((t) => <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.description || 'Wallet credit'}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.category || t.type} · {fmtDate(t.created_at)}</p></div><span className="shrink-0 text-sm font-bold text-emerald-600">+{symbol}{Number(t.amount).toFixed(2)}</span></div>)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Money &amp; rewards used</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
          {debits.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">No outgoing wallet activity yet.</div>}
          {debits.map((t) => <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.description || 'Wallet debit'}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.category || t.type} · {fmtDate(t.created_at)}</p></div><span className="shrink-0 text-sm font-bold text-rose-500">{symbol}{Math.abs(Number(t.amount)).toFixed(2)}</span></div>)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-bold text-gray-900 dark:text-white">Cashback programs</h2><Link to="/b/rewards/cashback" className="text-xs font-semibold text-orange-600">Manage</Link></div>
        <div className="space-y-3">
          {cashback.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-800">No cashback programs yet.</div>}
          {cashback.map((c) => <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.rate}% cashback · {symbol}{c.earned.toFixed(2)} earned · MCOM Rewards</p></div><span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusCls[c.status]}`}>{c.status === 'active' ? 'Active' : 'Off'}</span></div></div>)}
        </div>
      </section>

      {can('giftCards') && <section>
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-bold text-gray-900 dark:text-white">Gift cards on sale</h2><Link to="/b/rewards/gift-cards" className="text-xs font-semibold text-orange-600">Manage</Link></div>
        <div className="space-y-3">
          {giftCards.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-800">No gift cards on sale yet.</div>}
          {giftCards.map((g) => <div key={g.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-gray-900 dark:text-white">{g.title}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{g.sold} sold · {symbol}{g.value} face value · MCOM Mall, Expo &amp; partner merchants</p></div><span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusCls[g.status]}`}>{g.status === 'active' ? 'Active' : 'Paused'}</span></div></div>)}
        </div>
      </section>}

      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Recent activity</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
          {transactions.slice(0, 8).map((t) => <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-semibold text-gray-900 dark:text-white">{t.description || t.type}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.category || t.type} · {fmtDate(t.created_at)}</p></div><span className={`shrink-0 text-sm font-bold ${Number(t.amount) >= 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{Number(t.amount) >= 0 ? '+' : ''}{symbol}{Number(t.amount).toFixed(2)}</span></div>)}
          {transactions.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">No money activity yet.</div>}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Gift card sales: {giftSold} cards sold · {symbol}{giftRevenue.toFixed(2)} revenue.</p>
      </section>
    </div>
  )
}
