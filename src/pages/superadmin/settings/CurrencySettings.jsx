import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import settingsService from '../../../services/settingsService.js'

const DEFAULTS = {
  currencyCode: 'USD',
  currencySymbol: '$',
  currencyPosition: 'left',
  thousandSeparator: ',',
  decimalSeparator: '.',
  decimalPlaces: 2,
}

const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
]

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    currencyCode: api.currencyCode || 'USD',
    currencySymbol: api.currencySymbol || '$',
    currencyPosition: api.currencyPosition || 'left',
    thousandSeparator: api.thousandSeparator || ',',
    decimalSeparator: api.decimalSeparator || '.',
    decimalPlaces: Number(api.decimalPlaces) || 2,
  }
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

export default function CurrencySettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
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

  const isDirty = useMemo(() => {
    if (!data || !original.current) return false
    return JSON.stringify(data) !== JSON.stringify(original.current)
  }, [data])

  const separatorsClash = useMemo(() => {
    if (!data) return false
    return data.thousandSeparator === data.decimalSeparator
  }, [data])

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULTS), ...patch }))

  const handleCurrencySelect = (code) => {
    const found = COMMON_CURRENCIES.find((c) => c.code === code)
    if (found) {
      set({ currencyCode: found.code, currencySymbol: found.symbol })
    } else {
      set({ currencyCode: code })
    }
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!data || separatorsClash) return
    setSaving(true)
    try {
      const res = await settingsService.updateCurrency({
        ...data,
        decimalPlaces: Math.max(0, Math.min(4, Math.floor(Number(data.decimalPlaces) || 0))),
      })
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const formatPreview = () => {
    if (!data) return ''
    const { currencySymbol, currencyPosition, thousandSeparator, decimalSeparator, decimalPlaces } = data
    const parts = `1${thousandSeparator}234${thousandSeparator}567${decimalPlaces > 0 ? decimalSeparator : ''}${'0'.repeat(decimalPlaces)}`
    
    if (currencyPosition === 'left') return `${currencySymbol}${parts}`
    if (currencyPosition === 'left-space') return `${currencySymbol} ${parts}`
    if (currencyPosition === 'right') return `${parts}${currencySymbol}`
    if (currencyPosition === 'right-space') return `${parts} ${currencySymbol}`
    return `${currencySymbol}${parts}`
  }

  const baseInput = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

  if (data === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 rounded-xl bg-gray-100"></div>
          <div className="h-64 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Currency Localization</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Configure global currency display formats and precision.
            </p>
            <div className="mt-6">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Live Preview</div>
              <div className="text-xl font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 inline-block">
                {formatPreview()}
              </div>
            </div>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Currency Code</label>
                  <div className="mt-2">
                    <select
                      value={data.currencyCode}
                      onChange={(e) => handleCurrencySelect(e.target.value)}
                      className={baseInput}
                    >
                      {COMMON_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.code} - {c.label}</option>
                      ))}
                      <option value="OTHER">Other...</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Currency Symbol</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={data.currencySymbol}
                      onChange={(e) => set({ currencySymbol: e.target.value })}
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2 border-t border-gray-900/5">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Symbol Position</label>
                  <div className="mt-2">
                    <select
                      value={data.currencyPosition}
                      onChange={(e) => set({ currencyPosition: e.target.value })}
                      className={baseInput}
                    >
                      <option value="left">Left ($99)</option>
                      <option value="left-space">Left with space ($ 99)</option>
                      <option value="right">Right (99$)</option>
                      <option value="right-space">Right with space (99 $)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Decimal Places</label>
                  <div className="mt-2">
                    <select
                      value={data.decimalPlaces.toString()}
                      onChange={(e) => set({ decimalPlaces: Number(e.target.value) })}
                      className={baseInput}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2 border-t border-gray-900/5">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Thousand Separator</label>
                  <div className="mt-2">
                    <select
                      value={data.thousandSeparator}
                      onChange={(e) => set({ thousandSeparator: e.target.value })}
                      className={baseInput}
                    >
                      <option value=",">Comma (,)</option>
                      <option value=".">Dot (.)</option>
                      <option value=" ">Space ( )</option>
                      <option value="'">Apostrophe (')</option>
                      <option value="">None</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Decimal Separator</label>
                  <div className="mt-2">
                    <select
                      value={data.decimalSeparator}
                      onChange={(e) => set({ decimalSeparator: e.target.value })}
                      className={baseInput}
                    >
                      <option value=".">Dot (.)</option>
                      <option value=",">Comma (,)</option>
                    </select>
                  </div>
                  {separatorsClash && (
                    <p className="mt-2 text-sm text-red-600">Thousand separator and decimal separator cannot be the same.</p>
                  )}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setData(deepClone(original.current))}
                disabled={!isDirty || saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving || separatorsClash}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
