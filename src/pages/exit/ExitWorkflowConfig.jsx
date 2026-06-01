import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  HiPlus, HiTrash, HiCheckCircle, HiArrowUp, HiArrowDown, HiPencilSquare, HiArrowLeft,
} from 'react-icons/hi2'
import svc from '../../services/exitWorkflowService'

const APPROVAL_MODES = [
  { v: 'ANY', label: 'Any one approver' },
  { v: 'ALL', label: 'All approvers' },
  { v: 'QUORUM', label: 'Quorum (N approvers)' },
  { v: 'SEQUENTIAL', label: 'Sequential order' },
]
const ITEM_TYPES = ['TASK', 'ASSET_RETURN', 'INTERVIEW', 'SETTLEMENT', 'DOCUMENT']

const blankStage = (order) => ({
  name: '', stage_order: order, approval_mode: 'ANY', quorum_count: 2,
  sla_hours: 48, block_until_checklist_complete: false,
  escalation_enabled: false, escalation_after_hours: 48,
  escalation_to_role_id: null, escalation_to_user_id: null, escalation_action: 'NOTIFY',
  allow_future_visibility: true, allow_previous_edit: false, mandatory_comment: false,
  department_ids: [], role_ids: [], user_ids: [], checklist_items: [],
})

function MultiSelect({ label, options, selected, onChange, getId = (o) => o.id, getName = (o) => o.name }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 p-2 max-h-32 overflow-y-auto">
        {options.length === 0 && <span className="text-xs text-slate-400">None available</span>}
        {options.map((o) => {
          const id = getId(o)
          const on = selected.includes(id)
          return (
            <button
              type="button" key={id}
              onClick={() => onChange(on ? selected.filter((x) => x !== id) : [...selected, id])}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${on ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {getName(o)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StageEditor({ stage, index, total, depts, roles, onChange, onRemove, onMove }) {
  const set = (patch) => onChange({ ...stage, ...patch })
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white">{index + 1}</span>
          <input
            value={stage.name} onChange={(e) => set({ name: e.target.value })}
            placeholder={`Stage ${index + 1} name (e.g. Department Head Approval)`}
            className="w-72 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold focus:border-[#0F766E] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <button type="button" disabled={index === 0} onClick={() => onMove(index, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><HiArrowUp /></button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(index, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><HiArrowDown /></button>
          <button type="button" onClick={() => onRemove(index)} className="rounded p-1 text-red-400 hover:bg-red-50"><HiTrash /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <MultiSelect label="Owning departments" options={depts} selected={stage.department_ids} onChange={(v) => set({ department_ids: v })} />
        <MultiSelect label="Owning roles" options={roles} selected={stage.role_ids} onChange={(v) => set({ role_ids: v })} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Approval mode</label>
          <select value={stage.approval_mode} onChange={(e) => set({ approval_mode: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[#0F766E] focus:outline-none">
            {APPROVAL_MODES.map((m) => <option key={m.v} value={m.v}>{m.label}</option>)}
          </select>
        </div>
        {stage.approval_mode === 'QUORUM' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Quorum count</label>
            <input type="number" min={1} value={stage.quorum_count || 2} onChange={(e) => set({ quorum_count: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">SLA (hours)</label>
          <input type="number" min={0} value={stage.sla_hours ?? ''} onChange={(e) => set({ sla_hours: e.target.value === '' ? null : Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Escalation action</label>
          <select value={stage.escalation_action} onChange={(e) => set({ escalation_action: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
            <option value="NOTIFY">Notify</option>
            <option value="REASSIGN">Reassign</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        {[
          ['escalation_enabled', 'Enable escalation'],
          ['allow_future_visibility', 'Future stages preview'],
          ['allow_previous_edit', 'Allow previous-stage comment'],
          ['block_until_checklist_complete', 'Block until checklist done'],
          ['mandatory_comment', 'Comment required on reject'],
        ].map(([k, lbl]) => (
          <label key={k} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={!!stage[k]} onChange={(e) => set({ [k]: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
            {lbl}
          </label>
        ))}
      </div>

      {stage.escalation_enabled && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-amber-50 p-2 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Escalate after (hrs)</label>
            <input type="number" min={0} value={stage.escalation_after_hours ?? ''} onChange={(e) => set({ escalation_after_hours: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Escalate to role</label>
            <select value={stage.escalation_to_role_id || ''} onChange={(e) => set({ escalation_to_role_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
              <option value="">—</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* checklist templates */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600">Stage checklist items</label>
          <button type="button" onClick={() => set({ checklist_items: [...stage.checklist_items, { item_type: 'TASK', label: '', is_mandatory: false }] })}
            className="text-xs font-semibold text-[#0F766E] hover:underline">+ Add item</button>
        </div>
        {stage.checklist_items.map((it, i) => (
          <div key={i} className="mb-1 flex items-center gap-2">
            <select value={it.item_type} onChange={(e) => { const c = [...stage.checklist_items]; c[i] = { ...it, item_type: e.target.value }; set({ checklist_items: c }) }}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
              {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={it.label} placeholder="Item label" onChange={(e) => { const c = [...stage.checklist_items]; c[i] = { ...it, label: e.target.value }; set({ checklist_items: c }) }}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs" />
            <label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={!!it.is_mandatory} onChange={(e) => { const c = [...stage.checklist_items]; c[i] = { ...it, is_mandatory: e.target.checked }; set({ checklist_items: c }) }} /> required</label>
            <button type="button" onClick={() => set({ checklist_items: stage.checklist_items.filter((_, x) => x !== i) })} className="text-red-400"><HiTrash /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExitWorkflowConfig() {
  const [view, setView] = useState('list') // 'list' | 'builder'
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [depts, setDepts] = useState([])
  const [roles, setRoles] = useState([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', description: '', is_default: true, stages: [blankStage(1)] })

  const loadList = async () => {
    setLoading(true)
    try { setWorkflows(await svc.listWorkflows() || []) }
    catch (e) {
      if (e?.response?.status === 403) setDenied(true)
      else toast.error(e?.response?.data?.message || 'Failed to load workflows')
    }
    finally { setLoading(false) }
  }

  useEffect(() => { loadList() }, [])
  useEffect(() => {
    svc.getBuilderOptions()
      .then((o) => { setDepts(o.departments || []); setRoles(o.roles || []) })
      .catch((e) => { if (e?.response?.status === 403) setDenied(true) })
  }, [])

  const startNew = () => {
    setForm({ name: '', description: '', is_default: workflows.length === 0, stages: [blankStage(1)] })
    setView('builder')
  }

  const addStage = () => {
    if (form.stages.length >= 6) { toast.error('A workflow can have at most 6 stages'); return }
    setForm((f) => ({ ...f, stages: [...f.stages, blankStage(f.stages.length + 1)] }))
  }
  const updateStage = (i, s) => setForm((f) => ({ ...f, stages: f.stages.map((x, idx) => idx === i ? s : x) }))
  const removeStage = (i) => setForm((f) => ({ ...f, stages: f.stages.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stage_order: idx + 1 })) }))
  const moveStage = (i, dir) => setForm((f) => {
    const arr = [...f.stages]; const j = i + dir
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    return { ...f, stages: arr.map((s, idx) => ({ ...s, stage_order: idx + 1 })) }
  })

  const save = async () => {
    if (!form.name.trim()) { toast.error('Workflow name is required'); return }
    for (const [i, s] of form.stages.entries()) {
      if (!s.name.trim()) { toast.error(`Stage ${i + 1} needs a name`); return }
      if (s.department_ids.length + s.role_ids.length + (s.user_ids?.length || 0) === 0) {
        toast.error(`Stage ${i + 1} needs at least one owning department or role`); return
      }
    }
    setSaving(true)
    try {
      await svc.createWorkflow(form)
      toast.success('Workflow saved')
      setView('list'); loadList()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to save workflow') }
    finally { setSaving(false) }
  }

  const activate = async (id) => { try { await svc.activateWorkflow(id); toast.success('Set as default'); loadList() } catch (e) { toast.error(e?.response?.data?.message || 'Failed') } }
  const remove = async (id) => {
    const r = await Swal.fire({ title: 'Deactivate workflow?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626' })
    if (!r.isConfirmed) return
    try { await svc.deleteWorkflow(id); toast.success('Deactivated'); loadList() } catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
  }

  if (denied) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-lg font-bold text-slate-800">Exit Workflow Setup</h1>
        <p className="mt-2 text-sm text-slate-500">
          Configuring the exit approval workflow is restricted to administrators and settings managers.
          Your access to individual exit requests is governed by the workflow stages assigned to your role.
        </p>
      </div>
    )
  }

  if (view === 'builder') {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <button onClick={() => setView('list')} className="mb-3 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0F766E]"><HiArrowLeft /> Back</button>
        <h1 className="mb-1 text-xl font-bold text-slate-800">New Exit Workflow</h1>
        <p className="mb-4 text-sm text-slate-500">Define up to 6 sequential stages. A submitted resignation is routed to stage 1's owners, then advances stage by stage as each approves.</p>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Workflow name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none" placeholder="e.g. Standard Employee Exit" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="h-4 w-4 rounded text-[#0F766E]" />
            Set as the active default workflow
          </label>
        </div>

        <div className="space-y-3">
          {form.stages.map((s, i) => (
            <StageEditor key={i} stage={s} index={i} total={form.stages.length} depts={depts} roles={roles}
              onChange={(ns) => updateStage(i, ns)} onRemove={removeStage} onMove={moveStage} />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={addStage} disabled={form.stages.length >= 6}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#0F766E] px-3 py-2 text-sm font-semibold text-[#0F766E] hover:bg-teal-50 disabled:opacity-40">
            <HiPlus /> Add stage ({form.stages.length}/6)
          </button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save workflow'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Exit Management — Department Workflow</h1>
          <p className="text-sm text-slate-500">Configure who approves an exit and in what order.</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"><HiPlus /> New workflow</button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading…</div>
      ) : workflows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
          No workflows yet. Create one to define the approval chain.
        </div>
      ) : (
        <div className="space-y-2">
          {workflows.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{w.name}</span>
                  {w.is_default && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">DEFAULT</span>}
                  {!w.is_active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">INACTIVE</span>}
                </div>
                <div className="text-xs text-slate-500">{w.stage_count ?? w.stages?.length ?? 0} stage(s){w.description ? ` · ${w.description}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                {!w.is_default && w.is_active && (
                  <button onClick={() => activate(w.id)} className="flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-teal-50"><HiCheckCircle /> Set default</button>
                )}
                <button onClick={() => remove(w.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"><HiTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
