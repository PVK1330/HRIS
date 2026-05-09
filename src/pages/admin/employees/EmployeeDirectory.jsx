import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiDocumentText, HiEnvelope, HiEye, HiPencil, HiTrash, HiPlus,
  HiUsers, HiMagnifyingGlass, HiAdjustmentsHorizontal, HiArrowPath,
  HiShieldCheck, HiGlobeAlt, HiArrowTrendingUp, HiIdentification,
  HiBriefcase, HiMapPin, HiFolder, HiClock, HiCalendarDays,
  HiPresentationChartLine, HiDevicePhoneMobile, HiCheckBadge,
} from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import {
  getEmployeeStats, getFilterOptions, listEmployees,
  getEmployee, createEmployee, updateEmployee, deleteEmployee,
} from '../../../services/employeeService.js'

const selectClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all'
const textareaClass = 'w-full min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all shadow-inner'

function statusColor(status) {
  if (status === 'Active')        return 'green'
  if (status === 'Probation')     return 'blue'
  if (status === 'Notice Period') return 'orange'
  if (status === 'On Leave')      return 'yellow'
  return 'gray'
}

function emailFromName(name) {
  const parts = name.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  return parts.length === 1 ? `${parts[0]}@hris.com` : `${parts[0]}.${parts[parts.length - 1]}@hris.com`
}

function mapEmployeeList(e) {
  return {
    id: e.id,
    empId: e.emp_id,
    name: e.full_name,
    email: e.work_email,
    phone: e.phone_number || '',
    jobTitle: e.job_title,
    department: e.department,
    location: e.work_location || '',
    manager: e.reporting_manager || 'N/A',
    status: e.employment_status || 'Active',
    joinDate: e.join_date || '',
    workMode: e.work_mode || '',
    initials: e.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
  }
}

function mapEmployeeFull(e) {
  const d = (v) => (v ? v.split('T')[0] : '')
  return {
    id: e.id,
    empId: e.emp_id,
    name: e.full_name,
    email: e.work_email,
    phone: e.phone_number || '',
    jobTitle: e.job_title,
    department: e.department,
    location: e.work_location || '',
    manager: e.reporting_manager || '',
    status: e.employment_status || 'Active',
    joinDate: d(e.join_date),
    workMode: e.work_mode || '',
    personalEmail: e.personal_email || '',
    dateOfBirth: d(e.date_of_birth),
    gender: e.gender || '',
    nationality: e.nationality || '',
    countryOfResidence: e.country_of_residence || '',
    maritalStatus: e.marital_status || '',
    dependents: e.dependents ?? '',
    emergencyContactName: e.emergency_contact_name || '',
    emergencyContactPhone: e.emergency_contact_phone || '',
    homeAddress: e.home_address || '',
    probationEndDate: d(e.probation_end_date),
    salary: e.salary || '',
    grade: e.grade || '',
    costCenter: e.cost_center || '',
    passportNumber: e.passport_number || '',
    passportExpiry: d(e.passport_expiry),
    emiratesIdNumber: e.emirates_id_number || '',
    emiratesIdExpiry: d(e.emirates_id_expiry),
    visaType: e.visa_type || '',
    visaExpiryDate: d(e.visa_expiry_date),
    sponsoringEntity: e.sponsoring_entity || '',
    careerHistory: e.career_history || '',
    awardsSummary: e.awards_summary || '',
    promotionHistory: e.promotion_history || '',
  }
}

const initialFormData = {
  fullName: '', dateOfBirth: '', gender: '', nationality: '',
  personalEmail: '', phoneNumber: '', emergencyContactName: '',
  emergencyContactPhone: '', homeAddress: '', employeeId: '',
  jobTitle: '', department: '', employmentType: 'Full-time',
  workLocation: '', reportingManager: '', joinDate: '',
  probationEndDate: '', workEmail: '', salary: '',
  employmentStatus: 'Active', grade: '', costCenter: '',
  maritalStatus: '', dependents: '', workMode: 'In Office',
  countryOfResidence: '', passportNumber: '', passportExpiry: '',
  emiratesIdNumber: '', emiratesIdExpiry: '', visaType: '',
  visaExpiryDate: '', sponsoringEntity: '', careerHistory: '',
  awardsSummary: '', promotionHistory: '',
}

export default function EmployeeDirectory() {
  const navigate = useNavigate()

  // Filters
  const [search, setSearch]   = useState('')
  const [dept, setDept]       = useState('')
  const [job, setJob]         = useState('')
  const [loc, setLoc]         = useState('')
  const [status, setStatus]   = useState('')
  const [workMode, setWorkMode] = useState('')

  // Add/Edit modal
  const [modalOpen, setModalOpen]           = useState(false)
  const [formData, setFormData]             = useState(initialFormData)
  const [workEmailTouched, setWorkEmailTouched] = useState(false)
  const [editMode, setEditMode]             = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)

  // View modal
  const [viewModalOpen, setViewModalOpen]     = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewActiveTab, setViewActiveTab]     = useState('personal')

  // Data
  const [employeeList, setEmployeeList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage]   = useState(1)
  const [loading, setLoading]           = useState(false)
  const [stats, setStats]               = useState({ total: 0, active: 0, onLeave: 0 })
  const [filterOptions, setFilterOptions] = useState({
    departments: [], jobTitles: [], workLocations: [], workModes: [], statuses: [],
  })

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await listEmployees({
        page: currentPage, limit: 8, search,
        department: dept, status, workMode, jobTitle: job, workLocation: loc,
      })
      if (data) {
        setEmployeeList(data.employees.map(mapEmployeeList))
        setTotalRecords(data.total)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchStatsAndFilters = async () => {
    try {
      const [s, f] = await Promise.all([getEmployeeStats(), getFilterOptions()])
      if (s) setStats(s)
      if (f) setFilterOptions(f)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchStatsAndFilters() }, [])
  useEffect(() => { fetchData() }, [currentPage, search, dept, job, loc, status, workMode])

  // ── Form handlers ──────────────────────────────────────────────────────────

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'fullName' && !workEmailTouched) next.workEmail = emailFromName(value)
      return next
    })
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setWorkEmailTouched(false)
    setEditMode(false)
    setEditingEmployeeId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      empId:                  formData.employeeId,
      fullName:               formData.fullName,
      jobTitle:               formData.jobTitle,
      department:             formData.department,
      employmentType:         formData.employmentType,
      workLocation:           formData.workLocation,
      reportingManagerEmpId:  formData.reportingManager || null,
      joinDate:               formData.joinDate,
      probationEndDate:       formData.probationEndDate || null,
      workEmail:              formData.workEmail,
      personalEmail:          formData.personalEmail || null,
      phoneNumber:            formData.phoneNumber || null,
      employmentStatus:       formData.employmentStatus,
      workMode:               formData.workMode || null,
      dateOfBirth:            formData.dateOfBirth || null,
      gender:                 formData.gender || null,
      nationality:            formData.nationality || null,
      countryOfResidence:     formData.countryOfResidence || null,
      maritalStatus:          formData.maritalStatus || null,
      dependents:             formData.dependents !== '' ? parseInt(formData.dependents) : 0,
      emergencyContactName:   formData.emergencyContactName || null,
      emergencyContactPhone:  formData.emergencyContactPhone || null,
      homeAddress:            formData.homeAddress || null,
      salary:                 formData.salary !== '' ? parseFloat(String(formData.salary).replace(/[^0-9.]/g, '')) || null : null,
      grade:                  formData.grade || null,
      costCenter:             formData.costCenter || null,
      passportNumber:         formData.passportNumber || null,
      passportExpiry:         formData.passportExpiry || null,
      emiratesIdNumber:       formData.emiratesIdNumber || null,
      emiratesIdExpiry:       formData.emiratesIdExpiry || null,
      visaType:               formData.visaType || null,
      visaExpiryDate:         formData.visaExpiryDate || null,
      sponsoringEntity:       formData.sponsoringEntity || null,
      careerHistory:          formData.careerHistory || null,
      awardsSummary:          formData.awardsSummary || null,
      promotionHistory:       formData.promotionHistory || null,
    }
    try {
      if (editMode && editingEmployeeId) {
        await updateEmployee(editingEmployeeId, payload)
      } else {
        await createEmployee(payload)
      }
      handleCloseModal()
      fetchData()
      fetchStatsAndFilters()
    } catch (err) {
      console.error(err)
      alert('Failed to save employee.')
    }
  }

  // ── View / Edit / Delete ───────────────────────────────────────────────────

  const handleView = async (employee) => {
    try {
      const data = await getEmployee(employee.id)
      if (data) { setSelectedEmployee(mapEmployeeFull(data)); setViewActiveTab('personal'); setViewModalOpen(true) }
    } catch (err) { console.error(err) }
  }

  const handleCloseViewModal = () => { setViewModalOpen(false); setSelectedEmployee(null) }

  const handleEdit = async (employee) => {
    try {
      const data = await getEmployee(employee.id)
      if (data) {
        const f = mapEmployeeFull(data)
        setFormData({
          fullName: f.name, dateOfBirth: f.dateOfBirth, gender: f.gender,
          nationality: f.nationality, personalEmail: f.personalEmail,
          phoneNumber: f.phone, emergencyContactName: f.emergencyContactName,
          emergencyContactPhone: f.emergencyContactPhone, homeAddress: f.homeAddress,
          employeeId: f.empId, jobTitle: f.jobTitle, department: f.department,
          employmentType: 'Full-time', workLocation: f.location,
          reportingManager: f.manager, joinDate: f.joinDate,
          probationEndDate: f.probationEndDate, workEmail: f.email,
          salary: f.salary, employmentStatus: f.status, grade: f.grade,
          costCenter: f.costCenter, maritalStatus: f.maritalStatus,
          dependents: f.dependents, workMode: f.workMode,
          countryOfResidence: f.countryOfResidence, passportNumber: f.passportNumber,
          passportExpiry: f.passportExpiry, emiratesIdNumber: f.emiratesIdNumber,
          emiratesIdExpiry: f.emiratesIdExpiry, visaType: f.visaType,
          visaExpiryDate: f.visaExpiryDate, sponsoringEntity: f.sponsoringEntity,
          careerHistory: f.careerHistory, awardsSummary: f.awardsSummary,
          promotionHistory: f.promotionHistory,
        })
        setEditMode(true)
        setEditingEmployeeId(f.id)
        setViewModalOpen(false)
        setModalOpen(true)
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (employee) => {
    if (confirm(`Are you sure you want to archive ${employee.name}?`)) {
      try {
        await deleteEmployee(employee.id)
        setViewModalOpen(false)
        fetchData()
        fetchStatsAndFilters()
      } catch (err) { console.error(err) }
    }
  }

  const handleEmail  = (emp) => { window.location.href = `mailto:${emp.email}` }
  const handleLetter = ()    => { navigate('/admin/letters') }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'employee', label: 'Personnel',
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar initials={row.initials} size="sm" className="shadow-sm border border-slate-200" />
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none mb-1">{row.name}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.empId}</div>
          </div>
        </div>
      ),
    },
    { key: 'jobTitle', label: 'Designation' },
    { key: 'department', label: 'Division' },
    {
      key: 'location', label: 'Region',
      render: (v) => (
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <HiMapPin className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs">{v || 'N/A'}</span>
        </div>
      ),
    },
    { key: 'manager', label: 'Manager' },
    {
      key: 'status', label: 'Talent Health',
      render: (v) => (
        <Badge label={v} variant="outline" color={statusColor(v)} className="font-black uppercase text-[9px] tracking-widest px-2.5" />
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" icon={HiEnvelope}      onClick={() => handleEmail(row)}  className="text-slate-400 hover:text-blue-600" />
          <Button variant="ghost" size="sm" icon={HiEye}           onClick={() => handleView(row)}   className="text-slate-400 hover:text-[#0F766E]" />
          <Button variant="ghost" size="sm" icon={HiDocumentText}  onClick={handleLetter}            className="text-slate-400 hover:text-emerald-600" />
          <Button variant="ghost" size="sm" icon={HiPencil}        onClick={() => handleEdit(row)}   className="text-slate-400 hover:text-blue-600" />
          <Button variant="ghost" size="sm" icon={HiTrash}         onClick={() => handleDelete(row)} className="text-slate-400 hover:text-red-600" />
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-1.5">
              <HiUsers className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Workforce Identity</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Employee Directory</h1>
            <p className="mt-1.5 text-emerald-100/80 text-xs max-w-md leading-relaxed font-medium">Holistic workforce intelligence platform.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-bold text-[#0F766E] shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <HiPlus className="h-4 w-4" /> Initialize Talent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Global Talent"   value={stats.total || 0}                       subtitle="Identity Records"    color="blue"    icon={HiUsers} />
        <StatCard title="Active Talent"   value={stats.active || 0}                      subtitle="Active Workers"      color="emerald" icon={HiShieldCheck} />
        <StatCard title="On Leave"        value={stats.onLeave || 0}                     subtitle="Currently Away"      color="yellow"  icon={HiGlobeAlt} />
        <StatCard title="Total Divisions" value={filterOptions.departments.length || 0}  subtitle="Active Units"        color="indigo"  icon={HiArrowTrendingUp} />
      </div>

      {/* Filters + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-5 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 mb-1">
              <HiAdjustmentsHorizontal className="h-4 w-4 text-[#0F766E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Workspace Intelligence</span>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Search</label>
              <div className="relative mt-1 group">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-[#0F766E] transition-colors" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 font-bold focus:border-[#0F766E] outline-none shadow-inner" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
              <select value={dept} onChange={e => setDept(e.target.value)} className={selectClass}>
                <option value="">All Divisions</option>
                {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
              <select value={job} onChange={e => setJob(e.target.value)} className={selectClass}>
                <option value="">All Designations</option>
                {filterOptions.jobTitles.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
                <option value="">All Statuses</option>
                {filterOptions.statuses?.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Mode</label>
              <select value={workMode} onChange={e => setWorkMode(e.target.value)} className={selectClass}>
                <option value="">All Modes</option>
                {filterOptions.workModes.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button
              onClick={() => { setSearch(''); setDept(''); setJob(''); setLoc(''); setStatus(''); setWorkMode('') }}
              className="w-full py-2.5 text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] border border-dashed border-slate-200 rounded-xl hover:border-red-200 transition-all"
            >
              Reset Workspace
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-3 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <HiArrowPath className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-none">Identity Registry</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time snapshots</p>
                </div>
              </div>
              <Badge label={`${totalRecords} RECORDS`} variant="outline" color="blue" className="font-black text-[8px] px-2 py-0.5" />
            </div>
            <Table columns={columns} data={employeeList} pageSize={8} />
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Employee Profile' : 'Initialize Talent Identity'} size="xl" showClose>
        <form onSubmit={handleSubmit} className="h-full w-full pr-1 space-y-6 pt-2">

          {/* Personal Intelligence */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <HiIdentification className="h-4 w-4 text-[#0F766E]" /> Personal Intelligence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Full Identity Name"  name="fullName"    value={formData.fullName}    onChange={handleFormChange} required />
              <Input label="Date of Birth"       name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleFormChange} required />
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Specification</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange} className={selectClass} required>
                  <option value="">Select...</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleFormChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Country of Residence" name="countryOfResidence" value={formData.countryOfResidence} onChange={handleFormChange} />
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleFormChange} className={selectClass}>
                  <option value="">Select status</option>
                  <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                </select>
              </div>
              <Input label="Number of Dependents" name="dependents" type="number" value={formData.dependents} onChange={handleFormChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Personal Email" name="personalEmail" type="email" value={formData.personalEmail} onChange={handleFormChange} />
              <Input label="Direct Phone"   name="phoneNumber"   type="tel"   value={formData.phoneNumber}   onChange={handleFormChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Emergency Contact Name"  name="emergencyContactName"  value={formData.emergencyContactName}  onChange={handleFormChange} />
              <Input label="Emergency Contact Phone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleFormChange} />
            </div>
            <div className="w-full">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
              <textarea name="homeAddress" value={formData.homeAddress} onChange={handleFormChange} className={textareaClass} rows={2} />
            </div>
          </div>

          {/* Employment Parameters */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <HiBriefcase className="h-4 w-4 text-[#0F766E]" /> Employment Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Assigned Employee ID"    name="employeeId" value={formData.employeeId} onChange={handleFormChange} placeholder="EMP001" required />
              <Input label="Job Title / Designation" name="jobTitle"   value={formData.jobTitle}   onChange={handleFormChange} required />
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Division</label>
                <select name="department" value={formData.department} onChange={handleFormChange} className={selectClass} required>
                  <option value="">Select department</option>
                  <option>IT</option><option>HR</option><option>Finance</option><option>Marketing</option><option>Operations</option><option>Legal</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Type</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleFormChange} className={selectClass} required>
                  <option value="">Select type</option>
                  <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Region</label>
                <select name="workLocation" value={formData.workLocation} onChange={handleFormChange} className={selectClass} required>
                  <option value="">Select location</option>
                  <option>Dubai</option><option>Abu Dhabi</option><option>Remote</option><option>UK</option><option>India</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Mode</label>
                <select name="workMode" value={formData.workMode} onChange={handleFormChange} className={selectClass} required>
                  <option value="">Select work mode</option>
                  <option>In Office</option><option>Remote</option><option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Status</label>
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleFormChange} className={selectClass}>
                  <option value="">Select status</option>
                  <option>Active</option><option>Probation</option><option>Notice Period</option><option>On Leave</option><option>Terminated</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Join Date"          name="joinDate"          type="date" value={formData.joinDate}          onChange={handleFormChange} required />
              <Input label="Probation End Date" name="probationEndDate"  type="date" value={formData.probationEndDate}  onChange={handleFormChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Corporate Email" name="workEmail" type="email"
                value={formData.workEmail}
                onChange={e => { setWorkEmailTouched(true); handleFormChange(e) }}
                required
              />
              {/* type=number prevents text like "10k-25k" — backend requires isFloat */}
              <Input label="Gross Salary (AED)" name="salary" type="number" min="0" step="0.01" value={formData.salary} onChange={handleFormChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Grade Level"          name="grade"      value={formData.grade}      onChange={handleFormChange} />
              <Input label="Cost Center"          name="costCenter" value={formData.costCenter} onChange={handleFormChange} />
              <Input label="Reporting Manager Emp ID" name="reportingManager" value={formData.reportingManager} onChange={handleFormChange} placeholder="EMP001" />
            </div>
          </div>

          {/* Compliance & Records */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <HiDocumentText className="h-4 w-4 text-[#0F766E]" /> Compliance &amp; Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Passport Number"   name="passportNumber"  value={formData.passportNumber}  onChange={handleFormChange} />
              <Input label="Passport Expiry"   name="passportExpiry"  type="date" value={formData.passportExpiry}  onChange={handleFormChange} />
              <Input label="Emirates ID"       name="emiratesIdNumber" value={formData.emiratesIdNumber} onChange={handleFormChange} />
              <Input label="Emirates ID Expiry" name="emiratesIdExpiry" type="date" value={formData.emiratesIdExpiry} onChange={handleFormChange} />
              <Input label="Visa Type"         name="visaType"        value={formData.visaType}        onChange={handleFormChange} />
              <Input label="Visa Expiry Date"  name="visaExpiryDate"  type="date" value={formData.visaExpiryDate}  onChange={handleFormChange} />
              <Input label="Sponsoring Entity" name="sponsoringEntity" value={formData.sponsoringEntity} onChange={handleFormChange} />
            </div>
          </div>

          {/* Career & Achievements */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <HiArrowTrendingUp className="h-4 w-4 text-[#0F766E]" /> Career &amp; Achievements
            </h3>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Career History</label>
              <textarea name="careerHistory" value={formData.careerHistory} onChange={handleFormChange} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Awards Summary</label>
              <textarea name="awardsSummary" value={formData.awardsSummary} onChange={handleFormChange} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Promotion History</label>
              <textarea name="promotionHistory" value={formData.promotionHistory} onChange={handleFormChange} className={textareaClass} rows={2} />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <Button type="submit" label={editMode ? 'UPDATE IDENTITY' : 'INITIALIZE TALENT'} variant="primary" className="flex-1 py-3.5 shadow-xl shadow-emerald-900/10 uppercase font-black text-xs" />
            <Button type="button" label="CANCEL" variant="ghost" onClick={handleCloseModal} className="flex-1 py-3.5 font-black text-slate-400 uppercase text-xs" />
          </div>
        </form>
      </Modal>

      {/* ── View Profile Modal ───────────────────────────────────────────── */}
      {selectedEmployee && (
        <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} title="Deep-Dive Identity Analysis" size="xl" showClose>
          <div className="space-y-4 pt-1 animate-in fade-in duration-500">

            {/* Hero header */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden shadow-inner">
              <Avatar
                initials={selectedEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                size="xl" className="h-20 w-20 shadow-xl border-4 border-white"
              />
              <div className="relative z-10 text-center md:text-left">
                <h2 className="text-xl font-black text-slate-900 leading-none">{selectedEmployee.name}</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                  {selectedEmployee.empId} · {selectedEmployee.jobTitle}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <Badge label={selectedEmployee.department} color="blue" variant="outline" className="font-black text-[8px] px-2 py-0.5" />
                  <Badge label={selectedEmployee.status} color={statusColor(selectedEmployee.status)} variant="outline" className="font-black text-[8px] px-2 py-0.5" />
                </div>
              </div>
              <div className="ml-auto flex gap-2 self-start md:self-center">
                <Button variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEdit(selectedEmployee)} className="text-slate-400 hover:text-[#0F766E] bg-white shadow-sm border border-slate-100" />
                <Button variant="ghost" size="sm" icon={HiTrash}  onClick={() => handleDelete(selectedEmployee)} className="text-slate-400 hover:text-rose-600 bg-white shadow-sm border border-slate-100" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full border border-slate-200 overflow-x-auto no-scrollbar">
              {[
                { id: 'personal',     label: 'Identity',   icon: HiIdentification },
                { id: 'work',         label: 'Employment', icon: HiBriefcase },
                { id: 'documents',    label: 'Registry',   icon: HiFolder },
                { id: 'visa',         label: 'Visa/Nat',   icon: HiCheckBadge },
                { id: 'attendance',   label: 'Presence',   icon: HiClock },
                { id: 'leave',        label: 'Absence',    icon: HiCalendarDays },
                { id: 'performance',  label: 'Talent',     icon: HiPresentationChartLine },
                { id: 'assets',       label: 'Assets',     icon: HiDevicePhoneMobile },
              ].map(tab => (
                <button key={tab.id} onClick={() => setViewActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${viewActiveTab === tab.id ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[350px]">

              {viewActiveTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Identity</p><p className="text-xs font-black text-slate-900">{selectedEmployee.name}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned ID</p><p className="text-xs font-black text-slate-900">{selectedEmployee.empId}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p><p className="text-xs font-black text-slate-900">{selectedEmployee.gender || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Nationality</p><p className="text-xs font-black text-slate-900">{selectedEmployee.nationality || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p><p className="text-xs font-black text-slate-900">{selectedEmployee.dateOfBirth || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Marital Status</p><p className="text-xs font-black text-slate-900">{selectedEmployee.maritalStatus || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Email</p><p className="text-xs font-black text-[#0F766E]">{selectedEmployee.email}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Email</p><p className="text-xs font-black text-slate-900">{selectedEmployee.personalEmail || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile</p><p className="text-xs font-black text-slate-900">{selectedEmployee.phone || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dependents</p><p className="text-xs font-black text-slate-900">{selectedEmployee.dependents ?? '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</p><p className="text-xs font-black text-slate-900">{selectedEmployee.emergencyContactName || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Phone</p><p className="text-xs font-black text-slate-900">{selectedEmployee.emergencyContactPhone || '—'}</p></div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Residential Address</p><p className="text-xs font-black text-slate-900">{selectedEmployee.homeAddress || '—'}</p></div>
                </div>
              )}

              {viewActiveTab === 'work' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Designation</p><p className="text-xs font-black text-slate-900">{selectedEmployee.jobTitle}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Division</p><p className="text-xs font-black text-slate-900">{selectedEmployee.department}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Region</p><p className="text-xs font-black text-slate-900">{selectedEmployee.location || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Manager</p><p className="text-xs font-black text-slate-900">{selectedEmployee.manager || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Join Date</p><p className="text-xs font-black text-slate-900">{selectedEmployee.joinDate || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Mode</p><p className="text-xs font-black text-slate-900">{selectedEmployee.workMode || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary</p><p className="text-xs font-black text-slate-900">{selectedEmployee.salary ? `AED ${selectedEmployee.salary}` : '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p><p className="text-xs font-black text-slate-900">{selectedEmployee.grade || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Center</p><p className="text-xs font-black text-slate-900">{selectedEmployee.costCenter || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Probation End</p><p className="text-xs font-black text-slate-900">{selectedEmployee.probationEndDate || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><p className="text-xs font-black text-slate-900">{selectedEmployee.status}</p></div>
                  </div>
                </div>
              )}

              {viewActiveTab === 'visa' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport No.</p><p className="text-xs font-black text-slate-900">{selectedEmployee.passportNumber || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport Expiry</p><p className="text-xs font-black text-slate-900">{selectedEmployee.passportExpiry || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Emirates ID</p><p className="text-xs font-black text-slate-900">{selectedEmployee.emiratesIdNumber || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Emirates ID Expiry</p><p className="text-xs font-black text-slate-900">{selectedEmployee.emiratesIdExpiry || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visa Type</p><p className="text-xs font-black text-slate-900">{selectedEmployee.visaType || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visa Expiry</p><p className="text-xs font-black text-slate-900">{selectedEmployee.visaExpiryDate || '—'}</p></div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sponsoring Entity</p><p className="text-xs font-black text-slate-900">{selectedEmployee.sponsoringEntity || '—'}</p></div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Country of Residence</p><p className="text-xs font-black text-slate-900">{selectedEmployee.countryOfResidence || '—'}</p></div>
                </div>
              )}

              {viewActiveTab === 'documents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Career History</p><p className="text-xs font-black text-slate-900 whitespace-pre-wrap">{selectedEmployee.careerHistory || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Awards Summary</p><p className="text-xs font-black text-slate-900 whitespace-pre-wrap">{selectedEmployee.awardsSummary || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Promotion History</p><p className="text-xs font-black text-slate-900 whitespace-pre-wrap">{selectedEmployee.promotionHistory || '—'}</p></div>
                  </div>
                </div>
              )}

              {(viewActiveTab === 'attendance' || viewActiveTab === 'leave' || viewActiveTab === 'performance' || viewActiveTab === 'assets') && (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Module Intelligence Optimized</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 mt-4">
            <Button label="EDIT IDENTITY" variant="primary" icon={HiPencil} onClick={() => handleEdit(selectedEmployee)} className="flex-1 py-3.5 uppercase font-black text-[10px]" />
            <Button label="ARCHIVE"       variant="ghost"   icon={HiTrash}  onClick={() => handleDelete(selectedEmployee)} className="flex-1 py-3.5 font-black text-rose-400 uppercase text-[10px]" />
            <Button label="CLOSE"         variant="ghost"                   onClick={handleCloseViewModal} className="flex-1 py-3.5 font-black text-slate-400 uppercase text-[10px]" />
          </div>
        </Modal>
      )}

    </div>
  )
}
