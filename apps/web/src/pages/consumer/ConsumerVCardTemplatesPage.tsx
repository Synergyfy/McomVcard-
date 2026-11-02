import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MembershipLimitCard } from '../../components/membership/MembershipLimitCard'
import { loadMembershipPricing } from '../../services/membershipPricingStore'
import { getRuleValue, parseLimit } from '../../services/membershipEnforcement'
import { consumerService, type ConsumerProfile, type SavedCard } from '../../services/consumer'
import { parseMembership } from '../../services/consumerMembership'
import ErrorState from '../../components/common/ErrorState'

export default function ConsumerVCardTemplatesPage() {
  const pricingState = useMemo(() => loadMembershipPricing(), [])
  const [profile, setProfile] = useState<ConsumerProfile | null>(null)
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    Promise.all([consumerService.getProfile(), consumerService.getSavedCards(1, 100)])
      .then(([p, c]) => {
        setProfile(p)
        setCards(c.filter((card) => String(card.audience || '').toUpperCase() === 'CONSUMER' || !card.audience))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>

  if (error || !profile) {
    return (
      <div>
        <Helmet><title>My vCards - Consumer - MCOM VCard</title></Helmet>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My vCards</h1>
        <div className="lg:max-w-2xl">
          <ErrorState title="We couldn't load your vCards" message="Please try again in a moment." onRetry={load} />
        </div>
      </div>
    )
  }

  const membershipLevel = parseMembership(profile.membership).level
  const conVCardLimit = parseLimit(getRuleValue(pricingState, membershipLevel, 'Consumer VCards'))
  const atLimit = conVCardLimit !== null && conVCardLimit !== Infinity && cards.length >= conVCardLimit

  return (
    <div>
      <Helmet><title>My vCards - Consumer - MCOM VCard</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My vCards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cards.length} {cards.length === 1 ? 'vCard' : 'vCards'}</p>
        </div>
        {atLimit ? (
          <span className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed" title={`Your ${membershipLevel} membership allows ${getRuleValue(pricingState, membershipLevel, 'Consumer VCards')} Consumer VCards`}>
            Limit reached
          </span>
        ) : (
          <Link to="/templates" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
            Get Template
          </Link>
        )}
      </div>

      <div className="mb-6">
        <MembershipLimitCard label="Consumer VCards" used={cards.length} planLevel={membershipLevel} context="consumer" />
      </div>

      {cards.length ? (
        <div className="space-y-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
                  <div className="w-full max-w-[280px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-5 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-white/70">MCOM VCard</p>
                        <p className="text-xl font-bold mt-2">{card.name}</p>
                        <p className="text-xs text-white/80 mt-1">{card.template || card.type}</p>
                        <p className="text-[10px] text-white/60 mt-4">{card.business}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-xs font-semibold capitalize">{card.type}</p>
                        <p className="text-white/70 text-[10px]">{card.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{card.name}</h2>
                        <p className="text-xs text-gray-500">{card.template || 'Your vCard'} · {card.type}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${card.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {card.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Issued by</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{card.business}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Source</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{card.source}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Views</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{card.views ?? 0}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Scans</span>
                        <p className="text-gray-900 dark:text-white font-medium mt-0.5">{card.scans ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link to={`/c/vcard-templates/${card.id}/edit`} className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
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
