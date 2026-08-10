import { useState } from 'react'

interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

const defaultSchedule: DaySchedule = { enabled: true, start: '09:00', end: '17:00' }

const initialHours: Record<string, DaySchedule> = {
  Monday: { ...defaultSchedule },
  Tuesday: { ...defaultSchedule },
  Wednesday: { ...defaultSchedule },
  Thursday: { ...defaultSchedule },
  Friday: { ...defaultSchedule },
  Saturday: { enabled: false, start: '10:00', end: '14:00' },
  Sunday: { enabled: false, start: '10:00', end: '14:00' },
}

interface TabProps { onHoursChange?: (h: Record<string, DaySchedule>) => void; onFieldEdit?: (field: string) => void }

export default function VCardEditBusinessHoursTab({ onHoursChange, onFieldEdit }: TabProps) {
  const [hours, setHours] = useState<Record<string, DaySchedule>>(initialHours)
  const [saved, setSaved] = useState(false)

  const updateDay = (day: string, field: keyof DaySchedule, value: boolean | string) => {
    const next = { ...hours, [day]: { ...hours[day], [field]: value } }
    setHours(next)
    onHoursChange?.(next)
    onFieldEdit?.('hours')
    setSaved(false)
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Set your available hours. Customers will see these when booking appointments.</p>

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Business hours saved successfully!
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(hours).map(([day, schedule]) => (
          <div key={day} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${schedule.enabled ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
            <label className="flex items-center gap-3 min-w-[140px]">
              <div className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${schedule.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => updateDay(day, 'enabled', !schedule.enabled)}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${schedule.enabled ? 'translate-x-4' : ''}`} />
              </div>
              <span className={`text-sm font-medium ${schedule.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{day}</span>
            </label>

            {schedule.enabled ? (
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Open</label>
                  <input type="time" value={schedule.start} onChange={(e) => updateDay(day, 'start', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <span className="text-gray-400 mt-4">—</span>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Close</label>
                  <input type="time" value={schedule.end} onChange={(e) => updateDay(day, 'end', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {(() => {
                    const [sh, sm] = schedule.start.split(':').map(Number)
                    const [eh, em] = schedule.end.split(':').map(Number)
                    const hrs = (eh * 60 + em - sh * 60 - sm) / 60
                    return `${hrs}h`
                  })()}
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">Closed</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button onClick={handleSave} className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
          Save Business Hours
        </button>
      </div>
    </div>
  )
}
