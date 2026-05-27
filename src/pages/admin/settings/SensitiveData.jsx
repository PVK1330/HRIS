import { useEffect } from 'react'
import {
  FieldRow,
  SectionCard,
  SelectInput,
  SettingsError,
  SettingsLoading,
  SettingsSection,
} from './components/ui'
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

export default function SensitiveData({ registerToolbar }) {
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

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({
      dirty: isDirty,
      saving,
      onSave: save,
      onDiscard: discard,
      disableSave: saving || !isDirty,
    })
    return () => registerToolbar(null)
  }, [registerToolbar, isDirty, saving, save, discard])

  if (loading && !settings) {
    return <SettingsLoading message="Loading sensitive data settings…" />
  }

  if (!settings) {
    return <SettingsError message={error || 'Could not load sensitive data settings.'} />
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
    <SettingsSection>
      <SectionCard title="Compensation visibility">
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

      <SectionCard title="Immigration & identification access" columns={['Role', 'Access level']}>
        {visaRoleRows.map((roleName) => {
          const access = visaMap[roleName] ?? '—'
          return (
            <FieldRow key={roleName} label={roleName} align="center">
              <span className={`inline-flex items-center rounded-none border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-semibold ${visaAccessClass(access)}`}>
                {access}
              </span>
            </FieldRow>
          )
        })}
      </SectionCard>

      <SectionCard title="Confidential documentation">
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

      <SectionCard title="Behavioral & disciplinary records">
        <FieldRow label="Notes visibility">
          <SelectInput
            options={notesOptsMerged}
            value={settings.notesVisibility ?? ''}
            onChange={(e) => updateNotes(e.target.value)}
            disabled={saving}
          />
        </FieldRow>
      </SectionCard>
    </SettingsSection>
  )
}

