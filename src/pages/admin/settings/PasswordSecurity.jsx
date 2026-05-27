import { useEffect } from 'react'
import {
  FieldRow,
  SectionCard,
  SelectInput,
  SettingsError,
  SettingsLoading,
  SettingsPageHeader,
  TextInput,
  Toggle,
} from './components/ui'
import { usePasswordSecurity } from '../../../hooks/settings/usePasswordSecurity'

const RECOVERY_OPTIONS = ['Email recovery', 'Admin reset', 'Both']

export default function PasswordSecurity({ registerToolbar }) {
  const { settings, setSettings, loading, saving, isDirty, save, discard, error } =
    usePasswordSecurity()

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty: isDirty,
      saving,
      onSave: save,
      onDiscard: discard,
      disableSave: saving || !isDirty,
    })
    return () => registerToolbar(null)
  }, [registerToolbar, isDirty, saving, save, discard])

  const patchPolicy = (partial) =>
    setSettings((p) =>
      p ? { ...p, passwordPolicy: { ...p.passwordPolicy, ...partial } } : p,
    )

  const patchAccount = (partial) =>
    setSettings((p) =>
      p ? { ...p, accountSecurity: { ...p.accountSecurity, ...partial } } : p,
    )

  if (loading && !settings) {
    return <SettingsLoading message="Loading password & security settings…" />
  }

  if (!settings) {
    return <SettingsError message={error || 'Could not load password security settings.'} />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SettingsPageHeader
        title="Password & Security"
        subtitle="Password rules, session timeouts, and account recovery options."
      />

      <SectionCard title="Password policy">
        <FieldRow label="Minimum length">
          <TextInput
            type="number"
            min={6}
            max={32}
            value={settings.passwordPolicy.minimumLength}
            onChange={(e) =>
              patchPolicy({ minimumLength: parseInt(e.target.value, 10) || 6 })
            }
            className="max-w-[120px]"
          />
        </FieldRow>
        <FieldRow label="Require special characters">
          <Toggle
            checked={settings.passwordPolicy.mustIncludeSpecialChars}
            onChange={(v) => patchPolicy({ mustIncludeSpecialChars: v })}
          />
        </FieldRow>
        <FieldRow label="Password expiry (days)">
          <TextInput
            type="number"
            min={1}
            max={365}
            value={settings.passwordPolicy.passwordExpiryDays}
            onChange={(e) =>
              patchPolicy({ passwordExpiryDays: parseInt(e.target.value, 10) || 1 })
            }
            className="max-w-[120px]"
          />
        </FieldRow>
        <FieldRow label="Two-factor authentication">
          <Toggle
            checked={settings.passwordPolicy.twoFactorAuth}
            onChange={(v) => patchPolicy({ twoFactorAuth: v })}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Account security">
        <FieldRow label="Session timeout (minutes)">
          <TextInput
            type="number"
            min={5}
            max={480}
            value={settings.accountSecurity.autoLogoutMinutes}
            onChange={(e) =>
              patchAccount({ autoLogoutMinutes: parseInt(e.target.value, 10) || 5 })
            }
            className="max-w-[120px]"
          />
        </FieldRow>
        <FieldRow label="Max login attempts">
          <TextInput
            type="number"
            min={1}
            max={20}
            value={settings.accountSecurity.maxLoginAttemptLimit}
            onChange={(e) =>
              patchAccount({ maxLoginAttemptLimit: parseInt(e.target.value, 10) || 1 })
            }
            className="max-w-[120px]"
          />
        </FieldRow>
        <FieldRow label="Account recovery" hint="How blocked accounts can be restored">
          <SelectInput
            options={RECOVERY_OPTIONS}
            value={settings.accountSecurity.blockedAccountRecovery}
            onChange={(e) => patchAccount({ blockedAccountRecovery: e.target.value })}
          />
        </FieldRow>
      </SectionCard>
    </div>
  )
}
