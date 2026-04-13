import { useCallback, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employeeProfileEvents, employees } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const DEPT_VALUES = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Legal']

const LOCATION_VALUES = ['Dubai', 'Abu Dhabi', 'Remote', 'UK', 'India']

function departmentFromMock(department) {
  if (!department) return ''
  if (DEPT_VALUES.includes(department)) return department
  const map = {
    'Human Resources': 'HR',
    Engineering: 'IT',
    Design: 'Marketing',
    Finance: 'Finance',
    Operations: 'Operations',
  }
  return map[department] ?? ''
}

function locationFromMock(location) {
  if (!location) return ''
  if (LOCATION_VALUES.includes(location)) return location
  if (location.includes('Dubai')) return 'Dubai'
  if (location === 'Abu Dhabi') return 'Abu Dhabi'
  if (location === 'Remote') return 'Remote'
  if (location === 'Sharjah') return 'Dubai'
  return ''
}

function buildFormFromEmployee(emp) {
  if (!emp) {
    return {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      personalEmail: '',
      homeAddress: '',
      jobTitle: '',
      department: '',
      workLocation: '',
      reportingManager: '',
      employmentStatus: '',
    }
  }
  return {
    fullName: emp.name ?? '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: emp.phone ?? '',
    personalEmail: emp.email ?? '',
    homeAddress: '',
    jobTitle: emp.jobTitle ?? '',
    department: departmentFromMock(emp.department),
    workLocation: locationFromMock(emp.location),
    reportingManager: emp.manager ?? '',
    employmentStatus: emp.status ?? '',
  }
}

export default function EmployeeProfile() {
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(() => buildFormFromEmployee(employees[0]))
  const [files, setFiles] = useState({})

  const selected = employees.find((e) => e.id === selectedId) ?? employees[0]

  const openEditModal = useCallback(() => {
    setFormData(buildFormFromEmployee(selected))
    setFiles({})
    setModalOpen(true)
  }, [selected])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (key) => (fileList) => {
    setFiles((prev) => ({ ...prev, [key]: fileList }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFiles({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files, employeeId: selected?.id })
    handleCloseModal()
  }

  const managerOptions = employees.map((e) => ({
    value: e.name,
    label: `${e.name} (${e.empId})`,
  }))

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'event', label: 'Event' },
    { key: 'owner', label: 'Owner' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Employee Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Review core details and recent HR milestones.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Input
          label="Select employee"
          name="emp"
          type="select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.empId})` }))}
        />
      </div>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-gray-900">{selected.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge label={selected.status} color="green" />
              <Badge label={selected.department} color="blue" />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</dt>
                <dd className="text-gray-800">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</dt>
                <dd className="text-gray-800">{selected.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Job title</dt>
                <dd className="text-gray-800">{selected.jobTitle}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Manager</dt>
                <dd className="text-gray-800">{selected.manager}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</dt>
                <dd className="text-gray-800">{selected.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nationality</dt>
                <dd className="text-gray-800">{selected.nationality}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button label="Edit Profile" variant="primary" onClick={openEditModal} />
              <Button label="Download profile" variant="outline" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-bold text-gray-900">Notes</h3>
            <p className="mt-2 text-sm text-gray-600">
              Profile data is sourced from `mockData` employees. No API calls are wired yet.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Recent HR events</h2>
        <Table columns={columns} data={employeeProfileEvents} pageSize={5} emptyMessage="No records" />
      </div>

      {selected && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-gray-900">Asset Allocation</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Laptop - Dell XPS 15</div>
                <div className="text-xs text-gray-500">Asset ID: AST-001 • Assigned: Jan 15, 2024</div>
              </div>
              <Badge label="Active" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Monitor - Dell 27" UHD</div>
                <div className="text-xs text-gray-500">Asset ID: AST-002 • Assigned: Jan 15, 2024</div>
              </div>
              <Badge label="Active" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Keyboard - Logitech MX Keys</div>
                <div className="text-xs text-gray-500">Asset ID: AST-003 • Assigned: Jan 15, 2024</div>
              </div>
              <Badge label="Active" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Mouse - Logitech MX Master 3</div>
                <div className="text-xs text-gray-500">Asset ID: AST-004 • Assigned: Jan 15, 2024</div>
              </div>
              <Badge label="Active" color="green" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
              <div>
                <div className="font-medium text-gray-900">Headset - Jabra Evolve2 75</div>
                <div className="text-xs text-gray-500">Asset ID: AST-005 • Assigned: Feb 1, 2024</div>
              </div>
              <Badge label="Active" color="green" />
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Edit Profile" size="md">
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Personal
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="ep-gender" className="mb-1 block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="ep-gender"
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Personal Email"
              name="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="ep-address" className="mb-1 block text-sm font-medium text-gray-700">
              Home Address
            </label>
            <textarea
              id="ep-address"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>
          <div className="mt-4">
            <FileUpload
              label="Profile Photo"
              name="profilePhoto"
              accept=".jpg,.png,.webp"
              onChange={handleFileChange('profilePhoto')}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Job details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="ep-dept" className="mb-1 block text-sm font-medium text-gray-700">
                Department
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="ep-dept"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select department
                </option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="ep-loc" className="mb-1 block text-sm font-medium text-gray-700">
                Work Location
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="ep-loc"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select location
                </option>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Remote">Remote</option>
                <option value="UK">UK</option>
                <option value="India">India</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="ep-manager" className="mb-1 block text-sm font-medium text-gray-700">
                Reporting Manager
              </label>
              <select
                id="ep-manager"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select manager</option>
                {managerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="ep-emp-status" className="mb-1 block text-sm font-medium text-gray-700">
                Employment Status
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="ep-emp-status"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select status
                </option>
                <option value="Active">Active</option>
                <option value="Probation">Probation</option>
                <option value="Notice Period">Notice Period</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
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
