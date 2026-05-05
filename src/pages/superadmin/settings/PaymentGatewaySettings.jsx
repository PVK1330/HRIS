import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HiCreditCard, HiBuildingLibrary, HiEye, HiEyeSlash, HiCheckCircle, HiXCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const MASKED = '••••••••'

const GATEWAY_META = {
  stripe: {
    label: 'Stripe',
    subtitle: 'ENTERPRISE FINANCIAL INFRASTRUCTURE',
    iconBg: 'bg-indigo-600',
    Icon: HiCreditCard,
    fields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text',     required: true,  placeholder: 'pk_test_...' },
      { key: 'secret_key',      label: 'Secret Key',      type: 'password', required: true,  placeholder: 'sk_test_...' },
      { key: 'webhook_secret',  label: 'Webhook Secret',  type: 'password', required: false, placeholder: 'whsec_...' },
    ],
    showTestMode: true,
  },
  paypal: {
    label: 'PayPal',
    subtitle: 'GLOBAL COMMERCE PLATFORM',
    iconBg: 'bg-blue-500',
    Icon: HiCreditCard,
    fields: [
      { key: 'client_id',     label: 'Client ID',     type: 'text',     required: true,  placeholder: '' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true,  placeholder: '' },
      { key: 'mode',          label: 'Mode',          type: 'select',   required: true, options: [
        { value: 'sandbox', label: 'Sandbox' },
        { value: 'live',    label: 'Live' },
      ] },
    ],
    showTestMode: true,
  },
  razorpay: {
    label: 'Razorpay',
    subtitle: 'CONVERGED PAYMENTS FOR INDIA',
    iconBg: 'bg-gray-900',
    Icon: HiCreditCard,
    fields: [
      { key: 'key_id',         label: 'Key ID',         type: 'text',     required: true,  placeholder: 'rzp_test_...' },
      { key: 'key_secret',     label: 'Key Secret',     type: 'password', required: true,  placeholder: '••••••••' },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: false, placeholder: '' },
    ],
    showTestMode: true,
  },
  offline: {
    label: 'Offline Transfer',
    subtitle: 'DIRECT BANK TRANSFERS',
    iconBg: 'bg-green-600',
    Icon: HiBuildingLibrary,
    fields: [
      { key: 'bank_name',      label: 'Bank Name',           type: 'text',     required: true,  placeholder: '' },
      { key: 'account_holder', label: 'Account Holder Name', type: 'text',     required: true,  placeholder: '' },
      { key: 'account_number', label: 'Account Number',      type: 'text',     required: true,  placeholder: '' },
      { key: 'ifsc_code',      label: 'IFSC Code',           type: 'text',     required: false, placeholder: 'SBIN0001234' },
      { key: 'instructions',   label: 'Instructions',        type: 'textarea', required: false, placeholder: 'Payment instructions for customers...' },
    ],
    showTestMode: false,
  },
}

const ORDERED_SLUGS = ['stripe', 'paypal', 'razorpay', 'offline']

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

/** Normalize one gateway from the API into the editable shape the UI uses. */
function fromApi(g) {
  if (!g) return null
  const meta = GATEWAY_META[g.slug] || {}
  const blankCreds = (meta.fields || []).reduce(
    (acc, f) => ({ ...acc, [f.key]: '' }),
    {}
  )
  return {
    slug: g.slug,
    name: g.name,
    isEnabled: !!g.isEnabled,
    testMode: !!g.testMode,
    credentials: { ...blankCreds, ...(g.credentials || {}) },
    lastVerifiedStatus: g.lastVerifiedStatus || 'untested',
  }
}

/** Build the PUT payload, dropping masked sensitive fields so they don't overwrite. */
function toApiPayload(current) {
  const credentials = { ...(current.credentials || {}) }
  for (const k of Object.keys(credentials)) {
    if (credentials[k] === MASKED) {
      delete credentials[k]
    }
  }
  return {
    isEnabled: current.isEnabled,
    testMode: current.testMode,
    credentials,
  }
}

export default function PaymentGatewaySettings() {
  const [gateways, setGateways] = useState(null) // null = loading skeleton
  const [saving, setSaving] = useState(false)
  const [tests, setTests] = useState({}) // { [slug]: { state: 'idle'|'loading'|'success'|'error', message } }
  const [revealed, setRevealed] = useState({}) // { [slug-fieldKey]: true }
  const original = useRef(null)

  const loadAll = useCallback(async () => {
    try {
      const res = await settingsService.getPaymentGateways()
      const list = Array.isArray(res?.data) ? res.data : []
      const byOrder = ORDERED_SLUGS
        .map((slug) => list.find((g) => g.slug === slug))
        .filter(Boolean)
        .map(fromApi)
      setGateways(byOrder)
      original.current = deepClone(byOrder)
    } catch (err) {
      toast.error(err?.message || 'Failed to load payment gateways')
      setGateways([])
      original.current = []
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const isDirty = useMemo(() => {
    if (!gateways || !original.current) return false
    return JSON.stringify(gateways) !== JSON.stringify(original.current)
  }, [gateways])

  const updateGateway = (slug, patch) => {
    setGateways((prev) =>
      (prev || []).map((g) => (g.slug === slug ? { ...g, ...patch } : g))
    )
  }

  const updateCredential = (slug, key, value) => {
    setGateways((prev) =>
      (prev || []).map((g) =>
        g.slug === slug ? { ...g, credentials: { ...g.credentials, [key]: value } } : g
      )
    )
  }

  const handleDiscard = () => {
    if (!original.current) return
    setGateways(deepClone(original.current))
    setTests({})
  }

  const handleSave = async () => {
    if (!gateways || !original.current) return
    setSaving(true)
    try {
      const dirtySlugs = gateways
        .filter((g, i) => JSON.stringify(g) !== JSON.stringify(original.current[i]))
        .map((g) => g.slug)

      const updated = []
      for (const slug of dirtySlugs) {
        const current = gateways.find((g) => g.slug === slug)
        const res = await settingsService.updatePaymentGateway(slug, toApiPayload(current))
        if (res?.data) updated.push(fromApi(res.data))
      }

      const next = gateways.map((g) => updated.find((u) => u.slug === g.slug) || g)
      setGateways(next)
      original.current = deepClone(next)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (slug) => {
    setTests((p) => ({ ...p, [slug]: { state: 'loading', message: '' } }))
    try {
      const res = await settingsService.testPaymentGateway(slug)
      const verified = !!res?.data?.verified
      setTests((p) => ({
        ...p,
        [slug]: {
          state: verified ? 'success' : 'error',
          message: res?.data?.message || (verified ? 'Verified' : 'Verification failed'),
        },
      }))
    } catch (err) {
      setTests((p) => ({
        ...p,
        [slug]: { state: 'error', message: err?.message || 'Test failed' },
      }))
    }
  }

  const toggleReveal = (slug, fieldKey) => {
    const id = `${slug}-${fieldKey}`
    setRevealed((p) => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-0 pb-24">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Connectivity</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage secure payment processing pipelines.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md">
          <HiCreditCard className="h-5 w-5" />
        </div>
      </div>

      {/* Skeleton */}
      {gateways === null && (
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[88px] animate-pulse rounded-xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Loaded */}
      {Array.isArray(gateways) && gateways.length > 0 && (
        <div className="space-y-4">
          {gateways.map((g) => (
            <GatewayCard
              key={g.slug}
              gateway={g}
              meta={GATEWAY_META[g.slug]}
              onToggleEnabled={(v) => updateGateway(g.slug, { isEnabled: v })}
              onToggleTestMode={(v) => updateGateway(g.slug, { testMode: v })}
              onCredentialChange={(k, v) => updateCredential(g.slug, k, v)}
              onTest={() => handleTest(g.slug)}
              testState={tests[g.slug]}
              revealed={revealed}
              onToggleReveal={(fieldKey) => toggleReveal(g.slug, fieldKey)}
            />
          ))}
        </div>
      )}

      {/* Bottom save bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 shadow-lg">
          <div className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              FINANCIAL GRID SYNCHRONIZED
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------- Gateway card -------------------- */

function GatewayCard({
  gateway,
  meta,
  onToggleEnabled,
  onToggleTestMode,
  onCredentialChange,
  onTest,
  testState,
  revealed,
  onToggleReveal,
}) {
  if (!meta) return null
  const Icon = meta.Icon

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${meta.iconBg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">{meta.label}</div>
            <div className="mt-0.5 text-xs uppercase tracking-widest text-gray-400">
              {meta.subtitle}
            </div>
          </div>
        </div>
        <Toggle checked={gateway.isEnabled} onChange={onToggleEnabled} />
      </header>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          gateway.isEnabled ? 'mt-5 max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          {(meta.fields || []).map((f) => (
            <CredentialField
              key={f.key}
              field={f}
              value={gateway.credentials[f.key] ?? ''}
              onChange={(v) => onCredentialChange(f.key, v)}
              revealed={!!revealed[`${gateway.slug}-${f.key}`]}
              onToggleReveal={() => onToggleReveal(f.key)}
            />
          ))}

          {meta.showTestMode && (
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Test Mode</div>
                <div className="text-xs text-gray-500">
                  Use {meta.label} test environment.
                </div>
              </div>
              <Toggle checked={gateway.testMode} onChange={onToggleTestMode} />
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={onTest}
              disabled={testState?.state === 'loading'}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
            >
              {testState?.state === 'loading' && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              <span>Test Connection</span>
            </button>

            {testState && testState.state === 'success' && (
              <div className="flex items-start gap-2 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <HiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{testState.message}</span>
              </div>
            )}
            {testState && testState.state === 'error' && (
              <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <HiXCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{testState.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CredentialField({ field, value, onChange, revealed, onToggleReveal }) {
  const baseInput =
    'w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.type === 'select' && (
        <select
          value={value || (field.options?.[0]?.value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        >
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {field.type === 'textarea' && (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
      )}

      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
      )}

      {field.type === 'password' && (
        <div className="relative">
          <input
            type={revealed ? 'text' : 'password'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInput} pr-11`}
          />
          <button
            type="button"
            onClick={onToggleReveal}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={revealed ? 'Hide value' : 'Show value'}
          >
            {revealed ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
