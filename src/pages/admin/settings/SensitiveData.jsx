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
  if (s === 'Full Access') return 'text-green-600 font-medium'
  if (s === 'Hidden') return 'text-red-500 font-medium'
  if (s === 'Own info only') return 'text-yellow-600 font-medium'
  if (s === 'Limited Access') return 'text-blue-600 font-medium'
  return 'text-gray-500 font-medium'
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
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading sensitive data settings…
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-red-700">
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
    <div className="space-y-5 pb-24">
      <SectionCard title="A. Salary Data Visibility">
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
      </SectionCard>

      <SectionCard title="B. Visa & Nationality Visibility">
        {visaRoleRows.map((roleName) => {
          const access = visaMap[roleName] ?? '—'
          return (
            <FieldRow key={roleName} label={roleName}>
              <span className={`text-sm ${visaAccessClass(access)}`}>{access}</span>
            </FieldRow>
          )
        })}
      </SectionCard>

      <SectionCard title="C. Document Visibility">
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
      </SectionCard>

      <SectionCard title="D. Notes / Disciplinary Visibility">
        <FieldRow label="Notes Visibility">
          <SelectInput
            options={notesOptsMerged}
            value={settings.notesVisibility ?? ''}
            onChange={(e) => updateNotes(e.target.value)}
            disabled={saving}
          />
        </FieldRow>
      </SectionCard>

      {isDirty ? (
        <div className="fixed bottom-0 left-60 right-0 z-10 border-t border-gray-200 bg-white px-8 py-3 shadow-[0_-4px_12px_-2px_rgb(0_0_0/0.06)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-emerald-700">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              DATA GOVERNANCE SYNCED
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => discard()}
                className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save()}
                className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
