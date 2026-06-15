import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import settingsService from '../../../../services/settingsService.js'

const DEFAULTS = {
  host: '',
  port: 587,
  username: '',
  password: '',
  encryption: 'tls',
  fromName: '',
  fromEmail: '',
}

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    host: api.host || '',
    port: Number(api.port) || 587,
    username: api.username || '',
    password: api.password || '',
    encryption: api.encryption || 'tls',
    fromName: api.fromName || '',
    fromEmail: api.fromEmail || '',
  }
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
    {children}
  </div>
)

export default function EmailSettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const original = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getEmail()
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load email settings')
      setData({ ...DEFAULTS })
      original.current = { ...DEFAULTS }
    }
  }, [])

  useEffect(() => { load() }, [load])

  const isDirty = useMemo(() => {
    if (!data || !original.current) return false
    return JSON.stringify(data) !== JSON.stringify(original.current)
  }, [data])

  const set = (patch) => setData((prev) => ({ ...(prev || DEFAULTS), ...patch }))

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!data) return
    setSaving(true)
    try {
      const res = await settingsService.updateEmail({ ...data, port: Number(data.port) || 587 })
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
      toast.success('SMTP settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      await settingsService.sendTestEmail({ sendTo: data?.fromEmail || 'test@example.com' })
      toast.success('SMTP connection verified')
    } catch (err) {
      toast.error(err?.message || 'SMTP connection failed')
    } finally {
      setTesting(false)
    }
  }

  const inp = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition"

  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <form onSubmit={handleSave} className="space-y-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">SMTP Configuration</h2>
          <p className="mt-0.5 text-sm text-gray-500">Configure your outbound mail server connection.</p>
        </div>

        {/* Server Connection */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Server Connection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field label="Hostname">
                <input
                  type="text"
                  value={data.host}
                  onChange={(e) => set({ host: e.target.value })}
                  placeholder="smtp.example.com"
                  className={inp}
                />
              </Field>
            </div>
            <div>
              <Field label="Port">
                <input
                  type="number"
                  value={data.port}
                  onChange={(e) => set({ port: e.target.value })}
                  placeholder="587"
                  className={inp}
                />
              </Field>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Field label="Encryption">
                <select
                  value={data.encryption}
                  onChange={(e) => set({ encryption: e.target.value })}
                  className={inp}
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Authentication</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Username">
              <input
                type="text"
                value={data.username}
                onChange={(e) => set({ username: e.target.value })}
                placeholder="user@example.com"
                className={inp}
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => set({ password: e.target.value })}
                  placeholder="••••••••"
                  className={`${inp} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
          </div>
        </div>

        {/* Sender Identity */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Sender Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="From Name" hint="Display name recipients see">
              <input
                type="text"
                value={data.fromName}
                onChange={(e) => set({ fromName: e.target.value })}
                placeholder="My Platform"
                className={inp}
              />
            </Field>
            <Field label="From Address" hint="Reply-to email address">
              <input
                type="email"
                value={data.fromEmail}
                onChange={(e) => set({ fromEmail: e.target.value })}
                placeholder="noreply@example.com"
                className={inp}
              />
            </Field>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || saving}
            className="text-sm font-medium text-[#0F766E] hover:text-[#115E59] disabled:opacity-40 transition"
          >
            {testing ? 'Testing…' : '⚡ Test Connection'}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setData(deepClone(original.current))}
              disabled={!isDirty || saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!isDirty || saving}
              className="px-5 py-2 rounded-lg bg-[#0F766E] text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] disabled:opacity-40 transition"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
