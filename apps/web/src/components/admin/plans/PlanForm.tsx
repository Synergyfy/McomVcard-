import { useMemo, useRef, useState } from 'react'
import type {
  Plan,
  PlanAudience,
  PlanConfiguration,
  PlanFeature,
  PlanPayload,
  PlanRule,
  PlanVariantKey,
  RuleScope,
} from '../../../services/plans'
import {
  PLAN_CAPABILITY_SCHEMA,
  capabilityFieldsForAudience,
  type PlanCapabilityField,
  type PlanCapabilitySchema,
} from '../../../services/planCapabilitySchema'

const VARIANT_KEYS: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']

const VARIANT_META: Record<PlanVariantKey, { name: string; durationDays: number; blurb: string }> = {
  standard: { name: 'Standard', durationDays: 90, blurb: '90 days of access' },
  pro: { name: 'Pro', durationDays: 180, blurb: '180 days of access' },
  pro_plus: { name: 'Pro+', durationDays: 365, blurb: '1 year of access' },
}

type Step = 'details' | PlanVariantKey

const STEPS: Array<{ id: Step; label: string; hint: string }> = [
  { id: 'details', label: 'Plan details', hint: 'Name, audience and shared features' },
  { id: 'standard', label: VARIANT_META.standard.name, hint: '90 days of access' },
  { id: 'pro', label: VARIANT_META.pro.name, hint: '180 days of access' },
  { id: 'pro_plus', label: VARIANT_META.pro_plus.name, hint: '1 year of access' },
]

interface KeyValueRow {
  key: string
  value: string
}

interface ConfigurationForm {
  quotas: KeyValueRow[]
  featureFlags: KeyValueRow[]
}

interface VariantForm {
  price: string
  description: string
  /** Optional per-variant feature list (one per line); overrides the plan list. */
  featuresText: string
  stripePriceId: string
  paypalPlanId: string
  isActive: boolean
  configuration: ConfigurationForm
}

interface RuleForm {
  label: string
  description: string
  scope: RuleScope
  standard: string
  pro: string
  proPlus: string
}

interface FormState {
  name: string
  description: string
  audience: PlanAudience
  currency: string
  status: string
  popular: boolean
  isDefault: boolean
  features: string[]
  rules: RuleForm[]
  configuration: ConfigurationForm
  variants: Record<PlanVariantKey, VariantForm>
}

const RULE_SCOPES: RuleScope[] = ['All', 'Admin setup', 'Business usage', 'Consumer usage', 'Public page']

function emptyConfig(): ConfigurationForm {
  return { quotas: [], featureFlags: [] }
}

/** Normalise legacy boolean/unlimited quota values to a number input value. */
function normalizeQuotaValue(value: string): string {
  const raw = value.trim().toLowerCase()
  if (raw === 'true' || raw === 'unlimited' || raw === '∞') return '-1'
  if (raw === 'false') return '0'
  return value
}

/**
 * Every variant carries a complete, explicit configuration so "off" really
 * means denied and a blank limit means unlimited. Missing known fields inherit
 * the plan-level default when one exists.
 */
function withSchemaDefaults(
  config: ConfigurationForm,
  base?: PlanConfiguration | null,
): ConfigurationForm {
  const quotas = config.quotas.map((row) => ({ ...row, value: normalizeQuotaValue(row.value) }))
  const featureFlags = [...config.featureFlags]

  for (const field of PLAN_CAPABILITY_SCHEMA.quotas) {
    if (quotas.some((row) => row.key === field.key)) continue
    const fallback = base?.quotas?.[field.key]
    quotas.push({
      key: field.key,
      value: fallback === undefined ? '-1' : normalizeQuotaValue(String(fallback)),
    })
  }
  for (const field of PLAN_CAPABILITY_SCHEMA.featureFlags) {
    if (featureFlags.some((row) => row.key === field.key)) continue
    const fallback = base?.featureFlags?.[field.key]
    featureFlags.push({ key: field.key, value: fallback === undefined ? 'false' : String(fallback) })
  }

  return { quotas, featureFlags }
}

function emptyVariant(key: PlanVariantKey): VariantForm {
  const meta = VARIANT_META[key]
  return {
    price: '0',
    description: meta.blurb,
    featuresText: '',
    stripePriceId: '',
    paypalPlanId: '',
    isActive: true,
    configuration: withSchemaDefaults(emptyConfig()),
  }
}

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    audience: 'business',
    currency: 'GBP',
    status: 'active',
    popular: false,
    isDefault: false,
    features: [''],
    rules: [],
    configuration: emptyConfig(),
    variants: {
      standard: emptyVariant('standard'),
      pro: emptyVariant('pro'),
      pro_plus: emptyVariant('pro_plus'),
    },
  }
}

function rowsToConfig(rows: KeyValueRow[]): Record<string, number | boolean> {
  const out: Record<string, number | boolean> = {}
  for (const row of rows) {
    const key = row.key.trim()
    if (!key) continue
    const raw = row.value.trim().toLowerCase()
    if (raw === 'true') out[key] = true
    else if (raw === 'false') out[key] = false
    else if (raw === 'unlimited' || raw === '∞' || raw === '-1') out[key] = -1
    else out[key] = Number(row.value) || 0
  }
  return out
}

function configToRows(config?: PlanConfiguration | null): ConfigurationForm {
  const toRows = (obj?: Record<string, number | boolean>): KeyValueRow[] =>
    Object.entries(obj ?? {}).map(([key, value]) => ({ key, value: String(value) }))
  return {
    quotas: toRows(config?.quotas),
    featureFlags: toRows(config?.featureFlags),
  }
}

function configurationPayload(form: ConfigurationForm): PlanConfiguration | undefined {
  const quotas = rowsToConfig(form.quotas)
  const rawFlags = rowsToConfig(form.featureFlags)
  const featureFlags: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(rawFlags)) {
    featureFlags[key] = value === true || value === -1 || value === 1
  }

  if (Object.keys(quotas).length === 0 && Object.keys(featureFlags).length === 0) return undefined
  return {
    ...(Object.keys(quotas).length > 0 ? { quotas } : {}),
    ...(Object.keys(featureFlags).length > 0 ? { featureFlags } : {}),
  }
}

function planToForm(plan?: Plan): FormState {
  if (!plan) return emptyForm()

  return {
    name: plan.name ?? '',
    description: plan.description ?? '',
    audience: plan.audience ?? 'business',
    currency: plan.currency || 'GBP',
    status: plan.status || 'active',
    popular: plan.popular === true,
    isDefault: plan.isDefault === true,
    features: (plan.features ?? []).map((feature) => feature.text).concat(''),
    rules: (plan.rules ?? []).map((rule) => ({
      label: rule.label ?? '',
      description: rule.description ?? '',
      scope: rule.scope ?? 'All',
      standard: rule.values?.Standard ?? rule.values?.Normal ?? '',
      pro: rule.values?.Pro ?? '',
      proPlus: rule.values?.['Pro+'] ?? '',
    })).concat({ label: '', description: '', scope: 'All', standard: '', pro: '', proPlus: '' }),
    configuration: configToRows(plan.configuration),
    variants: {
      standard: variantToForm(plan, 'standard'),
      pro: variantToForm(plan, 'pro'),
      pro_plus: variantToForm(plan, 'pro_plus'),
    },
  }
}

function variantToForm(plan: Plan, key: PlanVariantKey): VariantForm {
  const variant = (plan.variants ?? []).find((candidate) => candidate.key === key)
  const meta = VARIANT_META[key]
  return {
    price: String(variant?.price ?? 0),
    description: variant?.description || meta.blurb,
    featuresText: (variant?.features ?? []).map((feature) => feature.text).join('\n'),
    stripePriceId: variant?.stripePriceId ?? '',
    paypalPlanId: variant?.paypalPlanId ?? '',
    isActive: variant?.isActive !== false,
    configuration: withSchemaDefaults(configToRows(variant?.configuration), plan.configuration),
  }
}

function formToPayload(form: FormState): PlanPayload {
  const features: PlanFeature[] = form.features
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ text, description: '', scope: 'All' }))

  const rules: PlanRule[] = form.rules
    .filter((rule) => rule.label.trim())
    .map((rule) => ({
      label: rule.label.trim(),
      description: rule.description.trim(),
      scope: rule.scope,
      values: {
        Standard: rule.standard,
        Pro: rule.pro,
        'Pro+': rule.proPlus,
      },
    }))

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    audience: form.audience,
    currency: form.currency,
    status: form.status,
    popular: form.popular,
    isDefault: form.isDefault,
    features,
    rules,
    configuration: configurationPayload(form.configuration),
    variants: VARIANT_KEYS.map((key) => {
      const variant = form.variants[key]
      return {
        key,
        price: Number(variant.price) || 0,
        description: variant.description.trim() || undefined,
        features: variant.featuresText
          .split('\n')
          .map((text) => text.trim())
          .filter(Boolean)
          .map((text) => ({ text, description: '', scope: 'All' as const })),
        configuration: configurationPayload(variant.configuration),
        stripePriceId: variant.stripePriceId.trim() || undefined,
        paypalPlanId: variant.paypalPlanId.trim() || undefined,
        isActive: variant.isActive,
      }
    }),
  }
}

/** Add or update a key/value row. An empty value removes the row. */
function setRowValue(rows: KeyValueRow[], key: string, value: string): KeyValueRow[] {
  const index = rows.findIndex((row) => row.key === key)
  if (index === -1) return value.trim() ? [...rows, { key, value }] : rows
  if (!value.trim()) return rows.filter((_, i) => i !== index)
  return rows.map((row, i) => (i === index ? { ...row, value } : row))
}

function rowValue(rows: KeyValueRow[], key: string): string {
  return rows.find((row) => row.key === key)?.value ?? ''
}

function isUnlimitedValue(value: string): boolean {
  const raw = value.trim().toLowerCase()
  return raw === '-1' || raw === 'unlimited' || raw === '∞'
}

function isEnabledValue(value: string): boolean {
  const raw = value.trim().toLowerCase()
  return raw === 'true' || raw === '1' || raw === '-1'
}

function InfoDot({ text }: { text: string }) {
  return (
    <span
      title={text}
      aria-label={text}
      className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold leading-none text-gray-400 dark:border-gray-600 dark:text-gray-500"
    >
      ?
    </span>
  )
}

function UsageLimitsEditor({
  fields,
  rows,
  onChange,
}: {
  fields: PlanCapabilityField[]
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
}) {
  const setAllUnlimited = () => {
    let next = rows
    for (const field of fields) {
      if (field.unlimited) next = setRowValue(next, field.key, '-1')
    }
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Usage limits</h3>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Enter a whole number for each limit, or mark it as unlimited.
          </p>
        </div>
        <button
          type="button"
          onClick={setAllUnlimited}
          className="shrink-0 rounded-lg border border-orange-200 px-3 py-1.5 text-[11px] font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-500/40 dark:text-orange-400 dark:hover:bg-orange-500/10"
        >
          Set all to unlimited
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => {
          const value = rowValue(rows, field.key)
          const unlimited = isUnlimitedValue(value)
          return (
            <div
              key={field.key}
              className="rounded-xl border border-gray-100 p-3 dark:border-gray-700"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <label className="text-xs font-semibold leading-snug text-gray-700 dark:text-gray-300">
                  {field.label}
                  <span className="ml-0.5 text-red-500">*</span>
                </label>
                <InfoDot text={field.description} />
              </div>
              <input
                type="number"
                min={0}
                value={unlimited ? '' : value}
                disabled={unlimited}
                onChange={(e) => onChange(setRowValue(rows, field.key, e.target.value))}
                placeholder={`e.g. ${field.placeholder ?? 10}`}
                className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
              />
              {field.unlimited && (
                <label className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={unlimited}
                    onChange={(e) => onChange(setRowValue(rows, field.key, e.target.checked ? '-1' : ''))}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  Unlimited
                </label>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeatureAccessEditor({
  fields,
  rows,
  onChange,
}: {
  fields: PlanCapabilityField[]
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Feature access</h3>
        <p className="mt-0.5 text-[11px] text-gray-400">
          Optional toggles. Leave off to deny access, or switch on to include the capability in this variant.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => {
          const enabled = isEnabledValue(rowValue(rows, field.key))
          return (
            <label
              key={field.key}
              className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 transition-colors ${
                enabled
                  ? 'border-orange-200 bg-orange-50/60 dark:border-orange-500/40 dark:bg-orange-500/10'
                  : 'border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <span className="min-w-0">
                <span className="flex items-start gap-1.5">
                  <span className="text-xs font-semibold leading-snug text-gray-800 dark:text-gray-200">
                    {field.label}
                  </span>
                  <InfoDot text={field.description} />
                </span>
                <span className="mt-1 block text-[10px] leading-relaxed text-gray-400">
                  {field.description}
                </span>
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onChange(setRowValue(rows, field.key, e.target.checked ? 'true' : 'false'))}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}

function VariantEditor({
  variantKey,
  variant,
  schema,
  onChange,
}: {
  variantKey: PlanVariantKey
  variant: VariantForm
  schema: PlanCapabilitySchema
  onChange: (changes: Partial<VariantForm>) => void
}) {
  const meta = VARIANT_META[variantKey]

  const patchConfig = (changes: Partial<ConfigurationForm>) =>
    onChange({ configuration: { ...variant.configuration, ...changes } })

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{meta.name}</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                {meta.durationDays} days
              </span>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              Configure pricing and exactly what a {meta.name} buyer can access.
            </p>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <input
              type="checkbox"
              checked={variant.isActive}
              onChange={(e) => onChange({ isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            Available to purchase
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              min={0}
              value={variant.price}
              onChange={(e) => onChange({ price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input
              value={variant.description}
              onChange={(e) => onChange({ description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stripe price ID</label>
            <input
              value={variant.stripePriceId}
              onChange={(e) => onChange({ stripePriceId: e.target.value })}
              placeholder="price_…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>PayPal plan ID</label>
            <input
              value={variant.paypalPlanId}
              onChange={(e) => onChange({ paypalPlanId: e.target.value })}
              placeholder="P-…"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Features for this variant (optional)</label>
            <textarea
              value={variant.featuresText}
              onChange={(e) => onChange({ featuresText: e.target.value })}
              placeholder="One per line. Leave blank to inherit the plan features."
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <UsageLimitsEditor
        fields={schema.quotas}
        rows={variant.configuration.quotas}
        onChange={(quotas) => patchConfig({ quotas })}
      />

      <FeatureAccessEditor
        fields={schema.featureFlags}
        rows={variant.configuration.featureFlags}
        onChange={(featureFlags) => patchConfig({ featureFlags })}
      />
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
const labelClass = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'

export default function PlanForm({
  initial,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: Plan
  submitLabel: string
  loading?: boolean
  error?: string
  onSubmit: (payload: PlanPayload) => void | Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() => planToForm(initial))
  const [step, setStep] = useState<Step>('details')
  const [localError, setLocalError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const description = useMemo(
    () => form.description.trim() || 'Describe what this plan is for and who it is for.',
    [form.description],
  )

  const schema = useMemo(
    () => capabilityFieldsForAudience(PLAN_CAPABILITY_SCHEMA, form.audience),
    [form.audience],
  )

  const stepIndex = STEPS.findIndex((candidate) => candidate.id === step)

  const patch = (changes: Partial<FormState>) => setForm((prev) => ({ ...prev, ...changes }))

  const patchVariant = (key: PlanVariantKey, changes: Partial<VariantForm>) =>
    setForm((prev) => ({
      ...prev,
      variants: { ...prev.variants, [key]: { ...prev.variants[key], ...changes } },
    }))

  const goToStep = (next: Step) => {
    setStep(next)
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleNext = () => {
    if (step === 'details' && !form.name.trim()) {
      setLocalError('Plan name is required.')
      return
    }
    setLocalError('')
    const next = STEPS[stepIndex + 1]
    if (next) goToStep(next.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Enter in an earlier step moves forward instead of saving a half-configured plan.
    if (step !== 'pro_plus') {
      handleNext()
      return
    }
    setLocalError('')
    if (!form.name.trim()) {
      setLocalError('Plan name is required.')
      goToStep('details')
      return
    }
    await onSubmit(formToPayload(form))
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 scroll-mt-4">
      {(error || localError) && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error || localError}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((candidate, index) => {
          const active = candidate.id === step
          const complete = index < stepIndex
          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => goToStep(candidate.id)}
              className={`flex min-w-fit items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                active
                  ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? 'bg-orange-500 text-white'
                    : complete
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                }`}
              >
                {index + 1}
              </span>
              <span>
                <span className="block text-[11px] font-semibold">{candidate.label}</span>
                <span className="block text-[9px] text-gray-400">{candidate.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      {step === 'details' ? (
        <>
          {/* Basic details */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Plan details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Plan name</label>
                <input
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="e.g. Business Growth Membership"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder={description}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) => patch({ audience: e.target.value as PlanAudience })}
                  className={inputClass}
                >
                  <option value="business">Business</option>
                  <option value="consumer">Consumer</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select value={form.currency} onChange={(e) => patch({ currency: e.target.value })} className={inputClass}>
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={(e) => patch({ status: e.target.value })} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end gap-5 pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => patch({ popular: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  Popular
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => patch({ isDefault: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  Default plan
                </label>
              </div>
            </div>
          </section>

          {/* Shared features */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Included features</h2>
                <p className="text-[11px] text-gray-400">Shown to every variant. Variants can override the list.</p>
              </div>
              <button
                type="button"
                onClick={() => patch({ features: [...form.features, ''] })}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                + Add feature
              </button>
            </div>
            <div className="space-y-2">
              {form.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={feature}
                    onChange={(e) => patch({ features: form.features.map((f, i) => (i === index ? e.target.value : f)) })}
                    placeholder="e.g. 50 Business VCards"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => patch({ features: form.features.filter((_, i) => i !== index) })}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Shared rules matrix */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Comparison limits</h2>
                <p className="text-[11px] text-gray-400">
                  Optional values for the public comparison table. Use the Usage limits step for enforced access.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  patch({
                    rules: [
                      ...form.rules,
                      { label: '', description: '', scope: 'All', standard: '', pro: '', proPlus: '' },
                    ],
                  })
                }
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                + Add limit
              </button>
            </div>
            <div className="space-y-3">
              {form.rules.map((rule, index) => (
                <div key={index} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3 space-y-2">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      value={rule.label}
                      onChange={(e) =>
                        patch({ rules: form.rules.map((r, i) => (i === index ? { ...r, label: e.target.value } : r)) })
                      }
                      placeholder="Limit label (e.g. Business VCards)"
                      className={`${inputClass} sm:col-span-2`}
                    />
                    <select
                      value={rule.scope}
                      onChange={(e) =>
                        patch({
                          rules: form.rules.map((r, i) =>
                            i === index ? { ...r, scope: e.target.value as RuleScope } : r,
                          ),
                        })
                      }
                      className={inputClass}
                    >
                      {RULE_SCOPES.map((scope) => (
                        <option key={scope} value={scope}>
                          {scope}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={rule.standard}
                      onChange={(e) =>
                        patch({ rules: form.rules.map((r, i) => (i === index ? { ...r, standard: e.target.value } : r)) })
                      }
                      placeholder="Standard"
                      className={inputClass}
                    />
                    <input
                      value={rule.pro}
                      onChange={(e) =>
                        patch({ rules: form.rules.map((r, i) => (i === index ? { ...r, pro: e.target.value } : r)) })
                      }
                      placeholder="Pro"
                      className={inputClass}
                    />
                    <input
                      value={rule.proPlus}
                      onChange={(e) =>
                        patch({ rules: form.rules.map((r, i) => (i === index ? { ...r, proPlus: e.target.value } : r)) })
                      }
                      placeholder="Pro+"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={rule.description}
                      onChange={(e) =>
                        patch({
                          rules: form.rules.map((r, i) =>
                            i === index ? { ...r, description: e.target.value } : r,
                          ),
                        })
                      }
                      placeholder="Description (optional)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => patch({ rules: form.rules.filter((_, i) => i !== index) })}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {form.rules.length === 0 && <p className="text-[11px] text-gray-400">No comparison limits configured yet.</p>}
            </div>
          </section>
        </>
      ) : (
        <VariantEditor
          variantKey={step}
          variant={form.variants[step]}
          schema={schema}
          onChange={(changes) => patchVariant(step, changes)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          {step !== 'details' && (
            <button
              type="button"
              onClick={() => goToStep('details')}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to plan details
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {stepIndex > 1 && step !== 'details' && (
            <button
              type="button"
              onClick={() => goToStep(STEPS[stepIndex - 1].id)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous variant
            </button>
          )}
          {step !== 'pro_plus' ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              {step === 'details' ? 'Next: Standard' : 'Next variant'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving…' : submitLabel}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
