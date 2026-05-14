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
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm font-bold uppercase tracking-widest">
        Polling Notification Subsystem…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm font-medium">
        {error || 'Could not load notification settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div>
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Communications Registry</h2>
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alert Channels & Event Protocols</p>
      </div>

      <SectionCard title="A. Core Transmission Channels">
        <div className="divide-y divide-slate-50">
          <FieldRow label="SMTP Dispatch (Email)">
            <div className="flex h-10 items-center">
              <Toggle
                checked={settings.channels.emailNotifications}
                onChange={(v) => updateChannel('emailNotifications', v)}
              />
            </div>
          </FieldRow>
          <FieldRow
            label="Cellular Gateway (SMS)"
            hint="Carrier infrastructure dependencies may apply"
          >
            <div className="flex h-10 items-center">
              <Toggle
                checked={settings.channels.smsNotifications}
                onChange={(v) => updateChannel('smsNotifications', v)}
              />
            </div>
          </FieldRow>
          <FieldRow label="Embedded System Alerts (In-App)">
            <div className="flex h-10 items-center">
              <Toggle
                checked={settings.channels.inAppAlerts}
                onChange={(v) => updateChannel('inAppAlerts', v)}
              />
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="B. Protocol Event Assignments">
        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-x-4 border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trigger Event</p>
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP</p>
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">SMS</p>
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">SYS</p>
        </div>
        <div className="divide-y divide-slate-50">
          {NOTIFICATION_EVENTS.map(({ key, label }, idx) => {
            const row = settings.eventNotifications[key]
            const email = !!row?.email
            const sms = !!row?.sms
            const inApp = !!row?.in_app

            return (
              <div
                key={key}
                className="grid grid-cols-[1fr_80px_80px_80px] gap-x-4 items-center px-5 py-3 hover:bg-slate-50/30 transition-colors"
              >
                <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{label}</p>
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
        </div>
      </SectionCard>

      {isDirty ? (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 border-t border-slate-200 bg-white px-8 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-full duration-500">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-none bg-[#0F766E] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Transmission Protocols Modified
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
                {saving ? 'Synchronizing…' : 'Update Protocols'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

