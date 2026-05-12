import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiDocumentText, HiEnvelope, HiEye, HiEyeSlash, HiPencil, HiTrash, HiPlus,
  HiMagnifyingGlass, HiArrowTrendingUp, HiIdentification,
  HiBriefcase, HiFolder, HiClock, HiCalendarDays,
  HiPresentationChartLine, HiDevicePhoneMobile, HiCheckBadge,
  HiUserCircle, HiChevronDown, HiArrowsUpDown, HiBanknotes, HiUserGroup, HiAcademicCap, HiBriefcase as HiBriefcaseIcon,
} from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  getEmployeeStats, getFilterOptions, listEmployees,
  getEmployee, createEmployee, updateEmployee, deleteEmployee,
} from '../../../services/employeeService.js'
import { adminSettingsService } from '../../../services/adminSettingsService.js'
import { listDepartments } from '../../../services/departmentService.js'
import { listDesignations } from '../../../services/designationService.js'

const selectClass = 'mt-1.5 w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#0F766E]'
const textareaClass = 'w-full min-h-[100px] rounded-md border border-slate-200 bg-slate-50/50 p-4 text-sm font-bold text-slate-900 outline-none transition-all shadow-inner focus:border-[#0F766E]'
/** Basic tab inputs — match reference UI (light radius + orange focus) */
const basicFieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-orange-200'

function statusColor(status) {
  if (status === 'Active')        return 'green'
  if (status === 'Probation')     return 'blue'
  if (status === 'Notice Period') return 'orange'
  if (status === 'On Leave')      return 'yellow'
  return 'gray'
}

function displayEmpId(raw) {
  if (raw == null || raw === '') return '—'
  const s = String(raw).trim()
  if (/^emp[-_\s]?/i.test(s)) return s.replace(/^emp[-_\s]*/i, 'Emp-')
  const tail = s.replace(/^EMP[-_]?/i, '').replace(/^emp[-_]?/i, '')
  return tail ? `Emp-${tail}` : `Emp-${s}`
}

function formatJoinDateDisplay(value) {
  if (!value) return '—'
  const iso = typeof value === 'string' && !value.includes('T') ? `${value.split(' ')[0]}T12:00:00` : value
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPhoneDisplay(phone) {
  if (phone == null || phone === '') return '—'
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 7)} ${digits.slice(7)}`
  }
  return String(phone).trim()
}

function colLabel(text) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {text}
      <HiArrowsUpDown className="h-3 w-3 shrink-0 opacity-45" aria-hidden />
    </span>
  )
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
    portalRole: e.rbac_role_name || '',
  }
}

function mapEmployeeFull(e) {
  const d = (v) => (v ? v.split('T')[0] : '')
  return {
    id: e.id,
    empId: e.emp_id,
    firstName: e.first_name || '',
    lastName: e.last_name || '',
    name: e.full_name,
    email: e.work_email,
    phone: e.phone_number || '',
    jobTitle: e.job_title,
    department: e.department,
    employmentType: e.employment_type || 'Full-time',
    location: e.work_location || '',
    manager: e.manager_emp_id || e.reporting_manager || '',
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
    bio: e.bio || '',
    rbacRoleId: e.rbac_role_id ?? null,
    rbacRoleName: e.rbac_role_name || '',
    portalEnabled: Boolean(e.portal_enabled),
    // New fields
    religion: e.religion || '',
    employmentSpouse: e.employment_spouse || '',
    bankName: e.bank_name || '',
    bankAccountNo: e.bank_account_no || '',
    ifscCode: e.ifsc_code || '',
    branchAddress: e.branch_address || '',
    familyMembers: e.family_members || [],
    secondaryContact: e.secondary_contact || {},
    education: e.education || [],
    workExperience: e.work_experience || [],
    isCurrentlyWorking: e.is_currently_working || false,
  }
}

const initialFormData = {
  /** Basic Information (primary modal tab) */
  firstName: '',
  lastName: '',
  username: '',
  employeeId: '',
  joinDate: '',
  workEmail: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  department: '',
  jobTitle: '',
  about: '',
  /** Personal Information */
  dateOfBirth: '',
  gender: '',
  nationality: '',
  religion: '',
  maritalStatus: '',
  employmentSpouse: '',
  noOfChildren: '',
  personalEmail: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  homeAddress: '',
  countryOfResidence: '',
  /** Bank Information */
  bankName: '',
  bankAccountNo: '',
  ifscCode: '',
  branchAddress: '',
  /** Family Information */
  familyMembers: [{ name: '', relationship: '', phone: '', passportExpiry: '' }],
  /** Secondary Contact */
  secondaryContact: { name: '', relationship: '', phoneNo1: '', phoneNo2: '' },
  /** Educational Details */
  education: [{ institutionName: '', course: '', startDate: '', endDate: '' }],
  /** Experience */
  workExperience: [{ companyName: '', designation: '', startDate: '', endDate: '' }],
  isCurrentlyWorking: false,
  /** Employment */
  employmentType: 'Full-time',
  workLocation: '',
  reportingManager: '',
  probationEndDate: '',
  salary: '',
  employmentStatus: 'Active',
  grade: '',
  workMode: 'In Office',
  /** Compliance */
  passportNumber: '',
  passportExpiry: '',
  emiratesIdNumber: '',
  emiratesIdExpiry: '',
  visaType: '',
  visaExpiryDate: '',
  sponsoringEntity: '',
  /** Career */
  careerHistory: '',
  awardsSummary: '',
  promotionHistory: '',
  /** Permissions */
  rbacRoleId: '',
  portalEnabled: false,
  portalPassword: '',
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
  const [editMode, setEditMode]             = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)

  // View modal
  const [viewModalOpen, setViewModalOpen]     = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewActiveTab, setViewActiveTab]     = useState('personal')
  const [formTab, setFormTab]                 = useState('basic')
  const [showPassword, setShowPassword]       = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const profileObjectUrlRef = useRef(null)
  const profileFileInputRef = useRef(null)

  // Data
  const [employeeList, setEmployeeList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage]   = useState(1)
  const [loading, setLoading]           = useState(false)
  const [stats, setStats]               = useState({ total: 0, active: 0, onLeave: 0 })
  const [filterOptions, setFilterOptions] = useState({
    departments: [], jobTitles: [], workLocations: [], workModes: [], statuses: [],
  })
  const [tenantRoles, setTenantRoles] = useState([])
  const [departmentsCatalog, setDepartmentsCatalog] = useState([])
  const [designationsCatalog, setDesignationsCatalog] = useState([])

  const departmentRows = useMemo(() => {
    if (departmentsCatalog.length) return departmentsCatalog
    return filterOptions.departments.map((name) => ({ id: name, name }))
  }, [departmentsCatalog, filterOptions.departments])

  const designationRowsForDept = useMemo(() => {
    const dept = String(formData.department || '').trim()
    if (!dept) return []
    return designationsCatalog.filter((row) => {
      const rowDept = String(row.department_name ?? row.departmentName ?? '').trim()
      if (rowDept !== dept) return false
      if (row.is_active === false) return false
      const st = String(row.status ?? '').toLowerCase()
      if (st === 'inactive') return false
      return true
    })
  }, [designationsCatalog, formData.department])

  // Helper functions for dynamic arrays
  const handleFamilyMemberChange = (index, field, value) => {
    const updated = [...formData.familyMembers]
    updated[index][field] = value
    setFormData(prev => ({ ...prev, familyMembers: updated }))
  }

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: '', relationship: '', phone: '', passportExpiry: '' }]
    }))
  }

  const removeFamilyMember = (index) => {
    const updated = [...formData.familyMembers]
    updated.splice(index, 1)
    setFormData(prev => ({ ...prev, familyMembers: updated }))
  }

  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.education]
    updated[index][field] = value
    setFormData(prev => ({ ...prev, education: updated }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institutionName: '', course: '', startDate: '', endDate: '' }]
    }))
  }

  const removeEducation = (index) => {
    const updated = [...formData.education]
    updated.splice(index, 1)
    setFormData(prev => ({ ...prev, education: updated }))
  }

  const handleWorkExpChange = (index, field, value) => {
    const updated = [...formData.workExperience]
    updated[index][field] = value
    setFormData(prev => ({ ...prev, workExperience: updated }))
  }

  const addWorkExp = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { companyName: '', designation: '', startDate: '', endDate: '' }]
    }))
  }

  const removeWorkExp = (index) => {
    const updated = [...formData.workExperience]
    updated.splice(index, 1)
    setFormData(prev => ({ ...prev, workExperience: updated }))
  }

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
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminSettingsService.getAllRoles()
        const list = res?.data?.data
        if (!cancelled && Array.isArray(list)) setTenantRoles(list)
      } catch (err) {
        console.error(err)
      }
    })()
    return () => { cancelled = true }
  }, [])
  useEffect(() => { fetchData() }, [currentPage, search, dept, job, loc, status, workMode])

  useEffect(() => {
    if (!modalOpen) return
    let cancelled = false
    ;(async () => {
      try {
        const [depts, desigs] = await Promise.all([listDepartments(), listDesignations()])
        if (cancelled) return
        setDepartmentsCatalog(Array.isArray(depts) ? depts : [])
        setDesignationsCatalog(Array.isArray(desigs) ? desigs : [])
      } catch {
        if (!cancelled) {
          setDepartmentsCatalog([])
          setDesignationsCatalog([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [modalOpen])

  // ── Form handlers ──────────────────────────────────────────────────────────

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSecondaryContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      secondaryContact: { ...prev.secondaryContact, [field]: value }
    }))
  }

  const handleDepartmentChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, department: value, jobTitle: '' }))
  }

  const revokeProfilePreview = () => {
    if (profileObjectUrlRef.current) {
      URL.revokeObjectURL(profileObjectUrlRef.current)
      profileObjectUrlRef.current = null
    }
    setProfileImagePreview('')
  }

  const handleProfilePick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Image should be below 4 mb')
      return
    }
    revokeProfilePreview()
    profileObjectUrlRef.current = URL.createObjectURL(file)
    setProfileImagePreview(profileObjectUrlRef.current)
  }

  const openAddModal = () => {
    setEditMode(false)
    setEditingEmployeeId(null)
    setFormData(initialFormData)
    setFormTab('basic')
    revokeProfilePreview()
    setShowPassword(false)
    setShowConfirmPassword(false)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setEditMode(false)
    setEditingEmployeeId(null)
    setFormTab('basic')
    setShowPassword(false)
    setShowConfirmPassword(false)
    revokeProfilePreview()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim()
    if (fullName.length < 2) {
      alert('Please enter a valid first name and last name.')
      return
    }

    if (!String(formData.department || '').trim() || !String(formData.jobTitle || '').trim()) {
      alert('Please select Department and Designation in Basic Information.')
      setFormTab('basic')
      return
    }

    const pwd = String(formData.password || '').trim()
    const pwdConfirm = String(formData.confirmPassword || '').trim()
    const portalPwExtra = String(formData.portalPassword || '').trim()

    if (!editMode) {
      if (!pwd || pwd !== pwdConfirm) {
        alert('Password and confirm password must match.')
        return
      }
      if (pwd.length < 8) {
        alert('Password must be at least 8 characters.')
        return
      }
    } else if (pwd || pwdConfirm) {
      if (pwd !== pwdConfirm) {
        alert('Password and confirm password must match.')
        return
      }
      if (pwd.length < 8) {
        alert('Password must be at least 8 characters.')
        return
      }
    }

    const resolvedPortalPassword = pwd || portalPwExtra

    const payload = {
      empId: formData.employeeId,
      fullName,
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      jobTitle: formData.jobTitle,
      department: formData.department,
      employmentType: formData.employmentType,
      workLocation: formData.workLocation || null,
      reportingManagerEmpId: formData.reportingManager || null,
      joinDate: formData.joinDate,
      probationEndDate: formData.probationEndDate || null,
      workEmail: formData.workEmail,
      personalEmail: formData.personalEmail || null,
      phoneNumber: formData.phoneNumber || null,
      employmentStatus: formData.employmentStatus,
      workMode: formData.workMode || null,
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      nationality: formData.nationality || null,
      countryOfResidence: formData.countryOfResidence || null,
      maritalStatus: formData.maritalStatus || null,
      dependents: Math.max(0, parseInt(String(formData.noOfChildren || 0), 10) || 0),
      emergencyContactName: formData.emergencyContactName || null,
      emergencyContactPhone: formData.emergencyContactPhone || null,
      homeAddress: formData.homeAddress || null,
      bio: formData.about || null,
      salary: formData.salary !== '' ? parseFloat(String(formData.salary).replace(/[^0-9.]/g, '')) || null : null,
      grade: formData.grade || null,
      passportNumber: formData.passportNumber || null,
      passportExpiry: formData.passportExpiry || null,
      emiratesIdNumber: formData.emiratesIdNumber || null,
      emiratesIdExpiry: formData.emiratesIdExpiry || null,
      visaType: formData.visaType || null,
      visaExpiryDate: formData.visaExpiryDate || null,
      sponsoringEntity: formData.sponsoringEntity || null,
      careerHistory: formData.careerHistory || null,
      awardsSummary: formData.awardsSummary || null,
      promotionHistory: formData.promotionHistory || null,
      // New fields
      religion: formData.religion || null,
      employmentSpouse: formData.employmentSpouse || null,
      bankName: formData.bankName || null,
      bankAccountNo: formData.bankAccountNo || null,
      ifscCode: formData.ifscCode || null,
      branchAddress: formData.branchAddress || null,
      familyMembers: formData.familyMembers,
      secondaryContact: formData.secondaryContact,
      education: formData.education,
      workExperience: formData.workExperience,
      isCurrentlyWorking: formData.isCurrentlyWorking,
    }

    const rbacNum =
      formData.rbacRoleId !== '' && formData.rbacRoleId != null
        ? parseInt(String(formData.rbacRoleId), 10)
        : NaN
    payload.rbacRoleId = Number.isInteger(rbacNum) && rbacNum > 0 ? rbacNum : null
    payload.portalEnabled =
      Boolean(formData.portalEnabled) || Boolean(resolvedPortalPassword)

    if (resolvedPortalPassword) {
      payload.portalPassword = resolvedPortalPassword
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
        const nameParts = (f.name || '').trim().split(/\s+/).filter(Boolean)
        const firstFromName = nameParts[0] || ''
        const lastFromName = nameParts.slice(1).join(' ')
        setFormData({
          firstName: f.firstName || firstFromName,
          lastName: f.lastName || lastFromName,
          username: '',
          employeeId: f.empId,
          joinDate: f.joinDate,
          workEmail: f.email,
          password: '',
          confirmPassword: '',
          phoneNumber: f.phone,
          department: f.department,
          jobTitle: f.jobTitle,
          about: f.bio || '',
          dateOfBirth: f.dateOfBirth,
          gender: f.gender,
          nationality: f.nationality,
          religion: f.religion || '',
          maritalStatus: f.maritalStatus,
          employmentSpouse: f.employmentSpouse || '',
          noOfChildren: f.dependents?.toString() || '',
          personalEmail: f.personalEmail,
          emergencyContactName: f.emergencyContactName,
          emergencyContactPhone: f.emergencyContactPhone,
          homeAddress: f.homeAddress,
          employmentType: f.employmentType || 'Full-time',
          workLocation: f.location,
          reportingManager: f.manager || '',
          probationEndDate: f.probationEndDate,
          salary: f.salary,
          employmentStatus: f.status,
          grade: f.grade,
          workMode: f.workMode || 'In Office',
          countryOfResidence: f.countryOfResidence,
          passportNumber: f.passportNumber,
          passportExpiry: f.passportExpiry,
          emiratesIdNumber: f.emiratesIdNumber,
          emiratesIdExpiry: f.emiratesIdExpiry,
          visaType: f.visaType,
          visaExpiryDate: f.visaExpiryDate,
          sponsoringEntity: f.sponsoringEntity,
          careerHistory: f.careerHistory,
          awardsSummary: f.awardsSummary,
          promotionHistory: f.promotionHistory,
          rbacRoleId: f.rbacRoleId != null && f.rbacRoleId !== '' ? String(f.rbacRoleId) : '',
          portalEnabled: f.portalEnabled,
          portalPassword: '',
          // New fields
          bankName: f.bankName || '',
          bankAccountNo: f.bankAccountNo || '',
          ifscCode: f.ifscCode || '',
          branchAddress: f.branchAddress || '',
          familyMembers: f.familyMembers || [{ name: '', relationship: '', phone: '', passportExpiry: '' }],
          secondaryContact: f.secondaryContact || { name: '', relationship: '', phoneNo1: '', phoneNo2: '' },
          education: f.education || [{ institutionName: '', course: '', startDate: '', endDate: '' }],
          workExperience: f.workExperience || [{ companyName: '', designation: '', startDate: '', endDate: '' }],
          isCurrentlyWorking: f.isCurrentlyWorking || false,
        })
        setFormTab('basic')
        revokeProfilePreview()
        setShowPassword(false)
        setShowConfirmPassword(false)
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
      key: 'empId',
      label: colLabel('Emp ID'),
      render: (_v, row) => (
        <span className="text-sm font-semibold text-slate-900">{displayEmpId(row.empId)}</span>
      ),
    },
    {
      key: 'name',
      label: colLabel('Name'),
      render: (_v, row) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar initials={row.initials} size="sm" className="h-9 w-9 shrink-0 border border-slate-200 shadow-sm" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{row.name}</div>
            <div className="truncate text-xs text-slate-500">{row.department || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: colLabel('Email'),
      render: (v) => (
        <span className="text-sm text-slate-700">{v || '—'}</span>
      ),
    },
    {
      key: 'phone',
      label: colLabel('Phone'),
      render: (v) => (
        <span className="text-sm text-slate-700">{formatPhoneDisplay(v)}</span>
      ),
    },
    {
      key: 'designation',
      label: colLabel('Designation'),
      render: (_v, row) => (
        <div
          title={row.jobTitle || ''}
          className="inline-flex max-w-[200px] min-w-[140px] cursor-default items-center justify-between gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-left text-sm text-slate-800 shadow-sm"
        >
          <span className="truncate">{row.jobTitle || '—'}</span>
          <HiChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        </div>
      ),
    },
    {
      key: 'joinDate',
      label: colLabel('Joining Date'),
      render: (v) => (
        <span className="text-sm font-medium text-slate-700">{formatJoinDateDisplay(v)}</span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => handleEmail(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100" aria-label="Email">
            <HiEnvelope className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleView(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100" aria-label="View">
            <HiEye className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleLetter} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100" aria-label="Letter">
            <HiDocumentText className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600" aria-label="Edit">
            <HiPencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleDelete(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" aria-label="Delete">
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Filters + Full width Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Employee Listing</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-none border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700">
              {totalRecords} Records
            </span>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64]"
            >
              <HiPlus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50 px-3 pl-9 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
              />
            </div>

            <select value={dept} onChange={(e) => setDept(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#0F766E]">
              <option value="">All Departments</option>
              {filterOptions.departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={job} onChange={(e) => setJob(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#0F766E]">
              <option value="">All Designations</option>
              {filterOptions.jobTitles.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#0F766E]">
              <option value="">All Statuses</option>
              {filterOptions.statuses?.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#0F766E]">
              <option value="">All Modes</option>
              {filterOptions.workModes.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">{employeeList.length} shown</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setDept(''); setJob(''); setLoc(''); setStatus(''); setWorkMode('') }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 transition hover:border-red-200 hover:text-red-500"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <Table columns={columns} data={employeeList} pageSize={8} square />
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="employee"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Employee ID :{' '}
              <span className="text-slate-800">{formData.employeeId || '—'}</span>
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePick} />

          <div className="flex flex-wrap gap-6 border-b border-slate-200 text-sm font-medium">
            <button
              type="button"
              onClick={() => setFormTab('basic')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'basic' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setFormTab('personal')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'personal' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Personal Information
            </button>
            <button
              type="button"
              onClick={() => setFormTab('bank')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'bank' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Bank Information
            </button>
            <button
              type="button"
              onClick={() => setFormTab('family')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'family' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Family Information
            </button>
            <button
              type="button"
              onClick={() => setFormTab('secondary')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'secondary' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Contact Section
            </button>
            <button
              type="button"
              onClick={() => setFormTab('education')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'education' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Educational Details
            </button>
            <button
              type="button"
              onClick={() => setFormTab('experience')}
              className={`border-b-2 pb-2 transition-colors ${formTab === 'experience' ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Experience
            </button>
          </div>

          {/* Basic Information Tab - UNCHANGED */}
          {formTab === 'basic' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-400">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <HiUserCircle className="h-14 w-14" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">Upload Profile Image</p>
                  <p className="text-xs text-slate-500">Image should be below 4 mb</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => profileFileInputRef.current?.click()}
                      className="rounded-md bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ea6a0b]"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        revokeProfilePreview()
                      }}
                      className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="emp-first-name" className="mb-1 block text-sm font-medium text-slate-800">
                    First Name<span className="text-red-500"> *</span>
                  </label>
                  <input
                    id="emp-first-name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-last-name" className="mb-1 block text-sm font-medium text-slate-800">
                    Last Name
                  </label>
                  <input
                    id="emp-last-name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="emp-id" className="mb-1 block text-sm font-medium text-slate-800">
                    Employee ID<span className="text-red-500"> *</span>
                  </label>
                  <input
                    id="emp-id"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-join" className="mb-1 block text-sm font-medium text-slate-800">
                    Joining Date<span className="text-red-500"> *</span>
                  </label>
                  <div className="relative">
                    <input
                      id="emp-join"
                      name="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={handleFormChange}
                      className={`${basicFieldClass} pr-10`}
                      required
                    />
                    <HiCalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="emp-username" className="mb-1 block text-sm font-medium text-slate-800">
                    Username<span className="text-red-500"> *</span>
                  </label>
                  <input
                    id="emp-username"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-email" className="mb-1 block text-sm font-medium text-slate-800">
                    Email<span className="text-red-500"> *</span>
                  </label>
                  <input
                    id="emp-email"
                    name="workEmail"
                    type="email"
                    value={formData.workEmail}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-pwd" className="mb-1 block text-sm font-medium text-slate-800">
                    Password {!editMode && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      id="emp-pwd"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleFormChange}
                      className={`${basicFieldClass} pr-10`}
                      autoComplete="new-password"
                      required={!editMode}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="emp-pwd2" className="mb-1 block text-sm font-medium text-slate-800">
                    Confirm Password {!editMode && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      id="emp-pwd2"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className={`${basicFieldClass} pr-10`}
                      autoComplete="new-password"
                      required={!editMode}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="emp-dept" className="mb-1 block text-sm font-medium text-slate-800">
                    Department<span className="text-red-500"> *</span>
                  </label>
                  <select
                    id="emp-dept"
                    name="department"
                    value={formData.department}
                    onChange={handleDepartmentChange}
                    className={`${basicFieldClass} mt-0`}
                    required
                  >
                    <option value="">Select department</option>
                    {departmentRows.map((d) => {
                      const label = d.name ?? d.department_name ?? String(d.id)
                      const val = d.name ?? d.department_name ?? String(d.id)
                      return (
                        <option key={d.id ?? val} value={val}>{label}</option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label htmlFor="emp-desig" className="mb-1 block text-sm font-medium text-slate-800">
                    Designation<span className="text-red-500"> *</span>
                  </label>
                  <select
                    id="emp-desig"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleFormChange}
                    className={`${basicFieldClass} mt-0`}
                    required
                    disabled={!formData.department}
                  >
                    <option value="">Select designation</option>
                    {formData.jobTitle &&
                    !designationRowsForDept.some((row) => row.name === formData.jobTitle) ? (
                      <option value={formData.jobTitle}>{formData.jobTitle}</option>
                    ) : null}
                    {designationRowsForDept.map((row) => (
                      <option key={row.id} value={row.name}>{row.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="emp-phone" className="mb-1 block text-sm font-medium text-slate-800">
                    Phone Number<span className="text-red-500"> *</span>
                  </label>
                  <input
                    id="emp-phone"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emp-role" className="mb-1 block text-sm font-medium text-slate-800">
                    Role
                  </label>
                  <select
                    id="emp-role"
                    name="rbacRoleId"
                    value={formData.rbacRoleId}
                    onChange={handleFormChange}
                    className={`${basicFieldClass} mt-0`}
                  >
                    <option value="">Select role</option>
                    {tenantRoles.map((r) => (
                      <option key={r.id} value={String(r.id)}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="emp-about" className="mb-1 block text-sm font-medium text-slate-800">
                    About<span className="text-red-500"> *</span>
                  </label>
                  <textarea
                    id="emp-about"
                    name="about"
                    value={formData.about}
                    onChange={handleFormChange}
                    rows={4}
                    className={`${basicFieldClass} min-h-[120px]`}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Information Tab */}
          {formTab === 'personal' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="passport-number" className="mb-1 block text-sm font-medium text-slate-800">
                    Passport No <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="passport-number"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="passport-expiry" className="mb-1 block text-sm font-medium text-slate-800">
                    Passport Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="passport-expiry"
                    name="passportExpiry"
                    type="date"
                    value={formData.passportExpiry}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="nationality" className="mb-1 block text-sm font-medium text-slate-800">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="religion" className="mb-1 block text-sm font-medium text-slate-800">
                    Religion
                  </label>
                  <input
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="marital-status" className="mb-1 block text-sm font-medium text-slate-800">
                    Marital status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="marital-status"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="employment-spouse" className="mb-1 block text-sm font-medium text-slate-800">
                    Employment spouse
                  </label>
                  <input
                    id="employment-spouse"
                    name="employmentSpouse"
                    value={formData.employmentSpouse}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="no-of-children" className="mb-1 block text-sm font-medium text-slate-800">
                    No. of children
                  </label>
                  <input
                    id="no-of-children"
                    name="noOfChildren"
                    type="number"
                    min="0"
                    value={formData.noOfChildren}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="work-location" className="mb-1 block text-sm font-medium text-slate-800">
                    Work Location
                  </label>
                  <select
                    id="work-location"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  >
                    <option value="">Select location</option>
                    {(filterOptions.workLocations?.length ? filterOptions.workLocations : ['Dubai', 'Abu Dhabi', 'Remote', 'UK', 'India']).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bank Information Tab */}
          {formTab === 'bank' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bank-name" className="mb-1 block text-sm font-medium text-slate-800">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bank-name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bank-account-no" className="mb-1 block text-sm font-medium text-slate-800">
                    Bank account No
                  </label>
                  <input
                    id="bank-account-no"
                    name="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="ifsc-code" className="mb-1 block text-sm font-medium text-slate-800">
                    IFSC Code
                  </label>
                  <input
                    id="ifsc-code"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="branch-address" className="mb-1 block text-sm font-medium text-slate-800">
                    Branch Address
                  </label>
                  <input
                    id="branch-address"
                    name="branchAddress"
                    value={formData.branchAddress}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Family Information Tab */}
          {formTab === 'family' && (
            <div className="space-y-5">
              {formData.familyMembers.map((member, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Family Member {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={member.name}
                        onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Relationship
                      </label>
                      <input
                        value={member.relationship}
                        onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Phone
                      </label>
                      <input
                        value={member.phone}
                        onChange={(e) => handleFamilyMemberChange(index, 'phone', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Passport Expiry Date
                      </label>
                      <input
                        type="date"
                        value={member.passportExpiry}
                        onChange={(e) => handleFamilyMemberChange(index, 'passportExpiry', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFamilyMember}
                className="mt-2 inline-flex items-center gap-2 text-sm text-[#0F766E] hover:text-[#ea6a0b]"
              >
                <HiPlus className="h-4 w-4" /> Add Family Member
              </button>
            </div>
          )}

          {/* Contact Section Tab */}
          {formTab === 'secondary' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <h4 className="font-semibold text-slate-800">Secondary Contact Details</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.secondaryContact.name}
                      onChange={(e) => handleSecondaryContactChange('name', e.target.value)}
                      className={basicFieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Relationship
                    </label>
                    <input
                      value={formData.secondaryContact.relationship}
                      onChange={(e) => handleSecondaryContactChange('relationship', e.target.value)}
                      className={basicFieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Phone No 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData.secondaryContact.phoneNo1}
                      onChange={(e) => handleSecondaryContactChange('phoneNo1', e.target.value)}
                      className={basicFieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Phone No 2
                    </label>
                    <input
                      value={formData.secondaryContact.phoneNo2}
                      onChange={(e) => handleSecondaryContactChange('phoneNo2', e.target.value)}
                      className={basicFieldClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Educational Details Tab */}
          {formTab === 'education' && (
            <div className="space-y-5">
              {formData.education.map((edu, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Education {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={edu.institutionName}
                        onChange={(e) => handleEducationChange(index, 'institutionName', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={edu.course}
                        onChange={(e) => handleEducationChange(index, 'course', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="mt-2 inline-flex items-center gap-2 text-sm text-[#0F766E] hover:text-[#ea6a0b]"
              >
                <HiPlus className="h-4 w-4" /> Add Education
              </button>
            </div>
          )}

          {/* Experience Tab */}
          {formTab === 'experience' && (
            <div className="space-y-5">
              {formData.workExperience.map((exp, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Experience {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeWorkExp(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Previous Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={exp.companyName}
                        onChange={(e) => handleWorkExpChange(index, 'companyName', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={exp.designation}
                        onChange={(e) => handleWorkExpChange(index, 'designation', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleWorkExpChange(index, 'startDate', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleWorkExpChange(index, 'endDate', e.target.value)}
                        className={basicFieldClass}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addWorkExp}
                className="mt-2 inline-flex items-center gap-2 text-sm text-[#0F766E] hover:text-[#ea6a0b]"
              >
                <HiPlus className="h-4 w-4" /> Add Experience
              </button>
              
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="currently-working"
                  checked={formData.isCurrentlyWorking}
                  onChange={(e) => setFormData(prev => ({ ...prev, isCurrentlyWorking: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                />
                <label htmlFor="currently-working" className="text-sm font-medium text-slate-800">
                  Check if you are currently working here
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#ea6a0b]"
            >
              Save
            </button>
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
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p><p className="text-xs font-black text-slate-900">{selectedEmployee.department}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Region</p><p className="text-xs font-black text-slate-900">{selectedEmployee.location || '—'}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Portal role</p><p className="text-xs font-black text-slate-900">{selectedEmployee.rbacRoleName || '—'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Portal access</p><p className="text-xs font-black text-slate-900">{selectedEmployee.portalEnabled ? 'Enabled' : 'Disabled'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Work email</p><p className="text-xs font-black text-[#0F766E]">{selectedEmployee.email}</p></div>
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