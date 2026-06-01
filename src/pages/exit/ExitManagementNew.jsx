import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  HiInboxArrowDown, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle,
  HiXCircle, HiArrowUturnLeft, HiPlus, HiEye, HiArrowPath,
} from 'react-icons/hi2'
import svc from '../../services/exitWorkflowService'

const STATUS_STYLES = {
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-200 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-slate-100 text-slate-500',
}

const WIDGETS = [
  { key: 'pending_my_approvals', label: 'Pending My Approvals', icon: HiInboxArrowDown, color: 'text-amber-600 bg-amber-50' },
  { key: 'exits_in_my_department_stages', label: 'In My Department Stages', icon: HiBuildingOffice2, color: 'text-teal-600 bg-teal-50' },
  { key: 'sla_breaches', label: 'SLA Breaches', icon: HiExclamationTriangle, color: 'text-red-600 bg-red-50' },
  { key: 'completed_exits', label: 'Completed', icon: HiCheckCircle, color: 'text-green-600 bg-green-50' },
  { key: 'rejected_exits', label: 'Rejected', icon: HiXCircle, color: 'text-rose-600 bg-rose-50' },
  { key: 'withdrawn_requests', label: 'Withdrawn', icon: HiArrowUturnLeft, color: 'text-slate-600 bg-slate-100' },
]

function SubmitModal({ open, onClose, onDone }) {
  const [form, setForm] = useState({ exit_type: 'resignation', exit_reason: '', last_working_day: '' })
  const [busy, setBusy] = useState(false)
  if (!open) return null
  const submit = async () => {
    setBusy(true)
    try {
      await svc.submitExitRequest(form)
      toast.success('Exit request submitted')
      onDone()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to submit') }
    finally { setBusy(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Submit Exit Request</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
            <select value={form.exit_type} onChange={(e) => setForm({ ...form, exit_type: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="resignation">Resignation</option>
              <option value="termination">Termination</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Last working day</label>
            <input type="date" value={form.last_working_day} onChange={(e) => setForm({ ...form, last_working_day: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Reason</label>
            <textarea value={form.exit_reason} onChange={(e) => setForm({ ...form, exit_reason: e.target.value })} rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Reason for leaving…" />
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
  const [showSubmit, setShowSubmit] = useState(false)

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

  useEffect(() => { load() }, [load])

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Exit Management</h1>
          <p className="text-sm text-slate-500">Your approvals, department exits, and the global exit queue.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><HiArrowPath /></button>
          <button onClick={() => setShowSubmit(true)} className="flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"><HiPlus /> Submit exit</button>
        </div>
      </div>

      {/* Widgets */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {WIDGETS.map((w) => {
          const Icon = w.icon
          const count = widgets?.[w.key]?.count ?? 0
          return (
            <div key={w.key} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${w.color}`}><Icon className="h-5 w-5" /></div>
              <div className="text-2xl font-bold text-slate-800">{count}</div>
              <div className="text-[11px] font-medium leading-tight text-slate-500">{w.label}</div>
            </div>
          )
        })}
      </div>

      {/* Requests */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-3">
          <h2 className="font-semibold text-slate-700">Exit requests</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
            <option value="all">All statuses</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
        {loading ? (
          <div className="py-14 text-center text-slate-400">Loading…</div>
        ) : records.length === 0 ? (
          <div className="py-14 text-center text-slate-400">No exit requests visible to you.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Current stage</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{r.employee_name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-500">{r.exit_type}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {r.current_stage_name
                      ? <span>{r.current_stage_name} <span className="text-xs text-slate-400">({r.current_stage_order}/{r.total_stages})</span></span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status] || 'bg-slate-100 text-slate-500'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => nav(`/admin/exit-management/${r.id}`)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"><HiEye /> Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SubmitModal open={showSubmit} onClose={() => setShowSubmit(false)} onDone={() => { setShowSubmit(false); load() }} />
    </div>
  )
}
