import { Link } from 'react-router-dom'

export default function VCardSection() {
    return (
        <Link to="/consumer/vcard" className="block group">
            <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-3xl p-5 shadow-lg shadow-accent-500/20 transition-transform active:scale-[0.98]">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border border-white/25">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-bold leading-tight">Consumer VCard</p>
                            <p className="text-white/75 text-xs mt-0.5 leading-snug">Your digital identity — Share · Exchange · Redeem · QR</p>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-white/80 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}
