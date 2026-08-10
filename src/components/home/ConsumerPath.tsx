import { Link } from 'react-router-dom'

const consumerSteps = [
    { step: '1', title: 'Connect with a business', desc: 'Find a participating business near you that issues MCOMVCard.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { step: '2', title: 'Receive your card / vCard', desc: 'The business issues you a card or vCard access link or invitation.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { step: '3', title: 'Create or sign in to MCOM', desc: 'Create an MCOM account or sign in — MCOM Central Authentication.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { step: '4', title: 'Enter MCOMVCard', desc: 'Your business + card relationship connects and you land in your dashboard.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
]

export default function ConsumerPath() {
    return (
        <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <p className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
                        What are you here for?
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        How you get into MCOMVCard
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
                        Businesses come to MCOMVCard directly to build and subscribe. Consumers get their card through a participating business — never by purchasing access.
                    </p>
                </div>

                {/* Two paths */}
                <div className="grid md:grid-cols-2 gap-5 mb-14">
                    <div className="rounded-3xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-500/5 p-7">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">I'm a Business</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                            Create your digital card, issue cards and vCards to your customers, and manage rewards, campaigns and bookings.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            Start Your Business
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-purple-100 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-500/5 p-7">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">I'm a Consumer</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                            MCOMVCard is provided through participating businesses. Connect with a business to receive your consumer card and access your MCOMVCard.
                        </p>
                        <Link
                            to="/find-a-business"
                            className="inline-block px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98]"
                        >
                            Find a Business
                        </Link>
                    </div>
                </div>

                {/* Consumer journey steps */}
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-7 md:p-9">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">The consumer journey</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {consumerSteps.map((s, i) => (
                            <div key={s.step} className="relative">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-extrabold">{s.step}</span>
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{s.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                                </div>
                                {i < consumerSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-gray-300 dark:text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
                        Already have a card or invitation? <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Sign in</Link> or{' '}
                        <Link to="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">create your MCOM account</Link>.
                    </p>
                </div>
            </div>
        </section>
    )
}
