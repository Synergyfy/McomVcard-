import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getCardTemplate, upsertCardTemplate, defaultFriendsFamily, normalizeFriendsFamily,
  FF_TIER_GROUPS, FF_TIERS,
  type FriendsFamilyConfig,
} from '../../../services/cardTemplateStore'
import { LayoutFaceContent } from '../../../components/admin/CardPreview'

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function Help({ text, expand = 'left' }: { text: string; expand?: 'left' | 'right' }) {
  return (
    <span className="group relative inline-flex shrink-0">
      <svg className="w-3 h-3 text-gray-300 dark:text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span className={`pointer-events-none absolute bottom-full mb-1.5 w-64 max-w-[min(16rem,70vw)] rounded-lg bg-gray-900 dark:bg-gray-950 text-white text-[9px] leading-snug px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl ${expand === 'left' ? 'right-0' : 'left-0'}`}>
        {text}
      </span>
    </span>
  )
}

function SectionCard({ num, title, desc, tip, open, onToggle, children }: {
  num: string; title: string; desc: string; tip?: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div id={`ff-${num}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 scroll-mt-4">
      <button type="button" onClick={onToggle}
        className={`w-full px-4 py-3 flex items-start gap-3 text-left rounded-xl transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20 ${open ? 'border-b border-gray-50 dark:border-gray-700/50' : ''}`}>
        <span className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-bold flex items-center justify-center shrink-0">{num}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
        </div>
        {tip && <Help text={tip} />}
        <svg className={`w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-4 py-3.5">{children}</div>}
    </div>
  )
}

const INDEX_GROUPS = [
  { id: 'ff-1', label: 'Availability & Allocation', sections: '1' },
  { id: 'ff-2', label: 'Card', sections: '2' },
  { id: 'ff-3', label: 'Money', sections: '3' },
  { id: 'ff-4', label: 'Preview', sections: '4' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CardFriendsFamilyConfigPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = Number(searchParams.get('id') ?? 0)
  const type = searchParams.get('type') === 'consumer' ? 'consumer' : 'business'

  const template = useMemo(() => (id ? getCardTemplate(id) : undefined), [id])
  const [config, setConfig] = useState<FriendsFamilyConfig>(() =>
    normalizeFriendsFamily(id ? (getCardTemplate(id)?.builder.friendsFamily ?? defaultFriendsFamily()) : defaultFriendsFamily()))
  const [dirty, setDirty] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const section = (num: string) => ({
    open: openSection === 'ff-' + num,
    onToggle: () => setOpenSection(openSection === 'ff-' + num ? null : 'ff-' + num),
  })

  const set = (patch: Partial<FriendsFamilyConfig>) => { setConfig(c => ({ ...c, ...patch })); setDirty(true) }
  const toggleIn = (key: 'tiers', value: string) => {
    setConfig(c => ({
      ...c,
      [key]: (c[key] as string[]).includes(value) ? (c[key] as string[]).filter(x => x !== value) : [...(c[key] as string[]), value],
    }))
    setDirty(true)
  }

  if (!template) {
    return (
      <div className="space-y-4">
        <Helmet><title>Friends &amp; Family Configuration - Card Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-10 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Card template not found</p>
          <p className="text-xs text-gray-400 mt-1">Save the template first, then return to Friends &amp; Family configuration.</p>
          <button onClick={() => navigate(`/admin/card-management/card-template-builder?type=${type}&tab=content`)}
            className="mt-4 px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Back to Builder</button>
        </div>
      </div>
    )
  }

  const enabled = config.enabled
  const disabled = !enabled

  const validate = (): boolean => {
    if (disabled) return true
    if (config.tiers.length === 0) { toast.error('Select at least one membership level in Availability'); return false }
    for (const t of FF_TIERS) {
      const v = config.allocations[t]
      if (v != null && (!Number.isInteger(v) || v < 0)) { toast.error(`${t} allocation must be a whole number of 0 or more`); return false }
    }
    if (config.giftCardsEnabled) {
      for (const t of FF_TIERS) {
        const v = config.giftCardAmounts[t]
        if (v == null || !Number.isInteger(v) || v < 0) { toast.error(`${t} e-gift amount must be a whole number of 0 or more`); return false }
      }
    }
    return true
  }

  const save = () => {
    if (!validate()) return
    upsertCardTemplate({ ...template, builder: { ...template.builder, friendsFamily: config } })
    setDirty(false)
    toast.success('Friends & Family configuration saved')
    navigate(`/admin/card-management/card-template-builder?id=${template.id}&type=${type}&tab=content`)
  }

  const goBack = () => navigate(`/admin/card-management/card-template-builder?id=${template.id}&type=${type}&tab=content`)

  const allocatedCount = FF_TIERS.filter(t => config.allocations[t] !== null).length

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      {dirty && <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Unsaved changes
      </span>}
      <button onClick={goBack} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Back to Builder</button>
      <button onClick={save} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors">Save &amp; Return to Builder</button>
    </div>
  )

  return (
    <div className="space-y-4">
      <Helmet><title>Friends &amp; Family Configuration - Card Management - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to={`/admin/card-management/${type}-card-templates`} className="hover:text-orange-600">Card Templates</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <Link to={`/admin/card-management/card-template-builder?id=${template.id}&type=${type}&tab=content`} className="hover:text-orange-600">{template.name}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Friends &amp; Family Configuration</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Friends &amp; Family Configuration</h2>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5 max-w-xl">
                Decide whether this {type === 'consumer' ? 'Consumer' : 'Business'} Card supports Friends &amp; Family, which memberships unlock it, and what capabilities allocated members receive. Detailed limits, rates and security are enforced by their dedicated engines.
              </p>
            </div>
          </div>
          {actions}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 items-start">
        {/* Sticky index */}
        <div className="hidden lg:block sticky top-4">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">On this page</p>
          <div className="space-y-0.5">
            {INDEX_GROUPS.map(g => (
              <a key={g.id} href={`#${g.id}`} onClick={() => setOpenSection(g.id)} className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors">
                {g.label}
                <span className="text-[9px] text-gray-300 dark:text-gray-500">{g.sections}</span>
              </a>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 mt-3 px-1 leading-relaxed">Operational actions — inviting people, allocating slots, wallets — happen in the member dashboards.</p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Section 0 — master toggle */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl border px-4 py-3.5 flex items-center gap-3 ${enabled ? 'border-orange-200 dark:border-orange-500/30' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Enable Friends &amp; Family</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {enabled ? 'Friends & Family is active on this template. Configure its behaviour below.' : 'When disabled, members see no Friends & Family features on this card.'}
              </p>
            </div>
            <Toggle on={enabled} onClick={() => set({ enabled: !enabled })} />
          </div>

          {disabled ? (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-6 text-center">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Friends &amp; Family is disabled for this template</p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 mt-1">Enable it above to configure which memberships unlock it and what capabilities allocated members receive.</p>
            </div>
          ) : (
            <>
              <SectionCard num="1" {...section('1')} title="Availability & Allocation" desc="Which membership levels unlock Friends & Family, and how many spaces each one gets."
                tip="Tick a level to unlock Friends & Family for it, then set how many people members of that level can invite. Unticked levels see a locked state. Each space = one person the member can invite; the engine enforces these limits.">
                <div className="space-y-2">
                  {FF_TIER_GROUPS.map(g => (
                    <div key={g.tier} className="rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{g.tier}</p>
                      <div className="space-y-1">
                        {g.variants.map(variant => {
                          const on = config.tiers.includes(variant)
                          const val = config.allocations[variant]
                          const unlimited = val === null
                          return (
                            <div key={variant} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${on ? 'bg-gray-50 dark:bg-gray-700/30' : 'opacity-45'}`}>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={on} onChange={() => toggleIn('tiers', variant)} className="accent-orange-500 w-3.5 h-3.5" />
                                <span className={`text-[11px] font-medium whitespace-nowrap ${on ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{variant}</span>
                              </label>
                              <Help expand="right" text="How many people a member of this level can invite. Enter 0 to allow none, or turn on Unlimited for no cap." />
                              {unlimited ? (
                                <span className={`text-[10px] font-semibold ${on ? 'text-orange-600' : 'text-gray-400'}`}>Unlimited</span>
                              ) : (
                                <div className={`flex items-center gap-1.5 ${on ? '' : 'pointer-events-none opacity-50'}`}>
                                  <input type="number" min={0} value={val ?? 0}
                                    onChange={e => set({ allocations: { ...config.allocations, [variant]: e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value) || 0)) } })}
                                    className="w-20 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                                  <span className="text-[10px] text-gray-400">spaces</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 ml-auto">
                                <span className={`text-[10px] ${on ? 'text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>Unlimited</span>
                                <Toggle on={unlimited} onClick={() => on && set({ allocations: { ...config.allocations, [variant]: unlimited ? 0 : null } })} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {config.tiers.length === 0 && <p className="text-[10px] text-amber-600 mt-2">Select at least one level to save.</p>}
                <p className="text-[10px] text-gray-400 mt-2">{allocatedCount} of {FF_TIERS.length} levels can grant unlimited spaces.</p>
              </SectionCard>

              <SectionCard num="2" {...section('2')} title="Card" desc="How Friends & Family appears on the card."
                tip="The badge is decorative — it tells cardholders this card is Friends & Family enabled. Where the QR takes members is controlled by the QR configuration.">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-2">Card badge</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4">
                      {(['No', 'Yes'] as const).map(o => (
                        <label key={o} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="badge" checked={config.showBadge === (o === 'Yes')} onChange={() => set({ showBadge: o === 'Yes' })} className="accent-orange-500" />
                          <span className="text-[11px] text-gray-700 dark:text-gray-200">{o}</span>
                        </label>
                      ))}
                    </div>
                    {config.showBadge && (
                      <>
                        <input value={config.badgeLabel} onChange={e => set({ badgeLabel: e.target.value })} placeholder="F&F" maxLength={24}
                          className="w-44 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                        <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-[9px] font-bold">{config.badgeLabel || 'F&F'}</span>
                      </>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard num="3" {...section('3')} title="Money" desc="What Friends & Family activity can do with money."
                tip="Financial rules (limits, denominations, rates) are handled by their dedicated engines. E-gift card values can only be set for levels you enabled in Availability & Allocation.">
                <div className="space-y-3">
                  <ToggleRow label="Wallet allocation" sub="Members can allocate a limited amount to Friends & Family." on={config.walletEnabled} onClick={() => set({ walletEnabled: !config.walletEnabled })} />
                  <div className="rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2.5">
                    <ToggleRow label="E-gift cards" sub="Members can send an e-gift card worth up to the amount set for their level." on={config.giftCardsEnabled} onClick={() => set({ giftCardsEnabled: !config.giftCardsEnabled })} />
                    {config.giftCardsEnabled && (
                      config.tiers.length === 0 ? (
                        <p className="mt-3 border-t border-gray-50 dark:border-gray-700/50 pt-3 text-[10px] text-gray-400">
                          Enable at least one level in Availability &amp; Allocation to set e-gift card amounts.
                        </p>
                      ) : (
                        <div className="mt-3 border-t border-gray-50 dark:border-gray-700/50 pt-3 space-y-2">
                          {FF_TIER_GROUPS.filter(g => g.variants.some(v => config.tiers.includes(v))).map(g => (
                            <div key={g.tier}>
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{g.tier}</p>
                              <div className="space-y-1">
                                {g.variants.filter(v => config.tiers.includes(v)).map(variant => (
                                  <div key={variant} className="flex items-center gap-2.5 rounded-lg px-2 py-1">
                                    <span className="flex-1 text-[11px] font-medium text-gray-700 dark:text-gray-200">{variant}</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-400">£</span>
                                      <input type="number" min={0} value={config.giftCardAmounts[variant] ?? 0}
                                        onChange={e => set({ giftCardAmounts: { ...config.giftCardAmounts, [variant]: e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value) || 0)) } })}
                                        className="w-20 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                  <ToggleRow label="Cashback" sub="Spend by allocated members can earn cashback." on={config.cashbackEnabled} onClick={() => set({ cashbackEnabled: !config.cashbackEnabled })} />
                </div>
              </SectionCard>

              <SectionCard num="4" {...section('4')} title="Preview" desc="See how the card changes when Friends & Family is enabled."
                tip="Shows visual changes only — not the underlying configuration.">
                <div className="flex flex-wrap gap-4 justify-center">
                  {(['front', 'back'] as const).map(f => (
                    <div key={f} className="shrink-0">
                      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-1.5 bg-gray-50 dark:bg-gray-700/40">
                        <div className="relative w-[260px] aspect-[85/55] rounded-[6px] overflow-hidden shadow-md">
                          <LayoutFaceContent face={f} sections={f === 'front' ? template.builder.faces.front : template.builder.faces.back} ff={config} />
                        </div>
                      </div>
                      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-1 capitalize">{f === 'front' ? 'Front' : 'Back'}</p>
                    </div>
                  ))}
                </div>
                {config.showBadge && (
                  <p className="text-[10px] text-gray-400 text-center mt-2 inline-flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[8px] font-bold">{config.badgeLabel || 'F&F'}</span>
                    badge on front
                  </p>
                )}
              </SectionCard>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[10px] text-gray-400">Capability assignment only — invitations, wallets and redemptions run in the member dashboards.</p>
            {actions}
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, on, onClick }: { label: string; sub?: string; on: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-semibold ${on ? 'text-emerald-600' : 'text-gray-400'}`}>{on ? 'Enabled' : 'Disabled'}</span>
        <Toggle on={on} onClick={onClick} />
      </div>
    </div>
  )
}
