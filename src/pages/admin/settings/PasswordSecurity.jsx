import { useEffect } from 'react'
import { usePasswordSecurity } from '../../../hooks/settings/usePasswordSecurity'
import MfaCard from './MfaCard'

const RECOVERY_OPTIONS = ['Email recovery', 'Admin reset', 'Both']

/* ── Style tokens ─────────────────────────────────────────────────────── */
const inputCls =
  'h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'
const selectCls =
  'h-10 cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'

/* ── Primitives ───────────────────────────────────────────────────────── */
function Card({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs font-medium text-white/70">{description}</p>}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/30 disabled:opacity-50 ${
        checked ? 'bg-[#0F766E]' : 'bg-gray-200'
      }`}
      aria-pressed={checked}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function PasswordSecurity({ registerToolbar }) {
  const { settings, setSettings, loading, saving, isDirty, save, discard, error } =
    usePasswordSecurity()

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty: isDirty, saving, onSave: save, onDiscard: discard, disableSave: saving || !isDirty })
    return () => registerToolbar(null)
  }, [registerToolbar, isDirty, saving, save, discard])

  const patchPolicy = (partial) =>
    setSettings((p) => p ? { ...p, passwordPolicy: { ...p.passwordPolicy, ...partial } } : p)

  const patchAccount = (partial) =>
    setSettings((p) => p ? { ...p, accountSecurity: { ...p.accountSecurity, ...partial } } : p)

  if (loading && !settings) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading password &amp; security settings…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load password security settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">

      {/* ── Password Policy ───────────────────────────────────────────── */}
      <Card title="Password Policy" description="Enforce strong passwords across the organisation">
        <Field label="Minimum Length">
          <input type="number" min={6} max={32}
            value={settings.passwordPolicy.minimumLength}
            onChange={(e) => patchPolicy({ minimumLength: parseInt(e.target.value, 10) || 6 })}
            className={`${inputCls} w-24`} />
        </Field>
        <Field label="Require Special Characters">
          <Toggle
            checked={settings.passwordPolicy.mustIncludeSpecialChars}
            onChange={(v) => patchPolicy({ mustIncludeSpecialChars: v })}
          />
        </Field>
        <Field label="Password Expiry" hint="0 = no expiry">
          <input type="number" min={1} max={365}
            value={settings.passwordPolicy.passwordExpiryDays}
            onChange={(e) => patchPolicy({ passwordExpiryDays: parseInt(e.target.value, 10) || 1 })}
            className={`${inputCls} w-24`} />
          <span className="text-sm font-medium text-slate-400">days</span>
        </Field>
        <Field
          label="Recommend Two-Factor Authentication"
          hint="Organisation-wide policy to encourage 2FA. Each user enrolls their own authenticator below."
        >
          <Toggle
            checked={settings.passwordPolicy.twoFactorAuth}
            onChange={(v) => patchPolicy({ twoFactorAuth: v })}
          />
        </Field>
      </Card>

      {/* MfaCard is a self-contained component — not restyled here */}
      <MfaCard />

      {/* ── Account Security ──────────────────────────────────────────── */}
      <Card title="Account Security" description="Session controls and lockout configuration">
        <Field label="Session Timeout">
          <input type="number" min={5} max={480}
            value={settings.accountSecurity.autoLogoutMinutes}
            onChange={(e) => patchAccount({ autoLogoutMinutes: parseInt(e.target.value, 10) || 5 })}
            className={`${inputCls} w-24`} />
          <span className="text-sm font-medium text-slate-400">minutes</span>
        </Field>
        <Field label="Max Login Attempts">
          <input type="number" min={1} max={20}
            value={settings.accountSecurity.maxLoginAttemptLimit}
            onChange={(e) => patchAccount({ maxLoginAttemptLimit: parseInt(e.target.value, 10) || 1 })}
            className={`${inputCls} w-24`} />
        </Field>
        <Field label="Account Recovery" hint="How blocked accounts can be restored">
          <select
            className={`${selectCls} w-44`}
            value={settings.accountSecurity.blockedAccountRecovery}
            onChange={(e) => patchAccount({ blockedAccountRecovery: e.target.value })}
          >
            {RECOVERY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </Card>

    </div>
  )
}
