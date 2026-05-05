import { useCallback, useState } from 'react'
import { HiCreditCard, HiBuildingLibrary } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import useSettings from '../../../hooks/useSettings.js'
import settingsService from '../../../services/settingsService.js'

const DEFAULT_STATE = {
  stripeEnabled: true,
  stripeKey: '',
  stripeSecret: '',
  paypalEnabled: false,
  paypalClientId: '',
  paypalSecret: '',
  razorpayEnabled: false,
  razorpayKeyId: '',
  razorpaySecret: '',
  manualEnabled: false,
  manualInstructions: '',
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    stripeEnabled:   !!api.stripeEnabled,
    stripeKey:       api.stripeKey || '',
    stripeSecret:    api.stripeSecret || '',
    paypalEnabled:   !!api.paypalEnabled,
    paypalClientId:  api.paypalClientId || '',
    paypalSecret:    api.paypalSecret || '',
    razorpayEnabled: !!api.razorpayEnabled,
    razorpayKeyId:   api.razorpayKeyId || '',
    razorpaySecret:  api.razorpaySecret || '',
    manualEnabled:   !!api.manualEnabled,
    manualInstructions: api.manualInstructions || '',
  }
}

export default function PaymentGatewaySettings() {
  const fetchFn = useCallback(async () => {
    try {
        const res = await settingsService.getGeneral()
        return fromApi(res.data)
    } catch (e) {
        return DEFAULT_STATE
    }
  }, [])

  const saveFn = useCallback(async (state) => {
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Connectivity</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Manage secure payment processing pipelines.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiCreditCard className="h-5 w-5" />
        </div>
      </div>

      <form
        className="space-y-6 pb-24"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        {/* Stripe Section */}
        <GatewayCard 
          id="stripe"
          name="Stripe"
          description="Enterprise financial infrastructure."
          enabled={state.stripeEnabled}
          onToggle={() => set({ stripeEnabled: !state.stripeEnabled })}
          color="indigo"
          icon={<HiCreditCard className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Publishable Key</label>
              <input
                type="text"
                value={state.stripeKey}
                onChange={(e) => set({ stripeKey: e.target.value })}
                placeholder="pk_test_..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Secret Key</label>
              <input
                type="password"
                value={state.stripeSecret}
                onChange={(e) => set({ stripeSecret: e.target.value })}
                placeholder="sk_test_..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>
        </GatewayCard>

        {/* PayPal Section */}
        <GatewayCard 
          id="paypal"
          name="PayPal"
          description="Global commerce platform."
          enabled={state.paypalEnabled}
          onToggle={() => set({ paypalEnabled: !state.paypalEnabled })}
          color="blue"
          icon={<HiCreditCard className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Client ID</label>
              <input
                type="text"
                value={state.paypalClientId}
                onChange={(e) => set({ paypalClientId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Secret Key</label>
              <input
                type="password"
                value={state.paypalSecret}
                onChange={(e) => set({ paypalSecret: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>
        </GatewayCard>

        {/* Razorpay Section */}
        <GatewayCard 
          id="razorpay"
          name="Razorpay"
          description="Converged payments for India."
          enabled={state.razorpayEnabled}
          onToggle={() => set({ razorpayEnabled: !state.razorpayEnabled })}
          color="slate"
          icon={<HiCreditCard className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Key ID</label>
              <input
                type="text"
                value={state.razorpayKeyId}
                onChange={(e) => set({ razorpayKeyId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Key Secret</label>
              <input
                type="password"
                value={state.razorpaySecret}
                onChange={(e) => set({ razorpaySecret: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </GatewayCard>

        {/* Manual Section */}
        <GatewayCard 
          id="manual"
          name="Offline Transfer"
          description="Direct bank transfers."
          enabled={state.manualEnabled}
          onToggle={() => set({ manualEnabled: !state.manualEnabled })}
          color="emerald"
          icon={<HiBuildingLibrary className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Payment Instructions</label>
              <textarea
                value={state.manualInstructions}
                onChange={(e) => set({ manualInstructions: e.target.value })}
                placeholder="Bank details..."
                className="w-full min-h-[6rem] rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>
        </GatewayCard>

        {/* Action Footer */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
           <div className="flex items-center gap-2 pl-3">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Grid Synchronized</span>
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

function GatewayCard({ name, description, enabled, onToggle, children, color, icon }) {
  const colorMap = {
    indigo: 'bg-indigo-600 shadow-indigo-100',
    blue: 'bg-blue-600 shadow-blue-100',
    slate: 'bg-slate-900 shadow-slate-100',
    emerald: 'bg-emerald-600 shadow-emerald-100',
  }

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
       <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg ${colorMap[color] || 'bg-slate-900'}`}>
               {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${enabled ? (colorMap[color].split(' ')[0]) : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
       </div>

       <div className={`transition-all duration-500 overflow-hidden ${enabled ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          {children}
       </div>
    </div>
  )
}
