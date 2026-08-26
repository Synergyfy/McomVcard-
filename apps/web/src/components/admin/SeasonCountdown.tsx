import { useEffect, useState } from 'react'
import { loadSeasons, activeSeason, splitSeasonIds, type Season } from '../../services/catalogStore'

/* ------------------------------------------------------------------ */
/*  Season countdown — a live D : H : M : S countdown to the end of    */
/*  the currently-active season. Used by the card previews and the     */
/*  vcard phone preview. Renders nothing when no assigned season is    */
/*  active (unless showIdle is set).                                   */
/* ------------------------------------------------------------------ */

function diffParts(target: number, now: number) {
  const ms = Math.max(0, target - now)
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  }
}

export function SeasonCountdown({ seasonIds, label, color, size = 'sm', showIdle = false }: {
  seasonIds: string
  label?: string
  color?: string
  size?: 'xs' | 'sm'
  showIdle?: boolean
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const active = activeSeason(splitSeasonIds(seasonIds), new Date(now))
  if (!active) {
    if (!showIdle) return null
    return (
      <div className={`w-full flex items-center justify-center gap-1 ${size === 'xs' ? 'text-[7px]' : 'text-[10px]'} text-gray-400`}>
        No active season
      </div>
    )
  }

  const { days, hours, minutes, seconds } = diffParts(new Date(active.endDate).getTime(), now)
  const cells = [
    { v: days, l: 'd' },
    { v: hours, l: 'h' },
    { v: minutes, l: 'm' },
    { v: seconds, l: 's' },
  ]
  const accent = color || '#F97316'

  return (
    <div className="w-full">
      {label && (
        <p className={`truncate font-semibold ${size === 'xs' ? 'text-[6.5px]' : 'text-[9px]'}`} style={{ color: accent }}>
          {label}
        </p>
      )}
      <div className="flex items-center gap-0.5 mt-0.5">
        {cells.map((c, i) => (
          <span key={c.l} className="flex items-center gap-0.5">
            <span
              className={`rounded-[2px] font-mono font-bold text-white flex items-center justify-center ${size === 'xs' ? 'w-4 h-3.5 text-[7px]' : 'w-6 h-5 text-[10px]'}`}
              style={{ backgroundColor: accent }}
            >
              {String(c.v).padStart(2, '0')}
            </span>
            <span className={`${size === 'xs' ? 'text-[6px]' : 'text-[8px]'} text-current opacity-60`}>{c.l}</span>
            {i < cells.length - 1 && <span className="mx-0.5 opacity-40">:</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Countdown section editor — used by the card and vcard builders.    */
/*  Lets the admin pick which seasons drive the countdown, plus a      */
/*  label and accent colour, with a live mini preview.                 */
/* ------------------------------------------------------------------ */

export function CountdownSectionBody({ values, setValue }: {
  values: Record<string, string>
  setValue: (key: string, value: string) => void
}) {
  const seasons = loadSeasons()
  const selected = splitSeasonIds(values.seasonIds)

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    setValue('seasonIds', next.join(','))
  }

  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Seasons to count down</label>
        {seasons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 dark:border-gray-600 px-3 py-2 text-[10px] text-gray-400">
            No seasons yet — create one under{' '}
            <span className="font-semibold text-orange-500">Settings → Seasons</span> to enable a countdown.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {seasons.map(s => {
              const on = selected.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  title={s.description || `${s.name} · ${new Date(s.startDate).toLocaleDateString()} → ${new Date(s.endDate).toLocaleDateString()}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${on ? 'text-white border-transparent' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}
                  style={on ? { backgroundColor: s.color } : undefined}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: on ? '#fff' : s.color }} />
                  {s.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Label (optional)</label>
        <input
          type="text"
          value={values.label ?? ''}
          onChange={e => setValue('label', e.target.value)}
          placeholder="e.g. Season ends in"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Accent colour</label>
          <input type="color" value={values.color || '#F97316'} onChange={e => setValue('color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-3">
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Live preview</label>
          <div className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-2">
            <SeasonCountdown seasonIds={values.seasonIds ?? ''} label={values.label || 'Season ends in'} color={values.color || '#F97316'} size="sm" showIdle />
          </div>
          <p className="text-[9px] text-gray-400 mt-1.5">Countdown appears only while one of the selected seasons is active.</p>
        </div>
      )}
    </div>
  )
}

/* Resolve a stored season id list into Season objects for display. */
export function resolveSeasons(ids: string[]): Season[] {
  const all = loadSeasons()
  return ids.map(id => all.find(s => s.id === id)).filter((s): s is Season => Boolean(s))
}
