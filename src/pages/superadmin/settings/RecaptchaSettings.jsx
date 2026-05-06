import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HiShieldCheck, HiEye, HiEyeSlash, HiCheckCircle, HiXCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const MASKED = '••••••••'

const DEFAULTS = {
  isEnabled: false,
  siteKey: '',
  secretKey: '',
}

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    isEnabled: !!api.isEnabled,
    siteKey: api.siteKey || '',
    secretKey: api.secretKey || '', // backend returns •••••••• when set
  }
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

export default function RecaptchaSettings() {
  const [data, setData] = useState(null) // null = loading
  const [saving, setSaving] = useState(false)
  const [revealSecret, setRevealSecret] = useState(false)
  const [test, setTest] = useState({ state: 'idle', message: '' })
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

  const handleDiscard = () => {
    if (!original.current) return
    setData(deepClone(original.current))
    setTest({ state: 'idle', message: '' })
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      const payload = {
        isEnabled: data.isEnabled,
        siteKey: data.siteKey,
        // Drop masked secret so backend keeps existing.
        ...(data.secretKey && data.secretKey !== MASKED ? { secretKey: data.secretKey } : {}),
      }
      const res = await settingsService.updateRecaptcha(payload)
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTest({ state: 'loading', message: '' })
    try {
      const res = await settingsService.testRecaptcha()
      const verified = !!res?.data?.verified
      setTest({
        state: verified ? 'success' : 'error',
        message: res?.data?.message || (verified ? 'Verified' : 'Verification failed'),
      })
    } catch (err) {
      setTest({ state: 'error', message: err?.message || 'Test failed' })
    }
  }

  const baseInput =
    'w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-0 pb-24">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bot Protection</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure Google reCAPTCHA v2 to safeguard entry points.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md">
          <HiShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* Skeleton */}
      {data === null && (
        <div className="h-[280px] animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
      )}

      {data !== null && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-white">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">Grid Credentials</div>
                <div className="mt-0.5 text-xs uppercase tracking-widest text-gray-400">
                  BOT GOVERNANCE
                </div>
              </div>
            </div>
            <Toggle checked={data.isEnabled} onChange={(v) => set({ isEnabled: v })} />
          </header>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              data.isEnabled ? 'mt-5 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Site Key
                </label>
                <input
                  type="text"
                  value={data.siteKey}
                  onChange={(e) => set({ siteKey: e.target.value })}
                  className={baseInput}
                  placeholder="6Lc..."
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={revealSecret ? 'text' : 'password'}
                    value={data.secretKey}
                    onChange={(e) => set({ secretKey: e.target.value })}
                    className={`${baseInput} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={revealSecret ? 'Hide value' : 'Show value'}
                  >
                    {revealSecret ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={test.state === 'loading'}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
                >
                  {test.state === 'loading' && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  <span>Test reCAPTCHA</span>
                </button>

                {test.state === 'success' && (
                  <div className="flex items-start gap-2 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <HiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{test.message}</span>
                  </div>
                )}
                {test.state === 'error' && (
                  <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <HiXCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{test.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom save bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 shadow-lg">
          <div className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              SHIELD ACTIVE
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
