import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { HiCheck, HiXMark, HiClock, HiCheckBadge, HiDocumentText, HiMagnifyingGlass, HiPlus, HiEye, HiPencil, HiTrash } from 'react-icons/hi2'
import { Badge } from '../../../../components/ui/Badge.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { IconActionButton } from '../../../../components/ui/IconActionButton.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Tooltip } from '../../../../components/ui/Tooltip.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { canApproveRegularization, canManageAttendanceOverride, canPunchAttendance } from '../../../../utils/rbac.js'
import {
  getOvertimeRecords,
  processOvertime,
  deleteOvertime,
} from '../../../../services/attendanceService.js'
import AddOvertimeModal from '../../../../components/attendance/AddOvertimeModal.jsx'
import AttendanceExportMenu from '../../../../components/attendance/AttendanceExportMenu.jsx'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings.js'

const STATUS_LABELS = {
  Pending:          'Awaiting Manager',
  Manager_Approved: 'Awaiting Dept Head',
  Dept_Approved:    'Awaiting HR',
  Approved:         'Approved',
  Rejected:         'Rejected',
}

function statusTone(s) {
  if (s === 'Approved')         return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  if (s === 'Rejected')         return 'bg-red-50 text-red-700 ring-red-600/20'
  if (s === 'Dept_Approved')    return 'bg-blue-50 text-blue-700 ring-blue-600/20'
  if (s === 'Manager_Approved') return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20'
  if (s === 'Pending')          return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  return 'bg-slate-50 text-slate-600 ring-slate-500/20'
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusTone(status)}`}>
      {STATUS_LABELS[status] || status || '—'}
    </span>
  )
}

const ACTIONABLE = new Set(['Pending', 'Manager_Approved', 'Dept_Approved'])

/**
 * Build the per-stage approval trail for the details modal: who acted at each
 * stage, with their remark. A reject stamps that stage's *_approved_by column,
 * so when the record is Rejected the last stamped stage is the one that rejected
 * (earlier stamped stages were genuine approvals); the reason lives in
 * overtime_rejection_reason.
 */
function buildOvertimeTrail(row) {
  const stages = [
    { label: 'Reporting Manager',   by: row.overtime_manager_approved_by, name: row.overtime_manager_approver_name, remark: row.overtime_manager_remarks },
    { label: 'Department Head', by: row.overtime_dept_approved_by,    name: row.overtime_dept_approver_name,    remark: row.overtime_dept_remarks },
    { label: 'HR Department',        by: row.overtime_hr_approved_by,      name: row.overtime_hr_approver_name,      remark: row.overtime_hr_remarks },
  ]
  const rejected = row.overtime_status === 'Rejected'
  let rejectIdx = -1
  if (rejected) {
    for (let k = stages.length - 1; k >= 0; k -= 1) {
      if (stages[k].by) { rejectIdx = k; break }
    }
  }
  return stages.map((s, idx) => {
    const prevDone = idx === 0 || Boolean(stages[idx - 1].by)
    let state
    if (rejected && idx === rejectIdx) state = 'rejected'
    else if (s.by) state = 'approved'
    else if (rejected) state = 'na'
    else if (prevDone) state = 'pending'
    else state = 'na'
    return { ...s, state }
  })
}

export default function OvertimeApprovals() {
  const { user, allowedModules } = useAuth()
  // Org (tenant) admin always has full overtime approve/manage rights.
  const isOrgAdmin = user?.role === 'admin'
  const canApprove = canApproveRegularization(allowedModules) || isOrgAdmin
  const canManage = canManageAttendanceOverride(allowedModules) || isOrgAdmin
  // Employees (attendance.create) may add their OWN overtime; managers may add for their scope.
  const canAdd = canManage || canPunchAttendance(allowedModules, user)
  const myEmployeeId = Number(user?.employeeId ?? user?.id)
  // You can never approve/reject/edit/delete your OWN overtime — that's a
  // segregation-of-duties rule, enforced here and again on the server.
  const isOwn = (row) => Number(row?.employee_id) === myEmployeeId

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionRow, setActionRow] = useState(null)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { settings } = useAttendanceSettings()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = await getOvertimeRecords({ limit: 200 })
      setRecords(Array.isArray(p) ? p : p.records || [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async () => {
    if (!actionRow) return
    setSubmitting(true)
    try {
      await processOvertime(actionRow.id, { action: actionType, reason })
      setActionRow(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteRow) return
    setDeleting(true)
    try {
      await deleteOvertime(deleteRow.id)
      setDeleteRow(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  // Approve/Reject from the View modal → open the reason modal.
  const startAction = (row, type) => {
    setViewRow(null)
    setActionRow(row)
    setActionType(type)
    setReason('')
  }

  const metrics = useMemo(() => {
    const pending  = records.filter((r) => ACTIONABLE.has(r.overtime_status))
    const approved = records.filter((r) => r.overtime_status === 'Approved')
    const approvedHours = approved.reduce((a, r) => a + Number(r.overtime_hours || 0), 0)
    return { pending: pending.length, approvedHours: Math.round(approvedHours * 100) / 100 }
  }, [records])

  const filtered = useMemo(() => {
    let r = records
    if (statusFilter) r = r.filter((x) => x.overtime_status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter((x) =>
        (x.employee_name || '').toLowerCase().includes(q) || (x.emp_id || '').toLowerCase().includes(q))
    }
    return r
  }, [records, search, statusFilter])

  if (!canApprove && !canManage) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        You do not have permission to view overtime requests.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
        {[
          { label: 'PENDING APPROVALS', count: metrics.pending, bgColor: 'bg-[#F59E0B]', icon: HiClock },
          { label: 'APPROVED HOURS', count: metrics.approvedHours, bgColor: 'bg-[#3B82F6]', icon: HiDocumentText },
          {
            label: 'REJECTED',
            count: records.filter(x => x.overtime_status === 'Rejected').length || 0,
            bgColor: 'bg-[#EF4444]',
            icon: HiXMark,
            onClickFilter: () => setStatusFilter('Rejected'),
          }
        ].map((card, idx) => (
          <button
            key={idx}
            type="button"
            onClick={card.onClickFilter}
            className={`group flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 text-left shadow-sm min-w-0 ${card.onClickFilter ? 'cursor-pointer hover:border-slate-300' : 'cursor-default'}`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Overtime Management</h2>
          <div className="flex gap-2">
            {canAdd && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-none bg-white px-3 py-1.5 text-xs font-bold text-[#0F766E] transition-colors hover:bg-slate-50 shadow-sm"
              >
                <HiPlus className="h-4 w-4" /> {canManage ? 'Add Overtime' : 'Request Overtime'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
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
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-none border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">All statuses</option>
              <option value="Pending">Awaiting Manager</option>
              <option value="Manager_Approved">Awaiting Dept Head</option>
              <option value="Dept_Approved">Awaiting HR</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <p className="text-xs font-medium text-slate-500">{filtered.length} record(s)</p>
            <AttendanceExportMenu reportType="overtime" filenameBase="overtime" />
          </div>
        </div>

        {error && <div className="px-5 py-3 text-sm font-medium text-red-600 bg-red-50 border-b border-red-100">{error}</div>}

        <Table
          loading={loading}
          square
          columns={[
            { key: 'employee_name', label: 'Employee' },
            { key: 'emp_id', label: 'ID' },
            { key: 'department', label: 'Department' },
            { key: 'date', label: 'Date' },
            {
              key: 'overtime_hours',
              label: 'Overtime',
              render: (v) => <Badge label={`${Number(v || 0)} h`} />,
            },
            {
              key: 'overtime_status',
              label: 'Status',
              render: (v) => <StatusPill status={v} />,
            },
            {
              key: 'approver_name',
              label: 'Pending With / Approver',
              render: (v, r) => (
                <span className="text-sm text-slate-600">
                  {ACTIONABLE.has(r.overtime_status)
                    ? (r.pending_stage_label || '—')
                    : (v || '—')}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, r) => {
                const isActionable = ACTIONABLE.has(r.overtime_status)
                const own = isOwn(r)
                // can_act (server-computed) is true ONLY for the responsible
                // approver of the record's CURRENT stage — so Approve/Reject
                // appears for the current level only, never earlier/later ones.
                return (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewRow(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-blue-600 text-white transition-colors hover:bg-blue-700"
                      title="View Details"
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
                    {isActionable && canManage && !own && (
                      <button
                        type="button"
                        onClick={() => setEditRow(r)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0c6b64]"
                        title="Edit overtime"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                    )}
                    {isActionable && canManage && !own && (
                      <button
                        type="button"
                        onClick={() => setDeleteRow(r)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
                        title="Delete overtime"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              },
            },
          ]}
          data={filtered}
          emptyMessage="No overtime records"
        />
      </div>

      <Modal
        isOpen={!!actionRow}
        onClose={() => setActionRow(null)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} overtime`}
        footer={(
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
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
                variant={actionType === 'approve' ? 'teal' : 'danger'}
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
        <p className="mb-3 text-sm text-slate-600">
          {actionRow ? `${actionRow.employee_name} — ${actionRow.overtime_hours}h on ${actionRow.date}` : ''}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={actionType === 'reject' ? 'Reason for rejection (shown to the employee)' : 'Optional remarks'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0F766E] focus:ring-[#0F766E]/20"
          rows={3}
        />
      </Modal>

      {/* View details — Approve/Reject available here for approvers when actionable */}
      <Modal
        isOpen={!!viewRow}
        onClose={() => setViewRow(null)}
        title="Overtime details"
        footer={viewRow && viewRow.can_act ? (
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="danger" size="md" label="Reject" icon={HiXMark} onClick={() => startAction(viewRow, 'reject')} />
            <Button variant="Approve" size="md" label="Approve" icon={HiCheck} onClick={() => startAction(viewRow, 'approve')} />
          </div>
        ) : null}
      >
        {viewRow && (
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
            <dt className="font-medium text-slate-500">Employee</dt>
            <dd className="col-span-2 text-slate-800">{viewRow.employee_name} {viewRow.emp_id ? `(${viewRow.emp_id})` : ''}</dd>
            <dt className="font-medium text-slate-500">Department</dt>
            <dd className="col-span-2 text-slate-800">{viewRow.department || '—'}</dd>
            <dt className="font-medium text-slate-500">Date</dt>
            <dd className="col-span-2 text-slate-800">{viewRow.date}</dd>
            <dt className="font-medium text-slate-500">Overtime</dt>
            <dd className="col-span-2 text-slate-800">{Number(viewRow.overtime_hours || 0)} h</dd>
            <dt className="font-medium text-slate-500">Status</dt>
            <dd className="col-span-2"><StatusPill status={viewRow.overtime_status} /></dd>
            <dt className="font-medium text-slate-500">Description</dt>
            <dd className="col-span-2 text-slate-800 whitespace-pre-wrap">{viewRow.reason || '—'}</dd>

            {/* Approval trail */}
            <dt className="col-span-3 font-semibold text-slate-600 border-t border-slate-100 pt-2 mt-1">Approval Status</dt>

            {buildOvertimeTrail(viewRow).map((s) => (
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
                  {s.state === 'na' && <span className="text-slate-300">—</span>}
                  {s.remark && (
                    <p className="mt-0.5 text-xs italic text-slate-500 whitespace-pre-wrap">“{s.remark}”</p>
                  )}
                </dd>
              </Fragment>
            ))}

            {viewRow.overtime_rejection_reason && (
              <>
                <dt className="font-medium text-red-600">Rejection Reason</dt>
                <dd className="col-span-2 text-red-700 whitespace-pre-wrap">{viewRow.overtime_rejection_reason}</dd>
              </>
            )}
          </dl>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title="Delete overtime"
        footer={(
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" size="md" label="Cancel" onClick={() => setDeleteRow(null)} disabled={deleting} />
            <Button variant="danger" size="md" label="Delete" icon={HiTrash} loading={deleting} disabled={deleting} onClick={confirmDelete} />
          </div>
        )}
      >
        <p className="text-sm text-slate-600">
          {deleteRow ? `Delete the ${Number(deleteRow.overtime_hours || 0)}h overtime for ${deleteRow.employee_name} on ${deleteRow.date}? This cannot be undone.` : ''}
        </p>
      </Modal>

      {/* Add / Edit overtime (edit mode when editRow is set) */}
      <AddOvertimeModal
        isOpen={addModalOpen || !!editRow}
        editRecord={editRow}
        lockSelf={!canManage}
        selfEmployee={{ id: myEmployeeId, name: user?.name }}
        onClose={() => { setAddModalOpen(false); setEditRow(null) }}
        onAdded={load}
        minThresholdMinutes={settings?.overtimeSettings?.minimumThresholdMinutes || 0}
      />
    </div>
  )
}
