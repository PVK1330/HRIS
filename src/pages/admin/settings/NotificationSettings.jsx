import { useEffect } from 'react'
import {
  FieldRow,
  SectionCard,
  SettingsError,
  SettingsLoading,
  SettingsMatrixRow,
  SettingsSection,
  Toggle,
} from './components/ui'
import { NOTIFICATION_EVENTS } from './notificationConstants'
import { useNotificationSettings } from '../../../hooks/settings/useNotificationSettings'

export default function NotificationSettings({ registerToolbar }) {
  const {
    settings,
    loading,
    saving,
    isDirty,
    error,
    updateChannel,
    updateEvent,
    save,
    discard,
  } = useNotificationSettings()

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

  if (loading && !settings) {
    return <SettingsLoading message="Loading notification settings…" />
  }

  if (!settings) {
    return <SettingsError message={error || 'Could not load notification settings.'} />
  }

  return (
    <SettingsSection>
      <SectionCard title="Delivery channels">
        <FieldRow label="Email notifications">
          <Toggle
            checked={settings.channels.emailNotifications}
            onChange={(v) => updateChannel('emailNotifications', v)}
          />
        </FieldRow>
        <FieldRow label="SMS notifications" hint="Carrier fees may apply">
          <Toggle
            checked={settings.channels.smsNotifications}
            onChange={(v) => updateChannel('smsNotifications', v)}
          />
        </FieldRow>
        <FieldRow label="In-app alerts">
          <Toggle
            checked={settings.channels.inAppAlerts}
            onChange={(v) => updateChannel('inAppAlerts', v)}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        title="Event assignments"
        description="Choose which channels fire for each system event."
        columns={['Event', 'Email', 'SMS', 'In-app']}
      >
        {NOTIFICATION_EVENTS.map(({ key, label }) => {
          const row = settings.eventNotifications[key]
          return (
            <SettingsMatrixRow
              key={key}
              label={label}
              cells={[
                <Toggle
                  key="email"
                  checked={!!row?.email}
                  onChange={(v) => updateEvent(key, 'email', v)}
                />,
                <Toggle
                  key="sms"
                  checked={!!row?.sms}
                  onChange={(v) => updateEvent(key, 'sms', v)}
                />,
                <Toggle
                  key="in_app"
                  checked={!!row?.in_app}
                  onChange={(v) => updateEvent(key, 'in_app', v)}
                />,
              ]}
            />
          )
        })}
      </SectionCard>
    </SettingsSection>
  )
}
