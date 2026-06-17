import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings'
import {
  FieldRow,
  SectionCard,
  SettingsBanner,
  SettingsError,
  SettingsLoading,
  SettingsSection,
  Toggle,
} from '../components/ui'
import { ApprovalChain } from './ApprovalChain.jsx'

const WORKFLOW_OPTIONS = [
  'Reporting Manager → Dept Head → HR',
  'Reporting Manager → HR',
  'HR Only',
  'Auto Approve',
]
const WHO_CAN = ['All employees', 'Manager + above', 'HR only']

const APPROVAL_FLOW = 'Reporting Manager → Dept Head → HR'

function buildDraft(data) {
  if (!data) return null
  const r = data.regularizationSettings || {}
  return {
    whoCanSubmitRequest: r.whoCanSubmitRequest ?? 'All employees',
    approver: r.approver ?? APPROVAL_FLOW,
    autoRejectionAfterDays: r.autoRejectionAfterDays ?? 3,
    allowSelf: r.allowSelf !== false,
    maxPerMonth: r.maxPerMonth ?? 3,
    autoApproveEnabled: Boolean(r.autoApproveEnabled),
    autoApproveAfterDays: r.autoApproveAfterDays ?? 3,
    allowBackDateRegularisation: r.allowBackDateRegularisation !== false,
    maxBackDateDays: r.maxBackDateDays ?? 7,
    requireReason: r.requireReason !== false,
    requireAttachment: Boolean(r.requireAttachment),
    notifyManager: r.notifyManager !== false,
    autoPublishToPortal: r.autoPublishToPortal !== false,
    allowedAfterDays: r.allowedAfterDays ?? 0,
  }
}

const sel =
  'h-9 w-full max-w-[220px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'
const inp =
  'h-9 w-full max-w-[140px] rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]'

export default function RegularisationPolicySettings({ registerToolbar }) {
  const { settings, loading, saving, error, save } = useAttendanceSettings()
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [banner, setBanner] = useState(null)
  const didInit = useRef(false)

  useEffect(() => {
    if (!settings || didInit.current) return
    didInit.current = true
    const d = buildDraft(settings)
    setDraft(d)
    setBaseline(JSON.stringify(d))
  }, [settings])

  const dirty = useMemo(() => {
    if (!draft || baseline === null) return false
    return JSON.stringify(draft) !== baseline
  }, [draft, baseline])

  const reset = useCallback(() => {
    if (!settings) return
    didInit.current = true
    const d = buildDraft(settings)
    setDraft(d)
    setBaseline(JSON.stringify(d))
    setBanner(null)
  }, [settings])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setBanner(null)
    try {
      const res = await save({ regularizationSettings: draft })
      if (res?.data) {
        const d = buildDraft(res.data)
        setDraft(d)
        setBaseline(JSON.stringify(d))
      }
      setBanner({ type: 'ok', text: 'Regularisation policy saved.' })
    } catch { /* hook sets error */ }
  }, [draft, save])

  useEffect(() => {
    if (!registerToolbar) return undefined
    registerToolbar({ dirty, saving, onSave: handleSave, onDiscard: reset, disableSave: loading || !draft || saving || !dirty })
    return () => registerToolbar(null)
  }, [registerToolbar, dirty, saving, handleSave, reset, loading, draft])

  const set = (partial) => setDraft((p) => p ? { ...p, ...partial } : p)

  if (loading && !draft) return <SettingsLoading message="Loading regularisation settings…" />
  if (!draft) return <SettingsError message={error || 'Could not load regularisation settings.'} />

  return (
    <SettingsSection>
      {(banner?.type === 'ok' || error) && (
        <SettingsBanner type={banner?.type === 'ok' ? 'ok' : 'error'}>
          {banner?.type === 'ok' ? banner.text : error}
        </SettingsBanner>
      )}

      {/* Submission rules */}
      <SectionCard title="Submission Rules" description="Who can raise regularisation requests and when">
        <FieldRow label="Who Can Submit">
          <select className={sel} value={draft.whoCanSubmitRequest}
            onChange={(e) => set({ whoCanSubmitRequest: e.target.value })}>
            {WHO_CAN.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Allow Self Regularisation">
          <Toggle checked={draft.allowSelf} onChange={(v) => set({ allowSelf: v })} />
        </FieldRow>
        <FieldRow label="Max Regularisations per Month">
          <input className={inp} type="number" min={1} max={31} value={draft.maxPerMonth}
            onChange={(e) => set({ maxPerMonth: parseInt(e.target.value, 10) || 1 })} />
        </FieldRow>
        <FieldRow label="Regularisation Allowed After (days post date)" hint="0 = anytime">
          <input className={inp} type="number" min={0} max={60} value={draft.allowedAfterDays}
            onChange={(e) => set({ allowedAfterDays: parseInt(e.target.value, 10) || 0 })} />
        </FieldRow>
        <FieldRow label="Allow Back-Date Regularisation">
          <Toggle checked={draft.allowBackDateRegularisation} onChange={(v) => set({ allowBackDateRegularisation: v })} />
        </FieldRow>
        {draft.allowBackDateRegularisation && (
          <FieldRow label="Max Back-Date Days">
            <input className={inp} type="number" min={1} max={60} value={draft.maxBackDateDays}
              onChange={(e) => set({ maxBackDateDays: parseInt(e.target.value, 10) || 1 })} />
          </FieldRow>
        )}
        <FieldRow label="Require Reason">
          <Toggle checked={draft.requireReason} onChange={(v) => set({ requireReason: v })} />
        </FieldRow>
        <FieldRow label="Require Attachment">
          <Toggle checked={draft.requireAttachment} onChange={(v) => set({ requireAttachment: v })} />
        </FieldRow>
      </SectionCard>

      {/* Approval workflow */}
      <SectionCard title="Approval Workflow" description="Routing and auto-handling of requests">
        <FieldRow label="Approval Levels" hint="Fixed multi-stage chain applied to all regularisation requests.">
          <ApprovalChain value={draft.approver} onChange={(v) => set({ approver: v })} />
        </FieldRow>
        <FieldRow label="Auto Approve After (days)" hint="0 = disabled">
          <input className={inp} type="number" min={0} max={30} value={draft.autoApproveAfterDays}
            onChange={(e) => set({ autoApproveAfterDays: parseInt(e.target.value, 10) || 0 })} />
        </FieldRow>
        <FieldRow label="Auto Approve Enabled">
          <Toggle checked={draft.autoApproveEnabled} onChange={(v) => set({ autoApproveEnabled: v })} />
        </FieldRow>
        <FieldRow label="Auto Reject After (days)">
          <input className={inp} type="number" min={1} max={30} value={draft.autoRejectionAfterDays}
            onChange={(e) => set({ autoRejectionAfterDays: parseInt(e.target.value, 10) || 1 })} />
        </FieldRow>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" description="Keep stakeholders informed at each stage">
        <FieldRow label="Notify Manager on Submission">
          <Toggle checked={draft.notifyManager} onChange={(v) => set({ notifyManager: v })} />
        </FieldRow>
        <FieldRow label="Auto-Publish to Employee Portal">
          <Toggle checked={draft.autoPublishToPortal} onChange={(v) => set({ autoPublishToPortal: v })} />
        </FieldRow>
      </SectionCard>
    </SettingsSection>
  )
}
