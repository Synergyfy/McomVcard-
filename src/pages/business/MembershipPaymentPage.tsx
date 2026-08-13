import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { loadMembershipPricing, formatPounds, type PlanTier } from '../../services/membershipPricingStore'
import { getPlanLevelFromName } from '../../services/membershipEnforcement'
import { mockBusinessProfile } from '../../services/businessStore'
import { mockMembership, mockSeasons } from '../../services/businessDashboardStore'
import { paymentProviderOptions, mockPaymentService, type PaymentProvider } from '../../services/payment'
import { useAuth } from '../../contexts/AuthContext'

/* ------------------------------------------------------------------ */
/*  Business — Membership Renewal Payment (/b/membership/payment)
/*  Stripe test mode + PayPal sandbox demo for renewing the current     */
/*  plan. Payment always succeeds in demo mode, then routes to the      */
/*  membership confirmation page.                                      */
/* ------------------------------------------------------------------ */

const DEMO_CARD = { number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123', name: 'Sarah Johnson' }

export default function MembershipPaymentPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const state = loadMembershipPricing()
    const planLevel = getPlanLevelFromName(mockBusinessProfile.membership)
    const tier: PlanTier = (['Normal', 'Pro', 'Pro+'].includes(mockBusinessProfile.tier)
        ? mockBusinessProfile.tier
        : 'Normal') as PlanTier
    const plan = state.plans.find(p => p.id === planLevel)
    const price = plan?.tiers[tier].quarterly ?? 0

    const [provider, setProvider] = useState<PaymentProvider | ''>('')
    const [card, setCard] = useState(DEMO_CARD)
    const [paypalEmail, setPaypalEmail] = useState('sarah.demo@paypal.com')
    const [busy, setBusy] = useState(false)

    const handlePay = async () => {
        if (!provider) {
            toast.error('Choose Stripe or PayPal to pay')
            return
        }
        setBusy(true)
        try {
            const payment = await mockPaymentService.process(provider, price)
            toast.success(`Renewal payment ${payment.id} approved — ${mockMembership.plan}`)
            navigate('/b/membership/confirmation')
        } catch {
            toast.error('Payment failed. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            <Helmet><title>Renew Membership - My Business - MCOMVCard</title></Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Renew membership</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete the payment to renew your {mockMembership.plan} plan for another {mockMembership.totalDays} days.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Order summary */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5 lg:sticky lg:top-24">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Order summary</h3>
                        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 shadow-lg shadow-orange-200 dark:shadow-none">
                            <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Renewal</p>
                            <p className="text-lg font-extrabold mt-1">{mockMembership.plan}</p>
                            <p className="text-xs text-white/70 mt-0.5">
                                {planLevel} · {tier} tier · 90 days access
                            </p>
                            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                                <span className="text-xs text-white/70">Due now</span>
                                <span className="text-2xl font-extrabold">{formatPounds(price)}</span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-1">/90 days · {mockSeasons[0].name}</p>
                        </div>
                        <dl className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <dt>Billed to</dt>
                                <dd className="font-semibold text-gray-900 dark:text-white">{mockBusinessProfile.name}</dd>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <dt>Account</dt>
                                <dd className="font-semibold text-gray-900 dark:text-white">{user?.email ?? mockBusinessProfile.ownerEmail}</dd>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <dt>Renews</dt>
                                <dd className="font-semibold text-gray-900 dark:text-white">{mockMembership.renewalDate}</dd>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <dt>Days</dt>
                                <dd className="font-semibold text-gray-900 dark:text-white">{mockMembership.totalDays} days</dd>
                            </div>
                        </dl>
                        <button
                            onClick={() => navigate('/b/membership')}
                            className="mt-5 w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Back to Membership
                        </button>
                    </div>
                </div>

                {/* Payment methods */}
                <div className="lg:col-span-3">
                    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pay with</h3>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Test mode
                            </span>
                        </div>

                        {busy ? (
                            <div className="py-12 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Processing payment with {provider === 'paypal' ? 'PayPal' : 'Stripe'}…</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {provider === 'paypal' ? 'Demo PayPal sandbox' : 'Stripe test mode'} · {formatPounds(price)}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2.5 mb-5">
                                    {paymentProviderOptions.map(p => (
                                        <button
                                            key={p.value}
                                            onClick={() => setProvider(p.value)}
                                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                                                provider === p.value
                                                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                provider === p.value ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                            }`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} />
                                                </svg>
                                            </span>
                                            <span className="text-left flex-1 min-w-0">
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">{p.label}</span>
                                                <span className="block text-xs text-gray-400">{p.sub}</span>
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                {p.mode}
                                            </span>
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                provider === p.value ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                                {provider === p.value && <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {provider === 'stripe' && (
                                    <div className="mb-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-4 space-y-3">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Demo card — Stripe test mode</p>
                                        <div>
                                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cardholder name</label>
                                            <input
                                                value={card.name}
                                                onChange={(e) => setCard({ ...card, name: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Card number</label>
                                            <input
                                                value={card.number}
                                                onChange={(e) => setCard({ ...card, number: e.target.value })}
                                                inputMode="numeric"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Expiry</label>
                                                <input
                                                    value={card.expiry}
                                                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                                                    placeholder="MM/YY"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">CVC</label>
                                                <input
                                                    value={card.cvc}
                                                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                                                    inputMode="numeric"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-400">Use any Stripe test card — 4242 4242 4242 4242 is always approved.</p>
                                    </div>
                                )}

                                {provider === 'paypal' && (
                                    <div className="mb-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center text-[10px] font-extrabold tracking-tight">P</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">PayPal demo account</p>
                                                <p className="text-xs text-gray-400">You will be redirected to a simulated PayPal checkout.</p>
                                            </div>
                                        </div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Sandbox email</label>
                                        <input
                                            value={paypalEmail}
                                            onChange={(e) => setPaypalEmail(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-2">Use a PayPal sandbox account, e.g. sarah.demo@paypal.com / test-password.</p>
                                    </div>
                                )}

                                <button
                                    onClick={handlePay}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
                                >
                                    {provider
                                        ? `Renew · Pay ${formatPounds(price)} with ${provider === 'paypal' ? 'PayPal' : 'Stripe'}`
                                        : `Renew · Pay ${formatPounds(price)}`}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 mt-3">
                                    Demo integration — no real payment is taken. Stripe test mode &amp; PayPal sandbox only.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
