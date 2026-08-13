import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface SubMenuItem { to: string; label: string }
interface NavItem { to?: string; label: string; icon: string; end?: boolean; sub?: SubMenuItem[] }
interface NavGroup { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Businesses',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        sub: [
          { to: '/admin/businesses', label: 'Business List' },
        ],
      },
      {
        label: 'Consumers',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        sub: [
          { to: '/admin/consumers', label: 'Consumer List' },
        ],
      },
      {
        label: 'VCard Management',
        icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1',
        sub: [
          { to: '/admin/vcard-management/business-vcard-templates', label: 'Business VCard Templates' },
          { to: '/admin/vcard-management/consumer-vcard-templates', label: 'Consumer VCard Templates' },
          { to: '/admin/vcard-management/template-builder', label: 'VCard Template Builder' },
        ],
      },
      {
        label: 'Card Management',
        icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
        sub: [
          { to: '/admin/card-management/business-card-templates', label: 'Business Card Templates' },
          { to: '/admin/card-management/consumer-card-templates', label: 'Consumer Card Templates' },
          { to: '/admin/card-management/card-template-builder', label: 'Card Template Builder' },
        ],
      },
    ],
  },
  {
    label: 'Growth & Monetization',
    items: [
      {
        label: 'Membership & Pricing',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        sub: [
          { to: '/admin/membership/pricing', label: 'Pricing & Plans' },
          { to: '/admin/membership/memberships', label: 'Memberships' },
        ],
      },
      {
        label: 'QR Code Management',
        icon: 'M7 3a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7zM5 8h14M5 12h14M5 16h14M8 5v14m4-14v14m4-14v14',
        sub: [
          { to: '/admin/qr/dashboard', label: 'Dashboard' },
          { to: '/admin/qr/codes', label: 'Dynamic QR Codes' },
          { to: '/admin/qr/templates', label: 'QR Design System' },
          { to: '/admin/qr/routing', label: 'QR Routing Rules' },
          { to: '/admin/qr/analytics', label: 'QR Analytics' },
          { to: '/admin/qr/campaigns', label: 'QR Campaigns' },
          { to: '/admin/qr/assets', label: 'QR Assets & Downloads' },
          { to: '/admin/qr/activity', label: 'QR Activity' },
          { to: '/admin/qr/settings', label: 'QR Settings' },
        ],
      },
      {
        label: 'Integrations',
        icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512a9.025 9.025 0 015.488 5.488z',
        sub: [
          { to: '/admin/integrations', label: 'Integration Overview' },
          { to: '/admin/integrations/connected', label: 'Connected Platforms' },
          { to: '/admin/integrations/coming-soon', label: 'Coming Soon' },
          { to: '/admin/integration-activity', label: 'Integration Activity' },
        ],
      },
    ],
  },
  {
    label: 'Content & SEO',
    items: [
      {
        label: 'Landing Pages',
        icon: 'M3 17l6-6-6-6m8 12h10',
        sub: [
          { to: '/admin/landing/sliders', label: 'Hero Sliders' },
          { to: '/admin/landing/embeds', label: 'Content Embeds' },
          { to: '/admin/front-cms', label: 'Front CMS (Hero/About/FAQ)' },
          { to: '/admin/features', label: 'Features' },
        ],
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Activity & Audit',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        sub: [
          { to: '/admin/activity-logs', label: 'Activity Log' },
          { to: '/admin/audit-log', label: 'Admin Audit Log' },
          { to: '/admin/system-events', label: 'System Events' },
        ],
      },
      {
        label: 'Settings',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        sub: [
          { to: '/admin/settings', label: 'General Settings' },
          { to: '/admin/settings/sectors', label: 'Sectors' },
          { to: '/admin/settings/seasons', label: 'Seasons' },
          { to: '/admin/settings/vcards', label: 'VCard Settings' },
          { to: '/admin/settings/cards', label: 'Card Settings' },
          { to: '/admin/settings/membership', label: 'Membership Settings' },
          { to: '/admin/settings/allocation', label: 'Allocation Settings' },
          { to: '/admin/settings/qr', label: 'QR Settings' },
          { to: '/admin/settings/notifications', label: 'Notification Settings' },
          { to: '/admin/settings/integrations', label: 'Integration Settings' },
          { to: '/admin/roles', label: 'Admin Roles & Permissions' },
        ],
      },
    ],
  },
]

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const location = useLocation()

  const toggleMenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label))
  }

  useEffect(() => {
    const match = navGroups
      .flatMap(g => g.items)
      .find(item => item.sub && item.sub.some(s => location.pathname.startsWith(s.to.split('?')[0])))
    setOpenMenu(match ? match.label : null)
  }, [location.pathname])

  const isSubActive = (sub?: SubMenuItem[]) => {
    if (!sub) return false
    return sub.some((s) => location.pathname.startsWith(s.to.split('?')[0]))
  }

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Brand */}
      <div className={`px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
              M
            </div>
            <span className="font-bold text-[15px] tracking-tight text-gray-900 dark:text-white">
              MCOM<span className="text-orange-500"> VCard</span>
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                if (item.sub) {
                  const expanded = openMenu === item.label
                  const active = isSubActive(item.sub)
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => !collapsed && toggleMenu(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                        } ${collapsed ? 'justify-center px-0' : ''}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </>
                        )}
                      </button>
                      {!collapsed && expanded && (
                        <div className="mt-1 space-y-0.5">
                          {item.sub.map((sub) => (
                            <NavLink
                              key={sub.to + sub.label}
                              to={sub.to}
                              className={({ isActive: active }) =>
                                `block pl-[42px] pr-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  active
                                    ? 'text-orange-600 dark:text-orange-400 font-medium bg-orange-500/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <NavLink
                    key={item.to}
                    to={item.to!}
                    end={item.end}
                    className={({ isActive: active }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon!} />
                    </svg>
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Back to Site' : undefined}
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {!collapsed && <span>Back to Site</span>}
        </NavLink>
      </div>
    </aside>
  )
}
