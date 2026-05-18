import { FieldRow, SectionCard, SelectInput } from './components/ui'
import { useSensitiveData } from '../../../hooks/settings/useSensitiveData'

const FALLBACK_VISA_ROLES = ['HR Admin', 'HR Executive', 'Manager', 'Employee']

const SALARY_ROWS = [
  { key: 'salaryBreakup', label: 'Salary Breakup' },
  { key: 'ctc', label: 'CTC' },
  { key: 'payslips', label: 'Payslips' },
  { key: 'revisions', label: 'Revisions' },
  { key: 'payrollReports', label: 'Payroll Reports' },
]

const DOC_ROWS = [
  { key: 'passportCopy', label: 'Passport Copy' },
  { key: 'visaCopy', label: 'Visa Copy' },
  { key: 'nationalId', label: 'National ID' },
  { key: 'medicalDocuments', label: 'Medical Documents' },
  { key: 'performanceIssues', label: 'Performance Issues' },
]

function visaAccessClass(level) {
  const s = String(level || '')
  if (s === 'Full Access') return 'text-emerald-600 font-bold'
  if (s === 'Hidden') return 'text-red-500 font-bold'
  if (s === 'Own info only') return 'text-amber-600 font-bold'
  if (s === 'Limited Access') return 'text-sky-600 font-bold'
  return 'text-slate-500 font-bold'
}

function mergeOptionList(options, extraValues) {
  const seen = new Set()
  const out = []
  for (const x of [...(options || []), ...extraValues]) {
    if (x == null || x === '') continue
    const s = String(x)
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

export default function SensitiveData() {
  const {
    settings,
    loading,
    saving,
    isDirty,
    error,
    salaryVisibilityOptions,
    documentVisibilityOptions,
    notesVisibilityOptions,
    roles,
    updateSalarySetting,
    updateDocVisibility,
    updateNotes,
    save,
    discard,
  } = useSensitiveData()

  const visaRoleRows = roles.length > 0 ? roles : FALLBACK_VISA_ROLES
  const visaMap = settings?.visaNationalityVisibility || {}

  if (loading && !settings) {
    return (
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm font-bold uppercase tracking-widest">
        Syncing Authorization Matrix…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm font-medium">
        {error || 'Could not load sensitive data settings.'}
      </div>
    )
  }

  const sd = settings.salaryDataVisibility
  const dv = settings.documentVisibility

  const salaryOptsMerged = mergeOptionList(salaryVisibilityOptions, [
    sd.salaryBreakup,
    sd.ctc,
    sd.payslips,
    sd.revisions,
    sd.payrollReports,
  ])
  const docOptsMerged = mergeOptionList(documentVisibilityOptions, [
    dv.passportCopy,
    dv.visaCopy,
    dv.nationalId,
    dv.medicalDocuments,
    dv.performanceIssues,
  ])
  const notesOptsMerged = mergeOptionList(notesVisibilityOptions, [settings.notesVisibility])

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div>
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security & Privacy</h2>
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Data Governance & Visibility Controls</p>
      </div>

      <SectionCard title="A. Compensation Architecture Visibility">
        <div className="divide-y divide-slate-50">
          {SALARY_ROWS.map(({ key, label }) => (
            <FieldRow key={key} label={label}>
              <SelectInput
                options={salaryOptsMerged}
                value={sd[key] ?? ''}
                onChange={(e) => updateSalarySetting(key, e.target.value)}
                disabled={saving}
              />
            </FieldRow>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="B. Immigration & Identification Access">
        <div className="divide-y divide-slate-50">
          {visaRoleRows.map((roleName) => {
            const access = visaMap[roleName] ?? '—'
            return (
              <FieldRow key={roleName} label={roleName}>
                <div className="flex h-10 items-center justify-end px-3">
                   <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 border border-slate-100 bg-slate-50/50 ${visaAccessClass(access)}`}>
                      {access}
                   </span>
                </div>
              </FieldRow>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="C. Confidential Documentation">
        <div className="divide-y divide-slate-50">
          {DOC_ROWS.map(({ key, label }) => (
            <FieldRow key={key} label={label}>
              <SelectInput
                options={docOptsMerged}
                value={dv[key] ?? ''}
                onChange={(e) => updateDocVisibility(key, e.target.value)}
                disabled={saving}
              />
            </FieldRow>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="D. Behavioral & Disciplinary Records">
        <FieldRow label="Governance Visibility">
          <SelectInput
            options={notesOptsMerged}
            value={settings.notesVisibility ?? ''}
            onChange={(e) => updateNotes(e.target.value)}
            disabled={saving}
          />
        </FieldRow>
      </SectionCard>

      {isDirty ? (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 border-t border-slate-200 bg-white px-8 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-full duration-500">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-none bg-[#0F766E] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Data Sovereignty Modifications Pending
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => discard()}
                className="h-10 rounded-none border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                Discard Changes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save()}
                className="h-10 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] disabled:opacity-40 shadow-lg"
              >
                {saving ? 'Synchronizing…' : 'Apply Governance'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

