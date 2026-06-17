import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import {
  FieldRow,
  SectionCard,
  SettingsBanner,
  SettingsError,
  SettingsLoading,
  SettingsSection,
  Toggle,
} from '../components/ui'
import { ApprovalChain } from './ApprovalChain.jsx'

const OT_CALC_OPTIONS = ['Daily', 'Weekly', 'Monthly']
const OT_RATE_OPTIONS = [
  { label: '1.0x (No premium)', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x (Standard)', value: 1.5 },
  { label: '2.0x (Double)', value: 2.0 },
]
const APPROVAL_OPTIONS = [
  'Reporting Manager → Dept Head → HR',
  'Reporting Manager → HR',
  'HR Only',
  'Auto Approve',
]

const APPROVAL_FLOW = 'Reporting Manager → Dept Head → HR'

function buildDraft(data) {
  if (!data) return null
  const ot = data.overtimeSettings || {}
  return {
    overtimeEligibility: ot.overtimeEligibility !== false,
    calculationRule: ot.calculationRule ?? 'Daily',
    approvalWorkflow: ot.approvalWorkflow ?? APPROVAL_FLOW,
    minimumThresholdMinutes: ot.minimumThresholdMinutes ?? 30,
    maxPerMonthHours: ot.maxPerMonthHours ?? 0,
    dailyOtLimitHours: ot.dailyOtLimitHours ?? 4,
    weeklyOtLimitHours: ot.weeklyOtLimitHours ?? 12,
    payMultiplier: ot.payMultiplier ?? 1.5,
    requireReason: ot.requireReason !== false,
    carryForwardOt: Boolean(ot.carryForwardOt),
    holidayOtApplicable: ot.holidayOtApplicable !== false,
    notifyManagerOnOtRequest: ot.notifyManagerOnOtRequest !== false,
  }
}

const sel =
  'h-9 w-full max-w-[220px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
const inp =
  'h-9 w-full max-w-[140px] rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'

export default function OvertimeSettings({ registerToolbar }) {
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

  if (loading && !draft) return <SettingsLoading message="Loading overtime settings…" />
  if (!draft) return <SettingsError message={error || 'Could not load overtime settings.'} />

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      {/* Eligibility */}
      <SectionCard title="OT Eligibility" description="Enable and scope overtime for your workforce">
        <FieldRow label="Overtime Enabled">
          <Toggle checked={draft.overtimeEligibility} onChange={(v) => set({ overtimeEligibility: v })} />
        </FieldRow>
        <FieldRow label="Holiday OT Applicable">
          <Toggle checked={draft.holidayOtApplicable} onChange={(v) => set({ holidayOtApplicable: v })} />
        </FieldRow>
      </SectionCard>

      {/* Calculation rules */}
      <SectionCard title="Calculation Rules" description="Define how OT hours are computed">
        <FieldRow label="OT Calculation Period">
          <select className={sel} value={draft.calculationRule} onChange={(e) => set({ calculationRule: e.target.value })}>
            {OT_CALC_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="OT Starts After (minutes over shift)">
          <input className={inp} type="number" min={0} max={120} value={draft.minimumThresholdMinutes}
            onChange={(e) => set({ minimumThresholdMinutes: parseInt(e.target.value, 10) || 0 })} />
        </FieldRow>
        <FieldRow label="Daily OT Limit (hours)" hint="0 = no limit">
          <input className={inp} type="number" min={0} max={12} step={0.5} value={draft.dailyOtLimitHours}
            onChange={(e) => set({ dailyOtLimitHours: parseFloat(e.target.value) || 0 })} />
        </FieldRow>
        <FieldRow label="Weekly OT Limit (hours)" hint="0 = no limit">
          <input className={inp} type="number" min={0} max={60} step={0.5} value={draft.weeklyOtLimitHours}
            onChange={(e) => set({ weeklyOtLimitHours: parseFloat(e.target.value) || 0 })} />
        </FieldRow>
        <FieldRow label="Max OT per Month (hours)" hint="0 = no cap">
          <input className={inp} type="number" min={0} max={100} step={0.5} value={draft.maxPerMonthHours}
            onChange={(e) => set({ maxPerMonthHours: parseFloat(e.target.value) || 0 })} />
        </FieldRow>
        <FieldRow label="OT Pay Rate (multiplier)">
          <select className={sel} value={String(draft.payMultiplier)}
            onChange={(e) => set({ payMultiplier: parseFloat(e.target.value) })}>
            {OT_RATE_OPTIONS.map((o) => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Carry Forward OT">
          <Toggle checked={draft.carryForwardOt} onChange={(v) => set({ carryForwardOt: v })} />
        </FieldRow>
      </SectionCard>

      {/* Approval workflow */}
      <SectionCard title="Approval Workflow" description="OT request routing and notifications">
        <FieldRow label="Approval Levels" hint="Fixed multi-stage chain applied to all OT requests.">
          <ApprovalChain value={draft.approvalWorkflow} onChange={(v) => set({ approvalWorkflow: v })} />
        </FieldRow>
        <FieldRow label="Require Reason on Submission">
          <Toggle checked={draft.requireReason} onChange={(v) => set({ requireReason: v })} />
        </FieldRow>
        <FieldRow label="Notify Manager on OT Request">
          <Toggle checked={draft.notifyManagerOnOtRequest} onChange={(v) => set({ notifyManagerOnOtRequest: v })} />
        </FieldRow>
      </SectionCard>
    </SettingsSection>
  )
}
