import { useState, type ReactNode } from 'react'
import type { AppointmentSettings } from '../../../services/businessVCardEditorStore'

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

const APPOINTMENT_ICON = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function InfoNote({ tone, children }: { tone: 'blue' | 'amber' | 'green'; children: ReactNode }) {
  const styles = {
    blue: 'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
    amber: 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
    green: 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300',
  }
  return (
    <div className={`rounded-lg border px-2.5 py-2 text-[9px] leading-relaxed ${styles[tone]}`}>
      {children}
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">{children}</label>
}

function NumInput({ label, value, onChange, min = 0, suffix }: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  suffix?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <input
          type="number"
          min={min}
          value={value}
          onChange={e => onChange(Math.max(min, Number(e.target.value) || 0))}
          className={inputCls}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">{suffix}</span>}
      </div>
    </div>
  )
}

const newId = () => Date.now() + Math.floor(Math.random() * 1000)

export default function AppointmentSettingsPanel({ settings, onChange }: {
  settings: AppointmentSettings
  onChange: (s: AppointmentSettings) => void
}) {
  const [open, setOpen] = useState(false)

  const patch = (p: Partial<AppointmentSettings>) => onChange({ ...settings, ...p })

  const setSlot = (i: number, p: Partial<AppointmentSettings['slots'][number]>) =>
    patch({ slots: settings.slots.map((s, j) => (j === i ? { ...s, ...p } : s)) })

  const removeSlot = (i: number) => patch({ slots: settings.slots.filter((_, j) => j !== i) })

  const addSlot = () =>
    patch({ slots: [...settings.slots, { id: newId(), day: 'Monday', from: '09:00', to: '17:00', closed: false }] })

  const setService = (i: number, p: Partial<AppointmentSettings['services'][number]>) =>
    patch({ services: settings.services.map((s, j) => (j === i ? { ...s, ...p } : s)) })

  const removeService = (i: number) => patch({ services: settings.services.filter((_, j) => j !== i) })

  const addService = () =>
    patch({ services: [...settings.services, { id: newId(), name: '', duration: 60, price: '' }] })

  const openDays = settings.slots.filter(s => !s.closed).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${settings.enabled ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={APPOINTMENT_ICON} /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">Appointment Booking</p>
          <p className="text-[9px] text-gray-400 truncate">
            {settings.enabled
              ? `Online${settings.phoneBooking ? ' + phone' : ''} · ${openDays} open days · ${settings.duration} min slots`
              : 'Booking is turned off on this VCard'}
          </p>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <Toggle on={settings.enabled} onClick={() => patch({ enabled: !settings.enabled })} />
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-3 space-y-3">
          <InfoNote tone="blue">
            <span className="font-semibold">Customers book straight from your VCard.</span>{' '}
            These settings power the <span className="font-semibold">Make an Appointment</span> section and the
            Share centre's <span className="font-semibold">Appointment link</span> item.
          </InfoNote>

          {!settings.enabled && (
            <InfoNote tone="amber">Appointment booking is currently hidden on the published VCard.</InfoNote>
          )}

          <div>
            <Label>External booking link <span className="text-gray-300 dark:text-gray-600">(optional — leave empty for built-in booking)</span></Label>
            <input className={inputCls} value={settings.bookingUrl} onChange={e => patch({ bookingUrl: e.target.value })}
              placeholder="https://calendly.com/… or your own booking page" />
          </div>

          <div>
            <Label>Booking channels</Label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => patch({ onlineBooking: !settings.onlineBooking })}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${settings.onlineBooking ? 'border-cyan-300 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-500/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${settings.onlineBooking ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300 dark:border-gray-500'}`}>
                  {settings.onlineBooking && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                <span className="flex-1 text-[10px] font-medium text-gray-700 dark:text-gray-200">Online booking</span>
              </button>
              <button type="button" onClick={() => patch({ phoneBooking: !settings.phoneBooking })}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${settings.phoneBooking ? 'border-cyan-300 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-500/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${settings.phoneBooking ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300 dark:border-gray-500'}`}>
                  {settings.phoneBooking && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                <span className="flex-1 text-[10px] font-medium text-gray-700 dark:text-gray-200">Phone booking</span>
              </button>
            </div>
            {settings.phoneBooking && (
              <div className="mt-2">
                <Label>Booking phone</Label>
                <input className={inputCls} value={settings.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+1 (555) 123-4567" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <NumInput label="Slot duration" value={settings.duration} onChange={v => patch({ duration: v })} min={5} suffix="min" />
            <NumInput label="Buffer between slots" value={settings.buffer} onChange={v => patch({ buffer: v })} min={0} suffix="min" />
            <NumInput label="Minimum lead time" value={settings.leadTime} onChange={v => patch({ leadTime: v })} min={0} suffix="hrs" />
            <NumInput label="Advance booking window" value={settings.advanceWindow} onChange={v => patch({ advanceWindow: v })} min={1} suffix="days" />
          </div>

          <div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2.5 py-2">
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">Require payment to confirm</span>
              <Toggle on={settings.requirePayment} onClick={() => patch({ requirePayment: !settings.requirePayment })} />
            </div>
            {settings.requirePayment && (
              <div className="mt-2">
                <Label>Payment note <span className="text-gray-300 dark:text-gray-600">(shown before checkout)</span></Label>
                <input className={inputCls} value={settings.paymentNote} onChange={e => patch({ paymentNote: e.target.value })} placeholder="A deposit of £20 secures your slot" />
              </div>
            )}
          </div>

          <div>
            <Label>Confirmation message <span className="text-gray-300 dark:text-gray-600">(customer sees after booking)</span></Label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={settings.confirmationMessage} onChange={e => patch({ confirmationMessage: e.target.value })} />
          </div>

          <div>
            <Label>Cancellation policy</Label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={settings.cancellationPolicy} onChange={e => patch({ cancellationPolicy: e.target.value })} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Weekly time slots</Label>
              <button type="button" onClick={addSlot}
                className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add slot
              </button>
            </div>
            <div className="space-y-2">
              {settings.slots.map((slot, i) => (
                <div key={slot.id} className="border border-cyan-100 dark:border-cyan-500/20 bg-white dark:bg-gray-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">{slot.day}</span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setSlot(i, { closed: !slot.closed })}
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${slot.closed ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
                        {slot.closed ? 'Closed' : 'Open'}
                      </button>
                      <button type="button" onClick={() => removeSlot(i)}
                        className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  {!slot.closed && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Opens</Label>
                        <input type="time" className={inputCls} value={slot.from} onChange={e => setSlot(i, { from: e.target.value })} />
                      </div>
                      <div>
                        <Label>Closes</Label>
                        <input type="time" className={inputCls} value={slot.to} onChange={e => setSlot(i, { to: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {settings.slots.length === 0 && (
                <p className="text-[9px] text-gray-400 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">No slots yet — add a weekly slot to start accepting bookings.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Services <span className="text-gray-300 dark:text-gray-600">(optional — what customers book)</span></Label>
              <button type="button" onClick={addService}
                className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add service
              </button>
            </div>
            <div className="space-y-2">
              {settings.services.map((svc, i) => (
                <div key={svc.id} className="border border-cyan-100 dark:border-cyan-500/20 bg-white dark:bg-gray-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Service {i + 1}</span>
                    <button type="button" onClick={() => removeService(i)}
                      className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label>Name</Label>
                      <input className={inputCls} value={svc.name} onChange={e => setService(i, { name: e.target.value })} placeholder="Hair styling" />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <div className="relative">
                        <input type="number" min={5} className={inputCls} value={svc.duration} onChange={e => setService(i, { duration: Math.max(5, Number(e.target.value) || 0) })} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">min</span>
                      </div>
                    </div>
                    <div>
                      <Label>Price</Label>
                      <input className={inputCls} value={svc.price} onChange={e => setService(i, { price: e.target.value })} placeholder="£45" />
                    </div>
                  </div>
                </div>
              ))}
              {settings.services.length === 0 && (
                <p className="text-[9px] text-gray-400 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">No services yet — customers will book a general slot.</p>
              )}
            </div>
          </div>

          <InfoNote tone="green">
            <span className="font-semibold">Tip:</span> share your booking link from the Share centre so customers can also book when they share your card.{' '}
            {settings.bookingUrl ? 'Your external link is active.' : 'No external link set — customers use the built-in booking flow.'}
          </InfoNote>
        </div>
      )}
    </div>
  )
}
