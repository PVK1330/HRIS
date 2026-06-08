import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import {
  APPROVERS,
  BREAK_DURATION_OPTIONS,
  EARLY_DEPARTURE_RULES,
  WHO_CAN_SUBMIT,
} from '../attendanceConstants'
import {
  FieldRow,
  SectionCard,
  SelectInput,
  SettingsBanner,
  SettingsError,
  SettingsLoading,
  SettingsSection,
  TextInput,
  Toggle,
} from '../components/ui'
import { seedHolidays } from '../../../../services/holidayService.js'

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
      allowSelf: data.regularizationSettings?.allowSelf !== false,
      maxPerMonth: data.regularizationSettings?.maxPerMonth ?? 3,
      autoApproveEnabled: Boolean(data.regularizationSettings?.autoApproveEnabled),
      autoApproveAfterDays: data.regularizationSettings?.autoApproveAfterDays ?? 3,
    },
    overtimeSettings: {
      overtimeEligibility: Boolean(data.overtimeSettings?.overtimeEligibility),
      calculationRule: data.overtimeSettings?.calculationRule ?? '1.5x hourly',
      approvalWorkflow: data.overtimeSettings?.approvalWorkflow ?? 'Manager → HR',
      minimumThresholdMinutes: data.overtimeSettings?.minimumThresholdMinutes ?? 30,
      maxPerMonthHours: data.overtimeSettings?.maxPerMonthHours ?? 0,
      approver: data.overtimeSettings?.approver ?? 'HR Department',
      payMultiplier: data.overtimeSettings?.payMultiplier ?? 1.5,
      requireReason: data.overtimeSettings?.requireReason !== false,
    },
    shiftSettings: {
      defaultShift: data.shiftSettings?.defaultShift ?? 'General',
      allowEmployeeView: data.shiftSettings?.allowEmployeeView !== false,
      changeRequestEnabled: Boolean(data.shiftSettings?.changeRequestEnabled),
    },
    generalSettings: {
      workWeekDays: data.generalSettings?.workWeekDays ?? 'Mon,Tue,Wed,Thu,Fri',
      gracePeriodMinutes: data.generalSettings?.gracePeriodMinutes ?? 10,
      halfDayThresholdHours: data.generalSettings?.halfDayThresholdHours ?? 4,
      biometricSyncEnabled: Boolean(data.generalSettings?.biometricSyncEnabled),
      wfhMarkingAllowed: data.generalSettings?.wfhMarkingAllowed !== false,
    },
  }
}

const SHIFT_TYPES = ['Morning', 'General', 'Night', 'Rotational']
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
        shiftSettings: draft.shiftSettings,
        generalSettings: draft.generalSettings,
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
  const updateShift = (partial) =>
    setDraft((p) => (p ? { ...p, shiftSettings: { ...p.shiftSettings, ...partial } } : p))
  const updateGeneral = (partial) =>
    setDraft((p) => (p ? { ...p, generalSettings: { ...p.generalSettings, ...partial } } : p))

  const toggleWorkDay = (day) => {
    setDraft((p) => {
      if (!p) return p
      const current = String(p.generalSettings.workWeekDays || '')
        .split(',').map((d) => d.trim()).filter(Boolean)
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
      const ordered = WEEK_DAYS.filter((d) => next.includes(d))
      return { ...p, generalSettings: { ...p.generalSettings, workWeekDays: ordered.join(',') } }
    })
  }

  if (loading && !draft) {
    return <SettingsLoading message="Loading attendance settings…" />
  }

  if (!draft) {
    return <SettingsError message={error || 'Could not load attendance settings.'} />
  }

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      <SectionCard title="Work hours">
          <FieldRow label="Operational Start">
            <TextInput
              type="time"
              value={draft.workHours.startTime}
              onChange={(e) => updateWorkHours({ startTime: e.target.value })}
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Operational End">
            <TextInput
              type="time"
              value={draft.workHours.endTime}
              onChange={(e) => updateWorkHours({ endTime: e.target.value })}
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Rest Interval (Minutes)">
            <select
              value={String(draft.workHours.breakDurationMinutes)}
              onChange={(e) =>
                updateWorkHours({ breakDurationMinutes: parseInt(e.target.value, 10) })
              }
              className="h-9 w-full max-w-[200px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
            >
              {BREAK_DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow
            label="Mandatory Quota (Hours)"
            hint={draft.workHours.autoCalculateHours
              ? 'Auto-derived from Operational Start, End & Rest Interval'
              : 'Decimal format (e.g. 8.5)'}
          >
            <TextInput
              type="number"
              step="0.25"
              min={1}
              max={24}
              value={draft.workHours.totalRequiredHours}
              disabled={draft.workHours.autoCalculateHours}
              onChange={(e) =>
                updateWorkHours({ totalRequiredHours: parseFloat(e.target.value) || 0 })
              }
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow
            label="Automated Quota Calculus"
            hint="Derive required daily hours from the operational window instead of the manual quota."
          >
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.workHours.autoCalculateHours}
                onChange={(v) => updateWorkHours({ autoCalculateHours: v })}
              />
            </div>
          </FieldRow>
      </SectionCard>

      <SectionCard title="Punctuality & presence">
          <FieldRow label="Presence Threshold (Hours)">
            <TextInput
              type="number"
              step="0.25"
              min={1}
              max={24}
              value={draft.attendanceRules.minHoursForPresent}
              onChange={(e) =>
                updateAttendanceRules({ minHoursForPresent: parseFloat(e.target.value) || 0 })
              }
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Chronological Grace (10M)" hint="Late mark buffer">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.attendanceRules.tenMinuteBuffer}
                onChange={(v) => updateAttendanceRules({ tenMinuteBuffer: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Automated Punctuality Audit">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.attendanceRules.lateMarkAutoCalculation}
                onChange={(v) => updateAttendanceRules({ lateMarkAutoCalculation: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Monthly Deviation Allowance">
            <TextInput
              type="number"
              min={0}
              max={31}
              value={draft.attendanceRules.graceDaysPerMonth}
              onChange={(e) =>
                updateAttendanceRules({ graceDaysPerMonth: parseInt(e.target.value, 10) || 0 })
              }
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Early Exit Compliance">
            <SelectInput
              options={EARLY_DEPARTURE_RULES}
              value={draft.attendanceRules.earlyDepartureRule}
              onChange={(e) => updateAttendanceRules({ earlyDepartureRule: e.target.value })}
            />
          </FieldRow>
      </SectionCard>

      <SectionCard title="Regularization">
          <FieldRow label="Who can submit">
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
          <FieldRow label="Auto-reject after (days)" hint="Reject if not approved in time.">
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
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Allow self-requests" hint="Let employees submit their own corrections.">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.regularizationSettings.allowSelf}
                onChange={(v) => updateRegularization({ allowSelf: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Max per month" hint="Limit per employee (0 = no limit).">
            <TextInput
              type="number"
              min={0}
              max={31}
              value={draft.regularizationSettings.maxPerMonth}
              onChange={(e) => updateRegularization({ maxPerMonth: parseInt(e.target.value, 10) || 0 })}
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Auto-approve if manager absent" hint="Approve after the days below if the manager hasn't acted.">
            <div className="flex min-h-9 items-center gap-3">
              <Toggle
                checked={draft.regularizationSettings.autoApproveEnabled}
                onChange={(v) => updateRegularization({ autoApproveEnabled: v })}
              />
              <TextInput
                type="number"
                min={0}
                max={30}
                value={draft.regularizationSettings.autoApproveAfterDays}
                onChange={(e) =>
                  updateRegularization({ autoApproveAfterDays: parseInt(e.target.value, 10) || 0 })
                }
                className="max-w-[90px]"
                disabled={!draft.regularizationSettings.autoApproveEnabled}
              />
              <span className="text-xs font-semibold text-slate-400">days</span>
            </div>
          </FieldRow>
      </SectionCard>

      <SectionCard
        title="Overtime Settings"
        description="Configure overtime tracking, thresholds, and approval workflows for your organisation"
      >
          <FieldRow
            label="Enable Overtime Tracking"
            hint="When on, the Overtime tab appears in the Attendance module for all users with access."
          >
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.overtimeSettings.overtimeEligibility}
                onChange={(v) => updateOvertime({ overtimeEligibility: v })}
              />
            </div>
          </FieldRow>
          <FieldRow
            label="Minimum Overtime Threshold"
            hint="Overtime is only counted after exceeding this duration past regular hours."
          >
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                step="5"
                min={0}
                max={720}
                value={draft.overtimeSettings.minimumThresholdMinutes}
                onChange={(e) =>
                  updateOvertime({ minimumThresholdMinutes: parseInt(e.target.value, 10) || 0 })
                }
                className="max-w-[120px]"
              />
              <span className="text-xs font-semibold text-slate-400">minutes</span>
            </div>
          </FieldRow>
          <FieldRow
            label="Max Overtime per Month"
            hint="Cap on overtime hours per employee per calendar month (0 = unlimited)."
          >
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                step="1"
                min={0}
                max={744}
                value={draft.overtimeSettings.maxPerMonthHours}
                onChange={(e) =>
                  updateOvertime({ maxPerMonthHours: parseFloat(e.target.value) || 0 })
                }
                className="max-w-[120px]"
              />
              <span className="text-xs font-semibold text-slate-400">hours</span>
            </div>
          </FieldRow>
          <FieldRow label="Overtime Pay Multiplier" hint="Rate multiplier applied to overtime hours for payroll calculation.">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                step="0.1"
                min={1}
                max={10}
                value={draft.overtimeSettings.payMultiplier}
                onChange={(e) => updateOvertime({ payMultiplier: parseFloat(e.target.value) || 1 })}
                className="max-w-[120px]"
              />
              <span className="text-xs font-semibold text-slate-400">× base rate</span>
            </div>
          </FieldRow>
          <FieldRow label="Require Reason for Overtime" hint="Overtime entries must include a reason.">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.overtimeSettings.requireReason}
                onChange={(v) => updateOvertime({ requireReason: v })}
              />
            </div>
          </FieldRow>
      </SectionCard>

      {/* <SectionCard title="Shift Settings" description="Default shift and employee shift visibility">
          <FieldRow label="Default Shift" hint="Applied to new employees by default.">
            <SelectInput
              options={SHIFT_TYPES}
              value={draft.shiftSettings.defaultShift}
              onChange={(e) => updateShift({ defaultShift: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Allow Employees to View Their Shift" hint="Show the assigned shift in the employee portal.">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.shiftSettings.allowEmployeeView}
                onChange={(v) => updateShift({ allowEmployeeView: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Shift Change Requests" hint="Let employees request a shift change.">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.shiftSettings.changeRequestEnabled}
                onChange={(v) => updateShift({ changeRequestEnabled: v })}
              />
            </div>
          </FieldRow>
      </SectionCard> */}

      <SectionCard title="General Attendance Settings" description="Work week, grace, and marking rules">
          <FieldRow label="Work Week" hint="Days counted as working days." colSpan>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Work Week</p>
            <p className="mt-0.5 text-[9px] normal-case text-slate-400">Days counted as working days.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEK_DAYS.map((d) => {
                const on = String(draft.generalSettings.workWeekDays || '')
                  .split(',').map((x) => x.trim()).includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleWorkDay(d)}
                    className={`rounded-none border px-3 py-1.5 text-xs font-bold transition-colors ${
                      on
                        ? 'border-[#0F766E] bg-[#0F766E]/10 text-[#0F766E]'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </FieldRow>
          <FieldRow label="Grace Period for Late Marking" hint="Minutes before a check-in is marked late.">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                min={0}
                max={120}
                value={draft.generalSettings.gracePeriodMinutes}
                onChange={(e) => updateGeneral({ gracePeriodMinutes: parseInt(e.target.value, 10) || 0 })}
                className="max-w-[120px]"
              />
              <span className="text-xs font-semibold text-slate-400">minutes</span>
            </div>
          </FieldRow>
          <FieldRow label="Half-day Threshold" hint="Hours below which a day counts as half-day.">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                step="0.5"
                min={0}
                max={24}
                value={draft.generalSettings.halfDayThresholdHours}
                onChange={(e) => updateGeneral({ halfDayThresholdHours: parseFloat(e.target.value) || 0 })}
                className="max-w-[120px]"
              />
              <span className="text-xs font-semibold text-slate-400">hours</span>
            </div>
          </FieldRow>
          <FieldRow label="Allow WFH marking" hint="Let employees check in as Work From Home.">
            <div className="flex min-h-9 items-center">
              <Toggle
                checked={draft.generalSettings.wfhMarkingAllowed}
                onChange={(v) => updateGeneral({ wfhMarkingAllowed: v })}
              />
            </div>
          </FieldRow>
      </SectionCard>

      <HolidaySeedPanel />
    </SettingsSection>
  )
}

const UK_REGIONS = ['England', 'Scotland', 'Wales', 'Northern Ireland']

function HolidaySeedPanel() {
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [regions, setRegions] = useState(['England'])
  const [seeding, setSeeding] = useState(false)
  const [msg, setMsg] = useState('')

  const toggleRegion = (r) => {
    setRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
  }

  const handleSeed = async () => {
    setSeeding(true)
    setMsg('')
    try {
      const result = await seedHolidays({ year: parseInt(year, 10), regions })
      setMsg(`Seeded ${result.seeded?.length || 0} calendar(s) for ${year}`)
    } catch (err) {
      setMsg(err?.response?.data?.message || err?.message || 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

 
}

