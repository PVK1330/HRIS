import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import { ApprovalChain } from './ApprovalChain.jsx'

const OT_CALC_OPTIONS = ['Daily', 'Weekly', 'Monthly']
const OT_RATE_OPTIONS = [
  { label: '1.0x (No premium)', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x (Standard)', value: 1.5 },
  { label: '2.0x (Double)', value: 2.0 },
]

const APPROVAL_FLOW = 'Reporting Manager → Dept Head → HR'

function buildDraft(data) {
  if (!data) return null
  const ot = data.overtimeSettings || {}
  return {
    overtimeEligibility:      ot.overtimeEligibility !== false,
    calculationRule:          ot.calculationRule ?? 'Daily',
    approvalWorkflow:         ot.approvalWorkflow ?? APPROVAL_FLOW,
    minimumThresholdMinutes:  ot.minimumThresholdMinutes ?? 30,
    maxPerMonthHours:         ot.maxPerMonthHours ?? 0,
    dailyOtLimitHours:        ot.dailyOtLimitHours ?? 4,
    weeklyOtLimitHours:       ot.weeklyOtLimitHours ?? 12,
    payMultiplier:            ot.payMultiplier ?? 1.5,
    requireReason:            ot.requireReason !== false,
    carryForwardOt:           Boolean(ot.carryForwardOt),
    holidayOtApplicable:      ot.holidayOtApplicable !== false,
    notifyManagerOnOtRequest: ot.notifyManagerOnOtRequest !== false,
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
export default function OvertimeSettings({ registerToolbar }) {
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
      const res = await save({ overtimeSettings: draft })
      if (res?.data) {
        const d = buildDraft(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Overtime settings saved.' })
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
        Loading overtime settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load overtime settings.'}
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

      {/* ── Eligibility ───────────────────────────────────────────────── */}
      <Card title="OT Eligibility" description="Enable and scope overtime for your workforce">
        <Field label="Overtime Enabled">
          <Toggle checked={draft.overtimeEligibility} onChange={(v) => set({ overtimeEligibility: v })} />
        </Field>
        <Field label="Holiday OT Applicable">
          <Toggle checked={draft.holidayOtApplicable} onChange={(v) => set({ holidayOtApplicable: v })} />
        </Field>
      </Card>

      {/* ── Calculation Rules ─────────────────────────────────────────── */}
      <Card title="Calculation Rules" description="Define how OT hours are computed">
        <Field label="OT Calculation Period">
          <select
            className={`${selectCls} w-44`}
            value={draft.calculationRule}
            onChange={(e) => set({ calculationRule: e.target.value })}
          >
            {OT_CALC_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="OT Starts After" hint="Minutes worked beyond shift end before OT is counted">
          <input
            type="number" min={0} max={120}
            value={draft.minimumThresholdMinutes}
            onChange={(e) => set({ minimumThresholdMinutes: parseInt(e.target.value, 10) || 0 })}
            className={`${inputCls} w-24`}
          />
          <Unit>mins</Unit>
        </Field>
        <Field label="Daily OT Limit" hint="0 = no limit">
          <input
            type="number" min={0} max={12} step={0.5}
            value={draft.dailyOtLimitHours}
            onChange={(e) => set({ dailyOtLimitHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <Unit>hours</Unit>
        </Field>
        <Field label="Weekly OT Limit" hint="0 = no limit">
          <input
            type="number" min={0} max={60} step={0.5}
            value={draft.weeklyOtLimitHours}
            onChange={(e) => set({ weeklyOtLimitHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <Unit>hours</Unit>
        </Field>
        <Field label="Max OT per Month" hint="0 = no cap">
          <input
            type="number" min={0} max={100} step={0.5}
            value={draft.maxPerMonthHours}
            onChange={(e) => set({ maxPerMonthHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <Unit>hours</Unit>
        </Field>
        <Field label="OT Pay Rate">
          <select
            className={`${selectCls} w-44`}
            value={String(draft.payMultiplier)}
            onChange={(e) => set({ payMultiplier: parseFloat(e.target.value) })}
          >
            {OT_RATE_OPTIONS.map((o) => (
              <option key={o.value} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Carry Forward OT">
          <Toggle checked={draft.carryForwardOt} onChange={(v) => set({ carryForwardOt: v })} />
        </Field>
      </Card>

      {/* ── Approval Workflow ─────────────────────────────────────────── */}
      <Card title="Approval Workflow" description="OT request routing and notifications">
        <Field label="Approval Levels" hint="Fixed multi-stage chain applied to all OT requests.">
          <ApprovalChain value={draft.approvalWorkflow} onChange={(v) => set({ approvalWorkflow: v })} />
        </Field>
        <Field label="Require Reason on Submission">
          <Toggle checked={draft.requireReason} onChange={(v) => set({ requireReason: v })} />
        </Field>
        <Field label="Notify Manager on OT Request">
          <Toggle checked={draft.notifyManagerOnOtRequest} onChange={(v) => set({ notifyManagerOnOtRequest: v })} />
        </Field>
      </Card>

    </div>
  )
}
