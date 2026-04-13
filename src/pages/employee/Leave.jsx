import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiCalendar, HiClock, HiTrash, HiPencil } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  handoverNotes: '',
  alternateContact: '',
}

function statusColor(status) {
  if (status === 'Approved') return 'green'
  if (status === 'Pending') return 'orange'
  if (status === 'Rejected') return 'red'
  if (status === 'Cancelled') return 'gray'
  return 'gray'
}

export default function EmployeeLeave() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      leaveType: 'Annual Leave',
      startDate: '2026-04-15',
      endDate: '2026-04-17',
      days: 3,
      reason: 'Family vacation',
      status: 'Approved',
      appliedOn: '2026-04-01',
    },
    {
      id: 2,
      leaveType: 'Sick Leave',
      startDate: '2026-03-20',
      endDate: '2026-03-21',
      days: 2,
      reason: 'Medical appointment',
      status: 'Approved',
      appliedOn: '2026-03-19',
    },
    {
      id: 3,
      leaveType: 'Personal Leave',
      startDate: '2026-05-10',
      endDate: '2026-05-10',
      days: 1,
      reason: 'Personal matter',
      status: 'Pending',
      appliedOn: '2026-04-10',
    },
  ])
  const [leaveBalances, setLeaveBalances] = useState({
    annual: { total: 30, used: 5, remaining: 25, carryForward: 2 },
    sick: { total: 15, used: 2, remaining: 13, carryForward: 0 },
    personal: { total: 5, used: 1, remaining: 4, carryForward: 0 },
  })



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
    setEditMode(false)
    setEditingId(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editMode) {
      // Update existing leave request
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === editingId
            ? {
                ...req,
                leaveType: formData.leaveType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason,
                handoverNotes: formData.handoverNotes,
                alternateContact: formData.alternateContact,
              }
            : req
        )
      )
      alert('Leave request updated successfully!')
    } else {
      // Add new leave request
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

      const newRequest = {
        id: leaveRequests.length + 1,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        reason: formData.reason,
        handoverNotes: formData.handoverNotes,
        alternateContact: formData.alternateContact,
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
      }
      setLeaveRequests((prev) => [...prev, newRequest])

      // Update leave balance
      const leaveTypeKey = formData.leaveType.toLowerCase().split(' ')[0]
      if (leaveBalances[leaveTypeKey]) {
        setLeaveBalances((prev) => ({
          ...prev,
          [leaveTypeKey]: {
            ...prev[leaveTypeKey],
            used: prev[leaveTypeKey].used + days,
            remaining: prev[leaveTypeKey].remaining - days,
          },
        }))
      }

      alert('Leave request submitted successfully!')
    }

    handleCloseModal()
  }

  const handleEdit = (id) => {
    const request = leaveRequests.find((r) => r.id === id)
    if (request && request.status === 'Pending') {
      setFormData({
        leaveType: request.leaveType,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        handoverNotes: request.handoverNotes || '',
        alternateContact: request.alternateContact || '',
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    } else if (request) {
      alert('Cannot edit leave requests that are not pending.')
    }
  }

  const handleDelete = (id) => {
    const request = leaveRequests.find((r) => r.id === id)
    if (request && request.status !== 'Pending') {
      alert('Cannot cancel leave requests that are not pending.')
      return
    }
    if (confirm('Are you sure you want to cancel this leave request?')) {
      setLeaveRequests((prev) => prev.filter((r) => r.id !== id))
      alert('Leave request cancelled successfully!')
    }
  }

  const columns = [
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'appliedOn', label: 'Applied On' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            label="Edit"
            variant="ghost"
            size="sm"
            icon={HiPencil}
            onClick={() => handleEdit(row.id)}
            disabled={row.status === 'Approved' || row.status === 'Rejected'}
          />
          <Button
            label="Delete"
            variant="ghost"
            size="sm"
            icon={HiTrash}
            onClick={() => handleDelete(row.id)}
            disabled={row.status === 'Approved'}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Apply for leave and track your requests.</p>
        </div>
        <Button label="Apply for Leave" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Annual Leave"
          value={leaveBalances.annual.remaining}
          subtitle={`of ${leaveBalances.annual.total} days`}
          color="blue"
          icon={HiCalendar}
        />
        <StatCard
          title="Sick Leave"
          value={leaveBalances.sick.remaining}
          subtitle={`of ${leaveBalances.sick.total} days`}
          color="green"
          icon={HiClock}
        />
        <StatCard
          title="Personal Leave"
          value={leaveBalances.personal.remaining}
          subtitle={`of ${leaveBalances.personal.total} days`}
          color="orange"
          icon={HiCalendar}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Leave Summary</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Total Annual Leave</span>
            <span className="font-semibold text-gray-900">30 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Used This Year</span>
            <span className="font-semibold text-gray-900">5 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Remaining Balance</span>
            <span className="font-semibold text-green-600">25 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Carry Forward</span>
            <span className="font-semibold text-gray-900">5 days</span>
          </div>
        </div>
      </div>

      <Table columns={columns} data={leaveRequests} pageSize={5} />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Leave History</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Annual Leave - Family vacation</div>
              <div className="text-xs text-gray-500">Apr 15-17, 2026 • 3 days</div>
            </div>
            <Badge label="Approved" color="green" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Sick Leave - Medical appointment</div>
              <div className="text-xs text-gray-500">Mar 20-21, 2026 • 2 days</div>
            </div>
            <Badge label="Approved" color="green" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Personal Leave - Personal matter</div>
              <div className="text-xs text-gray-500">Feb 10, 2026 • 1 day</div>
            </div>
            <Badge label="Approved" color="green" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
            <div>
              <div className="font-medium text-gray-900">Annual Leave - Year-end break</div>
              <div className="text-xs text-gray-500">Dec 25-31, 2025 • 5 days</div>
            </div>
            <Badge label="Approved" color="green" />
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Leave Request' : 'Apply for Leave'} size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
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
                <option value="Personal Leave">Personal Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleFormChange}
              required
            />
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
              Handover Notes
            </label>
            <textarea
              id="leave-handover"
              name="handoverNotes"
              value={formData.handoverNotes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={2}
              placeholder="Tasks to be handled during your absence"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input
              label="Alternate Contact"
              name="alternateContact"
              value={formData.alternateContact}
              onChange={handleFormChange}
              placeholder="Colleague to contact"
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Supporting Document (Optional)
          </p>
          <FileUpload
            label="Medical Certificate / Supporting Document"
            name="supportingDoc"
            accept=".pdf,.jpg,.png,.doc,.docx"
            onChange={handleFileChange('supportingDoc')}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label={editMode ? 'Update Request' : 'Submit Request'} variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
