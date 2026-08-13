import { useMemo, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { VCardPhoneContent, CENTRES, CENTRE_ORDER } from '../../admin/card-management/TemplateBuilderPage'
import ScrollingVCard from '../../../components/common/ScrollingVCard'
import Badge from '../../../components/business/primitives/Badge'
import { getVCardById, mockBusinessProfile } from '../../../services/businessStore'
import {
  getVCardEditorContent,
  saveVCardEditorContent,
  resetVCardEditorContent,
  getVCardProtection,
  saveVCardProtection,
  clearVCardProtection,
  buildBusinessCentres,
  getBusinessCentreControls,
  saveBusinessCentreControls,
  resetBusinessCentreControls,
  getAppointmentSettings,
  saveAppointmentSettings,
  resetAppointmentSettings,
  BIZ_SECTIONS,
  BIZ_SECTION_CENTRES,
  BIZ_CUSTOM_BLOCK_DEFS,
  type BizSectionState,
  type BizFieldDef,
  type BizCustomBlock,
  type BizCustomBlockType,
  type VCardProtection,
  type BusinessCentreControls,
  type AppointmentSettings,
} from '../../../services/businessVCardEditorStore'
import { ShareCentreControls, ExchangeCentreControls, RedeemCentreControls } from './BusinessCentrePanels'
import AppointmentSettingsPanel from './AppointmentSettingsPanel'

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

/* Accent styling per centre, matching the Admin builder's grouping so the
   components list reads the same way the live preview arranges sections. */
const CENTRE_ACCENT: Record<string, { text: string; border: string; bg: string; headerBg: string }> = {
  gray: { text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600', bg: 'bg-gray-50 dark:bg-gray-700/30', headerBg: 'bg-gray-100 dark:bg-gray-700/50' },
  blue: { text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', bg: 'bg-blue-50 dark:bg-blue-500/10', headerBg: 'bg-blue-100 dark:bg-blue-500/20' },
  amber: { text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', bg: 'bg-amber-50 dark:bg-amber-500/10', headerBg: 'bg-amber-100 dark:bg-amber-500/20' },
  green: { text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', bg: 'bg-green-50 dark:bg-green-500/10', headerBg: 'bg-green-100 dark:bg-green-500/20' },
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

export function LockTag({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${className}`}>
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      Admin-managed
    </span>
  )
}

export function EditableTag() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      Editable
    </span>
  )
}

export function ImageUploadField({ label, value, onChange, placeholder, disabled }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange(String(reader.result))
      toast.success('Image uploaded')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const cls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {disabled ? (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.opacity = '0.2' }} />
            ) : (
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )}
          </div>
          <p className="text-[9px] text-gray-400">Managed by Admin</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} flex-1 min-w-0`} />
          <button type="button" onClick={() => fileRef.current?.click()} title="Upload from file manager"
            className="shrink-0 px-2.5 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-orange-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()} title="Click to upload from file manager"
            className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center justify-center bg-gray-50 dark:bg-gray-700 transition-colors">
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.opacity = '0.2' }} />
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )}
          </button>
        </div>
      )}
      {!disabled && <p className="text-[8px] text-gray-400 mt-1">Click Upload or the thumbnail to pick from file manager — or paste an image link</p>}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

export function LockedValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="flex items-center justify-between text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <LockTag />
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 px-3 py-2 min-h-[34px]">
        <svg className="w-3 h-3 text-gray-300 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{value || '—'}</span>
      </div>
    </div>
  )
}

function FieldEditor({ field, value, onChange }: {
  field: BizFieldDef
  value: string
  onChange: (v: string) => void
}) {
  const editable = field.editable !== false

  if (field.type === 'image') {
    return <ImageUploadField label={field.label} value={value} onChange={onChange} placeholder={field.placeholder} disabled={!editable} />
  }

  if (!editable) {
    return <LockedValue label={field.label} value={value} />
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
          {field.options?.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2">
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{field.label}</span>
        <Toggle on={value === 'true'} onClick={() => onChange(value === 'true' ? '' : 'true')} />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={`${inputCls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={inputCls} />
      )}
    </div>
  )
}

export function ListItemEditor({ field, item, onUpdate }: {
  field: BizFieldDef
  item: Record<string, string>
  onUpdate: (fieldKey: string, value: string) => void
}) {
  const itemFields = field.itemFields ?? []
  return (
    <div className="grid grid-cols-2 gap-2">
      {itemFields.map(ifd => {
        const editable = ifd.editable !== false
        const val = item[ifd.key] ?? ''
        if (!editable) {
          return (
            <div key={ifd.key} className={ifd.type === 'textarea' || ifd.type === 'image' ? 'col-span-2' : ''}>
              {ifd.type === 'image' ? (
                <ImageUploadField label={ifd.label} value={val} onChange={() => {}} disabled />
              ) : (
                <LockedValue label={ifd.label} value={val} />
              )}
            </div>
          )
        }
        return (
          <div key={ifd.key} className={ifd.type === 'textarea' || ifd.type === 'image' ? 'col-span-2' : ''}>
            {ifd.type === 'image' ? (
              <ImageUploadField label={ifd.label} value={val} onChange={v => onUpdate(ifd.key, v)} placeholder={ifd.placeholder} />
            ) : ifd.type === 'toggle' ? (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2">
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{ifd.label}</span>
                <Toggle on={val === 'true'} onClick={() => onUpdate(ifd.key, val === 'true' ? '' : 'true')} />
              </div>
            ) : ifd.type === 'select' ? (
              <div>
                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{ifd.label}</label>
                <select value={val} onChange={e => onUpdate(ifd.key, e.target.value)} className={inputCls}>
                  {ifd.options?.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{ifd.label}</label>
                {ifd.type === 'textarea' ? (
                  <textarea rows={2} value={val} onChange={e => onUpdate(ifd.key, e.target.value)} placeholder={ifd.placeholder} className={`${inputCls} resize-none`} />
                ) : (
                  <input type="text" value={val} onChange={e => onUpdate(ifd.key, e.target.value)} placeholder={ifd.placeholder} className={inputCls} />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Custom content blocks                                              */
/* ------------------------------------------------------------------ */

function buildCustomBlock(type: BizCustomBlockType): BizCustomBlock {
  let values: Record<string, string> = {}
  if (type === 'title') values = { text: '', size: 'Medium', align: 'Left', bold: 'true' }
  if (type === 'text') values = { text: '', bold: '', italic: '', large: '', align: 'Left' }
  if (type === 'paragraph') values = { text: '', align: 'Left' }
  if (type === 'image') values = { url: '', caption: '', align: 'Center', rounded: 'true' }
  if (type === 'link') values = { label: '', url: '', newTab: 'true' }
  if (type === 'button') values = { label: '', url: '', style: 'Solid', align: 'Left', full: '' }
  return { id: Date.now() + Math.floor(Math.random() * 1000), type, values }
}

const BLOCK_FIELDS: Record<BizCustomBlockType, { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'toggle'; options?: string[] }[]> = {
  title: [
    { key: 'text', label: 'Title text', type: 'text' },
    { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'] },
    { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
    { key: 'bold', label: 'Bold', type: 'toggle' },
  ],
  text: [
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'bold', label: 'Bold', type: 'toggle' },
    { key: 'italic', label: 'Italic', type: 'toggle' },
    { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
  ],
  paragraph: [
    { key: 'text', label: 'Paragraph', type: 'textarea' },
    { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
  ],
  image: [
    { key: 'url', label: 'Image', type: 'text' },
    { key: 'caption', label: 'Caption (optional)', type: 'text' },
    { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
    { key: 'rounded', label: 'Rounded corners', type: 'toggle' },
  ],
  link: [
    { key: 'label', label: 'Link text', type: 'text' },
    { key: 'url', label: 'URL', type: 'text' },
    { key: 'newTab', label: 'Open in new tab', type: 'toggle' },
  ],
  button: [
    { key: 'label', label: 'Button text', type: 'text' },
    { key: 'url', label: 'URL / action', type: 'text' },
    { key: 'style', label: 'Style', type: 'select', options: ['Solid', 'Outline', 'Ghost'] },
    { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
    { key: 'full', label: 'Full width', type: 'toggle' },
  ],
}

function CustomBlocksEditor({ section, onAdd, onUpdate, onMove, onRemove }: {
  section: BizSectionState
  onAdd: (type: BizCustomBlockType) => void
  onUpdate: (blockId: number, patch: Partial<BizCustomBlock>) => void
  onMove: (blockId: number, dir: -1 | 1) => void
  onRemove: (blockId: number) => void
}) {
  return (
    <div className="border-t border-dashed border-gray-200 dark:border-gray-600 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Custom Content</label>
          <p className="text-[8px] text-gray-400">Add blocks — they stack here in order (image up + text below, etc.)</p>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600">{section.blocks.length}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {BIZ_CUSTOM_BLOCK_DEFS.map(def => (
          <button key={def.type} title={def.desc} onClick={() => onAdd(def.type)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[9px] font-medium text-gray-600 dark:text-gray-300 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={def.icon} /></svg>
            {def.name}
          </button>
        ))}
      </div>

      {section.blocks.length > 0 && (
        <div className="space-y-2">
          {section.blocks.map((block, blockIndex) => {
            const bdef = BIZ_CUSTOM_BLOCK_DEFS.find(d => d.type === block.type)!
            return (
              <div key={block.id} className="border border-orange-100 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-500/5 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/60 dark:bg-gray-800/60">
                  <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={bdef.icon} /></svg>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 flex-1">{bdef.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onMove(block.id, -1)} disabled={blockIndex === 0} title="Move up"
                      className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => onMove(block.id, 1)} disabled={blockIndex === section.blocks.length - 1} title="Move down"
                      className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onClick={() => onRemove(block.id)} title="Remove"
                      className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="p-2.5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {(BLOCK_FIELDS[block.type] ?? []).map(f => (
                      <div key={f.key} className={f.type === 'textarea' ? 'col-span-2' : ''}>
                        {f.type === 'toggle' ? (
                          <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2">
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{f.label}</span>
                            <Toggle on={block.values[f.key] === 'true'} onClick={() => onUpdate(block.id, { values: { ...block.values, [f.key]: block.values[f.key] === 'true' ? '' : 'true' } })} />
                          </div>
                        ) : f.type === 'select' ? (
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                            <select value={block.values[f.key] ?? f.options?.[0] ?? ''} onChange={e => onUpdate(block.id, { values: { ...block.values, [f.key]: e.target.value } })} className={inputCls}>
                              {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ) : f.type === 'textarea' ? (
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                            <textarea rows={2} value={block.values[f.key] ?? ''} onChange={e => onUpdate(block.id, { values: { ...block.values, [f.key]: e.target.value } })} className={`${inputCls} resize-none`} />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                            <input type="text" value={block.values[f.key] ?? ''} onChange={e => onUpdate(block.id, { values: { ...block.values, [f.key]: e.target.value } })} className={inputCls} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section card (left panel)                                          */
/* ------------------------------------------------------------------ */

export function SectionCard({ section, expanded, onToggle, onField, onList, onListAdd, onListRemove, onListMove, onBlock }: {
  section: BizSectionState
  expanded: boolean
  onToggle: () => void
  onField: (key: string, value: string) => void
  onList: (listKey: string, index: number, fieldKey: string, value: string) => void
  onListAdd: (listKey: string) => void
  onListRemove: (listKey: string, index: number) => void
  onListMove: (listKey: string, index: number, dir: -1 | 1) => void
  onBlock: (op: 'add' | 'update' | 'move' | 'remove', payload: { type?: BizCustomBlockType; blockId?: number; patch?: Partial<BizCustomBlock>; dir?: -1 | 1 }) => void
}) {
  const def = BIZ_SECTIONS.find(d => d.id === section.schemaId)!
  const locked = section.locked

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${locked ? 'border-dashed border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
      <div className="p-3 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${locked ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-orange-500/10 text-orange-500'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={def.icon} /></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button onClick={onToggle} className="text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-orange-600 text-left truncate">{section.name}</button>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {locked ? <LockTag /> : <EditableTag />}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Toggle on={section.enabled} onClick={() => {}} disabled={locked} />
          <button onClick={onToggle} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-3 space-y-3">
          {locked && (
            <p className="text-[9px] text-gray-400 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-2.5 py-2">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              This section is fixed by your Admin template. You can view it but not change it.
            </p>
          )}

          {def.fields.map(field => {
            if (field.type === 'list' && field.itemFields) {
              const fieldLocked = field.editable === false
              const items = section.items[field.key] ?? []
              return (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{field.label}</label>
                    {fieldLocked ? (
                      <LockTag />
                    ) : (
                      <button onClick={() => onListAdd(field.key)}
                        className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add {field.itemLabel ?? 'item'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border border-gray-100 dark:border-gray-700 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{field.itemLabel ?? 'Item'} {itemIndex + 1}</span>
                          {!fieldLocked && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => onListMove(field.key, itemIndex, -1)} disabled={itemIndex === 0}
                                className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              </button>
                              <button onClick={() => onListMove(field.key, itemIndex, 1)} disabled={itemIndex === items.length - 1}
                                className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <button onClick={() => onListRemove(field.key, itemIndex)}
                                className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <ListItemEditor field={field} item={item} onUpdate={(k, v) => onList(field.key, itemIndex, k, v)} />
                      </div>
                    ))}
                    {items.length === 0 && !fieldLocked && (
                      <button onClick={() => onListAdd(field.key)} className="w-full border border-dashed border-gray-200 dark:border-gray-600 rounded-lg py-2 text-[10px] text-gray-400 hover:text-orange-500 hover:border-orange-300">
                        + Add {field.itemLabel ?? 'item'}
                      </button>
                    )}
                    {items.length === 0 && fieldLocked && (
                      <p className="text-[9px] text-gray-400">No items set by Admin yet.</p>
                    )}
                  </div>
                </div>
              )
            }
            return (
              <FieldEditor key={field.key} field={field} value={section.values[field.key] ?? ''} onChange={v => onField(field.key, v)} />
            )
          })}

          {!locked && section.blocksAllowed && (
            <CustomBlocksEditor
              section={section}
              onAdd={t => onBlock('add', { type: t })}
              onUpdate={(id, patch) => onBlock('update', { blockId: id, patch })}
              onMove={(id, dir) => onBlock('move', { blockId: id, dir })}
              onRemove={id => onBlock('remove', { blockId: id })}
            />
          )}
        </div>
      )}
    </div>
  )
}

function PasswordProtectionPanel({ protection, onChange, sections }: {
  protection: VCardProtection
  onChange: (p: VCardProtection) => void
  sections: BizSectionState[]
}) {
  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'
  const NON_LOCKABLE = new Set(['banner', 'profile', 'countdown'])
  const options = sections
    .filter(s => s.enabled && !NON_LOCKABLE.has(s.schemaId))
    .map(s => ({ schemaId: s.schemaId, name: BIZ_SECTIONS.find(d => d.id === s.schemaId)?.name ?? s.schemaId }))
  const toggle = (schemaId: string) => {
    const next = protection.sections.includes(schemaId)
      ? protection.sections.filter(x => x !== schemaId)
      : [...protection.sections, schemaId]
    onChange({ ...protection, sections: next })
  }
  const ready = protection.password.length >= 6 && protection.sections.length > 0
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${protection.enabled ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Password Protection</p>
            <p className="text-[9px] text-gray-400">Lock sections behind a 6-digit PIN on the published VCard</p>
          </div>
        </div>
        <Toggle on={protection.enabled} onClick={() => onChange({ ...protection, enabled: !protection.enabled })} />
      </div>
      {protection.enabled && (
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">{protection.password ? 'Change 6-digit PIN' : '6-digit PIN'}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={protection.password}
              onChange={e => onChange({ ...protection, password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              placeholder="••••••"
              className={`${inputCls} text-center tracking-widest ${protection.password.length >= 6 ? 'border-emerald-300 dark:border-emerald-500/40' : ''}`}
            />
            {protection.password && (
              <button type="button" onClick={() => onChange({ ...protection, password: '', hint: '' })} className="mt-1.5 text-[9px] text-gray-400 hover:text-orange-500 underline underline-offset-2">
                Reset password
              </button>
            )}
          </div>
          <div>
            <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Unlock hint <span className="text-gray-300 dark:text-gray-600">(optional)</span></label>
            <input
              type="text"
              value={protection.hint}
              onChange={e => onChange({ ...protection, hint: e.target.value })}
              placeholder="e.g. Enter your membership PIN"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Locked sections</label>
            <div className="space-y-1.5">
              {options.map(opt => {
                const on = protection.sections.includes(opt.schemaId)
                return (
                  <button key={opt.schemaId} type="button" onClick={() => toggle(opt.schemaId)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${on ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-amber-500 border-amber-500' : 'border-gray-300 dark:border-gray-500'}`}>
                      {on && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    <span className="flex-1 text-[10px] font-medium text-gray-700 dark:text-gray-200 truncate">{opt.name}</span>
                  </button>
                )
              })}
              {options.length === 0 && (
                <p className="text-[9px] text-gray-400">No lockable sections on this VCard.</p>
              )}
            </div>
          </div>
          <p className={`text-[9px] ${ready ? 'text-emerald-600' : 'text-gray-400'}`}>
            {ready
              ? 'Protection will be applied when you save or publish.'
              : 'Add a 6-digit PIN and select at least one section to enable protection.'}
          </p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Device = 'phone' | 'tablet' | 'desktop'

export default function VCardContentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const vcardId = Number(id)

  const vcard = getVCardById(vcardId)
  const [sections, setSections] = useState<BizSectionState[]>(() => getVCardEditorContent(vcardId))
  const [protection, setProtection] = useState<VCardProtection>(() => getVCardProtection(vcardId))
  const [centreControls, setCentreControls] = useState<BusinessCentreControls>(() => getBusinessCentreControls(vcardId))
  const [appointment, setAppointment] = useState<AppointmentSettings>(() => getAppointmentSettings(vcardId))
  const [expanded, setExpanded] = useState<string | null>('profile')
  const [device, setDevice] = useState<Device>('phone')
  const [autoScroll, setAutoScroll] = useState(false)
  const [previewSection, setPreviewSection] = useState<string | null>(null)
  const [params] = useSearchParams()

  const centreParam = params.get('centre') || ''

  /* Jump straight to the Share / Exchange / Redeem centre the user clicked
     from the VCard detail page — expand its first section and scroll to it. */
  useEffect(() => {
    if (!centreParam) return
    const t = setTimeout(() => {
      const first = sections.find(s => (s.centre ?? BIZ_SECTION_CENTRES[s.schemaId] ?? 'other') === centreParam)
      if (first) setExpanded(first.uid)
      const el = document.getElementById(`centre-group-${centreParam}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreParam])

  const editableCount = useMemo(() => {
    let n = 0
    sections.forEach(s => {
      if (s.locked) return
      const def = BIZ_SECTIONS.find(d => d.id === s.schemaId)
      def?.fields.forEach(f => {
        if (f.type === 'list') {
          if (f.editable !== false) n += 1
        } else if (f.editable !== false) {
          n += 1
        }
      })
    })
    return n
  }, [sections])

  const updateValue = (uid: string, key: string, value: string) => {
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, values: { ...s.values, [key]: value } } : s)))
  }

  const updateItem = (uid: string, listKey: string, itemIndex: number, fieldKey: string, value: string) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = (s.items[listKey] ?? []).map((it, j) => (j === itemIndex ? { ...it, [fieldKey]: value } : it))
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
  }

  const addListItem = (uid: string, listKey: string) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const def = BIZ_SECTIONS.find(d => d.id === s.schemaId)
      const field = def?.fields.find(f => f.key === listKey)
      const empty: Record<string, string> = {}
      field?.itemFields?.forEach(ifd => { empty[ifd.key] = '' })
      return { ...s, items: { ...s.items, [listKey]: [...(s.items[listKey] ?? []), empty] } }
    }))
  }

  const removeListItem = (uid: string, listKey: string, itemIndex: number) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = (s.items[listKey] ?? []).filter((_, j) => j !== itemIndex)
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
  }

  const moveListItem = (uid: string, listKey: string, itemIndex: number, dir: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = [...(s.items[listKey] ?? [])]
      const target = itemIndex + dir
      if (target < 0 || target >= items.length) return s
      const [it] = items.splice(itemIndex, 1)
      items.splice(target, 0, it)
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
  }

  const handleBlock = (uid: string, op: 'add' | 'update' | 'move' | 'remove', payload: { type?: BizCustomBlockType; blockId?: number; patch?: Partial<BizCustomBlock>; dir?: -1 | 1 }) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      if (op === 'add' && payload.type) {
        return { ...s, blocks: [...s.blocks, buildCustomBlock(payload.type)] }
      }
      if (op === 'update' && payload.blockId != null && payload.patch) {
        return { ...s, blocks: s.blocks.map(b => (b.id === payload.blockId ? { ...b, ...payload.patch } : b)) }
      }
      if (op === 'move' && payload.blockId != null && payload.dir) {
        const blocks = [...s.blocks]
        const index = blocks.findIndex(b => b.id === payload.blockId)
        const target = index + payload.dir
        if (index < 0 || target < 0 || target >= blocks.length) return s
        const [b] = blocks.splice(index, 1)
        blocks.splice(target, 0, b)
        return { ...s, blocks }
      }
      if (op === 'remove' && payload.blockId != null) {
        return { ...s, blocks: s.blocks.filter(b => b.id !== payload.blockId) }
      }
      return s
    }))
  }

  const handleSave = () => {
    saveVCardEditorContent(vcardId, sections)
    saveVCardProtection(vcardId, protection)
    saveBusinessCentreControls(vcardId, centreControls)
    saveAppointmentSettings(vcardId, appointment)
    toast.success('VCard content saved')
  }

  const handlePublish = () => {
    saveVCardEditorContent(vcardId, sections)
    saveVCardProtection(vcardId, protection)
    saveBusinessCentreControls(vcardId, centreControls)
    saveAppointmentSettings(vcardId, appointment)
    toast.success('VCard published — new version created')
    navigate(`/b/vcards/${vcardId}`)
  }

  const handleReset = () => {
    resetVCardEditorContent(vcardId)
    setSections(getVCardEditorContent(vcardId))
    clearVCardProtection(vcardId)
    setProtection(getVCardProtection(vcardId))
    resetBusinessCentreControls(vcardId)
    setCentreControls(getBusinessCentreControls(vcardId))
    resetAppointmentSettings(vcardId)
    setAppointment(getAppointmentSettings(vcardId))
    toast.success('Changes reset to Admin template defaults')
  }

  if (!vcard) {
    return (
      <div>
        <Helmet><title>VCard not found - MCOMVCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">VCard not found</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">This VCard may have been removed by your Admin.</p>
          <Link to="/b/vcards" className="text-xs font-semibold text-orange-600 hover:underline">Back to My VCards</Link>
        </div>
      </div>
    )
  }

  const deviceWidth = device === 'phone' ? 'w-[340px]' : device === 'tablet' ? 'w-[560px]' : 'w-full max-w-[700px]'

  return (
    <div className="space-y-4">
      <Helmet><title>Edit {vcard.name} Content - MCOMVCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/b/vcards" className="hover:text-orange-600">My VCards</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <Link to={`/b/vcards/${vcard.id}`} className="hover:text-orange-600">{vcard.name}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Edit Content</span>
      </div>

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">{vcard.name}</h1>
              <Badge status={vcard.status} />
            </div>
            <p className="text-[10px] text-gray-400 truncate">{vcard.category} · {vcard.type} · {vcard.urlSlug}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={handleReset} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 border border-gray-200 dark:border-gray-600 hover:text-gray-600">Reset</button>
          <button onClick={handleSave} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex items-center gap-1 hover:bg-gray-50">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Save Draft
          </button>
          <button onClick={handlePublish} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-orange-500 text-white flex items-center gap-1 hover:bg-orange-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Publish
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <Link to={`/b/vcards/${vcard.id}`} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 hover:text-gray-600">Cancel</Link>
        </div>
      </div>

      {/* Helper strip */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="text-[11px] leading-relaxed text-orange-700 dark:text-orange-300">
            <span className="font-semibold">Structure from your Admin template.</span> The layout, section order and locked fields are fixed by Admin — you can only edit the <span className="font-semibold">{editableCount} approved fields</span> (marked <span className="font-semibold">Editable</span>). Locked sections show their current values for reference.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0">
          <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Editable</span>
          <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" /> Admin-managed</span>
        </div>
      </div>

      {/* Editor: components left, preview right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ==================== LEFT — Components / Fields ==================== */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Components</h4>
            <span className="text-[9px] text-gray-400">{sections.length} sections · {editableCount} editable fields</span>
          </div>
          {/* Grouped by centre — Header, Share, Exchange, Redeem, More —
              exactly the arrangement the Admin built and the live preview shows. */}
          {CENTRE_ORDER.map(centreId => {
            const centre = CENTRES.find(c => c.id === centreId)
            /* The 'Make an Appointment' section card is replaced by the
               Appointment Booking settings panel rendered inside the Share
               centre, so businesses configure booking in one place only. */
            const group = sections.filter(s =>
              s.schemaId !== 'appointment' &&
              (s.centre ?? BIZ_SECTION_CENTRES[s.schemaId] ?? 'other') === centreId
            )
            if (!centre) return null
            const hasAppointmentPanel = centreId === 'share'
            if (group.length === 0 && !hasAppointmentPanel) return null
            const accent = CENTRE_ACCENT[centre.accent] ?? CENTRE_ACCENT.gray
            return (
              <div key={centreId} id={`centre-group-${centreId}`} className={`rounded-xl border overflow-hidden ${accent.border} ${accent.bg}`}>
                <div className={`px-3 py-2 flex items-center gap-2 ${accent.headerBg}`}>
                  <svg className={`w-3.5 h-3.5 shrink-0 ${accent.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={centre.icon} />
                  </svg>
                  <p className={`text-[11px] font-bold ${accent.text}`}>{centre.name}</p>
                  <span className="ml-auto text-[9px] font-medium text-gray-400">{group.length} {group.length === 1 ? 'section' : 'sections'}</span>
                </div>
                <div className="p-2.5 space-y-2.5">
                  {hasAppointmentPanel && (
                    <AppointmentSettingsPanel settings={appointment} onChange={setAppointment} />
                  )}
                  {group.map(section => (
                    <SectionCard
                      key={section.uid}
                      section={section}
                      expanded={expanded === section.uid}
                      onToggle={() => setExpanded(expanded === section.uid ? null : section.uid)}
                      onField={(k, v) => updateValue(section.uid, k, v)}
                      onList={(listKey, i, fk, v) => updateItem(section.uid, listKey, i, fk, v)}
                      onListAdd={(listKey) => addListItem(section.uid, listKey)}
                      onListRemove={(listKey, i) => removeListItem(section.uid, listKey, i)}
                      onListMove={(listKey, i, dir) => moveListItem(section.uid, listKey, i, dir)}
                      onBlock={(op, payload) => handleBlock(section.uid, op, payload)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Share / Exchange / Redeem — business controls for each centre.
              Content designed here feeds the Share · Exchange · Redeem sections
              shown on the published card page. */}
          <div className="pt-1">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Share · Exchange · Redeem controls</h4>
            <div className="space-y-3">
              <ShareCentreControls controls={centreControls} onChange={setCentreControls} />
              <ExchangeCentreControls controls={centreControls} onChange={setCentreControls} />
              <RedeemCentreControls controls={centreControls} onChange={setCentreControls} />
            </div>
          </div>

          <PasswordProtectionPanel
            protection={protection}
            onChange={setProtection}
            sections={sections}
          />
        </div>

        {/* ==================== RIGHT — Live Preview ==================== */}
        <div className="min-w-0 lg:sticky lg:top-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Preview</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 shrink-0">Auto-updates</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  {(['phone', 'tablet', 'desktop'] as const).map(d => (
                    <button key={d} onClick={() => { setDevice(d); setAutoScroll(false) }}
                      className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${device === d ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
                <button onClick={() => setAutoScroll(a => !a)}
                  className={`px-2 py-1 rounded text-[9px] font-semibold transition-colors ${autoScroll ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-gray-700'}`}>
                  Auto-scroll
                </button>
              </div>
            </div>

            <div className="p-4 flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {autoScroll ? (
                <ScrollingVCard
                  sections={sections}
                  centres={buildBusinessCentres(sections, centreControls, appointment)}
                  protection={protection}
                  widthClass={device === 'phone' ? 'w-[300px]' : device === 'tablet' ? 'w-[480px]' : 'w-[700px]'}
                  heightClass={device === 'phone' ? 'h-[540px]' : device === 'tablet' ? 'h-[580px]' : 'h-[620px]'}
                />
              ) : (
                <div className={`${deviceWidth} rounded-[28px] border-[6px] border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden`}>
                  <div className="h-[560px] overflow-y-auto bg-white dark:bg-gray-900">
                    <VCardPhoneContent
                      sections={sections as never}
                      centres={buildBusinessCentres(sections, centreControls, appointment)}
                      protection={protection}
                      interactive
                      selected={previewSection}
                      onSelect={(uid) => {
                        setPreviewSection(uid)
                        if (uid && sections.some(s => s.uid === uid)) setExpanded(uid)
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-[9px] text-gray-400 pb-4 -mt-1">
              {autoScroll
                ? 'Hover the preview to scroll through the whole card · click to pause'
                : 'Scroll the preview to see the full long-scrolling VCard — edits update instantly'}
            </p>
          </div>

          {/* Template info card */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Template from Admin</h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Template</span><span className="font-medium text-gray-700 dark:text-gray-200">{vcard.type}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Business</span><span className="font-medium text-gray-700 dark:text-gray-200">{mockBusinessProfile.name}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Last Admin update</span><span className="font-medium text-gray-700 dark:text-gray-200">{vcard.lastAdminUpdate}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-400">Locked sections</span><span className="font-medium text-gray-700 dark:text-gray-200">{sections.filter(s => s.locked).length} of {sections.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
