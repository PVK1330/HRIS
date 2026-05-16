import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  HiDocumentText, HiEnvelope, HiEye, HiEyeSlash, HiPencil, HiTrash, HiPlus,
  HiMagnifyingGlass, HiArrowTrendingUp, HiIdentification,
  HiBriefcase, HiFolder, HiClock, HiCalendarDays,
  HiPresentationChartLine, HiDevicePhoneMobile, HiCheckBadge,
  HiUserCircle, HiChevronDown, HiArrowsUpDown, HiBanknotes, HiUserGroup, HiAcademicCap, HiBriefcase as HiBriefcaseIcon,
  HiDocumentArrowDown,
} from 'react-icons/hi2'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  getEmployeeStats, getFilterOptions, listEmployees,
  getEmployee, createEmployee, updateEmployee, deleteEmployee, getNextEmployeeId,
} from '../../../services/employeeService.js'
import { adminSettingsService } from '../../../services/adminSettingsService.js'
import { listDepartments } from '../../../services/departmentService.js'
import { listDesignations } from '../../../services/designationService.js'
import { triggerExport } from '../../../utils/exportHelper.js'
import { todayIsoDate, formatEmpIdDisplay } from '../../../utils/employeeId.js'

const selectClass = 'mt-1.5 w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#0F766E]'
const textareaClass = 'w-full min-h-[100px] rounded-md border border-slate-200 bg-slate-50/50 p-4 text-sm font-bold text-slate-900 outline-none transition-all shadow-inner focus:border-[#0F766E]'
/** Form inputs — primary focus ring matches theme #0F766E */
const basicFieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/25'

const EMPLOYEE_FORM_STEPS = ['basic', 'personal', 'bank', 'family', 'secondary', 'education', 'experience']

function statusColor(status) {
  if (status === 'Active') return 'green'
  if (status === 'Probation') return 'blue'
  if (status === 'Notice Period') return 'orange'
  if (status === 'On Leave') return 'yellow'
  return 'gray'
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
    manager: e.manager_name || e.reporting_manager || 'N/A',
    status: e.employment_status || 'Active',
    joinDate: e.join_date || '',
    workMode: e.work_mode || '',
    initials: e.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    portalRole: e.rbac_role_name || '',
    rbacRoleName: e.rbac_role_name || '',
    profileImageUrl: e.profile_image_url || '',
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
    manager: e.manager_name || e.manager_emp_id || e.reporting_manager || '',
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
    username: e.username || '',
    profileImageUrl: e.profile_image_url || '',
    createdAt: e.createdAt || '',
    updatedAt: e.updatedAt || '',
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
  costCenter: '',
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
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [job, setJob] = useState('')
  const [loc, setLoc] = useState('')
  const [status, setStatus] = useState('')
  const [workMode, setWorkMode] = useState('')

  const [exportOpen, setExportOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const exportRef = useRef(null)

  // Add/Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editMode, setEditMode] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewActiveTab, setViewActiveTab] = useState('personal')
  const [formTab, setFormTab] = useState('basic')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const profileObjectUrlRef = useRef(null)
  const profileFileInputRef = useRef(null)
  const profileFileRef = useRef(null)

  // Data
  const [employeeList, setEmployeeList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0, probation: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [empIdLoading, setEmpIdLoading] = useState(false)
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

  const employeeFormStepIndex = EMPLOYEE_FORM_STEPS.indexOf(formTab)
  const safeFormStepIdx = employeeFormStepIndex < 0 ? 0 : employeeFormStepIndex
  const isLastEmployeeStep = safeFormStepIdx === EMPLOYEE_FORM_STEPS.length - 1
  const isFirstEmployeeStep = safeFormStepIdx === 0

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
        const rows = data.employees || data.records || []
        setEmployeeList(rows.map(mapEmployeeList))
        setTotalRecords(data.total ?? data.pagination?.total ?? 0)
      }
    } catch (err) {
      console.error(err)
      toast.error('Could not load employees.')
    }
    finally { setLoading(false) }
  }

  const runEmployeeExport = async (type) => {
    const ext = type === 'pdf' ? 'pdf' : 'xlsx'
    const today = new Date().toISOString().slice(0, 10)
    const filename = `employees_${today}.${ext}`
    const filters = {
      search,
      department: dept,
      status,
      workMode,
      jobTitle: job,
      workLocation: loc,
    }
    setExportLoading(true)
    const tid = toast.loading('Preparing export…')
    try {
      await triggerExport('employees', filters, type, filename)
      toast.success('Export ready.', { id: tid })
    } catch (err) {
      console.error(err)
      toast.error('Export failed.', { id: tid })
    } finally {
      setExportLoading(false)
      setExportOpen(false)
    }
  }

  const fetchStatsAndFilters = async () => {
    try {
      const [s, f] = await Promise.all([getEmployeeStats(), getFilterOptions()])
      if (s) setStats(s)
      if (f) setFilterOptions(f)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    const onOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    if (exportOpen) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [exportOpen])

  useEffect(() => { fetchStatsAndFilters() }, [])
  useEffect(() => {
    setCurrentPage(1)
  }, [search, dept, job, loc, status, workMode])
  useEffect(() => { fetchData() }, [currentPage, search, dept, job, loc, status, workMode])

  useEffect(() => {
    let cancelled = false
      ; (async () => {
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

  useEffect(() => {
    if (!modalOpen) return
    let cancelled = false
      ; (async () => {
        try {
          const [depts, desigs] = await Promise.all([listDepartments(), listDesignations()])
          if (cancelled) return
          setDepartmentsCatalog(depts?.departments ?? depts?.records ?? [])
          setDesignationsCatalog(desigs?.designations ?? desigs?.records ?? [])
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
      toast.error('Please choose an image file.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image should be below 4 mb')
      return
    }
    profileFileRef.current = file
    revokeProfilePreview()
    profileObjectUrlRef.current = URL.createObjectURL(file)
    setProfileImagePreview(profileObjectUrlRef.current)
  }

  const fillNextEmployeeId = async (records = employeeList) => {
    setEmpIdLoading(true)
    try {
      const nextId = await getNextEmployeeId(records)
      setFormData((prev) => ({ ...prev, employeeId: String(nextId) }))
      return nextId
    } catch {
      toast.error('Could not assign the next employee ID.')
      return null
    } finally {
      setEmpIdLoading(false)
    }
  }

  const openAddModal = async () => {
    setEditMode(false)
    setEditingEmployeeId(null)
    setFormTab('basic')
    profileFileRef.current = null
    revokeProfilePreview()
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFormData({
      ...initialFormData,
      joinDate: todayIsoDate(),
    })
    setModalOpen(true)
    await fillNextEmployeeId(employeeList)
  }

  useEffect(() => {
    if (!modalOpen || editMode || formData.employeeId || empIdLoading) return
    fillNextEmployeeId(employeeList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, editMode])

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setEditMode(false)
    setEditingEmployeeId(null)
    setFormTab('basic')
    setShowPassword(false)
    setShowConfirmPassword(false)
    revokeProfilePreview()
    profileFileRef.current = null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim()
    if (fullName.length < 2) {
      toast.error('Please enter a valid first name and last name.')
      return
    }

    if (!String(formData.username || '').trim()) {
      toast.error('Please enter a username on Basic Information.')
      setFormTab('basic')
      return
    }

    if (!String(formData.department || '').trim() || !String(formData.jobTitle || '').trim()) {
      toast.error('Please select Department and Designation in Basic Information.')
      setFormTab('basic')
      return
    }

    const pwd = String(formData.password || '').trim()
    const pwdConfirm = String(formData.confirmPassword || '').trim()
    const portalPwExtra = String(formData.portalPassword || '').trim()

    if (!editMode) {
      if (!pwd || pwd !== pwdConfirm) {
        toast.error('Password and confirm password must match.')
        return
      }
      if (pwd.length < 8) {
        toast.error('Password must be at least 8 characters.')
        return
      }
    } else if (pwd || pwdConfirm) {
      if (pwd !== pwdConfirm) {
        toast.error('Password and confirm password must match.')
        return
      }
      if (pwd.length < 8) {
        toast.error('Password must be at least 8 characters.')
        return
      }
    }

    const resolvedPortalPassword = pwd || portalPwExtra

    let empId = String(formData.employeeId || '').trim()
    if (!empId && !editMode) {
      empId = String((await getNextEmployeeId(employeeList)) || '')
      if (empId) {
        setFormData((prev) => ({ ...prev, employeeId: empId }))
      }
    }
    if (!empId && !editMode) {
      toast.error('Employee ID could not be assigned. Please try again.')
      setFormTab('basic')
      return
    }

    const payload = {
      empId,
      username: String(formData.username || '').trim() || null,
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
      gender: formData.gender || undefined,
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
      costCenter: formData.costCenter?.trim() ? formData.costCenter.trim() : null,
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
      familyMembers: (formData.familyMembers || []).filter((m) => String(m?.name || '').trim()),
      secondaryContact: formData.secondaryContact || {},
      education: (formData.education || []).filter((x) => String(x?.institutionName || '').trim()),
      workExperience: (formData.workExperience || []).filter((x) => String(x?.companyName || '').trim()),
      isCurrentlyWorking: Boolean(formData.isCurrentlyWorking),
      // Normalized section payloads for new employee_* tables
      bankDetails: {
        bankName: formData.bankName || null,
        accountHolder: [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim() || null,
        accountNumber: formData.bankAccountNo || null,
        ifscCode: formData.ifscCode || null,
        branchAddress: formData.branchAddress || null,
      },
      emergencyContacts: [
        {
          contactName: formData.secondaryContact?.name || null,
          relationship: formData.secondaryContact?.relationship || null,
          phonePrimary: formData.secondaryContact?.phoneNo1 || null,
          phoneSecondary: formData.secondaryContact?.phoneNo2 || null,
          isPrimary: true,
        },
        {
          contactName: formData.emergencyContactName || null,
          phonePrimary: formData.emergencyContactPhone || null,
          isPrimary: false,
        },
      ].filter((c) => String(c.contactName || c.phonePrimary || '').trim()),
      addresses: [
        {
          addressType: 'home',
          line1: formData.homeAddress || null,
          country: formData.countryOfResidence || null,
          isPrimary: true,
        },
      ].filter((a) => String(a.line1 || a.country || '').trim()),
      educationDetails: (formData.education || [])
        .filter((x) => String(x?.institutionName || '').trim())
        .map((x) => ({
          institutionName: x.institutionName || null,
          courseName: x.course || null,
          startDate: x.startDate || null,
          endDate: x.endDate || null,
        })),
      experienceDetails: (formData.workExperience || [])
        .filter((x) => String(x?.companyName || '').trim())
        .map((x) => ({
          companyName: x.companyName || null,
          designation: x.designation || null,
          startDate: x.startDate || null,
          endDate: x.endDate || null,
          isCurrent: Boolean(formData.isCurrentlyWorking),
        })),
      salaryDetails: formData.salary !== ''
        ? {
          currency: 'AED',
          basicSalary: parseFloat(String(formData.salary).replace(/[^0-9.]/g, '')) || null,
          paymentFrequency: 'Monthly',
        }
        : null,
      documents: [],
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

    const file = profileFileRef.current
    if (file) {
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
          payload.profileImageBase64 = dataUrl
        }
      } catch (imgErr) {
        console.error(imgErr)
        toast.error('Could not read profile image.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (editMode && editingEmployeeId) {
        await updateEmployee(editingEmployeeId, payload)
        toast.success('Employee updated.')
      } else {
        await createEmployee(payload)
        toast.success('Employee created.')
      }
      profileFileRef.current = null
      handleCloseModal()
      fetchData()
      fetchStatsAndFilters()
    } catch (err) {
      console.error(err)
      const apiErrors = err?.response?.data?.errors
      const apiMessage = err?.response?.data?.message
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const first = apiErrors[0]
        const field = first?.field ? `${first.field}: ` : ''
        toast.error(`${field}${first?.message || 'Validation failed'}`)
        return
      }
      toast.error(apiMessage || 'Failed to save employee.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── View / Edit / Delete ───────────────────────────────────────────────────

  const handleView = async (employee) => {
    try {
      const data = await getEmployee(employee.id)
      if (data) { setSelectedEmployee(mapEmployeeFull(data)); setViewActiveTab('basic'); setViewModalOpen(true) }
    } catch (err) {
      console.error(err)
      setSelectedEmployee(employee)
      setViewActiveTab('basic')
      setViewModalOpen(true)
    }
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
          username: f.username || '',
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
          costCenter: f.costCenter || '',
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
        profileFileRef.current = null
        revokeProfilePreview()
        if (data.profile_image_url) {
          setProfileImagePreview(String(data.profile_image_url))
        }
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
        toast.success('Employee archived.')
      } catch (err) {
        console.error(err)
        toast.error('Could not archive employee.')
      }
    }
  }

  const handleEmail = (emp) => { window.location.href = `mailto:${emp.email}` }
  const handleLetter = () => { navigate('/admin/letters') }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'empId',
      label: colLabel('Emp ID'),
      render: (_v, row) => (
        <span className="text-sm font-semibold text-slate-900">{formatEmpIdDisplay(row.empId)}</span>
      ),
    },
    {
      key: 'name',
      label: colLabel('Name'),
      render: (_v, row) => (
        <div className="flex items-center gap-3 py-1">
          {row.profileImageUrl ? (
            <img src={row.profileImageUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover border border-slate-200 shadow-sm" />
          ) : (
            <Avatar name={row.name} size="sm" />
          )}
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
        <span className="text-sm font-medium text-slate-700 block truncate max-w-[180px]" title={row.jobTitle || ''}>
          {row.jobTitle || '—'}
        </span>
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
          {/* <button type="button" onClick={() => handleEmail(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100" aria-label="Email">
          <HiEnvelope className="h-4 w-4" />
        </button>        
        <button type="button" onClick={handleLetter} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100" aria-label="Letter">
          <HiDocumentText className="h-4 w-4" />
        </button> */}
          <button type="button" onClick={() => handleView(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-blue-500 text-white transition-colors hover:bg-blue-600" aria-label="View">
            <HiEye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56]" aria-label="Edit">
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
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar with Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Employee Directory</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Employees</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Employees Directory</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              disabled={exportLoading}
              onClick={() => setExportOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
            >
              <HiDocumentArrowDown className="h-4 w-4" />
              Export
              <HiChevronDown className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-none border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  disabled={exportLoading}
                  onClick={() => runEmployeeExport('excel')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiDocumentArrowDown className="h-4 w-4 text-slate-500" />
                  Export as Excel
                </button>
                <button
                  type="button"
                  disabled={exportLoading}
                  onClick={() => runEmployeeExport('pdf')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiDocumentArrowDown className="h-4 w-4 text-slate-500" />
                  Export as PDF
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Requested KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL EMPLOYEE',
            count: stats.total || totalRecords || employeeList.length || 0,
            bgColor: 'bg-[#0F172A]',
            icon: HiUserGroup,
            onClickFilter: () => setStatus('')
          },
          {
            label: 'ACTIVE',
            count: stats.active || employeeList.filter(e => e.status === 'Active').length || 0,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckBadge,
            onClickFilter: () => setStatus('Active')
          },
          {
            label: 'INACTIVE',
            count: Math.max(0, (stats.total || totalRecords || employeeList.length || 0) - (stats.active || employeeList.filter(e => e.status === 'Active').length || 0)),
            bgColor: 'bg-[#EF4444]',
            icon: HiUserCircle,
            onClickFilter: () => setStatus('Inactive')
          },
          {
            label: 'NEW JOINERS',
            count: stats.probation || employeeList.filter(e => e.status === 'Probation').length || 0,
            bgColor: 'bg-[#3B82F6]',
            icon: HiPlus,
            onClickFilter: () => setStatus('Probation')
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'TOTAL EMPLOYEE' && status === '') ||
            (card.label === 'ACTIVE' && status === 'Active') ||
            (card.label === 'INACTIVE' && status === 'Inactive') ||
            (card.label === 'NEW JOINERS' && status === 'Probation');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Full width Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Employee Listing</h2>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select value={dept} onChange={(e) => setDept(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Departments</option>
              {filterOptions.departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={job} onChange={(e) => setJob(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Designations</option>
              {filterOptions.jobTitles.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Statuses</option>
              {filterOptions.statuses?.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Modes</option>
              {filterOptions.workModes.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={loc} onChange={(e) => setLoc(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Locations</option>
              {filterOptions.workLocations?.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{employeeList.length} records shown</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setDept(''); setJob(''); setLoc(''); setStatus(''); setWorkMode('') }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={employeeList}
          pageSize={8}
          square
          loading={loading}
          totalCount={totalRecords}
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
        />
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
              <span className="text-slate-800">
                {empIdLoading ? 'Assigning…' : (formData.employeeId || '—')}
              </span>
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePick} />

          <div className="-mx-1 flex gap-5 overflow-x-auto border-b border-slate-200 pb-px text-sm font-medium whitespace-nowrap [scrollbar-width:thin]">
            {[
              { id: 'basic', label: 'Basic Information' },
              { id: 'personal', label: 'Personal Information' },
              { id: 'bank', label: 'Bank Information' },
              { id: 'family', label: 'Family Information' },
              { id: 'secondary', label: 'Contact Section' },
              { id: 'education', label: 'Educational Details' },
              { id: 'experience', label: 'Experience' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFormTab(id)}
                className={`shrink-0 border-b-2 pb-2 transition-colors ${formTab === id ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {label}
              </button>
            ))}
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
                      className="rounded-md bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d5c56]"
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
                    placeholder="Enter first name"
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
                    placeholder="Enter last name"
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
                    value={empIdLoading ? '' : formData.employeeId}
                    readOnly
                    placeholder={empIdLoading ? 'Assigning next ID…' : 'e.g. EMP-1'}
                    className={`${basicFieldClass} cursor-not-allowed bg-slate-100 text-slate-600`}
                    aria-readonly="true"
                    required
                  />
                  {!editMode && (
                    <p className="mt-1 text-xs text-slate-500">Assigned automatically (EMP-1, EMP-2, …).</p>
                  )}
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
                    placeholder="Portal login username"
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
                    placeholder="name@company.com"
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
                      placeholder="Min. 8 characters"
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
                      placeholder="Repeat password"
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
                    placeholder="e.g. 501234567"
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
                <div>
                  <label htmlFor="emp-cost-center" className="mb-1 block text-sm font-medium text-slate-800">
                    Cost center
                  </label>
                  <input
                    id="emp-cost-center"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleFormChange}
                    placeholder="e.g. CC-1001"
                    className={basicFieldClass}
                  />
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
                    placeholder="Short professional summary or notes"
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
                {/* <div>
                  <label htmlFor="passport-number" className="mb-1 block text-sm font-medium text-slate-800">
                    Passport No
                  </label>
                  <input
                    id="passport-number"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleFormChange}
                    placeholder="Passport number"
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="passport-expiry" className="mb-1 block text-sm font-medium text-slate-800">
                    Passport Expiry Date
                  </label>
                  <input
                    id="passport-expiry"
                    name="passportExpiry"
                    type="date"
                    value={formData.passportExpiry}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  />
                </div> */}
                <div>
                  <label htmlFor="nationality" className="mb-1 block text-sm font-medium text-slate-800">
                    Nationality
                  </label>
                  <input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleFormChange}
                    placeholder="e.g. UAE, India, UK"
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="mb-1 block text-sm font-medium text-slate-800">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className={basicFieldClass}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                    placeholder="Optional"
                    className={basicFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="marital-status" className="mb-1 block text-sm font-medium text-slate-800">
                    Marital status
                  </label>
                  <select
                    id="marital-status"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleFormChange}
                    className={basicFieldClass}
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
                    placeholder="Spouse employer / role"
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
                    placeholder="0"
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
                    Bank Name
                  </label>
                  <input
                    id="bank-name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleFormChange}
                    placeholder="Bank name"
                    className={basicFieldClass}
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
                    placeholder="Account number"
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
                    placeholder="e.g. ABCD0123456"
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
                    placeholder="Branch address"
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
                        Name
                      </label>
                      <input
                        value={member.name}
                        onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                        placeholder="Full name"
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Relationship
                      </label>
                      <input
                        value={member.relationship}
                        onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                        placeholder="e.g. Spouse, Child"
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
                        placeholder="Phone number"
                        className={basicFieldClass}
                      />
                    </div>
                    {/* <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Passport Expiry Date
                      </label>
                      <input
                        type="date"
                        value={member.passportExpiry}
                        onChange={(e) => handleFamilyMemberChange(index, 'passportExpiry', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div> */}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFamilyMember}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#0F766E] hover:text-[#0d5c56]"
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
                      Name
                    </label>
                    <input
                      value={formData.secondaryContact.name}
                      onChange={(e) => handleSecondaryContactChange('name', e.target.value)}
                      placeholder="Contact person name"
                      className={basicFieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Relationship
                    </label>
                    <input
                      value={formData.secondaryContact.relationship}
                      onChange={(e) => handleSecondaryContactChange('relationship', e.target.value)}
                      placeholder="Relationship to employee"
                      className={basicFieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Phone No 1
                    </label>
                    <input
                      value={formData.secondaryContact.phoneNo1}
                      onChange={(e) => handleSecondaryContactChange('phoneNo1', e.target.value)}
                      placeholder="Primary phone"
                      className={basicFieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                      Phone No 2
                    </label>
                    <input
                      value={formData.secondaryContact.phoneNo2}
                      onChange={(e) => handleSecondaryContactChange('phoneNo2', e.target.value)}
                      placeholder="Alternate phone"
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
                        Institution Name
                      </label>
                      <input
                        value={edu.institutionName}
                        onChange={(e) => handleEducationChange(index, 'institutionName', e.target.value)}
                        placeholder="School / university name"
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Course
                      </label>
                      <input
                        value={edu.course}
                        onChange={(e) => handleEducationChange(index, 'course', e.target.value)}
                        placeholder="Degree / course title"
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#0F766E] hover:text-[#0d5c56]"
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
                        Previous Company Name
                      </label>
                      <input
                        value={exp.companyName}
                        onChange={(e) => handleWorkExpChange(index, 'companyName', e.target.value)}
                        placeholder="Company name"
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Designation
                      </label>
                      <input
                        value={exp.designation}
                        onChange={(e) => handleWorkExpChange(index, 'designation', e.target.value)}
                        placeholder="Your role / title"
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleWorkExpChange(index, 'startDate', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-800">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleWorkExpChange(index, 'endDate', e.target.value)}
                        className={basicFieldClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addWorkExp}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#0F766E] hover:text-[#0d5c56]"
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {!isFirstEmployeeStep && (
                <button
                  type="button"
                  onClick={() => setFormTab(EMPLOYEE_FORM_STEPS[safeFormStepIdx - 1])}
                  className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Previous
                </button>
              )}
              {!isLastEmployeeStep && (
                <button
                  type="button"
                  onClick={() => setFormTab(EMPLOYEE_FORM_STEPS[safeFormStepIdx + 1])}
                  className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56]"
                >
                  Next
                </button>
              )}
              {isLastEmployeeStep && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* ── View Profile Modal ───────────────────────────────────────────── */}
      {selectedEmployee && (
        <Modal isOpen={viewModalOpen} onClose={handleCloseViewModal} size="xl" showClose>
          <div className="space-y-0 divide-y divide-slate-100">

            {/* Header */}
            <div className="flex items-start justify-between pb-5">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {selectedEmployee.profileImageUrl ? (
                    <img src={selectedEmployee.profileImageUrl} alt="" className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <Avatar name={selectedEmployee.name} size="lg" />
                  )}
                  <div className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white ${selectedEmployee.status === 'Active' ? 'bg-green-500' :
                    selectedEmployee.status === 'Probation' ? 'bg-blue-500' :
                      selectedEmployee.status === 'On Leave' ? 'bg-yellow-400' : 'bg-slate-400'
                    }`} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{selectedEmployee.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{formatEmpIdDisplay(selectedEmployee.empId)} · {selectedEmployee.jobTitle || '—'}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />{selectedEmployee.status || '—'}
                    </span>
                    {selectedEmployee.department && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">{selectedEmployee.department}</span>
                    )}
                    {selectedEmployee.workMode && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{selectedEmployee.workMode}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedEmployee)} className="inline-flex items-center gap-1.5 rounded-md bg-[#0F766E] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0d5c56]">
                  <HiPencil className="h-3.5 w-3.5" />Edit
                </button>
                <button onClick={() => handleDelete(selectedEmployee)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  <HiTrash className="h-3.5 w-3.5" />Delete
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100">
              {[
                { label: 'Join Date', value: formatJoinDateDisplay(selectedEmployee.joinDate) },
                { label: 'Work Email', value: selectedEmployee.email || '—' },
                { label: 'Phone', value: formatPhoneDisplay(selectedEmployee.phone) },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="divide-y divide-slate-100">
              {[
                {
                  id: 'basic', label: 'Basic Information',
                  iconBg: 'bg-blue-50', iconColor: 'text-blue-600', icon: <HiBriefcase className="h-4 w-4" />,
                  content: (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        ['Employee ID', formatEmpIdDisplay(selectedEmployee.empId)],
                        ['Full Name', selectedEmployee.name],
                        ['Work Email', selectedEmployee.email],
                        ['Phone', formatPhoneDisplay(selectedEmployee.phone)],
                        ['Department', selectedEmployee.department],
                        ['Designation', selectedEmployee.jobTitle],
                        ['Join Date', formatJoinDateDisplay(selectedEmployee.joinDate)],
                        ['Portal Role', selectedEmployee.rbacRoleName || selectedEmployee.portalRole],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'personal', label: 'Personal Information',
                  iconBg: 'bg-teal-50', iconColor: 'text-teal-700', icon: <HiUserCircle className="h-4 w-4" />,
                  content: (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        ['Gender', selectedEmployee.gender],
                        ['Date of Birth', selectedEmployee.dateOfBirth],
                        ['Nationality', selectedEmployee.nationality],
                        ['Marital Status', selectedEmployee.maritalStatus],
                        ['Religion', selectedEmployee.religion],
                        ['No. of Children', selectedEmployee.dependents],
                        ['Personal Email', selectedEmployee.personalEmail],
                        ['Country of Residence', selectedEmployee.countryOfResidence],
                        ['Home Address', selectedEmployee.homeAddress],
                      ].map(([label, val]) => (
                        <div key={label} className={label === 'Home Address' ? 'col-span-2' : ''}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'bank', label: 'Bank Information',
                  iconBg: 'bg-amber-50', iconColor: 'text-amber-700', icon: <HiBanknotes className="h-4 w-4" />,
                  content: (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        ['Bank Name', selectedEmployee.bankName],
                        ['Account Number', selectedEmployee.bankAccountNo],
                        ['IFSC Code', selectedEmployee.ifscCode],
                        ['Branch Address', selectedEmployee.branchAddress],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'family', label: 'Family Information',
                  iconBg: 'bg-pink-50', iconColor: 'text-pink-700', icon: <HiUserGroup className="h-4 w-4" />,
                  content: selectedEmployee.familyMembers?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.familyMembers.map((m, i) => (
                        <div key={i} className="grid grid-cols-3 gap-4 rounded-md bg-slate-50 border border-slate-100 px-4 py-3">
                          {[['Name', m.name], ['Relationship', m.relationship], ['Phone', m.phone]].map(([label, val]) => (
                            <div key={label}>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                              <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-slate-400">No family members added</p>,
                },
                {
                  id: 'secondary', label: 'Contact Section',
                  iconBg: 'bg-purple-50', iconColor: 'text-purple-700', icon: <HiDevicePhoneMobile className="h-4 w-4" />,
                  content: (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        ['Name', selectedEmployee.secondaryContact?.name],
                        ['Relationship', selectedEmployee.secondaryContact?.relationship],
                        ['Phone 1', selectedEmployee.secondaryContact?.phoneNo1],
                        ['Phone 2', selectedEmployee.secondaryContact?.phoneNo2],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'education', label: 'Educational Details',
                  iconBg: 'bg-green-50', iconColor: 'text-green-700', icon: <HiAcademicCap className="h-4 w-4" />,
                  content: selectedEmployee.education?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.education.map((edu, i) => (
                        <div key={i} className="rounded-md bg-slate-50 border border-slate-100 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">{edu.course || '—'}</span>
                            <span className="text-xs text-slate-400">{edu.startDate} – {edu.endDate || 'Present'}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{edu.institutionName || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-slate-400">No education records</p>,
                },
                {
                  id: 'experience', label: 'Experience',
                  iconBg: 'bg-slate-100', iconColor: 'text-slate-600', icon: <HiPresentationChartLine className="h-4 w-4" />,
                  content: selectedEmployee.workExperience?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.workExperience.map((exp, i) => (
                        <div key={i} className="rounded-md bg-slate-50 border border-slate-100 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">{exp.designation || '—'}</span>
                            <span className="text-xs text-slate-400">{exp.startDate} – {exp.endDate || (selectedEmployee.isCurrentlyWorking ? 'Present' : '—')}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{exp.companyName || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-slate-400">No work experience records</p>,
                },
              ].map(({ id, label, iconBg, iconColor, icon, content }) => {
                const isOpen = viewActiveTab === id
                return (
                  <div key={id} className="border-b border-slate-100 last:border-0">
                    <button
                      type="button"
                      onClick={() => setViewActiveTab(isOpen ? '' : id)}
                      className="flex w-full items-center justify-between px-0 py-3.5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg} ${iconColor}`}>{icon}</div>
                        <span className="text-sm font-medium text-slate-800">{label}</span>
                      </div>
                      <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && <div className="pb-5 pt-1">{content}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}