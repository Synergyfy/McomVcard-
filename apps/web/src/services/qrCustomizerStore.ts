/* ------------------------------------------------------------------ */
/*  System-generated QR customization (the QR Customizer page).        */
/*  Persisted in localStorage so the template builder can apply the    */
/*  saved design after the admin returns from the customizer.          */
/* ------------------------------------------------------------------ */

export interface QrCustomization {
  qrType: string
  qrDestination: string
  qrDynamic: string
  qrColor: string
  qrBgColor: string
  qrLogo: string
  qrStyle: string
  pending?: boolean
}

export const DEFAULT_QR_CUSTOMIZATION: QrCustomization = {
  qrType: 'Open this VCard',
  qrDestination: 'https://vcard.mcom/b/this-card',
  qrDynamic: 'true',
  qrColor: '#111827',
  qrBgColor: '#ffffff',
  qrLogo: '',
  qrStyle: 'square',
  pending: false,
}

const KEY = 'mcom_vcard_qr_customizer'

export function getQrCustomization(): QrCustomization {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_QR_CUSTOMIZATION }
    return { ...DEFAULT_QR_CUSTOMIZATION, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_QR_CUSTOMIZATION }
  }
}

export function setQrCustomization(c: QrCustomization) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...c, pending: true })) } catch { /* ignore quota */ }
}

export function consumeQrCustomization(): QrCustomization | null {
  const c = getQrCustomization()
  if (!c.pending) return null
  try { localStorage.setItem(KEY, JSON.stringify({ ...c, pending: false })) } catch { /* ignore */ }
  return c
}

/* ------------------------------------------------------------------ */
/*  Builder draft — keeps the template builder state across the round  */
/*  trip to the QR Customizer page (which is a separate route).        */
/* ------------------------------------------------------------------ */

export interface BuilderDraftCentre {
  id: string
  name: string
  enabled: boolean
  showTitle: boolean
  fontSize: number
  password: string
  hint: string
  lockedMessage: string
  /* Per-centre content source */
  contentMode?: 'items' | 'webhook' | 'link' | 'integration'
  contentTitle?: string
  items?: Record<string, string | undefined>[]
  webhookUrl?: string
  description?: string
  linkLabel?: string
  linkUrl?: string
  integrationPlatform?: string
  integrationEnabled?: boolean
}

export interface BuilderDraft {
  editingId: number | null
  templateName: string
  templateType: 'business' | 'consumer'
  templateCategory: string
  layoutPreset: string
  templateUses?: string[]
  seasons?: string[]
  sectors?: string[]
  activeStep: string
  sections: Array<{
    uid: string
    schemaId: string
    name: string
    enabled: boolean
    values: Record<string, string>
    items: Record<string, Record<string, string>[]>
    blocks: Array<{ id: number; type: string; values: Record<string, string>; options: string[]; formats: string[] }>
    fontSize?: number
  }>
  centres?: BuilderDraftCentre[]
}

const DRAFT_KEY = 'mcom_vcard_builder_draft'

export function saveBuilderDraft(d: BuilderDraft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch { /* ignore quota */ }
}

export function loadBuilderDraft(): BuilderDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearBuilderDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}