import { useEffect, useState } from 'react'
import { consumerService } from '../../../services/consumer'
import type { NearbyOffer } from '../../../services/mockData'

export default function NearbyOffers() {
    const [offers, setOffers] = useState<NearbyOffer[]>([])

    useEffect(() => {
        consumerService.getNearbyOffers().then(setOffers)
    }, [])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Near You</h2>
                <span className="text-xs text-gray-400">Local rewards</span>
            </div>
            <div className="space-y-3">
                {offers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${offer.gradient} flex items-center justify-center text-white shrink-0`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={offer.icon} />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{offer.business}</p>
                            <p className="text-xs text-gray-500 truncate">{offer.offer}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-accent-500">{offer.discount}</p>
                            <p className="text-[10px] text-gray-400">{offer.distance}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}