import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import {
    businessService,
    type CustomerDetail,
    type CustomerNoteItem,
} from '../../services/businessApi'
import { avatarColorFor, initialsOf } from './CustomersPage'

/* ── Presentation helpers ────────────────────────────────────────── */

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
        return '—'
    }
}

function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) return '—'
    try {
        const d = new Date(iso)
        return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    } catch {
        return '—'
    }
}

const ACTIVITY_ICONS: Record<string, string> = {
    reward: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    purchase: 'M3 10h18M7 15h3m-5-7a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V8z',
    exchange: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    redemption: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    appointment: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    note: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
}

const TABS = ['Membership', 'Appointments', 'Activity', 'Reviews', 'Notes'] as const

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

export default function BusinessCustomerDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    // The route param is the URL-encoded customer email — customers are keyed by email.
    let email = ''
    try {
        email = decodeURIComponent(id ?? '').toLowerCase().trim()
    } catch {
        email = (id ?? '').toLowerCase().trim()
    }

    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [detail, setDetail] = useState<CustomerDetail | null>(null)

    /* Notes editing state */
    const [noteText, setNoteText] = useState('')
    const [savingNote, setSavingNote] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')

    const [tab, setTab] = useState<(typeof TABS)[number]>('Membership')

    useEffect(() => {
        if (!email) return
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const d = await businessService.getCustomerDetail(email)
                if (cancelled) return
                setDetail(d)
                setNotFound(!d)
            } catch {
                if (!cancelled) setNotFound(true)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [email])

    const refreshNotes = async () => {
        try {
            const fresh = await businessService.getCustomerDetail(email)
            if (fresh) setDetail(fresh)
        } catch {
            /* keep current view */
        }
    }

    const handleAddNote = async () => {
        const text = noteText.trim()
        if (!text) {
            toast.error('Write something first')
            return
        }
        setSavingNote(true)
        try {
            const created = await businessService.createCustomerNote(email, text)
            if (!created) {
                toast.error('Could not save the note')
                return
            }
            setNoteText('')
            await refreshNotes()
            toast.success('Note added')
        } finally {
            setSavingNote(false)
        }
    }

    const handleUpdateNote = async (noteId: string) => {
        const text = editText.trim()
        if (!text) {
            toast.error('Note cannot be empty')
            return
        }
        const updated = await businessService.updateCustomerNote(noteId, text)
        if (!updated) {
            toast.error('Could not update the note')
            return
        }
        setEditingId(null)
        await refreshNotes()
        toast.success('Note updated')
    }

    const handleDeleteNote = async (noteId: string) => {
        const ok = await businessService.deleteCustomerNote(noteId)
        if (!ok) {
            toast.error('Could not delete the note')
            return
        }
        await refreshNotes()
        toast.success('Note deleted')
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <Helmet><title>Customers - MCOMVCard</title></Helmet>
                <p className="text-xs text-gray-400">Loading customer…</p>
            </div>
        )
    }

    if (notFound || !detail) {
        return (
            <div className="text-center py-20">
                <Helmet><title>Customer not found - MCOMVCard</title></Helmet>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Customer not found</p>
                <p className="text-xs text-gray-400 mt-1 mb-3">No interactions, account or notes for this email at your business.</p>
                <Link to="/b/customers" className="text-sm text-orange-600 mt-2 inline-block">Back to customers</Link>
            </div>
        )
    }

    const c = detail.customer

    const statusPill = c.status === 'active'
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
        : c.status === 'new'
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600'
    const statusLabel = c.status === 'active' ? 'Active' : c.status === 'new' ? 'New' : 'At risk'

    const apptPill = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
            confirmed: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
            pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
            cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600',
        }
        const labels: Record<string, string> = { completed: 'Completed', confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled' }
        return (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {labels[status] ?? status}
            </span>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>{c.name} - Customers - MCOMVCard</title></Helmet>

            {/* Back */}
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
            </button>

            {/* Customer header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${c.email ? avatarColorFor(c.email) : 'bg-orange-500'} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {initialsOf(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{c.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {c.tier ? `${c.tier} member` : 'Standard'} · since {fmtDate(c.memberSince)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{c.phone ?? '—'} · {c.email}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${statusPill}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3">
                <QuickStat label="Appointments" value={String(c.totalAppointments)} />
                <QuickStat label="Reviews" value={String(c.totalReviews)} />
                <QuickStat label="Shares" value={String(c.totalShares)} />
                <QuickStat label="Notes" value={String(detail.notes.length)} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 border-b border-gray-200 dark:border-gray-800">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`shrink-0 px-4 py-2.5 min-h-[44px] text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                            tab === t ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Membership' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${detail.membership ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gray-300 dark:bg-gray-600'}`}>★</div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{detail.membership?.tier ?? c.tier ?? 'No membership yet'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Member since {fmtDate(c.memberSince)}</p>
                        </div>
                        {detail.membership && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold capitalize">{detail.membership.status}</span>
                        )}
                    </div>
                    {detail.membership?.expiresAt && (
                        <p className="text-[11px] text-gray-400 mt-2">Renews / expires {fmtDate(detail.membership.expiresAt)}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <MemberInfo label="Appointments" value={String(c.totalAppointments)} />
                        <MemberInfo label="Reviews" value={String(c.totalReviews)} />
                        <MemberInfo label="Card Shares" value={String(c.totalShares)} />
                        <MemberInfo label="Notes" value={String(detail.notes.length)} />
                    </div>

                    <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Membership upgrades granted from this screen arrive with the rewards engine.</p>
                    </div>

                    <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                            <span className="font-semibold">Tip:</span> loyal customers move up a tier when they reach milestones — keep an eye on their activity.
                        </p>
                    </div>
                </div>
            )}

            {tab === 'Appointments' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    {detail.appointments.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.service ?? 'Appointment'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {fmtDate(a.date)} · {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                                </p>
                            </div>
                            {apptPill(a.status)}
                        </div>
                    ))}
                    {detail.appointments.length === 0 && <EmptyNote text="No appointments yet." />}
                </div>
            )}

            {tab === 'Activity' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{detail.activity.length} activity events</p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {detail.activity.map((a) => (
                            <div key={a.id} className="flex items-start gap-3 p-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ACTIVITY_ICONS[a.type] ?? ACTIVITY_ICONS.note} />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.title}</p>
                                    {a.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</p>}
                                </div>
                                <span className="text-[11px] text-gray-400 shrink-0">{fmtDateTime(a.created_at)}</span>
                            </div>
                        ))}
                        {detail.activity.length === 0 && <EmptyNote text="No activity yet." />}
                    </div>
                </div>
            )}

            {tab === 'Reviews' && (
                <div className="space-y-3">
                    {detail.reviews.map((r) => (
                        <div key={r.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <svg key={n} className={`w-4 h-4 ${n <= r.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 7.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-[11px] text-gray-400">{fmtDate(r.created_at)}</span>
                            </div>
                            {r.comment && <p className="text-sm text-gray-700 dark:text-gray-200 mt-2">{r.comment}</p>}
                        </div>
                    ))}
                    {detail.reviews.length === 0 && (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No reviews from this customer yet.</p>
                        </div>
                    )}
                </div>
            )}

            {tab === 'Notes' && (
                <div className="space-y-3">
                    {/* Add note box */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Add a private note</label>
                        <textarea
                            rows={2}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="e.g. Prefers oat milk, always tips well."
                            className={`${inputCls} resize-none`}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleAddNote}
                                disabled={savingNote}
                                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50"
                            >
                                {savingNote ? 'Saving…' : 'Add Note'}
                            </button>
                        </div>
                    </div>

                    {/* Notes list */}
                    {detail.notes.map((n) => (
                        <NoteRow
                            key={n.id}
                            note={n}
                            editing={editingId === n.id}
                            editText={editText}
                            onEditText={setEditText}
                            onStartEdit={() => { setEditingId(n.id); setEditText(n.note) }}
                            onCancelEdit={() => setEditingId(null)}
                            onSaveEdit={() => handleUpdateNote(n.id)}
                            onDelete={() => handleDeleteNote(n.id)}
                        />
                    ))}
                    {detail.notes.length === 0 && (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No notes for this customer yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Note row with inline edit/delete                                   */
/* ------------------------------------------------------------------ */

function NoteRow({ note, editing, editText, onEditText, onStartEdit, onCancelEdit, onSaveEdit, onDelete }: {
    note: CustomerNoteItem
    editing: boolean
    editText: string
    onEditText: (v: string) => void
    onStartEdit: () => void
    onCancelEdit: () => void
    onSaveEdit: () => void
    onDelete: () => void
}) {
    if (editing) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-300 dark:border-orange-500/40 shadow-sm p-4 space-y-2">
                <textarea
                    rows={3}
                    value={editText}
                    onChange={(e) => onEditText(e.target.value)}
                    className={`${inputCls} resize-none`}
                />
                <div className="flex items-center justify-end gap-2">
                    <button onClick={onCancelEdit} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[11px] font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        Cancel
                    </button>
                    <button onClick={onSaveEdit} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[11px] font-semibold hover:bg-orange-600">
                        Save
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{note.note}</p>
            <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-gray-400">
                    {note.author_name ? `${note.author_name} · ` : ''}{fmtDateTime(note.created_at)}
                    {note.updated_at !== note.created_at ? ' · edited' : ''}
                </p>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={onStartEdit} title="Edit note"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={onDelete} title="Delete note"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function QuickStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}

function MemberInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
    )
}

function EmptyNote({ text }: { text: string }) {
    return <div className="p-8 text-center text-sm text-gray-400">{text}</div>
}
