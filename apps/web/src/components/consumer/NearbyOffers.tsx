import { Link } from 'react-router-dom'
import type { NearbyOffer } from '../../services/mockData'

interface NearbyOffersProps {
    offers: NearbyOffer[]
}

export default function NearbyOffers({ offers }: NearbyOffersProps) {
    return (
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Near You</h2>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Current location
                </span>
            </div>

            {offers.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No nearby offers right now</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back soon or explore offers from your connected businesses.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {offers.map((offer) => (
                        <Link
                            key={offer.id}
                            to="/c/rewards"
                            className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors active:scale-[0.99]"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${offer.gradient} flex items-center justify-center text-white shrink-0 shadow-md`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={offer.icon} />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{offer.business}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{offer.offer}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-accent-500">{offer.discount}</p>
                                <p className="text-[11px] text-gray-400">{offer.distance}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}
