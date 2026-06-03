import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const DEFAULTS = {
  enabled: false,
  siteKey: '',
  secretKey: '',
}

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    enabled: !!api.enabled,
    siteKey: api.siteKey || '',
    secretKey: api.secretKey || '',
  }
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

export default function RecaptchaSettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const original = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getRecaptcha()
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load reCAPTCHA settings')
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
      const res = await settingsService.updateRecaptcha(data)
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const baseInput = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

  if (data === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Spam Prevention</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Configure Google reCAPTCHA v2 to protect public endpoints from bots.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-900/5">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Enable reCAPTCHA</h3>
                  <p className="mt-1 text-sm text-gray-500">Require CAPTCHA verification on public forms.</p>
                </div>
                <Toggle checked={data.enabled} onChange={(v) => set({ enabled: v })} />
              </div>

              {data.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Site Key</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={data.siteKey}
                        onChange={(e) => set({ siteKey: e.target.value })}
                        placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        className={baseInput}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Used in the HTML code your site serves to users.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Secret Key</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={data.secretKey}
                        onChange={(e) => set({ secretKey: e.target.value })}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className={baseInput}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Kept secret and used for communication between your site and Google.</p>
                  </div>
                </>
              )}
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
