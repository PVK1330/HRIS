import { useCallback } from 'react'
import SettingsCard from '../../../components/settings/SettingsCard.jsx'
import FormField from '../../../components/settings/FormField.jsx'
import SaveButton from '../../../components/settings/SaveButton.jsx'
import SettingsInput from '../../../components/settings/SettingsInput.jsx'
import SettingsSelect from '../../../components/settings/SettingsSelect.jsx'
import SettingsToggle from '../../../components/settings/SettingsToggle.jsx'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Hindi', label: 'Hindi' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
]

const DATE_FORMATS = [
  { value: 'd-m-Y', label: 'd-m-Y' },
  { value: 'm-d-Y', label: 'm-d-Y' },
  { value: 'Y-m-d', label: 'Y-m-d' },
]

const DATE_SELECTORS = [
  { value: 'dd-mm-yyyy', label: 'dd-mm-yyyy' },
  { value: 'mm-dd-yyyy', label: 'mm-dd-yyyy' },
  { value: 'yyyy-mm-dd', label: 'yyyy-mm-dd' },
]

const DEFAULT_STATE = {
  defaultLanguage: 'English',
  timezone: 'UTC',
  dateFormat: 'd-m-Y',
  dateSelectorFormat: 'dd-mm-yyyy',
  renewalGracePeriod: '3',
  termsOfService: false,
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

/**
 * The backend returns/expects a string for `termsOfService` ('true'/'false')
 * because all settings values are stored as TEXT. Cast in/out.
 */
function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    defaultLanguage: api.defaultLanguage || DEFAULT_STATE.defaultLanguage,
    timezone: api.timezone || DEFAULT_STATE.timezone,
    dateFormat: api.dateFormat || DEFAULT_STATE.dateFormat,
    dateSelectorFormat: api.dateSelectorFormat || DEFAULT_STATE.dateSelectorFormat,
    renewalGracePeriod: String(api.renewalGracePeriod ?? DEFAULT_STATE.renewalGracePeriod),
    termsOfService:
      api.termsOfService === true || String(api.termsOfService).toLowerCase() === 'true',
  }
}

function toApi(state) {
  return {
    defaultLanguage: state.defaultLanguage,
    timezone: state.timezone,
    dateFormat: state.dateFormat,
    dateSelectorFormat: state.dateSelectorFormat,
    renewalGracePeriod: Number(state.renewalGracePeriod) || 1,
    termsOfService: !!state.termsOfService,
  }
}

export default function GeneralSettings() {
  const fetchFn = useCallback(
    async () => fromApi((await settingsService.getGeneral()).data),
    []
  )
  const saveFn = useCallback(
    async (state) => fromApi((await settingsService.updateGeneral(toApi(state))).data),
    []
  )

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">General Settings</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Configure global platform behavior and localization.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
          {/* Section 1: Platform Identity */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Platform Identity</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Core Governance</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Renewal Grace Period</label>
                 <div className="relative max-w-[200px]">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={state.renewalGracePeriod}
                      onChange={(e) => set({ renewalGracePeriod: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500 border border-slate-200 uppercase">
                      Days
                    </div>
                 </div>
                 <p className="px-1 text-[9px] font-medium text-slate-400 italic">Subscription buffer after expiry.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Regional & Localization */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.65m2.475-1.27A11 11 0 112.93 11.3a11.3 11.3 0 013.298-3.688" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Regional & Localization</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Format Standards</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Default Language</label>
                <select 
                  value={state.defaultLanguage}
                  onChange={(e) => set({ defaultLanguage: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                >
                  {LANGUAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">System Timezone</label>
                <select 
                  value={state.timezone}
                  onChange={(e) => set({ timezone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                >
                  {TIMEZONES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Display Date Format</label>
                <select 
                  value={state.dateFormat}
                  onChange={(e) => set({ dateFormat: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                >
                  {DATE_FORMATS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Picker Selector Format</label>
                <select 
                  value={state.dateSelectorFormat}
                  onChange={(e) => set({ dateSelectorFormat: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                >
                  {DATE_SELECTORS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Governance */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Governance</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Compliance Controls</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Terms Enforced</span>
                   <SettingsToggle
                    checked={state.termsOfService}
                    onChange={(v) => set({ termsOfService: v })}
                    label=""
                  />
                </div>
             </div>
             <p className="mt-4 text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200 italic">
                Enforce mandatory agreement to Terms of Service during organization onboarding.
             </p>
          </div>

          {/* Action Footer */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="flex items-center gap-2 pl-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
