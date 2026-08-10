import { useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ScrollingVCard, { type ScrollingVCardHandle } from '../../../components/common/ScrollingVCard'
import { buildPublishedSections } from '../../admin/card-management/BusinessVCardWorkspace'
import type { BizVCardTemplate } from '../../admin/card-management/BusinessVCardTemplatesPage'
import { loadUserTemplatesByType } from '../../../services/vcardTemplateStore'
import { claimVCard } from '../../../services/businessStore'
import { saveVCardEditorContent, buildBusinessCentres, BIZ_SECTIONS, type BizSectionState, type BizCustomBlock, type BizCustomBlockType } from '../../../services/businessVCardEditorStore'
import { SectionCard } from './VCardContentEditorPage'

/* Convert template builder sections (or synthesized published sections)
   into the business editor shape so the SectionCard fields can edit them,
   and the locked flags come from the admin template definition. */
function toEditorSections(t: BizVCardTemplate): BizSectionState[] {
  const stored = loadUserTemplatesByType('business')
    .find(x => x.id === t.id || x.templateId === t.templateId)
  const base = stored
    ? (stored.builder.sections as unknown as BizSectionState[])
    : (buildPublishedSections(t) as unknown as BizSectionState[])

  return base.map(s => {
    const def = BIZ_SECTIONS.find(d => d.id === s.schemaId)
    return {
      uid: s.uid,
      schemaId: s.schemaId,
      name: s.name,
      enabled: s.enabled,
      values: { ...(s.values ?? {}) },
      items: { ...(s.items ?? {}) },
      blocks: s.blocks ?? [],
      locked: def?.locked ?? true,
      blocksAllowed: !!def?.blocksAllowed,
      centre: s.centre,
    }
  })
}

const GRADIENTS = [
  'from-orange-500 to-amber-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
]

export default function ClaimTemplateModal({ template, onClose, onClaimed }: {
  template: BizVCardTemplate
  onClose: () => void
  onClaimed: (id: number) => void
}) {
  const [sections, setSections] = useState<BizSectionState[]>(() => toEditorSections(template))
  const [expanded, setExpanded] = useState<string | null>(sections[0]?.uid ?? null)
  const scrollRef = useRef<ScrollingVCardHandle>(null)
  const [scrollActive, setScrollActive] = useState(false)

  const editableCount = useMemo(() => {
    let n = 0
    sections.forEach(s => {
      if (s.locked) return
      const def = BIZ_SECTIONS.find(d => d.id === s.schemaId)
      def?.fields.forEach(f => {
        if (f.editable !== false) n += 1
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
        const block: BizCustomBlock = { id: Date.now() + Math.floor(Math.random() * 1000), type: payload.type, values: {} }
        return { ...s, blocks: [...s.blocks, block] }
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

  const handleClaim = () => {
    /* Save the claimed vcard into the business vcard list + editor store. */
    const name = sections.find(s => s.schemaId === 'profile')?.values.name || template.name
    const sectionNames = sections.map(s => s.name)
    const gradient = GRADIENTS[(template.id + sections.length) % GRADIENTS.length]

    const vcard = claimVCard({
      name,
      type: template.category,
      category: template.industry,
      description: template.description,
      urlSlug: template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      sections: sectionNames,
      previewColor: '#F97316',
      previewGradient: gradient,
    })
    saveVCardEditorContent(vcard.id, sections)
    toast.success(`"${template.name}" claimed — added to your VCards`)
    onClaimed(vcard.id)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">Claim & Customise — {template.name}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {template.templateId} · v{template.version} · {template.category} — edit only the fields your Admin allows, then it's added to your VCards.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Live preview */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Preview</h5>
                <button onClick={() => scrollRef.current?.toggle()} className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium hover:bg-gray-200">
                  {scrollActive ? 'Pause' : 'Resume'}
                </button>
              </div>
              <div className="flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl py-8">
                <ScrollingVCard ref={scrollRef} sections={sections} centres={buildBusinessCentres(sections)} heightClass="h-[58vh]" widthClass="w-[280px] sm:w-[300px]" onStateChange={setScrollActive} />
              </div>
              <p className="text-[9px] text-gray-400 mt-2 text-center">Hover to scroll · tap to pause — exactly how it renders live.</p>
            </div>

            {/* Editable fields */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Components</h5>
                <span className="text-[9px] text-gray-400">{sections.length} sections · {editableCount} editable fields</span>
              </div>
              <div className="space-y-3">
                {sections.map(section => (
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <span className="text-[9px] text-gray-400">Grey sections are Admin-managed and fixed to the template — they're shown for reference.</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={handleClaim} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Claim VCard</button>
          </div>
        </div>
      </div>
    </div>
  )
}
