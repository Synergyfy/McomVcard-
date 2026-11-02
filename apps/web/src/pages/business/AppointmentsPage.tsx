import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import BottomSheet from '../../components/business/primitives/BottomSheet'
import InfoTooltip from '../../components/common/InfoTooltip'
import { businessService, type AppointmentItem, type Business, type BusinessService } from '../../services/businessApi'

type Filter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' },
]
const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', confirmed: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
}
const AVATARS = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500']
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const todayIso = () => new Date().toISOString().slice(0, 10)
const toDisplayTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return t
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`
}

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [paidOnly, setPaidOnly] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<BusinessService[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [form, setForm] = useState({ customer: '', email: '', phone: '', serviceId: '', date: todayIso(), time: '10:00', paid: false })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const businesses = await businessService.getMyBusinesses()
        const first = businesses[0] ?? null
        if (cancelled) return
        setBusiness(first)
        if (first) {
          const [list, svc] = await Promise.all([businessService.getAppointments(first.id), businessService.getServices(first.id)])
          if (!cancelled) { setAppointments(list); setServices(svc) }
        }
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const list = useMemo(() => appointments.filter((a) => (filter === 'all' || a.status === filter) && (!paidOnly || a.is_paid)), [appointments, filter, paidOnly])

  const togglePaid = async (a: AppointmentItem) => {
    const updated = await businessService.updateAppointmentStatus(a.id, { status: a.status, is_paid: !a.is_paid })
    if (!updated) { toast.error('Could not update payment status'); return }
    setAppointments((prev) => prev.map((x) => x.id === a.id ? updated : x))
    toast.success(updated.is_paid ? 'Appointment marked as paid' : 'Appointment marked as unpaid')
  }

  const advanceStatus = async (a: AppointmentItem) => {
    const next: AppointmentItem['status'] = a.status === 'pending' ? 'confirmed' : a.status === 'confirmed' ? 'completed' : a.status
    if (next === a.status) return
    const updated = await businessService.updateAppointmentStatus(a.id, { status: next })
    if (!updated) { toast.error('Could not update appointment'); return }
    setAppointments((prev) => prev.map((x) => x.id === a.id ? updated : x))
    toast.success(`Appointment ${next}`)
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.customer.trim()) next.customer = 'Customer name is required.'
    else if (form.customer.trim().length < 2) next.customer = 'Customer name must be at least 2 characters.'
    if (!form.email.trim()) next.email = 'Customer email is required to send the booking confirmation.'
    else if (!emailRe.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.date) next.date = 'Choose the appointment date.'
    else if (form.date < todayIso()) next.date = 'The appointment date cannot be in the past.'
    if (!form.time) next.time = 'Choose the appointment time.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const resetForm = () => {
    setForm({ customer: '', email: '', phone: '', serviceId: '', date: todayIso(), time: '10:00', paid: false })
    setErrors({}); setShowBooking(false)
  }

  const handleCreate = async () => {
    if (!business) { toast.error('Create your business profile first.'); return }
    if (!validate()) return
    setSaving(true)
    try {
      const created = await businessService.createAppointment(business.id, {
        customer_name: form.customer.trim(), customer_email: form.email.trim(),
        customer_phone: form.phone.trim() || undefined, date: form.date, start_time: form.time,
        service_id: form.serviceId || undefined, is_paid: form.paid,
      })
      if (!created) { toast.error('Could not create the booking. Check your availability and booking rules.'); return }
      setAppointments((prev) => [created, ...prev])
      toast.success(`Booking added for ${created.customer_name}`)
      resetForm()
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full px-3.5 py-3 min-h-[46px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500'

  return (
    <div className="space-y-6 animate-fadeIn">
      <Helmet><title>Appointments - MCOMVCard</title></Helmet>
      <div className="flex items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Today's schedule at a glance.</p></div>
        <button onClick={() => setShowBooking(true)} className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md">+ New Booking</button>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
        {filters.map((f) => <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key} className={`shrink-0 px-3.5 py-2 min-h-[40px] rounded-full text-xs font-semibold transition-colors ${filter === f.key ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{f.label}</button>)}
      </div>

      <label className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Paid appointments only</span>
        <button type="button" onClick={() => setPaidOnly((v) => !v)} aria-pressed={paidOnly} className={`w-11 h-6 rounded-full transition-colors ${paidOnly ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}><span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${paidOnly ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
      </label>

      <div className="space-y-3">
        {loading && <p className="text-center text-sm text-gray-400 py-8">Loading appointments…</p>}
        {!loading && list.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No appointments match this filter.</p>}
        {list.map((a, index) => (
          <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full ${AVATARS[index % AVATARS.length]} text-white flex items-center justify-center text-sm font-bold shrink-0`}>{a.customer_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.customer_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.service?.name || 'General booking'} · {new Date(`${a.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {toDisplayTime(a.start_time)}</p>
                <p className="text-[11px] text-gray-400 truncate">{a.customer_email}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[a.status] ?? statusStyles.pending}`}>{a.status}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => togglePaid(a)} className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold ${a.is_paid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{a.is_paid ? 'Paid' : 'Mark Paid'}</button>
              {a.status !== 'cancelled' && a.status !== 'completed' && <button onClick={() => advanceStatus(a)} className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold">{a.status === 'confirmed' ? 'Complete' : 'Confirm'}</button>}
            </div>
          </div>
        ))}
      </div>

      <BottomSheet open={showBooking} onClose={resetForm} title="New Booking">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">Customer name<InfoTooltip text="The name shown on the booking, appointment list and customer record." /></label>
            <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Jane Smith" aria-invalid={!!errors.customer} className={inputCls} />
            {errors.customer && <p className="mt-1 text-[11px] text-red-500">{errors.customer}</p>}
          </div>
          <div>
            <label className="mb-1.5 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">Customer email<InfoTooltip text="Used to send the booking confirmation and match this customer across appointments, reviews and shares." /></label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" aria-invalid={!!errors.email} className={inputCls} />
            {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">Phone (optional)<InfoTooltip text="Optional contact number for appointment reminders." /></label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+44 7700 900123" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">Service<InfoTooltip text="Pick one of your configured services. Its duration determines the appointment end time." /></label>
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className={inputCls}><option value="">General booking (no service)</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}{s.duration ? ` · ${s.duration} min` : ''}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">Date<InfoTooltip text="Appointment date. It must fall inside your booking window and availability." /></label>
              <input type="date" value={form.date} min={todayIso()} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-invalid={!!errors.date} className={inputCls} />
              {errors.date && <p className="mt-1 text-[11px] text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label className="mb-1.5 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">Time<InfoTooltip text="Start time (24-hour). The end time is calculated from the service duration." /></label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} aria-invalid={!!errors.time} className={inputCls} />
              {errors.time && <p className="mt-1 text-[11px] text-red-500">{errors.time}</p>}
            </div>
          </div>
          <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <span className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">Payment received<InfoTooltip text="Marks the booking as paid so it appears under the paid appointments filter." /></span>
            <button type="button" onClick={() => setForm({ ...form, paid: !form.paid })} aria-pressed={form.paid} className={`w-11 h-6 rounded-full transition-colors ${form.paid ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}><span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${form.paid ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={resetForm} className="flex-1 py-3 min-h-[46px] rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 min-h-[46px] rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md disabled:opacity-50">{saving ? 'Adding…' : 'Add Booking'}</button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
