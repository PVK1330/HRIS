import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees, onboardingKpis, onboardingTasks } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const initialFormData = {
  employeeId: '',
  taskName: '',
  taskCategory: '',
  dueDate: '',
  assignedTo: '',
  priority: '',
  description: '',
}

function statusColor(s) {
  if (s === 'Done') return 'green'
  if (s === 'In Progress') return 'blue'
  if (s === 'Pending') return 'orange'
  return 'gray'
}

export default function Onboarding() {
  const [owner, setOwner] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  const ownerOptions = useMemo(() => {
    const u = [...new Set(onboardingTasks.map((t) => t.owner))].sort()
    return [{ value: '', label: 'All owners' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const filtered = useMemo(() => {
    if (!owner) return onboardingTasks
    return onboardingTasks.filter((t) => t.owner === owner)
  }, [owner])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData })
    handleCloseModal()
  }

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'task', label: 'Task' },
    { key: 'due', label: 'Due' },
    { key: 'owner', label: 'Owner' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button label="Update" variant="ghost" size="sm" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Onboarding Management</h1>
          <p className="mt-1 text-sm text-gray-500">Coordinate tasks across HR, IT, and managers.</p>
        </div>
        <Button label="Create checklist" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="In progress" value={onboardingKpis.inProgress} subtitle="Active tasks" color="blue" />
        <StatCard title="Starts this month" value={onboardingKpis.startThisMonth} subtitle="New hires" color="green" />
        <StatCard title="Completed" value={onboardingKpis.completed} subtitle="Last 12 months" color="purple" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Owner"
          name="owner"
          type="select"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          options={ownerOptions}
        />
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Onboarding Checklist</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-700">Account creation & system access</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <span className="text-sm font-medium text-gray-700">IT equipment setup</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">HR documents collection</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">Policy acknowledgement</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">Manager introduction & team meet</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ○
              </div>
              <span className="text-sm font-medium text-gray-700">Training session completion</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Document & Policy Integration</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Employment Contract</div>
                <div className="text-xs text-gray-500">Required for all new hires</div>
              </div>
              <Badge label="Signed" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Code of Conduct</div>
                <div className="text-xs text-gray-500">Mandatory policy</div>
              </div>
              <Badge label="Pending" color="orange" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">IT Security Policy</div>
                <div className="text-xs text-gray-500">System access requirements</div>
              </div>
              <Badge label="Pending" color="orange" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Data Privacy Agreement</div>
                <div className="text-xs text-gray-500">GDPR compliance</div>
              </div>
              <Badge label="Not Started" color="gray" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Progress Monitoring</h2>
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">John Smith - IT Developer</span>
              <span className="font-semibold text-gray-900">80% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[80%] rounded-full bg-green-500" />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">Sarah Johnson - HR Specialist</span>
              <span className="font-semibold text-gray-900">60% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[60%] rounded-full bg-blue-500" />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-700">Michael Brown - Finance Analyst</span>
              <span className="font-semibold text-gray-900">40% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[40%] rounded-full bg-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-gray-900">Automated Status Updates</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-start gap-2 text-gray-600">
            <span className="text-gray-400">10:30 AM</span>
            <span>John Smith completed IT equipment setup - Status auto-updated to "In Progress"</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <span className="text-gray-400">09:45 AM</span>
            <span>Sarah Johnson submitted HR documents - Notification sent to manager</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <span className="text-gray-400">09:15 AM</span>
            <span>Michael Brown acknowledged Code of Conduct - Task marked complete</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <span className="text-gray-400">08:30 AM</span>
            <span>System: John Smith onboarding 80% complete - Reminder to complete remaining tasks</span>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Create Onboarding Checklist" size="lg">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Task details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="onboard-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="onboard-employee"
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
            <Input
              label="Task Name"
              name="taskName"
              value={formData.taskName}
              onChange={handleFormChange}
              placeholder="e.g. IT Equipment Setup"
              required
            />
            <div className="w-full">
              <label htmlFor="onboard-category" className="mb-1 block text-sm font-medium text-gray-700">
                Task Category
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="onboard-category"
                name="taskCategory"
                value={formData.taskCategory}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select category
                </option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="onboard-assigned" className="mb-1 block text-sm font-medium text-gray-700">
                Assigned To
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="onboard-assigned"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select assignee
                </option>
                <option value="HR Team">HR Team</option>
                <option value="IT Team">IT Team</option>
                <option value="Manager">Manager</option>
                <option value="Admin Team">Admin Team</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="onboard-priority" className="mb-1 block text-sm font-medium text-gray-700">
                Priority
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="onboard-priority"
                name="priority"
                value={formData.priority}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select priority
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="onboard-description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="onboard-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
              placeholder="Task details and requirements"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Create Task" variant="primary" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
