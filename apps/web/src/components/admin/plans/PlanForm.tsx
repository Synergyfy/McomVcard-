import { useMemo, useState } from 'react'
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

const VARIANT_KEYS: PlanVariantKey[] = ['standard', 'pro', 'pro_plus']

const VARIANT_META: Record<PlanVariantKey, { name: string; durationDays: number; blurb: string }> = {
  standard: { name: 'Standard', durationDays: 90, blurb: '90 days of access' },
  pro: { name: 'Pro', durationDays: 180, blurb: '180 days of access' },
  pro_plus: { name: 'Pro+', durationDays: 365, blurb: '1 year of access' },
}

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
  setupFee: string
  trialDays: string
  description: string
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

function emptyVariant(key: PlanVariantKey): VariantForm {
  const meta = VARIANT_META[key]
  return {
    price: '0',
    setupFee: '0',
    trialDays: '0',
    description: meta.blurb,
    stripePriceId: '',
    paypalPlanId: '',
    isActive: true,
    configuration: emptyConfig(),
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
    setupFee: String(variant?.setupFee ?? 0),
    trialDays: String(variant?.trialDays ?? 0),
    description: variant?.description || meta.blurb,
    stripePriceId: variant?.stripePriceId ?? '',
    paypalPlanId: variant?.paypalPlanId ?? '',
    isActive: variant?.isActive !== false,
    configuration: configToRows(variant?.configuration),
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
        setupFee: Number(variant.setupFee) || 0,
        trialDays: Math.max(0, Math.round(Number(variant.trialDays) || 0)),
        description: variant.description.trim() || undefined,
        configuration: configurationPayload(variant.configuration),
        stripePriceId: variant.stripePriceId.trim() || undefined,
        paypalPlanId: variant.paypalPlanId.trim() || undefined,
        isActive: variant.isActive,
      }
    }),
  }
}

function KeyValueEditor({
  title,
  hint,
  rows,
  onChange,
}: {
  title: string
  hint?: string
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{title}</p>
          {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange([...rows, { key: '', value: '' }])}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          + Add
        </button>
      </div>
      {rows.length === 0 && <p className="text-[11px] text-gray-400">None configured</p>}
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row.key}
              onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)))}
              placeholder="key"
              className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-900 dark:text-white"
            />
            <input
              value={row.value}
              onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))}
              placeholder="number / true / false / unlimited"
              className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="text-xs font-semibold text-red-500 hover:text-red-600 px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
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
  const [localError, setLocalError] = useState('')

  const description = useMemo(
    () => form.description.trim() || 'Describe what this plan is for and who it is for.',
    [form.description],
  )

  const patch = (changes: Partial<FormState>) => setForm((prev) => ({ ...prev, ...changes }))

  const patchVariant = (key: PlanVariantKey, changes: Partial<VariantForm>) =>
    setForm((prev) => ({
      ...prev,
      variants: { ...prev.variants, [key]: { ...prev.variants[key], ...changes } },
    }))

  const patchVariantConfig = (key: PlanVariantKey, config: ConfigurationForm) =>
    patchVariant(key, { configuration: config })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (!form.name.trim()) {
      setLocalError('Plan name is required.')
      return
    }
    await onSubmit(formToPayload(form))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || localError) && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error || localError}
        </div>
      )}

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
            <p className="text-[11px] text-gray-400">Shown to every variant. Variants can override limits below.</p>
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
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Limits per variant</h2>
            <p className="text-[11px] text-gray-400">One row per limit, with the value each variant receives.</p>
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
          {form.rules.length === 0 && <p className="text-[11px] text-gray-400">No limits configured yet.</p>}
        </div>
      </section>

      {/* Base configuration */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-1">
          Base entitlements
        </h2>
        <p className="text-[11px] text-gray-400 mb-4">
          Applied to every variant unless the variant overrides the same key.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <KeyValueEditor
            title="Quotas"
            hint="Number, true/false or unlimited (-1)"
            rows={form.configuration.quotas}
            onChange={(quotas) => patch({ configuration: { ...form.configuration, quotas } })}
          />
          <KeyValueEditor
            title="Feature flags"
            hint="true / false"
            rows={form.configuration.featureFlags}
            onChange={(featureFlags) => patch({ configuration: { ...form.configuration, featureFlags } })}
          />
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Variants</h2>
          <p className="text-[11px] text-gray-400">
            Standard is always 90 days, Pro 180 days and Pro+ 1 year. Configure the price and entitlements for each.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {VARIANT_KEYS.map((key) => {
            const meta = VARIANT_META[key]
            const variant = form.variants[key]
            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{meta.name}</h3>
                    <p className="text-[11px] text-gray-400">{meta.durationDays} days</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(e) => patchVariant(key, { isActive: e.target.checked })}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Price</label>
                  <input
                    type="number"
                    min={0}
                    value={variant.price}
                    onChange={(e) => patchVariant(key, { price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Setup fee</label>
                    <input
                      type="number"
                      min={0}
                      value={variant.setupFee}
                      onChange={(e) => patchVariant(key, { setupFee: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Trial days</label>
                    <input
                      type="number"
                      min={0}
                      value={variant.trialDays}
                      onChange={(e) => patchVariant(key, { trialDays: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    value={variant.description}
                    onChange={(e) => patchVariant(key, { description: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Stripe price ID</label>
                    <input
                      value={variant.stripePriceId}
                      onChange={(e) => patchVariant(key, { stripePriceId: e.target.value })}
                      placeholder="price_…"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PayPal plan ID</label>
                    <input
                      value={variant.paypalPlanId}
                      onChange={(e) => patchVariant(key, { paypalPlanId: e.target.value })}
                      placeholder="P-…"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-4">
                  <KeyValueEditor
                    title="Variant quotas"
                    hint="Overrides base quotas"
                    rows={variant.configuration.quotas}
                    onChange={(quotas) =>
                      patchVariantConfig(key, { ...variant.configuration, quotas })
                    }
                  />
                  <KeyValueEditor
                    title="Variant feature flags"
                    hint="Overrides base flags"
                    rows={variant.configuration.featureFlags}
                    onChange={(featureFlags) =>
                      patchVariantConfig(key, { ...variant.configuration, featureFlags })
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
