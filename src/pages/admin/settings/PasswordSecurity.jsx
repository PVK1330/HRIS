import { FieldRow, SectionCard, SelectInput, TextInput, Toggle } from './components/ui'
import { usePasswordSecurity } from '../../../hooks/settings/usePasswordSecurity'

const RECOVERY_OPTIONS = ['Email recovery', 'Admin reset', 'Both']

export default function PasswordSecurity() {
  const { settings, setSettings, loading, saving, isDirty, save, discard, error } =
    usePasswordSecurity()

  const patchPolicy = (partial) =>
    setSettings((p) =>
      p ? { ...p, passwordPolicy: { ...p.passwordPolicy, ...partial } } : p,
    )

  const patchAccount = (partial) =>
    setSettings((p) =>
      p ? { ...p, accountSecurity: { ...p.accountSecurity, ...partial } } : p,
    )

  if (loading && !settings) {
    return (
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm font-bold uppercase tracking-widest">
        Polling Authentication Subsystem…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm font-medium">
        {error || 'Could not load password security settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div>
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity & Access Governance</h2>
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authentication Protocols & Account Security</p>
      </div>

      <SectionCard title="A. Password Complexity Protocols">
        <div className="divide-y divide-slate-50">
          <FieldRow label="Minimum Character Requirement">
            <TextInput
              type="number"
              min={6}
              max={32}
              value={settings.passwordPolicy.minimumLength}
              onChange={(e) =>
                patchPolicy({ minimumLength: parseInt(e.target.value, 10) || 6 })
              }
              className="max-w-[120px] font-bold"
            />
          </FieldRow>
          <FieldRow label="Mandatory Special Characters">
            <div className="flex h-10 items-center">
              <Toggle
                checked={settings.passwordPolicy.mustIncludeSpecialChars}
                onChange={(v) => patchPolicy({ mustIncludeSpecialChars: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Credential Lifespan (Days)">
            <TextInput
              type="number"
              min={1}
              max={365}
              value={settings.passwordPolicy.passwordExpiryDays}
              onChange={(e) =>
                patchPolicy({ passwordExpiryDays: parseInt(e.target.value, 10) || 1 })
              }
              className="max-w-[120px] font-bold"
            />
          </FieldRow>
          <FieldRow label="Multi-Factor Authentication (MFA)">
            <div className="flex h-10 items-center">
              <Toggle
                checked={settings.passwordPolicy.twoFactorAuth}
                onChange={(v) => patchPolicy({ twoFactorAuth: v })}
              />
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="B. Adaptive Account Security">
        <div className="divide-y divide-slate-50">
          <FieldRow label="Session Inactivity Timeout (Minutes)">
            <TextInput
              type="number"
              min={5}
              max={480}
              value={settings.accountSecurity.autoLogoutMinutes}
              onChange={(e) =>
                patchAccount({ autoLogoutMinutes: parseInt(e.target.value, 10) || 5 })
              }
              className="max-w-[120px] font-bold"
            />
          </FieldRow>
          <FieldRow label="Max Authentication Failures">
            <TextInput
              type="number"
              min={1}
              max={20}
              value={settings.accountSecurity.maxLoginAttemptLimit}
              onChange={(e) =>
                patchAccount({ maxLoginAttemptLimit: parseInt(e.target.value, 10) || 1 })
              }
              className="max-w-[120px] font-bold"
            />
          </FieldRow>
          <FieldRow
            label="Recovery Mechanism"
            hint="Governance for account restoration"
          >
            <SelectInput
              options={RECOVERY_OPTIONS}
              value={settings.accountSecurity.blockedAccountRecovery}
              onChange={(e) => patchAccount({ blockedAccountRecovery: e.target.value })}
            />
          </FieldRow>
        </div>
      </SectionCard>

      {isDirty ? (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 border-t border-slate-200 bg-white px-8 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-full duration-500">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-none bg-[#0F766E] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Security Policy Overrides Pending
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => discard()}
                className="h-10 rounded-none border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                Discard Changes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save()}
                className="h-10 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] disabled:opacity-40 shadow-lg"
              >
                {saving ? 'Synchronizing…' : 'Apply Security Policy'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

