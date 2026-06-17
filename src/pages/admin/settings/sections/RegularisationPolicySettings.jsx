import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import { ApprovalChain } from './ApprovalChain.jsx'

const WHO_CAN = ['All employees', 'Manager + above', 'HR only']
const APPROVAL_FLOW = 'Reporting Manager → Dept Head → HR'

function buildDraft(data) {
  if (!data) return null
  const r = data.regularizationSettings || {}
  return {
    whoCanSubmitRequest:         r.whoCanSubmitRequest ?? 'All employees',
    approver:                    r.approver ?? APPROVAL_FLOW,
    autoRejectionAfterDays:      r.autoRejectionAfterDays ?? 3,
    allowSelf:                   r.allowSelf !== false,
    maxPerMonth:                 r.maxPerMonth ?? 3,
    autoApproveEnabled:          Boolean(r.autoApproveEnabled),
    autoApproveAfterDays:        r.autoApproveAfterDays ?? 3,
    allowBackDateRegularisation: r.allowBackDateRegularisation !== false,
    maxBackDateDays:             r.maxBackDateDays ?? 7,
    requireReason:               r.requireReason !== false,
    requireAttachment:           Boolean(r.requireAttachment),
    notifyManager:               r.notifyManager !== false,
    autoPublishToPortal:         r.autoPublishToPortal !== false,
    allowedAfterDays:            r.allowedAfterDays ?? 0,
  }
}

/* ── Style tokens ─────────────────────────────────────────────────────── */
const inputCls =
  'h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]'
const selectCls =
  'h-10 cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]'

/* ── Card ─────────────────────────────────────────────────────────────── */
function Card({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs font-medium text-white/70">{description}</p>
        )}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )
}

/* ── Field row ────────────────────────────────────────────────────────── */
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

/* ── Toggle ───────────────────────────────────────────────────────────── */
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
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

/* ── Unit label ───────────────────────────────────────────────────────── */
function Unit({ children }) {
  return <span className="text-sm font-medium text-slate-400">{children}</span>
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function RegularisationPolicySettings({ registerToolbar }) {
  const { settings, loading, saving, error, save } = useAttendanceSettings()
  const [draft, setDraft]       = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [banner, setBanner]     = useState(null)
  const didInit = useRef(false)

  useEffect(() => {
    if (!settings || didInit.current) return
    didInit.current = true
    const d = buildDraft(settings)
    setDraft(d)
    setBaseline(JSON.stringify(d))
  }, [settings])

  const dirty = useMemo(() => {
    if (!draft || baseline === null) return false
    return JSON.stringify(draft) !== baseline
  }, [draft, baseline])

  const reset = useCallback(() => {
    if (!settings) return
    didInit.current = true
    const d = buildDraft(settings)
    setDraft(d)
    setBaseline(JSON.stringify(d))
    setBanner(null)
  }, [settings])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setBanner(null)
    try {
      const res = await save({ regularizationSettings: draft })
      if (res?.data) {
        const d = buildDraft(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Regularisation policy saved.' })
    } catch { /* hook sets error */ }
  }, [draft, save])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty, saving, onSave: handleSave, onDiscard: reset, disableSave: loading || !draft || saving || !dirty })
    return () => registerToolbar(null)
  }, [registerToolbar, dirty, saving, handleSave, reset, loading, draft])

  const set = (partial) => setDraft((p) => p ? { ...p, ...partial } : p)

  if (loading && !draft) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading regularisation settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load regularisation settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">

      {/* Banner */}
      {(banner?.type === 'ok' || error) && (
        <div className={`rounded-none px-4 py-3 text-sm font-medium ${
          banner?.type === 'ok'
            ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
            : 'border border-red-100 bg-red-50 text-red-700'
        }`}>
          {banner?.type === 'ok' ? banner.text : error}
        </div>
      )}

      {/* ── Submission Rules ──────────────────────────────────────────── */}
      <Card title="Submission Rules" description="Who can raise regularisation requests and when">
        <Field label="Who Can Submit">
          <select
            className={`${selectCls} w-52`}
            value={draft.whoCanSubmitRequest}
            onChange={(e) => set({ whoCanSubmitRequest: e.target.value })}
          >
            {WHO_CAN.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Allow Self Regularisation">
          <Toggle checked={draft.allowSelf} onChange={(v) => set({ allowSelf: v })} />
        </Field>
        <Field label="Max Regularisations per Month">
          <input
            type="number" min={1} max={31}
            value={draft.maxPerMonth}
            onChange={(e) => set({ maxPerMonth: parseInt(e.target.value, 10) || 1 })}
            className={`${inputCls} w-24`}
          />
          <Unit>/ month</Unit>
        </Field>
        <Field label="Regularisation Allowed After" hint="Days after the attendance date before request can be raised. 0 = anytime">
          <input
            type="number" min={0} max={60}
            value={draft.allowedAfterDays}
            onChange={(e) => set({ allowedAfterDays: parseInt(e.target.value, 10) || 0 })}
            className={`${inputCls} w-24`}
          />
          <Unit>days</Unit>
        </Field>
        <Field label="Allow Back-Date Regularisation">
          <Toggle checked={draft.allowBackDateRegularisation} onChange={(v) => set({ allowBackDateRegularisation: v })} />
        </Field>
        {draft.allowBackDateRegularisation && (
          <Field label="Max Back-Date Days">
            <input
              type="number" min={1} max={60}
              value={draft.maxBackDateDays}
              onChange={(e) => set({ maxBackDateDays: parseInt(e.target.value, 10) || 1 })}
              className={`${inputCls} w-24`}
            />
            <Unit>days</Unit>
          </Field>
        )}
        <Field label="Require Reason">
          <Toggle checked={draft.requireReason} onChange={(v) => set({ requireReason: v })} />
        </Field>
        <Field label="Require Attachment">
          <Toggle checked={draft.requireAttachment} onChange={(v) => set({ requireAttachment: v })} />
        </Field>
      </Card>

      {/* ── Approval Workflow ─────────────────────────────────────────── */}
      <Card title="Approval Workflow" description="Routing and auto-handling of requests">
        <Field label="Approval Levels" hint="Fixed multi-stage chain applied to all regularisation requests.">
          <ApprovalChain value={draft.approver} onChange={(v) => set({ approver: v })} />
        </Field>
        <Field label="Auto Approve After" hint="0 = disabled">
          <input
            type="number" min={0} max={30}
            value={draft.autoApproveAfterDays}
            onChange={(e) => set({ autoApproveAfterDays: parseInt(e.target.value, 10) || 0 })}
            className={`${inputCls} w-24`}
          />
          <Unit>days</Unit>
        </Field>
        <Field label="Auto Approve Enabled">
          <Toggle checked={draft.autoApproveEnabled} onChange={(v) => set({ autoApproveEnabled: v })} />
        </Field>
        <Field label="Auto Reject After">
          <input
            type="number" min={1} max={30}
            value={draft.autoRejectionAfterDays}
            onChange={(e) => set({ autoRejectionAfterDays: parseInt(e.target.value, 10) || 1 })}
            className={`${inputCls} w-24`}
          />
          <Unit>days</Unit>
        </Field>
      </Card>

      {/* ── Notifications ─────────────────────────────────────────────── */}
      <Card title="Notifications" description="Keep stakeholders informed at each stage">
        <Field label="Notify Manager on Submission">
          <Toggle checked={draft.notifyManager} onChange={(v) => set({ notifyManager: v })} />
        </Field>
        <Field label="Auto-Publish to Employee Portal">
          <Toggle checked={draft.autoPublishToPortal} onChange={(v) => set({ autoPublishToPortal: v })} />
        </Field>
      </Card>

    </div>
  )
}
