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
    <SettingsCard title="Company Details">
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
          <FormField label="Company Name" required>
            <SettingsInput
              type="text"
              value={state.companyName}
              onChange={(e) => set({ companyName: e.target.value })}
              placeholder="Acme Inc."
            />
          </FormField>

          <FormField label="Address">
            <SettingsInput
              type="text"
              value={state.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="Street address"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="City">
              <SettingsInput
                type="text"
                value={state.city}
                onChange={(e) => set({ city: e.target.value })}
              />
            </FormField>
            <FormField label="State / Province">
              <SettingsInput
                type="text"
                value={state.state}
                onChange={(e) => set({ state: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Zip / Postal Code">
              <SettingsInput
                type="text"
                value={state.zip}
                onChange={(e) => set({ zip: e.target.value })}
              />
            </FormField>
            <FormField label="Country">
              <SettingsInput
                type="text"
                value={state.country}
                onChange={(e) => set({ country: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Telephone">
            <SettingsInput
              type="tel"
              value={state.telephone}
              onChange={(e) => set({ telephone: e.target.value })}
              placeholder="+1 555 000 0000"
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
