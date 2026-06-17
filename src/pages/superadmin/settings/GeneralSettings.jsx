import { useCallback } from 'react'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'
import useSettingsMeta from './useSettingsMeta.js'
import {
  SASection,
  SASectionCard,
  SAFieldRow,
  SALoadingState,
  SASaveBar,
  sel,
} from './components/ui.jsx'

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

const numInp =
  'h-9 w-28 rounded-none border border-slate-200 bg-white px-3 font-mono text-xs tabular-nums text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'

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
  const opts = meta?.general || FALLBACK_OPTIONS

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  if (loading) return <SALoadingState message="Loading general settings…" />

  return (
    <form onSubmit={(e) => { e.preventDefault(); save() }}>
      <SASection>
        <SASectionCard
          title="Platform Identity"
          description="Global platform behaviour and subscription grace period"
        >
          <SAFieldRow
            label="Renewal Grace Period (days)"
            hint="Subscription buffer after expiry before lockout"
          >
            <input
              type="number"
              min={1}
              max={30}
              value={state.renewalGracePeriod}
              onChange={(e) => set({ renewalGracePeriod: e.target.value })}
              className={numInp}
            />
          </SAFieldRow>
        </SASectionCard>

        <SASectionCard
          title="Localisation"
          description="Global language, timezone and date format defaults"
        >
          <SAFieldRow label="Default Language">
            <select
              value={state.defaultLanguage}
              onChange={(e) => set({ defaultLanguage: e.target.value })}
              className={sel}
            >
              {opts.languages.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </SAFieldRow>

          <SAFieldRow label="System Timezone">
            <select
              value={state.timezone}
              onChange={(e) => set({ timezone: e.target.value })}
              className={sel}
            >
              {opts.timezones.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </SAFieldRow>

          <SAFieldRow label="Display Date Format">
            <select
              value={state.dateFormat}
              onChange={(e) => set({ dateFormat: e.target.value })}
              className={sel}
            >
              {opts.dateFormats.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </SAFieldRow>

          <SAFieldRow label="Picker Selector Format">
            <select
              value={state.dateSelectorFormat}
              onChange={(e) => set({ dateSelectorFormat: e.target.value })}
              className={sel}
            >
              {opts.dateSelectorFormats.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </SAFieldRow>
        </SASectionCard>
      </SASection>

      <SASaveBar
        dirty
        saving={saving}
        onDiscard={() => window.location.reload()}
      />
    </form>
  )
}
