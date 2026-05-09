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
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading password & security settings…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-red-700">
        {error || 'Could not load password security settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <SectionCard title="A. Password Policy">
        <FieldRow label="Minimum Length">
          <TextInput
            type="number"
            min={6}
            max={32}
            value={settings.passwordPolicy.minimumLength}
            onChange={(e) =>
              patchPolicy({ minimumLength: parseInt(e.target.value, 10) || 6 })
            }
            className="max-w-[200px]"
          />
        </FieldRow>
        <FieldRow label="Must Include Special Characters">
          <Toggle
            checked={settings.passwordPolicy.mustIncludeSpecialChars}
            onChange={(v) => patchPolicy({ mustIncludeSpecialChars: v })}
          />
        </FieldRow>
        <FieldRow label="Password Expiry (days)">
          <TextInput
            type="number"
            min={1}
            max={365}
            value={settings.passwordPolicy.passwordExpiryDays}
            onChange={(e) =>
              patchPolicy({ passwordExpiryDays: parseInt(e.target.value, 10) || 1 })
            }
            className="max-w-[200px]"
          />
        </FieldRow>
        <FieldRow label="Two-Factor Authentication (2FA)">
          <Toggle
            checked={settings.passwordPolicy.twoFactorAuth}
            onChange={(v) => patchPolicy({ twoFactorAuth: v })}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="B. Account Security">
        <FieldRow label="Auto-Logout After Inactivity (minutes)">
          <TextInput
            type="number"
            min={5}
            max={480}
            value={settings.accountSecurity.autoLogoutMinutes}
            onChange={(e) =>
              patchAccount({ autoLogoutMinutes: parseInt(e.target.value, 10) || 5 })
            }
            className="max-w-[200px]"
          />
        </FieldRow>
        <FieldRow label="Max Login Attempt Limit">
          <TextInput
            type="number"
            min={1}
            max={20}
            value={settings.accountSecurity.maxLoginAttemptLimit}
            onChange={(e) =>
              patchAccount({ maxLoginAttemptLimit: parseInt(e.target.value, 10) || 1 })
            }
            className="max-w-[200px]"
          />
        </FieldRow>
        <FieldRow
          label="Blocked Account Recovery"
          hint="Email recovery or admin reset"
        >
          <SelectInput
            options={RECOVERY_OPTIONS}
            value={settings.accountSecurity.blockedAccountRecovery}
            onChange={(e) => patchAccount({ blockedAccountRecovery: e.target.value })}
          />
        </FieldRow>
      </SectionCard>

      {isDirty ? (
        <div className="fixed bottom-0 left-60 right-0 z-10 border-t border-gray-200 bg-white px-8 py-3 shadow-[0_-4px_12px_-2px_rgb(0_0_0/0.06)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-emerald-700">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              AUTH POLICY LOCKED
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => discard()}
                className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save()}
                className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
