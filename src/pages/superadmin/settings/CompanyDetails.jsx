import { useCallback } from 'react'
import SettingsCard from '../../../components/settings/SettingsCard.jsx'
import FormField from '../../../components/settings/FormField.jsx'
import SaveButton from '../../../components/settings/SaveButton.jsx'
import SettingsInput from '../../../components/settings/SettingsInput.jsx'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const DEFAULT_STATE = {
  companyName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  telephone: '',
}

function FormSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    companyName: api.companyName ?? '',
    address: api.address ?? '',
    city: api.city ?? '',
    state: api.state ?? '',
    zip: api.zip ?? '',
    country: api.country ?? '',
    telephone: api.telephone ?? '',
  }
}

export default function CompanyDetails() {
  const fetchFn = useCallback(
    async () => fromApi((await settingsService.getCompany()).data),
    []
  )
  const saveFn = useCallback(
    async (state) => fromApi((await settingsService.updateCompany(state)).data),
    []
  )

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE
  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Details</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Manage your organization's legal identity and contact information.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      {loading ? (
        <FormSkeleton />
      ) : (
        <form
          className="space-y-6 pb-24"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          {/* Section 1: Business Identity */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Business Identity</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Legal Entity Information</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Registered Company Name</label>
                <input
                  type="text"
                  value={state.companyName}
                  onChange={(e) => set({ companyName: e.target.value })}
                  placeholder="Acme Inc."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Primary Telephone</label>
                <div className="relative group/input">
                  <input
                    type="tel"
                    value={state.telephone}
                    onChange={(e) => set({ telephone: e.target.value })}
                    placeholder="+1 555 000 0000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within/input:text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.812 4.812l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Global Presence */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Location & Presence</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Address Details</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Street Address</label>
                <input
                  type="text"
                  value={state.address}
                  onChange={(e) => set({ address: e.target.value })}
                  placeholder="123 Business Way, Suite 100"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">City</label>
                  <input
                    type="text"
                    value={state.city}
                    onChange={(e) => set({ city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">State / Province</label>
                  <input
                    type="text"
                    value={state.state}
                    onChange={(e) => set({ state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Zip / Postal Code</label>
                  <input
                    type="text"
                    value={state.zip}
                    onChange={(e) => set({ zip: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Country</label>
                  <input
                    type="text"
                    value={state.country}
                    onChange={(e) => set({ country: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="flex items-center gap-2 pl-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational</span>
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
      )}
    </div>
  )
}
