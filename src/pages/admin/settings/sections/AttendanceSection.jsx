import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import {
  FieldRow,
  SectionCard,
  SettingsBanner,
  SettingsError,
  SettingsLoading,
  SettingsSection,
  TextInput,
  Toggle,
} from '../components/ui'

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

const inp =
  'h-9 w-full max-w-[110px] rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
const sel =
  'h-9 w-full max-w-[200px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'

function PenaltyTiers({ penalties, onChange }) {
  const update = (idx, field, value) => {
    const next = penalties.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    onChange(next)
  }
  const add = () => {
    const maxCount = penalties.reduce((m, p) => Math.max(m, Number(p.count) || 0), 0)
    onChange([...penalties, { count: maxCount + 3, result: 'Half Day' }])
  }
  const remove = (idx) => { if (penalties.length <= 1) return; onChange(penalties.filter((_, i) => i !== idx)) }

  return (
    <div className="space-y-2">
      {penalties.map((tier, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 w-20 shrink-0">After</span>
          <input
            type="number"
            min={1}
            max={99}
            value={tier.count}
            onChange={(e) => update(idx, 'count', parseInt(e.target.value, 10) || 1)}
            className={inp}
          />
          <span className="text-[11px] font-bold text-slate-500 shrink-0">lates →</span>
          <select
            value={tier.result}
            onChange={(e) => update(idx, 'result', e.target.value)}
            className={sel}
          >
            {PENALTY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          {penalties.length > 1 && (
            <button
              type="button"
              onClick={() => remove(idx)}
              className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500 text-lg leading-none font-black"
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
        className="mt-1 h-7 px-3 text-[11px] font-black uppercase tracking-wide border border-dashed border-[#0F766E]/40 text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors"
      >
        + Add Tier
      </button>
    </div>
  )
}

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

  if (loading && !draft) return <SettingsLoading message="Loading attendance settings…" />
  if (!draft)            return <SettingsError   message={error || 'Could not load attendance settings.'} />

  const activeDays = draft.workWeekDays.split(',').map((d) => d.trim()).filter(Boolean)
  const weeklyOff  = WEEK_DAYS.filter((d) => !activeDays.includes(d))

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      {/* ── Working Days ──────────────────────────────────────────────── */}
      <SectionCard title="Working Days" description="Select working days — remaining days are automatically set as weekly off">
        <FieldRow label="Working Days">
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {WEEK_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkDay(day)}
                className={`h-9 w-12 text-[11px] font-black uppercase tracking-wide border transition-colors ${
                  activeDays.includes(day)
                    ? 'bg-[#0F766E] text-white border-[#0F766E]'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Weekly Off" hint="Auto-derived from unselected days above.">
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {weeklyOff.length > 0 ? weeklyOff.map((day) => (
              <span key={day} className="inline-flex h-9 w-12 items-center justify-center border border-amber-200 bg-amber-50 text-[11px] font-black uppercase tracking-wide text-amber-700">
                {day}
              </span>
            )) : (
              <span className="text-xs font-semibold text-slate-400 italic">No weekly off — all days are working</span>
            )}
          </div>
        </FieldRow>
      </SectionCard>

      {/* ── Present Rules ─────────────────────────────────────────────── */}
      <SectionCard title="Present Rules" description="Worked Hours ≥ Min Hours for Present → Status = P">
        <FieldRow label="Full Day Present Hours">
          <div className="flex items-center gap-2">
            <TextInput type="number" step="0.5" min={1} max={24} value={draft.fullDayPresentHours}
              onChange={(e) => set({ fullDayPresentHours: parseFloat(e.target.value) || 0 })} className="max-w-[110px]" />
            <span className="text-xs font-semibold text-slate-400">hours</span>
          </div>
        </FieldRow>
        <FieldRow label="Minimum Hours For Present">
          <div className="flex items-center gap-2">
            <TextInput type="number" step="0.5" min={1} max={24} value={draft.minHoursForPresent}
              onChange={(e) => set({ minHoursForPresent: parseFloat(e.target.value) || 0 })} className="max-w-[110px]" />
            <span className="text-xs font-semibold text-slate-400">hours</span>
          </div>
        </FieldRow>
        <FieldRow label="Present Status Code">
          <TextInput value={draft.presentStatusCode}
            onChange={(e) => set({ presentStatusCode: e.target.value.toUpperCase().slice(0, 4) })} className="max-w-[80px]" />
        </FieldRow>
      </SectionCard>

      {/* ── Half Day Rules ────────────────────────────────────────────── */}
      <SectionCard title="Half Day Rules" description="Min Hours ≤ Worked Hours < Full Day Hours → Status = HD">
        <FieldRow label="Half Day Minimum Hours">
          <div className="flex items-center gap-2">
            <TextInput type="number" step="0.5" min={0} max={24} value={draft.halfDayMinHours}
              onChange={(e) => set({ halfDayMinHours: parseFloat(e.target.value) || 0 })} className="max-w-[110px]" />
            <span className="text-xs font-semibold text-slate-400">hours</span>
          </div>
        </FieldRow>
        <FieldRow label="Half Day Maximum Hours" hint="Upper bound — typically full day hours minus 1 minute (e.g. 7.98).">
          <div className="flex items-center gap-2">
            <TextInput type="number" step="0.01" min={0} max={24} value={draft.halfDayMaxHours}
              onChange={(e) => set({ halfDayMaxHours: parseFloat(e.target.value) || 0 })} className="max-w-[110px]" />
            <span className="text-xs font-semibold text-slate-400">hours</span>
          </div>
        </FieldRow>
        <FieldRow label="Half Day Status Code">
          <TextInput value={draft.halfDayStatusCode}
            onChange={(e) => set({ halfDayStatusCode: e.target.value.toUpperCase().slice(0, 4) })} className="max-w-[80px]" />
        </FieldRow>
      </SectionCard>

      {/* ── Absent Rules ──────────────────────────────────────────────── */}
      <SectionCard title="Absent Rules" description="Worked Hours < Threshold → Status = A">
        <FieldRow label="Absent Below">
          <div className="flex items-center gap-2">
            <TextInput type="number" step="0.5" min={0} max={24} value={draft.absentBelowHours}
              onChange={(e) => set({ absentBelowHours: parseFloat(e.target.value) || 0 })} className="max-w-[110px]" />
            <span className="text-xs font-semibold text-slate-400">hours</span>
          </div>
        </FieldRow>
        <FieldRow label="Absent Status Code">
          <TextInput value={draft.absentStatusCode}
            onChange={(e) => set({ absentStatusCode: e.target.value.toUpperCase().slice(0, 4) })} className="max-w-[80px]" />
        </FieldRow>
        <FieldRow label="Auto Mark Absent" hint="Auto-mark absent if no punch and no approved leave exists.">
          <div className="flex min-h-9 items-center">
            <Toggle checked={draft.autoMarkAbsent} onChange={(v) => set({ autoMarkAbsent: v })} />
          </div>
        </FieldRow>
      </SectionCard>

      {/* ── Late Mark Rules ───────────────────────────────────────────── */}
      <SectionCard title="Late Mark Rules" description="Check-in after Shift Start + Grace Time → Status = L">
        <FieldRow label="Grace Period" hint="Minutes after shift start before a late mark is applied.">
          <div className="flex items-center gap-2">
            <TextInput type="number" min={0} max={120} value={draft.gracePeriodMinutes}
              onChange={(e) => set({ gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })} className="max-w-[110px]" />
            <span className="text-xs font-semibold text-slate-400">minutes</span>
          </div>
        </FieldRow>
        <FieldRow label="Enable Late Mark">
          <div className="flex min-h-9 items-center">
            <Toggle checked={draft.enableLateMark} onChange={(v) => set({ enableLateMark: v })} />
          </div>
        </FieldRow>
        <FieldRow label="Late Mark Status Code">
          <TextInput value={draft.lateMarkStatusCode}
            onChange={(e) => set({ lateMarkStatusCode: e.target.value.toUpperCase().slice(0, 4) })} className="max-w-[80px]" />
        </FieldRow>
        <FieldRow
          label="Late Penalty Tiers"
          hint="Define penalty per cumulative late count in a month. Highest matching threshold applies."
        >
          <PenaltyTiers
            penalties={draft.penalties}
            onChange={(p) => set({ penalties: p })}
          />
        </FieldRow>
      </SectionCard>

    </SettingsSection>
  )
}
