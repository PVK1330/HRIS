import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiOutlineBanknotes,
  HiOutlineReceiptPercent,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowPath,
  HiCheckCircle,
} from 'react-icons/hi2'
import settingsService from '../../../services/settingsService.js'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { useCurrency } from '../../../context/CurrencyContext.jsx'
import { formatMoney } from '../../../utils/currency.js'

const DEFAULTS = {
  defaultCurrency: 'USD',
  currencySymbol: '$',
  symbolPosition: 'before',
  thousandSeparator: ',',
  decimalSeparator: '.',
  decimalPlaces: 2,
  taxEnabled: false,
  taxLabel: 'VAT',
  taxRate: 0,
  exchangeRates: {},
}

// Code → symbol/label for the picker and the rates editor.
const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'QAR', label: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'KWD', label: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BHD', label: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'OMR', label: 'Omani Rial' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'रू', label: 'Nepalese Rupee' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi' },
  { code: 'EGP', symbol: 'E£', label: 'Egyptian Pound' },
  { code: 'MAD', symbol: 'MAD', label: 'Moroccan Dirham' },
]

const labelFor = (code) => CURRENCIES.find((c) => c.code === code)?.label || code

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    defaultCurrency: api.defaultCurrency || 'USD',
    currencySymbol: api.currencySymbol || '$',
    symbolPosition: api.symbolPosition || 'before',
    thousandSeparator: api.thousandSeparator ?? ',',
    decimalSeparator: api.decimalSeparator || '.',
    decimalPlaces: Number(api.decimalPlaces ?? 2),
    taxEnabled: !!api.taxEnabled,
    taxLabel: api.taxLabel || 'VAT',
    taxRate: Number(api.taxRate ?? 0),
    exchangeRates: api.exchangeRates && typeof api.exchangeRates === 'object' ? { ...api.exchangeRates } : {},
    ratesUpdatedAt: api.ratesUpdatedAt || null,
    ratesSource: api.ratesSource || null,
  }
}

const deepClone = (v) => JSON.parse(JSON.stringify(v))

// Rates + their metadata are market-driven (not user-editable), so exclude them
// from the dirty check and the save payload.
const NON_EDITABLE = ['ratesUpdatedAt', 'ratesSource', 'exchangeRates']
const editable = (s) => Object.fromEntries(Object.entries(s).filter(([k]) => !NON_EDITABLE.includes(k)))

function timeAgo(iso) {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff)) return 'never'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const inputCls =
  'block w-full px-4   rounded-lg border-0 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 transition'
const fieldLabel = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

function SectionCard({ icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  )
}

export default function CurrencySettings() {
  const { reload: reloadCurrency } = useCurrency()
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const original = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getCurrency()
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load settings')
      setData({ ...DEFAULTS })
      original.current = { ...DEFAULTS }
    }
  }, [])

  useEffect(() => { load() }, [load])

  const isDirty = useMemo(
    () =>
      !!data &&
      !!original.current &&
      JSON.stringify(editable(data)) !== JSON.stringify(editable(original.current)),
    [data],
  )
  const separatorsClash = !!data && data.thousandSeparator === data.decimalSeparator

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULTS), ...patch }))

  const handleCurrencySelect = (code) => {
    const found = CURRENCIES.find((c) => c.code === code)
    set(found ? { defaultCurrency: found.code, currencySymbol: found.symbol } : { defaultCurrency: code })
  }

  const applySettings = (apiData) => {
    const next = fromApi(apiData)
    setData(next)
    original.current = deepClone(next)
    return next
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!data || separatorsClash) return
    setSaving(true)
    try {
      const res = await settingsService.updateCurrency({
        ...editable(data),
        decimalPlaces: Math.max(0, Math.min(4, Math.floor(Number(data.decimalPlaces) || 0))),
        taxRate: Math.max(0, Math.min(100, Number(data.taxRate) || 0)),
      })
      applySettings(res?.data)
      await reloadCurrency()
      toast.success('Currency settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleRefreshRates = async () => {
    setRefreshing(true)
    try {
      const res = await settingsService.refreshCurrencyRates()
      applySettings(res?.data)
      await reloadCurrency()
      toast.success('Exchange rates updated from the market')
    } catch (err) {
      toast.error(err?.message || 'Could not fetch live rates. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  if (data === null) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  const ratesList = Object.entries(data.exchangeRates || {}).sort((a, b) => a[0].localeCompare(b[0]))
  const taxRateNum = Number(data.taxRate) || 0

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Currency &amp; Tax</h1>
          <p className="mt-1 text-sm text-slate-500">
            One global currency for the entire platform. Amounts are auto-converted and billing tax is applied on top.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Base</span>
          <span className="font-bold text-slate-900">{data.defaultCurrency}</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-600">{formatMoney(1234.5, {}, data)}</span>
        </div>
      </div>

      {/* Currency & Localization */}
      <SectionCard
        icon={<HiOutlineBanknotes className="h-5 w-5" />}
        title="Currency & Localization"
        description="The default currency and how amounts are displayed across the system."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className={fieldLabel}>Default (base) currency</label>
            <select value={data.defaultCurrency} onChange={(e) => handleCurrencySelect(e.target.value)} className={inputCls}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Currency symbol</label>
            <input type="text" value={data.currencySymbol} maxLength={5} onChange={(e) => set({ currencySymbol: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={fieldLabel}>Symbol position</label>
            <select value={data.symbolPosition} onChange={(e) => set({ symbolPosition: e.target.value })} className={inputCls}>
              <option value="before">Before — {data.currencySymbol}99</option>
              <option value="before-space">Before with space — {data.currencySymbol} 99</option>
              <option value="after">After — 99{data.currencySymbol}</option>
              <option value="after-space">After with space — 99 {data.currencySymbol}</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Decimal places</label>
            <select value={String(data.decimalPlaces)} onChange={(e) => set({ decimalPlaces: Number(e.target.value) })} className={inputCls}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Thousand separator</label>
            <select value={data.thousandSeparator} onChange={(e) => set({ thousandSeparator: e.target.value })} className={inputCls}>
              <option value=",">Comma (,)</option>
              <option value=".">Dot (.)</option>
              <option value=" ">Space ( )</option>
              <option value="'">Apostrophe (&apos;)</option>
              <option value="">None</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Decimal separator</label>
            <select value={data.decimalSeparator} onChange={(e) => set({ decimalSeparator: e.target.value })} className={inputCls}>
              <option value=".">Dot (.)</option>
              <option value=",">Comma (,)</option>
            </select>
            {separatorsClash && (
              <p className="mt-1.5 text-xs font-medium text-red-600">Thousand and decimal separators must differ.</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live preview</span>
          <span className="text-lg font-bold text-slate-900">{formatMoney(1234567.5, {}, data)}</span>
        </div>
      </SectionCard>

      {/* Billing Tax */}
      <SectionCard
        icon={<HiOutlineReceiptPercent className="h-5 w-5" />}
        title="Billing Tax (VAT / GST)"
        description="When enabled, this tax is added on top of the subtotal on every invoice and checkout."
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900">Charge tax on billing</span>
          <Toggle checked={data.taxEnabled} onChange={(v) => set({ taxEnabled: v })} />
        </div>

        {data.taxEnabled && (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className={fieldLabel}>Tax label</label>
              <input type="text" value={data.taxLabel} maxLength={20} onChange={(e) => set({ taxLabel: e.target.value })} placeholder="VAT / GST / Sales Tax" className={inputCls} />
            </div>
            <div>
              <label className={fieldLabel}>Tax rate (%)</label>
              <input type="number" min="0" max="100" step="0.001" value={data.taxRate} onChange={(e) => set({ taxRate: e.target.value })} className={inputCls} />
            </div>
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatMoney(100, {}, data)}</span></div>
              <div className="flex justify-between text-slate-600"><span>{data.taxLabel || 'Tax'} ({taxRateNum}%)</span><span>{formatMoney(100 * taxRateNum / 100, {}, data)}</span></div>
              <div className="mt-1.5 flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900"><span>Total</span><span>{formatMoney(100 * (1 + taxRateNum / 100), {}, data)}</span></div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Exchange Rates (live market) */}
      <SectionCard
        icon={<HiOutlineArrowsRightLeft className="h-5 w-5" />}
        title="Exchange Rates"
        description={`Live market rates, fetched automatically and used to convert other currencies into ${data.defaultCurrency}.`}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Updated <span className="font-semibold text-slate-700">{timeAgo(data.ratesUpdatedAt)}</span>
            </span>
            {data.ratesSource && <span className="ml-2 text-slate-400">· source {data.ratesSource}</span>}
          </div>
          <button
            type="button"
            onClick={handleRefreshRates}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <HiOutlineArrowPath className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh rates'}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Currency</th>
                <th className="px-4 py-2.5 text-right">Rate — units per 1 {data.defaultCurrency}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-50/40">
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-slate-900">{data.defaultCurrency}</span>
                  <span className="ml-2 text-xs text-slate-400">{labelFor(data.defaultCurrency)} · base</span>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-500">1.0000</td>
              </tr>

              {ratesList.map(([code, value]) => (
                <tr key={code}>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-slate-900">{code}</span>
                    <span className="ml-2 text-xs text-slate-400">{labelFor(code)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">{Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                </tr>
              ))}

              {ratesList.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-400">
                    No rates cached yet — click “Refresh rates”. Until then, other currencies display unconverted (1:1).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Rates refresh automatically every day and whenever you change the base currency.
        </p>
      </SectionCard>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Unsaved changes</span>
          ) : (
            <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="h-4 w-4 text-emerald-500" /> All changes saved</span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setData(deepClone(original.current))}
            disabled={!isDirty || saving}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={!isDirty || saving || separatorsClash}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
