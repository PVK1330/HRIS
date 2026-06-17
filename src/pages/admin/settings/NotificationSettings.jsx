import { useEffect } from 'react'
import { NOTIFICATION_EVENTS } from './notificationConstants'
import { useNotificationSettings } from '../../../hooks/settings/useNotificationSettings'

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

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/30 ${
        checked ? 'bg-[#0F766E]' : 'bg-gray-200'
      }`}
      aria-pressed={checked}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
  )
}

/* ── Matrix card (event × channel table) ─────────────────────────────── */
function MatrixCard({ title, description, columns, children }) {
  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs font-medium text-white/70">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`px-5 py-3 text-xs font-semibold text-slate-500 ${i === 0 ? 'text-left' : 'text-center'}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
        </table>
      </div>
    </div>
  )
}

function MatrixRow({ label, cells }) {
  return (
    <tr className="hover:bg-slate-50/50">
      <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{label}</td>
      {cells.map((cell, i) => (
        <td key={i} className="px-5 py-3.5 text-center">
          <div className="flex items-center justify-center">{cell}</div>
        </td>
      ))}
    </tr>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function NotificationSettings({ registerToolbar }) {
  const { settings, loading, saving, isDirty, error, updateChannel, updateEvent, save, discard } =
    useNotificationSettings()

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty: isDirty, saving, onSave: save, onDiscard: discard, disableSave: saving || !isDirty })
    return () => registerToolbar(null)
  }, [registerToolbar, isDirty, saving, save, discard])

  if (loading && !settings) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading notification settings…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load notification settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">

      {/* ── Delivery Channels ─────────────────────────────────────────── */}
      <Card title="Delivery Channels" description="Global on/off for each notification channel">
        <Field label="Email Notifications">
          <Toggle
            checked={settings.channels.emailNotifications}
            onChange={(v) => updateChannel('emailNotifications', v)}
          />
        </Field>
        <Field label="SMS Notifications" hint="Carrier fees may apply">
          <Toggle
            checked={settings.channels.smsNotifications}
            onChange={(v) => updateChannel('smsNotifications', v)}
          />
        </Field>
        <Field label="In-App Alerts">
          <Toggle
            checked={settings.channels.inAppAlerts}
            onChange={(v) => updateChannel('inAppAlerts', v)}
          />
        </Field>
      </Card>

      {/* ── Event Assignments ─────────────────────────────────────────── */}
      <MatrixCard
        title="Event Assignments"
        description="Choose which channels fire for each system event."
        columns={['Event', 'Email', 'SMS', 'In-App']}
      >
        {NOTIFICATION_EVENTS.map(({ key, label }) => {
          const row = settings.eventNotifications[key]
          return (
            <MatrixRow
              key={key}
              label={label}
              cells={[
                <Toggle key="email"  checked={!!row?.email}  onChange={(v) => updateEvent(key, 'email',  v)} />,
                <Toggle key="sms"    checked={!!row?.sms}    onChange={(v) => updateEvent(key, 'sms',    v)} />,
                <Toggle key="in_app" checked={!!row?.in_app} onChange={(v) => updateEvent(key, 'in_app', v)} />,
              ]}
            />
          )
        })}
      </MatrixCard>

    </div>
  )
}
