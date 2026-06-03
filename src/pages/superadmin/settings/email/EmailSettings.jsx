import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from '../../../../components/ui/Toggle.jsx'
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

export default function EmailSettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
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
      const payload = {
        ...data,
        port: Number(data.port) || 587,
      }
      const res = await settingsService.updateEmail(payload)
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
      toast.success('Email settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save email settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      // Assuming sendTestEmail expects `{ sendTo: string }`.
      // You can just send it to the 'fromEmail' for testing if no specific input is provided.
      await settingsService.sendTestEmail({ sendTo: data?.fromEmail || 'test@example.com' })
      toast.success('SMTP connection successful')
    } catch (err) {
      toast.error(err?.message || 'SMTP connection failed')
    } finally {
      setTesting(false)
    }
  }

  const baseInput = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

  if (data === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 rounded-xl bg-gray-100"></div>
          <div className="h-48 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        {/* SMTP Configuration */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">SMTP Server</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Configure connection details for your outbound mail server.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Hostname</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={data.host}
                      onChange={(e) => set({ host: e.target.value })}
                      placeholder="smtp.example.com"
                      className={baseInput}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Port</label>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={data.port}
                      onChange={(e) => set({ port: e.target.value })}
                      placeholder="587"
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Encryption Method</label>
                  <div className="mt-2">
                    <select
                      value={data.encryption}
                      onChange={(e) => set({ encryption: e.target.value })}
                      className={baseInput}
                    >
                      <option value="none">None</option>
                      <option value="ssl">SSL</option>
                      <option value="tls">TLS</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-gray-900/5 pt-6">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Username</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={data.username}
                      onChange={(e) => set({ username: e.target.value })}
                      placeholder="user@example.com"
                      className={baseInput}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                  <div className="mt-2">
                    <input
                      type="password"
                      value={data.password}
                      onChange={(e) => set({ password: e.target.value })}
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  {testing ? 'Testing connection...' : 'Test Connection'}
                </button>
              </div>

            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setData(deepClone(original.current))}
                disabled={!isDirty || saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* System Sender */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">System Sender</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              The 'From' identity used for automated platform emails.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">From Name</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={data.fromName}
                      onChange={(e) => set({ fromName: e.target.value })}
                      placeholder="Acme Platform"
                      className={baseInput}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">From Address</label>
                  <div className="mt-2">
                    <input
                      type="email"
                      value={data.fromEmail}
                      onChange={(e) => set({ fromEmail: e.target.value })}
                      placeholder="noreply@example.com"
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setData(deepClone(original.current))}
                disabled={!isDirty || saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
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
