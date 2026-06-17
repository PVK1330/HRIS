import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchPayrollPolicySettings, updatePayrollPolicySettings } from '../../../../services/payrollPolicyService'

const PAY_PERIOD_OPTIONS    = ['Monthly', 'Bi-weekly', 'Weekly']
const APPROVAL_WF_OPTIONS   = ['HR Only', 'HR + Finance', 'Auto Approve']
const ROUND_OFF_OPTIONS     = ['Nearest Rupee', 'Exact (no rounding)', 'Round Up', 'Round Down']
const TAX_REGIME_OPTIONS    = ['New Regime (Default)', 'Old Regime', 'Employee Choice']
const PF_BASIS_OPTIONS      = ['Basic Salary', 'Gross Salary', 'CTC']
const LOP_BASIS_OPTIONS     = ['Calendar days', 'Working days']
const PAYSLIP_PWD_OPTIONS   = ['DOB (DDMMYYYY)', 'Employee Code', 'Last 4 digits of phone']

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

/* ── Style tokens ─────────────────────────────────────────────────────── */
const inputCls =
  'h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'
const selectCls =
  'h-10 cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'

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
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
  )
}

function Unit({ children }) {
  return <span className="text-sm font-medium text-slate-400">{children}</span>
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function PayrollPolicySettings({ registerToolbar }) {
  const [draft, setDraft]     = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [banner, setBanner]   = useState(null)
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

  if (loading && !draft) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading payroll policy settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load payroll settings.'}
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

      {/* ── General ───────────────────────────────────────────────────── */}
      <Card title="General Payroll Settings" description="Core payroll processing configuration">
        <Field label="Pay Period">
          <select className={`${selectCls} w-44`} value={draft.payPeriod} onChange={(e) => set({ payPeriod: e.target.value })}>
            {PAY_PERIOD_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Pay Day" hint="Day of the month salaries are disbursed">
          <input type="number" min={1} max={31} value={draft.payDay}
            onChange={(e) => set({ payDay: parseInt(e.target.value, 10) || 1 })}
            className={`${inputCls} w-24`} />
        </Field>
        <Field label="Approval Workflow">
          <select className={`${selectCls} w-44`} value={draft.approvalWorkflow} onChange={(e) => set({ approvalWorkflow: e.target.value })}>
            {APPROVAL_WF_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Round Off">
          <select className={`${selectCls} w-52`} value={draft.roundOff} onChange={(e) => set({ roundOff: e.target.value })}>
            {ROUND_OFF_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Lock Payroll After Finalize">
          <Toggle checked={draft.lockPayrollAfterFinalize} onChange={(v) => set({ lockPayrollAfterFinalize: v })} />
        </Field>
        <Field label="Include OT in Payroll Run">
          <Toggle checked={draft.includeOtInPayroll} onChange={(v) => set({ includeOtInPayroll: v })} />
        </Field>
      </Card>

      {/* ── Provident Fund ────────────────────────────────────────────── */}
      <Card title="Provident Fund (PF)" description="PF deduction and employer contribution">
        <Field label="PF Applicable">
          <Toggle checked={draft.pfApplicable} onChange={(v) => set({ pfApplicable: v })} />
        </Field>
        <Field label="PF Rate">
          <input type="number" min={1} max={20} step={0.5}
            value={draft.pfRate} disabled={!draft.pfApplicable}
            onChange={(e) => set({ pfRate: parseFloat(e.target.value) || 12 })}
            className={`${inputCls} w-24`} />
          <Unit>%</Unit>
        </Field>
        <Field label="PF Calculated On">
          <select className={`${selectCls} w-44`} value={draft.pfBasis} disabled={!draft.pfApplicable}
            onChange={(e) => set({ pfBasis: e.target.value })}>
            {PF_BASIS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Include Employer Contribution">
          <Toggle checked={draft.pfEmployerContribution} disabled={!draft.pfApplicable}
            onChange={(v) => set({ pfEmployerContribution: v })} />
        </Field>
      </Card>

      {/* ── ESI ───────────────────────────────────────────────────────── */}
      <Card title="Employee State Insurance (ESI)" description="ESI deduction thresholds and rates">
        <Field label="ESI Applicable">
          <Toggle checked={draft.esiApplicable} onChange={(v) => set({ esiApplicable: v })} />
        </Field>
        <Field label="ESI Employee Rate" hint="Standard: 0.75%">
          <input type="number" min={0} max={5} step={0.01}
            value={draft.esiEmployeeRate} disabled={!draft.esiApplicable}
            onChange={(e) => set({ esiEmployeeRate: parseFloat(e.target.value) || 0.75 })}
            className={`${inputCls} w-24`} />
          <Unit>%</Unit>
        </Field>
        <Field label="ESI Employer Rate" hint="Standard: 3.25%">
          <input type="number" min={0} max={10} step={0.01}
            value={draft.esiEmployerRate} disabled={!draft.esiApplicable}
            onChange={(e) => set({ esiEmployerRate: parseFloat(e.target.value) || 3.25 })}
            className={`${inputCls} w-24`} />
          <Unit>%</Unit>
        </Field>
        <Field label="ESI Gross Limit" hint="Employees above this gross salary are exempt">
          <input type="number" min={0} max={100000} step={1000}
            value={draft.esiGrossLimit} disabled={!draft.esiApplicable}
            onChange={(e) => set({ esiGrossLimit: parseInt(e.target.value, 10) || 21000 })}
            className={`${inputCls} w-28`} />
          <Unit>₹</Unit>
        </Field>
      </Card>

      {/* ── Tax ───────────────────────────────────────────────────────── */}
      <Card title="Tax Settings" description="Income tax regime and deduction rules">
        <Field label="Default Tax Regime">
          <select className={`${selectCls} w-52`} value={draft.taxRegime}
            onChange={(e) => set({ taxRegime: e.target.value })}>
            {TAX_REGIME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </Card>

      {/* ── LOP & Deductions ──────────────────────────────────────────── */}
      <Card title="LOP & Deductions" description="Loss of pay and advance recovery rules">
        <Field label="LOP Deduction Enabled">
          <Toggle checked={draft.lopDeductionEnabled} onChange={(v) => set({ lopDeductionEnabled: v })} />
        </Field>
        <Field label="LOP Calculation Basis">
          <select className={`${selectCls} w-44`} value={draft.lopCalculationBasis}
            onChange={(e) => set({ lopCalculationBasis: e.target.value })}>
            {LOP_BASIS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Advance Recovery Enabled">
          <Toggle checked={draft.advanceRecoveryEnabled} onChange={(v) => set({ advanceRecoveryEnabled: v })} />
        </Field>
        <Field label="Leave Encashment Enabled">
          <Toggle checked={draft.leaveEncashmentEnabled} onChange={(v) => set({ leaveEncashmentEnabled: v })} />
        </Field>
      </Card>

      {/* ── Payslip ───────────────────────────────────────────────────── */}
      <Card title="Payslip Settings" description="Payslip delivery and security options">
        <Field label="Auto Publish Payslips on Finalize">
          <Toggle checked={draft.autoPublishPayslips} onChange={(v) => set({ autoPublishPayslips: v })} />
        </Field>
        <Field label="Password-Protect Payslip PDF">
          <Toggle checked={draft.payslipPasswordProtected} onChange={(v) => set({ payslipPasswordProtected: v })} />
        </Field>
        {draft.payslipPasswordProtected && (
          <Field label="Password Format" hint="Used to generate per-employee PDF password">
            <select className={`${selectCls} w-52`} value={draft.payslipPasswordFormat}
              onChange={(e) => set({ payslipPasswordFormat: e.target.value })}>
              {PAYSLIP_PWD_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        )}
      </Card>

    </div>
  )
}
