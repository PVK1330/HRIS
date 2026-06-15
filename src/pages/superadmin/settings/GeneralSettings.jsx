import { useCallback } from 'react'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'
import useSettingsMeta from './useSettingsMeta.js'

const FALLBACK_OPTIONS = {
  languages: [{ value: 'English', label: 'English' }],
  timezones: [{ value: 'UTC', label: 'UTC' }],
  dateFormats: [{ value: 'd-m-Y', label: 'd-m-Y' }],
  dateSelectorFormats: [{ value: 'dd-mm-yyyy', label: 'dd-mm-yyyy' }],
}

const DEFAULT_STATE = {
  defaultLanguage: 'English',
  timezone: 'UTC',
  dateFormat: 'd-m-Y',
  dateSelectorFormat: 'dd-mm-yyyy',
  renewalGracePeriod: '3',
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    defaultLanguage: api.defaultLanguage || DEFAULT_STATE.defaultLanguage,
    timezone: api.timezone || DEFAULT_STATE.timezone,
    dateFormat: api.dateFormat || DEFAULT_STATE.dateFormat,
    dateSelectorFormat: api.dateSelectorFormat || DEFAULT_STATE.dateSelectorFormat,
    renewalGracePeriod: String(api.renewalGracePeriod ?? DEFAULT_STATE.renewalGracePeriod),
  }
}

function toApi(state) {
  return {
    defaultLanguage: state.defaultLanguage,
    timezone: state.timezone,
    dateFormat: state.dateFormat,
    dateSelectorFormat: state.dateSelectorFormat,
    renewalGracePeriod: Number(state.renewalGracePeriod) || 1,
  }
}

export default function GeneralSettings() {
  const { meta } = useSettingsMeta()
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
  const optionMeta = meta?.general || FALLBACK_OPTIONS

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  const baseInput = "block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] sm:text-sm sm:leading-6"

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 rounded-xl bg-gray-100"></div>
          <div className="h-64 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Platform Identity</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Configure global platform behavior and billing grace periods.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8">
              <label className="block text-sm font-medium leading-6 text-gray-900">Renewal Grace Period (Days)</label>
              <div className="mt-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={state.renewalGracePeriod}
                  onChange={(e) => set({ renewalGracePeriod: e.target.value })}
                  className={baseInput}
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-500">Subscription buffer after expiry before lockout.</p>
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Regional & Localization</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Global format standards and timezones.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Default Language</label>
                  <div className="mt-2">
                    <select 
                      value={state.defaultLanguage}
                      onChange={(e) => set({ defaultLanguage: e.target.value })}
                      className={baseInput}
                    >
                      {optionMeta.languages.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">System Timezone</label>
                  <div className="mt-2">
                    <select 
                      value={state.timezone}
                      onChange={(e) => set({ timezone: e.target.value })}
                      className={baseInput}
                    >
                      {optionMeta.timezones.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2 border-t border-gray-900/5">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Display Date Format</label>
                  <div className="mt-2">
                    <select 
                      value={state.dateFormat}
                      onChange={(e) => set({ dateFormat: e.target.value })}
                      className={baseInput}
                    >
                      {optionMeta.dateFormats.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Picker Selector Format</label>
                  <div className="mt-2">
                    <select 
                      value={state.dateSelectorFormat}
                      onChange={(e) => set({ dateSelectorFormat: e.target.value })}
                      className={baseInput}
                    >
                      {optionMeta.dateSelectorFormats.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] disabled:opacity-50"
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
