import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
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
    // Clear error for the patched key on edit
    const key = Object.keys(patch)[0]
    if (key && errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  const validate = () => {
    const errs = {}
    if (!state.companyName?.trim()) errs.companyName = 'Company name is required'
    if (state.telephone?.trim() && !/^[+\d][\d\s\-().]{5,19}$/.test(state.telephone.trim())) {
      errs.telephone = 'Enter a valid telephone number'
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

  const baseInput = "block w-full px-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] sm:text-sm sm:leading-6"
  const errInput = "block w-full px-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-2 ring-inset ring-red-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"

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
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Business Identity</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Manage your organization's legal identity and contact information.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Registered Company Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={state.companyName}
                    onChange={(e) => set({ companyName: e.target.value })}
                    placeholder="e.g. Acme Technologies Ltd."
                    className={errors.companyName ? errInput : baseInput}
                  />
                </div>
                {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Primary Telephone</label>
                <div className="mt-2">
                  <input
                    type="tel"
                    value={state.telephone}
                    onChange={(e) => set({ telephone: e.target.value })}
                    placeholder="e.g. +1 555 000 0000"
                    className={errors.telephone ? errInput : baseInput}
                  />
                </div>
                {errors.telephone && <p className="mt-1 text-xs text-red-500">{errors.telephone}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => { setErrors({}); refetch() }}
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
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Location & Presence</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                The primary global address for the organization.
              </p>
            </div>
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Street Address</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={state.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="e.g. 123 Business Way, Suite 100"
                    className={baseInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">City</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={state.city}
                      onChange={(e) => set({ city: e.target.value })}
                      placeholder="e.g. San Francisco"
                      className={baseInput}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">State / Province</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={state.state}
                      onChange={(e) => set({ state: e.target.value })}
                      placeholder="e.g. California"
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">ZIP / Postal Code</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={state.zip}
                      onChange={(e) => set({ zip: e.target.value })}
                      placeholder="e.g. 94102"
                      className={baseInput}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Country</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={state.country}
                      onChange={(e) => set({ country: e.target.value })}
                      placeholder="e.g. United States"
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => { setErrors({}); refetch() }}
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
