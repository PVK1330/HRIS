import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchGeoFenceSettings, updateGeoFenceSettings } from '../../../../services/geoFenceSettingsService'
import {
  FieldRow,
  SectionCard,
  SettingsBanner,
  SettingsError,
  SettingsLoading,
  SettingsSection,
  Toggle,
} from '../components/ui'

const GPS_ACCURACY_OPTIONS = [
  { label: '10 m (High precision)', value: 10 },
  { label: '25 m (Precise)', value: 25 },
  { label: '50 m (Standard)', value: 50 },
  { label: '100 m (Lenient)', value: 100 },
  { label: '200 m (Very lenient)', value: 200 },
]

const GPS_FAILURE_OPTIONS = ['Block check-in', 'Mark as violation', 'Allow with flag']
const VALIDATION_MODE_OPTIONS = ['Strict (block outside fence)', 'Lenient (flag only)', 'Disabled']

const DEFAULT_SETTINGS = {
  geoFencingEnabled: true,
  defaultRadiusMeters: 200,
  requiredGpsAccuracyMeters: 50,
  requireSelfieOnCheckin: false,
  requireSelfieOnCheckout: false,
  allowCheckinOutsideFence: false,
  outsideFenceAction: 'Mark as violation',
  validationMode: 'Strict (block outside fence)',
  gpsFailureHandling: 'Mark as violation',
  trackGpsThroughoutDay: false,
  autoResolveViolationsAfterHours: 24,
  notifyHrOnViolation: true,
  notifyManagerOnViolation: false,
  allowManualOverrideByHr: true,
  maxDistanceAlertMeters: 500,
  multiLocationSupport: true,
}

const sel =
  'h-9 w-full max-w-[240px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
const inp =
  'h-9 w-full max-w-[140px] rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'

export default function GeoFencingSettings({ registerToolbar }) {
  const [settings, setSettings] = useState(null)
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [banner, setBanner] = useState(null)
  const didInit = useRef(false)

  useEffect(() => {
    setLoading(true)
    fetchGeoFenceSettings()
      .then((data) => {
        const merged = { ...DEFAULT_SETTINGS, ...(data || {}) }
        setSettings(merged)
        setDraft(merged)
        setBaseline(JSON.stringify(merged))
        didInit.current = true
      })
      .catch(() => {
        // API not yet wired — use defaults
        setSettings(DEFAULT_SETTINGS)
        setDraft(DEFAULT_SETTINGS)
        setBaseline(JSON.stringify(DEFAULT_SETTINGS))
        didInit.current = true
      })
      .finally(() => setLoading(false))
  }, [])

  const dirty = useMemo(() => {
    if (!draft || baseline === null) return false
    return JSON.stringify(draft) !== baseline
  }, [draft, baseline])

  const reset = useCallback(() => {
    if (!settings) return
    setDraft({ ...settings })
    setBaseline(JSON.stringify(settings))
    setBanner(null)
  }, [settings])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setBanner(null)
    setSaving(true)
    setError(null)
    try {
      const res = await updateGeoFenceSettings(draft)
      const merged = { ...DEFAULT_SETTINGS, ...(res || {}), ...draft }
      setSettings(merged)
      setDraft(merged)
      setBaseline(JSON.stringify(merged))
      setBanner({ type: 'ok', text: 'Geo-fencing settings saved.' })
    } catch (e) {
      setError(e.message || 'Failed to save geo-fencing settings')
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

  if (loading && !draft) return <SettingsLoading message="Loading geo-fencing settings…" />
  if (!draft) return <SettingsError message={error || 'Could not load geo-fencing settings.'} />

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      {/* Master toggle */}
      <SectionCard title="Geo-Fencing" description="Enable location-based attendance validation">
        <FieldRow label="Enable Geo-Fencing">
          <Toggle checked={draft.geoFencingEnabled} onChange={(v) => set({ geoFencingEnabled: v })} />
        </FieldRow>
        <FieldRow label="Multi-Location Support" hint="Employees can belong to multiple fence zones">
          <Toggle checked={draft.multiLocationSupport} onChange={(v) => set({ multiLocationSupport: v })} />
        </FieldRow>
      </SectionCard>

      {/* Location & radius */}
      <SectionCard title="Location & Radius Defaults" description="Applied when creating new geo-fences">
        <FieldRow label="Default Radius (meters)">
          <input className={inp} type="number" min={50} max={5000} step={50}
            value={draft.defaultRadiusMeters}
            onChange={(e) => set({ defaultRadiusMeters: parseInt(e.target.value, 10) || 200 })} />
        </FieldRow>
        <FieldRow label="Required GPS Accuracy (meters)" hint="Reject punch if GPS is less accurate">
          <select className={sel} value={String(draft.requiredGpsAccuracyMeters)}
            onChange={(e) => set({ requiredGpsAccuracyMeters: parseInt(e.target.value, 10) })}>
            {GPS_ACCURACY_OPTIONS.map((o) => (
              <option key={o.value} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Max Distance Alert (meters)" hint="Alert raised if distance exceeds this">
          <input className={inp} type="number" min={100} max={10000} step={100}
            value={draft.maxDistanceAlertMeters}
            onChange={(e) => set({ maxDistanceAlertMeters: parseInt(e.target.value, 10) || 500 })} />
        </FieldRow>
      </SectionCard>

      {/* Check-in / check-out rules */}
      <SectionCard title="Check-in / Check-out Rules" description="Controls for punch validation at the gate">
        <FieldRow label="Fence Validation Mode">
          <select className={sel} value={draft.validationMode}
            onChange={(e) => set({ validationMode: e.target.value })}>
            {VALIDATION_MODE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Allow Check-in Outside Fence">
          <Toggle checked={draft.allowCheckinOutsideFence}
            onChange={(v) => set({ allowCheckinOutsideFence: v })} />
        </FieldRow>
        <FieldRow label="Require Selfie on Check-in">
          <Toggle checked={draft.requireSelfieOnCheckin}
            onChange={(v) => set({ requireSelfieOnCheckin: v })} />
        </FieldRow>
        <FieldRow label="Require Selfie on Check-out">
          <Toggle checked={draft.requireSelfieOnCheckout}
            onChange={(v) => set({ requireSelfieOnCheckout: v })} />
        </FieldRow>
      </SectionCard>

      {/* GPS failure handling */}
      <SectionCard title="GPS Failure Handling" description="Behaviour when device GPS is unavailable or inaccurate">
        <FieldRow label="GPS Failure Action">
          <select className={sel} value={draft.gpsFailureHandling}
            onChange={(e) => set({ gpsFailureHandling: e.target.value })}>
            {GPS_FAILURE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Track GPS Throughout Day" hint="Continuous location checks after punch-in">
          <Toggle checked={draft.trackGpsThroughoutDay}
            onChange={(v) => set({ trackGpsThroughoutDay: v })} />
        </FieldRow>
      </SectionCard>

      {/* Violations */}
      <SectionCard title="Violations & Resolution" description="Manage geo-fence violation handling">
        <FieldRow label="Auto-Resolve Violations After (hours)">
          <input className={inp} type="number" min={1} max={72}
            value={draft.autoResolveViolationsAfterHours}
            onChange={(e) => set({ autoResolveViolationsAfterHours: parseInt(e.target.value, 10) || 24 })} />
        </FieldRow>
        <FieldRow label="Notify HR on Violation">
          <Toggle checked={draft.notifyHrOnViolation}
            onChange={(v) => set({ notifyHrOnViolation: v })} />
        </FieldRow>
        <FieldRow label="Notify Manager on Violation">
          <Toggle checked={draft.notifyManagerOnViolation}
            onChange={(v) => set({ notifyManagerOnViolation: v })} />
        </FieldRow>
        <FieldRow label="Allow HR Manual Override">
          <Toggle checked={draft.allowManualOverrideByHr}
            onChange={(v) => set({ allowManualOverrideByHr: v })} />
        </FieldRow>
      </SectionCard>
    </SettingsSection>
  )
}
