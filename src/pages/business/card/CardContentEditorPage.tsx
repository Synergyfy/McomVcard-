import { useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LayoutFaceContent } from '../../../components/admin/CardPreview'
import {
  getCardEditorContent,
  saveCardEditorContent,
  resetCardEditorContent,
  sectionsToFaces,
  countEditableCardFields,
  BIZ_CARD_SECTIONS,
  type BizCardSectionState,
  type BizCardFieldDef,
} from '../../../services/businessCardEditorStore'
import { getBusinessCardRow } from '../../../services/businessCardEditorStore'

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function LockTag({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${className}`}>
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      Admin-managed
    </span>
  )
}

function EditableTag() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      Editable
    </span>
  )
}

function ImageUploadField({ label, value, onChange, placeholder, disabled }: {
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

function LockedValue({ label, value }: { label: string; value: string }) {
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
  field: BizCardFieldDef
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

function ListItemEditor({ field, item, onUpdate }: {
  field: BizCardFieldDef
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
/*  Section card (left panel)                                          */
/* ------------------------------------------------------------------ */

function SectionCard({ section, expanded, onToggle, onField, onList, onListAdd, onListRemove, onListMove }: {
  section: BizCardSectionState
  expanded: boolean
  onToggle: () => void
  onField: (key: string, value: string) => void
  onList: (listKey: string, index: number, fieldKey: string, value: string) => void
  onListAdd: (listKey: string) => void
  onListRemove: (listKey: string, index: number) => void
  onListMove: (listKey: string, index: number, dir: -1 | 1) => void
}) {
  const def = BIZ_CARD_SECTIONS.find(d => d.id === section.schemaId)!
  const locked = section.locked

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${locked ? 'border-dashed border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
      <div className="p-3 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${locked ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-orange-500/10 text-orange-500'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={def.icon} /></svg>
        </div>
        <div className="flex-1 min-w-0">
          <button onClick={onToggle} className="text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-orange-600 text-left truncate">{section.name}</button>
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
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Flip preview (front / back, 85 × 55 mm)                            */
/* ------------------------------------------------------------------ */

function BizCardFlipPreview({ sections }: { sections: BizCardSectionState[] }) {
  const [flipped, setFlipped] = useState(false)
  const faces = sectionsToFaces(sections)
  return (
    <div style={{ perspective: '1200px' }}>
      <div
        className="relative w-[340px] max-w-full aspect-[85/55] cursor-pointer transition-transform duration-700 select-none mx-auto"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onClick={() => setFlipped(!flipped)}
        title="Click to flip"
      >
        <div className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg" style={{ backfaceVisibility: 'hidden' }}>
          <LayoutFaceContent face="front" sections={faces.front} />
        </div>
        <div className="absolute inset-0 rounded-[10px] overflow-hidden shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <LayoutFaceContent face="back" sections={faces.back} />
        </div>
      </div>
      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-2">
        {flipped ? 'Back' : 'Front'} · click the card to flip · 85 × 55 mm
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type CardFace = 'front' | 'back'

export default function CardContentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const cardId = Number(id)
  const row = getBusinessCardRow(cardId)

  const [sections, setSections] = useState<BizCardSectionState[]>(() => getCardEditorContent(cardId))
  const [expanded, setExpanded] = useState<string | null>('front-branding')
  const [face, setFace] = useState<CardFace>('front')
  const [previewFace, setPreviewFace] = useState<CardFace>('front')

  const editableCount = useMemo(() => countEditableCardFields(sections), [sections])
  const faceSections = sections.filter(s => s.face === face)

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
      const def = BIZ_CARD_SECTIONS.find(d => d.id === s.schemaId)
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

  const handleSave = () => {
    saveCardEditorContent(cardId, sections)
    toast.success('Card content saved')
  }

  const handlePublish = () => {
    saveCardEditorContent(cardId, sections)
    toast.success('Card published — new version created')
    navigate(`/b/cards/${cardId}`)
  }

  const handleReset = () => {
    resetCardEditorContent(cardId)
    setSections(getCardEditorContent(cardId))
    toast.success('Changes reset to Admin template defaults')
  }

  if (!row) {
    return (
      <div>
        <Helmet><title>Card not found - MCOMVCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-10 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Card not found</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">This Card may have been removed by your Admin.</p>
          <Link to="/b/cards" className="text-xs font-semibold text-orange-600 hover:underline">Back to My Cards</Link>
        </div>
      </div>
    )
  }

  const statusCls = row.status === 'Published'
    ? 'bg-green-50 dark:bg-green-500/10 text-green-600'
    : row.status === 'Draft'
      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'

  return (
    <div className="space-y-4">
      <Helmet><title>Edit {row.name} Content - MCOMVCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/b/cards" className="hover:text-orange-600">My Cards</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <Link to={`/b/cards/${row.id}`} className="hover:text-orange-600">{row.name}</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Edit Content</span>
      </div>

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">{row.name}</h1>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusCls}`}>{row.status}</span>
            </div>
            <p className="text-[10px] text-gray-400 truncate">{row.templateId} · v{row.version} · {row.category} · 85 × 55 mm</p>
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
          <Link to={`/b/cards/${row.id}`} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 hover:text-gray-600">Cancel</Link>
        </div>
      </div>

      {/* Helper strip */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-orange-700 dark:text-orange-300">
            <span className="font-semibold">Structure from your Admin template.</span> The layout, section order and locked fields are fixed by Admin — you can only edit the <span className="font-semibold">{editableCount} approved fields</span> (marked <span className="font-semibold">Editable</span>). Locked sections show their current values for reference.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Editable</span>
          <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" /> Admin-managed</span>
        </div>
      </div>

      {/* Editor: components left, preview right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ==================== LEFT — Components / Fields ==================== */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Components</h4>
            <span className="text-[9px] text-gray-400">{sections.length} sections · {editableCount} editable fields</span>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 w-fit">
            {(['front', 'back'] as const).map(f => (
              <button key={f} onClick={() => { setFace(f); setExpanded(`${f}-${f === 'front' ? 'branding' : 'signature'}`) }}
                className={`px-3 py-1.5 rounded text-[10px] font-semibold transition-colors ${face === f ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {f === 'front' ? 'Front Face' : 'Back Face'}
              </button>
            ))}
          </div>

          {faceSections.map(section => (
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
            />
          ))}
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
                  {(['front', 'back'] as const).map(f => (
                    <button key={f} onClick={() => setPreviewFace(f)}
                      className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${previewFace === f ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <BizCardFlipPreview sections={sections} />
            </div>
            <p className="text-center text-[9px] text-gray-400 pb-4 -mt-1">
              Click the card to flip between front and back — edits update instantly
            </p>
          </div>

          {/* Template info card */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Template from Admin</h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Template ID</span><span className="font-medium text-gray-700 dark:text-gray-200 font-mono">{row.templateId}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Version</span><span className="font-medium text-gray-700 dark:text-gray-200">v{row.version}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Category</span><span className="font-medium text-gray-700 dark:text-gray-200">{row.category}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Updated</span><span className="font-medium text-gray-700 dark:text-gray-200">{row.lastUpdated}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-400">Locked sections</span><span className="font-medium text-gray-700 dark:text-gray-200">{sections.filter(s => s.locked).length} of {sections.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
