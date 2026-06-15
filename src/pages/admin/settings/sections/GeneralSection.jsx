import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTimezone } from '../../../../context/TimezoneContext.jsx'
import { useTenantAdminSettings } from '../../../../hooks/useTenantAdminSettings'
import { getTenantLogoAbsoluteUrl } from '../../../../services/tenantAdminSettingsService'
import {
  FINANCIAL_YEAR_OPTIONS,
  NOTICE_OPTIONS,
  PROBATION_OPTIONS,
  TIMEZONE_OPTIONS,
  WORK_CALENDAR_OPTIONS,
  WORKING_DAY_SLOTS,
  selectionToWorkingDaysApi,
  workingDaysApiToSelection,
} from '../constants'
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

function buildDraftFromSettings(s) {
  if (!s) return null
  return {
    companyName: s.companyName ?? '',
    address: s.address ?? '',
    contactDetails: s.contactDetails ?? '',
    country: s.country ?? '',
    timezone: s.timezone ?? 'UTC',
    financialYearStart: s.financialYearStart ?? 'January 1',
    workingSelection: workingDaysApiToSelection(s.workingDays),
    defaultWorkCalendar: s.defaultWorkCalendar ?? 'Standard 9-6',
    regionalHolidaysEnabled: Boolean(s.regionalHolidaysEnabled),
    multipleCalendarsEnabled: Boolean(s.multipleCalendarsEnabled),
    defaultProbationPeriod: s.defaultProbationPeriod ?? '2 months',
    defaultNoticePeriod: s.defaultNoticePeriod ?? '30 days',
    autoAssignPolicies: s.autoAssignPolicies !== false,
    logoUrl: s.logoUrl ?? '',
    locations: Array.isArray(s.locations) ? s.locations.join(', ') : '',
  }
}

export default function GeneralSection({ registerToolbar }) {
  const { reload: reloadTimezone } = useTimezone()
  const { settings, loading, saving, uploadingLogo, error, save, uploadLogo } =
    useTenantAdminSettings()
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [banner, setBanner] = useState(null)
  const fileRef = useRef(null)
  const didInit = useRef(false)

  useEffect(() => {
    if (!settings || didInit.current) return
    didInit.current = true
    const d = buildDraftFromSettings(settings)
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
    const d = buildDraftFromSettings(settings)
    setDraft(d)
    setBaseline(JSON.stringify(d))
    setBanner(null)
  }, [settings])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setBanner(null)
    try {
      const res = await save({
        companyName: draft.companyName,
        address: draft.address,
        contactDetails: draft.contactDetails,
        country: draft.country,
        timezone: draft.timezone,
        financialYearStart: draft.financialYearStart,
        workingDays: selectionToWorkingDaysApi(draft.workingSelection),
        defaultWorkCalendar: draft.defaultWorkCalendar,
        regionalHolidaysEnabled: draft.regionalHolidaysEnabled,
        multipleCalendarsEnabled: draft.multipleCalendarsEnabled,
        defaultProbationPeriod: draft.defaultProbationPeriod,
        defaultNoticePeriod: draft.defaultNoticePeriod,
        autoAssignPolicies: draft.autoAssignPolicies,
        locations: draft.locations.split(',').map(s => s.trim()).filter(Boolean),
      })
      if (res?.data) {
        const d = buildDraftFromSettings(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Settings saved successfully.' })
      reloadTimezone()
    } catch {
      /* surfaced via hook error */
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

  const toggleWorkingDay = (index) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = [...prev.workingSelection]
      next[index] = !next[index]
      return { ...prev, workingSelection: next }
    })
  }

  const onLogoPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBanner(null)
    try {
      const res = await uploadLogo(file)
      const url = res?.data?.logoUrl
      if (url) {
        setDraft((p) => {
          if (!p) return p
          const next = { ...p, logoUrl: url }
          setBaseline(JSON.stringify(next))
          return next
        })
      }
      setBanner({ type: 'ok', text: 'Company logo updated successfully.' })
    } catch {
      /* hook sets error */
    }
  }

  if (loading && !draft) {
    return <SettingsLoading message="Loading general settings…" />
  }

  if (!draft) {
    return <SettingsError message={error || 'Could not load settings.'} />
  }

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      <SectionCard title="Company Profile">
        <FieldRow label="Company Name">
          <TextInput
            placeholder="Enter company name"
            value={draft.companyName}
            onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
          />
        </FieldRow>

        <FieldRow label="Company Logo" hint="PNG, JPG · Max 2 MB">
          <div className="flex flex-wrap items-center gap-3">
            {draft.logoUrl ? (
              <img
                src={getTenantLogoAbsoluteUrl(draft.logoUrl)}
                alt="Company logo"
                className="h-12 w-32 border border-slate-200 bg-slate-50 object-contain p-1"
              />
            ) : (
              <div className="flex h-12 w-32 items-center justify-center border-2 border-dashed border-slate-100 bg-slate-50/50 text-xs text-slate-400">
                No Logo
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogoPick} />
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={() => fileRef.current?.click()}
              className="h-8 rounded-none border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {uploadingLogo ? 'Uploading...' : 'Change Logo'}
            </button>
          </div>
        </FieldRow>

        <FieldRow label="Company Address">
          <TextInput
            type="textarea"
            rows={3}
            placeholder="e.g. 123 Main Street, Floor 5, Dubai"
            value={draft.address}
            onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
          />
        </FieldRow>

        <FieldRow label="Phone / Contact">
          <TextInput
            placeholder="e.g. +971 4 123 4567"
            value={draft.contactDetails}
            onChange={(e) => setDraft((p) => ({ ...p, contactDetails: e.target.value }))}
          />
        </FieldRow>

        <FieldRow label="Country">
          <TextInput
            placeholder="e.g. United Arab Emirates"
            value={draft.country}
            onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))}
          />
        </FieldRow>

        <FieldRow label="Timezone">
          <SelectInput
            options={TIMEZONE_OPTIONS}
            value={draft.timezone}
            onChange={(e) => setDraft((p) => ({ ...p, timezone: e.target.value }))}
          />
        </FieldRow>

        <FieldRow label="Financial Year Start">
          <SelectInput
            options={FINANCIAL_YEAR_OPTIONS}
            value={draft.financialYearStart}
            onChange={(e) => setDraft((p) => ({ ...p, financialYearStart: e.target.value }))}
          />
        </FieldRow>

        <FieldRow label="Working Days">
          <div className="flex flex-wrap justify-end gap-1.5">
            {WORKING_DAY_SLOTS.map((slot, i) => (
              <button
                key={slot.code}
                type="button"
                title={slot.title}
                onClick={() => toggleWorkingDay(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-none text-xs font-semibold transition-all border ${
                  draft.workingSelection[i]
                    ? 'border-[#0F766E] bg-[#0F766E] text-white shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Office Locations" hint="Comma-separated, e.g. Dubai, London, New York">
          <TextInput
            placeholder="e.g. Dubai, Abu Dhabi, London"
            value={draft.locations}
            onChange={(e) => setDraft((p) => ({ ...p, locations: e.target.value }))}
          />
        </FieldRow>
      </SectionCard>

    </SettingsSection>
  )
}
