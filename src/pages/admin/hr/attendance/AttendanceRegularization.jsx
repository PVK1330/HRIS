import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  HiCheck,
  HiPaperAirplane,
  HiXMark,
  HiEye,
  HiMagnifyingGlass,
} from 'react-icons/hi2'
import { Badge } from '../../../../components/ui/Badge.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { IconActionButton } from '../../../../components/ui/IconActionButton.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Tooltip } from '../../../../components/ui/Tooltip.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
import { useAuth } from '../../../../context/AuthContext.jsx'
import {
  canApproveRegularization,
  canRequestRegularization,
} from '../../../../utils/rbac.js'
import {
  getPendingRegularizations,
  getRegularizationHistory,
  regularize,
  submitRegularization,
} from '../../../../services/attendanceService.js'
import AttendanceExportMenu from '../../../../components/attendance/AttendanceExportMenu.jsx'

const EMPTY = { date: '', checkInTime: '', checkOutTime: '', reason: '', workMode: 'In Office' }

/**
 * Per-stage approval trail for the details modal.
 * Stages already completed show Approved/Rejected; the current active stage shows
 * Pending (amber); stages that are in the chain but not yet reached show Queued (gray).
 */
const STAGE_ORDER = { manager: 0, department: 1, hr: 2 }
function buildRegTrail(row) {
  const stages = [
    { label: 'Reporting Manager', status: row.manager_approval_status,    name: row.manager_approver_name, remark: row.reg_manager_remarks },
    { label: 'Department Head',   status: row.department_approval_status, name: row.dept_approver_name,    remark: row.reg_dept_remarks },
    { label: 'HR Department',     status: row.hr_approval_status,         name: row.hr_approver_name,      remark: row.reg_hr_remarks },
  ]
  const isRejected = row.regularization_status === 'Rejected'
  // Find which stage did the rejecting (last stage that has an approver stamped)
  let rejectIdx = -1
  if (isRejected) {
    for (let k = stages.length - 1; k >= 0; k--) {
      if (stages[k].status === 'Rejected') { rejectIdx = k; break }
    }
  }
  return stages.map((s, idx) => {
    let state
    if (isRejected && idx === rejectIdx)       state = 'rejected'
    else if (s.status === 'Approved')          state = 'approved'
    else if (isRejected)                       state = 'na'
    else if (s.status === 'N/A')               state = 'na'
    else if (s.status === 'Pending')           state = 'pending'
    else                                       state = 'na'
    return { ...s, state }
  })
}

// Maps reg_current_stage → human label for in-progress requests.
// Do NOT use regularization_status for the label — Manager_Approved doesn't always
// mean "Awaiting Dept Head" (in 2-level workflow Manager_Approved → HR, not Dept Head).
const STAGE_LABELS = {
  manager:    'Awaiting Reporting Manager',
  department: 'Awaiting Dept Head',
  hr:         'Awaiting HR',
}
// Only used as fallback for terminal statuses (Approved/Rejected)
const STATUS_LABELS = {
  Approved: 'Approved',
  Rejected: 'Rejected',
}

function regStatusColor(s) {
  if (s === 'Approved')         return 'emerald'
  if (s === 'Rejected')         return 'red'
  if (s === 'Pending')          return 'amber'
  if (s === 'Manager_Approved') return 'blue'
  if (s === 'Dept_Approved')    return 'indigo'
  return 'gray'
}
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none'
const labelClass = 'text-sm font-medium text-slate-700'

export default function AttendanceRegularization() {
  const { allowedModules, user } = useAuth()
  // Org (tenant) admin always has full regularization submit/approve rights.
  const isOrgAdmin = user?.role === 'admin'
  const canSubmit = canRequestRegularization(allowedModules) || isOrgAdmin
  const canApprove = canApproveRegularization(allowedModules) || isOrgAdmin

  const [history, setHistory] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionRow, setActionRow] = useState(null)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')
  const [viewRow, setViewRow] = useState(null)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const h = await getRegularizationHistory({ limit: 200 })
      setHistory(h.records || [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitRegularization(form)
      setForm(EMPTY)
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async () => {
    if (!actionRow) return
    setSubmitting(true)
    try {
      await regularize(actionRow.id, { action: actionType, reason })
      setActionRow(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = history.filter(r => {
    let match = true
    if (statusFilter && r.regularization_status !== statusFilter) match = false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      if (!((r.employee_name || '').toLowerCase().includes(q) || (r.emp_id || '').toLowerCase().includes(q))) match = false
    }
    return match
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Attendance Regularization</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Attendance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Regularization Requests</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canSubmit && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPaperAirplane className="h-4 w-4" /> Add Regularization
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Regularization History</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by employee name or ID..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 min-w-[180px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">All statuses</option>
              <option value="Pending">Awaiting Manager</option>
              <option value="Manager_Approved">After Manager — in progress</option>
              <option value="Dept_Approved">After Dept Head — in progress</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{filtered.length} record(s)</p>
            <AttendanceExportMenu reportType="regularization" filenameBase="regularization" />
          </div>
        </div>

        <Table
          loading={loading}
          square
          columns={[
            { key: 'employee_name', label: 'Employee' },
            { key: 'date', label: 'Date' },
            { key: 'regularization_reason', label: 'Reason' },
            {
              key: 'regularization_status',
              label: 'Status',
              render: (_, r) => {
                const label = STATUS_LABELS[r.regularization_status]
                  || STAGE_LABELS[r.pending_stage]
                  || r.regularization_status || '—'
                return <Badge label={label} color={regStatusColor(r.regularization_status)} />
              },
            },
            {
              key: 'pending_approver_role',
              label: 'Approver level',
              render: (_, r) => r.pending_approver_role || (r.regularization_status === 'Pending' ? `Level ${r.pending_level || r.current_approval_level || '—'}` : '—'),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, r) => {
                // can_act (server-computed) is true ONLY for the responsible
                // approver of this request's CURRENT stage — so Approve/Reject
                // shows for the current level only, never previous/future ones,
                // and never for the requester themselves.
                return (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewRow(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                      title="View details"
                    >
                      <HiEye className="h-4 w-4" />
                    </button>
                    {r.can_act && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setActionRow(r); setActionType('approve'); setReason('') }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0c6b64]"
                          title="Approve"
                        >
                          <HiCheck className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActionRow(r); setActionType('reject'); setReason('') }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
                          title="Reject"
                        >
                          <HiXMark className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                )
              },
            },
          ]}
          data={filtered}
          emptyMessage="No regularization records"
        />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add Regularization</h2>
            <p className="text-xs font-medium text-slate-500">Request a correction for a past attendance date.</p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="pt-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Date</label>
              <input required type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Work mode</label>
              <select value={form.workMode} onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))} className={inputClass}>
                <option>In Office</option>
                <option>Remote</option>
                <option>Work From Home</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Check-in</label>
              <input type="time" value={form.checkInTime} onChange={(e) => setForm((f) => ({ ...f, checkInTime: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-out</label>
              <input type="time" value={form.checkOutTime} onChange={(e) => setForm((f) => ({ ...f, checkOutTime: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Reason</label>
              <textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className={inputClass} rows={2} placeholder="Why are you requesting a change?" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 font-medium" role="alert">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              label="Cancel"
              disabled={submitting}
              onClick={() => { setForm(EMPTY); setError(''); setModalOpen(false) }}
            />
            <Button
              type="submit"
              variant="teal"
              size="md"
              label="Submit Request"
              loading={submitting}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!actionRow}
        onClose={() => setActionRow(null)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} request`}
        footer={(
          <div className="flex flex-wrap justify-end gap-3">
            <Tooltip content="Close without saving">
              <Button
                variant="outline"
                size="md"
                label="Cancel"
                icon={HiXMark}
                onClick={() => setActionRow(null)}
                disabled={submitting}
              />
            </Tooltip>
            <Tooltip content={actionType === 'approve' ? 'Confirm approval' : 'Confirm rejection'}>
              <Button
                variant={actionType === 'approve' ? 'Approve' : 'danger'}
                size="md"
                label={actionType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                icon={actionType === 'approve' ? HiCheck : HiXMark}
                loading={submitting}
                disabled={submitting}
                onClick={handleAction}
              />
            </Tooltip>
          </div>
        )}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional remarks for the employee"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={3}
        />
      </Modal>

      {/* View details */}
      <Modal
        isOpen={!!viewRow}
        onClose={() => setViewRow(null)}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Regularization Details</h2>
            <p className="text-xs font-medium text-slate-500">Request submitted for attendance correction.</p>
          </div>
        }
      >
        {viewRow && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 pt-2 sm:grid-cols-2">
            <div>
              <dt className={labelClass}>Employee</dt>
              <dd className="mt-1 text-sm text-slate-800">{viewRow.employee_name || '—'}</dd>
            </div>
            <div>
              <dt className={labelClass}>Employee ID</dt>
              <dd className="mt-1 text-sm text-slate-800">{viewRow.emp_id || '—'}</dd>
            </div>
            <div>
              <dt className={labelClass}>Department</dt>
              <dd className="mt-1 text-sm text-slate-800">{viewRow.department || '—'}</dd>
            </div>
            <div>
              <dt className={labelClass}>Date</dt>
              <dd className="mt-1 text-sm text-slate-800">{viewRow.date || '—'}</dd>
            </div>
            <div>
              <dt className={labelClass}>Status</dt>
              <dd className="mt-1"><Badge
                label={STATUS_LABELS[viewRow.regularization_status] || STAGE_LABELS[viewRow.pending_stage] || viewRow.regularization_status || '—'}
                color={regStatusColor(viewRow.regularization_status)}
              /></dd>
            </div>
            <div>
              <dt className={labelClass}>Reason</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{viewRow.regularization_reason || '—'}</dd>
            </div>
           

            {/* Approval trail */}
            <div className="sm:col-span-2 border-t border-slate-100 pt-3">
              <dt className="text-sm font-semibold text-slate-600">Approval Status</dt>
              <dl className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                {buildRegTrail(viewRow).map((s) => (
                  <Fragment key={s.label}>
                    <dt className="font-medium text-slate-500">{s.label}</dt>
                    <dd className="col-span-2 text-slate-800">
                      {s.state === 'approved' && (
                        <span className="font-medium text-emerald-700">✓ Approved{s.name ? ` — ${s.name}` : ''}</span>
                      )}
                      {s.state === 'rejected' && (
                        <span className="font-medium text-red-600">✗ Rejected{s.name ? ` — ${s.name}` : ''}</span>
                      )}
                      {s.state === 'pending' && <span className="text-amber-600">Pending</span>}
                      {s.state === 'na'       && <span className="text-slate-300">—</span>}
                      {s.remark && (
                        <p className="mt-0.5 text-xs italic text-slate-500 whitespace-pre-wrap">"{s.remark}"</p>
                      )}
                    </dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  )
}
