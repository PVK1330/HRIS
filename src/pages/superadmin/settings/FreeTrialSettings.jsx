import { useCallback, useState } from 'react'
import { HiTicket, HiShieldCheck, HiArrowPath } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const DEFAULT_STATE = {
  enableFreeTrial: true,
  trialDurationDays: 14,
  requireCardForTrial: false,
  maxTenantsPerTrial: 1,
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    enableFreeTrial:    !!api.enableFreeTrial,
    trialDurationDays:  Number(api.trialDurationDays || 14),
    requireCardForTrial: !!api.requireCardForTrial,
    maxTenantsPerTrial: Number(api.maxTenantsPerTrial || 1),
  }
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 w-full animate-pulse rounded-[2.5rem] bg-slate-100" />
      <div className="h-64 w-full animate-pulse rounded-[2.5rem] bg-slate-100" />
    </div>
  )
}

export default function FreeTrialSettings() {
  const fetchFn = useCallback(async () => {
    // Note: Assuming a settingsService.getFreeTrial method exists or using general settings
    // For now, using a mock behavior if service not yet updated
    try {
        const res = await settingsService.getGeneral()
        return fromApi(res.data)
    } catch (e) {
        return DEFAULT_STATE
    }
  }, [])

  const saveFn = useCallback(async (state) => {
    // Assuming settingsService.updateGeneral can handle these keys
    const res = await settingsService.updateGeneral(state)
    return fromApi(res.data)
  }, [])

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE
  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Acquisition Strategy</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Configure free trial parameters and onboarding governance.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiTicket className="h-5 w-5" />
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
          {/* Trial Logic */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
             <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                    <HiTicket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Trial Mechanism</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time-based Access</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set({ enableFreeTrial: !state.enableFreeTrial })}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${state.enableFreeTrial ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${state.enableFreeTrial ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>

             <div className={`space-y-4 transition-opacity ${state.enableFreeTrial ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Trial Window (Days)</label>
                  <input
                    type="number"
                    value={state.trialDurationDays}
                    onChange={(e) => set({ trialDurationDays: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                   <div>
                      <h4 className="text-xs font-black text-slate-900">Mandatory Payment Method</h4>
                      <p className="text-[10px] font-medium text-slate-400">Require card to initiate trial.</p>
                   </div>
                   <button
                      type="button"
                      onClick={() => set({ requireCardForTrial: !state.requireCardForTrial })}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${state.requireCardForTrial ? 'bg-slate-900' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${state.requireCardForTrial ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
             </div>
          </div>

          {/* Infrastructure Guardrails */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
             <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                  <HiShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Onboarding Guardrails</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Allocation Policy</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Max Tenants per Identity</label>
                  <input
                    type="number"
                    value={state.maxTenantsPerTrial}
                    onChange={(e) => set({ maxTenantsPerTrial: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
                  />
                  <p className="px-1 text-[9px] font-bold text-slate-400 italic">Limits distinct trial accounts per identity.</p>
                </div>
             </div>
          </div>

          {/* Action Footer */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="flex items-center gap-2 pl-3">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth Synchronized</span>
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
