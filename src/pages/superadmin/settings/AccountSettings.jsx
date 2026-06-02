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
      toast.error(err?.message || 'Failed to load settings')
      setSettings({ ...DEFAULTS })
      originalRef.current = { ...DEFAULTS }
    }
  }, [])

  useEffect(() => { load() }, [load])

  const isDirty = useMemo(() => {
    if (!settings || !originalRef.current) return false
    return JSON.stringify(settings) !== JSON.stringify(originalRef.current)
  }, [settings])

  const set = (patch) => setSettings((prev) => ({ ...(prev || DEFAULTS), ...patch }))

  const handleSave = async (e) => {
    if (e) e.preventDefault()
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
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (settings === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-32 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Account Policies</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Configure security and user onboarding access across the platform.
            </p>
          </div>

          <form 
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Public Registration</h3>
                  <p className="mt-1 text-sm text-gray-500">Allow new users to create accounts without an admin invitation.</p>
                </div>
                <Toggle checked={settings.publicRegistration} onChange={(v) => set({ publicRegistration: v })} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Email Verification</h3>
                  <p className="mt-1 text-sm text-gray-500">Require email confirmation before granting system access.</p>
                </div>
                <Toggle checked={settings.emailVerification} onChange={(v) => set({ emailVerification: v })} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium leading-6 text-gray-900">Multi-Factor Auth (2FA)</h3>
                  <p className="mt-1 text-sm text-gray-500">Enforce secondary identity verification for all accounts.</p>
                </div>
                <Toggle checked={settings.twoFactorAuth} onChange={(v) => set({ twoFactorAuth: v })} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setSettings(deepClone(originalRef.current))}
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
