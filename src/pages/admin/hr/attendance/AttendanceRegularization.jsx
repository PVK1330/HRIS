import { useCallback, useEffect, useState } from 'react'
import {
  HiCheck,
  HiPaperAirplane,
  HiXMark,
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

const EMPTY = { date: '', checkInTime: '', checkOutTime: '', reason: '', workMode: 'In Office' }
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none'
const labelClass = 'text-sm font-medium text-slate-700'

export default function AttendanceRegularization() {
  const { allowedModules } = useAuth()
  const canSubmit = canRequestRegularization(allowedModules)
  const canApprove = canApproveRegularization(allowedModules)

  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [form, setForm] = useState(EMPTY)
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
      const [p, h] = await Promise.all([
        getPendingRegularizations(),
        getRegularizationHistory({ limit: 50 }),
      ])
      setPending(p.records || [])
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

  return (
    <div className="space-y-6">
      {canSubmit && (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Submit Regularization</h2>
          </div>
          <div className="p-6">
            <p className="mb-4 text-sm text-slate-500">Request a correction for a past attendance date.</p>
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
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
              <Tooltip content="Send regularization request to approver">
                <Button
                  type="submit"
                  variant="teal"
                  size="md"
                  label="Submit Request"
                  icon={HiPaperAirplane}
                  loading={submitting}
                  disabled={submitting}
                  className="mt-0"
                />
              </Tooltip>
              <Tooltip content="Clear the form">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  label="Cancel"
                  icon={HiXMark}
                  disabled={submitting}
                  onClick={() => { setForm(EMPTY); setError('') }}
                />
              </Tooltip>
            </div>
          </div>
        </form>
      )}

      {!canSubmit && !canApprove && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          You do not have permission to submit or approve regularizations.
        </div>
      )}

      {canApprove && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Approval Inbox</h2>
          </div>
          <Table
            loading={loading}
            square
            columns={[
              { key: 'employee_name', label: 'Employee' },
              { key: 'date', label: 'Date' },
              { key: 'regularization_reason', label: 'Reason' },
              {
                key: 'pending_approver_role',
                label: 'Current approver',
                render: (_, r) => r.pending_approver_role || `Level ${r.pending_level || r.current_approval_level || '—'}`,
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
                      tooltip="Approve this request"
                      onClick={() => { setActionRow(r); setActionType('approve'); setReason('') }}
                    />
                    <IconActionButton
                      label="Reject"
                      icon={HiXMark}
                      tone="reject"
                      tooltip="Reject this request"
                      onClick={() => { setActionRow(r); setActionType('reject'); setReason('') }}
                    />
                  </div>
                ),
              },
            ]}
            data={pending}
            emptyMessage="No pending regularizations"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">History</h2>
        </div>
        <Table
          loading={loading}
          square
          columns={[
            { key: 'employee_name', label: 'Employee' },
            { key: 'date', label: 'Date' },
            {
              key: 'regularization_status',
              label: 'Status',
              render: (_, r) => <Badge>{r.regularization_status}</Badge>,
            },
            { key: 'pending_approver_role', label: 'Approver level' },
          ]}
          data={history}
          emptyMessage="No history"
        />
      </div>

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
    </div>
  )
}
