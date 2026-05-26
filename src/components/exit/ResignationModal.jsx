import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { HiDocumentText } from 'react-icons/hi2'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { createResignation } from '../../services/exitManagementService.js'

const REASON_OPTIONS = [
  { value: 'Career Growth', label: 'Career Growth' },
  { value: 'Personal Reasons', label: 'Personal Reasons' },
  { value: 'Relocation', label: 'Relocation' },
  { value: 'Higher Studies', label: 'Higher Studies' },
  { value: 'Better Opportunity', label: 'Better Opportunity' },
  { value: 'Health', label: 'Health' },
  { value: 'Other', label: 'Other' },
]

export default function ResignationModal({ isOpen, onClose, onSuccess, employees }) {
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonDetail, setReasonDetail] = useState('')
  const [lastWorkingDay, setLastWorkingDay] = useState('')
  const [noticePeriodDays, setNoticePeriodDays] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees || []
    const q = employeeSearch.toLowerCase()
    return (employees || []).filter(
      (emp) =>
        emp.full_name.toLowerCase().includes(q) || emp.emp_id?.toLowerCase().includes(q)
    )
  }, [employees, employeeSearch])

  const minDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }, [])

  const validate = () => {
    const errs = {}
    if (!selectedEmployee) errs.employee = 'Please select an employee.'
    if (!reason) errs.reason = 'Please select a reason.'
    if (!lastWorkingDay) {
      errs.lastWorkingDay = 'Please select last working day.'
    } else {
      const selected = new Date(lastWorkingDay)
      const min = new Date()
      min.setDate(min.getDate() + 7)
      min.setHours(0, 0, 0, 0)
      if (selected < min) {
        errs.lastWorkingDay = 'Last working day must be at least 7 days from today.'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp)
    setEmployeeSearch(emp.full_name)
    setShowDropdown(false)
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    setLastWorkingDay(date)
    if (date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lwd = new Date(date)
      const diff = Math.ceil((lwd - today) / (1000 * 60 * 60 * 24))
      setNoticePeriodDays(Math.max(0, diff))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createResignation({
        employee_id: selectedEmployee.id,
        exit_reason: reason,
        reason_detail: reasonDetail || undefined,
        last_working_day: lastWorkingDay,
        notice_period_days: Number(noticePeriodDays),
      })
      toast.success('Resignation submitted successfully')
      onSuccess?.()
      resetForm()
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit resignation')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setEmployeeSearch('')
    setSelectedEmployee(null)
    setReason('')
    setReasonDetail('')
    setLastWorkingDay('')
    setNoticePeriodDays(30)
    setErrors({})
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose?.() }}
      title="Submit Resignation"
      description="Record a voluntary resignation request"
      size="lg"
      icon={HiDocumentText}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-800">
            UK statutory minimum: 1 week per year of service, max 12 weeks. Your contract may require longer.
          </p>
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Employee <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={employeeSearch}
            onChange={(e) => {
              setEmployeeSearch(e.target.value)
              setSelectedEmployee(null)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by name or ID..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-[#004CA5] focus:ring-blue-100"
          />
          {showDropdown && filteredEmployees.length > 0 && !selectedEmployee && (
            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filteredEmployees.slice(0, 20).map((emp) => (
                <li
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-800">{emp.full_name}</span>
                  {emp.emp_id && <span className="ml-2 text-xs text-gray-400">({emp.emp_id})</span>}
                </li>
              ))}
            </ul>
          )}
          {errors.employee && <p className="mt-1 text-xs text-red-600">{errors.employee}</p>}
        </div>

        <Input
          label="Reason"
          name="reason"
          type="select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REASON_OPTIONS}
          placeholder="Select a reason"
          required
          error={errors.reason}
        />

        <div>
          <label htmlFor="resignation-detail" className="mb-1 block text-sm font-medium text-gray-700">Reason Detail</label>
          <textarea
            id="resignation-detail"
            rows={3}
            value={reasonDetail}
            onChange={(e) => setReasonDetail(e.target.value)}
            placeholder="Optional additional details..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-[#004CA5] focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Last Working Day"
              name="last_working_day"
              type="date"
              value={lastWorkingDay}
              onChange={handleDateChange}
              required
              error={errors.lastWorkingDay}
            />
          </div>
          <Input
            label="Notice Period (Days)"
            name="notice_period_days"
            type="number"
            value={noticePeriodDays}
            onChange={(e) => setNoticePeriodDays(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button label="Cancel" variant="outline" onClick={() => { resetForm(); onClose?.() }} />
          <Button
            type="submit"
            label="Submit Resignation"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          />
        </div>
      </form>
    </Modal>
  )
}
