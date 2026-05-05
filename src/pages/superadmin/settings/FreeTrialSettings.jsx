import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HiClock, HiShieldCheck, HiTicket } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const DEFAULTS = {
  trialEnabled: false,
  trialDays: 14,
  mandatoryPaymentMethod: false,
  maxTenantsPerIdentity: 1,
}

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    trialEnabled: !!api.trialEnabled,
    trialDays: Number(api.trialDays) || 14,
    mandatoryPaymentMethod: !!api.mandatoryPaymentMethod,
    maxTenantsPerIdentity: Number(api.maxTenantsPerIdentity) || 1,
  }
}

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

function clampInt(value, min, max) {
  const n = Math.floor(Number(value))
  if (Number.isNaN(n)) return min
  return Math.min(Math.max(n, min), max)
}

export default function FreeTrialSettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const original = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getFreeTrial()
      const next = fromApi(res?.data)
      setData(next)
      original.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load free trial settings')
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
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      const payload = {
        trialEnabled: data.trialEnabled,
        trialDays: clampInt(data.trialDays, 1, 365),
        mandatoryPaymentMethod: data.mandatoryPaymentMethod,
        maxTenantsPerIdentity: clampInt(data.maxTenantsPerIdentity, 1, 10),
      }
      const res = await settingsService.updateFreeTrial(payload)
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

  const baseInput =
    'w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-0 pb-24">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acquisition Strategy</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure free trial parameters and onboarding governance.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md">
          <HiTicket className="h-5 w-5" />
        </div>
      </div>

      {/* Skeleton */}
      {data === null && (
        <div className="space-y-4">
          <div className="h-[200px] animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          <div className="h-[180px] animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        </div>
      )}

      {data !== null && (
        <div className="space-y-4">
          {/* Card 1 — Trial Mechanism */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-white">
                  <HiClock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900">Trial Mechanism</div>
                  <div className="mt-0.5 text-xs uppercase tracking-widest text-gray-400">
                    TIME-BASED ACCESS
                  </div>
                </div>
              </div>
              <Toggle checked={data.trialEnabled} onChange={(v) => set({ trialEnabled: v })} />
            </header>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                data.trialEnabled ? 'mt-5 max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Trial Window (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={data.trialDays}
                    onChange={(e) => set({ trialDays: e.target.value })}
                    onBlur={(e) => set({ trialDays: clampInt(e.target.value, 1, 365) })}
                    className={baseInput}
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Mandatory Payment Method</div>
                      <div className="text-xs text-gray-500">
                        Require card to initiate trial.
                      </div>
                    </div>
                    <Toggle
                      checked={data.mandatoryPaymentMethod}
                      onChange={(v) => set({ mandatoryPaymentMethod: v })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2 — Onboarding Guardrails */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <header className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">Onboarding Guardrails</div>
                <div className="mt-0.5 text-xs uppercase tracking-widest text-gray-400">
                  ALLOCATION POLICY
                </div>
              </div>
            </header>

            <div className="mt-5 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Max Tenants Per Identity
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={data.maxTenantsPerIdentity}
                onChange={(e) => set({ maxTenantsPerIdentity: e.target.value })}
                onBlur={(e) => set({ maxTenantsPerIdentity: clampInt(e.target.value, 1, 10) })}
                className={baseInput}
              />
              <p className="text-xs italic text-gray-400">
                Limits distinct trial accounts per identity.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Bottom save bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 shadow-lg">
          <div className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              GROWTH SYNCHRONIZED
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
