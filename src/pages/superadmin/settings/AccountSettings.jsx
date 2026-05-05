import { useCallback } from 'react'
import { HiShieldCheck } from 'react-icons/hi2'
import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const DEFAULT_STATE = {
  enableRegistration: true,
  verifyEmail: true,
  twoFactorAuth: false,
  authGoogle: true,
  authMicrosoft: true,
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    enableRegistration: !!api.enableRegistration,
    verifyEmail: !!api.verifyEmail,
    twoFactorAuth: !!api.twoFactorAuth,
    authGoogle: api.authGoogle !== false, // default true if not set
    authMicrosoft: api.authMicrosoft !== false,
  }
}

export default function AccountSettings() {
  const fetchFn = useCallback(async () => fromApi((await settingsService.getGeneral()).data), [])
  const saveFn = useCallback(async (state) => fromApi((await settingsService.updateGeneral(state)).data), [])

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE
  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Governance</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Configure security and user onboarding policies.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiShieldCheck className="h-5 w-5" />
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
           <div className="space-y-4">
              <ToggleRow 
                label="Public Registration" 
                sub="Allow new users to create accounts."
                checked={state.enableRegistration}
                onChange={(v) => set({ enableRegistration: v })}
                color="blue"
              />
              <ToggleRow 
                label="Email Verification" 
                sub="Require email confirmation for access."
                checked={state.verifyEmail}
                onChange={(v) => set({ verifyEmail: v })}
                color="indigo"
              />
              <ToggleRow 
                label="Multi-Factor Auth (2FA)" 
                sub="Enforce secondary identity verification."
                checked={state.twoFactorAuth}
                onChange={(v) => set({ twoFactorAuth: v })}
                color="slate"
              />
           </div>

           {state.twoFactorAuth && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                 <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2FA Activation Flow</span>
                    <div className="h-px flex-1 bg-slate-100" />
                 </div>
                 
                  <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100 border-dashed">
                    {/* QR Code Placeholder */}
                    <div className="shrink-0 flex flex-col items-center gap-3">
                       <div className="h-40 w-40 rounded-2xl bg-white p-3 shadow-sm border border-slate-200 group/qr relative overflow-hidden">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=otpauth://totp/HRIS:SuperAdmin?secret=ABCD1234EFGH&issuer=HRIS" 
                            alt="QR Setup" 
                            className="h-full w-full object-contain transition-opacity" 
                          />
                          <div className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none">
                             <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                <HiShieldCheck className="h-5 w-5" />
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">HRIS : SuperAdmin</span>
                          <span className="text-[9px] font-medium text-slate-400">Secret: ABCD-1234-EFGH</span>
                       </div>
                    </div>

                    {/* Setup Instructions */}
                    <div className="flex-1 space-y-4">
                       <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">Step 1: Scan QR Code</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Open Google Authenticator or Microsoft Authenticator and scan the code on the left.
                          </p>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">Step 2: Verify Connectivity</h4>
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               maxLength={6}
                               placeholder="000000"
                               className="w-full max-w-[140px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black tracking-[0.5em] text-slate-900 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                             />
                             <button 
                               type="button"
                               className="rounded-xl bg-slate-900 px-5 text-[10px] font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-black active:scale-95"
                             >
                               Verify
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 p-4 border border-blue-100 text-[10px] font-medium text-blue-700 italic">
                    <HiShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                    <p>Once verified, multi-factor authentication will be enforced for all administrative sessions.</p>
                 </div>
              </div>
           )}
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
           <div className="flex items-center gap-2 pl-3">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Policy Locked</span>
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


function ToggleRow({ label, sub, checked, onChange, color }) {
  const colorCls = color === 'blue' ? 'bg-blue-600' : color === 'indigo' ? 'bg-indigo-600' : 'bg-slate-900'
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
       <div>
          <h4 className="text-xs font-bold text-slate-900">{label}</h4>
          <p className="text-[10px] font-medium text-slate-400 italic">{sub}</p>
       </div>
       <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${checked ? colorCls : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
  )
}
