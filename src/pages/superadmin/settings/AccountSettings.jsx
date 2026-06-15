import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import settingsService from '../../../services/settingsService.js'
import { superadminService } from '../../../services/superadminService.js'
import ChangePasswordCard from '../../admin/settings/ChangePasswordCard.jsx'

const mfaErr = (e, fb) => e?.response?.data?.message || e?.message || fb

/** Personal TOTP 2FA enrollment for the logged-in superadmin / sub-admin. */
function MfaSection() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(null)
  const [code, setCode] = useState('')
  const [disarming, setDisarming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    superadminService
      .getMfaStatus()
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatus({ enabled: false }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const enabled = Boolean(status?.enabled)
  const onCode = (v) => setCode(v.replace(/\D/g, '').slice(0, 6))

  const startSetup = async () => {
    setBusy(true)
    try {
      setSetup(await superadminService.setupMfa())
      setCode('')
    } catch (e) {
      toast.error(mfaErr(e, 'Could not start setup'))
    } finally {
      setBusy(false)
    }
  }

  const confirmEnable = async () => {
    if (code.length < 6) return
    setBusy(true)
    try {
      await superadminService.enableMfa(code)
      setSetup(null)
      setCode('')
      setStatus({ enabled: true })
      toast.success('Two-factor authentication enabled')
    } catch (e) {
      toast.error(mfaErr(e, 'Invalid code'))
    } finally {
      setBusy(false)
    }
  }

  const confirmDisable = async () => {
    if (code.length < 6) return
    setBusy(true)
    try {
      await superadminService.disableMfa(code)
      setStatus({ enabled: false })
      setDisarming(false)
      setCode('')
      toast.success('Two-factor authentication disabled')
    } catch (e) {
      toast.error(mfaErr(e, 'Invalid code'))
    } finally {
      setBusy(false)
    }
  }

  const codeInput = (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={code}
      disabled={busy}
      onChange={(e) => onCode(e.target.value)}
      placeholder="123456"
      className="w-36 rounded-md border border-gray-300 px-3 py-2 text-center text-lg font-bold tracking-[0.3em] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
    />
  )

  return (
    <div className="bg-white p-4 py-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-sm font-medium leading-6 text-gray-900">Your authenticator app (2FA)</h3>
        {enabled ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Enabled</span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Not enabled</span>
        )}
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Protect your own platform account with a time-based code from Google Authenticator, Authy, etc.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          {!enabled && !setup && (
            <button
              type="button"
              onClick={startSetup}
              disabled={busy}
              className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] disabled:opacity-50"
            >
              {busy ? 'Please wait…' : 'Set up two-factor authentication'}
            </button>
          )}

          {!enabled && setup && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-gray-600">
                <li>Scan this QR code with your authenticator app.</li>
                <li>Enter the 6-digit code to confirm.</li>
              </ol>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img src={setup.qrDataUrl} alt="2FA QR code" className="h-40 w-40 rounded-lg border border-gray-200 bg-white p-2" />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Manual key</p>
                    <code className="mt-1 block break-all rounded bg-white px-2 py-1 font-mono text-xs text-gray-700 ring-1 ring-gray-200">
                      {setup.secret}
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {codeInput}
                    <button
                      type="button"
                      onClick={confirmEnable}
                      disabled={busy || code.length < 6}
                      className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] disabled:opacity-50"
                    >
                      Verify &amp; enable
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSetup(null); setCode('') }}
                      disabled={busy}
                      className="rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {enabled && (
            disarming ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Enter a current code to turn it off:</span>
                {codeInput}
                <button
                  type="button"
                  onClick={confirmDisable}
                  disabled={busy || code.length < 6}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                >
                  Disable
                </button>
                <button
                  type="button"
                  onClick={() => { setDisarming(false); setCode('') }}
                  disabled={busy}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDisarming(true)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Disable two-factor authentication
              </button>
            )
          )}
        </>
      )}
    </div>
  )
}

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
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-32 rounded-xl bg-gray-100"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="space-y-4">

        {/* Account Policies section hidden
        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <form
            onSubmit={handleSave}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            <div className="border-b border-gray-900/10 px-4 py-5 sm:px-8">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Account Policies</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Configure security and user onboarding access across the platform.
              </p>
            </div>
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
                className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        */}

        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">My Security</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Manage two-factor authentication for your own platform account.
            </p>
          </div>
          <MfaSection />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">My Password</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Change the password for your own platform account.
            </p>
          </div>
          <div className="">
            <ChangePasswordCard />
          </div>
        </div>

      </div>
    </div>
  )
}
