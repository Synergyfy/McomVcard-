import { useMemo, useState } from 'react'
import type { PlanConfiguration, PlanFeature } from '../../../services/plans'
import {
  PLAN_CAPABILITY_SCHEMA,
  type PlanCapabilityField,
} from '../../../services/planCapabilitySchema'
import type { AccessPass, AccessPassPayload } from '../../../services/accessPasses'

interface KeyValueRow {
  key: string
  value: string
}

interface ConfigurationForm {
  quotas: KeyValueRow[]
  featureFlags: KeyValueRow[]
}

interface FormState {
  name: string
  description: string
  price: string
  durationDays: string
  currency: string
  status: string
  popular: boolean
  features: string[]
  configuration: ConfigurationForm
  stripePriceId: string
  paypalPlanId: string
}

const inputClass =
  'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
const labelClass = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'

function emptyConfig(): ConfigurationForm {
  return { quotas: [], featureFlags: [] }
}

function normalizeQuotaValue(value: string): string {
  const raw = value.trim().toLowerCase()
  if (raw === 'true' || raw === 'unlimited' || raw === '∞') return '-1'
  if (raw === 'false') return '0'
  return value
}

/** Every known capability is explicit so "off" means denied, blank = unlimited. */
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

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    price: '0',
    durationDays: '70',
    currency: 'GBP',
    status: 'active',
    popular: false,
    features: [''],
    configuration: withSchemaDefaults(emptyConfig()),
    stripePriceId: '',
    paypalPlanId: '',
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

function passToForm(pass?: AccessPass): FormState {
  if (!pass) return emptyForm()

  return {
    name: pass.name ?? '',
    description: pass.description ?? '',
    price: String(pass.price ?? 0),
    durationDays: String(pass.durationDays ?? 70),
    currency: pass.currency || 'GBP',
    status: pass.status || 'active',
    popular: pass.popular === true,
    features: (pass.features ?? []).map((feature) => feature.text).concat(''),
    configuration: withSchemaDefaults(configToRows(pass.configuration)),
    stripePriceId: pass.stripePriceId ?? '',
    paypalPlanId: pass.paypalPlanId ?? '',
  }
}

function formToPayload(form: FormState): AccessPassPayload {
  const features: PlanFeature[] = form.features
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ text, description: '', scope: 'All' }))

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price) || 0,
    durationDays: Number(form.durationDays) || 0,
    currency: form.currency,
    status: form.status,
    popular: form.popular,
    features,
    configuration: configurationPayload(form.configuration),
    stripePriceId: form.stripePriceId.trim() || undefined,
    paypalPlanId: form.paypalPlanId.trim() || undefined,
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
            <div key={field.key} className="rounded-xl border border-gray-100 p-3 dark:border-gray-700">
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
          Switch on the capabilities this access pass includes. Everything else stays locked.
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

export default function AccessPassForm({
  initial,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: AccessPass
  submitLabel: string
  loading?: boolean
  error?: string
  onSubmit: (payload: AccessPassPayload) => void | Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() => passToForm(initial))
  const [localError, setLocalError] = useState('')

  const patch = (changes: Partial<FormState>) => setForm((prev) => ({ ...prev, ...changes }))
  const patchConfig = (changes: Partial<ConfigurationForm>) =>
    setForm((prev) => ({ ...prev, configuration: { ...prev.configuration, ...changes } }))

  const enabledCount = useMemo(
    () => form.configuration.featureFlags.filter((row) => isEnabledValue(row.value)).length,
    [form.configuration.featureFlags],
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLocalError('')

    if (!form.name.trim()) {
      setLocalError('Access pass name is required.')
      return
    }
    if (!(Number(form.durationDays) > 0)) {
      setLocalError('Duration must be at least 1 day.')
      return
    }

    await onSubmit(formToPayload(form))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || localError) && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error || localError}
        </div>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
          Access pass details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. 70-Day Business Boost"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Describe who this pass is for and what it unlocks."
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => patch({ price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duration (days)</label>
            <input
              type="number"
              min={1}
              value={form.durationDays}
              onChange={(e) => patch({ durationDays: e.target.value })}
              placeholder="e.g. 70"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Buyers get the configured access for exactly this many days.
            </p>
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => patch({ currency: e.target.value })}
              className={inputClass}
            >
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => patch({ status: e.target.value })}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Stripe price ID (optional)</label>
            <input
              value={form.stripePriceId}
              onChange={(e) => patch({ stripePriceId: e.target.value })}
              placeholder="price_…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>PayPal plan ID (optional)</label>
            <input
              value={form.paypalPlanId}
              onChange={(e) => patch({ paypalPlanId: e.target.value })}
              placeholder="P-…"
              className={inputClass}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) => patch({ popular: e.target.checked })}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Highlight as popular
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
              Included features
            </h2>
            <p className="text-[11px] text-gray-400">Shown on the access pass card.</p>
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
                onChange={(e) =>
                  patch({ features: form.features.map((f, i) => (i === index ? e.target.value : f)) })
                }
                placeholder="e.g. 50 Business VCards"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => patch({ features: form.features.filter((_, i) => i !== index) })}
                className="px-1 text-xs font-semibold text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <UsageLimitsEditor
        fields={PLAN_CAPABILITY_SCHEMA.quotas}
        rows={form.configuration.quotas}
        onChange={(quotas) => patchConfig({ quotas })}
      />

      <FeatureAccessEditor
        fields={PLAN_CAPABILITY_SCHEMA.featureFlags}
        rows={form.configuration.featureFlags}
        onChange={(featureFlags) => patchConfig({ featureFlags })}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
        <div className="text-[11px] text-gray-400">
          {enabledCount} feature{enabledCount === 1 ? '' : 's'} enabled · Configuration is
          enforced for the whole pass duration.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
