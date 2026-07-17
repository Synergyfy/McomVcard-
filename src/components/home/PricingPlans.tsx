import { useTranslation } from 'react-i18next'
import { mockPlans, mockCurrencies } from '../../services/mockData'
import type { Plan } from '../../types'

interface PricingPlansProps {
  plans?: Plan[]
}

const PLAN_FEATURES_KEYS: (keyof import('../../types').PlanFeature)[] = [
  'products_services', 'testimonials', 'hide_branding', 'enquiry_form',
  'social_links', 'password', 'custom_css', 'custom_js', 'custom_fonts',
  'products', 'appointments', 'gallery', 'analytics', 'seo', 'blog',
  'affiliation', 'custom_qrcode',
]

export default function PricingPlans({ plans }: PricingPlansProps) {
  const { t } = useTranslation()

  const activePlans = (plans && plans.length > 0 ? plans : mockPlans.filter((p) => p.status === 1))

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {activePlans.map((plan) => {
            const currency = plan.currency || mockCurrencies.find((c) => c.id === plan.currency_id) || mockCurrencies[0]
            const symbol = currency?.currency_icon || '£'
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 border-2 transition-shadow hover:shadow-lg ${
                  plan.is_default ? 'border-blue-500 shadow-md relative' : 'border-gray-200'
                }`}
              >
                {plan.is_default ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    {t('pricing.free')}
                  </span>
                ) : null}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? t('pricing.free') : `${symbol}${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 text-sm ml-1">
                      {plan.frequency === 2 ? t('pricing.per_year') : t('pricing.per_month')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {t('pricing.no_of_vcards', { count: plan.no_of_vcards })}
                </p>
                {plan.trial_days > 0 && (
                  <p className="text-xs text-blue-600 mb-4">
                    {t('pricing.trial_days', { days: plan.trial_days })}
                  </p>
                )}
                <ul className="space-y-3 mb-8">
                  {PLAN_FEATURES_KEYS.map((key) => {
                    const enabled = plan.plan_feature?.[key]
                    return (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        {enabled ? (
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={enabled ? 'text-gray-700' : 'text-gray-400 line-through'}>
                          {t(`pricing.features.${key}`)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                  plan.is_default
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}>
                  {plan.is_default ? t('pricing.current_plan') : t('pricing.get_started')}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
