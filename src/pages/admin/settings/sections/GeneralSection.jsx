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
      setBanner({ type: 'ok', text: 'Administrative parameters synchronized.' })
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
      setBanner({ type: 'ok', text: 'Asset manifest updated: Brand identity synchronized.' })
    } catch {
      /* hook sets error */
    }
  }

  if (loading && !draft) {
    return (
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm font-bold uppercase tracking-widest">
        Syncing Global Parameters…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm font-medium">
        {error || 'Could not load settings.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {(banner?.type === 'ok' || error) && (
        <div
          className={`rounded-none px-4 py-3 text-[11px] font-bold uppercase tracking-widest ${
            banner?.type === 'ok'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
              : 'border border-red-100 bg-red-50 text-red-700'
          }`}
        >
          {banner?.type === 'ok' ? banner.text : error}
        </div>
      )}

      <div>
         <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Organization Profile</h2>
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Core Identity & Operational Constants</p>
      </div>

      <SectionCard title="A. Enterprise Architecture">
        <div className="divide-y divide-slate-50">
          <FieldRow label="Legal Entity Name">
            <TextInput
              value={draft.companyName}
              onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
              className="font-bold h-10 rounded-none border-slate-200"
            />
          </FieldRow>
          <FieldRow label="Identity Asset (Logo)" hint="PNG, JPG, SVG • Max 2MB">
            <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
              {draft.logoUrl ? (
                <div className="group relative">
                  <img
                    src={getTenantLogoAbsoluteUrl(draft.logoUrl)}
                    alt="Company logo"
                    className="h-12 w-32 border border-slate-200 bg-slate-50 object-contain p-1"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-32 items-center justify-center border-2 border-dashed border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  No Asset
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={onLogoPick} />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => fileRef.current?.click()}
                className="h-10 rounded-none border border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-xs"
              >
                {uploadingLogo ? 'Syncing...' : 'Update Asset'}
              </button>
            </div>
          </FieldRow>
          <FieldRow label="Registered Domicile(s)">
            <TextInput
              type="textarea"
              rows={3}
              placeholder="Primary HQ Address"
              value={draft.address}
              onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
              className="max-w-md font-medium rounded-none border-slate-200"
            />
          </FieldRow>
          <FieldRow label="Communications Hub">
            <TextInput
              placeholder="+971 …"
              value={draft.contactDetails}
              onChange={(e) => setDraft((p) => ({ ...p, contactDetails: e.target.value }))}
              className="font-mono h-10 rounded-none border-slate-200"
            />
          </FieldRow>
          <FieldRow label="Jurisdiction">
            <TextInput
              placeholder="Country"
              value={draft.country}
              onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))}
              className="font-bold h-10 rounded-none border-slate-200"
            />
          </FieldRow>
          <FieldRow label="Temporal Reference (Timezone)">
            <SelectInput
              options={TIMEZONE_OPTIONS}
              value={draft.timezone}
              onChange={(e) => setDraft((p) => ({ ...p, timezone: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Fiscal Cycle Inception">
            <SelectInput
              options={FINANCIAL_YEAR_OPTIONS}
              value={draft.financialYearStart}
              onChange={(e) => setDraft((p) => ({ ...p, financialYearStart: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Operational Week (Working Days)">
            <div className="flex flex-wrap justify-end gap-1.5">
              {WORKING_DAY_SLOTS.map((slot, i) => (
                <button
                  key={slot.code}
                  type="button"
                  title={slot.title}
                  onClick={() => toggleWorkingDay(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-none text-[10px] font-black transition-all border ${
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
          <FieldRow label="Distributed Nodes" hint="Comma-separated operational sites">
             <TextInput
                placeholder="e.g. Dubai, Abu Dhabi, London"
                value={draft.locations}
                onChange={(e) => setDraft((p) => ({ ...p, locations: e.target.value }))}
                className="font-medium h-10 rounded-none border-slate-200"
             />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="B. Calendar & Holiday Governance">
        <div className="divide-y divide-slate-50">
          <FieldRow label="Baseline Productivity Calendar">
            <SelectInput
              options={WORK_CALENDAR_OPTIONS}
              value={draft.defaultWorkCalendar}
              onChange={(e) => setDraft((p) => ({ ...p, defaultWorkCalendar: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Localized Observances (Regional Holidays)">
            <div className="flex h-10 items-center">
              <Toggle
                checked={draft.regionalHolidaysEnabled}
                onChange={(v) => setDraft((p) => ({ ...p, regionalHolidaysEnabled: v }))}
              />
            </div>
          </FieldRow>
          <FieldRow label="Multi-Branch Calendar Architecture">
            <div className="flex h-10 items-center">
              <Toggle
                checked={draft.multipleCalendarsEnabled}
                onChange={(v) => setDraft((p) => ({ ...p, multipleCalendarsEnabled: v }))}
              />
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="C. Talent Lifecycle Constants">
        <div className="divide-y divide-slate-50">
          <FieldRow label="Standard Probation Period">
            <SelectInput
              options={PROBATION_OPTIONS}
              value={draft.defaultProbationPeriod}
              onChange={(e) => setDraft((p) => ({ ...p, defaultProbationPeriod: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Standard Separation Notice">
            <SelectInput
              options={NOTICE_OPTIONS}
              value={draft.defaultNoticePeriod}
              onChange={(e) => setDraft((p) => ({ ...p, defaultNoticePeriod: e.target.value }))}
            />
          </FieldRow>
          <FieldRow label="Automated Policy Onboarding">
            <div className="flex h-10 items-center">
              <Toggle
                checked={draft.autoAssignPolicies}
                onChange={(v) => setDraft((p) => ({ ...p, autoAssignPolicies: v }))}
              />
            </div>
          </FieldRow>
        </div>
      </SectionCard>
    </div>
  )
}

