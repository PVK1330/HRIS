import { useCallback, useEffect, useState } from 'react'
import { HiCheck, HiXMark } from 'react-icons/hi2'
import { Badge } from '../../../../components/ui/Badge.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Modal } from '../../../../components/ui/Modal.jsx'
import { Table } from '../../../../components/ui/Table.jsx'
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
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Submit regularization</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <Button type="submit" className="mt-4" disabled={submitting}>
          Submit request
        </Button>
      </form>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Approval inbox</h2>
        <Table
          loading={loading}
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
              label: '',
              render: (_, r) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-emerald-600"
                    onClick={() => { setActionRow(r); setActionType('approve'); setReason('') }}
                  >
                    <HiCheck className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => { setActionRow(r); setActionType('reject'); setReason('') }}
                  >
                    <HiXMark className="h-5 w-5" />
                  </button>
                </div>
              ),
            },
          ]}
          data={pending}
          emptyMessage="No pending regularizations"
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <Table
          loading={loading}
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
      </section>

      <Modal
        open={!!actionRow}
        onClose={() => setActionRow(null)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} request`}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional remarks"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={3}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setActionRow(null)}>Cancel</Button>
          <Button onClick={handleAction} disabled={submitting}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  )
}
