// v2 ” single-tab unified form with system role
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiUserPlus,
  HiClipboardDocumentCheck,
  HiClock,
  HiMagnifyingGlass,
  HiCheckBadge,
  HiXCircle,
  HiCpuChip,
  HiPlus,
  HiEye,
  HiPencil,
  HiUser,
  HiBriefcase,
  HiBanknotes,
  HiEnvelope,
  HiShieldCheck,
  HiDocumentDuplicate,
  HiDocumentText,
  HiDocument,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  listOnboardingEmployees,
  listEmployeesDropdown,
  createEmployee,
  getNextEmployeeId,
  getFilterOptions,
  getDesignationsForDepartment,
  sendOnboardingOfferLetter,
  updateEmployee,
  getEmployee,
} from '../../../services/employeeService.js'
import { useCurrency } from '../../../context/CurrencyContext.jsx'
import * as onboardingApi from '../../../services/onboardingApi.js'
import { useAsyncAction } from '../../../hooks/useAsyncAction.js'
import {
  ONBOARDING_TOTAL_STEPS,
  WORKFLOW_STATUS_LABELS,
  workflowStepNumber,
} from '../../../constants/onboardingWorkflow.js'
import { adminSettingsService } from '../../../services/adminSettingsService.js'
import { listDepartments } from '../../../services/departmentService.js'
import { listDesignations } from '../../../services/designationService.js'

// Accepts an optional leading +, digits, spaces, dashes, parentheses; requires
// 7–15 actual digits (E.164-ish, lenient about formatting).
function isValidPhone(value) {
  const v = String(value || '').trim()
  if (!/^\+?[0-9\s\-()]+$/.test(v)) return false
  const digits = v.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

function formatJoinDate(value) {
  if (!value || value === '-') return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function mapRow(e) {
  const workflow =
    e.onboarding_workflow_status || e.onboardingWorkflowStatus || 'draft'
  const progressStep = workflowStepNumber(workflow)
  const status =
    WORKFLOW_STATUS_LABELS[workflow] ||
    WORKFLOW_STATUS_LABELS.draft
  return {
    id: e.id,
    empId: e.emp_id || e.empId || '-',
    name: e.full_name || e.fullName || '-',
    email: e.work_email || e.workEmail || e.personal_email || e.personalEmail || '',
    dept: e.department || '-',
    joinDate: formatJoinDate(e.join_date || e.joinDate),
    status,
    workflowStatus: workflow,
    progress: `${progressStep}/${ONBOARDING_TOTAL_STEPS}`,
    manager: e.manager_name || e.managerName || '-',
  }
}

const INITIAL_FORM = {
  // Candidate
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  personalEmail: '',
  phoneNumber: '',
  gender: '',
  nationality: '',
  maritalStatus: '',
  currentAddress: '',
  // Job & Role
  jobTitle: '',
  department: '',
  departmentId: '',
  employmentType: 'Full-time',
  workMode: 'On-site',
  workLocation: '',
  reportingManagerEmpId: '',
  rbacRoleId: '',
  // Offer & Status
  probationPeriod: '6 Months',
  dateOfOffer: new Date().toISOString().split('T')[0],
  offerExpiryDate: '',
  expectedJoiningDate: '',
  // Compensation
  annualCtc: '',
  currency: 'AED',
  payFrequency: 'Monthly',
  bonusVariablePay: '',
  probationSalary: '',
  relocationAllowance: '',
  noticePeriod: '30 Days',
  // Documents & Access
  requiredDocuments: ['Passport', 'Emirates ID'],
  welcomeLetterTemplateId: '',
}

export default function Onboarding() {
  const [q, setQ] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedHire, setSelectedHire] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [directoryOptions, setDirectoryOptions] = useState([])
  const [initLoading, setInitLoading] = useState(false)
  const [onboardingMode, setOnboardingMode] = useState('create')
  const [wizardForm, setWizardForm] = useState(INITIAL_FORM)
  const [tenantRoles, setTenantRoles] = useState([])
  const [managerOptions, setManagerOptions] = useState([])
  const { settings: currencySettings } = useCurrency()
  const [metaOptions, setMetaOptions] = useState({
    departments: [],
    jobTitles: [],
    nationalities: [],
    workLocations: [],
    workModes: [],
  })
  const [departmentsCatalog, setDepartmentsCatalog] = useState([])
  const [designationsCatalog, setDesignationsCatalog] = useState([])
  const [deptDesignations, setDeptDesignations] = useState([])
  const [loadingDeptDesignations, setLoadingDeptDesignations] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedEmployeeIdForDocs, setSelectedEmployeeIdForDocs] = useState('')
  const [checklistItems, setChecklistItems] = useState([])
  const [onboardingReviewMeta, setOnboardingReviewMeta] = useState(null)
  const [signedOfferHrFile, setSignedOfferHrFile] = useState(null)
  const [rejectItemId, setRejectItemId] = useState(null)
  const [rejectComment, setRejectComment] = useState("")
  const [reviewingId, setReviewingId] = useState(null)

  const { execute: execUploadOffer, loading: uploadingSignedOffer } = useAsyncAction();
  const { execute: execApproveAll, loading: approvingAll } = useAsyncAction();
  const { execute: execRemind, loading: remindingCandidate } = useAsyncAction({
    successMessage: 'Reminder email sent to candidate'
  });
  const { execute: execReview, loading: reviewingItem } = useAsyncAction();
  const { execute: execComplete, loading: activating } = useAsyncAction();

  const fw = (patch) => setWizardForm((prev) => ({ ...prev, ...patch }))

  const populateFormWithEmp = (emp) => {
    if (!emp) {
      setWizardForm(INITIAL_FORM);
      return;
    }
    setWizardForm({
      empId: emp.emp_id || emp.empId || '',
      firstName: emp.first_name || emp.firstName || '',
      lastName: emp.last_name || emp.lastName || '',
      dateOfBirth: emp.date_of_birth ? String(emp.date_of_birth).split('T')[0] : '',
      personalEmail: emp.personal_email || emp.personalEmail || '',
      phoneNumber: emp.phone_number || emp.phoneNumber || '',
      gender: emp.gender || '',
      nationality: emp.nationality || '',
      maritalStatus: emp.marital_status || emp.maritalStatus || '',
      currentAddress: emp.home_address || emp.homeAddress || '',
      jobTitle: emp.job_title || emp.jobTitle || '',
      department: emp.department || '',
      departmentId: emp.department_id || emp.departmentId || '',
      employmentType: emp.employment_type || emp.employmentType || 'Full-time',
      workMode: emp.work_mode || emp.workMode || 'On-site',
      workLocation: emp.work_location || emp.workLocation || '',
      reportingManagerEmpId: emp.reporting_manager_emp_id || emp.reportingManagerEmpId || '',
      rbacRoleId: emp.rbac_role_id || emp.rbacRoleId || '',
      probationPeriod: emp.probation_period || '6 Months',
      dateOfOffer: emp.date_of_offer ? String(emp.date_of_offer).split('T')[0] : new Date().toISOString().split('T')[0],
      offerExpiryDate: emp.offer_expiry_date ? String(emp.offer_expiry_date).split('T')[0] : '',
      expectedJoiningDate: emp.join_date ? String(emp.join_date).split('T')[0] : '',
      annualCtc: emp.salary || '',
      currency: emp.salary_details?.currency || 'AED',
      payFrequency: emp.salary_details?.payment_frequency || 'Monthly',
      bonusVariablePay: emp.bonus_variable_pay || '',
      probationSalary: emp.probation_salary || '',
      relocationAllowance: emp.relocation_allowance || '',
      noticePeriod: emp.notice_period || '30 Days',
      requiredDocuments: ['Passport', 'Emirates ID'],
      welcomeLetterTemplateId: '',
    })
  }

  /* â”€â”€â”€ Data loaders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const loadOnboarding = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listOnboardingEmployees({ search: q, limit: 500 })
      const list = res.records || res.employees || []
      setRows(list.map(mapRow))
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load onboarding list')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => {
    const t = setTimeout(() => loadOnboarding(), q ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadOnboarding, q])

  const loadMetaOptions = useCallback(async () => {
    const [filtersResult, deptsResult, desigsResult] = await Promise.allSettled([
      getFilterOptions(),
      listDepartments({ limit: 100, page: 1, status: 'active' }),
      listDesignations({ limit: 100, page: 1, status: 'active' }),
    ])

    const filters = filtersResult.status === 'fulfilled' ? filtersResult.value : null
    if (filters) {
      setMetaOptions({
        departments: filters.departments || [],
        jobTitles: filters.jobTitles || [],
        nationalities: filters.nationalities || [],
        workLocations: filters.workLocations || [],
        workModes: filters.workModes || [],
      })
    }

    const fromFiltersDepts =
      filters?.departmentRecords?.length
        ? filters.departmentRecords
        : (filters?.departments || []).map((name) => ({ id: name, name }))

    const fromApiDepts =
      deptsResult.status === 'fulfilled'
        ? (deptsResult.value?.departments ?? deptsResult.value?.records ?? [])
        : []

    const deptCatalog =
      fromApiDepts.length > 0 ? fromApiDepts : fromFiltersDepts

    const fromFiltersDesigs = filters?.designations ?? []
    const fromApiDesigs =
      desigsResult.status === 'fulfilled'
        ? (desigsResult.value?.designations ?? desigsResult.value?.records ?? [])
        : []

    setDepartmentsCatalog(deptCatalog)
    setDesignationsCatalog(
      fromApiDesigs.length > 0 ? fromApiDesigs : fromFiltersDesigs,
    )

    if (!deptCatalog.length) {
      console.warn(
        'No departments loaded. Add departments in Administration or ensure employee.view permission.',
      )
    }
  }, [])

  const departmentRows = useMemo(() => {
    if (departmentsCatalog.length) return departmentsCatalog
    return (metaOptions.departments || []).map((name) => ({ id: name, name }))
  }, [departmentsCatalog, metaOptions.departments])

  // Salary currency choices: platform default first, then common currencies,
  // plus whatever the record already has — deduped.
  const currencyChoices = useMemo(() => {
    const base = ['AED', 'INR', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR']
    const ordered = [currencySettings?.defaultCurrency, ...base, wizardForm.currency].filter(Boolean)
    return [...new Set(ordered.map((c) => String(c).toUpperCase()))]
  }, [currencySettings, wizardForm.currency])

  const designationRowsForDept = useMemo(() => {
    if (deptDesignations.length) return deptDesignations
    const dept = String(wizardForm.department || '').trim()
    if (!dept) return []
    return designationsCatalog.filter((row) => {
      if (row.is_active === false) return false
      const st = String(row.status ?? '').toLowerCase()
      if (st === 'inactive') return false
      const rowDept = String(row.department_name ?? row.departmentName ?? '').trim()
      return rowDept.toLowerCase() === dept.toLowerCase()
    })
  }, [deptDesignations, designationsCatalog, wizardForm.department])

  const handleDepartmentChange = (e) => {
    const value = e.target.value
    const row = departmentRows.find((d) => String(d.id) === value)
    const deptLabel = row?.name ?? row?.department_name ?? value
    const numericId =
      row?.id != null &&
        `${row.id}`.trim() !== '' &&
        Number.isInteger(Number(row.id))
        ? String(row.id)
        : ''
    fw({
      departmentId: numericId,
      department: deptLabel,
      jobTitle: '',
    })
  }

  useEffect(() => {
    const dept = String(wizardForm.department || '').trim()
    if (!dept) {
      setDeptDesignations([])
      return undefined
    }
    let cancelled = false
    setLoadingDeptDesignations(true)
    getDesignationsForDepartment(dept)
      .then((data) => {
        if (!cancelled) {
          setDeptDesignations(data?.designations ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) setDeptDesignations([])
      })
      .finally(() => {
        if (!cancelled) setLoadingDeptDesignations(false)
      })
    return () => {
      cancelled = true
    }
  }, [wizardForm.department])

  const loadDirectoryForPick = useCallback(async () => {
    try {
      const res = await listOnboardingEmployees({ limit: 500 })
      const list = res.records || res.employees || []
      setDirectoryOptions(list)
    } catch {
      setDirectoryOptions([])
    }
  }, [])

  // Active employees who can be selected as a reporting manager (excludes
  // onboarding-stage candidates — that's handled server-side by /employees/dropdown).
  const loadManagerOptions = useCallback(async () => {
    try {
      const list = await listEmployeesDropdown({ limit: 500 })
      setManagerOptions(Array.isArray(list) ? list : (list?.records || list?.employees || []))
    } catch {
      setManagerOptions([])
    }
  }, [])

  const loadOnboardingChecklist = useCallback(async (id) => {
    if (!id) {
      setChecklistItems([])
      setOnboardingReviewMeta(null)
      return
    }
    try {
      const data = await onboardingApi.getOnboardingChecklist(Number(id))
      setChecklistItems(data?.checklist || [])
      setOnboardingReviewMeta(data)
    } catch {
      setChecklistItems([])
      setOnboardingReviewMeta(null)
    }
  }, [])

  const handleApproveAllUploaded = async () => {
    if (!selectedEmployeeIdForDocs) return
    const pending = checklistItems.filter(
      (item) =>
        item.is_mandatory &&
        item.upload_status === 'Uploaded' &&
        item.hr_review_status !== 'Approved',
    )
    if (!pending.length) {
      toast.error('No uploaded documents waiting for approval.')
      return
    }
    await execApproveAll(async () => {
      for (const item of pending) {
        await onboardingApi.approveChecklistItem(Number(selectedEmployeeIdForDocs), item.id, {
          hrReviewStatus: 'Approved',
        })
      }
      toast.success(`Approved ${pending.length} document(s).`)
      await loadOnboardingChecklist(selectedEmployeeIdForDocs)
    });
  }

  const handleRemindCandidate = async () => {
    if (!selectedEmployeeIdForDocs) return
    await execRemind(() => onboardingApi.sendReminder(Number(selectedEmployeeIdForDocs)));
  }

  const openContinueOnboarding = useCallback(
    async (row, initialTab = 'status') => {
      if (!row?.id) return
      const idStr = String(row.id)
      setSelectedEmployeeId(idStr)
      setSelectedEmployeeIdForDocs(idStr)
      setOnboardingMode(initialTab)
      setModalOpen(true)
      await loadOnboardingChecklist(row.id)
      try {
        const emp = await getEmployee(row.id)
        populateFormWithEmp(emp)
      } catch (err) {
        console.warn('Could not load employee details for prepopulation')
      }
    },
    [loadOnboardingChecklist],
  )

  const handleHrUploadSignedOffer = async () => {
    if (!selectedEmployeeId || !signedOfferHrFile) return
    const { success } = await execUploadOffer(async () => {
      const res = await onboardingApi.uploadSignedOfferByHr(Number(selectedEmployeeId), signedOfferHrFile)
      toast.success(res.message || 'Signed offer uploaded (Step 2).')
      setSignedOfferHrFile(null)
      await loadOnboardingChecklist(selectedEmployeeId)
      await loadOnboarding()
      return res;
    });
  }

  const handleReviewChecklistItem = async (itemId, hrReviewStatus, hrReviewComment = '') => {
    if (!selectedEmployeeId || reviewingItem) return
    setReviewingId(itemId)
    try {
      await execReview(async () => {
        await onboardingApi.approveChecklistItem(Number(selectedEmployeeId), itemId, {
          hrReviewStatus,
          hrReviewComment,
        })
        toast.success('Document review saved')
        await loadOnboardingChecklist(selectedEmployeeId)
      });
    } finally {
      setReviewingId(null)
    }
  }

  const loadTenantRoles = useCallback(async () => {
    try {
      const res = await adminSettingsService.getAllRoles()
      const list = res?.data?.data
      if (Array.isArray(list)) setTenantRoles(list)
    } catch (err) {
      console.warn('Failed to fetch tenant roles', err)
    }
  }, [])

  useEffect(() => {
    loadMetaOptions()
  }, [loadMetaOptions])

  useEffect(() => {
    if (modalOpen) {
      loadDirectoryForPick()
      loadManagerOptions()
      loadMetaOptions()
      loadTenantRoles()
    }
  }, [modalOpen, loadDirectoryForPick, loadManagerOptions, loadMetaOptions, loadTenantRoles])

  // Default the salary currency to the platform's configured currency when
  // starting a fresh candidate (create mode).
  useEffect(() => {
    if (modalOpen && onboardingMode === 'create' && currencySettings?.defaultCurrency) {
      setWizardForm((prev) =>
        prev.currency && prev.currency !== 'AED' ? prev : { ...prev, currency: currencySettings.defaultCurrency },
      )
    }
  }, [modalOpen, onboardingMode, currencySettings])

  /* â”€â”€â”€ Stats & filtering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const stats = useMemo(() => {
    const offerSent = rows.filter((r) => r.workflowStatus === 'offer_sent').length
    const documentsPending = rows.filter((r) => r.workflowStatus === 'documents_pending').length
    const completed = rows.filter((r) => r.workflowStatus === 'onboarding_complete').length
    const rejected = rows.filter((r) => r.workflowStatus === 'rejected').length
    return {
      newHires: rows.length,
      inProgress: documentsPending + offerSent,
      pending: offerSent,
      documentsPending,
      completed,
      rejected,
    }
  }, [rows])

  const filtered = useMemo(() => {
    if (activeStatus === 'All') return rows
    if (activeStatus === 'Offer Sent') {
      return rows.filter((h) => h.workflowStatus === 'offer_sent')
    }
    if (activeStatus === 'Documents Pending') {
      return rows.filter((h) => h.workflowStatus === 'documents_pending')
    }
    if (activeStatus === 'Complete') {
      return rows.filter((h) => h.workflowStatus === 'onboarding_complete')
    }
    return rows.filter((h) => h.status === activeStatus)
  }, [rows, activeStatus])

  /* â”€â”€â”€ Activation (view modal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleCompleteActivation = async () => {
    if (!selectedHire?.id) return
    const { success } = await execComplete(async () => {
      const result = await onboardingApi.completeOnboarding(selectedHire.id)
      toast.success(result.message || 'Onboarding complete. Welcome email sent.')
      setViewModalOpen(false)
      setSelectedHire(null)
      await loadOnboarding()
      return result;
    });
  }

  /* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  function calculateProbationEndDate(joinDateStr, probationStr) {
    if (!joinDateStr || !probationStr || probationStr === 'None') return null
    const months = parseInt(probationStr)
    if (isNaN(months)) return null
    const d = new Date(joinDateStr)
    d.setMonth(d.getMonth() + months)
    return d.toISOString().split('T')[0]
  }

  /* â”€â”€â”€ Unified form validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const validateForm = () => {
    const f = wizardForm
    if (!f.firstName.trim()) { toast.error('First name is required.'); return false }
    if (!f.lastName.trim()) { toast.error('Last name is required.'); return false }
    if (!f.dateOfBirth) { toast.error('Date of Birth is required.'); return false }
    if (!f.personalEmail.trim()) { toast.error('Personal Email is required.'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.personalEmail.trim())) { toast.error('Enter a valid personal email.'); return false }
    if (!f.phoneNumber.trim()) { toast.error('Phone Number is required.'); return false }
    if (!isValidPhone(f.phoneNumber)) { toast.error('Enter a valid phone number (7–15 digits, may start with +).'); return false }
    if (!f.nationality) { toast.error('Nationality is required.'); return false }
    if (!f.departmentId && !f.department) { toast.error('Department is required.'); return false }
    if (!f.jobTitle.trim()) { toast.error('Designation is required.'); return false }
    if (!f.expectedJoiningDate) { toast.error('Expected Joining Date is required.'); return false }
    if (!f.rbacRoleId) { toast.error('System Role is required.'); return false }
    if (!f.annualCtc) { toast.error('Annual CTC is required.'); return false }
    if (isNaN(Number(f.annualCtc)) || Number(f.annualCtc) <= 0) { toast.error('Annual CTC must be a positive number.'); return false }
    return true
  }

  /* â”€â”€â”€ Create & start onboarding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleCreateAndStartOnboarding = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!validateForm()) return

    setInitLoading(true)
    try {
      const nextId = await getNextEmployeeId([])
      const firstName = wizardForm.firstName.trim()
      const lastName = wizardForm.lastName.trim()
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      const probationEndDate = calculateProbationEndDate(wizardForm.expectedJoiningDate, wizardForm.probationPeriod)
      const employmentType =
        wizardForm.employmentType === 'Internship' ? 'Intern' : wizardForm.employmentType

      const payload = {
        empId: wizardForm.empId || String(nextId),
        fullName,
        firstName,
        lastName,
        personalEmail: wizardForm.personalEmail.trim(),
        phoneNumber: wizardForm.phoneNumber.trim(),
        gender: wizardForm.gender || undefined,
        nationality: wizardForm.nationality || null,
        maritalStatus: wizardForm.maritalStatus || null,
        homeAddress: wizardForm.currentAddress || null,
        employmentStatus: 'Onboarding',
        joinDate: wizardForm.expectedJoiningDate,
        dateOfBirth: wizardForm.dateOfBirth || undefined,
        probationEndDate: probationEndDate || undefined,
        jobTitle: wizardForm.jobTitle.trim(),
        department: wizardForm.department,
        departmentId: wizardForm.departmentId
          ? Number(wizardForm.departmentId)
          : undefined,
        employmentType,
        workMode: wizardForm.workMode || null,
        workLocation: wizardForm.workLocation || null,
        reportingManagerEmpId: wizardForm.reportingManagerEmpId || undefined,
        salary: wizardForm.annualCtc ? Number(wizardForm.annualCtc) : undefined,
        rbacRoleId: wizardForm.rbacRoleId ? Number(wizardForm.rbacRoleId) : null,
        portalEnabled: false,
        salaryDetails: {
          currency: wizardForm.currency,
          basicSalary: wizardForm.annualCtc ? Number(wizardForm.annualCtc) : null,
          paymentFrequency: wizardForm.payFrequency,
          effectiveFrom: wizardForm.expectedJoiningDate,
        },
      }

      let empId = selectedEmployeeId;
      if (empId) {
        await updateEmployee(empId, payload);
      } else {
        const created = await createEmployee(payload)
        empId = created?.id
      }

      if (empId) {
        try {
          const offerMail = await sendOnboardingOfferLetter(empId, {
            dateOfOffer: wizardForm.dateOfOffer || undefined,
            offerExpiryDate: wizardForm.offerExpiryDate || undefined,
            currency: wizardForm.currency,
            annualCtc: wizardForm.annualCtc ? Number(wizardForm.annualCtc) : undefined,
          })
          toast.success(
            offerMail.message ||
            'Step 1 complete: offer PDF generated and emailed with Accept / Reject actions.',
            { duration: 6000 },
          )
        } catch (offerErr) {
          console.warn('Offer letter email:', offerErr)
          toast.error(
            offerErr.response?.data?.message ||
            'Employee saved, but offer letter could not be sent.',
          )
        }
      }

      toast.success('Candidate added. Awaiting offer acceptance (Step 1).')
      setModalOpen(false)
      setOnboardingMode('create')
      setWizardForm(INITIAL_FORM)
      await loadOnboarding()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || err.message || 'Could not create employee')
    } finally {
      setInitLoading(false)
    }
  }

  /* â”€â”€â”€ Table columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] text-sm font-bold shadow-sm">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.name}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              ID: {row.empId}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'dept', label: 'Department' },
    { key: 'joinDate', label: 'Joining Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge label={v} color={v === 'Completed' ? 'green' : v === 'In Progress' ? 'blue' : 'orange'} variant="outline" />
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (v) => {
        const [done, total] = v.split('/').map(Number)
        const pct = total ? (done / total) * 100 : 0
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#0F766E]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-bold text-slate-500">{v}</span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setSelectedHire(row); setViewModalOpen(true) }}
            className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-slate-300 transition-all shadow-sm"
            title="View"
          >
            <HiEye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openContinueOnboarding(row, 'status')}
            className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-slate-300 transition-all shadow-sm"
            title="Continue onboarding — Step 2"
          >
            <HiPencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  /* ─── Shared input / select class helpers ───────────────────────── */
  const inputCls = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-[#0F766E]/20'
  const selectCls = `${inputCls} cursor-pointer`
  const labelCls = 'mb-1 block text-sm font-medium text-slate-800'

  /* ─── Section header component ──────────────────────────────────── */
  const SectionHeader = ({ icon: Icon, title, subtitle, color = 'text-[#0F766E]' }) => (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#0F766E] shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )

  /* ─── JSX ────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Onboarding Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Human Capital</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600 uppercase font-black tracking-widest text-[10px]">Lifecycle Governance</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setOnboardingMode('create')
              setSelectedEmployeeId('')
              setSelectedEmployeeIdForDocs('')
              setModalOpen(true)
            }}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
          >
            <HiPlus className="h-4 w-4" /> Add to Onboarding
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL CANDIDATES', count: stats.newHires, icon: HiUserPlus, bgColor: 'bg-slate-900', status: 'All' },
          { label: 'OFFER SENT', count: stats.pending, icon: HiEnvelope, bgColor: 'bg-[#F59E0B]', status: 'Offer Sent' },
          { label: 'DOCUMENTS PENDING', count: stats.documentsPending, icon: HiClock, bgColor: 'bg-[#3B82F6]', status: 'Documents Pending' },
          { label: 'COMPLETE', count: stats.completed, icon: HiCheckBadge, bgColor: 'bg-[#10B981]', status: 'Complete' },
        ].map((card, idx) => {
          const isActive = activeStatus === card.status
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStatus(card.status)}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActive ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-black uppercase tracking-widest truncate leading-none ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
        <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
          <h2 className="text-sm font-semibold uppercase tracking-wider truncate">Onboarding Registry</h2>
          <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">
            {loading ? 'Loading' : `${filtered.length} records`}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID, email or manager..."
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
            />
          </div>
          {(q || activeStatus !== 'All') && (
            <button
              type="button"
              onClick={() => { setQ(''); setActiveStatus('All') }}
              className="h-10 px-4 rounded-none border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Loading onboarding employees</p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No employees in onboarding.</p>
            <p className="mt-2 text-xs text-slate-400">Add someone from the directory, or create an employee with status <strong>Onboarding</strong> in Employee Directory.</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
        )}
      </div>

      {/* ─── View / Activate Modal ────────────────────────────────────── */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Onboarding Details</h2>
            <p className="text-xs font-medium text-slate-500">View candidate onboarding progress.</p>
          </div>
        }
        size="lg"
        showClose
      >
        <div className="animate-in fade-in duration-500 space-y-10">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 -mx-6 px-8 py-6 mb-8">
            <div className="flex flex-wrap items-center gap-12">
              {[
                { label: 'Employee', value: selectedHire?.name },
                { label: 'Employee ID', value: selectedHire?.empId },
                { label: 'Department', value: selectedHire?.dept },
                { label: 'Work email', value: selectedHire?.email || '-' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {(() => {
            // Real progress derived from the candidate's actual workflow state.
            const WF_RANK = { draft: 0, offer_sent: 1, rejected: 1, accepted_pending_upload: 2, documents_pending: 3, onboarding_complete: 4 }
            const rank = WF_RANK[selectedHire?.workflowStatus] ?? 0
            const rejected = selectedHire?.workflowStatus === 'rejected'
            const docMeta = onboardingReviewMeta?.progress
            const hrSteps = [
              { label: 'Offer letter issued', done: rank >= 1 },
              { label: 'Offer accepted & signed', done: rank >= 2, note: rejected ? 'Rejected' : null },
              {
                label: 'Documents submitted',
                done: rank >= 3,
                note: docMeta ? `${docMeta.approvedCount ?? 0}/${docMeta.mandatoryCount ?? 0} approved` : null,
              },
              { label: 'Onboarding completed', done: rank >= 4 },
            ]
            const itSteps = [
              { label: 'Work email configured', done: !!selectedHire?.email },
              { label: 'Account activated', done: rank >= 4 },
            ]
            const StatusRow = ({ label, done, note }) => (
              <div className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {done ? 'Done' : note || 'Pending'}
                </span>
              </div>
            )
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-2">
                <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                    <HiClipboardDocumentCheck className="h-5 w-5 text-[#0F766E]" /> HR progress
                  </h4>
                  <div className="space-y-4">
                    {hrSteps.map((s) => <StatusRow key={s.label} {...s} />)}
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                    <HiCpuChip className="h-5 w-5 text-[#0F766E]" /> IT / Access
                  </h4>
                  <div className="space-y-4">
                    {itSteps.map((s) => <StatusRow key={s.label} {...s} />)}
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="rounded-none border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
            <strong>Complete onboarding</strong> requires offer acceptance, signed offer, and all mandatory documents approved.
            Then the employee becomes Active in the directory and receives a welcome email with portal login.
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100 px-2">
            <button type="button" onClick={() => setViewModalOpen(false)} className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              disabled={activating || selectedHire?.workflowStatus === 'rejected'}
              onClick={handleCompleteActivation}
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {activating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Completing…
                </>
              ) : 'Complete onboarding (Step 3)'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add to Onboarding Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setOnboardingMode('create')
          setSelectedEmployeeId('')
          setSelectedEmployeeIdForDocs('')
        }}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedEmployeeId && onboardingMode !== 'create'
                ? 'Continue Onboarding'
                : 'Add New Candidate'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure candidate details and onboarding steps below.
            </p>
          </div>
        }
        size="lg"
        showClose
      >
        {/* Mode switcher tabs */}
        <div className="sticky top-0 z-10 shrink-0 flex border-b border-slate-200 bg-white -mx-6 px-6 mb-6">
          {[
            { key: 'create', label: 'Step 1 — Offer' },
            { key: 'status', label: 'Step 2 — Signed offer' },
            { key: 'documents', label: 'Step 3 — Documents' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setOnboardingMode(key)}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${onboardingMode === key
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* â”€â”€ TAB 1: ONBOARDING (CREATE NEW HIRE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {onboardingMode === 'create' ? (
          <form className="p-2" onSubmit={handleCreateAndStartOnboarding}>
            <div className="space-y-6 pb-2">
              {/* SECTION 1 ” Candidate Personal Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={HiUser} title="Candidate Information" subtitle="Personal credentials and contact details" />
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>First Name <span className="text-rose-500">*</span></label>
                      <input type="text" value={wizardForm.firstName} onChange={(e) => fw({ firstName: e.target.value })} placeholder="e.g. John" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name <span className="text-rose-500">*</span></label>
                      <input type="text" value={wizardForm.lastName} onChange={(e) => fw({ lastName: e.target.value })} placeholder="e.g. Joshi" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Date of Birth <span className="text-rose-500">*</span></label>
                      <input type="date" value={wizardForm.dateOfBirth} onChange={(e) => fw({ dateOfBirth: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Personal Email <span className="text-rose-500">*</span></label>
                      <input type="email" value={wizardForm.personalEmail} onChange={(e) => fw({ personalEmail: e.target.value })} placeholder="John@gmail.com" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Phone Number <span className="text-rose-500">*</span></label>
                      <input
                        type="tel"
                        inputMode="tel"
                        maxLength={20}
                        value={wizardForm.phoneNumber}
                        onChange={(e) => fw({ phoneNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className={inputCls}
                      />
                      {wizardForm.phoneNumber && !isValidPhone(wizardForm.phoneNumber) && (
                        <p className="mt-1 text-[10px] text-rose-600">Enter 7–15 digits (an optional leading + is allowed).</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select value={wizardForm.gender} onChange={(e) => fw({ gender: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Nationality <span className="text-rose-500">*</span></label>
                      <select value={wizardForm.nationality} onChange={(e) => fw({ nationality: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        {(metaOptions.nationalities.length > 0
                          ? metaOptions.nationalities
                          : ['Indian', 'Emirati', 'British', 'American', 'Other']
                        ).map((nat) => (
                          <option key={nat} value={nat}>{nat}</option>
                        ))}
                        {/* keep the saved value selectable even if it's not in the seeded list */}
                        {wizardForm.nationality &&
                          !(metaOptions.nationalities.length > 0
                            ? metaOptions.nationalities
                            : ['Indian', 'Emirati', 'British', 'American', 'Other']
                          ).includes(wizardForm.nationality) && (
                            <option value={wizardForm.nationality}>{wizardForm.nationality}</option>
                          )}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Marital Status</label>
                      <select value={wizardForm.maritalStatus} onChange={(e) => fw({ maritalStatus: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Current Address</label>
                    <textarea value={wizardForm.currentAddress} onChange={(e) => fw({ currentAddress: e.target.value })} placeholder="Street, City, State, PIN code" rows={2} className={`${inputCls} resize-none h-auto py-2`} />
                  </div>
                </div>
              </div>

              {/* SECTION 2 ” Job Setup, System Role & Offer Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={HiBriefcase} title="Job & Organizational Setup" subtitle="Designation, department, role assignment, and offer details" />
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Department <span className="text-rose-500">*</span></label>
                      <select
                        value={wizardForm.departmentId || wizardForm.department}
                        onChange={handleDepartmentChange}
                        className={selectCls}
                      >
                        <option value="">Select Department</option>
                        {departmentRows.map((d) => (
                          <option key={d.id ?? d.name} value={String(d.id ?? d.name)}>
                            {d.name ?? d.department_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Designation <span className="text-rose-500">*</span></label>
                      <select
                        value={wizardForm.jobTitle}
                        onChange={(e) => fw({ jobTitle: e.target.value })}
                        className={selectCls}
                        disabled={!wizardForm.department}
                      >
                        <option value="">
                          {!wizardForm.department
                            ? 'Select department first'
                            : loadingDeptDesignations
                              ? 'Loading designations'
                              : designationRowsForDept.length
                                ? 'Select Designation'
                                : 'No designations for this department'}
                        </option>
                        {designationRowsForDept.map((row) => (
                          <option key={row.id ?? row.name} value={row.name}>
                            {row.name}
                          </option>
                        ))}
                      </select>
                      {wizardForm.department &&
                        !loadingDeptDesignations &&
                        designationRowsForDept.length === 0 && (
                          <p className="mt-1 text-[10px] text-amber-700">
                            Add designations for this department in Administration â†’ Designations.
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>
                        <span className="inline-flex items-center gap-1.5">
                          <HiShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
                          System Role <span className="text-rose-500">*</span>
                        </span>
                      </label>
                      <select value={wizardForm.rbacRoleId} onChange={(e) => fw({ rbacRoleId: e.target.value })} className={selectCls}>
                        <option value="">Select System Role</option>
                        {tenantRoles.length > 0
                          ? tenantRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)
                          : <option disabled>Loading roles</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Employment Type</label>
                      <select value={wizardForm.employmentType} onChange={(e) => fw({ employmentType: e.target.value })} className={selectCls}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Work Mode</label>
                      <select value={wizardForm.workMode} onChange={(e) => fw({ workMode: e.target.value })} className={selectCls}>
                        <option value="">Select Work Mode</option>
                        {(metaOptions.workModes.length > 0 ? metaOptions.workModes : ['On-site', 'Remote', 'Hybrid']).map((wm) => (
                          <option key={wm} value={wm}>{wm}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Work Location</label>
                      <select value={wizardForm.workLocation} onChange={(e) => fw({ workLocation: e.target.value })} className={selectCls}>
                        <option value="">Select Location</option>
                        {(metaOptions.workLocations.length > 0 ? metaOptions.workLocations : ['Headquarters', 'Dubai Office', 'Abu Dhabi Office', 'Remote']).map((wl) => (
                          <option key={wl} value={wl}>{wl}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Reporting Manager</label>
                      <select value={wizardForm.reportingManagerEmpId} onChange={(e) => fw({ reportingManagerEmpId: e.target.value })} className={selectCls}>
                        <option value="">
                          {managerOptions.length > 0 ? 'Select Manager (Optional)' : 'No employees yet — optional'}
                        </option>
                        {managerOptions.map((e) => (
                          <option key={e.id} value={e.emp_id || e.empId}>
                            {(e.full_name || e.fullName) ?? 'Employee'} ({e.emp_id || e.empId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Expected Joining Date <span className="text-rose-500">*</span></label>
                      <input type="date" value={wizardForm.expectedJoiningDate} onChange={(e) => fw({ expectedJoiningDate: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Date of Offer</label>
                      <input type="date" value={wizardForm.dateOfOffer} onChange={(e) => fw({ dateOfOffer: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Offer Expiry Date</label>
                      <input type="date" value={wizardForm.offerExpiryDate} onChange={(e) => fw({ offerExpiryDate: e.target.value })} className={inputCls} />
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 3 ” Compensation & Terms */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={HiBanknotes} title="Compensation & Terms" subtitle="Salary structure, pay frequency, and employment conditions" />
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Annual CTC <span className="text-rose-500">*</span></label>
                      <input type="number" value={wizardForm.annualCtc} onChange={(e) => fw({ annualCtc: e.target.value })} placeholder="e.g. 120000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Currency</label>
                      <select value={wizardForm.currency} onChange={(e) => fw({ currency: e.target.value })} className={selectCls}>
                        {currencyChoices.map((c) => (
                          <option key={c} value={c}>
                            {c}{c === currencySettings?.defaultCurrency ? ' — platform default' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Payment Frequency</label>
                      <select value={wizardForm.payFrequency} onChange={(e) => fw({ payFrequency: e.target.value })} className={selectCls}>
                        <option value="Monthly">Monthly</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Hourly">Hourly</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Bonus & Variable Pay (Annual)</label>
                      <input type="number" value={wizardForm.bonusVariablePay} onChange={(e) => fw({ bonusVariablePay: e.target.value })} placeholder="e.g. 15000 (Optional)" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Probation Salary (Monthly)</label>
                      <input type="number" value={wizardForm.probationSalary} onChange={(e) => fw({ probationSalary: e.target.value })} placeholder="e.g. 8000 (Optional)" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Relocation Allowance</label>
                      <input type="number" value={wizardForm.relocationAllowance} onChange={(e) => fw({ relocationAllowance: e.target.value })} placeholder="e.g. 5000 (Optional)" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Notice Period</label>
                      <select value={wizardForm.noticePeriod} onChange={(e) => fw({ noticePeriod: e.target.value })} className={selectCls}>
                        <option value="Immediate">Immediate</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Probation Period</label>
                      <select value={wizardForm.probationPeriod} onChange={(e) => fw({ probationPeriod: e.target.value })} className={selectCls}>
                        <option value="None">None</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="sticky bottom-0 z-10 bg-white flex items-center justify-end gap-3 pt-4 pb-4 mt-6 border-t border-slate-100">
              <button type="button" onClick={() => { setModalOpen(false); setOnboardingMode('create'); setWizardForm(INITIAL_FORM) }} className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={initLoading} className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2">
                {initLoading ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving</>) : 'Submit & send offer'}
              </button>
            </div>
          </form>
        ) : onboardingMode === 'status' ? (
          /* TAB 2: ONBOARDING STATUS */
          <div className="p-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <SectionHeader icon={HiUser} title="Select Employee" subtitle="Choose a candidate to update onboarding status (Step 2)" />
              <select
                value={selectedEmployeeId}
                onChange={async (e) => {
                  const id = e.target.value
                  setSelectedEmployeeId(id)
                  setSelectedEmployeeIdForDocs(id)
                  loadOnboardingChecklist(id)
                  if (id) {
                    const emp = await getEmployee(id).catch(() => null)
                    populateFormWithEmp(emp)
                  } else {
                    setWizardForm(INITIAL_FORM)
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white h-12 px-4 text-sm focus:border-[#0F766E] outline-none transition-all"
              >
                <option value="">Select employee</option>
                {directoryOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {(emp.full_name || emp.fullName) ?? 'Employee'} — {emp.emp_id || emp.empId}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Acceptance and rejection are handled by the candidate via the offer email (Accept / Reject).
              After acceptance, they sign digitally; you can upload a signed PDF here only if they signed offline.
            </div>

            {selectedEmployeeId && (
              <>
                {onboardingReviewMeta?.signedOfferOnFile ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <strong>Step 2 complete.</strong> The candidate digitally signed the offer.
                    The signed PDF is already saved on this employee record — you do not need to upload a file here.
                    Go to <strong>Step 3 — Documents</strong> to approve their uploads.
                    {onboardingReviewMeta?.signedOfferFileUrl && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => window.open(onboardingReviewMeta.signedOfferFileUrl, '_blank')}
                          className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-lg shadow-sm"
                        >
                          View Signed Offer
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <SectionHeader
                      icon={HiClipboardDocumentCheck}
                      title="Signed offer letter"
                      subtitle="Only if the candidate signed on paper (not via email link)"
                    />
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setSignedOfferHrFile(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                      />
                      {signedOfferHrFile && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleHrUploadSignedOffer}
                            disabled={uploadingSignedOffer}
                            className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {uploadingSignedOffer ? 'Uploading…' : 'Save signed offer'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* TAB 3: Document checklist (candidate uploads via secure link) */
          <div className="p-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <SectionHeader icon={HiUser} title="Select Employee" subtitle="Review checklist uploads (Step 3)" />
              <select
                value={selectedEmployeeIdForDocs}
                onChange={(e) => {
                  const id = e.target.value
                  setSelectedEmployeeIdForDocs(id)
                  setSelectedEmployeeId(id)
                  loadOnboardingChecklist(id)
                }}
                className="w-full rounded-lg border border-slate-200 bg-white h-12 px-4 text-sm focus:border-[#0F766E] outline-none transition-all"
              >
                <option value="">Select employee</option>
                {directoryOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {(e.full_name || e.fullName) ?? 'Employee'} — {e.emp_id || e.empId}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployeeIdForDocs && (
              <>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <SectionHeader
                    icon={HiDocumentDuplicate}
                    title="Document checklist"
                    subtitle="Candidate uploads via email link; approve each mandatory document"
                  />
                  {checklistItems.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Checklist not started. Candidate must accept and sign the offer (Steps 1–2) first.
                    </p>
                  ) : (
                    <>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 mb-4">
                        <strong>Candidate side is done</strong> when every row shows Upload: Uploaded.
                        <strong> HR: Pending</strong> means you still must click <strong>Approve</strong> on each document (or use Approve all below).
                        Then click <strong>Complete onboarding &amp; activate</strong>.
                        {onboardingReviewMeta?.progress && (
                          <p className="mt-2 text-xs">
                            Progress: {onboardingReviewMeta.progress.approvedCount}/
                            {onboardingReviewMeta.progress.mandatoryCount} mandatory documents approved
                            {' · '}
                            {onboardingReviewMeta.progress.uploadedCount} uploaded
                          </p>
                        )}
                        {onboardingReviewMeta?.signedOfferFileUrl && (
                          <div className="mt-3 pt-3 border-t border-amber-200/50">
                            <p className="text-xs mb-2 text-amber-900 font-medium">Reference Document:</p>
                            <button
                              type="button"
                              onClick={() => window.open(onboardingReviewMeta.signedOfferFileUrl, '_blank')}
                              className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700 transition-colors text-white rounded shadow-sm flex items-center gap-2"
                            >
                              <HiDocumentText className="w-3.5 h-3.5" />
                              View Signed Offer Letter
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-3 mb-3">
                        <button
                          type="button"
                          onClick={handleRemindCandidate}
                          disabled={remindingCandidate}
                          className="h-9 px-4 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors rounded-md disabled:opacity-60 flex items-center gap-2"
                        >
                          {remindingCandidate ? 'Sending...' : 'Remind Candidate'}
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveAllUploaded}
                          disabled={approvingAll || reviewingItem}
                          className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-md disabled:opacity-60 flex items-center gap-2"
                        >
                          {approvingAll && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                          {approvingAll ? 'Approving…' : 'Approve all uploaded'}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {checklistItems.map((item) => (
                          <div
                            key={item.id}
                            className="border border-slate-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{item.document_label}</p>
                              <p className="text-[10px] text-slate-500 uppercase">
                                Upload: {item.upload_status} Â· HR: {item.hr_review_status}
                              </p>
                              {item.hr_review_comment && (
                                <p className="text-xs text-rose-600 mt-1">{item.hr_review_comment}</p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {item.upload_status === 'Uploaded' && (item.file_url || item.fileUrl) ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(item.file_url || item.fileUrl, '_blank')}
                                  className="h-8 px-3 text-[10px] font-bold uppercase bg-blue-50 text-blue-700 hover:bg-blue-100 rounded shadow-sm transition-colors border border-blue-200 flex items-center gap-1.5"
                                >
                                  <HiDocument className="w-3.5 h-3.5" />
                                  View Doc
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="h-8 px-3 text-[10px] font-bold uppercase bg-slate-50 text-slate-400 rounded border border-slate-100 flex items-center gap-1.5"
                                  title="No document uploaded yet"
                                >
                                  No Doc
                                </button>
                              )}
                              {item.hr_review_status === 'Approved' ? (
                                <span className="h-8 flex items-center px-3 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                                  Approved
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled={item.upload_status !== 'Uploaded' || reviewingItem}
                                    onClick={() => handleReviewChecklistItem(item.id, 'Approved')}
                                    className="h-8 px-3 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 rounded border border-emerald-100 transition-colors flex items-center gap-1.5"
                                  >
                                    {reviewingId === item.id && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                                    {reviewingId === item.id ? 'Saving…' : 'Approve'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={item.upload_status !== 'Uploaded' || reviewingItem}
                                    onClick={() => {
                                      setRejectComment('')
                                      setRejectItemId(item.id)
                                    }}
                                    className="h-8 px-3 text-[10px] font-bold uppercase bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 rounded border border-rose-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {selectedEmployeeIdForDocs && checklistItems.length > 0 && (
              <div className="sticky bottom-0 z-10 mt-4 border-t border-slate-200 bg-white pt-4 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Approve all mandatory documents, then activate the employee.
                </p>
                <button
                  type="button"
                  disabled={activating}
                  onClick={async () => {
                    await execComplete(async () => {
                      const res = await onboardingApi.completeOnboarding(Number(selectedEmployeeIdForDocs));
                      toast.success(res.message || 'Onboarding complete')
                      setModalOpen(false)
                      await loadOnboarding()
                    });
                  }}
                  className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors shrink-0 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {activating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Completing…
                    </>
                  ) : 'Complete onboarding'}
                </button>
              </div>
            )}
          </div>
        )
        }

      </Modal >

      <Modal
        isOpen={!!rejectItemId}
        onClose={() => {
          setRejectItemId(null)
          setRejectComment('')
        }}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Reject Document</h2>
            <p className="text-xs font-medium text-slate-500">Provide a reason for document rejection.</p>
          </div>
        }
        size="md"
        showClose
      >
        <div className="p-4">
          <p className="text-sm text-slate-500 mb-4">
            Please provide a reason for rejecting this document. The candidate will see this reason and be asked to re-upload.
          </p>
          <textarea
            className="w-full h-24 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 mb-4"
            placeholder="Reason for rejection..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setRejectItemId(null)
                setRejectComment('')
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={reviewingItem}
              onClick={async () => {
                if (!rejectComment.trim()) {
                  toast.error('Comment is required for rejection')
                  return
                }
                const id = rejectItemId
                const comment = rejectComment.trim()
                await handleReviewChecklistItem(id, 'Rejected', comment)
                setRejectItemId(null)
                setRejectComment('')
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {reviewingItem && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {reviewingItem ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </Modal>

    </div >
  )
}
