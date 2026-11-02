import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { adminService } from '../../services/admin'

interface AdminNotification {
  id: string
  text: string
  time: string
  type: string
  link: string
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard', '/admin/businesses': 'Businesses', '/admin/consumers': 'Consumers',
  '/admin/vcards': 'VCards', '/admin/cards': 'Cards', '/admin/plans': 'Pricing & Membership',
  '/admin/access-passes': 'Access Passes',
  '/admin/membership/pricing': 'Pricing & Plans', '/admin/membership/memberships': 'Memberships',
  '/admin/content-sharing': 'Content & Sharing', '/admin/integrations': 'Integrations',
  '/admin/analytics': 'Reports & Analytics', '/admin/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(pageTitles)) if (pathname.startsWith(prefix)) return title
  return 'Dashboard'
}

function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return ''
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function notificationLink(type: string): string {
  if (type === 'business') return '/admin/businesses'
  if (type === 'card' || type === 'vcard') return '/admin/cards'
  if (type === 'membership') return '/admin/membership/memberships'
  return '/admin/activity-logs'
}

export default function AdminHeader() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
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

  useEffect(() => {
    let cancelled = false
    adminService.getActivityLogs({ page: 1, limit: 6, order: 'DESC' })
      .then((res: any) => {
        if (cancelled) return
        const rows = Array.isArray(res?.data) ? res.data : []
        setNotifications(rows.map((entry: any) => ({
          id: String(entry.id),
          text: entry.title || entry.action || entry.description || 'Platform activity',
          time: relativeTime(entry.created_at ?? entry.createdAt),
          type: entry.type || 'activity',
          link: notificationLink(entry.type || ''),
        })))
      })
      .catch(() => { if (!cancelled) setNotifications([]) })
    return () => { cancelled = true }
  }, [])

  const notifCount = notifications.length
  const initial = admin?.name ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{getPageTitle(location.pathname)}</h1>
      <div className="flex items-center gap-2">
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} aria-label="Admin notifications" className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{notifCount}</span>}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                <span className="text-[10px] text-gray-400">{notifCount} recent</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? <p className="px-4 py-6 text-center text-sm text-gray-400">No activity yet.</p> : notifications.map((n) => (
                  <Link key={n.id} to={n.link} onClick={() => setNotifOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-orange-500" />
                    <div className="flex-1 min-w-0"><p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p><p className="text-xs text-gray-400 mt-0.5">{n.time}</p></div>
                  </Link>
                ))}
              </div>
              <Link to="/admin/activity-logs" onClick={() => setNotifOpen(false)} className="block px-4 py-2.5 text-sm text-center text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/5 rounded-b-xl font-medium">View All Activity</Link>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">{initial}</div>
            <div className="hidden sm:block text-left"><p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">{admin?.name || 'Administrator'}</p><p className="text-xs text-gray-400 leading-tight">Administrator</p></div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700"><p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.name || 'Administrator'}</p><p className="text-xs text-gray-400">{admin?.email || ''}</p></div>
              <Link to="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Admin Settings</Link>
              <Link to="/admin/activity-logs" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Activity Log</Link>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left">Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
