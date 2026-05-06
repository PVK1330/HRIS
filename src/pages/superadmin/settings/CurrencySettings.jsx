import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import settingsService from '../../../services/settingsService.js'

const DEFAULTS = {
  defaultCurrency: 'USD',
  currencySymbol: '$',
  symbolPosition: 'before',
  decimalSeparator: '.',
  thousandSeparator: ',',
}

const CURRENCY_MAP = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AED: 'د.إ',
  SAR: '﷼',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: '.د.ب',
  OMR: '﷼',
  CAD: '$',
  AUD: '$',
  SGD: '$',
  MYR: 'RM',
  PKR: '₨',
  BDT: '৳',
  LKR: '₨',
  NPR: '₨',
  JPY: '¥',
  CNY: '¥',
  CHF: 'Fr',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
  GHS: '₵',
  EGP: '£',
  MAD: 'د.م.',
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
  { value: 'SAR', label: 'SAR (﷼)', symbol: '﷼' },
  { value: 'QAR', label: 'QAR (﷼)', symbol: '﷼' },
  { value: 'KWD', label: 'KWD (د.ك)', symbol: 'د.ك' },
  { value: 'BHD', label: 'BHD (.د.ب)', symbol: '.د.ب' },
  { value: 'OMR', label: 'OMR (﷼)', symbol: '﷼' },
  { value: 'CAD', label: 'CAD ($)', symbol: '$' },
  { value: 'AUD', label: 'AUD ($)', symbol: '$' },
  { value: 'SGD', label: 'SGD ($)', symbol: '$' },
  { value: 'MYR', label: 'MYR (RM)', symbol: 'RM' },
  { value: 'PKR', label: 'PKR (₨)', symbol: '₨' },
  { value: 'BDT', label: 'BDT (৳)', symbol: '৳' },
  { value: 'LKR', label: 'LKR (₨)', symbol: '₨' },
  { value: 'NPR', label: 'NPR (₨)', symbol: '₨' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { value: 'CHF', label: 'CHF (Fr)', symbol: 'Fr' },
  { value: 'SEK', label: 'SEK (kr)', symbol: 'kr' },
  { value: 'NOK', label: 'NOK (kr)', symbol: 'kr' },
  { value: 'DKK', label: 'DKK (kr)', symbol: 'kr' },
  { value: 'ZAR', label: 'ZAR (R)', symbol: 'R' },
  { value: 'NGN', label: 'NGN (₦)', symbol: '₦' },
  { value: 'KES', label: 'KES (KSh)', symbol: 'KSh' },
  { value: 'GHS', label: 'GHS (₵)', symbol: '₵' },
  { value: 'EGP', label: 'EGP (£)', symbol: '£' },
  { value: 'MAD', label: 'MAD (د.م.)', symbol: 'د.م.' },
]

const SYMBOL_POSITION_OPTS = [
  { value: 'before', label: 'Before Amount ($100)' },
  { value: 'after', label: 'After Amount (100$)' },
]

const DECIMAL_OPTS = [
  { value: '.', label: 'Period (.)' },
  { value: ',', label: 'Comma (,)' },
]

const THOUSAND_OPTS = [
  { value: ',', label: 'Comma (,)' },
  { value: '.', label: 'Period (.)' },
  { value: ' ', label: 'Space ( )' },
  { value: '', label: 'None' },
]

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    defaultCurrency: api.defaultCurrency || DEFAULTS.defaultCurrency,
    currencySymbol: api.currencySymbol ?? DEFAULTS.currencySymbol,
    symbolPosition: api.symbolPosition === 'after' ? 'after' : 'before',
    decimalSeparator: api.decimalSeparator === ',' ? ',' : '.',
    thousandSeparator:
      api.thousandSeparator === null || api.thousandSeparator === undefined
        ? ''
        : String(api.thousandSeparator),
  }
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v))
}

function addThousandSeparators(intPart, sep) {
  if (sep === '' || sep === undefined) return intPart
  const neg = intPart.startsWith('-')
  const digits = neg ? intPart.slice(1) : intPart
  const parts = []
  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i))
  }
  return (neg ? '-' : '') + parts.join(sep)
}

function formatPreview(amount, s) {
  const fixed = amount.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const grouped = addThousandSeparators(intPart, s.thousandSeparator)
  const numeral = `${grouped}${s.decimalSeparator}${decPart}`
  if (s.symbolPosition === 'before') {
    return `${s.currencySymbol}${numeral}`
  }
  return `${numeral}${s.currencySymbol}`
}

const selectCls =
  'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900'

function GridSkeleton() {
  return <div className="h-[280px] animate-pulse rounded-lg bg-gray-100" />
}

export default function CurrencySettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const originalRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getCurrency()
      const next = fromApi(res?.data)
      setSettings(next)
      originalRef.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load currency settings')
      setSettings({ ...DEFAULTS })
      originalRef.current = { ...DEFAULTS }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isDirty = useMemo(() => {
    if (!settings || !originalRef.current) return false
    return JSON.stringify(settings) !== JSON.stringify(originalRef.current)
  }, [settings])

  const separatorsClash =
    !!settings && settings.decimalSeparator === settings.thousandSeparator

  const set = (patch) => setSettings((prev) => ({ ...(prev || DEFAULTS), ...patch }))

  const handleDiscard = () => {
    if (!originalRef.current) return
    setSettings(deepClone(originalRef.current))
  }

  const handleSave = async () => {
    if (!settings || separatorsClash) return
    setSaving(true)
    try {
      const res = await settingsService.updateCurrency(settings)
      const next = fromApi(res?.data)
      setSettings(next)
      originalRef.current = deepClone(next)
      toast.success('Currency settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const preview = settings ? formatPreview(1234567.89, settings) : ''

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 md:px-0">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Localization</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure currency presentation and precision logic.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
      </div>

      {settings === null ? (
        <GridSkeleton />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
                DEFAULT CURRENCY
              </label>
              <select
                className={selectCls}
                value={settings.defaultCurrency}
                onChange={(e) => {
                  const code = e.target.value
                  const sym = CURRENCY_MAP[code] ?? '$'
                  set({ defaultCurrency: code, currencySymbol: sym })
                }}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
                SYMBOL POSITION
              </label>
              <select
                className={selectCls}
                value={settings.symbolPosition}
                onChange={(e) => set({ symbolPosition: e.target.value })}
              >
                {SYMBOL_POSITION_OPTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
                DECIMAL SEPARATOR
              </label>
              <select
                className={selectCls}
                value={settings.decimalSeparator}
                onChange={(e) => set({ decimalSeparator: e.target.value })}
              >
                {DECIMAL_OPTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-400">
                THOUSAND SEPARATOR
              </label>
              <select
                className={selectCls}
                value={settings.thousandSeparator}
                onChange={(e) => set({ thousandSeparator: e.target.value })}
              >
                {THOUSAND_OPTS.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {separatorsClash && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              Decimal and thousand separators cannot be the same
            </div>
          )}

          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 text-xs uppercase tracking-wider text-gray-400">PREVIEW</div>
            <div className="font-mono text-2xl font-bold text-gray-800">{preview}</div>
          </div>
        </div>
      )}

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 shadow-lg">
          <div className="flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            <span className="ml-2 text-xs uppercase tracking-wider text-gray-500">
              PRICING MATRIX SYNCED
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
              disabled={saving || separatorsClash}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
              )}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
