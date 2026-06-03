import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { getAttendanceDetail } from '../../services/attendanceService.js'

function displayValue(value) {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && value.trim() === '') return 'N/A'
  return value
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{displayValue(value)}</p>
    </div>
  )
}

export default function AttendanceDetailModal({ recordId, open, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !recordId) return
    setLoading(true)
    setError('')
    getAttendanceDetail(recordId)
      .then(setDetail)
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [open, recordId])

  const photo = detail?.profile_photo_url
  const name = detail?.employee_name || '—'

  return (
    <Modal isOpen={open} onClose={onClose} title="Attendance details" size="lg">
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {detail && !loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            {photo ? (
              <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-xl font-semibold text-white">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">{detail.emp_id} · {detail.department || 'N/A'}</p>
              <p className="text-sm text-slate-500">{detail.job_title || 'N/A'}</p>
            </div>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Attendance</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Date" value={detail.date} />
              <Field label="Shift" value={detail.shift_name} />
              <Field label="Status" value={detail.display_status || detail.status} />
              <Field label="Check in" value={detail.check_in_time} />
              <Field label="Check out" value={detail.check_out_time} />
              <Field label="Hours worked" value={detail.worked_hours ?? detail.total_hours} />
              <Field label="Late (minutes)" value={detail.late_minutes ?? (detail.is_late ? 0 : null)} />
              <Field label="Overtime (hours)" value={detail.overtime_hours ?? 0} />
              <Field label="Work mode" value={detail.work_mode} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Approval</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Regularization" value={detail.regularization_status} />
              <Field label="Approved by" value={detail.approved_by_name} />
              <Field label="Approved at" value={detail.approved_at} />
            </div>
          </section>

          {detail.location_tracking_enabled && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Location</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Check-in location" value={detail.check_in_address || (detail.check_in_latitude ? `${detail.check_in_latitude}, ${detail.check_in_longitude}` : null)} />
                <Field label="Check-out location" value={detail.check_out_address || (detail.check_out_latitude ? `${detail.check_out_latitude}, ${detail.check_out_longitude}` : null)} />
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Audit</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Created by" value={detail.created_by_name} />
              <Field label="Updated by" value={detail.updated_by_name} />
            </div>
          </section>

          {detail.notes && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Notes</h3>
              <p className="text-sm text-slate-700 rounded-lg bg-slate-50 p-3 border border-slate-100">{detail.notes}</p>
            </section>
          )}
        </div>
      )}
    </Modal>
  )
}
