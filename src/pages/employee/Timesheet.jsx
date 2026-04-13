import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { HiClock, HiPencil, HiTrash, HiCheck } from 'react-icons/hi2'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  date: '',
  project: '',
  task: '',
  hours: '',
  description: '',
}

function statusColor(status) {
  if (status === 'Approved') return 'green'
  if (status === 'Pending') return 'orange'
  if (status === 'Rejected') return 'red'
  return 'gray'
}

export default function EmployeeTimesheet() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [selectedWeek, setSelectedWeek] = useState('2026-W15')

  const timesheetEntries = useMemo(
    () => [
      {
        id: 1,
        date: '2026-04-07',
        project: 'HRIS Platform',
        task: 'Frontend Development',
        hours: 8,
        description: 'Worked on employee dashboard components',
        status: 'Approved',
      },
      {
        id: 2,
        date: '2026-04-08',
        project: 'HRIS Platform',
        task: 'Bug Fixes',
        hours: 7.5,
        description: 'Fixed authentication issues',
        status: 'Approved',
      },
      {
        id: 3,
        date: '2026-04-09',
        project: 'HRIS Platform',
        task: 'Code Review',
        hours: 6,
        description: 'Reviewed pull requests from team',
        status: 'Pending',
      },
      {
        id: 4,
        date: '2026-04-10',
        project: 'HRIS Platform',
        task: 'Documentation',
        hours: 4,
        description: 'Updated API documentation',
        status: 'Pending',
      },
      {
        id: 5,
        date: '2026-04-11',
        project: 'HRIS Platform',
        task: 'Testing',
        hours: 8,
        description: 'Unit testing for attendance module',
        status: 'Pending',
      },
    ],
    []
  )

  const weeklySummary = useMemo(() => {
    const totalHours = timesheetEntries.reduce((acc, entry) => acc + entry.hours, 0)
    const approved = timesheetEntries.filter((e) => e.status === 'Approved').length
    const pending = timesheetEntries.filter((e) => e.status === 'Pending').length
    return { totalHours: totalHours.toFixed(1), approved, pending }
  }, [timesheetEntries])

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
    console.log({ formData, files, editMode, editingId })
    handleCloseModal()
  }

  const handleEdit = (id) => {
    const entry = timesheetEntries.find((e) => e.id === id)
    if (entry) {
      setFormData({
        date: entry.date,
        project: entry.project,
        task: entry.task,
        hours: entry.hours,
        description: entry.description,
      })
      setEditMode(true)
      setEditingId(id)
      setModalOpen(true)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this timesheet entry?')) {
      console.log('Delete timesheet entry:', id)
    }
  }

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'project', label: 'Project' },
    { key: 'task', label: 'Task' },
    { key: 'hours', label: 'Hours' },
    { key: 'description', label: 'Description' },
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
            disabled={row.status === 'Approved'}
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
          <h1 className="font-display text-2xl font-bold text-gray-900">Timesheet</h1>
          <p className="mt-1 text-sm text-gray-500">Log your work hours and track submissions.</p>
        </div>
        <div className="flex gap-3">
          <Input
            label="Select Week"
            name="week"
            type="select"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            options={[
              { value: '2026-W15', label: 'Week 15 (Apr 7-13)' },
              { value: '2026-W14', label: 'Week 14 (Mar 31-Apr 6)' },
              { value: '2026-W13', label: 'Week 13 (Mar 24-30)' },
            ]}
            className="w-48"
          />
          <Button label="Add Entry" variant="primary" onClick={() => setModalOpen(true)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Hours" value={weeklySummary.totalHours} subtitle="This week" color="blue" icon={HiClock} />
        <StatCard title="Approved" value={weeklySummary.approved} subtitle="Entries" color="green" icon={HiCheck} />
        <StatCard title="Pending" value={weeklySummary.pending} subtitle="Entries" color="orange" icon={HiClock} />
      </div>

      <Table columns={columns} data={timesheetEntries} pageSize={10} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'} size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="ts-project" className="mb-1 block text-sm font-medium text-gray-700">
                Project
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="ts-project"
                name="project"
                value={formData.project}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select project
                </option>
                <option value="HRIS Platform">HRIS Platform</option>
                <option value="Client Project A">Client Project A</option>
                <option value="Client Project B">Client Project B</option>
                <option value="Internal Tasks">Internal Tasks</option>
              </select>
            </div>
            <div className="col-span-2 w-full">
              <label htmlFor="ts-task" className="mb-1 block text-sm font-medium text-gray-700">
                Task
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="ts-task"
                name="task"
                value={formData.task}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select task type
                </option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Documentation">Documentation</option>
                <option value="Code Review">Code Review</option>
                <option value="Meetings">Meetings</option>
                <option value="Bug Fixes">Bug Fixes</option>
                <option value="Research">Research</option>
              </select>
            </div>
            <Input
              label="Hours Worked"
              name="hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.hours}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="ts-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
              <span className="text-red-500"> *</span>
            </label>
            <textarea
              id="ts-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              required
              placeholder="Describe the work completed"
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Supporting Document (Optional)
          </p>
          <FileUpload
            label="Work Proof / Screenshots"
            name="workProof"
            accept=".jpg,.png,.pdf"
            onChange={handleFileChange('workProof')}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label={editMode ? 'Update Entry' : 'Submit Entry'} variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
