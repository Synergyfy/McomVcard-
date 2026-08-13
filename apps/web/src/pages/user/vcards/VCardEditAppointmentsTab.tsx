import { useState } from 'react'

interface TimeSlot {
  id: string
  start: string
  end: string
}

interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

type AppointmentType = 'free' | 'paid'

const initialSchedule: Record<string, DaySchedule> = {
  Monday: { enabled: false, slots: [{ id: 'm1', start: '12:00', end: '12:15' }] },
  Tuesday: { enabled: false, slots: [{ id: 't1', start: '12:00', end: '12:15' }] },
  Wednesday: { enabled: false, slots: [{ id: 'w1', start: '12:00', end: '12:15' }] },
  Thursday: { enabled: false, slots: [{ id: 'th1', start: '12:00', end: '12:15' }] },
  Friday: { enabled: false, slots: [{ id: 'f1', start: '12:00', end: '12:15' }] },
  Saturday: { enabled: false, slots: [{ id: 's1', start: '12:00', end: '12:15' }] },
  Sunday: { enabled: false, slots: [{ id: 'su1', start: '12:00', end: '12:15' }] },
}

const timeOptions = (() => {
  const times: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      times.push(`${hh}:${mm}`)
    }
  }
  return times
})()

const format12h = (time24: string) => {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function VCardEditAppointmentsTab() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(initialSchedule)
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('free')
  const [paidPrice, setPaidPrice] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    })
  }

  const addSlot = (day: string) => {
    const newSlot: TimeSlot = { id: `${day[0]}${Date.now()}`, start: '12:00', end: '12:15' }
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], slots: [...schedule[day].slots, newSlot] },
    })
  }

  const removeSlot = (day: string, slotId: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], slots: schedule[day].slots.filter((s) => s.id !== slotId) },
    })
  }

  const updateSlot = (day: string, slotId: string, field: 'start' | 'end', value: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.map((s) => s.id === slotId ? { ...s, [field]: value } : s),
      },
    })
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <div>
      {saved && (
        <div className="mb-5 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Appointment settings saved!
        </div>
      )}

      {/* Day Schedules */}
      <div className="space-y-0">
        {Object.entries(schedule).map(([day, config]) => (
          <div key={day} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${config.enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
            {/* Checkbox + Day Name */}
            <div className="flex items-center gap-3 min-w-[180px]">
              <input type="checkbox" checked={config.enabled} onChange={() => toggleDay(day)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${config.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{day}</span>
            </div>

            {/* Time Slots */}
            {config.enabled ? (
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {config.slots.map((slot, idx) => (
                  <div key={slot.id} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-gray-300 dark:text-gray-600 text-xs hidden sm:inline">or</span>}
                    <select value={slot.start} onChange={(e) => updateSlot(day, slot.id, 'start', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[130px]">
                      {timeOptions.map((t) => <option key={t} value={t}>{format12h(t)}</option>)}
                    </select>
                    <span className="text-xs text-gray-400 font-medium">To</span>
                    <select value={slot.end} onChange={(e) => updateSlot(day, slot.id, 'end', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[130px]">
                      {timeOptions.map((t) => <option key={t} value={t}>{format12h(t)}</option>)}
                    </select>
                    <button onClick={() => removeSlot(day, slot.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete slot">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Add Slot Button */}
            {config.enabled && (
              <button onClick={() => addSlot(day)}
                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors shrink-0" title="Add time slot">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Appointment Type */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Appointment Type :</h3>
        <div className="flex gap-3 mb-4">
          <button onClick={() => setAppointmentType('free')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${appointmentType === 'free' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            Free
          </button>
          <button onClick={() => setAppointmentType('paid')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${appointmentType === 'paid' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            Paid
          </button>
        </div>

        {appointmentType === 'paid' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 dark:text-gray-300">Price:</label>
              <div className="flex items-center gap-1">
                <span className="px-2 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-lg text-sm text-gray-500">$</span>
                <input type="number" value={paidPrice} onChange={(e) => setPaidPrice(e.target.value)} placeholder="0.00" min="0" step="0.01"
                  className="w-32 px-3 py-2 rounded-r-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <textarea rows={2} placeholder="Add a note about your paid appointment (optional)..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-5 border-t border-gray-100 dark:border-gray-700">
        <button onClick={handleSave} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 dark:shadow-none">
          Save
        </button>
        <button className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Discard
        </button>
      </div>
    </div>
  )
}
