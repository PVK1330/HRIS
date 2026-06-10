import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  HiInboxArrowDown, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle,
  HiXCircle, HiArrowUturnLeft, HiPlus, HiArrowRight, HiArrowPath, HiMagnifyingGlass,
  HiClipboardDocumentCheck, HiCheck, HiPaperClip, HiXMark,
} from 'react-icons/hi2'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Table } from '../../components/ui/Table.jsx'
import svc from '../../services/exitWorkflowService'

const fmtDate = (d) => {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '' }
}

const STATUS_PILL = {
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-200 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-slate-100 text-slate-500',
}

// Solid icon-box colors match the Employee Directory KPI card treatment.
const WIDGETS = [
  { key: 'pending_my_approvals', label: 'Pending my approval', icon: HiInboxArrowDown, solid: 'bg-[#F59E0B]', filter: 'IN_PROGRESS' },
  { key: 'exits_in_my_department_stages', label: 'In my dept stages', icon: HiBuildingOffice2, solid: 'bg-[#0F766E]', filter: 'IN_PROGRESS' },
  { key: 'sla_breaches', label: 'SLA breaches', icon: HiExclamationTriangle, solid: 'bg-[#EF4444]', filter: 'IN_PROGRESS' },
  { key: 'completed_exits', label: 'Completed', icon: HiCheckCircle, solid: 'bg-[#10B981]', filter: 'COMPLETED' },
  { key: 'rejected_exits', label: 'Rejected', icon: HiXCircle, solid: 'bg-[#F43F5E]', filter: 'REJECTED' },
  { key: 'withdrawn_requests', label: 'Withdrawn', icon: HiArrowUturnLeft, solid: 'bg-[#64748B]', filter: 'WITHDRAWN' },
]

const EMPTY_FORM = {
  exit_type: 'resignation',
  termination_type_id: '',
  exit_reason: '',
  notice_date: '',
  last_working_day: '',
  notice_period_days: 30, // Default initially, but editable
}

function SubmitModal({ open, onClose, onDone }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [termTypes, setTermTypes] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [letterFile, setLetterFile] = useState(null)

  useEffect(() => {
    if (!open) { setForm(EMPTY_FORM); setEmployeeSearch(''); setLetterFile(null); return }
    svc.getTerminationTypes()
      .then((d) => setTermTypes(Array.isArray(d) ? d : (d?.records || [])))
      .catch(() => setTermTypes([]))

    // Fetch employees for termination
    import('../../services/api.js').then(api => {
      api.default.get('/employees?limit=1000').then(res => {
        const payload = res?.data
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.records)
              ? payload.data.records
            : Array.isArray(payload?.data?.employees)
              ? payload.data.employees
              : Array.isArray(payload?.employees)
                ? payload.employees
                : []
        setEmployees(list)
      }).catch(() => setEmployees([]))
    }).catch(() => setEmployees([]))
  }, [open])

  useEffect(() => {
    if (!form.notice_date) return
    if (form.exit_type !== 'resignation') return
    const notice = new Date(form.notice_date)
    if (Number.isNaN(notice.getTime())) return
    const days = parseInt(form.notice_period_days, 10) || 0
    const lwd = new Date(notice)
    lwd.setDate(lwd.getDate() + days)
    const lwdIso = lwd.toISOString().slice(0, 10)
    setForm((prev) => (
      prev.last_working_day === lwdIso ? prev : { ...prev, last_working_day: lwdIso }
    ))
  }, [form.notice_date, form.exit_type, form.notice_period_days])

  if (!open) return null
  const isTermination = form.exit_type === 'termination'
  const filteredEmployees = employees.filter((emp) => {
    const q = employeeSearch.trim().toLowerCase()
    if (!q) return true
    const fullName = `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim().toLowerCase()
    const empId = String(emp?.employee_id || emp?.emp_id || '').toLowerCase()
    const email = String(emp?.work_email || '').toLowerCase()
    return fullName.includes(q) || empId.includes(q) || email.includes(q)
  })

  const onPickLetter = (e) => {
    const f = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be 10 MB or smaller'); return }
    setLetterFile(f)
  }

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
        notice_period_days: isTermination ? 0 : (parseInt(form.notice_period_days, 10) || 0),
        termination_type_id: isTermination && form.termination_type_id ? Number(form.termination_type_id) : undefined,
        employee_id: isTermination && form.employee_id ? Number(form.employee_id) : undefined
      }
      // Scanned resignation letter applies to voluntary resignations only.
      await svc.submitExitRequest(payload, isTermination ? null : letterFile)
      toast.success('Exit request submitted'); onDone()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to submit') }
    finally { setBusy(false) }
  }

  const fieldClass = 'w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-none border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Submit Exit Request</h2>
          <button onClick={onClose} className="rounded-none p-1 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Close">
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="mb-4 text-xs text-slate-500">It will be routed automatically through your organization's exit workflow.</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[['resignation', 'Resignation'], ['termination', 'Termination']].map(([v, lbl]) => (
                  <button key={v} type="button" onClick={() => setForm({ ...form, exit_type: v, termination_type_id: '' })}
                    className={`rounded-none border px-3 py-2 text-sm font-semibold transition ${form.exit_type === v ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {isTermination && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Employee to Terminate</label>
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search by name, ID or email..."
                  className={`mb-2 ${fieldClass}`}
                />
                <select value={form.employee_id || ''} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className={`mb-3 ${fieldClass}`}>
                  <option value="">Select Employee…</option>
                  {filteredEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {`${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Unnamed'}{e.employee_id || e.emp_id ? ` (${e.employee_id || e.emp_id})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isTermination && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Termination type</label>
                {termTypes.length === 0 ? (
                  <p className="rounded-none bg-amber-50 px-3 py-2 text-xs text-amber-700">No termination types configured. Add them under Settings → Exit Management → Termination Types.</p>
                ) : (
                  <select value={form.termination_type_id} onChange={(e) => setForm({ ...form, termination_type_id: e.target.value })} className={fieldClass}>
                    <option value="">Select a type…</option>
                    {termTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
              </div>
            )}

            {form.exit_type === 'resignation' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Notice Date</label>
                  <input type="date" value={form.notice_date} onChange={(e) => setForm({ ...form, notice_date: e.target.value })}
                    className={fieldClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Notice Period (Days)</label>
                  <select value={form.notice_period_days} onChange={(e) => setForm({ ...form, notice_period_days: e.target.value })} className={`bg-white ${fieldClass}`}>
                    <option value="30">30 days</option>
                    <option value="45">45 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="0">Custom (enter LWD manually)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Last Working Day</label>
                  <input type="date" value={form.last_working_day} onChange={(e) => setForm({ ...form, last_working_day: e.target.value })}
                    className={fieldClass} />
                </div>
              </div>
            )}

            <div className="mt-3">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Reason</label>
              <textarea value={form.exit_reason} onChange={(e) => setForm({ ...form, exit_reason: e.target.value })} rows={3} className={fieldClass} placeholder="Reason for leaving…" />
            </div>

            {!isTermination && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Resignation letter <span className="font-normal text-slate-400">(Required if mandated by HR policy)</span></label>
                {letterFile ? (
                  <div className="flex items-center gap-2 rounded-none border border-teal-200 bg-teal-50 px-3 py-2 text-sm">
                    <HiPaperClip className="h-4 w-4 shrink-0 text-[#0F766E]" />
                    <span className="min-w-0 flex-1 truncate text-slate-700">{letterFile.name}</span>
                    <button type="button" onClick={() => setLetterFile(null)} className="shrink-0 rounded-none p-0.5 text-slate-400 hover:bg-teal-100 hover:text-slate-600" title="Remove">
                      <HiXMark className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-none border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 hover:border-[#0F766E] hover:bg-slate-50">
                    <HiPaperClip className="h-4 w-4" />
                    <span>Attach scanned letter (PDF, JPG, PNG — max 10 MB)</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={onPickLetter} />
                  </label>
                )}
              </div>
            )}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
            <button onClick={submit} disabled={busy} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0c6b64] disabled:opacity-50">{busy ? 'Submitting…' : 'Submit'}</button>
          </div>
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
  const [activeWidget, setActiveWidget] = useState(null)
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

  const addDelayReason = async (taskId) => {
    const reason = prompt('Please provide reason for delay:')
    if (!reason || !reason.trim()) return
    try {
      await svc.setExitTaskDelayReason(taskId, reason.trim())
      toast.success('Delay reason saved')
      loadTasks()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed')
    }
  }

  const pickWidget = (w) => { setStatusFilter(w.filter); setActiveWidget(w.key) }
  const resetFilters = () => { setQuery(''); setStatusFilter('all'); setActiveWidget(null) }

  const visible = records.filter((r) =>
    !query.trim() || (r.employee_name || '').toLowerCase().includes(query.trim().toLowerCase()))

  // ── Table columns (mirrors Employee Directory styling) ───────────────────────
  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (_v, r) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar name={r.employee_name} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{r.employee_name || '—'}</div>
            <div className="truncate text-xs capitalize text-slate-500">{r.exit_type || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'last_working_day',
      label: 'Last Working Day',
      render: (v) => (
        <span className="text-sm font-medium text-slate-700">{v ? fmtDate(v) : '—'}</span>
      ),
    },
    {
      key: 'progress',
      label: 'Stage Progress',
      render: (_v, r) => {
        const total = r.total_stages || 0
        const done = r.status === 'COMPLETED' ? total : Math.max(0, (r.current_stage_order || 1) - 1)
        const pct = total ? Math.round((done / total) * 100) : (r.status === 'COMPLETED' ? 100 : 0)
        return (
          <div className="flex min-w-[200px] items-center gap-2">
            <div className="h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${pct}%` }} />
            </div>
            <span className="truncate text-xs text-slate-500">
              {r.current_stage_name
                ? `${r.current_stage_name} · ${r.current_stage_order}/${total}`
                : (r.status === 'COMPLETED' ? 'All stages complete' : '—')}
            </span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex items-center rounded-none px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[v] || 'bg-slate-100 text-slate-600'}`}>
          {String(v || '').replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_v, r) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); nav(`/admin/exit-management/${r.id}`) }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-blue-500 text-white transition-colors hover:bg-blue-600"
          aria-label="Open exit request"
        >
          <HiArrowRight className="h-4 w-4" />
        </button>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar with Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Exit Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Employees</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Exit Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiArrowPath className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowSubmit(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" />
            Submit Exit
          </button>
        </div>
      </div>

      {/* KPI Widget Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 min-w-0">
        {WIDGETS.map((w) => {
          const Icon = w.icon
          const count = widgets?.[w.key]?.count ?? 0
          const isActive = activeWidget === w.key
          return (
            <button
              key={w.key}
              type="button"
              onClick={() => pickWidget(w)}
              title={`Filter by ${w.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActive
                ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${w.solid} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {w.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{count}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* My exit tasks */}
      {tasks.length > 0 && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <HiClipboardDocumentCheck className="h-4 w-4 text-white" />
            <h2 className="text-sm font-semibold text-white">My Exit Tasks</h2>
            <span className="rounded-none bg-white px-2 py-0.5 text-xs font-bold text-[#0F766E]">{tasks.length}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-700">{t.title}</div>
                  <div className="truncate text-xs text-slate-500">
                    {t.employee_name}{t.stage_name ? ` · ${t.stage_name}` : ''}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {t.task_state === 'OVERDUE'
                      ? 'Overdue'
                      : t.task_state === 'DUE_SOON'
                        ? 'Due soon'
                        : t.task_state === 'COMPLETED'
                          ? 'Completed'
                          : 'Pending'}
                    {t.due_at ? ` · Due ${new Date(t.due_at).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <button onClick={() => nav(`/admin/exit-management/${t.exit_request_id}`)} className="shrink-0 rounded-none border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Open</button>
                {t.task_state === 'OVERDUE' && (
                  <button onClick={() => addDelayReason(t.id)} className="shrink-0 rounded-none border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100">
                    Add reason
                  </button>
                )}
                <button onClick={() => completeTask(t.id)} className="flex shrink-0 items-center gap-1 rounded-none bg-[#0F766E] px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-[#0c6b64]"><HiCheck className="h-3.5 w-3.5" /> Done</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters + Full width Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Exit Requests</h2>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employee..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setActiveWidget(null) }}
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{visible.length} records shown</p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={visible}
          pageSize={8}
          square
          loading={loading}
          onRowClick={(r) => nav(`/admin/exit-management/${r.id}`)}
          emptyMessage={query ? 'No matching exit requests.' : 'No exit requests to show.'}
        />
      </div>

      <SubmitModal open={showSubmit} onClose={() => setShowSubmit(false)} onDone={() => { setShowSubmit(false); load() }} />
    </div>
  )
}
