export interface BlockDef {
  name: string
  icon: string
  desc: string
  supportsMembership?: boolean
  comingSoon?: boolean
}

export interface Category {
  name: string
  icon: string
  blocks: BlockDef[]
}

export interface CanvasBlock {
  id: number
  name: string
  category: string
  required: boolean
  membership: string
}

export interface Theme {
  bg: string
  accent: string
  label: string
}

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface BuilderAction {
  label: string
  icon: string
  cls: string
  action: () => void
}

export interface Permission {
  role: string
  level: string
}

export interface AuditEntry {
  user: string
  action: string
  time: string
}

export interface DynamicRule {
  condition: string
  action: string
}

export interface FfDisplayOption {
  label: string
  on: boolean
}

export interface BrandingField {
  label: string
  value: string
}

export interface BuilderConfig {
  title: string
  breadcrumb: BreadcrumbItem[]
  categories: Category[]
  defaultBlocks: CanvasBlock[]
  layoutPresets: string[]
  templateCategories: string[]
  membershipOptions: string[]
  membershipThemes?: Record<string, Theme>
  defaultPreviewMembership?: string
  previewPersonas?: { value: string; label: string; desc?: string }[]
  defaultPreviewPersona?: string
  clickActions: string[]
  animations: string[]
  visibilityRules: string[]
  showDynamicRules?: boolean
  showFfRules?: boolean
  showBrandingProfiles?: boolean
  showAccessibility?: boolean
  dynamicRules?: DynamicRule[]
  ffDisplayOptions?: FfDisplayOption[]
  brandingFields?: BrandingField[]
  permissions: Permission[]
  auditEntries: AuditEntry[]
  onValidate?: (blocks: CanvasBlock[], name: string) => string[]
}
