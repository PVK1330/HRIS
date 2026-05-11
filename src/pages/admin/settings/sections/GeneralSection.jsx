import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { FieldRow, SectionCard, SelectInput, TextInput, Toggle } from '../components/ui'

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
      setBanner({ type: 'ok', text: 'Logo uploaded successfully.' })
    } catch {
      /* hook sets error */
    }
  }

  if (loading && !draft) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
        Loading tenant settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Could not load settings.'}
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

      <SectionCard title="A. Company Information">
        <FieldRow label="Company Name">
          <TextInput
            value={draft.companyName}
            onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
          />
        </FieldRow>
        <FieldRow label="Logo" hint="PNG, JPG or SVG, max 2MB">
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            {draft.logoUrl ? (
              <img
                src={getTenantLogoAbsoluteUrl(draft.logoUrl)}
                alt="Company logo"
                className="h-10 max-w-[140px] rounded border border-gray-100 object-contain"
              />
            ) : null}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={onLogoPick} />
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={() => fileRef.current?.click()}
              className="h-8 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
            </button>
          </div>
        </FieldRow>
        <FieldRow label="Address(es)">
          <TextInput
            type="textarea"
            rows={3}
            placeholder="Enter address"
            value={draft.address}
            onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
            className="max-w-md"
          />
        </FieldRow>
        <FieldRow label="Contact Details">
          <TextInput
            placeholder="+971 …"
            value={draft.contactDetails}
            onChange={(e) => setDraft((p) => ({ ...p, contactDetails: e.target.value }))}
          />
        </FieldRow>
        <FieldRow label="Country">
          <TextInput
            placeholder="Country"
            value={draft.country}
            onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))}
          />
        </FieldRow>
        <FieldRow label="Time zone">
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
        <FieldRow label="Working Days of the Week">
          <div className="flex flex-wrap justify-end gap-1">
            {WORKING_DAY_SLOTS.map((slot, i) => (
              <button
                key={slot.code}
                type="button"
                title={slot.title}
                onClick={() => toggleWorkingDay(i)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  draft.workingSelection[i]
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Regional Locations" hint="Comma separated list (e.g. Dubai, Abu Dhabi, London)">
           <TextInput
              placeholder="e.g. Dubai, Abu Dhabi, London"
              value={draft.locations}
              onChange={(e) => setDraft((p) => ({ ...p, locations: e.target.value }))}
           />
        </FieldRow>
      </SectionCard>

      <SectionCard title="B. Work Calendars">
        <FieldRow label="Default Work Calendar">
          <SelectInput
            options={WORK_CALENDAR_OPTIONS}
            value={draft.defaultWorkCalendar}
            onChange={(e) => setDraft((p) => ({ ...p, defaultWorkCalendar: e.target.value }))}
          />
        </FieldRow>
        <FieldRow label="Regional Holidays" hint="Links to holiday setup module">
          <Toggle
            checked={draft.regionalHolidaysEnabled}
            onChange={(v) => setDraft((p) => ({ ...p, regionalHolidaysEnabled: v }))}
          />
        </FieldRow>
        <FieldRow label="Multiple Calendars (Branches)" hint="Allow different calendars per branch">
          <Toggle
            checked={draft.multipleCalendarsEnabled}
            onChange={(v) => setDraft((p) => ({ ...p, multipleCalendarsEnabled: v }))}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="C. Others">
        <FieldRow label="Default Probation Period">
          <SelectInput
            options={PROBATION_OPTIONS}
            value={draft.defaultProbationPeriod}
            onChange={(e) => setDraft((p) => ({ ...p, defaultProbationPeriod: e.target.value }))}
          />
        </FieldRow>
        <FieldRow label="Default Notice Period">
          <SelectInput
            options={NOTICE_OPTIONS}
            value={draft.defaultNoticePeriod}
            onChange={(e) => setDraft((p) => ({ ...p, defaultNoticePeriod: e.target.value }))}
          />
        </FieldRow>
        <FieldRow label="Auto-assign Policies to New Employees">
          <Toggle
            checked={draft.autoAssignPolicies}
            onChange={(v) => setDraft((p) => ({ ...p, autoAssignPolicies: v }))}
          />
        </FieldRow>
      </SectionCard>
    </div>
  )
}
