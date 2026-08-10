import { useState, type ReactNode } from 'react'
import {
  MEMBERSHIP_LEVELS,
  REDEMPTION_KIND_LABELS,
  SHARE_SELECTION_OPTIONS,
  type BusinessCentreControls,
  type ExchangeableItem,
  type MembershipEligibility,
  type RedemptionOffer,
  type RedemptionRecord,
} from '../../../services/businessVCardEditorStore'

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

function Panel({ icon, accent, title, subtitle, children }: {
  icon: string
  accent: { text: string; border: string; bg: string; headerBg: string; dot: string }
  title: string
  subtitle: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border overflow-hidden ${accent.border} ${accent.bg}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full px-3 py-2 flex items-center gap-2 text-left ${accent.headerBg}`}>
        <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${accent.bg} ${accent.text}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-bold ${accent.text}`}>{title}</p>
          <p className="text-[9px] text-gray-400 truncate">{subtitle}</p>
        </div>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot}`} />
        <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="border-t border-gray-100 dark:border-gray-700 p-3 space-y-3">{children}</div>}
    </div>
  )
}

function CountStepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2.5 py-1.5">
      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-orange-50 hover:text-orange-500 flex items-center justify-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <span className="w-7 text-center text-[11px] font-bold text-gray-900 dark:text-white">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-orange-50 hover:text-orange-500 flex items-center justify-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
    </div>
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

function RowActions({ index, total, onMove, onRemove }: { index: number; total: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <button type="button" onClick={onRemove}
        className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  )
}

function MembershipSelect({ value, onChange }: { value: MembershipEligibility; onChange: (v: MembershipEligibility) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as MembershipEligibility)} className={inputCls}>
      <option value="Any">Any level</option>
      {MEMBERSHIP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
    </select>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">{children}</label>
}

const newId = () => Date.now() + Math.floor(Math.random() * 1000)

/* ================================================================== */
/*  SHARE CENTRE — business-side controls. Share is a primary action   */
/*  embedded in the VCard, not a separate page. The business selects   */
/*  the approved content to share; the customer sees the finished info.*/
/* ================================================================== */

export function ShareCentreControls({ controls, onChange }: {
  controls: BusinessCentreControls
  onChange: (c: BusinessCentreControls) => void
}) {
  const sel = controls.share.selections
  const toggle = (key: keyof BusinessCentreControls['share']['selections']) =>
    onChange({ ...controls, share: { selections: { ...sel, [key]: !sel[key] } } })

  return (
    <Panel
      icon="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      accent={{ text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', bg: 'bg-blue-50 dark:bg-blue-500/10', headerBg: 'bg-blue-100 dark:bg-blue-500/20', dot: 'bg-blue-500' }}
      title="Share Centre — Business controls"
      subtitle="Select the approved content customers can see & share"
    >
      <InfoNote tone="blue">
        <span className="font-semibold">Share is one of the primary actions embedded in your VCard — not a separate page.</span>{' '}
        Whatever you select below is what customers see and can share directly on the card.
      </InfoNote>

      <div>
        <Label>Select approved content to share</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {SHARE_SELECTION_OPTIONS.map(opt => (
            <button key={opt.key} type="button" onClick={() => toggle(opt.key)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${sel[opt.key] ? 'border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${sel[opt.key] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-500'}`}>
                {sel[opt.key] && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </span>
              <span className="flex-1 text-[10px] font-medium text-gray-700 dark:text-gray-200 truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <InfoNote tone="blue">
        <span className="font-semibold">Customer-facing result:</span> the customer sees the finished information on your VCard — no separate website or page.
      </InfoNote>
    </Panel>
  )
}

/* ================================================================== */
/*  EXCHANGE CENTRE — exchangeable goods, services and assets, with    */
/*  like-for-like membership eligibility shown up front.               */
/* ================================================================== */

export function ExchangeCentreControls({ controls, onChange }: {
  controls: BusinessCentreControls
  onChange: (c: BusinessCentreControls) => void
}) {
  const ex = controls.exchange

  const patch = (i: number, patchItem: Partial<ExchangeableItem>) =>
    onChange({ ...controls, exchange: { ...ex, items: ex.items.map((it, j) => (j === i ? { ...it, ...patchItem } : it)) } })

  const addItem = () =>
    onChange({ ...controls, exchange: { ...ex, items: [...ex.items, { id: newId(), name: '', description: '', value: '', availability: '', terms: '', membership: 'Any' }] } })

  const removeItem = (i: number) =>
    onChange({ ...controls, exchange: { ...ex, items: ex.items.filter((_, j) => j !== i) } })

  const moveItem = (i: number, dir: -1 | 1) => {
    const items = [...ex.items]
    const t = i + dir
    if (t < 0 || t >= items.length) return
    const [it] = items.splice(i, 1)
    items.splice(t, 0, it)
    onChange({ ...controls, exchange: { ...ex, items } })
  }

  return (
    <Panel
      icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      accent={{ text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', bg: 'bg-amber-50 dark:bg-amber-500/10', headerBg: 'bg-amber-100 dark:bg-amber-500/20', dot: 'bg-amber-500' }}
      title="Exchange Centre — Business controls"
      subtitle="Exchangeable items, eligibility & exchange status"
    >
      <InfoNote tone="amber">
        <span className="font-semibold">Exchanges are controlled by membership level</span> — like-for-like only (Bronze ↔ Bronze, Silver ↔ Silver, …). Each item's eligibility is shown to customers before they can request an exchange.
      </InfoNote>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Create / use approved exchangeable item</Label>
          <button type="button" onClick={addItem}
            className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add item
          </button>
        </div>
        <div className="space-y-2">
          {ex.items.map((it, i) => (
            <div key={it.id} className="border border-amber-100 dark:border-amber-500/20 bg-white dark:bg-gray-800 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Item {i + 1}</span>
                <RowActions index={i} total={ex.items.length} onMove={d => moveItem(i, d)} onRemove={() => removeItem(i)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Product / service</Label>
                  <input className={inputCls} value={it.name} onChange={e => patch(i, { name: e.target.value })} placeholder="House Blend Beans" />
                </div>
                <div>
                  <Label>Value</Label>
                  <input className={inputCls} value={it.value} onChange={e => patch(i, { value: e.target.value })} placeholder="£12" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <textarea rows={2} className={`${inputCls} resize-none`} value={it.description} onChange={e => patch(i, { description: e.target.value })} placeholder="Short description…" />
                </div>
                <div>
                  <Label>Availability</Label>
                  <input className={inputCls} value={it.availability} onChange={e => patch(i, { availability: e.target.value })} placeholder="In stock / Limited" />
                </div>
                <div>
                  <Label>Membership eligibility</Label>
                  <MembershipSelect value={it.membership} onChange={v => patch(i, { membership: v })} />
                </div>
                <div className="col-span-2">
                  <Label>Terms</Label>
                  <input className={inputCls} value={it.terms} onChange={e => patch(i, { terms: e.target.value })} placeholder="Freshly roasted weekly." />
                </div>
              </div>
            </div>
          ))}
          {ex.items.length === 0 && (
            <p className="text-[9px] text-gray-400 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">No exchangeable items yet — add a product or service to exchange.</p>
          )}
        </div>
      </div>

      <div>
        <Label>Exchange status</Label>
        <div className="space-y-1.5">
          <CountStepper label="Incoming exchange requests" value={ex.incomingRequests} onChange={v => onChange({ ...controls, exchange: { ...ex, incomingRequests: v } })} />
          <CountStepper label="Accepted exchanges" value={ex.acceptedExchanges} onChange={v => onChange({ ...controls, exchange: { ...ex, acceptedExchanges: v } })} />
          <CountStepper label="Completed exchanges" value={ex.completedExchanges} onChange={v => onChange({ ...controls, exchange: { ...ex, completedExchanges: v } })} />
        </div>
      </div>
    </Panel>
  )
}

/* ================================================================== */
/*  REDEEM CENTRE — active rewards, coupons, vouchers, cashback and    */
/*  gift cards; pending/completed/expired redemptions + history. The   */
/*  available experience reflects the customer's membership level.     */
/* ================================================================== */

export function RedeemCentreControls({ controls, onChange }: {
  controls: BusinessCentreControls
  onChange: (c: BusinessCentreControls) => void
}) {
  const re = controls.redeem
  const kinds = Object.keys(REDEMPTION_KIND_LABELS) as RedemptionOffer['kind'][]

  const patchOffer = (i: number, patchItem: Partial<RedemptionOffer>) =>
    onChange({ ...controls, redeem: { ...re, offers: re.offers.map((o, j) => (j === i ? { ...o, ...patchItem } : o)) } })

  const addOffer = () =>
    onChange({ ...controls, redeem: { ...re, offers: [...re.offers, { id: newId(), title: '', description: '', value: '', kind: 'reward', membership: 'Any' }] } })

  const removeOffer = (i: number) =>
    onChange({ ...controls, redeem: { ...re, offers: re.offers.filter((_, j) => j !== i) } })

  const patchRecord = (i: number, patchItem: Partial<RedemptionRecord>) =>
    onChange({ ...controls, redeem: { ...re, history: re.history.map((r, j) => (j === i ? { ...r, ...patchItem } : r)) } })

  const addRecord = () =>
    onChange({ ...controls, redeem: { ...re, history: [...re.history, { id: newId(), customer: '', item: '', value: '', status: 'pending', date: '' }] } })

  const removeRecord = (i: number) =>
    onChange({ ...controls, redeem: { ...re, history: re.history.filter((_, j) => j !== i) } })

  return (
    <Panel
      icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      accent={{ text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', bg: 'bg-green-50 dark:bg-green-500/10', headerBg: 'bg-green-100 dark:bg-green-500/20', dot: 'bg-green-500' }}
      title="Redeem Centre — Business controls"
      subtitle="Active rewards, coupons & redemption status"
    >
      <InfoNote tone="green">
        <span className="font-semibold">The available redemption experience reflects the customer's membership level</span> — members see rewards matching their level, not everything at once.
      </InfoNote>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Active redemption offers</Label>
          <button type="button" onClick={addOffer}
            className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add offer
          </button>
        </div>
        <div className="space-y-2">
          {re.offers.map((o, i) => (
            <div key={o.id} className="border border-green-100 dark:border-green-500/20 bg-white dark:bg-gray-800 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Offer {i + 1}</span>
                <RowActions index={i} total={re.offers.length}
                  onMove={d => { const list = [...re.offers]; const t = i + d; if (t < 0 || t >= list.length) return; const [it] = list.splice(i, 1); list.splice(t, 0, it); onChange({ ...controls, redeem: { ...re, offers: list } }) }}
                  onRemove={() => removeOffer(i)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <input className={inputCls} value={o.title} onChange={e => patchOffer(i, { title: e.target.value })} placeholder="Loyalty Points" />
                </div>
                <div>
                  <Label>Kind</Label>
                  <select className={inputCls} value={o.kind} onChange={e => patchOffer(i, { kind: e.target.value as RedemptionOffer['kind'] })}>
                    {kinds.map(k => <option key={k} value={k}>{REDEMPTION_KIND_LABELS[k]}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Value</Label>
                  <input className={inputCls} value={o.value} onChange={e => patchOffer(i, { value: e.target.value })} placeholder="1,000 pts" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <textarea rows={2} className={`${inputCls} resize-none`} value={o.description} onChange={e => patchOffer(i, { description: e.target.value })} placeholder="Short description…" />
                </div>
                <div className="col-span-2">
                  <Label>Membership level</Label>
                  <MembershipSelect value={o.membership} onChange={v => patchOffer(i, { membership: v })} />
                </div>
              </div>
            </div>
          ))}
          {re.offers.length === 0 && (
            <p className="text-[9px] text-gray-400 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">No active offers yet — add a reward, coupon or cashback.</p>
          )}
        </div>
      </div>

      <div>
        <Label>Redemption status</Label>
        <div className="space-y-1.5">
          <CountStepper label="Pending redemption" value={re.pending} onChange={v => onChange({ ...controls, redeem: { ...re, pending: v } })} />
          <CountStepper label="Completed redemption" value={re.completed} onChange={v => onChange({ ...controls, redeem: { ...re, completed: v } })} />
          <CountStepper label="Expired redemption" value={re.expired} onChange={v => onChange({ ...controls, redeem: { ...re, expired: v } })} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Redemption history</Label>
          <button type="button" onClick={addRecord}
            className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add record
          </button>
        </div>
        <div className="space-y-2">
          {re.history.map((r, i) => (
            <div key={r.id} className="border border-green-100 dark:border-green-500/20 bg-white dark:bg-gray-800 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Redemption {i + 1}</span>
                <RowActions index={i} total={re.history.length}
                  onMove={d => { const list = [...re.history]; const t = i + d; if (t < 0 || t >= list.length) return; const [it] = list.splice(i, 1); list.splice(t, 0, it); onChange({ ...controls, redeem: { ...re, history: list } }) }}
                  onRemove={() => removeRecord(i)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Customer</Label>
                  <input className={inputCls} value={r.customer} onChange={e => patchRecord(i, { customer: e.target.value })} placeholder="Jane Doe" />
                </div>
                <div>
                  <Label>Item</Label>
                  <input className={inputCls} value={r.item} onChange={e => patchRecord(i, { item: e.target.value })} placeholder="Loyalty Points" />
                </div>
                <div>
                  <Label>Value</Label>
                  <input className={inputCls} value={r.value} onChange={e => patchRecord(i, { value: e.target.value })} placeholder="1,000 pts" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select className={inputCls} value={r.status} onChange={e => patchRecord(i, { status: e.target.value as RedemptionRecord['status'] })}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label>Date</Label>
                  <input className={inputCls} value={r.date} onChange={e => patchRecord(i, { date: e.target.value })} placeholder="Aug 2, 2026" />
                </div>
              </div>
            </div>
          ))}
          {re.history.length === 0 && (
            <p className="text-[9px] text-gray-400 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">No redemptions yet.</p>
          )}
        </div>
      </div>
    </Panel>
  )
}
