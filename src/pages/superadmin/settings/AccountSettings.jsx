import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'

const DEFAULTS = {
  publicRegistration: false,
  emailVerification: false,
  twoFactorAuth: false,
}

function fromApi(api) {
  if (!api) return { ...DEFAULTS }
  return {
    publicRegistration: !!api.publicRegistration,
    emailVerification: !!api.emailVerification,
    twoFactorAuth: !!api.twoFactorAuth,
  }
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v))
}

function RowSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-2 h-16 animate-pulse rounded bg-gray-100" />
      ))}
    </div>
  )
}

export default function AccountSettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const originalRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getAccountSettings()
      const next = fromApi(res?.data)
      setSettings(next)
      originalRef.current = deepClone(next)
    } catch (err) {
      toast.error(err?.message || 'Failed to load account settings')
      setSettings({ ...DEFAULTS })
      originalRef.current = { ...DEFAULTS }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isDirty = useMemo(() => {
    if (!settings || !originalRef.current) return false
    return JSON.stringify(settings) !== JSON.stringify(originalRef.current)
  }, [settings])

  const set = (patch) => setSettings((prev) => ({ ...(prev || DEFAULTS), ...patch }))

  const handleDiscard = () => {
    if (!originalRef.current) return
    setSettings(deepClone(originalRef.current))
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await settingsService.updateAccountSettings({
        publicRegistration: settings.publicRegistration,
        emailVerification: settings.emailVerification,
        twoFactorAuth: settings.twoFactorAuth,
      })
      const next = fromApi(res?.data)
      setSettings(next)
      originalRef.current = deepClone(next)
      toast.success('Account settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 md:px-0">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Governance</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure security and user onboarding policies.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      </div>

      {settings === null ? (
        <RowSkeleton />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <div className="text-sm font-semibold text-gray-800">Public Registration</div>
              <div className="mt-0.5 text-xs text-gray-400">Allow new users to create accounts.</div>
            </div>
            <Toggle checked={settings.publicRegistration} onChange={(v) => set({ publicRegistration: v })} />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <div className="text-sm font-semibold text-gray-800">Email Verification</div>
              <div className="mt-0.5 text-xs text-gray-400">Require email confirmation for access.</div>
            </div>
            <Toggle checked={settings.emailVerification} onChange={(v) => set({ emailVerification: v })} />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <div className="text-sm font-semibold text-gray-800">Multi-Factor Auth (2FA)</div>
              <div className="mt-0.5 text-xs text-gray-400">Enforce secondary identity verification.</div>
            </div>
            <Toggle checked={settings.twoFactorAuth} onChange={(v) => set({ twoFactorAuth: v })} />
          </div>
        </div>
      )}

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 shadow-lg">
          <div className="flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            <span className="ml-2 text-xs uppercase tracking-wider text-gray-500">POLICY LOCKED</span>
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
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
              )}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
