import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal.jsx'
import { listEmployeesDropdown } from '../../services/employeeService.js'
import { addOvertime, updateOvertime } from '../../services/attendanceService.js'

const inputClass = 'w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/25'
const lockedClass = 'w-full h-11 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 flex items-center'
const labelClass = 'mb-1 block text-sm font-medium text-slate-900'

const EMPTY = { employeeId: '', overtimeDate: '', hours: '', minutes: '', description: '' }

function fmtDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

function draftFromRecord(rec) {
  const dec = Number(rec.overtime_hours) || 0
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return {
    employeeId: String(rec.employee_id || ''),
    overtimeDate: rec.date || '',
    hours: h ? String(h) : '',
    minutes: m ? String(m) : '',
    description: rec.reason || rec.notes || '',
  }
}

export default function AddOvertimeModal({
  isOpen, onClose, onAdded, minThresholdMinutes = 0, editRecord = null,
  lockSelf = false, selfEmployee = null,
}) {
  const isEdit = !!editRecord
  // Non-managers (employees) can only add overtime for themselves.
  const selfLocked = !isEdit && lockSelf
  const [formData, setFormData] = useState(EMPTY)
  const [employees, setEmployees] = useState([])
  const [empLoadError, setEmpLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (isEdit) {
      setFormData(draftFromRecord(editRecord))
    } else if (selfLocked) {
      setFormData({ ...EMPTY, employeeId: String(selfEmployee?.id || '') })
    } else {
      setFormData(EMPTY)
      setEmpLoadError('')
      listEmployeesDropdown()
        .then((list) => {
          const arr = Array.isArray(list) ? list : []
          // If scope returns empty (e.g. dept manager with no reports yet) fall back to self
          if (arr.length === 0 && selfEmployee?.id) {
            setEmployees([{ id: selfEmployee.id, full_name: selfEmployee.name || 'Me', emp_id: '' }])
            setFormData((p) => ({ ...p, employeeId: String(selfEmployee.id) }))
          } else {
            setEmployees(arr)
          }
        })
        .catch(() => {
          setEmpLoadError('Could not load employee list.')
          // Fall back to self so the form is still usable
          if (selfEmployee?.id) {
            setEmployees([{ id: selfEmployee.id, full_name: selfEmployee.name || 'Me', emp_id: '' }])
            setFormData((p) => ({ ...p, employeeId: String(selfEmployee.id) }))
          }
        })
    }
  }, [isOpen, isEdit, editRecord, selfLocked, selfEmployee])

  const totalMinutes = (parseInt(formData.hours, 10) || 0) * 60 + (parseInt(formData.minutes, 10) || 0)
  const decimalHours = Math.round((totalMinutes / 60) * 100) / 100
  const belowThreshold = minThresholdMinutes > 0 && totalMinutes > 0 && totalMinutes < minThresholdMinutes

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isEdit) {
      if (!formData.overtimeDate) { toast.error('Please select a date.'); return }
      if (!selfLocked && !formData.employeeId) { toast.error('Please select an employee.'); return }
    }
    if (totalMinutes <= 0) {
      toast.error('Please enter an overtime duration.')
      return
    }
    if (belowThreshold) {
      toast.error(`Overtime must be at least ${minThresholdMinutes} minute(s).`)
      return
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateOvertime(editRecord.id, {
          overtimeHours: decimalHours,
          description: formData.description || undefined,
        })
        toast.success('Overtime updated.')
      } else {
        await addOvertime({
          employeeId: selfLocked
            ? (selfEmployee?.id ? Number(selfEmployee.id) : undefined)
            : Number(formData.employeeId),
          date: formData.overtimeDate,
          overtimeHours: decimalHours, // backend stores decimal hours (1h 30m → 1.5)
          description: formData.description || undefined,
          status: 'Pending',
        })
        toast.success(selfLocked ? 'Overtime request submitted.' : 'Overtime added successfully.')
      }
      if (onAdded) onAdded()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || (isEdit ? 'Failed to update overtime.' : 'Failed to add overtime.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Overtime' : 'Add Overtime'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className={labelClass}>Employee {!isEdit && !selfLocked && <span className="text-red-500">*</span>}</label>
          {isEdit ? (
            <div className={lockedClass}>{editRecord.employee_name} {editRecord.emp_id ? `(${editRecord.emp_id})` : ''}</div>
          ) : selfLocked ? (
            <div className={lockedClass}>{selfEmployee?.name || 'You'}</div>
          ) : (
            <>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData((p) => ({ ...p, employeeId: e.target.value }))}
                className={inputClass}
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || emp.name}{emp.emp_id ? ` (${emp.emp_id})` : ''}
                  </option>
                ))}
              </select>
              {empLoadError && (
                <p className="mt-1 text-xs text-red-600">{empLoadError}</p>
              )}
            </>
          )}
        </div>

        <div>
          <label className={labelClass}>Overtime date {!isEdit && <span className="text-red-500">*</span>}</label>
          {isEdit ? (
            <div className={lockedClass}>{editRecord.date}</div>
          ) : (
            <input
              type="date"
              value={formData.overtimeDate}
              onChange={(e) => setFormData((p) => ({ ...p, overtimeDate: e.target.value }))}
              className={inputClass}
              required
            />
          )}
        </div>

        <div>
          <label className={labelClass}>Overtime duration <span className="text-red-500">*</span></label>
          <div className="flex items-stretch gap-3">
            <div className="flex-1">
              <div className="flex items-center rounded-md border border-slate-300 bg-white px-3 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E]/25">
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={formData.hours}
                  onChange={(e) => setFormData((p) => ({ ...p, hours: e.target.value }))}
                  placeholder="0"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none"
                />
                <span className="pl-2 text-xs font-semibold text-slate-400">hours</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center rounded-md border border-slate-300 bg-white px-3 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E]/25">
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  value={formData.minutes}
                  onChange={(e) => setFormData((p) => ({ ...p, minutes: e.target.value }))}
                  placeholder="0"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none"
                />
                <span className="pl-2 text-xs font-semibold text-slate-400">minutes</span>
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className={belowThreshold ? 'font-medium text-red-600' : 'text-slate-500'}>
              {totalMinutes > 0 ? `Total: ${fmtDuration(totalMinutes)} (${decimalHours} hrs)` : 'Enter hours and/or minutes'}
            </span>
            {minThresholdMinutes > 0 && (
              <span className="text-slate-400">Min: {fmtDuration(minThresholdMinutes)}</span>
            )}
          </div>
          {belowThreshold && (
            <p className="mt-1 text-xs font-medium text-red-600">
              Below the minimum overtime threshold of {minThresholdMinutes} minute(s).
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Reason / Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="What was the overtime for?"
            className={`${inputClass} h-24 py-2 resize-none`}
          />
        </div>

        {!isEdit && (
          <div className="rounded-md bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
            This request will be submitted as <strong>Pending</strong> for approval.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || totalMinutes <= 0 || belowThreshold}
            className="rounded-md bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Add Overtime')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
