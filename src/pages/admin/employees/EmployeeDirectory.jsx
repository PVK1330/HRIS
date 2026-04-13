import { useMemo, useState } from 'react'
import { HiDocumentText, HiEnvelope, HiEye } from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

function statusColor(status) {
  if (status === 'Active') return 'green'
  if (status === 'Probation') return 'blue'
  if (status === 'Notice Period') return 'orange'
  if (status === 'On Leave') return 'yellow'
  return 'gray'
}

function emailFromName(name) {
  const parts = name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return `${parts[0]}@hris.com`
  return `${parts[0]}.${parts[parts.length - 1]}@hris.com`
}

const initialFormData = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  personalEmail: '',
  phoneNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  homeAddress: '',
  employeeId: '',
  jobTitle: '',
  department: '',
  employmentType: '',
  workLocation: '',
  reportingManager: '',
  joinDate: '',
  probationEndDate: '',
  workEmail: '',
  salary: '',
  employmentStatus: '',
  passportNumber: '',
  passportExpiry: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
  visaType: '',
  visaExpiryDate: '',
}

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [job, setJob] = useState('')
  const [loc, setLoc] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [workEmailTouched, setWorkEmailTouched] = useState(false)

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])
  const jobOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.jobTitle))].sort()
    return [{ value: '', label: 'All job titles' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])
  const locOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.location))].sort()
    return [{ value: '', label: 'All locations' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])
  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Probation', label: 'Probation' },
    { value: 'Notice Period', label: 'Notice Period' },
    { value: 'On Leave', label: 'On Leave' },
  ]

  const managerSelectOptions = useMemo(
    () =>
      employees.map((e) => ({
        value: e.name,
        label: `${e.name} (${e.empId})`,
      })),
    []
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter((e) => {
      if (dept && e.department !== dept) return false
      if (job && e.jobTitle !== job) return false
      if (loc && e.location !== loc) return false
      if (status && e.status !== status) return false
      if (!q) return true
      const blob = `${e.name} ${e.email} ${e.empId} ${e.department}`.toLowerCase()
      return blob.includes(q)
    })
  }, [search, dept, job, loc, status])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'fullName' && !workEmailTouched) {
        next.workEmail = emailFromName(value)
      }
      return next
    })
  }

  const handleWorkEmailChange = (e) => {
    setWorkEmailTouched(true)
    setFormData((prev) => ({ ...prev, workEmail: e.target.value }))
  }

  const handleFileChange = (key) => (fileList) => {
    setFiles((prev) => ({ ...prev, [key]: fileList }))
  }

  const resetModal = () => {
    setFormData(initialFormData)
    setFiles({})
    setWorkEmailTouched(false)
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
    {
      key: 'name',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'empId', label: 'Emp ID' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'location', label: 'Location' },
    { key: 'manager', label: 'Manager' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex items-center gap-1">
          <Button ariaLabel="View" variant="ghost" size="sm" icon={HiEye} />
          <Button ariaLabel="Email" variant="ghost" size="sm" icon={HiEnvelope} />
          <Button ariaLabel="Letter" variant="ghost" size="sm" icon={HiDocumentText} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Search, filter, and manage employee records.</p>
        </div>
        <Button label="+ Add Employee" variant="primary" onClick={() => setModalOpen(true)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Search"
            name="search"
            placeholder="Name, email, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            label="Department"
            name="dept"
            type="select"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            options={deptOptions}
          />
          <Input
            label="Job title"
            name="job"
            type="select"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            options={jobOptions}
          />
          <Input
            label="Location"
            name="loc"
            type="select"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            options={locOptions}
          />
          <Input
            label="Status"
            name="status"
            type="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Add Employee" size="lg">
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1"
        >
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Personal information
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
              required
            />
            <div className="w-full">
              <label htmlFor="emp-gender" className="mb-1 block text-sm font-medium text-gray-700">
                Gender
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="emp-gender"
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <Input
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Personal Email"
              name="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={handleFormChange}
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleFormChange}
            />
            <Input
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="emp-home-address" className="mb-1 block text-sm font-medium text-gray-700">
              Home Address
            </label>
            <textarea
              id="emp-home-address"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Employment details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleFormChange}
              placeholder="EMP001"
              required
            />
            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label htmlFor="emp-department" className="mb-1 block text-sm font-medium text-gray-700">
                Department
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="emp-department"
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
              <label htmlFor="emp-type" className="mb-1 block text-sm font-medium text-gray-700">
                Employment Type
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="emp-type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="emp-location" className="mb-1 block text-sm font-medium text-gray-700">
                Work Location
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="emp-location"
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
              <label htmlFor="emp-manager" className="mb-1 block text-sm font-medium text-gray-700">
                Reporting Manager
              </label>
              <select
                id="emp-manager"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select manager</option>
                {managerSelectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Join Date"
              name="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Probation End Date"
              name="probationEndDate"
              type="date"
              value={formData.probationEndDate}
              onChange={handleFormChange}
            />
            <Input
              label="Work Email"
              name="workEmail"
              type="email"
              value={formData.workEmail}
              onChange={handleWorkEmailChange}
              required
            />
            <Input
              label="Salary"
              name="salary"
              type="number"
              placeholder="Amount in AED"
              value={formData.salary}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="emp-status" className="mb-1 block text-sm font-medium text-gray-700">
                Employment Status
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="emp-status"
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

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Identity & visa
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Passport Number"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Passport Expiry"
              name="passportExpiry"
              type="date"
              value={formData.passportExpiry}
              onChange={handleFormChange}
            />
            <Input
              label="Emirates ID Number"
              name="emiratesIdNumber"
              value={formData.emiratesIdNumber}
              onChange={handleFormChange}
            />
            <Input
              label="Emirates ID Expiry"
              name="emiratesIdExpiry"
              type="date"
              value={formData.emiratesIdExpiry}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="emp-visa-type" className="mb-1 block text-sm font-medium text-gray-700">
                Visa Type
              </label>
              <select
                id="emp-visa-type"
                name="visaType"
                value={formData.visaType}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select visa type</option>
                <option value="Employment">Employment</option>
                <option value="Visit">Visit</option>
                <option value="Dependent">Dependent</option>
                <option value="Investor">Investor</option>
              </select>
            </div>
            <Input
              label="Visa Expiry Date"
              name="visaExpiryDate"
              type="date"
              value={formData.visaExpiryDate}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Documents upload
          </p>
          <div className="space-y-4">
            <FileUpload
              label="Passport Copy"
              name="passportCopy"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('passportCopy')}
              helpText="Upload passport scan"
            />
            <FileUpload
              label="Emirates ID Copy"
              name="emiratesIdCopy"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('emiratesIdCopy')}
            />
            <FileUpload
              label="Visa Copy"
              name="visaCopy"
              accept=".jpg,.png,.pdf"
              onChange={handleFileChange('visaCopy')}
            />
            <FileUpload
              label="Profile Photo"
              name="profilePhoto"
              accept=".jpg,.png,.webp"
              onChange={handleFileChange('profilePhoto')}
              helpText="Square photo preferred"
            />
            <FileUpload
              label="Offer Letter / Contract"
              name="offerLetter"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange('offerLetter')}
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
