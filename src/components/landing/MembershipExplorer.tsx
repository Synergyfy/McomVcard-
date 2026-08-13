/* ------------------------------------------------------------------ */
/*  Interactive membership explorer.                                   */
/*                                                                     */
/*  Reuses the existing PricingCards components — LevelDropdown,       */
/*  BillingToggle, AccessCards and AccessComparison — so the landing   */
/*  pages show exactly the same data as /membership. Driven by the     */
/*  admin's pricing stores: business pricing for the business page,    */
/*  consumer pricing for the consumer page. No prices are hard-coded.  */
/* ------------------------------------------------------------------ */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadMembershipPricing, type BillingCycle, type PlanLevel, type PlanTier } from '../../services/membershipPricingStore'
import { loadConsumerPricing } from '../../services/consumerPricingStore'
import { LevelDropdown, AccessCards, AccessComparison, BillingToggle } from '../public/PricingCards'
import { SectionHeading } from './SectionHeading'

export default function MembershipExplorer({ tone = 'orange', audience = 'business', ctaTo, ctaLabel }: {
  tone?: 'orange' | 'blue' | 'purple'
  audience?: 'business' | 'consumer'
  ctaTo?: string
  ctaLabel?: string
}) {
  const navigate = useNavigate()
  const isConsumer = audience === 'consumer'
  const [state] = useState(() => isConsumer ? loadConsumerPricing() : loadMembershipPricing())
  const [level, setLevel] = useState<PlanLevel>('Gold')
  const [tier, setTier] = useState<PlanTier>('Normal')
  const [billing, setBilling] = useState<BillingCycle>('quarterly')

  const finalCtaTo = ctaTo ?? (isConsumer ? '/find-a-business' : '/register')
  const finalCtaLabel = ctaLabel ?? (isConsumer ? 'Find a Business' : 'Start Your Business')

  const ctaBtn =
    tone === 'purple'
      ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200'
      : tone === 'blue'
        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 hover:shadow-orange-200'

  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="Membership & access"
          title={isConsumer ? 'Issued by businesses you trust' : 'Compare your membership'}
          subtitle={isConsumer
            ? 'Your membership level is issued by the business you connect with. Levels, tiers and allowances below come from the consumer membership configuration and update automatically.'
            : 'Pick a level, then choose Standard, Pro or Pro+ access. 90-day, 180-day and annual cycles are all configurable.'}
          tone={tone}
        />

        <div className="max-w-5xl mx-auto">
          {/* Step 1 — level */}
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
            <AccessCards state={state} level={level} tier={tier} billing={billing} onSelect={setTier} onChoose={() => navigate(finalCtaTo)} />
          </div>

          {/* Comparison */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Compare {level} access</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">
              {isConsumer ? 'Pro+ is the annual membership option with the highest access and benefits.' : 'Pro+ is an annual membership and provides the highest level of access and benefits.'}
            </p>
            <AccessComparison state={state} level={level} />
          </div>

          <div className="flex justify-center mt-8">
            <a
              href={finalCtaTo}
              className={`inline-flex items-center px-8 py-3 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-[0.98] ${ctaBtn}`}
            >
              {finalCtaLabel}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-6">
            {isConsumer
              ? 'Consumers never buy membership — it is issued by the business you connect with. Levels, tiers and any upgrade prices come from the membership configuration and update automatically.'
              : 'Standard gives access. Pro is the upgrade. Pro+ is the annual membership. Prices and durations come from the membership configuration and update automatically.'}
          </p>
        </div>
      </div>
    </section>
  )
}