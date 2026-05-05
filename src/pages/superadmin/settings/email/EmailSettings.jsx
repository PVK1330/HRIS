import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiEye, HiEyeSlash, HiEnvelope, HiServer, HiShieldCheck } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import SettingsCard from '../../../../components/settings/SettingsCard.jsx'
import FormField from '../../../../components/settings/FormField.jsx'
import SaveButton from '../../../../components/settings/SaveButton.jsx'
import SettingsInput from '../../../../components/settings/SettingsInput.jsx'
import SettingsSelect from '../../../../components/settings/SettingsSelect.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'

import useSettings from '../../../../hooks/useSettings.js'
import settingsService from '../../../../services/settingsService.js'

const DELIVERY_OPTIONS = [{ value: 'smtp', label: 'SMTP' }]
const ENCRYPTION_OPTIONS = [
  { value: 'tls', label: 'TLS' },
  { value: 'ssl', label: 'SSL' },
  { value: 'none', label: 'None' },
]

const DEFAULT_STATE = {
  systemEmail: '',
  systemFromName: '',
  emailDelivery: 'smtp',
  smtpHost: '',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls',
}

function fromApi(api) {
  if (!api) return DEFAULT_STATE
  return {
    systemEmail:    api.systemEmail ?? '',
    systemFromName: api.systemFromName ?? '',
    emailDelivery:  api.emailDelivery || 'smtp',
    smtpHost:       api.smtpHost ?? '',
    smtpPort:       String(api.smtpPort ?? '587'),
    smtpUsername:   api.smtpUsername ?? '',
    smtpPassword:   api.smtpPassword ?? '',
    smtpEncryption: api.smtpEncryption || 'tls',
  }
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

const PASSWORD_MASK = '••••••••'

function TestEmailModal({ open, onClose }) {
  const [sendTo, setSendTo] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setSendTo('')
      setSuccess(null)
      setError(null)
    }
  }, [open])

  const submit = async () => {
    if (!sendTo.trim()) {
      setError('Recipient address required')
      return
    }
    setSending(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await settingsService.sendTestEmail({ sendTo: sendTo.trim() })
      setSuccess(res?.message || 'Verification relay successful')
      toast.success('Test email dispatched')
    } catch (err) {
      setError(err?.message || 'Relay verification failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Network Diagnostic: SMTP Relay" size="sm">
      <div className="space-y-6 p-1">
        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          Trigger a real-time verification email using the currently persisted SMTP parameters to validate server-to-server connectivity.
        </p>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recipient Address</label>
          <input
            type="email"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            placeholder="admin@verification.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
          />
        </div>

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-[11px] font-bold text-emerald-700 animate-in zoom-in">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 border border-red-100 text-[11px] font-bold text-red-700 animate-in zoom-in">
            <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={submit}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-black text-white shadow-lg transition-all hover:bg-black disabled:opacity-50"
          >
            {sending ? 'Dispatching...' : 'Fire Test Email'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function EmailSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'smtp' ? 'smtp' : 'email'
  const [tab, setTab] = useState(initialTab)
  const [showPwd, setShowPwd] = useState(false)
  const [testOpen, setTestOpen] = useState(false)
  const [originalPasswordWasMasked, setOriginalPasswordWasMasked] = useState(false)

  // Keep tab in sync with URL when sidebar links to ?tab=smtp
  useEffect(() => {
    const t = searchParams.get('tab') === 'smtp' ? 'smtp' : 'email'
    setTab(t)
  }, [searchParams])

  const fetchFn = useCallback(async () => {
    const res = await settingsService.getEmail()
    const mapped = fromApi(res.data)
    return mapped
  }, [])

  const saveFn = useCallback(
    async (state) => {
      const payload = {
        systemEmail: state.systemEmail,
        systemFromName: state.systemFromName,
        emailDelivery: state.emailDelivery,
        smtpHost: state.smtpHost,
        smtpPort: Number(state.smtpPort) || 587,
        smtpUsername: state.smtpUsername,
        smtpEncryption: state.smtpEncryption,
      }
      // Only send password if the user actually typed a new one (i.e. it's
      // not the masked placeholder we received from the server).
      if (state.smtpPassword && state.smtpPassword !== PASSWORD_MASK) {
        payload.smtpPassword = state.smtpPassword
      }
      const res = await settingsService.updateEmail(payload)
      return fromApi(res.data)
    },
    []
  )

  const { data, setData, loading, save, saving } = useSettings(fetchFn, saveFn)
  const state = data || DEFAULT_STATE

  // Track whether the loaded password is just the server-side mask
  useEffect(() => {
    if (data?.smtpPassword === PASSWORD_MASK) {
      setOriginalPasswordWasMasked(true)
    }
  }, [data?.smtpPassword])

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULT_STATE), ...patch }))

  const switchTab = (next) => {
    setTab(next)
    if (next === 'smtp') {
      const sp = new URLSearchParams(searchParams)
      sp.set('tab', 'smtp')
      setSearchParams(sp, { replace: true })
    } else {
      const sp = new URLSearchParams(searchParams)
      sp.delete('tab')
      setSearchParams(sp, { replace: true })
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Email Infrastructure</h1>
          <p className="mt-0.5 text-slate-500 text-[11px] font-medium">Configure automated messaging and global SMTP relay.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
          <HiEnvelope className="h-5 w-5" />
        </div>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 max-w-fit">
        <button
          type="button"
          onClick={() => switchTab('email')}
          className={`px-4 md:px-6 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
            tab === 'email'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Messaging
        </button>
        <button
          type="button"
          onClick={() => switchTab('smtp')}
          className={`px-4 md:px-6 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
            tab === 'smtp'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          SMTP Protocol
        </button>
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
          {tab === 'email' && (
            <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
               <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                    <HiEnvelope className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">System Identity</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sender Metadata</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Outbound Email</label>
                    <input
                      type="email"
                      value={state.systemEmail}
                      onChange={(e) => set({ systemEmail: e.target.value })}
                      placeholder="no-reply@platform.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Friendly "From" Name</label>
                    <input
                      type="text"
                      value={state.systemFromName}
                      onChange={(e) => set({ systemFromName: e.target.value })}
                      placeholder="HR Core Notifications"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Delivery Mechanism</label>
                    <select
                      value={state.emailDelivery}
                      onChange={(e) => set({ emailDelivery: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-600 focus:bg-white appearance-none cursor-pointer"
                    >
                      {DELIVERY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          )}

          {tab === 'smtp' && (
            <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
               <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                      <HiServer className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">SMTP Protocol</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Relay Credentials</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[9px] font-black text-blue-600 border border-blue-100 transition-all hover:bg-blue-600 hover:text-white"
                  >
                    <HiEye className="h-3 w-3" />
                    TEST RELAY
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Relay Hostname</label>
                    <input
                      type="text"
                      value={state.smtpHost}
                      onChange={(e) => set({ smtpHost: e.target.value })}
                      placeholder="smtp.provider.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Port</label>
                      <input
                        type="number"
                        value={state.smtpPort}
                        onChange={(e) => set({ smtpPort: e.target.value })}
                        placeholder="587"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Encryption</label>
                      <select
                        value={state.smtpEncryption}
                        onChange={(e) => set({ smtpEncryption: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white appearance-none cursor-pointer"
                      >
                        {ENCRYPTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Authenticator Username</label>
                    <input
                      type="text"
                      value={state.smtpUsername}
                      onChange={(e) => set({ smtpUsername: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Authenticator Password</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={state.smtpPassword}
                        onChange={(e) => set({ smtpPassword: e.target.value })}
                        onFocus={() => {
                          if (state.smtpPassword === PASSWORD_MASK) {
                            set({ smtpPassword: '' })
                          }
                        }}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        {showPwd ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    {originalPasswordWasMasked && (
                      <p className="px-1 text-[9px] font-medium text-slate-400 italic">Leave unchanged for current security.</p>
                    )}
                  </div>
               </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] md:w-full max-w-[400px] items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="flex items-center gap-2 pl-3">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grid Synchronized</span>
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

      <TestEmailModal open={testOpen} onClose={() => setTestOpen(false)} />
    </div>
  )
}
