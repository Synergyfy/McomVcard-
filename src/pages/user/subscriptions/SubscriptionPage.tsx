import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { mockPlans, mockSubscribedPlans } from '../../../services/mockData'

const BUSINESS_ID = 1

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)

  const currentSub = mockSubscribedPlans.find((s) => s.user_id === BUSINESS_ID && s.status === 'active')
  const currentPlan = currentSub ? mockPlans.find((p) => p.id === currentSub.plan_id) : null

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div>
      <Helmet><title>Subscription - MCOM VCard Social Bio</title></Helmet>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription plan</p>
        </div>
      </div>

      {/* Current Plan */}
      {currentSub && currentPlan ? (
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/70 mb-1">Current Plan</p>
              <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentSub.status === 'active' ? 'bg-white/20 text-white' : 'bg-red-500/30 text-red-200'}`}>
              {currentSub.status === 'active' ? 'Active' : 'Expired'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">Price</p>
              <p className="text-lg font-bold">£{currentPlan.price}/mo</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">vCards</p>
              <p className="text-lg font-bold">{currentPlan.no_of_vcards === -1 ? 'Unlimited' : currentPlan.no_of_vcards}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">Trial Days</p>
              <p className="text-lg font-bold">{currentPlan.trial_days}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">Renewal</p>
              <p className="text-sm font-bold">{new Date(currentSub.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <p className="text-xs text-white/50">Started {new Date(currentSub.start_date).toLocaleDateString('en-GB')} · {currentSub.payment_type}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 mb-8 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Subscription</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose a plan below to get started</p>
        </div>
      )}

      {/* Available Plans */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {mockPlans.map((plan) => {
          const isCurrent = currentPlan?.id === plan.id
          const isSelected = selectedPlan === plan.id
          return (
            <div key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-5 transition-all cursor-pointer ${isSelected ? 'border-orange-500 shadow-lg ring-2 ring-orange-500/20' : isCurrent ? 'border-green-500 shadow-md' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'}`}
              onClick={() => setSelectedPlan(plan.id)}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Current</div>
              )}
              {plan.is_default === 1 && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gray-400 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Free</div>
              )}
              <div className="text-center pt-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">£{plan.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/mo</span>
                </div>
                <div className="space-y-2 text-left text-sm mb-5">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {plan.no_of_vcards === -1 ? 'Unlimited vCards' : `${plan.no_of_vcards} vCards`}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {plan.trial_days} days trial
                  </div>
                  {plan.plan_feature?.products_services === 1 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Products & Services
                    </div>
                  )}
                  {plan.plan_feature?.testimonials === 1 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Testimonials
                    </div>
                  )}
                  {plan.plan_feature?.seo === 1 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      SEO Settings
                    </div>
                  )}
                  {plan.plan_feature?.blog === 1 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Blog
                    </div>
                  )}
                  {plan.plan_feature?.gallery === 1 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Gallery
                    </div>
                  )}
                  {plan.plan_feature?.custom_css === 1 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Custom CSS/JS
                    </div>
                  )}
                </div>
                <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isCurrent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default' : isSelected ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedPlan && selectedPlan !== currentPlan?.id && (
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Subscribe Now
          </button>
        </div>
      )}

      {/* Subscription History */}
      {mockSubscribedPlans.filter((s) => s.user_id === BUSINESS_ID).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription History</h2>
          <div className="space-y-3">
            {mockSubscribedPlans.filter((s) => s.user_id === BUSINESS_ID).map((s) => {
              const plan = mockPlans.find((p) => p.id === s.plan_id)
              return (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">{plan?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{plan?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{new Date(s.start_date).toLocaleDateString('en-GB')} - {new Date(s.end_date).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{s.payment_type}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
