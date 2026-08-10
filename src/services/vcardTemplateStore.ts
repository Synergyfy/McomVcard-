/* ------------------------------------------------------------------ */
/*  User-created Business VCard templates                              */
/*  Persisted in localStorage so templates published/saved from the    */
/*  form builder show up in the list immediately.                      */
/* ------------------------------------------------------------------ */

export interface StoredBlock {
  id: number
  type: string
  values: Record<string, string>
  options: string[]
  formats: string[]
}

export interface StoredSection {
  uid: string
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: StoredBlock[]
  centre?: string
}

/* Centre-level configuration — name, visibility, title size, password,
   and per-centre content sources so each centre stays rich and never
   empty. Lives alongside `sections` so each centre can be toggled,
   renamed, titled on the card and password-protected independently. */
export interface StoredCentreConfig {
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

export interface StoredBuilder {
  templateName: string
  templateCategory: string
  layoutPreset: string
  templateUses?: string[]
  seasons?: string[]
  sectors?: string[]
  sections: StoredSection[]
  centres?: StoredCentreConfig[]
}

export interface StoredTemplate {
  id: number
  templateId: string
  name: string
  version: string
  description: string
  status: 'Published' | 'Draft' | 'Archived'
  targetType: 'business' | 'consumer'
  category: string
  industry: string
  layout: string
  lastUpdated: string
  createdDate: string
  updatedBy: string
  createdBy: string
  builder: StoredBuilder
}

const KEY = 'mcom_vcard_templates'

export function loadUserTemplates(): StoredTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/* Legacy entries created before the type split default to Business VCard. */
export function loadUserTemplatesByType(type: 'business' | 'consumer'): StoredTemplate[] {
  return loadUserTemplates().filter(t => (t.targetType ?? 'business') === type)
}

function persist(list: StoredTemplate[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore quota errors */ }
}

export function getUserTemplate(id: number): StoredTemplate | undefined {
  return loadUserTemplates().find(t => t.id === id)
}

/* Platform templates use BVT-1..20 / CVT-1..10 ids, user templates start at 21. */
export function nextTemplateId(): number {
  const list = loadUserTemplates()
  return list.reduce((m, t) => Math.max(m, t.id), 20) + 1
}

export function nextTemplateNumber(prefix: string): string {
  const list = loadUserTemplates()
  const max = list.reduce((m, t) => {
    const n = parseInt(t.templateId.replace(prefix, ''), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return String(Math.max(max + 1, 1)).padStart(6, '0')
}

export function upsertTemplate(input: StoredTemplate): StoredTemplate {
  const list = loadUserTemplates()
  const idx = list.findIndex(t => t.id === input.id)
  if (idx >= 0) list[idx] = input
  else list.unshift(input)
  persist(list)
  return input
}

export function archiveUserTemplate(id: number): boolean {
  const list = loadUserTemplates()
  const idx = list.findIndex(t => t.id === id)
  if (idx < 0) return false
  list.splice(idx, 1)
  persist(list)
  return true
}

export function deleteUserTemplate(id: number): boolean {
  const list = loadUserTemplates()
  const idx = list.findIndex(t => t.id === id)
  if (idx < 0) return false
  list.splice(idx, 1)
  persist(list)
  return true
}
