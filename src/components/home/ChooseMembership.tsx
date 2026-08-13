import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadMembershipPricing, type BillingCycle, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { LevelDropdown, AccessCards, AccessComparison, BillingToggle } from '../public/PricingCards'

/* ------------------------------------------------------------------ */
/*  Landing "Choose your Membership" section.                          */
/*  Business tab — two-step flow (level dropdown → Standard / Pro /    */
/*  Pro+ access cards) rendered from membershipPricingStore.           */
/*  Consumer tab — membership is issued through participating          */
/*  businesses (never purchased), mirroring the ConsumerPath story.    */
/* ------------------------------------------------------------------ */

type Audience = 'Business' | 'Consumer'

const consumerBenefits = [
  { title: 'Digital card & vCard', desc: 'Your consumer card and vCard are issued by the business you connect with.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { title: 'Rewards, points & e-cards', desc: 'Earn points, cashback, coupons and e-card value from participating businesses.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Family & friends sharing', desc: 'Share allocated additional cards with family and friends on your membership.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function ChooseMembership() {
  const navigate = useNavigate()
  const [state] = useState(() => loadMembershipPricing())
  const [audience, setAudience] = useState<Audience>('Business')
  const [level, setLevel] = useState<PlanLevel>('Gold')
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  return (
    <section id="pricing" className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="inline-block px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            Membership &amp; Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Choose your membership
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Businesses subscribe to a plan — Bronze, Silver, Gold or Platinum. Consumers are issued their membership by a participating business, never by purchasing access.
          </p>
        </div>

        {/* Audience tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {(['Business', 'Consumer'] as Audience[]).map(a => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  audience === a
                    ? a === 'Business'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-purple-600 text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                {a === 'Business' ? (
                  <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
                I'm a {a}
              </button>
            ))}
          </div>
        </div>

        {audience === 'Business' ? (
          <>
            <div className="max-w-5xl mx-auto">
              {/* Step 1 — level dropdown */}
              <div className="mb-8">
                <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Step 1 · Choose your membership level</p>
                <LevelDropdown state={state} level={level} onChange={setLevel} />
              </div>

              {/* Step 2 — access */}
              <div className="mb-6">
                <div className="flex flex-col items-center gap-3 mb-6">
                  <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Step 2 · Choose your access</p>
                  {tier !== 'Pro+' && <BillingToggle billing={billing} onChange={setBilling} />}
                  {tier === 'Pro+' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-800/40 text-orange-600 text-[11px] font-bold">
                      Pro+ · Annual membership
                    </span>
                  )}
                </div>
                <AccessCards state={state} level={level} tier={tier} billing={billing} onSelect={setTier} onChoose={() => navigate('/register')} />
              </div>

              {/* Comparison */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Compare {level} access</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">
                  Pro+ is an annual membership and provides the highest level of access and benefits.
                </p>
                <AccessComparison state={state} level={level} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98]"
              >
                Start Your Business
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link
                to="/membership"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Compare all features
              </Link>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-6">
              Standard gives access. Pro is the upgrade. Pro+ is the annual membership. Prices and durations are configured by MCOM and update automatically.
            </p>
          </>
        ) : (
          <div className="rounded-3xl border border-purple-100 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-500/5 p-7 md:p-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Consumer membership is issued by businesses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No purchase needed — connect with a participating business to receive your Bronze, Silver, Gold or Platinum membership.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 my-8">
              {consumerBenefits.map(b => (
                <div key={b.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-purple-100 dark:border-purple-500/20 p-5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{b.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/find-a-business"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98]"
              >
                Find a Business
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Link>
              <Link
                to="/membership"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-sm font-bold hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
              >
                See business plan prices
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
