/* ------------------------------------------------------------------ */
/*  Four Core Activities — Henry's framing: business owners use cards  */
/*  mainly to Share, Exchange, Redeem and Build Groups. Each activity  */
/*  maps to a builder section id (schemaId). The panel lets admins     */
/*  switch each activity on/off at a glance in either builder.         */
/* ------------------------------------------------------------------ */

export interface CoreActivity {
  id: string
  name: string
  icon: string
  desc: string
}

export const CORE_ACTIVITIES: CoreActivity[] = [
  {
    id: 'share',
    name: 'Share',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    desc: 'Save contact, download vCard and share the card',
  },
  {
    id: 'exchange',
    name: 'Exchange',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    desc: 'Swap contact details with a tap or QR scan',
  },
  {
    id: 'redeem',
    name: 'Redeem',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Redeem points, offers, coupons and rewards',
  },
  {
    id: 'buildGroup',
    name: 'Build Groups',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    desc: 'Invite members and grow a group or community',
  },
]

export function CoreActivitiesPanel({ activities, onToggle, compact = false }: {
  activities: { id: string; enabled: boolean }[]
  onToggle: (id: string, enabled: boolean) => void
  compact?: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className="text-[11px] font-bold text-gray-800 dark:text-white">Four Core Activities</p>
          <p className="text-[9px] text-gray-400">Share · Exchange · Redeem · Build Groups</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CORE_ACTIVITIES.map(act => {
          const entry = activities.find(a => a.id === act.id)
          const enabled = entry?.enabled ?? false
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onToggle(act.id, !enabled)}
              className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${enabled
                ? 'border-orange-200 dark:border-orange-500/40 bg-orange-50/70 dark:bg-orange-500/10'
                : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30 hover:border-orange-300'}`}
              title={act.desc}
            >
              <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${enabled ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={act.icon} /></svg>
              </span>
              <span className="min-w-0">
                <span className={`block text-[10px] font-semibold ${enabled ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {act.name}
                </span>
                {!compact && <span className="block text-[8px] text-gray-400 leading-snug">{act.desc}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
