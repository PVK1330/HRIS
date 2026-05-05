import { useCallback } from 'react'
import { HiCreditCard } from 'react-icons/hi2'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
]

const DEFAULT_STATE = {
  defaultCurrency: 'USD',
  currencySymbol: '$',
  currencyPosition: 'left', // left, right
  decimalSeparator: '.',
  thousandSeparator: ',',
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    defaultCurrency: api.defaultCurrency || 'USD',
    currencySymbol: api.currencySymbol || '$',
    currencyPosition: api.currencyPosition || 'left',
    decimalSeparator: api.decimalSeparator || '.',
    thousandSeparator: api.thousandSeparator || ',',
  }
}

export default function CurrencySettings() {
  const fetchFn = useCallback(async () => fromApi((await settingsService.getGeneral()).data), [])
  const saveFn = useCallback(async (state) => fromApi((await settingsService.updateGeneral(state)).data), [])

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE
  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Localization</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Configure currency presentation and precision logic.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiCreditCard className="h-5 w-5" />
        </div>
      </div>

      <form
        className="space-y-6 pb-24"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Default Currency</label>
                <select
                  value={state.defaultCurrency}
                  onChange={(e) => {
                    const c = CURRENCIES.find(x => x.value === e.target.value)
                    set({ defaultCurrency: e.target.value, currencySymbol: c?.symbol || '$' })
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                >
                  {CURRENCIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Symbol Position</label>
                <select
                  value={state.currencyPosition}
                  onChange={(e) => set({ currencyPosition: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="left">Before Amount ($100)</option>
                  <option value="right">After Amount (100$)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Decimal Separator</label>
                <input
                  type="text"
                  maxLength={1}
                  value={state.decimalSeparator}
                  onChange={(e) => set({ decimalSeparator: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Thousand Separator</label>
                <input
                  type="text"
                  maxLength={1}
                  value={state.thousandSeparator}
                  onChange={(e) => set({ thousandSeparator: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white text-center"
                />
              </div>
           </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
           <div className="flex items-center gap-2 pl-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pricing Matrix Synced</span>
           </div>
           <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-[10px] font-black text-white shadow-lg transition-all hover:bg-black active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  )
}
