import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees, leaveRequests } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const readonlyClass =
  'w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800'

const initialFormData = {
  employeeId: '',
  leaveType: '',
  fromDate: '',
  toDate: '',
  reason: '',
  handoverNote: '',
  alternateContact: '',
}

function inclusiveDays(fromDateStr, toDateStr) {
  if (!fromDateStr || !toDateStr) return ''
  const start = new Date(`${fromDateStr}T00:00:00`)
  const end = new Date(`${toDateStr}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
  if (end < start) return '—'
  const diff = Math.round((end - start) / 86400000) + 1
  return String(diff)
}

function statusColor(s) {
  if (s === 'Approved') return 'green'
  if (s === 'Pending') return 'orange'
  if (s === 'Rejected') return 'red'
  return 'gray'
}

export default function LeaveAbsence() {
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ]

  const filtered = useMemo(() => {
    if (!status) return leaveRequests
    return leaveRequests.filter((l) => l.status === status)
  }, [status])

  const totalDays = useMemo(
    () => inclusiveDays(formData.fromDate, formData.toDate),
    [formData.fromDate, formData.toDate]
  )

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (key) => (fileList) => {
    setFiles((prev) => ({ ...prev, [key]: fileList }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setFiles({})
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, totalDays, files })
    handleCloseModal()
  }

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'type', label: 'Type' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button label="Approve" variant="secondary" size="sm" />
          <Button label="Reject" variant="ghost" size="sm" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Leave &amp; Absence</h1>
          <p className="mt-1 text-sm text-gray-500">Review requests and approvals.</p>
        </div>
        <Button label="Apply leave" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Status"
          name="status"
          type="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Apply Leave" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Leave request
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="leave-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="leave-employee"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select employee
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.empId})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="leave-type" className="mb-1 block text-sm font-medium text-gray-700">
                Leave Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="leave-type"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select leave type
                </option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
                <option value="Compensatory Off">Compensatory Off</option>
                <option value="Study Leave">Study Leave</option>
              </select>
            </div>
            <Input
              label="From Date"
              name="fromDate"
              type="date"
              value={formData.fromDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="To Date"
              name="toDate"
              type="date"
              value={formData.toDate}
              onChange={handleFormChange}
              required
            />
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="leave-total-days" className="mb-1 block text-sm font-medium text-gray-700">
                Total Days
              </label>
              <input
                id="leave-total-days"
                readOnly
                value={totalDays}
                tabIndex={-1}
                className={readonlyClass}
                aria-live="polite"
              />
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="leave-reason" className="mb-1 block text-sm font-medium text-gray-700">
              Reason
              <span className="text-red-500"> *</span>
            </label>
            <textarea
              id="leave-reason"
              name="reason"
              value={formData.reason}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              required
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="leave-handover" className="mb-1 block text-sm font-medium text-gray-700">
              Handover Note
            </label>
            <textarea
              id="leave-handover"
              name="handoverNote"
              value={formData.handoverNote}
              onChange={handleFormChange}
              placeholder="Who covers duties"
              className={textareaClass}
              rows={3}
            />
          </div>
          <Input
            label="Alternate Contact During Leave"
            name="alternateContact"
            value={formData.alternateContact}
            onChange={handleFormChange}
          />

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Supporting document
          </p>
          <FileUpload
            label="Medical Certificate / Proof"
            name="medicalProof"
            accept=".jpg,.png,.pdf"
            onChange={handleFileChange('medicalProof')}
            helpText="Required for sick leave > 2 days"
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
