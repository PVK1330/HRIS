import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiCheck, HiXMark, HiClock, HiCheckBadge, HiDocumentText, HiMagnifyingGlass, HiPlus } from 'react-icons/hi2'
import { Badge } from '../../../../components/ui/Badge.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { IconActionButton } from '../../../../components/ui/IconActionButton.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Tooltip } from '../../../../components/ui/Tooltip.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { canApproveRegularization, canManageAttendanceOverride } from '../../../../utils/rbac.js'
import {
  getOvertimeRecords,
  processOvertime,
} from '../../../../services/attendanceService.js'
import AddOvertimeModal from '../../../../components/attendance/AddOvertimeModal.jsx'
import { useAttendanceSettings } from '../../../../hooks/useAttendanceSettings.js'

function statusTone(s) {
  if (s === 'Approved') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  if (s === 'Rejected') return 'bg-red-50 text-red-700 ring-red-600/20'
  if (s === 'Pending') return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  return 'bg-slate-50 text-slate-600 ring-slate-500/20'
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusTone(status)}`}>
      {status || '—'}
    </span>
  )
}

export default function OvertimeApprovals() {
  const { allowedModules } = useAuth()
  const canApprove = canApproveRegularization(allowedModules)
  const canManage = canManageAttendanceOverride(allowedModules)

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionRow, setActionRow] = useState(null)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
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

  const metrics = useMemo(() => {
    const pending = records.filter((r) => r.overtime_status === 'Pending')
    const approved = records.filter((r) => r.overtime_status === 'Approved')
    const processed = records.filter((r) => r.overtime_status === 'Approved' || r.overtime_status === 'Rejected')
    const approvedHours = approved.reduce((a, r) => a + Number(r.overtime_hours || 0), 0)
    return { pending: pending.length, approvedHours: Math.round(approvedHours * 100) / 100, processed: processed.length }
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
          { label: 'PROCESSED', count: metrics.processed, bgColor: 'bg-[#10B981]', icon: HiCheckBadge },
        ].map((card, idx) => (
          <div
            key={idx}
            className="group flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 text-left shadow-sm min-w-0"
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
          </div>
        ))}
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Overtime Management</h2>
          <div className="flex gap-2">
            {canManage && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-none bg-white px-3 py-1.5 text-xs font-bold text-[#0F766E] transition-colors hover:bg-slate-50 shadow-sm"
              >
                <HiPlus className="h-4 w-4" /> Add Overtime
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <p className="text-xs font-medium text-slate-500">{filtered.length} record(s)</p>
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
              render: (v) => <Badge>{Number(v || 0)} h</Badge>,
            },
            {
              key: 'overtime_status',
              label: 'Status',
              render: (v) => <StatusPill status={v} />,
            },
            {
              key: 'approver_name',
              label: 'Approver',
              render: (v, r) => (
                <span className="text-sm text-slate-600">
                  {r.overtime_status === 'Pending' ? '—' : (v || '—')}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, r) => {
                if (r.overtime_status !== 'Pending') {
                  return <span className="text-xs text-slate-400">No action</span>
                }
                if (!canApprove) return <span className="text-xs text-slate-400">—</span>
                return (
                  <div className="flex flex-wrap gap-2">
                    <IconActionButton
                      label="Approve"
                      icon={HiCheck}
                      tone="approve"
                      tooltip="Approve & forward to department"
                      onClick={() => { setActionRow(r); setActionType('approve'); setReason('') }}
                    />
                    <IconActionButton
                      label="Reject"
                      icon={HiXMark}
                      tone="reject"
                      tooltip="Reject this overtime"
                      onClick={() => { setActionRow(r); setActionType('reject'); setReason('') }}
                    />
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
        <p className="mb-3 text-sm text-slate-600">
          {actionRow ? `${actionRow.employee_name} — ${actionRow.overtime_hours}h on ${actionRow.date}` : ''}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={actionType === 'reject' ? 'Reason for rejection (shown to the employee)' : 'Optional remarks'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={3}
        />
      </Modal>

      <AddOvertimeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={load}
        minThresholdMinutes={settings?.overtimeSettings?.minimumThresholdMinutes || 0}
      />
    </div>
  )
}
