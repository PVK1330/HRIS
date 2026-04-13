import { useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Toggle } from '../../../components/ui/Toggle.jsx'
import { employees, exitKpis, exitRecords } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  employeeId: '',
  exitType: '',
  lastWorkingDay: '',
  noticePeriod: '',
  exitReason: '',
  exitInterviewDate: '',
  exitInterviewBy: '',
  itAssetsReturned: false,
  accessRevoked: false,
  finalSettlementProcessed: false,
  nocIssued: false,
  experienceLetterIssued: false,
}

function statusColor(s) {
  if (s === 'Closed') return 'gray'
  if (s === 'Notice') return 'orange'
  if (s === 'Offboarding') return 'blue'
  return 'purple'
}

export default function ExitManagement() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name) => (checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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
    console.log({ formData, files })
    handleCloseModal()
  }

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'lastDay', label: 'Last day' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Open checklist" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Exit Management</h1>
          <p className="mt-1 text-sm text-gray-500">Track notice periods and offboarding tasks.</p>
        </div>
        <Button label="Initiate exit" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="In notice" value={exitKpis.inNotice} subtitle="Employees" color="orange" />
        <StatCard title="Exits this quarter" value={exitKpis.exitsThisQuarter} subtitle="Completed" color="blue" />
        <StatCard title="Exit interviews" value={exitKpis.exitInterviews} subtitle="Scheduled" color="purple" />
      </div>

      <Table columns={columns} data={exitRecords} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Initiate Exit" size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Exit process
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="exit-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="exit-employee"
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
            <div className="w-full">
              <label htmlFor="exit-type" className="mb-1 block text-sm font-medium text-gray-700">
                Exit Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="exit-type"
                name="exitType"
                value={formData.exitType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select exit type
                </option>
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="Retirement">Retirement</option>
                <option value="End of Contract">End of Contract</option>
                <option value="Abandonment">Abandonment</option>
              </select>
            </div>
            <Input
              label="Last Working Day"
              name="lastWorkingDay"
              type="date"
              value={formData.lastWorkingDay}
              onChange={handleFormChange}
              required
            />
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="exit-notice" className="mb-1 block text-sm font-medium text-gray-700">
                Notice Period
              </label>
              <select
                id="exit-notice"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select notice period</option>
                <option value="0 days">0 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
                <option value="As per contract">As per contract</option>
              </select>
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="exit-reason" className="mb-1 block text-sm font-medium text-gray-700">
              Exit Reason
              <span className="text-red-500"> *</span>
            </label>
            <textarea
              id="exit-reason"
              name="exitReason"
              value={formData.exitReason}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              required
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input
              label="Exit Interview Date"
              name="exitInterviewDate"
              type="date"
              value={formData.exitInterviewDate}
              onChange={handleFormChange}
            />
            <Input
              label="Exit Interview Conducted By"
              name="exitInterviewBy"
              value={formData.exitInterviewBy}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Clearance checklist
          </p>
          <div className="flex flex-col gap-4">
            <Toggle
              label="IT Assets Returned"
              checked={formData.itAssetsReturned}
              onChange={handleToggle('itAssetsReturned')}
            />
            <Toggle
              label="Access Revoked"
              checked={formData.accessRevoked}
              onChange={handleToggle('accessRevoked')}
            />
            <Toggle
              label="Final Settlement Processed"
              checked={formData.finalSettlementProcessed}
              onChange={handleToggle('finalSettlementProcessed')}
            />
            <Toggle
              label="NOC Issued"
              checked={formData.nocIssued}
              onChange={handleToggle('nocIssued')}
            />
            <Toggle
              label="Experience Letter Issued"
              checked={formData.experienceLetterIssued}
              onChange={handleToggle('experienceLetterIssued')}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Documents
          </p>
          <div className="space-y-4">
            <FileUpload
              label="Resignation Letter"
              name="resignationLetter"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileChange('resignationLetter')}
            />
            <FileUpload
              label="Settlement Agreement"
              name="settlementAgreement"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange('settlementAgreement')}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
