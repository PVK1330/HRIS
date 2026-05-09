import { FieldRow, SectionCard, Toggle } from './components/ui'
import { NOTIFICATION_EVENTS } from './notificationConstants'
import { useNotificationSettings } from '../../../hooks/settings/useNotificationSettings'

export default function NotificationSettings() {
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

  if (loading && !settings) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading notification settings…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-red-700">
        {error || 'Could not load notification settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <SectionCard title="A. Notification Channels">
        <FieldRow label="Email Notifications">
          <Toggle
            checked={settings.channels.emailNotifications}
            onChange={(v) => updateChannel('emailNotifications', v)}
          />
        </FieldRow>
        <FieldRow
          label="SMS Notifications"
          hint="Optional – carrier charges may apply"
        >
          <Toggle
            checked={settings.channels.smsNotifications}
            onChange={(v) => updateChannel('smsNotifications', v)}
          />
        </FieldRow>
        <FieldRow label="In-app Alerts">
          <Toggle
            checked={settings.channels.inAppAlerts}
            onChange={(v) => updateChannel('inAppAlerts', v)}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="B. Event-Based Notifications">
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-x-4 border-b border-gray-50 pb-2">
          <p className="text-xs uppercase tracking-wide text-gray-400">Event</p>
          <p className="text-center text-xs uppercase tracking-wide text-gray-400">Email</p>
          <p className="text-center text-xs uppercase tracking-wide text-gray-400">SMS</p>
          <p className="text-center text-xs uppercase tracking-wide text-gray-400">In-app</p>
        </div>
        {NOTIFICATION_EVENTS.map(({ key, label }, idx) => {
          const row = settings.eventNotifications[key]
          const email = !!row?.email
          const sms = !!row?.sms
          const inApp = !!row?.in_app

          return (
            <div
              key={key}
              className={`grid grid-cols-[1fr_120px_120px_120px] gap-x-4 items-center border-b border-gray-50 py-3 last:border-0 ${
                idx % 2 === 1 ? '-mx-3 rounded-lg bg-gray-50/40 px-3' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <div className="flex justify-center">
                <Toggle
                  checked={email}
                  onChange={(v) => updateEvent(key, 'email', v)}
                />
              </div>
              <div className="flex justify-center">
                <Toggle checked={sms} onChange={(v) => updateEvent(key, 'sms', v)} />
              </div>
              <div className="flex justify-center">
                <Toggle
                  checked={inApp}
                  onChange={(v) => updateEvent(key, 'in_app', v)}
                />
              </div>
            </div>
          )
        })}
      </SectionCard>

      {isDirty ? (
        <div className="fixed bottom-0 left-60 right-0 z-10 border-t border-gray-200 bg-white px-8 py-3 shadow-[0_-4px_12px_-2px_rgb(0_0_0/0.06)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-emerald-700">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              NOTIFICATION GRID SYNCED
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
