import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchPayrollPolicySettings, updatePayrollPolicySettings } from '../../../../services/payrollPolicyService'
import {
  FieldRow,
  SectionCard,
  SettingsBanner,
  SettingsError,
  SettingsLoading,
  SettingsSection,
  Toggle,
} from '../components/ui'

const PAY_PERIOD_OPTIONS = ['Monthly', 'Bi-weekly', 'Weekly']
const APPROVAL_WORKFLOW_OPTIONS = ['HR Only', 'HR + Finance', 'Auto Approve']
const ROUND_OFF_OPTIONS = ['Nearest Rupee', 'Exact (no rounding)', 'Round Up', 'Round Down']
const TAX_REGIME_OPTIONS = ['New Regime (Default)', 'Old Regime', 'Employee Choice']
const PF_BASIS_OPTIONS = ['Basic Salary', 'Gross Salary', 'CTC']

const DEFAULT_SETTINGS = {
  payPeriod: 'Monthly',
  payDay: 5,
  approvalWorkflow: 'HR Only',
  roundOff: 'Nearest Rupee',
  pfApplicable: true,
  pfRate: 12,
  pfBasis: 'Basic Salary',
  pfEmployerContribution: true,
  esiApplicable: true,
  esiEmployeeRate: 0.75,
  esiEmployerRate: 3.25,
  esiGrossLimit: 21000,
  taxRegime: 'New Regime (Default)',
  includeOtInPayroll: true,
  lopDeductionEnabled: true,
  lopCalculationBasis: 'Calendar days',
  leaveEncashmentEnabled: false,
  advanceRecoveryEnabled: true,
  lockPayrollAfterFinalize: true,
  autoPublishPayslips: false,
  payslipPasswordProtected: false,
  payslipPasswordFormat: 'DOB (DDMMYYYY)',
}

const sel =
  'h-9 w-full max-w-[240px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
const inp =
  'h-9 w-full max-w-[140px] rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'

export default function PayrollPolicySettings({ registerToolbar }) {
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [banner, setBanner] = useState(null)
  const savedSettings = useRef(null)

  useEffect(() => {
    setLoading(true)
    fetchPayrollPolicySettings()
      .then((data) => {
        const merged = { ...DEFAULT_SETTINGS, ...(data || {}) }
        savedSettings.current = merged
        setDraft(merged)
        setBaseline(JSON.stringify(merged))
      })
      .catch(() => {
        savedSettings.current = DEFAULT_SETTINGS
        setDraft(DEFAULT_SETTINGS)
        setBaseline(JSON.stringify(DEFAULT_SETTINGS))
      })
      .finally(() => setLoading(false))
  }, [])

  const dirty = useMemo(() => {
    if (!draft || baseline === null) return false
    return JSON.stringify(draft) !== baseline
  }, [draft, baseline])

  const reset = useCallback(() => {
    if (!savedSettings.current) return
    setDraft({ ...savedSettings.current })
    setBaseline(JSON.stringify(savedSettings.current))
    setBanner(null)
  }, [])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setBanner(null)
    setSaving(true)
    setError(null)
    try {
      const res = await updatePayrollPolicySettings(draft)
      const merged = { ...DEFAULT_SETTINGS, ...(res || {}), ...draft }
      savedSettings.current = merged
      setDraft(merged)
      setBaseline(JSON.stringify(merged))
      setBanner({ type: 'ok', text: 'Payroll policy saved.' })
    } catch (e) {
      setError(e.message || 'Failed to save payroll settings')
    } finally {
      setSaving(false)
    }
  }, [draft])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty, saving, onSave: handleSave, onDiscard: reset, disableSave: loading || !draft || saving || !dirty })
    return () => registerToolbar(null)
  }, [registerToolbar, dirty, saving, handleSave, reset, loading, draft])

  const set = (partial) => setDraft((p) => p ? { ...p, ...partial } : p)

  if (loading && !draft) return <SettingsLoading message="Loading payroll policy settings…" />
  if (!draft) return <SettingsError message={error || 'Could not load payroll settings.'} />

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      {/* General payroll */}
      <SectionCard title="General Payroll Settings" description="Core payroll processing configuration">
        <FieldRow label="Pay Period">
          <select className={sel} value={draft.payPeriod}
            onChange={(e) => set({ payPeriod: e.target.value })}>
            {PAY_PERIOD_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Pay Day (1–31)" hint="Day of month salaries are disbursed">
          <input className={inp} type="number" min={1} max={31} value={draft.payDay}
            onChange={(e) => set({ payDay: parseInt(e.target.value, 10) || 1 })} />
        </FieldRow>
        <FieldRow label="Approval Workflow">
          <select className={sel} value={draft.approvalWorkflow}
            onChange={(e) => set({ approvalWorkflow: e.target.value })}>
            {APPROVAL_WORKFLOW_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Round Off">
          <select className={sel} value={draft.roundOff}
            onChange={(e) => set({ roundOff: e.target.value })}>
            {ROUND_OFF_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Lock Payroll After Finalize">
          <Toggle checked={draft.lockPayrollAfterFinalize}
            onChange={(v) => set({ lockPayrollAfterFinalize: v })} />
        </FieldRow>
        <FieldRow label="Include OT in Payroll Run">
          <Toggle checked={draft.includeOtInPayroll}
            onChange={(v) => set({ includeOtInPayroll: v })} />
        </FieldRow>
      </SectionCard>

      {/* PF */}
      <SectionCard title="Provident Fund (PF)" description="PF deduction and employer contribution">
        <FieldRow label="PF Applicable">
          <Toggle checked={draft.pfApplicable} onChange={(v) => set({ pfApplicable: v })} />
        </FieldRow>
        <FieldRow label="PF Rate (%)">
          <input className={inp} type="number" min={1} max={20} step={0.5}
            value={draft.pfRate} disabled={!draft.pfApplicable}
            onChange={(e) => set({ pfRate: parseFloat(e.target.value) || 12 })} />
        </FieldRow>
        <FieldRow label="PF Calculated On">
          <select className={sel} value={draft.pfBasis} disabled={!draft.pfApplicable}
            onChange={(e) => set({ pfBasis: e.target.value })}>
            {PF_BASIS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Include Employer Contribution">
          <Toggle checked={draft.pfEmployerContribution} disabled={!draft.pfApplicable}
            onChange={(v) => set({ pfEmployerContribution: v })} />
        </FieldRow>
      </SectionCard>

      {/* ESI */}
      <SectionCard title="Employee State Insurance (ESI)" description="ESI deduction thresholds and rates">
        <FieldRow label="ESI Applicable">
          <Toggle checked={draft.esiApplicable} onChange={(v) => set({ esiApplicable: v })} />
        </FieldRow>
        <FieldRow label="ESI Employee Rate (%)" hint="Standard: 0.75%">
          <input className={inp} type="number" min={0} max={5} step={0.01}
            value={draft.esiEmployeeRate} disabled={!draft.esiApplicable}
            onChange={(e) => set({ esiEmployeeRate: parseFloat(e.target.value) || 0.75 })} />
        </FieldRow>
        <FieldRow label="ESI Employer Rate (%)" hint="Standard: 3.25%">
          <input className={inp} type="number" min={0} max={10} step={0.01}
            value={draft.esiEmployerRate} disabled={!draft.esiApplicable}
            onChange={(e) => set({ esiEmployerRate: parseFloat(e.target.value) || 3.25 })} />
        </FieldRow>
        <FieldRow label="ESI Gross Limit (₹)" hint="Employees above this are exempt">
          <input className={inp} type="number" min={0} max={100000} step={1000}
            value={draft.esiGrossLimit} disabled={!draft.esiApplicable}
            onChange={(e) => set({ esiGrossLimit: parseInt(e.target.value, 10) || 21000 })} />
        </FieldRow>
      </SectionCard>

      {/* Tax */}
      <SectionCard title="Tax Settings" description="Income tax regime and deduction rules">
        <FieldRow label="Default Tax Regime">
          <select className={sel} value={draft.taxRegime}
            onChange={(e) => set({ taxRegime: e.target.value })}>
            {TAX_REGIME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
      </SectionCard>

      {/* LOP & deductions */}
      <SectionCard title="LOP & Deductions" description="Loss of pay and advance recovery rules">
        <FieldRow label="LOP Deduction Enabled">
          <Toggle checked={draft.lopDeductionEnabled}
            onChange={(v) => set({ lopDeductionEnabled: v })} />
        </FieldRow>
        <FieldRow label="LOP Calculation Basis">
          <select className={sel} value={draft.lopCalculationBasis}
            onChange={(e) => set({ lopCalculationBasis: e.target.value })}>
            <option>Calendar days</option>
            <option>Working days</option>
          </select>
        </FieldRow>
        <FieldRow label="Advance Recovery Enabled">
          <Toggle checked={draft.advanceRecoveryEnabled}
            onChange={(v) => set({ advanceRecoveryEnabled: v })} />
        </FieldRow>
        <FieldRow label="Leave Encashment Enabled">
          <Toggle checked={draft.leaveEncashmentEnabled}
            onChange={(v) => set({ leaveEncashmentEnabled: v })} />
        </FieldRow>
      </SectionCard>

      {/* Payslip */}
      <SectionCard title="Payslip Settings" description="Payslip delivery and security options">
        <FieldRow label="Auto Publish Payslips on Finalize">
          <Toggle checked={draft.autoPublishPayslips}
            onChange={(v) => set({ autoPublishPayslips: v })} />
        </FieldRow>
        <FieldRow label="Password-Protect Payslip PDF">
          <Toggle checked={draft.payslipPasswordProtected}
            onChange={(v) => set({ payslipPasswordProtected: v })} />
        </FieldRow>
        {draft.payslipPasswordProtected && (
          <FieldRow label="Password Format" hint="Used to generate per-employee PDF password">
            <select className={sel} value={draft.payslipPasswordFormat}
              onChange={(e) => set({ payslipPasswordFormat: e.target.value })}>
              <option>DOB (DDMMYYYY)</option>
              <option>Employee Code</option>
              <option>Last 4 digits of phone</option>
            </select>
          </FieldRow>
        )}
      </SectionCard>
    </SettingsSection>
  )
}
