import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import UserMoreSheet from './UserMoreSheet'

interface NavSlot {
    to: string
    label: string
    icon: string
    end?: boolean
}

const mainSlots: NavSlot[] = [
    { to: '/b/dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
    { to: '/user/vcards', label: 'VCards', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0' },
    { to: '/user/cards', label: 'Cards', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { to: '/user/appointments', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
]

export default function UserBottomNav() {
    const [moreOpen, setMoreOpen] = useState(false)

    const moreSlot = (
        <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 min-h-[44px] text-gray-500 dark:text-gray-400"
            aria-label="More"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h.01M15 12h.01M12 12h.01M12 5.5h.01M12 18.5h.01" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">More</span>
        </button>
    )

    const genericSlot = (slot: NavSlot) => (
        <NavLink
            key={slot.to}
            to={slot.to}
            end={slot.end}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
                }`
            }
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={slot.icon} />
            </svg>
            <span className="text-[10px] font-semibold leading-none">{slot.label}</span>
        </NavLink>
    )

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
                <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
                    {mainSlots.map(genericSlot)}
                    {moreSlot}
                </div>
            </nav>
            <UserMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
        </>
    )
}
