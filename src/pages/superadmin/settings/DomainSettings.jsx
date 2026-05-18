import { useCallback } from 'react'
import { HiGlobeAlt } from 'react-icons/hi2'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const DEFAULT_STATE = {
  siteDomain: '',
  siteUrl: '',
  enableSsl: false,
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    siteDomain: api.siteDomain || '',
    siteUrl: api.siteUrl || '',
    enableSsl: !!api.enableSsl,
  }
}

export default function DomainSettings() {
  const fetchFn = useCallback(async () => fromApi((await settingsService.getGeneral()).data), [])
  const saveFn = useCallback(async (state) => fromApi((await settingsService.updateGeneral(state)).data), [])

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE
  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Infrastructure</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Configure routing, SSL certificates, and primary domain mappings.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiGlobeAlt className="h-5 w-5" />
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
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Canonical Domain</label>
              <input
                type="text"
                value={state.siteDomain}
                onChange={(e) => set({ siteDomain: e.target.value })}
                placeholder="example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Base App URL</label>
              <input
                type="url"
                value={state.siteUrl}
                onChange={(e) => set({ siteUrl: e.target.value })}
                placeholder="https://app.example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
               <div>
                  <h4 className="text-xs font-black text-slate-900">Force SSL / HTTPS</h4>
                  <p className="text-[10px] font-medium text-slate-400 italic">Redirect all traffic to secure layer.</p>
               </div>
               <button
                  type="button"
                  onClick={() => set({ enableSsl: !state.enableSsl })}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${state.enableSsl ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${state.enableSsl ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
           <div className="flex items-center gap-2 pl-3">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grid Active</span>
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
