import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { HiExclamationTriangle } from 'react-icons/hi2'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { createTermination } from '../../services/exitManagementService.js'

const NOTICE_OPTIONS = [
  { value: '0', label: 'Immediate' },
  { value: '7', label: '1 Week' },
  { value: '30', label: '1 Month' },
  { value: '90', label: '3 Months' },
]

export default function TerminationModal({ isOpen, onClose, onSuccess, employees, terminationTypes }) {
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [terminationTypeId, setTerminationTypeId] = useState('')
  const [lastWorkingDay, setLastWorkingDay] = useState('')
  const [noticePeriod, setNoticePeriod] = useState('30')
  const [reasonDetail, setReasonDetail] = useState('')
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

  const typeOptions = useMemo(
    () => (terminationTypes || []).map((t) => ({ value: String(t.id), label: t.name })),
    [terminationTypes]
  )

  const validate = () => {
    const errs = {}
    if (!selectedEmployee) errs.employee = 'Please select an employee.'
    if (!terminationTypeId) errs.type = 'Please select a termination type.'
    if (!lastWorkingDay) errs.lastWorkingDay = 'Please select last working day.'
    if (!reasonDetail || reasonDetail.trim().length < 20) {
      errs.reasonDetail = 'Reason must be at least 20 characters.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp)
    setEmployeeSearch(emp.full_name)
    setShowDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await Swal.fire({
      title: 'Confirm Termination',
      text: `This will initiate the termination process for ${selectedEmployee.full_name}. This action requires proper documentation.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, proceed with termination',
    })

    if (!result.isConfirmed) return

    setSubmitting(true)
    try {
      await createTermination({
        employee_id: selectedEmployee.id,
        termination_type_id: Number(terminationTypeId),
        last_working_day: lastWorkingDay,
        notice_period_days: Number(noticePeriod),
        exit_reason: reasonDetail.trim(),
        is_voluntary: false,
      })
      toast.success('Termination initiated successfully')
      onSuccess?.()
      resetForm()
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate termination')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setEmployeeSearch('')
    setSelectedEmployee(null)
    setTerminationTypeId('')
    setLastWorkingDay('')
    setNoticePeriod('30')
    setReasonDetail('')
    setErrors({})
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose?.() }}
      title="Initiate Termination"
      description="Record an involuntary employment termination"
      size="lg"
      icon={HiExclamationTriangle}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-xs font-medium text-rose-800">
            UK employment law requires documented grounds before termination. Attach PIP records or written warnings.
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
          label="Termination Type"
          name="termination_type_id"
          type="select"
          value={terminationTypeId}
          onChange={(e) => setTerminationTypeId(e.target.value)}
          options={typeOptions}
          placeholder="Select termination type"
          required
          error={errors.type}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Last Working Day"
            name="last_working_day"
            type="date"
            value={lastWorkingDay}
            onChange={(e) => setLastWorkingDay(e.target.value)}
            required
            error={errors.lastWorkingDay}
          />
          <Input
            label="Notice Period"
            name="notice_period"
            type="select"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            options={NOTICE_OPTIONS}
          />
        </div>

        <div>
          <label htmlFor="termination-reason" className="mb-1 block text-sm font-medium text-gray-700">
            Reason Detail <span className="text-red-500">*</span>
          </label>
          <textarea
            id="termination-reason"
            rows={4}
            value={reasonDetail}
            onChange={(e) => setReasonDetail(e.target.value)}
            placeholder="Provide detailed grounds for termination (minimum 20 characters)..."
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.reasonDetail
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-300 focus:border-[#004CA5] focus:ring-blue-100'
            }`}
          />
          {errors.reasonDetail && <p className="mt-1 text-xs text-red-600">{errors.reasonDetail}</p>}
          <p className="mt-1 text-xs text-gray-400">{reasonDetail.length}/20 minimum characters</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button label="Cancel" variant="outline" onClick={() => { resetForm(); onClose?.() }} />
          <Button
            type="submit"
            label="Initiate Termination"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          />
        </div>
      </form>
    </Modal>
  )
}
