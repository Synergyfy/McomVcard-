/* ------------------------------------------------------------------ */
/*  Shared actions for Business / Consumer VCard templates.            */
/*  Platform (mock) templates have no localStorage record, so before   */
/*  editing / duplicating / archiving / deleting we convert them into   */
/*  a user-owned stored template once. The stored copy keeps the        */
/*  platform templateId so list pages override the mock row with it.    */
/* ------------------------------------------------------------------ */

import {
  nextTemplateId, upsertTemplate, loadUserTemplates,
  type StoredTemplate, type StoredSection,
} from './vcardTemplateStore'

export interface TemplateLike {
  id: number
  templateId: string
  name: string
  version: string
  description: string
  status: string
  category: string
  industry?: string
  createdDate: string
  createdBy: string
}

export function ensureStoredTemplate(
  t: TemplateLike,
  targetType: 'business' | 'consumer',
  sections: StoredSection[],
): StoredTemplate {
  const list = loadUserTemplates()
  const existing = list.find(s => s.id === t.id) ?? list.find(s => s.templateId === t.templateId)
  if (existing) return existing

  const converted: StoredTemplate = {
    id: nextTemplateId(),
    templateId: t.templateId,
    name: t.name,
    version: /^v/i.test(t.version) ? t.version : `v${t.version}`,
    description: t.description,
    status: t.status === 'Draft' ? 'Draft' : t.status === 'Archived' ? 'Archived' : 'Published',
    targetType,
    category: t.category,
    industry: t.industry ?? 'General',
    layout: 'template',
    lastUpdated: 'just now',
    createdDate: t.createdDate,
    updatedBy: 'You',
    createdBy: t.createdBy,
    builder: {
      templateName: t.name,
      templateCategory: t.category,
      layoutPreset: 'preset-1',
      sections,
    },
  }
  upsertTemplate(converted)
  return converted
}
