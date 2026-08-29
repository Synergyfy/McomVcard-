import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockTemplates } from '../../services/mockData'
import { MembershipLimitCard } from '../../components/membership/MembershipLimitCard'
import { loadMembershipPricing } from '../../services/membershipPricingStore'
import { getRuleValue, parseLimit } from '../../services/membershipEnforcement'

const MOCK_CLAIMED_TEMPLATE_IDS = ['1', '4', '9', '13']
const CONSUMER_PLAN: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze'

export default function ConsumerVCardTemplatesPage() {
  const pricingState = useMemo(() => loadMembershipPricing(), [])
  const claimedTemplates = mockTemplates.filter((t) => MOCK_CLAIMED_TEMPLATE_IDS.includes(t.id))
  const conVCardLimit = parseLimit(getRuleValue(pricingState, CONSUMER_PLAN, 'Consumer VCards'))
  const atLimit = conVCardLimit !== null && conVCardLimit !== Infinity && claimedTemplates.length >= conVCardLimit

  return (
    <div>
      <Helmet><title>My vCards - Consumer - MCOM VCard</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My vCards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{claimedTemplates.length} templates claimed</p>
        </div>
        {atLimit ? (
          <span className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed" title={`Your ${CONSUMER_PLAN} membership allows ${getRuleValue(pricingState, CONSUMER_PLAN, 'Consumer VCards')} Consumer VCards`}>
            Limit reached
          </span>
        ) : (
          <Link to="/templates" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Get Template
          </Link>
        )}
      </div>

      <div className="mb-6">
        <MembershipLimitCard label="Consumer VCards" used={claimedTemplates.length} planLevel={CONSUMER_PLAN} context="consumer" />
      </div>

      {claimedTemplates.length ? (
        <div className="space-y-6">
          {claimedTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
                  <div className="w-full max-w-[280px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={template.template_url}
                        alt={template.name}
                        className="w-full transition-transform duration-[8000ms] ease-linear hover:translate-y-[-52%]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="#f3f4f6" width="400" height="600"/><text fill="#9ca3af" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">${template.name}</text></svg>`)}`
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-xs font-semibold capitalize">{template.category}</p>
                        <p className="text-white/70 text-[10px]">{template.font_family}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{template.category} Template</h2>
                        <p className="text-xs text-gray-500">{template.font_family} · {template.button_style} buttons · {template.bg_style} bg</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Primary Color</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: template.primary_color }} />
                          <p className="text-gray-900 dark:text-white font-medium">{template.primary_color}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Secondary Color</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: template.secondary_color }} />
                          <p className="text-gray-900 dark:text-white font-medium">{template.secondary_color}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Logo Position</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5 capitalize">{template.logo_position}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Sections</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{Object.values(template.sections).filter(Boolean).length} enabled</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link to={`/c/vcard-templates/${template.id}/edit`} className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
                      Edit vCard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No vCards Yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose a template to create your digital vCard</p>
          <Link to="/templates" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 dark:shadow-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Get Template
          </Link>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/templates" className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Browse More Templates
        </Link>
      </div>
    </div>
  )
}