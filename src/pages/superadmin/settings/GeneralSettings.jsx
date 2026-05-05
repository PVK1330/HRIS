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
  productPurchaseCode: '',
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
    productPurchaseCode: '',
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
    <SettingsCard title="General Settings">
      {loading ? (
        <FormSkeleton />
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <FormField label="Product Purchase Code">
            <SettingsInput
              type="text"
              value={state.productPurchaseCode}
              onChange={(e) => set({ productPurchaseCode: e.target.value })}
              placeholder="Enter purchase code"
            />
          </FormField>

          <FormField label="Default Language" required>
            <SettingsSelect
              value={state.defaultLanguage}
              onChange={(v) => set({ defaultLanguage: v })}
              options={LANGUAGES}
            />
          </FormField>

          <FormField label="Timezone" required>
            <SettingsSelect
              value={state.timezone}
              onChange={(v) => set({ timezone: v })}
              options={TIMEZONES}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Date Format" required>
              <SettingsSelect
                value={state.dateFormat}
                onChange={(v) => set({ dateFormat: v })}
                options={DATE_FORMATS}
              />
            </FormField>
            <FormField label="Date Selector Format" required>
              <SettingsSelect
                value={state.dateSelectorFormat}
                onChange={(v) => set({ dateSelectorFormat: v })}
                options={DATE_SELECTORS}
              />
            </FormField>
          </div>

          <FormField label="Renewal Grace Period" required hint="Number of days (1–30)">
            <div className="relative">
              <input
                type="number"
                min={1}
                max={30}
                value={state.renewalGracePeriod}
                onChange={(e) => set({ renewalGracePeriod: e.target.value })}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-16 text-sm text-gray-800 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                Days
              </span>
            </div>
          </FormField>

          <FormField label="Terms of Service">
            <SettingsToggle
              checked={state.termsOfService}
              onChange={(v) => set({ termsOfService: v })}
              label={state.termsOfService ? 'Required at signup' : 'Disabled'}
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <SaveButton type="submit" loading={saving} onClick={() => save()} />
          </div>
        </form>
      )}
    </SettingsCard>
  )
}
