import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const DEFAULTS = {
  siteDomain: '',
  siteUrl: '',
  enableSsl: false,
}

function fromApi(api) {
  if (!api) return DEFAULTS
  return {
    siteDomain: api.siteDomain || '',
    siteUrl: api.siteUrl || '',
    enableSsl: !!api.enableSsl,
  }
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

export default function DomainSettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const original = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getGeneral()
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load domain settings')
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
      const res = await settingsService.updateGeneral(data)
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

  const baseInput = "block w-full px-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

  if (data === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-48 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Domain Routing</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Configure canonical URLs and secure layer protocols.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Canonical Domain</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={data.siteDomain}
                    onChange={(e) => set({ siteDomain: e.target.value })}
                    placeholder="example.com"
                    className={baseInput}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Base App URL</label>
                <div className="mt-2">
                  <input
                    type="url"
                    value={data.siteUrl}
                    onChange={(e) => set({ siteUrl: e.target.value })}
                    placeholder="https://app.example.com"
                    className={baseInput}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-900/5">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Force SSL / HTTPS</h3>
                  <p className="mt-1 text-sm text-gray-500">Redirect all traffic to secure layer.</p>
                </div>
                <Toggle checked={data.enableSsl} onChange={(v) => set({ enableSsl: v })} />
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
