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
import { seedUkHolidays } from '../../../../services/holidaysService.js'

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
              className="h-10 w-full max-w-[200px] rounded-none border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/15"
            >
              {BREAK_DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Mandatory Quota (Hours)" hint="Decimal format (e.g. 8.5)">
            <TextInput
              type="number"
              step="0.25"
              min={1}
              max={24}
              value={draft.workHours.totalRequiredHours}
              onChange={(e) =>
                updateWorkHours({ totalRequiredHours: parseFloat(e.target.value) || 0 })
              }
              className="max-w-[140px]"
            />
          </FieldRow>
          <FieldRow label="Automated Quota Calculus">
            <div className="flex h-10 items-center">
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
            <div className="flex h-10 items-center">
              <Toggle
                checked={draft.attendanceRules.tenMinuteBuffer}
                onChange={(v) => updateAttendanceRules({ tenMinuteBuffer: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Automated Punctuality Audit">
            <div className="flex h-10 items-center">
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

      <SectionCard title="Attendance regularization">
          <FieldRow label="Originating Authority">
            <SelectInput
              options={WHO_CAN_SUBMIT}
              value={draft.regularizationSettings.whoCanSubmitRequest}
              onChange={(e) =>
                updateRegularization({ whoCanSubmitRequest: e.target.value })
              }
            />
          </FieldRow>
          <FieldRow label="Decision Custodian">
            <SelectInput
              options={APPROVERS}
              value={draft.regularizationSettings.approver}
              onChange={(e) => updateRegularization({ approver: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="System Purge Interval (Days)" hint="Auto-rejection cycle">
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
      </SectionCard>

      <SectionCard title="Overtime">
          <FieldRow label="OT Eligibility Enablement">
            <div className="flex h-10 items-center">
              <Toggle
                checked={draft.overtimeSettings.overtimeEligibility}
                onChange={(v) => updateOvertime({ overtimeEligibility: v })}
              />
            </div>
          </FieldRow>
          <FieldRow label="Calculus Algorithm">
            <SelectInput
              options={OVERTIME_CALC_RULES}
              value={draft.overtimeSettings.calculationRule}
              onChange={(e) => updateOvertime({ calculationRule: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Authorization Pipeline">
            <SelectInput
              options={OVERTIME_APPROVAL}
              value={draft.overtimeSettings.approvalWorkflow}
              onChange={(e) => updateOvertime({ approvalWorkflow: e.target.value })}
            />
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
      const result = await seedUkHolidays({ year: parseInt(year, 10), regions })
      setMsg(`Seeded ${result.seeded?.length || 0} calendar(s) for ${year}`)
    } catch (err) {
      setMsg(err?.response?.data?.message || err?.message || 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <SectionCard title="UK public holidays (database seed)">
      <p className="mb-4 text-sm text-slate-500">
        Loads public holidays from server configuration into your organization calendar. Add more years in the UK holidays data file on the server, then seed again.
      </p>
      <FieldRow label="Year">
        <TextInput
          type="number"
          min={2020}
          max={2100}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="max-w-[120px]"
        />
      </FieldRow>
      <FieldRow label="Regions">
        <div className="flex flex-wrap gap-3">
          {UK_REGIONS.map((r) => (
            <label key={r} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={regions.includes(r)}
                onChange={() => toggleRegion(r)}
              />
              {r}
            </label>
          ))}
        </div>
      </FieldRow>
      <button
        type="button"
        disabled={seeding || !regions.length}
        onClick={handleSeed}
        className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {seeding ? 'Seeding…' : 'Seed UK holidays'}
      </button>
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </SectionCard>
  )
}

