import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const notifications = [
  { id: 1, text: 'New business registered: ABC Consulting', time: '5 min ago', type: 'business', link: '/admin/businesses' },
  { id: 2, text: 'New consumer registered: Emma Rodriguez', time: '12 min ago', type: 'consumer', link: '/admin/consumers' },
  { id: 3, text: 'Business VCard created for GreenLeaf Coffee', time: '28 min ago', type: 'vcard', link: '/admin/vcards/business' },
  { id: 4, text: 'Consumer VCard activated for James Chen', time: '1 hour ago', type: 'vcard', link: '/admin/vcards/consumer' },
  { id: 5, text: 'Card deactivated: TechVision Inc', time: '2 hours ago', type: 'card', link: '/admin/cards' },
  { id: 6, text: 'Membership plan changed for Pizza Roma', time: '3 hours ago', type: 'membership', link: '/admin/plans' },
]

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/businesses': 'Businesses',
  '/admin/consumers': 'Consumers',
  '/admin/vcards': 'VCards',
  '/admin/cards': 'Cards',
  '/admin/plans': 'Pricing & Membership',
  '/admin/membership/pricing': 'Pricing & Plans',
  '/admin/membership/memberships': 'Memberships',
  '/admin/content-sharing': 'Content & Sharing',
  '/admin/integrations': 'Integrations',
  '/admin/analytics': 'Reports & Analytics',
  '/admin/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(prefix)) return title
  }
  return 'Dashboard'
}

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount] = useState(notifications.length)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initial = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  return (
    <header className="h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        {getPageTitle(location.pathname)}
      </h1>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                <span className="text-[10px] text-gray-400">{notifCount} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link}
                    onClick={() => setNotifOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.type === 'business' ? 'bg-blue-500' :
                      n.type === 'consumer' ? 'bg-green-500' :
                      n.type === 'vcard' ? 'bg-purple-500' :
                      n.type === 'card' ? 'bg-orange-500' : 'bg-teal-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/admin/activity-logs"
                onClick={() => setNotifOpen(false)}
                className="block px-4 py-2.5 text-sm text-center text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/5 rounded-b-xl font-medium"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-400 leading-tight">Super Admin</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@vcardlink.com'}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                My Profile
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Security
              </Link>
              <Link
                to="/admin/activity-logs"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Activity Log
              </Link>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              <button
                onClick={() => { logout(); setProfileOpen(false); navigate('/admin/login') }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
