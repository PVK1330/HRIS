import { useCallback, useEffect, useState } from 'react'
import { HiCheck, HiXMark, HiClock } from 'react-icons/hi2'
import { Badge } from '../../../../components/ui/Badge.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { IconActionButton } from '../../../../components/ui/IconActionButton.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Tooltip } from '../../../../components/ui/Tooltip.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { canApproveRegularization } from '../../../../utils/rbac.js'
import {
  getPendingOvertime,
  processOvertime,
} from '../../../../services/attendanceService.js'

export default function OvertimeApprovals() {
  const { allowedModules } = useAuth()
  const canApprove = canApproveRegularization(allowedModules)

  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionRow, setActionRow] = useState(null)
  const [actionType, setActionType] = useState('')
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = await getPendingOvertime({ limit: 100 })
      setPending(p.records || [])
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

  if (!canApprove) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        You do not have permission to approve overtime requests.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <HiClock className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-slate-900">Overtime approval inbox</h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Approve recorded overtime to forward it to the department for processing.
        </p>
        {error && <p className="mb-3 text-sm text-red-600" role="alert">{error}</p>}
        <Table
          loading={loading}
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
              key: 'actions',
              label: 'Actions',
              render: (_, r) => (
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
              ),
            },
          ]}
          data={pending}
          emptyMessage="No pending overtime requests"
        />
      </section>

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
    </div>
  )
}
