import { Link } from 'react-router-dom'

export default function ConsumerPathNote() {
    return (
        <div className="mb-6 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 p-4">
            <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </span>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Are you a consumer?</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        MCOMVCard is provided through participating businesses. Connect with a participating business to receive your consumer card and access your MCOMVCard.
                    </p>
                    <Link
                        to="/find-a-business"
                        className="inline-flex items-center gap-1 mt-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                        Find a Business
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
