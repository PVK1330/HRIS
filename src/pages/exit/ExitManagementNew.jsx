import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  HiInboxArrowDown, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle,
  HiXCircle, HiArrowUturnLeft, HiPlus, HiArrowRight, HiArrowPath, HiMagnifyingGlass,
  HiClipboardDocumentCheck, HiCheck,
} from 'react-icons/hi2'

const fmtDate = (d) => {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '' }
}
import svc from '../../services/exitWorkflowService'

const STATUS_PILL = {
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-200 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-slate-100 text-slate-500',
}

const WIDGETS = [
  { key: 'pending_my_approvals', label: 'Pending my approval', icon: HiInboxArrowDown, color: 'text-amber-600', bg: 'bg-amber-50', filter: 'IN_PROGRESS' },
  { key: 'exits_in_my_department_stages', label: 'In my dept stages', icon: HiBuildingOffice2, color: 'text-teal-600', bg: 'bg-teal-50', filter: 'IN_PROGRESS' },
  { key: 'sla_breaches', label: 'SLA breaches', icon: HiExclamationTriangle, color: 'text-red-600', bg: 'bg-red-50', filter: 'IN_PROGRESS' },
  { key: 'completed_exits', label: 'Completed', icon: HiCheckCircle, color: 'text-green-600', bg: 'bg-green-50', filter: 'COMPLETED' },
  { key: 'rejected_exits', label: 'Rejected', icon: HiXCircle, color: 'text-rose-600', bg: 'bg-rose-50', filter: 'REJECTED' },
  { key: 'withdrawn_requests', label: 'Withdrawn', icon: HiArrowUturnLeft, color: 'text-slate-600', bg: 'bg-slate-100', filter: 'WITHDRAWN' },
]

const initials = (n) => (n || '?').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()

const DEFAULT_NOTICE_DAYS = 30
const EMPTY_FORM = {
  exit_type: 'resignation',
  termination_type_id: '',
  exit_reason: '',
  notice_date: '',
  last_working_day: '',
  notice_period_days: DEFAULT_NOTICE_DAYS,
}

function SubmitModal({ open, onClose, onDone }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [termTypes, setTermTypes] = useState([])

  useEffect(() => {
    if (!open) { setForm(EMPTY_FORM); return }
    svc.getTerminationTypes()
      .then((d) => setTermTypes(Array.isArray(d) ? d : (d?.records || [])))
      .catch(() => setTermTypes([]))
  }, [open])

  useEffect(() => {
    if (!form.notice_date) return
    if (form.exit_type !== 'resignation') return
    const notice = new Date(form.notice_date)
    if (Number.isNaN(notice.getTime())) return
    const lwd = new Date(notice)
    lwd.setDate(lwd.getDate() + DEFAULT_NOTICE_DAYS)
    const lwdIso = lwd.toISOString().slice(0, 10)
    setForm((prev) => (
      prev.last_working_day === lwdIso
        ? prev
        : { ...prev, last_working_day: lwdIso, notice_period_days: DEFAULT_NOTICE_DAYS }
    ))
  }, [form.notice_date, form.exit_type])

  if (!open) return null
  const isTermination = form.exit_type === 'termination'

  const submit = async () => {
    if (isTermination && termTypes.length > 0 && !form.termination_type_id) {
      toast.error('Select a termination type'); return
    }
    setBusy(true)
    try {
      const payload = {
        exit_type: form.exit_type,
        exit_reason: form.exit_reason || undefined,
        notice_date: form.notice_date || undefined,
        last_working_day: form.last_working_day || undefined,
        notice_period_days: isTermination ? 0 : DEFAULT_NOTICE_DAYS,
        termination_type_id: isTermination && form.termination_type_id ? Number(form.termination_type_id) : undefined,
      }
      await svc.submitExitRequest(payload)
      toast.success('Exit request submitted'); onDone()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to submit') }
    finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-lg font-bold text-slate-800">Submit exit request</h2>
        <p className="mb-4 text-xs text-slate-500">It will be routed automatically through your organization's exit workflow.</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[['resignation', 'Resignation'], ['termination', 'Termination']].map(([v, lbl]) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, exit_type: v, termination_type_id: '' })}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${form.exit_type === v ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {isTermination && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Termination type</label>
              {termTypes.length === 0 ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">No termination types configured. Add them under Settings → Exit Management → Termination Types.</p>
              ) : (
                <select value={form.termination_type_id} onChange={(e) => setForm({ ...form, termination_type_id: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none">
                  <option value="">Select a type…</option>
                  {termTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Notice date</label>
              <input type="date" value={form.notice_date} onChange={(e) => setForm({ ...form, notice_date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Last working day</label>
              <input type="date" value={form.last_working_day} onChange={(e) => setForm({ ...form, last_working_day: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Reason</label>
            <textarea value={form.exit_reason} onChange={(e) => setForm({ ...form, exit_reason: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Reason for leaving…" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} disabled={busy} className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">{busy ? 'Submitting…' : 'Submit'}</button>
        </div>
      </div>
    </div>
  )
}

export default function ExitManagementNew() {
  const nav = useNavigate()
  const [widgets, setWidgets] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const [tasks, setTasks] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [w, list] = await Promise.all([
        svc.getDashboardWidgets().catch(() => null),
        svc.listExitRequests({ status: statusFilter, limit: 50 }),
      ])
      setWidgets(w)
      setRecords(list?.records || [])
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to load') }
    finally { setLoading(false) }
  }, [statusFilter])

  const loadTasks = useCallback(async () => {
    try { setTasks(await svc.listMyExitTasks({ status: 'PENDING' }) || []) } catch { /* none */ }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadTasks() }, [loadTasks])

  const completeTask = async (taskId) => {
    try { await svc.completeExitTask(taskId); toast.success('Task completed'); loadTasks() }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed') }
  }

  const visible = records.filter((r) =>
    !query.trim() || (r.employee_name || '').toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Exit Management</h1>
          <p className="text-sm text-slate-500">Requests are routed automatically through your configured exit workflow.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Refresh"><HiArrowPath /></button>
          <button onClick={() => setShowSubmit(true)} className="flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"><HiPlus /> Submit exit</button>
        </div>
      </div>

      {/* Widgets */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {WIDGETS.map((w) => {
          const Icon = w.icon
          const count = widgets?.[w.key]?.count ?? 0
          return (
            <button key={w.key} onClick={() => setStatusFilter(w.filter)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-teal-200 hover:shadow-sm">
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${w.bg} ${w.color}`}><Icon className="h-5 w-5" /></div>
              <div className="text-2xl font-bold text-slate-800">{count}</div>
              <div className="text-[11px] font-medium leading-tight text-slate-500">{w.label}</div>
            </button>
          )
        })}
      </div>

      {/* My tasks */}
      {tasks.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-teal-200 bg-teal-50/40">
          <div className="flex items-center gap-2 border-b border-teal-100 px-4 py-2.5">
            <HiClipboardDocumentCheck className="h-4 w-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold text-slate-700">My exit tasks</h2>
            <span className="rounded-full bg-[#0F766E] px-2 py-0.5 text-xs font-bold text-white">{tasks.length}</span>
          </div>
          <div className="divide-y divide-teal-100">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-700">{t.title}</div>
                  <div className="truncate text-xs text-slate-500">
                    {t.employee_name}{t.stage_name ? ` · ${t.stage_name}` : ''}
                  </div>
                </div>
                <button onClick={() => nav(`/admin/exit-management/${t.exit_request_id}`)} className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">Open</button>
                <button onClick={() => completeTask(t.id)} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#0F766E] px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-800"><HiCheck className="h-3.5 w-3.5" /> Done</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-3">
          <h2 className="font-semibold text-slate-700">Exit requests</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employee…" className="h-9 w-44 rounded-lg border border-slate-200 pl-8 pr-2 text-sm focus:border-[#0F766E] focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm">
              <option value="all">All statuses</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center text-slate-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="py-14 text-center text-slate-400">{query ? 'No matching exit requests.' : 'No exit requests to show.'}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((r) => {
              const total = r.total_stages || 0
              const done = r.status === 'COMPLETED' ? total : Math.max(0, (r.current_stage_order || 1) - 1)
              const pct = total ? Math.round((done / total) * 100) : (r.status === 'COMPLETED' ? 100 : 0)
              return (
                <button key={r.id} onClick={() => nav(`/admin/exit-management/${r.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">{initials(r.employee_name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="truncate font-semibold text-slate-700">{r.employee_name}</span>
                      <span className="capitalize text-xs text-slate-400">{r.exit_type}</span>
                      {r.last_working_day && <span className="text-xs text-slate-400">· LWD {fmtDate(r.last_working_day)}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="truncate text-xs text-slate-500">
                        {r.current_stage_name ? `${r.current_stage_name} · ${r.current_stage_order}/${total}` : (r.status === 'COMPLETED' ? 'All stages complete' : '—')}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[r.status] || 'bg-slate-100 text-slate-500'}`}>{r.status.replace('_', ' ')}</span>
                  <HiArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      <SubmitModal open={showSubmit} onClose={() => setShowSubmit(false)} onDone={() => { setShowSubmit(false); load() }} />
    </div>
  )
}
