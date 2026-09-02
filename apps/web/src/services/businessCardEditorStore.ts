/* ------------------------------------------------------------------ */
/*  MCOMVCard Business Card Content Editor — mock data store.          */
/*  Businesses edit the CONTENT of an admin-assigned Business Card     */
/*  template (85 × 55 mm, front + back faces). The structure, layout   */
/*  and locked fields come from the Admin's Card Template Builder.     */
/*  Mirrors the admin builder's section schema so the shared preview   */
/*  renderer (LayoutFaceContent) renders the card identically.         */
/* ------------------------------------------------------------------ */

import type { CardFaces, CardSectionState } from './cardTemplateStore'
import { getCardTemplate, loadCardTemplatesByType } from './cardTemplateStore'
import { MOCK, toRow, type CardRow } from '../pages/admin/card-management/BusinessCardTemplatesPage'
import { buildMockFaces } from '../components/admin/CardPreview'

export type { CardRow }

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BizCardFieldType = 'text' | 'textarea' | 'image' | 'select' | 'toggle' | 'list'

export interface BizCardItemFieldDef {
  key: string
  label: string
  type: BizCardFieldType
  options?: string[]
  placeholder?: string
  editable?: boolean
}

export interface BizCardFieldDef {
  key: string
  label: string
  type: BizCardFieldType
  options?: string[]
  placeholder?: string
  editable?: boolean
  itemLabel?: string
  itemFields?: BizCardItemFieldDef[]
}

export interface BizCardSectionDef {
  id: string
  face: 'front' | 'back'
  name: string
  icon: string
  desc: string
  /* Whole section locked by Admin — business can only view it. */
  locked: boolean
  fields: BizCardFieldDef[]
}

export interface BizCardSectionState {
  uid: string
  face: 'front' | 'back'
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: { id: number; type: string; values: Record<string, string> }[]
  fontSize?: number
  /* Runtime locked flag copied from the Admin template definition. */
  locked: boolean
  blocksAllowed: boolean
}

/* ------------------------------------------------------------------ */
/*  Section schema — mirrors the admin Card Template Builder.          */
/*  Same ids/names as the admin builder so the shared preview renders  */
/*  identically. `editable: false` fields are locked by the Admin.     */
/*  The Security section keeps the lock flags Admin-managed while the  */
/*  business can set the actual password value + hint.                 */
/* ------------------------------------------------------------------ */

export const BIZ_CARD_SECTIONS: BizCardSectionDef[] = [
  /* ── FRONT face ─────────────────────────────────────────────────── */
  {
    id: 'background',
    face: 'front',
    name: 'Background',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Card background image, or solid / gradient colour',
    locked: true,
    fields: [
      { key: 'image', label: 'Background Image', type: 'image', editable: false },
      { key: 'bgColor', label: 'Background Colour', type: 'text', editable: false },
      { key: 'gradientFrom', label: 'Gradient From', type: 'text', editable: false },
      { key: 'gradientTo', label: 'Gradient To', type: 'text', editable: false },
    ],
  },
  {
    id: 'branding',
    face: 'front',
    name: 'Branding & Logo',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    desc: 'Business name, logo and tagline on the card face',
    locked: false,
    fields: [
      { key: 'logo', label: 'Logo', type: 'image', editable: true, placeholder: 'https://example.com/logo.png' },
      { key: 'brandName', label: 'Brand Name', type: 'text', editable: true, placeholder: 'ACME Corp' },
      { key: 'tagline', label: 'Tagline', type: 'text', editable: true, placeholder: 'Member since 2025' },
    ],
  },
  {
    id: 'memberPhoto',
    face: 'front',
    name: 'Member Identity',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    desc: 'Cardholder photo, name and membership label',
    locked: false,
    fields: [
      { key: 'photo', label: 'Member Photo', type: 'image', editable: true, placeholder: 'https://example.com/photo.jpg' },
      { key: 'memberName', label: 'Member Name', type: 'text', editable: true, placeholder: 'John Smith' },
      { key: 'membershipLabel', label: 'Membership Label', type: 'text', editable: true, placeholder: 'Member' },
    ],
  },
  {
    id: 'tierBadge',
    face: 'front',
    name: 'Membership Badge',
    icon: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z',
    desc: 'Tier badge shown on the card face',
    locked: true,
    fields: [
      { key: 'tier', label: 'Tier', type: 'select', editable: false, options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'VIP', 'Premium'] },
      { key: 'level', label: 'Level Text', type: 'text', editable: false },
      { key: 'showIcon', label: 'Show Badge Icon', type: 'toggle', editable: false },
    ],
  },
  {
    id: 'cardDetails',
    face: 'front',
    name: 'Card Details',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    desc: 'Card number, member ID and expiry',
    locked: true,
    fields: [
      {
        key: 'rows',
        label: 'Details',
        type: 'list',
        itemLabel: 'Detail',
        editable: false,
        itemFields: [
          { key: 'label', label: 'Label', type: 'select', editable: false, options: ['Card Number', 'Member ID', 'Expiry', 'Issue Date', 'CVV', 'Batch', 'Account'] },
          { key: 'value', label: 'Value', type: 'text', editable: false },
        ],
      },
    ],
  },
  {
    id: 'ffIndicator',
    face: 'front',
    name: 'Friends & Family',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    desc: 'Friends & family indicator shown on the card face',
    locked: true,
    fields: [
      { key: 'indicator', label: 'Indicator Style', type: 'select', editable: false, options: ['Numeric Badge', 'Progress Indicator', 'Card Stack Icon', 'Hidden Until Allocated', 'None'] },
      { key: 'count', label: 'Allocated Count', type: 'text', editable: false },
    ],
  },
  {
    id: 'qr',
    face: 'front',
    name: 'QR Code',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
    desc: 'Dynamic QR code — position, size and design',
    locked: true,
    fields: [
      { key: 'position', label: 'Position', type: 'select', editable: false, options: ['Bottom Right', 'Top Right', 'Bottom Left', 'Top Left', 'Center'] },
      { key: 'size', label: 'Size', type: 'select', editable: false, options: ['Small', 'Medium', 'Large', 'Extra Large'] },
      { key: 'url', label: 'QR Payload URL', type: 'text', editable: false },
    ],
  },
  {
    id: 'security',
    face: 'front',
    name: 'Security & Password',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    desc: 'Security chip and password protection. Lock toggles are Admin-managed — you can set the password value and hint.',
    locked: false,
    fields: [
      { key: 'hasSecurity', label: 'Enable Security Chip', type: 'toggle', editable: false },
      { key: 'chipLabel', label: 'Chip Label', type: 'text', editable: false },
      { key: 'hasPassword', label: 'Require Password to Unlock', type: 'toggle', editable: false },
      { key: 'password', label: 'Password', type: 'text', editable: true, placeholder: 'e.g. 1234' },
      { key: 'passwordHint', label: 'Password Hint', type: 'text', editable: true, placeholder: 'Ask staff for the PIN' },
      { key: 'passwordMessage', label: 'Locked Message', type: 'text', editable: false },
    ],
  },
  {
    id: 'rewardsProgress',
    face: 'front',
    name: 'Rewards Progress',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    desc: 'Progress display on the card face',
    locked: true,
    fields: [
      { key: 'display', label: 'Display Style', type: 'select', editable: false, options: ['Progress Bar', 'Circular Progress', 'Percentage', 'Milestone Badges', 'None'] },
      { key: 'current', label: 'Current Value', type: 'text', editable: false },
      { key: 'target', label: 'Target Value', type: 'text', editable: false },
    ],
  },
  {
    id: 'countdown',
    face: 'front',
    name: 'Season Countdown',
    icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
    desc: 'Live countdown to the end of an active season',
    locked: true,
    fields: [
      { key: 'seasonIds', label: 'Seasons', type: 'text', editable: false },
      { key: 'label', label: 'Label', type: 'text', editable: false },
      { key: 'color', label: 'Accent Colour', type: 'text', editable: false },
    ],
  },

  /* ── BACK face ──────────────────────────────────────────────────── */
  {
    id: 'magneticStripe',
    face: 'back',
    name: 'Magnetic Stripe',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    desc: 'Magnetic stripe band on the card back',
    locked: true,
    fields: [
      { key: 'color', label: 'Stripe Colour', type: 'text', editable: false },
    ],
  },
  {
    id: 'signature',
    face: 'back',
    name: 'Signature Line',
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    desc: 'Signature strip with optional signature image',
    locked: false,
    fields: [
      { key: 'signature', label: 'Signature Image', type: 'image', editable: true, placeholder: 'https://example.com/signature.png' },
      { key: 'label', label: 'Label', type: 'text', editable: true, placeholder: 'Authorized Signature' },
    ],
  },
  {
    id: 'terms',
    face: 'back',
    name: 'Terms & Instructions',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    desc: 'Small print on the card back',
    locked: true,
    fields: [
      { key: 'termsText', label: 'Terms Text', type: 'textarea', editable: false },
    ],
  },
  {
    id: 'contactInfo',
    face: 'back',
    name: 'Contact Info',
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    desc: 'Website, phone and support details',
    locked: false,
    fields: [
      {
        key: 'rows',
        label: 'Contacts',
        type: 'list',
        itemLabel: 'Contact',
        editable: true,
        itemFields: [
          { key: 'type', label: 'Type', type: 'select', editable: false, options: ['Website', 'Phone', 'Email', 'Support', 'Address'] },
          { key: 'label', label: 'Label', type: 'text', editable: true, placeholder: 'Web' },
          { key: 'value', label: 'Value', type: 'text', editable: true, placeholder: 'www.example.com' },
        ],
      },
    ],
  },
  {
    id: 'footerBranding',
    face: 'back',
    name: 'Footer Logo',
    icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z',
    desc: 'Branding at the bottom of the card back',
    locked: true,
    fields: [
      { key: 'logo', label: 'Logo', type: 'image', editable: false },
      { key: 'tagline', label: 'Tagline', type: 'text', editable: false },
    ],
  },
  {
    id: 'share',
    face: 'back',
    name: 'Share Card',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    desc: 'Share, download and save this card',
    locked: true,
    fields: [
      { key: 'label', label: 'Button Label', type: 'text', editable: false },
    ],
  },
  {
    id: 'exchange',
    face: 'back',
    name: 'Exchange Contact',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    desc: 'Swap contact details with a tap or QR scan',
    locked: true,
    fields: [
      { key: 'label', label: 'Heading', type: 'text', editable: false },
    ],
  },
  {
    id: 'redeem',
    face: 'back',
    name: 'Redeem Rewards',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Redeem points, offers, coupons and rewards',
    locked: true,
    fields: [
      { key: 'label', label: 'Heading', type: 'text', editable: false },
    ],
  },
  {
    id: 'buildGroup',
    face: 'back',
    name: 'Build Group',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    desc: 'Invite members and grow a group or community',
    locked: true,
    fields: [
      { key: 'label', label: 'Heading', type: 'text', editable: false },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Card row helpers — the business consumes Admin business card       */
/*  templates (built-in + user-created stored ones).                   */
/* ------------------------------------------------------------------ */

export function getBusinessCardRows(): CardRow[] {
  const stored = loadCardTemplatesByType('business').map(toRow)
  return [...MOCK, ...stored]
}

export function getBusinessCardRow(cardId: string): CardRow | null {
  const mock = MOCK.find(m => m.id === cardId)
  if (mock) return mock
  const stored = getCardTemplate(Number(cardId))
  return stored ? toRow(stored) : null
}

/* ------------------------------------------------------------------ */
/*  Default faces for a card (stored template faces, else the admin's  */
/*  representational mock preview).                                    */
/* ------------------------------------------------------------------ */

function cardFacesFor(row: CardRow): CardFaces {
  if (row.isStored) {
    const stored = getCardTemplate(Number(row.id))
    if (stored) return stored.builder.faces
  }
  return buildMockFaces({
    name: row.name,
    templateId: row.templateId,
    cardType: 'business',
    theme: row.theme,
    category: row.category,
    qrPosition: row.qrPosition,
    qrSize: row.qrSize,
    hasSecurity: row.hasSecurity,
    ffIndicator: row.ffIndicator,
    progressDisplay: row.progressDisplay,
  })
}

/* ------------------------------------------------------------------ */
/*  Build the full editor state for a card.                            */
/* ------------------------------------------------------------------ */

export function buildEditorSections(cardId: string): BizCardSectionState[] {
  const row = getBusinessCardRow(cardId) ?? getBusinessCardRows()[0]
  if (!row) return []
  const faces = cardFacesFor(row)

  return BIZ_CARD_SECTIONS.map(def => {
    const src = faces[def.face].find(s => s.schemaId === def.id)
    const values: Record<string, string> = {}
    const items: Record<string, Record<string, string>[]> = {}
    def.fields.forEach(field => {
      if (field.type === 'list' && field.itemFields) {
        items[field.key] = (src?.items[field.key] ?? []).map(item => {
          const base: Record<string, string> = {}
          field.itemFields!.forEach(ifd => {
            base[ifd.key] = item[ifd.key] ?? ''
          })
          return base
        })
      } else {
        values[field.key] = src?.values[field.key] ?? ''
      }
    })

    /* Seed a usable password on security-enabled cards so the business
       can demo the password protection feature without touching the
       Admin-managed lock flag. */
    if (def.id === 'security' && row.hasSecurity && !values.password) {
      values.hasPassword = values.hasPassword || 'true'
      values.password = values.password || '1234'
      values.passwordHint = values.passwordHint || 'Ask staff for the PIN'
    }

    return {
      uid: `${def.face}-${def.id}`,
      face: def.face,
      schemaId: def.id,
      name: def.name,
      enabled: src?.enabled ?? true,
      values,
      items,
      blocks: [],
      fontSize: src?.fontSize,
      locked: def.locked,
      blocksAllowed: false,
    }
  })
}

/* ------------------------------------------------------------------ */
/*  Store — per-card editor content persisted to localStorage.         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'mcom.business.card.editor'

function loadRaw(): Record<string, BizCardSectionState[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persist(cardId: string, sections: BizCardSectionState[]) {
  const all = loadRaw()
  all[String(cardId)] = sections
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getCardEditorContent(cardId: string): BizCardSectionState[] {
  const all = loadRaw()
  const saved = all[String(cardId)]
  const fresh = buildEditorSections(cardId)
  if (!saved) return fresh
  /* Merge onto the template so schema changes (e.g. new locked flags) win. */
  return fresh.map(tpl => {
    const prev = saved.find(s => s.face === tpl.face && s.schemaId === tpl.schemaId)
    if (!prev) return tpl
    return {
      ...tpl,
      values: { ...tpl.values, ...prev.values },
      items: { ...tpl.items, ...prev.items },
    }
  })
}

export function saveCardEditorContent(cardId: string, sections: BizCardSectionState[]) {
  persist(cardId, sections)
}

export function resetCardEditorContent(cardId: string) {
  const all = loadRaw()
  delete all[String(cardId)]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers for previews and the detail page.                          */
/* ------------------------------------------------------------------ */

export function sectionsToFaces(sections: BizCardSectionState[]): CardFaces {
  const toState = (s: BizCardSectionState): CardSectionState => ({
    uid: s.uid,
    face: s.face,
    schemaId: s.schemaId,
    name: s.name,
    enabled: s.enabled,
    values: s.values,
    items: s.items,
    blocks: [],
    fontSize: s.fontSize,
    layout: undefined,
  })
  return {
    front: sections.filter(s => s.face === 'front').map(toState),
    back: sections.filter(s => s.face === 'back').map(toState),
  }
}

export interface CardPasswordInfo {
  locked: boolean
  enabled: boolean
  hasPassword: boolean
  password: string
  hint: string
  message: string
}

export function getCardPasswordInfo(sections: BizCardSectionState[]): CardPasswordInfo {
  const sec = sections.find(s => s.schemaId === 'security')
  const values = sec?.values ?? {}
  return {
    locked: !!sec?.locked,
    enabled: values.hasPassword === 'true',
    hasPassword: !!values.password,
    password: values.password ?? '',
    hint: values.passwordHint ?? '',
    message: values.passwordMessage ?? 'This card is password protected',
  }
}

export function setCardPassword(cardId: string, password: string, hint: string, message: string) {
  const sections = getCardEditorContent(cardId)
  saveCardEditorContent(cardId, sections.map(s => {
    if (s.schemaId !== 'security') return s
    return {
      ...s,
      values: {
        ...s.values,
        password,
        passwordHint: hint,
        passwordMessage: message,
      },
    }
  }))
}

export function countEditableCardFields(sections: BizCardSectionState[]): number {
  let n = 0
  sections.forEach(s => {
    if (s.locked) return
    const def = BIZ_CARD_SECTIONS.find(d => d.id === s.schemaId)
    def?.fields.forEach(f => {
      if (f.type === 'list') {
        if (f.editable !== false) n += 1
      } else if (f.editable !== false) {
        n += 1
      }
    })
  })
  return n
}
