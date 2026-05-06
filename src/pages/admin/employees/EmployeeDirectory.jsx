import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiDocumentText, HiEnvelope, HiEye, HiPencil, HiTrash, HiPlus } from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

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
  grade: '',
  costCenter: '',
  maritalStatus: '',
  dependents: '',
  passportNumber: '',
  passportExpiry: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
  visaType: '',
  visaExpiryDate: '',
  workMode: '',
  sponsoringEntity: '',
  countryOfResidence: '',
  careerHistory: '',
  awardsSummary: '',
  promotionHistory: '',
}

export default function EmployeeDirectory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [job, setJob] = useState('')
  const [loc, setLoc] = useState('')
  const [status, setStatus] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [workEmailTouched, setWorkEmailTouched] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewActiveTab, setViewActiveTab] = useState('personal')
  const [editMode, setEditMode] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [employeeList, setEmployeeList] = useState(employees)

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
  const workModeOptions = [
    { value: '', label: 'All work modes' },
    { value: 'Remote', label: 'Remote' },
    { value: 'In Office', label: 'In Office' },
    { value: 'Hybrid', label: 'Hybrid' },
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
    return employeeList.map((e, idx) => ({
      ...e,
      manager: idx % 3 === 0 ? 'Sarah Johnson' : idx % 3 === 1 ? 'Michael Brown' : 'Emily Davis',
      joinDate: '2024-01-15',
      workMode: e.workMode || (idx % 2 === 0 ? 'In Office' : 'Remote'),
    })).filter((e) => {
      const matchDept = !dept || e.department === dept
      const matchJob = !job || e.jobTitle === job
      const matchLoc = !loc || e.location === loc
      const matchStatus = !status || e.status === status
      const matchWorkMode = !workMode || e.workMode === workMode
      
      let matchQ = true
      if (q) {
        const blob = `${e.name} ${e.email} ${e.empId} ${e.department}`.toLowerCase()
        matchQ = blob.includes(q)
      }

      return matchDept && matchJob && matchLoc && matchStatus && matchWorkMode && matchQ
    })
  }, [search, dept, job, loc, status, workMode, employeeList])

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
    setEditMode(false)
    setEditingEmployeeId(null)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editMode) {
      // Update existing employee
      setEmployeeList((prev) =>
        prev.map((emp) =>
          emp.empId === editingEmployeeId
            ? {
              ...emp,
              name: formData.fullName,
              email: formData.workEmail || formData.personalEmail,
              phone: formData.phoneNumber,
              jobTitle: formData.jobTitle,
              department: formData.department,
              location: formData.workLocation,
              manager: formData.reportingManager,
              status: formData.employmentStatus,
              joinDate: formData.joinDate
            }
            : emp
        )
      )
      alert('Employee updated successfully!')
    } else {
      // Add new employee
      const newEmployee = {
        id: employeeList.length + 1,
        empId: formData.employeeId || `EMP${String(employeeList.length + 1).padStart(3, '0')}`,
        name: formData.fullName,
        email: formData.workEmail || formData.personalEmail,
        phone: formData.phoneNumber,
        jobTitle: formData.jobTitle,
        department: formData.department,
        location: formData.workLocation,
        manager: formData.reportingManager,
        status: formData.employmentStatus || 'Active',
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        initials: formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      }
      setEmployeeList((prev) => [...prev, newEmployee])
      alert('Employee added successfully!')
    }

    handleCloseModal()
  }

  const handleView = (employee) => {
    setSelectedEmployee(employee)
    setViewActiveTab('personal')
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleEmail = (employee) => {
    window.location.href = `mailto:${employee.email}`
  }

  const handleLetter = (employee) => {
    navigate('/admin/letters')
  }

  const handleEdit = (employee) => {
    setFormData({
      fullName: employee.name,
      dateOfBirth: '',
      gender: '',
      nationality: '',
      personalEmail: employee.email,
      phoneNumber: employee.phone || '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      homeAddress: '',
      employeeId: employee.empId,
      jobTitle: employee.jobTitle,
      department: employee.department,
      employmentType: '',
      workLocation: employee.location,
      reportingManager: employee.manager || '',
      joinDate: employee.joinDate || '2024-01-15',
      probationEndDate: '',
      workEmail: employee.email,
      salary: '',
      employmentStatus: employee.status,
      passportNumber: '',
      passportExpiry: '',
      emiratesIdNumber: '',
      emiratesIdExpiry: '',
      visaType: employee.visaType || '',
      visaExpiryDate: employee.visaExpiryDate || '',
      workMode: employee.workMode || '',
      sponsoringEntity: employee.sponsoringEntity || '',
      countryOfResidence: employee.countryOfResidence || '',
      careerHistory: employee.careerHistory || '',
      awardsSummary: employee.awardsSummary || '',
      promotionHistory: employee.promotionHistory || '',
    })
    setEditMode(true)
    setEditingEmployeeId(employee.empId)
    setModalOpen(true)
    handleCloseViewModal()
  }

  const handleDelete = (employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setEmployeeList((prev) => prev.filter((emp) => emp.empId !== employee.empId))
      alert('Employee deleted successfully!')
    }
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar initials={row.initials} />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.empId}</div>
          </div>
        </div>
      ),
    },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'location', label: 'Work Loc' },
    { key: 'manager', label: 'Manager' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button ariaLabel="Email/Call" title="Email/Call" variant="ghost" size="sm" icon={HiEnvelope} onClick={() => handleEmail(row)} />
          <Button ariaLabel="View Profile" title="View Profile" variant="ghost" size="sm" icon={HiEye} onClick={() => handleView(row)} />
          <Button ariaLabel="Generate Letter" title="Generate Letter" variant="ghost" size="sm" icon={HiDocumentText} onClick={() => handleLetter(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Employee Directory</h1>
          <p className="mt-1 text-sm text-slate-500">Identity management and workforce intelligence.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 bg-white/50 backdrop-blur-md p-5 rounded-lg border border-slate-200/60 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Search</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Name, ID, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner font-medium"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              label="Reset" 
              variant="ghost" 
              size="sm" 
              onClick={() => { setSearch(''); setDept(''); setJob(''); setLoc(''); setStatus(''); setWorkMode('') }}
              className="text-slate-400 hover:text-rose-600 rounded-md"
            />
            <Button ariaLabel="Add Employee" label="New Employee" variant="primary" icon={HiPlus} onClick={() => setModalOpen(true)} className="rounded-md shadow-lg shadow-emerald-100" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-slate-100 pt-4">
          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/60 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-slate-700">
              {deptOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
            <select value={job} onChange={(e) => setJob(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/60 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-slate-700">
              {jobOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Mode</label>
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/60 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-slate-700">
              {workModeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Talent Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/60 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-slate-700">
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
            <select value={loc} onChange={(e) => setLoc(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/60 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-slate-700">
              {locOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Table columns={columns} data={filtered} pageSize={5} />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Employee' : 'Add Employee'} size="xl" showClose>
        <form
          onSubmit={handleSubmit}
          className="h-full w-full pr-1"
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
              label="Country of Residence"
              name="countryOfResidence"
              value={formData.countryOfResidence}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="emp-marital" className="mb-1 block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              <select
                id="emp-marital"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <Input
              label="Number of Dependents"
              name="dependents"
              type="number"
              value={formData.dependents}
              onChange={handleFormChange}
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
              <label htmlFor="emp-work-mode" className="mb-1 block text-sm font-medium text-gray-700">
                Work Mode
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="emp-work-mode"
                name="workMode"
                value={formData.workMode}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select work mode
                </option>
                <option value="In Office">In Office</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
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
            <Input
              label="Grade / Level"
              name="grade"
              placeholder="e.g. G5, L2, Senior"
              value={formData.grade}
              onChange={handleFormChange}
            />
            <Input
              label="Cost Center"
              name="costCenter"
              placeholder="e.g. CC-100"
              value={formData.costCenter}
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
            <Input
              label="Sponsoring Entity"
              name="sponsoringEntity"
              placeholder="e.g. Company Name"
              value={formData.sponsoringEntity}
              onChange={handleFormChange}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Career & Highlights
          </p>
          <div className="space-y-3">
            <div className="w-full">
              <label htmlFor="emp-career" className="mb-1 block text-sm font-medium text-gray-700">
                Career History (Previous Roles, Promotions, Transfers)
              </label>
              <textarea
                id="emp-career"
                name="careerHistory"
                value={formData.careerHistory}
                onChange={handleFormChange}
                className={textareaClass}
                rows={3}
                placeholder="List previous roles and key career milestones..."
              />
            </div>
            <div className="w-full">
              <label htmlFor="emp-awards" className="mb-1 block text-sm font-medium text-gray-700">
                Awards & Recognitions
              </label>
              <textarea
                id="emp-awards"
                name="awardsSummary"
                value={formData.awardsSummary}
                onChange={handleFormChange}
                className={textareaClass}
                rows={2}
              />
            </div>
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
            <Button
              type="button"
              label="Cancel"
              variant="ghost"
              onClick={handleCloseModal}
            />

            <Button
              type="submit"
              label={editMode ? 'Update Employee' : 'Save Employee'}
              variant="primary"
            />
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Employee Details" size="2xl" showClose={true}>
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 w-full h-full">
              <div className="flex items-center gap-4">
                <Avatar initials={selectedEmployee.initials} size="lg" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-500">{selectedEmployee.empId} • {selectedEmployee.email}</p>
                  <Badge label={selectedEmployee.status} color={statusColor(selectedEmployee.status)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button ariaLabel="Edit Employee" variant="secondary" size="sm" icon={HiPencil} onClick={() => handleEdit(selectedEmployee)} />
                <Button ariaLabel="Delete Employee" variant="ghost" size="sm" icon={HiTrash} onClick={() => handleDelete(selectedEmployee)} />
              </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
              {[
                { id: 'personal', label: 'Basic Info' },
                { id: 'work', label: 'Employment' },
                { id: 'documents', label: 'Documents' },
                { id: 'visa', label: 'Visa & Nationality' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'leave', label: 'Leave' },
                { id: 'performance', label: 'Performance' },
                { id: 'assets', label: 'Assets' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${viewActiveTab === tab.id
                    ? 'border-b-2 border-[#004CA5] text-[#004CA5]'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {viewActiveTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="text-xs text-gray-500">Name</label><p className="text-sm font-medium">{selectedEmployee.name}</p></div>
                    <div><label className="text-xs text-gray-500">Employee ID</label><p className="text-sm font-medium">{selectedEmployee.empId}</p></div>
                    <div><label className="text-xs text-gray-500">Job Title</label><p className="text-sm font-medium">{selectedEmployee.jobTitle}</p></div>
                    <div><label className="text-xs text-gray-500">Department</label><p className="text-sm font-medium">{selectedEmployee.department}</p></div>
                    <div><label className="text-xs text-gray-500">Reporting Manager</label><p className="text-sm font-medium">{selectedEmployee.manager || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Work Location</label><p className="text-sm font-medium">{selectedEmployee.location}</p></div>
                    <div><label className="text-xs text-gray-500">Work Mode</label><p className="text-sm font-medium">{selectedEmployee.workMode || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Employment Type</label><p className="text-sm font-medium">{selectedEmployee.employmentType || 'Full-time'}</p></div>
                    <div><label className="text-xs text-gray-500">Join Date</label><p className="text-sm font-medium">{selectedEmployee.joinDate || '2024-01-15'}</p></div>
                    <div><label className="text-xs text-gray-500">Tenure</label><p className="text-sm font-medium">2 Years, 3 Months</p></div>
                    <div><label className="text-xs text-gray-500">Current Day Status</label><p className="text-sm font-medium text-green-600">Present</p></div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="text-xs text-gray-500">Date of Birth</label><p className="text-sm font-medium">{selectedEmployee.dateOfBirth || '1990-05-14'}</p></div>
                    <div><label className="text-xs text-gray-500">Gender</label><p className="text-sm font-medium">{selectedEmployee.gender || 'Male'}</p></div>
                    <div><label className="text-xs text-gray-500">Marital Status</label><p className="text-sm font-medium">{selectedEmployee.maritalStatus || 'Married'}</p></div>
                    <div><label className="text-xs text-gray-500">Contact Numbers</label><p className="text-sm font-medium">{selectedEmployee.phone || '+971 50 123 4567'}</p></div>
                    <div><label className="text-xs text-gray-500">Personal Email</label><p className="text-sm font-medium">{selectedEmployee.email}</p></div>
                    <div><label className="text-xs text-gray-500">Number of Dependents</label><p className="text-sm font-medium">{selectedEmployee.dependents || '0'}</p></div>
                    <div><label className="text-xs text-gray-500">Country of Residence</label><p className="text-sm font-medium">{selectedEmployee.countryOfResidence || 'UAE'}</p></div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-xs text-gray-500">Address</label>
                    <p className="text-sm font-medium">123 Street, Downtown Dubai, UAE</p>
                  </div>
                  <div className="border-t pt-4">
                    <label className="text-xs text-gray-500">Emergency Contact</label>
                    <p className="text-sm font-medium">Jane Doe - +971 50 987 6543 (Wife)</p>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-blue-800 mb-1">Promotion History Summary</h4>
                      <p className="text-sm text-blue-900">Promoted to Senior {selectedEmployee.jobTitle} on Jan 2024</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-yellow-800 mb-1">Awards Summary</h4>
                      <p className="text-sm text-yellow-900">Employee of the Month (Q3 2023)</p>
                    </div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'work' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500">Job Title</label><p className="text-sm font-medium">{selectedEmployee.jobTitle}</p></div>
                    <div><label className="text-xs text-gray-500">Job Level / Grade</label><p className="text-sm font-medium">{selectedEmployee.grade || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Cost Center</label><p className="text-sm font-medium">{selectedEmployee.costCenter || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Department</label><p className="text-sm font-medium">{selectedEmployee.department}</p></div>
                    <div><label className="text-xs text-gray-500">Work Location</label><p className="text-sm font-medium">{selectedEmployee.location}</p></div>
                    <div><label className="text-xs text-gray-500">Reporting Manager</label><p className="text-sm font-medium">{selectedEmployee.manager || 'Not assigned'}</p></div>
                    <div><label className="text-xs text-gray-500">Employment Type</label><p className="text-sm font-medium">{selectedEmployee.employmentType || 'Full-time'}</p></div>
                    <div><label className="text-xs text-gray-500">Date of Joining</label><p className="text-sm font-medium">{selectedEmployee.joinDate || '2024-01-15'}</p></div>
                    <div><label className="text-xs text-gray-500">Probation End Date</label><p className="text-sm font-medium">{selectedEmployee.probationEndDate || 'N/A'}</p></div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Career History</h4>
                    <div className="border-l-2 border-blue-200 ml-3 space-y-4">
                      <div className="relative pl-4">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                        <p className="text-sm font-medium text-gray-900">Promoted to {selectedEmployee.jobTitle}</p>
                        <p className="text-xs text-gray-500">Jan 2024 • Promotion</p>
                      </div>
                      <div className="relative pl-4">
                        <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                        <p className="text-sm font-medium text-gray-900">Joined as Junior {selectedEmployee.jobTitle}</p>
                        <p className="text-xs text-gray-500">Jan 2022 • New Hire</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'documents' && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Mandatory Documents List</h4>
                      <Button variant="outline" size="sm" icon={HiPlus} ariaLabel="Upload New Document">Upload</Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'Passport', status: 'Approved', v: 'v1.0' },
                        { name: 'National ID', status: 'Submitted', v: 'v2.1' },
                        { name: 'Education certificates', status: 'Pending', v: 'v1.0' },
                        { name: 'Contract', status: 'Approved', v: 'v1.0' },
                        { name: 'Offer letter', status: 'Approved', v: 'v1.0' },
                        { name: 'Experience letters', status: 'Rejected', v: 'v1.0', comments: 'Needs to be attested' }
                      ].map((doc, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                              <Badge label={doc.status} color={doc.status === 'Approved' ? 'green' : doc.status === 'Rejected' ? 'red' : doc.status === 'Submitted' ? 'blue' : 'yellow'} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Version: {doc.v} • 2024-01-15 10:30 AM</div>
                            {doc.comments && <div className="text-xs text-red-600 mt-1">HR Comments: {doc.comments}</div>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" ariaLabel="Replace">Replace</Button>
                            <Button variant="ghost" size="sm" ariaLabel="History">History</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'visa' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500">Nationality</label><p className="text-sm font-medium">{selectedEmployee.nationality || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Country of Residence</label><p className="text-sm font-medium">{selectedEmployee.countryOfResidence || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Passport Number</label><p className="text-sm font-medium">{selectedEmployee.passportNumber || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Passport Issue Date</label><p className="text-sm font-medium">{selectedEmployee.passportIssueDate || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Passport Expiry Date</label><p className="text-sm font-medium">{selectedEmployee.passportExpiry || 'N/A'}</p></div>

                    <div className="col-span-2 mt-2 mb-1 border-t pt-4"><h4 className="text-sm font-semibold">Visa / Work Permit</h4></div>
                    <div><label className="text-xs text-gray-500">Visa / Work Permit Type</label><p className="text-sm font-medium">{selectedEmployee.visaType || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Visa Number</label><p className="text-sm font-medium">{selectedEmployee.visaNumber || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Visa Issue Date</label><p className="text-sm font-medium">{selectedEmployee.visaIssueDate || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Visa Expiry Date</label><p className="text-sm font-medium">{selectedEmployee.visaExpiryDate || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Sponsoring Entity</label><p className="text-sm font-medium">{selectedEmployee.sponsoringEntity || 'N/A'}</p></div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Uploads</h4>
                    <div className="flex gap-4">
                      <div className="p-3 border border-gray-200 rounded text-sm text-center w-24"><HiDocumentText className="mx-auto text-xl text-gray-400 mb-1" /> Passport</div>
                      <div className="p-3 border border-gray-200 rounded text-sm text-center w-24"><HiDocumentText className="mx-auto text-xl text-gray-400 mb-1" /> Visa</div>
                      <div className="p-3 border border-gray-200 rounded text-sm text-center w-24"><HiDocumentText className="mx-auto text-xl text-gray-400 mb-1" /> Country ID</div>
                    </div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs text-gray-500">Total Hours (Month)</div>
                      <div className="text-xl font-bold">160h 45m</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-xs text-yellow-600">Late Minutes</div>
                      <div className="text-xl font-bold text-yellow-700">25m</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-xs text-red-600">Missing Clock-outs</div>
                      <div className="text-xl font-bold text-red-700">1</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-xs text-blue-600">Attendance Policy</div>
                      <div className="text-xs font-medium text-blue-800 mt-1">10-min buffer allowed. &gt;3 late marks require regularization.</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Clock In</th>
                            <th className="p-3">Clock Out</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-3">Today</td>
                            <td className="p-3">08:55 AM</td>
                            <td className="p-3 text-gray-400">-</td>
                            <td className="p-3 text-gray-400">-</td>
                            <td className="p-3"><Badge label="Active" color="green" /></td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3">Yesterday</td>
                            <td className="p-3">09:15 AM</td>
                            <td className="p-3">06:00 PM</td>
                            <td className="p-3">8h 45m</td>
                            <td className="p-3"><Badge label="Late" color="yellow" /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Regularization Requests</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="text-sm font-medium">Missed punch on Oct 10</div>
                          <div className="text-xs text-gray-500">Requested time: 06:00 PM</div>
                        </div>
                        <Badge label="Approved" color="green" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'leave' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">14</div>
                      <div className="text-xs text-gray-500">Annual Leave</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-xs text-gray-500">Sick Leave</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">3</div>
                      <div className="text-xs text-gray-500">Casual Leave</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center bg-gray-50">
                      <div className="text-2xl font-bold text-gray-700">0</div>
                      <div className="text-xs text-gray-500">Unpaid Leave</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Leave History</h4>
                    <Button variant="outline" size="sm">Upload Medical Cert</Button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">Annual Leave (3 days)</div>
                        <div className="text-xs text-gray-500">12 Nov 2024 - 14 Nov 2024</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge label="Pending Approval" color="yellow" />
                        <div className="flex gap-1 ml-2">
                          <Button size="sm" variant="primary">Approve</Button>
                          <Button size="sm" variant="ghost">Reject</Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">Sick Leave (1 day)</div>
                        <div className="text-xs text-gray-500">05 Oct 2024</div>
                        <div className="text-xs text-blue-500 underline mt-1 cursor-pointer">Medical_Cert.pdf</div>
                      </div>
                      <Badge label="Approved" color="green" />
                    </div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-xs text-green-800">Yearly Rating (2023)</div>
                      <div className="text-xl font-bold text-green-700">Exceeds Expectations (4/5)</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-xs text-blue-800">Potential Rating</div>
                      <div className="text-xl font-bold text-blue-700">High Potential</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Manager Comments</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">"Outstanding performance this year. Successfully delivered the Q3 project ahead of schedule."</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Employee Comments</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">"Looking forward to taking on more leadership responsibilities next year."</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Current Goals</h4>
                    <div className="space-y-3">
                      <div className="border p-3 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Complete Leadership Training</span>
                          <span className="text-blue-600">80%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div></div>
                      </div>
                      <div className="border p-3 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Improve Team Velocity by 15%</span>
                          <span className="text-blue-600">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Past Reviews</h4>
                    <div className="text-sm text-gray-700 underline cursor-pointer">2022 Annual Review (3.5/5)</div>
                    <div className="text-sm text-gray-700 underline cursor-pointer mt-1">2021 Annual Review (4/5)</div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'assets' && (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 border-b">
                        <tr>
                          <th className="p-3">Asset ID</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Serial No.</th>
                          <th className="p-3">Issued Date</th>
                          <th className="p-3">Condition</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-medium">AST-1042</td>
                          <td className="p-3">Laptop (MacBook Pro)</td>
                          <td className="p-3">C02XXYYZZ</td>
                          <td className="p-3">2023-01-15</td>
                          <td className="p-3">Good</td>
                          <td className="p-3"><Badge label="Issued" color="blue" /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-medium">AST-2105</td>
                          <td className="p-3">Access Card</td>
                          <td className="p-3">AC-55992</td>
                          <td className="p-3">2023-01-16</td>
                          <td className="p-3">Good</td>
                          <td className="p-3"><Badge label="Issued" color="blue" /></td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 font-medium text-gray-500">AST-0850</td>
                          <td className="p-3 text-gray-500">Phone (iPhone 12)</td>
                          <td className="p-3 text-gray-500">F1XXYYZZ</td>
                          <td className="p-3 text-gray-500">2022-05-10</td>
                          <td className="p-3 text-gray-500">Scratched</td>
                          <td className="p-3"><Badge label="Returned" color="gray" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
