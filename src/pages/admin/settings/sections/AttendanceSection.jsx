import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const PENALTY_OPTIONS = [
  'Half Day',
  'Absent',
  '1 Leave Deduction',
  '1 Day Absent',
  'Warning',
  'None',
]

const DEFAULT_PENALTIES = [
  { count: 3, result: 'Half Day' },
  { count: 6, result: '1 Leave Deduction' },
]

function normalisePenalties(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw.map((p) => ({ count: Number(p.count) || 0, result: p.result || 'Half Day' }))
  return DEFAULT_PENALTIES.map((p) => ({ ...p }))
}

function buildDraft(data) {
  if (!data) return null
  const ar  = data.attendanceRules   ?? {}
  const gs  = data.generalSettings   ?? {}
  const g   = data.generalAttendance ?? {}
  const pr  = data.presentRules      ?? {}
  const hd  = data.halfDayRules      ?? {}
  const ab  = data.absentRules       ?? {}
  const lm  = data.lateMarkRules     ?? {}

  return {
    workWeekDays:        g.workWeekDays       ?? gs.workWeekDays   ?? 'Mon,Tue,Wed,Thu,Fri,Sat',
    fullDayPresentHours: pr.fullDayPresentHours ?? ar.minHoursForPresent ?? 8,
    minHoursForPresent:  pr.minHoursForPresent  ?? ar.minHoursForPresent ?? 8,
    presentStatusCode:   pr.presentStatusCode   ?? 'P',
    halfDayMinHours:     hd.halfDayMinHours   ?? gs.halfDayThresholdHours ?? 4,
    halfDayMaxHours:     hd.halfDayMaxHours   ?? 7.98,
    halfDayStatusCode:   hd.halfDayStatusCode ?? 'HD',
    absentBelowHours:    ab.absentBelowHours  ?? 4,
    absentStatusCode:    ab.absentStatusCode  ?? 'A',
    autoMarkAbsent:      ab.autoMarkAbsent    !== undefined ? Boolean(ab.autoMarkAbsent) : true,
    gracePeriodMinutes:  lm.gracePeriodMinutes ?? gs.gracePeriodMinutes ?? 10,
    enableLateMark:      lm.enableLateMark    !== undefined ? Boolean(lm.enableLateMark) : true,
    lateMarkStatusCode:  lm.lateMarkStatusCode ?? 'L',
    penalties:           normalisePenalties(lm.penalties),
  }
}

function buildPayload(draft) {
  const activeDays = draft.workWeekDays.split(',').map((d) => d.trim()).filter(Boolean)
  const weeklyOff  = WEEK_DAYS.filter((d) => !activeDays.includes(d))
  return {
    generalAttendance: { workWeekDays: draft.workWeekDays, weeklyOff: weeklyOff.join(',') },
    presentRules: {
      fullDayPresentHours: draft.fullDayPresentHours,
      minHoursForPresent:  draft.minHoursForPresent,
      presentStatusCode:   draft.presentStatusCode,
    },
    halfDayRules: {
      halfDayMinHours:   draft.halfDayMinHours,
      halfDayMaxHours:   draft.halfDayMaxHours,
      halfDayStatusCode: draft.halfDayStatusCode,
    },
    absentRules: {
      absentBelowHours: draft.absentBelowHours,
      absentStatusCode: draft.absentStatusCode,
      autoMarkAbsent:   draft.autoMarkAbsent,
    },
    lateMarkRules: {
      gracePeriodMinutes: draft.gracePeriodMinutes,
      enableLateMark:     draft.enableLateMark,
      lateMarkStatusCode: draft.lateMarkStatusCode,
      penalties:          draft.penalties,
    },
  }
}

/* ── Shared style tokens ──────────────────────────────────────────────── */
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

/* ── Penalty tiers ────────────────────────────────────────────────────── */
function PenaltyTiers({ penalties, onChange }) {
  const update = (idx, field, value) => {
    onChange(penalties.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }
  const add = () => {
    const maxCount = penalties.reduce((m, p) => Math.max(m, Number(p.count) || 0), 0)
    onChange([...penalties, { count: maxCount + 3, result: 'Half Day' }])
  }
  const remove = (idx) => {
    if (penalties.length <= 1) return
    onChange(penalties.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      {penalties.map((tier, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-xs font-medium text-slate-500">After</span>
          <input
            type="number"
            min={1}
            max={99}
            value={tier.count}
            onChange={(e) => update(idx, 'count', parseInt(e.target.value, 10) || 1)}
            className={`${inputCls} w-20`}
          />
          <span className="shrink-0 text-xs font-medium text-slate-500">lates →</span>
          <select
            value={tier.result}
            onChange={(e) => update(idx, 'result', e.target.value)}
            className={`${selectCls} w-44`}
          >
            {PENALTY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          {penalties.length > 1 && (
            <button
              type="button"
              onClick={() => remove(idx)}
              className="h-7 w-7 shrink-0 text-lg font-black leading-none text-slate-400 hover:text-red-500"
              title="Remove tier"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="mt-1 h-8 px-3 text-xs font-semibold border border-dashed border-[#0F766E]/40 text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors rounded-none"
      >
        + Add Tier
      </button>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function AttendanceSection({ registerToolbar }) {
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

  const resetDraft = useCallback(() => {
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
      const res = await save(buildPayload(draft))
      if (res?.data) {
        const d = buildDraft(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Attendance settings saved.' })
    } catch { /* hook surfaces the error */ }
  }, [draft, save])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty, saving, onSave: handleSave, onDiscard: resetDraft, disableSave: loading || !draft || saving || !dirty })
    return () => registerToolbar(null)
  }, [registerToolbar, dirty, saving, handleSave, resetDraft, loading, draft])

  const set = (partial) => setDraft((p) => p ? { ...p, ...partial } : p)

  const toggleWorkDay = (day) => {
    setDraft((p) => {
      if (!p) return p
      const current = p.workWeekDays.split(',').map((d) => d.trim()).filter(Boolean)
      const next    = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
      const ordered = WEEK_DAYS.filter((d) => next.includes(d))
      return { ...p, workWeekDays: ordered.join(',') }
    })
  }

  if (loading && !draft) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading attendance settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load attendance settings.'}
      </div>
    )
  }

  const activeDays = draft.workWeekDays.split(',').map((d) => d.trim()).filter(Boolean)
  const weeklyOff  = WEEK_DAYS.filter((d) => !activeDays.includes(d))

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

      {/* ── Working Days ──────────────────────────────────────────────── */}
      <Card title="Working Days" description="Select working days — remaining days are automatically set as weekly off">
        <Field label="Working Days">
          <div className="flex flex-wrap gap-1.5">
            {WEEK_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkDay(day)}
                className={`h-9 w-12 text-xs font-semibold border transition-colors rounded-none ${
                  activeDays.includes(day)
                    ? 'bg-[#0F766E] text-white border-[#0F766E]'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Weekly Off" hint="Auto-derived from unselected days above.">
          <div className="flex flex-wrap gap-1.5">
            {weeklyOff.length > 0 ? weeklyOff.map((day) => (
              <span key={day} className="inline-flex h-9 w-12 items-center justify-center rounded-none border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-700">
                {day}
              </span>
            )) : (
              <span className="text-sm font-medium text-slate-400 italic">No weekly off — all days are working</span>
            )}
          </div>
        </Field>
      </Card>

      {/* ── Present Rules ─────────────────────────────────────────────── */}
      <Card title="Present Rules" description="Worked Hours ≥ Min Hours for Present → Status = P">
        <Field label="Full Day Present Hours">
          <input
            type="number" step="0.5" min={1} max={24}
            value={draft.fullDayPresentHours}
            onChange={(e) => set({ fullDayPresentHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm font-medium text-slate-400">hours</span>
        </Field>
        <Field label="Minimum Hours For Present">
          <input
            type="number" step="0.5" min={1} max={24}
            value={draft.minHoursForPresent}
            onChange={(e) => set({ minHoursForPresent: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm font-medium text-slate-400">hours</span>
        </Field>
        <Field label="Present Status Code">
          <input
            value={draft.presentStatusCode}
            onChange={(e) => set({ presentStatusCode: e.target.value.toUpperCase().slice(0, 4) })}
            className={`${inputCls} w-24`}
          />
        </Field>
      </Card>

      {/* ── Half Day Rules ────────────────────────────────────────────── */}
      <Card title="Half Day Rules" description="Min Hours ≤ Worked Hours < Full Day Hours → Status = HD">
        <Field label="Half Day Minimum Hours">
          <input
            type="number" step="0.5" min={0} max={24}
            value={draft.halfDayMinHours}
            onChange={(e) => set({ halfDayMinHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm font-medium text-slate-400">hours</span>
        </Field>
        <Field label="Half Day Maximum Hours" hint="Upper bound — typically full day hours minus 1 minute (e.g. 7.98).">
          <input
            type="number" step="0.01" min={0} max={24}
            value={draft.halfDayMaxHours}
            onChange={(e) => set({ halfDayMaxHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm font-medium text-slate-400">hours</span>
        </Field>
        <Field label="Half Day Status Code">
          <input
            value={draft.halfDayStatusCode}
            onChange={(e) => set({ halfDayStatusCode: e.target.value.toUpperCase().slice(0, 4) })}
            className={`${inputCls} w-24`}
          />
        </Field>
      </Card>

      {/* ── Absent Rules ──────────────────────────────────────────────── */}
      <Card title="Absent Rules" description="Worked Hours < Threshold → Status = A">
        <Field label="Absent Below">
          <input
            type="number" step="0.5" min={0} max={24}
            value={draft.absentBelowHours}
            onChange={(e) => set({ absentBelowHours: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm font-medium text-slate-400">hours</span>
        </Field>
        <Field label="Absent Status Code">
          <input
            value={draft.absentStatusCode}
            onChange={(e) => set({ absentStatusCode: e.target.value.toUpperCase().slice(0, 4) })}
            className={`${inputCls} w-24`}
          />
        </Field>
        <Field label="Auto Mark Absent" hint="Auto-mark absent if no punch and no approved leave exists.">
          <Toggle checked={draft.autoMarkAbsent} onChange={(v) => set({ autoMarkAbsent: v })} />
        </Field>
      </Card>

      {/* ── Late Mark Rules ───────────────────────────────────────────── */}
      <Card title="Late Mark Rules" description="Check-in after Shift Start + Grace Time → Status = L">
        <Field label="Grace Period" hint="Minutes after shift start before a late mark is applied.">
          <input
            type="number" min={0} max={120}
            value={draft.gracePeriodMinutes}
            onChange={(e) => set({ gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })}
            className={`${inputCls} w-24`}
          />
          <span className="text-sm font-medium text-slate-400">minutes</span>
        </Field>
        <Field label="Enable Late Mark">
          <Toggle checked={draft.enableLateMark} onChange={(v) => set({ enableLateMark: v })} />
        </Field>
        <Field label="Late Mark Status Code">
          <input
            value={draft.lateMarkStatusCode}
            onChange={(e) => set({ lateMarkStatusCode: e.target.value.toUpperCase().slice(0, 4) })}
            className={`${inputCls} w-24`}
          />
        </Field>
        <Field
          label="Late Penalty Tiers"
          hint="Define penalty per cumulative late count in a month. Highest matching threshold applies."
        >
          <PenaltyTiers penalties={draft.penalties} onChange={(p) => set({ penalties: p })} />
        </Field>
      </Card>

    </div>
  )
}
