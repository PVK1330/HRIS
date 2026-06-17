import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'
import {
  SASection,
  SASectionCard,
  SAFieldRow,
  SALoadingState,
  SASaveBar,
  inp,
} from './components/ui.jsx'

const DEFAULT_STATE = {
  companyName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  telephone: '',
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

const errInp =
  'h-9 w-full max-w-[240px] rounded-none border border-red-400 bg-white px-3 font-mono text-xs text-slate-800 shadow-2xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400'

export default function CompanyDetails() {
  const [errors, setErrors] = useState({})

  const fetchFn = useCallback(
    async () => fromApi((await settingsService.getCompany()).data),
    []
  )
  const saveFn = useCallback(
    async (state) => fromApi((await settingsService.updateCompany(state)).data),
    []
  )

  const { data, setData, loading, save, saving, refetch } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE

  const set = (patch) => {
    setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))
    const key = Object.keys(patch)[0]
    if (key && errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  const validate = () => {
    const errs = {}
    if (!state.companyName?.trim()) errs.companyName = 'Required'
    if (state.telephone?.trim() && !/^[+\d][\d\s\-().]{5,19}$/.test(state.telephone.trim())) {
      errs.telephone = 'Invalid phone number'
    }
    return errs
  }

  const handleSave = (e) => {
    if (e) e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the highlighted fields')
      return
    }
    setErrors({})
    save()
  }

  if (loading) return <SALoadingState message="Loading company details…" />

  return (
    <form onSubmit={handleSave}>
      <SASection>
        <SASectionCard
          title="Business Identity"
          description="Legal name and primary contact for this organisation"
        >
          <SAFieldRow label="Registered Company Name *">
            <div>
              <input
                type="text"
                value={state.companyName}
                onChange={(e) => set({ companyName: e.target.value })}
                placeholder="e.g. Acme Technologies Ltd."
                className={errors.companyName ? errInp : inp}
              />
              {errors.companyName && (
                <p className="mt-0.5 font-mono text-[10px] text-red-500">{errors.companyName}</p>
              )}
            </div>
          </SAFieldRow>

          <SAFieldRow label="Primary Telephone">
            <div>
              <input
                type="tel"
                value={state.telephone}
                onChange={(e) => set({ telephone: e.target.value })}
                placeholder="+91 98765 43210"
                className={errors.telephone ? errInp : inp}
              />
              {errors.telephone && (
                <p className="mt-0.5 font-mono text-[10px] text-red-500">{errors.telephone}</p>
              )}
            </div>
          </SAFieldRow>
        </SASectionCard>

        <SASectionCard
          title="Location & Address"
          description="Primary registered address of the organisation"
        >
          <SAFieldRow label="Street Address">
            <input
              type="text"
              value={state.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="123 Business Way, Suite 100"
              className={inp}
            />
          </SAFieldRow>

          <SAFieldRow label="City">
            <input
              type="text"
              value={state.city}
              onChange={(e) => set({ city: e.target.value })}
              placeholder="Mumbai"
              className={inp}
            />
          </SAFieldRow>

          <SAFieldRow label="State / Province">
            <input
              type="text"
              value={state.state}
              onChange={(e) => set({ state: e.target.value })}
              placeholder="Maharashtra"
              className={inp}
            />
          </SAFieldRow>

          <SAFieldRow label="ZIP / Postal Code">
            <input
              type="text"
              value={state.zip}
              onChange={(e) => set({ zip: e.target.value })}
              placeholder="400001"
              className={inp}
            />
          </SAFieldRow>

          <SAFieldRow label="Country">
            <input
              type="text"
              value={state.country}
              onChange={(e) => set({ country: e.target.value })}
              placeholder="India"
              className={inp}
            />
          </SAFieldRow>
        </SASectionCard>
      </SASection>

      <SASaveBar
        dirty
        saving={saving}
        onDiscard={() => { setErrors({}); refetch() }}
      />
    </form>
  )
}
