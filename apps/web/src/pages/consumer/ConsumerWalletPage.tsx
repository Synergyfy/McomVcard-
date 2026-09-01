import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import { consumerWishlistService } from '../../services/consumerWishlist'
import api from '../../services/api'
import { businessService, type Wallet, type WalletTransaction } from '../../services/businessApi'
import BottomSheet from '../../components/business/primitives/BottomSheet'
import FundCardSheet from '../../components/consumer/wallet/FundCardSheet'
import ErrorState from '../../components/common/ErrorState'

interface ExchangeItem { id: string; title: string; type: string; business: string; value: string; expires: string; icon: string; color: string }
interface NearbyOffer { id: string; business: string; category: string; offer: string; discount: string; distance: string; icon: string; gradient: string }

type WalletKey = 'giftCards' | 'vouchers' | 'coupons' | 'deals' | 'cashback' | 'rewards' | 'redeemable' | 'wishlist'

export default function ConsumerWalletPage() {
    const [wallet, setWallet] = useState<{ balance: number; points: number; cashback: number; giftCards: number; coupons: number; vouchers: number; pending?: number; locked?: number } | null>(null)
    const [centralWallet, setCentralWallet] = useState<Wallet | null>(null)
    const [cardBalance, setCardBalance] = useState(0)
    const [transactions, setTransactions] = useState<WalletTransaction[]>([])
    const [fundOpen, setFundOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [detail, setDetail] = useState<WalletKey | null>(null)
    const [wishCount, setWishCount] = useState(0)
    const [redeemItems, setRedeemItems] = useState<ExchangeItem[]>([])
    const [nearbyOffers, setNearbyOffers] = useState<NearbyOffer[]>([])

    const loadWallet = () => {
        setLoading(true)
        setError(false)
        Promise.all([
            consumerService.getWallet(),
            consumerService.getCardBalance(),
            consumerService.getCardActivity(),
            consumerWishlistService.getWishlist(),
            api.get('/vouchers/redeem/items').then((r) => r.data as ExchangeItem[]).catch(() => [] as ExchangeItem[]),
            api.get('/campaigns/nearby').then((r) => r.data as NearbyOffer[]).catch(() => [] as NearbyOffer[]),
        ])
            .then(([w, b, a, wish, redeem, offers]) => {
            businessService.getWallet(),
            businessService.getWalletTransactions(),
            consumerService.getCardBalance(),
            consumerWishlistService.getWishlist(),
        ])
            .then(([w, cw, txs, b, wish]) => {
                setWallet(w)
                setCentralWallet(cw)
                setTransactions(txs || [])
                setCardBalance(b)
                setWishCount(wish.length)
                setRedeemItems(redeem)
                setNearbyOffers(offers)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadWallet()
    }, [])

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    if (error || !wallet) {
        return (
            <div className="space-y-4 pb-2">
                <Helmet><title>Wallet - Consumer - MCOM VCard</title></Helmet>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Everything you can use</p>
                </div>
                <div className="lg:max-w-2xl">
                    <ErrorState title="We couldn't load your wallet" message="Please try again in a moment." onRetry={loadWallet} />
                </div>
            </div>
        )
    }

    const redeemable = redeemItems.length
    const deals = nearbyOffers.length

    const items: { key: WalletKey; label: string; value: string; sub: string; icon: string; color: string; bg: string; to?: string }[] = [
        { key: 'giftCards', label: 'Gift Cards', value: wallet.giftCards.toString(), sub: 'In your wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { key: 'vouchers', label: 'Vouchers', value: wallet.vouchers.toString(), sub: 'Active vouchers', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { key: 'coupons', label: 'Coupons', value: wallet.coupons.toString(), sub: 'Ready to use', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
        { key: 'deals', label: 'Deals', value: deals.toString(), sub: 'Nearby offers', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20' },
        { key: 'cashback', label: 'Cashback', value: `£${wallet.cashback.toFixed(2)}`, sub: 'Available to use', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { key: 'rewards', label: 'Rewards', value: wallet.points.toLocaleString(), sub: `${wallet.vouchers} active vouchers`, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { key: 'redeemable', label: 'Redeemable', value: redeemable.toString(), sub: 'Ready to redeem now', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        { key: 'wishlist', label: 'My Wishlist', value: wishCount.toString(), sub: 'Things you want', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', to: '/c/wishlist' },
    ]

    const detailContent: Record<WalletKey, { title: string; rows: { label: string; value: string }[]; cta: string }> = {
        giftCards: { title: 'Gift Cards', rows: [
            { label: 'Gift cards in wallet', value: wallet.giftCards.toString() },
            { label: '£2 e-Card Voucher', value: '£2.00' },
        ], cta: 'Use Gift Card' },
        vouchers: { title: 'Vouchers', rows: [
            { label: 'Active vouchers', value: wallet.vouchers.toString() },
            { label: 'Free Coffee', value: 'Free' },
            { label: 'Free Class Pass', value: '1 free class' },
        ], cta: 'Use Voucher' },
        coupons: { title: 'Coupons', rows: [
            { label: 'Active coupons', value: wallet.coupons.toString() },
            { label: '10% Off Voucher', value: '10% off' },
            { label: 'Free Class Pass', value: '1 free class' },
        ], cta: 'Use Coupon' },
        deals: { title: 'Deals Near You', rows: nearbyOffers.map((o) => ({ label: o.offer, value: o.discount })), cta: 'Browse Deals' },
        cashback: { title: 'Cashback', rows: [
            { label: 'Available cashback', value: `£${wallet.cashback.toFixed(2)}` },
            { label: 'From GreenLeaf Coffee', value: '£2.00' },
            { label: 'From FitLife Studio', value: '£1.50' },
            { label: 'Membership bonus', value: '£0.50' },
        ], cta: 'Redeem Cashback' },
        rewards: { title: 'Rewards', rows: [
            { label: 'Points balance', value: wallet.points.toLocaleString() },
            { label: 'Active vouchers', value: wallet.vouchers.toString() },
            { label: 'Rewards earned', value: '6' },
        ], cta: 'View Rewards' },
        redeemable: { title: 'Redeemable Now', rows: redeemItems.map((r) => ({ label: r.title, value: r.value })), cta: 'Redeem Now' },
        wishlist: { title: 'My Wishlist', rows: [{ label: 'Saved items', value: wishCount.toString() }], cta: 'View Wishlist' },
    }

    const centralBalance = centralWallet?.balance ?? 0
    const centralAvailable = centralWallet?.available_balance ?? centralBalance
    const centralPending = Math.max(0, centralBalance - centralAvailable)

    const txMeta = (t: WalletTransaction): { cat: string; color: string; bg: string } => {
        if (t.type === 'CREDIT') return { cat: 'Funding', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
        if (t.type === 'DEBIT') return { cat: 'Spending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' }
        return { cat: t.category || 'Other', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' }
    }

    const txAction = (t: WalletTransaction): string =>
        t.description || (t.type === 'CREDIT' ? 'Wallet credit' : 'Wallet debit')

    return (
        <div className="space-y-4 pb-2">
            <Helmet><title>Wallet - Consumer - MCOM VCard</title></Helmet>

            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Everything you can use</p>
            </div>

            {/* Wallet balance — separate from card balance. Sourced from the centralized MCOM Wallet. */}
            <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Wallet balance</p>
                <p className="text-4xl font-extrabold mt-1 text-gray-900 dark:text-white">
                    {centralBalance.toFixed(2)} <span className="text-base font-semibold text-gray-400 dark:text-gray-500">MCOM</span>
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-[10px] uppercase text-gray-400 dark:text-gray-500">Available</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{centralAvailable.toFixed(2)} MCOM</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-gray-400 dark:text-gray-500">Held</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{centralPending.toFixed(2)} MCOM</p>
                    </div>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                    MCOM credits held in your centralized MCOM Wallet — separate from your card balance, E-Card value and reward points.
                </p>
            </section>

            {/* Card balance */}
            <section className="rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white shadow-lg shadow-accent-500/25">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs text-white/80 font-semibold uppercase tracking-wide">Card balance</p>
                        <p className="text-4xl font-extrabold mt-1">£{cardBalance.toFixed(2)}</p>
                        <p className="text-xs text-white/80 mt-2">Usable at MCOM Mall, Expo &amp; partner merchants.</p>
                    </div>
                    <button
                        onClick={() => setFundOpen(true)}
                        className="flex items-center gap-1.5 px-4 h-11 rounded-2xl bg-white text-accent-600 text-sm font-bold shadow-lg active:scale-[0.97] transition-transform shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Fund Card
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 8a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17h3.839a.75.75 0 00.53-.919c-.083-.322-.173-.657-.263-1.003m0 0a15.976 15.976 0 00-2.595-6.625" />
                    </svg>
                    <Link to="/c/family" className="text-xs font-semibold text-white underline underline-offset-2">
                        Send money to family cards
                    </Link>
                </div>
            </section>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => {
                    const body = (
                        <>
                            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                                <svg className={`w-5 h-5 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                </svg>
                            </div>
                            <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{item.value}</p>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{item.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                        </>
                    )
                    return item.to ? (
                        <Link
                            key={item.key}
                            to={item.to}
                            className="text-left bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 active:scale-[0.98] transition-transform"
                        >
                            {body}
                        </Link>
                    ) : (
                        <button
                            key={item.key}
                            onClick={() => setDetail(item.key)}
                            className="text-left bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 active:scale-[0.98] transition-transform"
                        >
                            {body}
                        </button>
                    )
                })}
            </div>

            <Link
                to="/c/rewards"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                View All Rewards
            </Link>

            <BottomSheet open={!!detail} onClose={() => setDetail(null)} title={detail ? detailContent[detail].title : ''}>
                {detail && (
                    <div>
                        <div className="space-y-3 mb-6">
                            {detailContent[detail].rows.map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{row.label}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{row.value}</span>
                                </div>
                            ))}
                        </div>
                        {detail === 'wishlist' ? (
                            <Link to="/c/wishlist" className="block w-full py-3.5 min-h-[46px] rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors text-center">
                                {detailContent[detail].cta}
                            </Link>
                        ) : (
                            <button className="w-full py-3.5 min-h-[46px] rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors">
                                {detailContent[detail].cta}
                            </button>
                        )}
                    </div>
                )}
            </BottomSheet>

            <FundCardSheet open={fundOpen} onClose={() => setFundOpen(false)} onFunded={setCardBalance} />

            {/* Transactions */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Transactions</h2>
                    {transactions.length > 0 && <span className="text-[11px] text-gray-400">{transactions.length}</span>}
                </div>
                {transactions.length > 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800">
                        {transactions.slice(0, 8).map((t) => {
                            const meta = txMeta(t)
                            const time = new Date(t.created_at).toLocaleString()
                            const source = t.category || 'MCOM Wallet'
                            return (
                                <div key={t.id} className="flex items-center gap-3 p-4">
                                    <span className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                                        <svg className={`w-4 h-4 ${meta.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{txAction(t)}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{time} · {source}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${meta.bg} ${meta.color}`}>{meta.cat}</span>
                                        <span className="text-[10px] font-semibold text-emerald-500">Successful</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="py-8 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
                    </div>
                )}
            </section>
        </div>
    )
}
