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

/* ── Style tokens ─────────────────────────────────────────────────────── */
const inputCls =
  'h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'
const selectCls =
  'h-10 w-full cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] disabled:opacity-50'
const textareaCls =
  'w-full min-h-[88px] rounded-none border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]'

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
    <div className="flex items-start justify-between gap-6 px-5 py-3.5">
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="w-64 shrink-0 min-w-0">{children}</div>
    </div>
  )
}

/* ── buildDraft ───────────────────────────────────────────────────────── */
function buildDraftFromSettings(s) {
  if (!s) return null
  return {
    companyName:               s.companyName ?? '',
    address:                   s.address ?? '',
    contactDetails:            s.contactDetails ?? '',
    country:                   s.country ?? '',
    timezone:                  s.timezone ?? 'UTC',
    financialYearStart:        s.financialYearStart ?? 'January 1',
    workingSelection:          workingDaysApiToSelection(s.workingDays),
    defaultWorkCalendar:       s.defaultWorkCalendar ?? 'Standard 9-6',
    regionalHolidaysEnabled:   Boolean(s.regionalHolidaysEnabled),
    multipleCalendarsEnabled:  Boolean(s.multipleCalendarsEnabled),
    defaultProbationPeriod:    s.defaultProbationPeriod ?? '2 months',
    defaultNoticePeriod:       s.defaultNoticePeriod ?? '30 days',
    autoAssignPolicies:        s.autoAssignPolicies !== false,
    logoUrl:                   s.logoUrl ?? '',
    locations:                 Array.isArray(s.locations) ? s.locations.join(', ') : '',
  }
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function GeneralSection({ registerToolbar }) {
  const { reload: reloadTimezone } = useTimezone()
  const { settings, loading, saving, uploadingLogo, error, save, uploadLogo } =
    useTenantAdminSettings()
  const [draft, setDraft]       = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [banner, setBanner]     = useState(null)
  const fileRef  = useRef(null)
  const didInit  = useRef(false)

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
        companyName:              draft.companyName,
        address:                  draft.address,
        contactDetails:           draft.contactDetails,
        country:                  draft.country,
        timezone:                 draft.timezone,
        financialYearStart:       draft.financialYearStart,
        workingDays:              selectionToWorkingDaysApi(draft.workingSelection),
        defaultWorkCalendar:      draft.defaultWorkCalendar,
        regionalHolidaysEnabled:  draft.regionalHolidaysEnabled,
        multipleCalendarsEnabled: draft.multipleCalendarsEnabled,
        defaultProbationPeriod:   draft.defaultProbationPeriod,
        defaultNoticePeriod:      draft.defaultNoticePeriod,
        autoAssignPolicies:       draft.autoAssignPolicies,
        locations:                draft.locations.split(',').map((s) => s.trim()).filter(Boolean),
      })
      if (res?.data) {
        const d = buildDraftFromSettings(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Settings saved successfully.' })
      reloadTimezone()
    } catch { /* surfaced via hook error */ }
  }, [draft, save, reloadTimezone])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty, saving, onSave: handleSave, onDiscard: resetDraft, disableSave: loading || !draft || saving || !dirty })
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
    } catch { /* hook sets error */ }
  }

  if (loading && !draft) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-none border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
        Loading general settings…
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700 shadow-sm">
        {error || 'Could not load settings.'}
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

      {/* ── Company Profile ───────────────────────────────────────────── */}
      <Card title="Company Profile" description="Basic identity and contact information for your organisation">

        <Field label="Company Name">
          <input
            placeholder="Enter company name"
            value={draft.companyName}
            onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label="Company Logo" hint="PNG, JPG · Max 2 MB">
          <div className="flex flex-wrap items-center gap-3">
            {draft.logoUrl ? (
              <img
                src={getTenantLogoAbsoluteUrl(draft.logoUrl)}
                alt="Company logo"
                className="h-12 w-32 rounded-none border border-slate-200 bg-slate-50 object-contain p-1"
              />
            ) : (
              <div className="flex h-12 w-32 items-center justify-center rounded-none border-2 border-dashed border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-400">
                No Logo
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogoPick} />
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center rounded-none border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {uploadingLogo ? 'Uploading…' : 'Change Logo'}
            </button>
          </div>
        </Field>

        <Field label="Company Address">
          <textarea
            rows={3}
            placeholder="e.g. 123 Main Street, Floor 5, Dubai"
            value={draft.address}
            onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
            className={textareaCls}
          />
        </Field>

        <Field label="Phone / Contact">
          <input
            placeholder="e.g. +971 4 123 4567"
            value={draft.contactDetails}
            onChange={(e) => setDraft((p) => ({ ...p, contactDetails: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label="Country">
          <input
            placeholder="e.g. United Arab Emirates"
            value={draft.country}
            onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label="Timezone">
          <select
            value={draft.timezone}
            onChange={(e) => setDraft((p) => ({ ...p, timezone: e.target.value }))}
            className={selectCls}
          >
            {TIMEZONE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>

        <Field label="Financial Year Start">
          <select
            value={draft.financialYearStart}
            onChange={(e) => setDraft((p) => ({ ...p, financialYearStart: e.target.value }))}
            className={selectCls}
          >
            {FINANCIAL_YEAR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>

        <Field label="Working Days">
          <div className="flex flex-wrap gap-1.5">
            {WORKING_DAY_SLOTS.map((slot, i) => (
              <button
                key={slot.code}
                type="button"
                title={slot.title}
                onClick={() => toggleWorkingDay(i)}
                className={`flex h-9 w-9 items-center justify-center rounded-none border text-xs font-semibold transition-colors ${
                  draft.workingSelection[i]
                    ? 'border-[#0F766E] bg-[#0F766E] text-white'
                    : 'border-slate-200 bg-slate-50/70 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Office Locations" hint="Comma-separated, e.g. Dubai, London, New York">
          <input
            placeholder="e.g. Dubai, Abu Dhabi, London"
            value={draft.locations}
            onChange={(e) => setDraft((p) => ({ ...p, locations: e.target.value }))}
            className={inputCls}
          />
        </Field>

      </Card>

    </div>
  )
}
