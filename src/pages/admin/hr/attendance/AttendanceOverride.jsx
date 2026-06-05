import { useCallback, useEffect, useState } from 'react'
import {
  HiArrowPath,
  HiCheck,
  HiIdentification,
} from 'react-icons/hi2'
import { Button } from '../../../../components/ui/Button.jsx'
import { Tooltip } from '../../../../components/ui/Tooltip.jsx'
import { useAuth } from '../../../../context/AuthContext.jsx'
import { canManageAttendanceOverride } from '../../../../utils/rbac.js'
import { markAttendanceOverride } from '../../../../services/attendanceService.js'
import { listEmployees } from '../../../../services/employeeService.js'

const EMPTY = {
  employeeId: '',
  date: new Date().toISOString().split('T')[0],
  checkInTime: '',
  checkOutTime: '',
  workMode: 'In Office',
  status: 'Present',
  overtimeHours: '',
  notes: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none'
const labelClass = 'text-sm font-medium text-slate-700'

export default function AttendanceOverride() {
  const { allowedModules } = useAuth()
  const canManage = canManageAttendanceOverride(allowedModules)

  const [form, setForm] = useState(EMPTY)
  const [empList, setEmpList] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadEmployees = useCallback(async () => {
    try {
      const data = await listEmployees({ limit: 200 })
      setEmpList(data?.employees || data?.records || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await markAttendanceOverride({
        employeeId: parseInt(form.employeeId, 10),
        date: form.date,
        checkInTime: form.checkInTime || null,
        checkOutTime: form.checkOutTime || null,
        workMode: form.workMode,
        status: form.status,
        overtimeHours: form.overtimeHours ? parseFloat(form.overtimeHours) : null,
        notes: form.notes || null,
      })
      setMessage('Attendance override saved successfully.')
      setForm(EMPTY)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm(EMPTY)
    setError('')
    setMessage('')
  }

  if (!canManage) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        You need the <strong>attendance.manage</strong> permission to create or edit attendance manually.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">Attendance Override</h2>
      </div>
      <div className="p-6">
        <p className="mb-6 text-sm text-slate-500">
          HR and admins only. Manual dates, punch times, and status corrections are audited.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Employee</label>
          <div className="relative mt-1">
            <HiIdentification className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              required
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className={`${inputClass} pl-10`}
            >
              <option value="">Select employee</option>
              {empList.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.emp_id})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              {['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Remote', 'Work From Home'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Check in</label>
            <input type="time" value={form.checkInTime} onChange={(e) => setForm((f) => ({ ...f, checkInTime: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Check out</label>
            <input type="time" value={form.checkOutTime} onChange={(e) => setForm((f) => ({ ...f, checkOutTime: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Work mode</label>
            <select value={form.workMode} onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))} className={inputClass}>
              {['In Office', 'Remote', 'Work From Home', 'Field Duty'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Overtime (hours)</label>
            <input type="number" min="0" step="0.5" value={form.overtimeHours} onChange={(e) => setForm((f) => ({ ...f, overtimeHours: e.target.value }))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass} rows={3} placeholder="Optional audit note" />
        </div>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          <Tooltip content="Save manual attendance (audited)">
            <Button
              type="submit"
              variant="teal"
              size="md"
              label="Save Override"
              icon={HiCheck}
              loading={submitting}
              disabled={submitting}
            />
          </Tooltip>
          <Tooltip content="Clear all fields">
            <Button
              type="button"
              variant="outline"
              size="md"
              label="Reset"
              icon={HiArrowPath}
              disabled={submitting}
              onClick={resetForm}
            />
          </Tooltip>
        </div>
      </form>
      </div>
    </div>
  )
}
