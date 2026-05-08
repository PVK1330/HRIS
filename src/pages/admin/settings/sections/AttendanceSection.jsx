import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import {
  APPROVERS,
  BREAK_DURATION_OPTIONS,
  EARLY_DEPARTURE_RULES,
  OVERTIME_APPROVAL,
  OVERTIME_CALC_RULES,
  WHO_CAN_SUBMIT,
} from '../attendanceConstants'
import { FieldRow, SectionCard, SelectInput, TextInput, Toggle } from '../components/ui'

function buildDraft(data) {
  if (!data) return null
  return {
    workHours: {
      startTime: data.workHours?.startTime ?? '09:00',
      endTime: data.workHours?.endTime ?? '18:00',
      breakDurationMinutes: data.workHours?.breakDurationMinutes ?? 30,
      totalRequiredHours: data.workHours?.totalRequiredHours ?? 8.5,
      autoCalculateHours: data.workHours?.autoCalculateHours !== false,
    },
    attendanceRules: {
      minHoursForPresent: data.attendanceRules?.minHoursForPresent ?? 6,
      tenMinuteBuffer: Boolean(data.attendanceRules?.tenMinuteBuffer),
      lateMarkAutoCalculation: Boolean(data.attendanceRules?.lateMarkAutoCalculation),
      graceDaysPerMonth: data.attendanceRules?.graceDaysPerMonth ?? 2,
      earlyDepartureRule: data.attendanceRules?.earlyDepartureRule ?? 'Mark half day',
    },
    regularizationSettings: {
      whoCanSubmitRequest: data.regularizationSettings?.whoCanSubmitRequest ?? 'All employees',
      approver: data.regularizationSettings?.approver ?? 'HR',
      autoRejectionAfterDays: data.regularizationSettings?.autoRejectionAfterDays ?? 3,
    },
    overtimeSettings: {
      overtimeEligibility: Boolean(data.overtimeSettings?.overtimeEligibility),
      calculationRule: data.overtimeSettings?.calculationRule ?? '1.5x hourly',
      approvalWorkflow: data.overtimeSettings?.approvalWorkflow ?? 'Manager → HR',
    },
  }
}

export default function AttendanceSection({ registerToolbar }) {
  const { settings, loading, saving, error, save } = useAttendanceSettings()
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [banner, setBanner] = useState(null)
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
      const res = await save({
        workHours: draft.workHours,
        attendanceRules: draft.attendanceRules,
        regularizationSettings: draft.regularizationSettings,
        overtimeSettings: draft.overtimeSettings,
      })
      if (res?.data) {
        const d = buildDraft(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Attendance settings saved.' })
    } catch {
      /* hook sets error */
    }
  }, [draft, save])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty,
      saving,
      onSave: handleSave,
      onDiscard: resetDraft,
      disableSave: loading || !draft || saving || !dirty,
    })
    return () => registerToolbar(null)
  }, [registerToolbar, dirty, saving, handleSave, resetDraft, loading, draft])

  const updateWorkHours = (partial) =>
    setDraft((p) => (p ? { ...p, workHours: { ...p.workHours, ...partial } } : p))
  const updateAttendanceRules = (partial) =>
    setDraft((p) => (p ? { ...p, attendanceRules: { ...p.attendanceRules, ...partial } } : p))
  const updateRegularization = (partial) =>
    setDraft((p) =>
      p ? { ...p, regularizationSettings: { ...p.regularizationSettings, ...partial } } : p,
    )
  const updateOvertime = (partial) =>
    setDraft((p) => (p ? { ...p, overtimeSettings: { ...p.overtimeSettings, ...partial } } : p))

  if (loading && !draft) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
        Loading attendance settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Could not load attendance settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {(banner?.type === 'ok' || error) && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            banner?.type === 'ok'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
              : 'border border-red-100 bg-red-50 text-red-700'
          }`}
        >
          {banner?.type === 'ok' ? banner.text : error}
        </div>
      )}

      <SectionCard title="A. Work Hours">
        <FieldRow label="Start Time">
          <TextInput
            type="time"
            value={draft.workHours.startTime}
            onChange={(e) => updateWorkHours({ startTime: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="End Time">
          <TextInput
            type="time"
            value={draft.workHours.endTime}
            onChange={(e) => updateWorkHours({ endTime: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Break Duration">
          <select
            value={String(draft.workHours.breakDurationMinutes)}
            onChange={(e) =>
              updateWorkHours({ breakDurationMinutes: parseInt(e.target.value, 10) })
            }
            className="h-8 w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          >
            {BREAK_DURATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Total Required Hours" hint="Decimal hours (e.g. 8.5)">
          <TextInput
            type="number"
            step="0.25"
            min={1}
            max={24}
            value={draft.workHours.totalRequiredHours}
            onChange={(e) =>
              updateWorkHours({ totalRequiredHours: parseFloat(e.target.value) || 0 })
            }
          />
        </FieldRow>
        <FieldRow label="Auto-calculate total hours">
          <Toggle
            checked={draft.workHours.autoCalculateHours}
            onChange={(v) => updateWorkHours({ autoCalculateHours: v })}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="B. Attendance Rules">
        <FieldRow label="Min. Hours for Present Mark">
          <TextInput
            type="number"
            step="0.25"
            min={1}
            max={24}
            value={draft.attendanceRules.minHoursForPresent}
            onChange={(e) =>
              updateAttendanceRules({ minHoursForPresent: parseFloat(e.target.value) || 0 })
            }
          />
        </FieldRow>
        <FieldRow label="10-Minute Buffer" hint="Grace before late mark">
          <Toggle
            checked={draft.attendanceRules.tenMinuteBuffer}
            onChange={(v) => updateAttendanceRules({ tenMinuteBuffer: v })}
          />
        </FieldRow>
        <FieldRow label="Late Mark Auto-Calculation">
          <Toggle
            checked={draft.attendanceRules.lateMarkAutoCalculation}
            onChange={(v) => updateAttendanceRules({ lateMarkAutoCalculation: v })}
          />
        </FieldRow>
        <FieldRow label="Grace Days Allowed per Month">
          <TextInput
            type="number"
            min={0}
            max={31}
            value={draft.attendanceRules.graceDaysPerMonth}
            onChange={(e) =>
              updateAttendanceRules({ graceDaysPerMonth: parseInt(e.target.value, 10) || 0 })
            }
          />
        </FieldRow>
        <FieldRow label="Early Departure Rules">
          <SelectInput
            options={EARLY_DEPARTURE_RULES}
            value={draft.attendanceRules.earlyDepartureRule}
            onChange={(e) => updateAttendanceRules({ earlyDepartureRule: e.target.value })}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="C. Regularization Settings">
        <FieldRow label="Who Can Submit Request">
          <SelectInput
            options={WHO_CAN_SUBMIT}
            value={draft.regularizationSettings.whoCanSubmitRequest}
            onChange={(e) =>
              updateRegularization({ whoCanSubmitRequest: e.target.value })
            }
          />
        </FieldRow>
        <FieldRow label="Approver">
          <SelectInput
            options={APPROVERS}
            value={draft.regularizationSettings.approver}
            onChange={(e) => updateRegularization({ approver: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Auto-Rejection After (days)">
          <TextInput
            type="number"
            min={1}
            max={30}
            value={draft.regularizationSettings.autoRejectionAfterDays}
            onChange={(e) =>
              updateRegularization({
                autoRejectionAfterDays: parseInt(e.target.value, 10) || 1,
              })
            }
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="D. Overtime Settings (Optional)">
        <FieldRow label="Overtime Eligibility">
          <Toggle
            checked={draft.overtimeSettings.overtimeEligibility}
            onChange={(v) => updateOvertime({ overtimeEligibility: v })}
          />
        </FieldRow>
        <FieldRow label="Calculation Rule">
          <SelectInput
            options={OVERTIME_CALC_RULES}
            value={draft.overtimeSettings.calculationRule}
            onChange={(e) => updateOvertime({ calculationRule: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Approval Workflow">
          <SelectInput
            options={OVERTIME_APPROVAL}
            value={draft.overtimeSettings.approvalWorkflow}
            onChange={(e) => updateOvertime({ approvalWorkflow: e.target.value })}
          />
        </FieldRow>
      </SectionCard>
    </div>
  )
}
