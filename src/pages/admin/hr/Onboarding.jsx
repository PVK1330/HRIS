// v2 — single-tab unified form with system role
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
  HiUser,
  HiBriefcase,
  HiBanknotes,
  HiEnvelope,
  HiShieldCheck,
  HiDocumentDuplicate,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import {
  listOnboardingEmployees,
  updateEmployee,
  completeOnboardingActivation,
  createEmployee,
  getNextEmployeeId,
  getFilterOptions,
  getEmployee,
} from '../../../services/employeeService.js'
import {
  uploadEmployeeDocument,
  getDocuments,
} from '../../../services/employeeProfileService.js'
import { adminSettingsService } from '../../../services/adminSettingsService.js'

function mapRow(e) {
  const hasEmail = Boolean(String(e.work_email || e.workEmail || '').trim())
  const status = !hasEmail ? 'Pending' : 'In Progress'
  return {
    id: e.id,
    empId: e.emp_id || e.empId || '—',
    name: e.full_name || e.fullName || '—',
    email: e.work_email || e.workEmail || '',
    dept: e.department || '—',
    joinDate: e.join_date || e.joinDate || '—',
    status,
    progress: hasEmail ? '3/5' : '1/5',
    manager: e.manager_name || e.managerName || '—',
  }
}

const INITIAL_FORM = {
  // Candidate
  fullName: '',
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
  onboardingStatus: 'Accepted',
  signedDocumentFile: null,
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
  sendCredentialsEmail: true,
}

export default function Onboarding() {
  const [q, setQ] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedHire, setSelectedHire] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [directoryOptions, setDirectoryOptions] = useState([])
  const [pickEmployeeId, setPickEmployeeId] = useState('')
  const [initLoading, setInitLoading] = useState(false)
  const [onboardingMode, setOnboardingMode] = useState('create')
  const [wizardForm, setWizardForm] = useState(INITIAL_FORM)
  const [tenantRoles, setTenantRoles] = useState([])
  const [metaOptions, setMetaOptions] = useState({
    departments: [],
    jobTitles: [],
    workLocations: [],
    workModes: [],
  })
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedEmployeeIdForDocs, setSelectedEmployeeIdForDocs] = useState('')
  const [currentOnboardingStatus, setCurrentOnboardingStatus] = useState('Pending')
  const [statusUpdateValue, setStatusUpdateValue] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [offerLetterFile, setOfferLetterFile] = useState(null)
  const [uploadingOfferLetter, setUploadingOfferLetter] = useState(false)
  const [submittedDocuments, setSubmittedDocuments] = useState([])
  const [additionalDocuments, setAdditionalDocuments] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [currentDocumentType, setCurrentDocumentType] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const fw = (patch) => setWizardForm((prev) => ({ ...prev, ...patch }))

  /* ─── Data loaders ────────────────────────────────────────────── */

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
    try {
      const data = await getFilterOptions()
      if (data) {
        setMetaOptions({
          departments: data.departments || [],
          jobTitles: data.jobTitles || [],
          workLocations: data.workLocations || [],
          workModes: data.workModes || [],
        })
      }
    } catch (err) {
      console.warn('Failed to load filter meta options', err)
    }
  }, [])

  const loadDirectoryForPick = useCallback(async () => {
    try {
      const res = await listOnboardingEmployees({ limit: 500 })
      const list = res.records || res.employees || []
      setDirectoryOptions(list)
    } catch {
      setDirectoryOptions([])
    }
  }, [])

  const loadEmployeeOnboardingStatus = useCallback(async (id) => {
    if (!id) {
      setCurrentOnboardingStatus('Pending')
      setStatusUpdateValue('')
      setRejectionReason('')
      return
    }
    try {
      const emp = await getEmployee(Number(id))
      const status = emp?.employment_status || emp?.employmentStatus
      if (status === 'Terminated') setCurrentOnboardingStatus('Rejected')
      else if (emp?.onboarding_completed_at) setCurrentOnboardingStatus('Approved')
      else setCurrentOnboardingStatus('Pending')
      setStatusUpdateValue('')
      setRejectionReason('')
    } catch {
      setCurrentOnboardingStatus('Pending')
    }
  }, [])

  const loadEmployeeDocuments = useCallback(async (id) => {
    if (!id) {
      setSubmittedDocuments([])
      setAdditionalDocuments([])
      return
    }
    try {
      const data = await getDocuments(Number(id))
      const docs = data?.documents || data?.records || []
      const types = docs
        .map((d) => d.document_type || d.documentType)
        .filter(Boolean)
      setSubmittedDocuments(types)
      setAdditionalDocuments(
        docs.map((d) => ({
          id: d.id,
          name: d.document_name || d.document_title || d.file_name || 'Document',
          uploadedAt: d.created_at || d.uploadedAt || '',
          fileUrl: d.file_url || d.fileUrl,
          raw: d,
        })),
      )
    } catch {
      setSubmittedDocuments([])
      setAdditionalDocuments([])
    }
  }, [])

  const updateOnboardingStatus = async () => {
    if (!selectedEmployeeId || !statusUpdateValue) return
    if (statusUpdateValue === 'Rejected' && !rejectionReason.trim()) {
      toast.error('Rejection reason is required.')
      return
    }
    try {
      if (statusUpdateValue === 'Rejected') {
        await updateEmployee(Number(selectedEmployeeId), {
          employmentStatus: 'Terminated',
        })
      } else if (statusUpdateValue === 'Approved') {
        await updateEmployee(Number(selectedEmployeeId), {
          employmentStatus: 'Onboarding',
        })
      }
      setCurrentOnboardingStatus(statusUpdateValue)
      setStatusUpdateValue('')
      setRejectionReason('')
      toast.success('Onboarding status updated.')
      await loadOnboarding()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Status update failed')
    }
  }

  const uploadOfferLetter = async () => {
    if (!selectedEmployeeId || !offerLetterFile) return
    setUploadingOfferLetter(true)
    try {
      const fd = new FormData()
      fd.append('file', offerLetterFile)
      fd.append('document_type', 'Offer Letter')
      fd.append('document_title', offerLetterFile.name)
      await uploadEmployeeDocument(Number(selectedEmployeeId), fd)
      toast.success('Offer letter uploaded.')
      setOfferLetterFile(null)
      await loadEmployeeDocuments(selectedEmployeeId)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingOfferLetter(false)
    }
  }

  const openDocumentUpload = (docType) => {
    setCurrentDocumentType(docType)
    setUploadFile(null)
    setShowUploadModal(true)
  }

  const submitDocumentUpload = async () => {
    if (!selectedEmployeeIdForDocs || !uploadFile || !currentDocumentType) return
    setUploadingDoc(true)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('document_type', currentDocumentType)
      fd.append('document_title', uploadFile.name)
      await uploadEmployeeDocument(Number(selectedEmployeeIdForDocs), fd)
      toast.success('Document uploaded.')
      setShowUploadModal(false)
      setUploadFile(null)
      await loadEmployeeDocuments(selectedEmployeeIdForDocs)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingDoc(false)
    }
  }

  const uploadAdditionalDocument = async (file) => {
    if (!selectedEmployeeIdForDocs || !file) return
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('document_type', 'Other')
      fd.append('document_title', file.name)
      await uploadEmployeeDocument(Number(selectedEmployeeIdForDocs), fd)
      toast.success('Document uploaded.')
      await loadEmployeeDocuments(selectedEmployeeIdForDocs)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    }
  }

  const downloadDocument = (doc) => {
    const url = doc?.fileUrl || doc?.raw?.file_url
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else toast.error('Download URL not available.')
  }

  const deleteDocument = () => {
    toast.error('Remove documents from the employee profile for now.')
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
    if (modalOpen) {
      loadDirectoryForPick()
      loadMetaOptions()
      loadTenantRoles()
    }
  }, [modalOpen, loadDirectoryForPick, loadMetaOptions, loadTenantRoles])

  /* ─── Stats & filtering ───────────────────────────────────────── */

  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.status === 'Pending').length
    const inProgress = rows.filter((r) => r.status === 'In Progress').length
    return { newHires: rows.length, inProgress, pending, completed: 0 }
  }, [rows])

  const filtered = useMemo(() => {
    if (activeStatus === 'All') return rows
    return rows.filter((h) => h.status === activeStatus)
  }, [rows, activeStatus])

  /* ─── Activation (view modal) ─────────────────────────────────── */

  const handleCompleteActivation = async () => {
    if (!selectedHire?.id) return
    if (!selectedHire.email) {
      toast.error('Add a work email on the employee profile before activation.')
      return
    }
    setActivating(true)
    try {
      const result = await completeOnboardingActivation(selectedHire.id)
      toast.success(result.message || 'Activation complete. Login details sent by email.')
      setViewModalOpen(false)
      setSelectedHire(null)
      await loadOnboarding()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Activation failed')
    } finally {
      setActivating(false)
    }
  }

  /* ─── Select-from-directory submit ───────────────────────────── */

  const handleStartOnboarding = async (e) => {
    e.preventDefault()
    if (!pickEmployeeId) { toast.error('Select an employee from the directory.'); return }
    setInitLoading(true)
    try {
      await updateEmployee(Number(pickEmployeeId), { employmentStatus: 'Onboarding', portalEnabled: false })
      toast.success('Employee added to onboarding.')
      setModalOpen(false)
      setPickEmployeeId('')
      await loadOnboarding()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not start onboarding')
    } finally {
      setInitLoading(false)
    }
  }

  /* ─── Helpers ─────────────────────────────────────────────────── */

  function calculateProbationEndDate(joinDateStr, probationStr) {
    if (!joinDateStr || !probationStr || probationStr === 'None') return null
    const months = parseInt(probationStr)
    if (isNaN(months)) return null
    const d = new Date(joinDateStr)
    d.setMonth(d.getMonth() + months)
    return d.toISOString().split('T')[0]
  }

  /* ─── Unified form validation ─────────────────────────────────── */

  const validateForm = () => {
    const f = wizardForm
    if (!f.fullName.trim()) { toast.error('Full Name is required.'); return false }
    if (!f.dateOfBirth) { toast.error('Date of Birth is required.'); return false }
    if (!f.personalEmail.trim()) { toast.error('Personal Email is required.'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.personalEmail.trim())) { toast.error('Enter a valid personal email.'); return false }
    if (!f.phoneNumber.trim()) { toast.error('Phone Number is required.'); return false }
    if (!f.nationality) { toast.error('Nationality is required.'); return false }
    if (!f.jobTitle.trim()) { toast.error('Job Title / Designation is required.'); return false }
    if (!f.department) { toast.error('Department is required.'); return false }
    if (!f.expectedJoiningDate) { toast.error('Expected Joining Date is required.'); return false }
    if (!f.rbacRoleId) { toast.error('System Role is required.'); return false }
    if (!f.annualCtc) { toast.error('Annual CTC is required.'); return false }
    if (isNaN(Number(f.annualCtc)) || Number(f.annualCtc) <= 0) { toast.error('Annual CTC must be a positive number.'); return false }
    return true
  }

  /* ─── Create & start onboarding ──────────────────────────────── */

  const handleCreateAndStartOnboarding = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!validateForm()) return

    setInitLoading(true)
    try {
      const nextId = await getNextEmployeeId([])
      const parts = wizardForm.fullName.trim().split(' ')
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''
      const probationEndDate = calculateProbationEndDate(wizardForm.expectedJoiningDate, wizardForm.probationPeriod)

      const payload = {
        empId: String(nextId),
        fullName: wizardForm.fullName.trim(),
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
        probationEndDate: probationEndDate || undefined,
        jobTitle: wizardForm.jobTitle.trim(),
        department: wizardForm.department,
        employmentType: wizardForm.employmentType,
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

      const created = await createEmployee(payload)
      const empId = created?.id

      if (empId) {
        // Upload Signed Offer Letter
        if (wizardForm.onboardingStatus === 'Accepted' && wizardForm.signedDocumentFile) {
          try {
            const fd = new FormData()
            fd.append('file', wizardForm.signedDocumentFile)
            fd.append('document_type', 'Signed Offer Letter')
            fd.append('document_title', 'Signed Offer Letter - Onboarding')
            await uploadEmployeeDocument(empId, fd)
          } catch (uploadErr) {
            console.error('Failed to upload signed offer letter:', uploadErr)
            toast.warn('Employee created, but signed document upload failed.')
          }
        }

        // Dispatch credentials & welcome email
        if (wizardForm.sendCredentialsEmail) {
          try {
            const domain = window.location.hostname || 'localhost'
            const domainPart = domain.includes('localhost') ? 'localhost' : domain
            const workEmail = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'newhire'}@${domainPart}`
            await updateEmployee(empId, { workEmail })
            await completeOnboardingActivation(empId)
            toast.success('Credentials & Welcome Email dispatched successfully!')
          } catch (activateErr) {
            console.error('Failed to dispatch credentials:', activateErr)
            toast.warn('Employee created, but credentials dispatch failed. Activate manually.')
          }
        }
      }

      toast.success('New hire created and added to onboarding workflow.')
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

  /* ─── Table columns ───────────────────────────────────────────── */

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
        <button
          type="button"
          onClick={() => { setSelectedHire(row); setViewModalOpen(true) }}
          className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-slate-300 transition-all shadow-sm"
          title="View"
        >
          <HiEye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  /* ─── Shared input / select class helpers ─────────────────────── */
  const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20'
  const selectCls = `${inputCls} cursor-pointer`
  const labelCls = 'text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5'

  /* ─── Section header component ────────────────────────────────── */
  const SectionHeader = ({ icon: Icon, title, subtitle, color = 'text-[#0F766E]' }) => (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#0F766E] shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )

  /* ─── JSX ─────────────────────────────────────────────────────── */

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
            onClick={() => setModalOpen(true)}
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
          { label: 'TOTAL NEW HIRES', count: stats.newHires, icon: HiUserPlus, bgColor: 'bg-slate-900', status: 'All' },
          { label: 'IN PROGRESS', count: stats.inProgress, icon: HiClock, bgColor: 'bg-[#3B82F6]', status: 'In Progress' },
          { label: 'MISSING EMAIL', count: stats.pending, icon: HiXCircle, bgColor: 'bg-[#F59E0B]', status: 'Pending' },
          { label: 'READY TO ACTIVATE', count: stats.inProgress, icon: HiCheckBadge, bgColor: 'bg-[#10B981]', status: 'In Progress' },
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
            {loading ? 'Loading…' : `${filtered.length} records`}
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
          <p className="px-6 py-12 text-center text-sm text-slate-500">Loading onboarding employees…</p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No employees in onboarding.</p>
            <p className="mt-2 text-xs text-slate-400">Add someone from the directory, or create an employee with status <strong>Onboarding</strong> in Employee Directory.</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
        )}
      </div>

      {/* ── View / Activate Modal ──────────────────────────────────── */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Onboarding details" size="xl">
        <div className="animate-in fade-in duration-500 space-y-10">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 -mx-6 px-8 py-6 mb-8">
            <div className="flex flex-wrap items-center gap-12">
              {[
                { label: 'Employee', value: selectedHire?.name },
                { label: 'Employee ID', value: selectedHire?.empId },
                { label: 'Department', value: selectedHire?.dept },
                { label: 'Work email', value: selectedHire?.email || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-2">
            <div className="space-y-6">
              <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                <HiClipboardDocumentCheck className="h-5 w-5 text-[#0F766E]" /> HR checklist
              </h4>
              <div className="space-y-4">
                {['Offer letter issued', 'Policy acknowledgement', 'Document verification'].map((task, i) => (
                  <label key={task} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E]/30 cursor-pointer transition-all">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{task}</span>
                    <input type="checkbox" className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-0 focus:ring-offset-0" defaultChecked={i < 2} />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                <HiCpuChip className="h-5 w-5 text-[#0F766E]" /> IT checklist
              </h4>
              <div className="space-y-4">
                {['Work email configured', 'Hardware allocation'].map((task, i) => (
                  <label key={task} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E]/30 cursor-pointer transition-all">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{task}</span>
                    <input type="checkbox" className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-0 focus:ring-offset-0" defaultChecked={Boolean(selectedHire?.email) && i === 0} />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-none border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
            <strong>Complete activation</strong> sets the employee to Active, enables the employee portal, generates a random password, and emails login details to their <strong>work email</strong>.
          </div>

          <div className="pt-10 border-t border-slate-100 flex justify-end gap-4 px-2">
            <button type="button" onClick={() => setViewModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              disabled={activating || !selectedHire?.email}
              onClick={handleCompleteActivation}
              className="h-12 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activating ? 'Sending…' : 'Complete activation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add to Onboarding Modal ────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setOnboardingMode('create') }}
        title="Add employee to onboarding"
        size={onboardingMode === 'create' ? 'xl' : 'lg'}
      >
        {/* Mode switcher tabs */}
        <div className="flex border-b border-slate-200 -mx-6 px-6 mb-6">
          {[
            { key: 'create', label: 'Onboarding' },
            { key: 'status', label: 'Onboarding Status' },
            { key: 'documents', label: 'Document Submitted' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setOnboardingMode(key)}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest text-center border-b-2 transition-all ${onboardingMode === key
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: ONBOARDING (CREATE NEW HIRE) ────────────────────────────────── */}
        {onboardingMode === 'create' ? (
          <form className="p-2" onSubmit={handleCreateAndStartOnboarding}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 pb-2">
              {/* SECTION 1 — Candidate Personal Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={HiUser} title="Candidate Information" subtitle="Personal credentials and contact details" />
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Full Name <span className="text-rose-500">*</span></label>
                      <input type="text" value={wizardForm.fullName} onChange={(e) => fw({ fullName: e.target.value })} placeholder="e.g. Neha Joshi" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Date of Birth <span className="text-rose-500">*</span></label>
                      <input type="date" value={wizardForm.dateOfBirth} onChange={(e) => fw({ dateOfBirth: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Personal Email <span className="text-rose-500">*</span></label>
                      <input type="email" value={wizardForm.personalEmail} onChange={(e) => fw({ personalEmail: e.target.value })} placeholder="neha@gmail.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number <span className="text-rose-500">*</span></label>
                      <input type="tel" value={wizardForm.phoneNumber} onChange={(e) => fw({ phoneNumber: e.target.value })} placeholder="+91 98765 43210" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select value={wizardForm.gender} onChange={(e) => fw({ gender: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Nationality <span className="text-rose-500">*</span></label>
                      <select value={wizardForm.nationality} onChange={(e) => fw({ nationality: e.target.value })} className={selectCls}>
                        <option value="">Select</option>
                        <option value="Indian">Indian</option>
                        <option value="Emirati">Emirati</option>
                        <option value="British">British</option>
                        <option value="American">American</option>
                        <option value="Other">Other</option>
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
                    <textarea value={wizardForm.currentAddress} onChange={(e) => fw({ currentAddress: e.target.value })} placeholder="Street, City, State, PIN code" rows={2} className={`${inputCls} resize-none`} />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — Job Setup, System Role & Offer Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={HiBriefcase} title="Job & Organizational Setup" subtitle="Designation, department, role assignment, and offer details" />
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Job Title / Designation <span className="text-rose-500">*</span></label>
                      <input type="text" list="jobTitles" value={wizardForm.jobTitle} onChange={(e) => fw({ jobTitle: e.target.value })} placeholder="e.g. Senior Software Engineer" className={inputCls} />
                      <datalist id="jobTitles">
                        {metaOptions.jobTitles.map((t, i) => <option key={i} value={t} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className={labelCls}>Department <span className="text-rose-500">*</span></label>
                      <select value={wizardForm.department} onChange={(e) => fw({ department: e.target.value })} className={selectCls}>
                        <option value="">Select Department</option>
                        {metaOptions.departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                      </select>
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
                        <option value="">Select System Role…</option>
                        {tenantRoles.length > 0
                          ? tenantRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)
                          : <option disabled>Loading roles…</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Employment Type</label>
                      <select value={wizardForm.employmentType} onChange={(e) => fw({ employmentType: e.target.value })} className={selectCls}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
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
                        <option value="">Select Manager (Optional)</option>
                        {directoryOptions.map((e) => (
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

              {/* SECTION 3 — Compensation & Terms */}
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
                        <option value="AED">UAE Dirham (AED)</option>
                        <option value="INR">Indian Rupee (INR)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
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
            <div className="pt-5 mt-4 border-t border-slate-200 flex justify-between items-center gap-4">
              <button type="button" onClick={() => { setModalOpen(false); setOnboardingMode('create'); setWizardForm(INITIAL_FORM) }} className="h-11 px-6 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm">Cancel</button>
              <button type="submit" disabled={initLoading} className="h-11 px-10 rounded-lg bg-[#0F766E] hover:bg-[#0c6b64] shadow-lg shadow-emerald-950/10 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {initLoading ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>) : 'Submit & Start Onboarding'}
              </button>
            </div>
          </form>
        ) : onboardingMode === 'status' ? (
          /* ── TAB 2: ONBOARDING STATUS ────────────────────────────────── */
          <div className="p-2 space-y-6">
            {/* Employee Selection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Onboarding Status</label>
                      <select value={wizardForm.onboardingStatus} onChange={(e) => fw({ onboardingStatus: e.target.value })} className={selectCls}>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    {wizardForm.onboardingStatus === 'Accepted' && (
                      <div>
                        <label className={labelCls}>Upload Signed Offer Letter <span className="text-slate-400 font-medium normal-case">(Optional)</span></label>
                        {!wizardForm.signedDocumentFile ? (
                          <div className="relative border border-dashed border-slate-200 rounded-lg p-3 bg-slate-50 text-center hover:bg-slate-100 hover:border-[#0F766E]/50 transition-all cursor-pointer group min-h-[46px] flex items-center justify-center">
                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => { if (e.target.files?.[0]) fw({ signedDocumentFile: e.target.files[0] }) }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex items-center gap-2 text-slate-500 group-hover:text-[#0F766E] transition-colors text-xs font-semibold">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                              Select Signed Document
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-7 w-7 rounded bg-emerald-50 text-[#0F766E] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate leading-none">{wizardForm.signedDocumentFile.name}</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">{(wizardForm.signedDocumentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => fw({ signedDocumentFile: null })} className="h-6 w-6 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-all shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* <div>
                    <label className={labelCls}>
                      <span className="inline-flex items-center gap-1.5">
                        <HiEnvelope className="h-3.5 w-3.5 text-[#0F766E]" />
                        Welcome Offer Letter Template
                      </span>
                    </label>
                    <select value={wizardForm.welcomeLetterTemplateId} onChange={(e) => fw({ welcomeLetterTemplateId: e.target.value })} className={selectCls}>
                      <option value="">Select Template (Optional)…</option>
                      <option value="std_offer">Standard Offer Letter Template</option>
                      <option value="exec_onboarding">Executive Onboarding Template</option>
                      <option value="contract_agreement">Contractor Agreement Template</option>
                    </select>
                  </div> */}
            </div>

            {selectedEmployeeId && (
              <>
                {/* Status Approval */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <SectionHeader icon={HiShieldCheck} title="Onboarding Status Approval" subtitle="Approve or reject the candidate's onboarding" />
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Current Status</label>
                        <div className={`mt-1 inline-flex px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${currentOnboardingStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          currentOnboardingStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                          {currentOnboardingStatus || 'Pending'}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Update Status</label>
                        <select
                          value={statusUpdateValue}
                          onChange={(e) => setStatusUpdateValue(e.target.value)}
                          className={selectCls}
                        >
                          <option value="">Select Status</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                    {statusUpdateValue === 'Rejected' && (
                      <div>
                        <label className={labelCls}>Rejection Reason <span className="text-rose-500">*</span></label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Please provide reason for rejection..."
                          rows={3}
                          className={`${inputCls} resize-none`}
                        />
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={updateOnboardingStatus}
                        disabled={!statusUpdateValue || (statusUpdateValue === 'Rejected' && !rejectionReason)}
                        className="h-11 px-8 rounded-lg bg-[#0F766E] hover:bg-[#0c6b64] text-[10px] font-black uppercase tracking-widest text-white transition-all"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>

                {/* Offer Letter Upload */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <SectionHeader icon={HiClipboardDocumentCheck} title="Offer Letter" subtitle="Upload signed offer letter (optional)" />
                  <div className="space-y-4">
                    {!offerLetterFile ? (
                      <div className="relative border border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 text-center hover:bg-slate-100 hover:border-[#0F766E]/50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={(e) => { if (e.target.files?.[0]) setOfferLetterFile(e.target.files[0]) }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm font-medium">Click to upload signed offer letter</span>
                          <span className="text-xs">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded bg-emerald-50 text-[#0F766E] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{offerLetterFile.name}</p>
                            <p className="text-xs text-slate-500">{(offerLetterFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOfferLetterFile(null)}
                          className="h-8 w-8 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {offerLetterFile && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={uploadOfferLetter}
                          disabled={uploadingOfferLetter}
                          className="h-10 px-6 rounded-lg bg-[#0F766E] hover:bg-[#0c6b64] text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                        >
                          {uploadingOfferLetter ? 'Uploading...' : 'Upload Document'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── TAB 3: DOCUMENT SUBMITTED ────────────────────────────────── */
          <div className="p-2 space-y-6">
            {/* Employee Selection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <SectionHeader icon={HiUser} title="Select Employee" subtitle="Choose an employee to manage documents" />
              <select
                value={selectedEmployeeIdForDocs}
                onChange={(e) => {
                  setSelectedEmployeeIdForDocs(e.target.value);
                  loadEmployeeDocuments(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white h-12 px-4 text-sm focus:border-[#0F766E] outline-none transition-all"
              >
                <option value="">Select employee…</option>
                {directoryOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {(e.full_name || e.fullName) ?? 'Employee'} — {e.emp_id || e.empId}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployeeIdForDocs && (
              <>
                {/* ══════════════════════════════════════════════════════
          SECTION 1: ID PROOF (REQUIRED)
        ══════════════════════════════════════════════════════ */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#0F766E] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2H9.17c.413-1.165 1.524-2 2.83-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">ID PROOF</h3>
                      <p className="text-[10px] text-slate-500">Passport, Emirates ID, or National ID (Required)</p>
                    </div>
                    <span className="ml-auto text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Required</span>
                  </div>

                  <div className="space-y-3">
                    {!idProofFile && !savedIdProof ? (
                      <div className="relative border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center hover:bg-slate-100 hover:border-[#0F766E]/50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => { if (e.target.files?.[0]) setIdProofFile(e.target.files[0]) }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1.5 text-slate-500">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm font-medium">Upload ID Proof</span>
                          <span className="text-xs">PDF, JPG, PNG (Max 5MB)</span>
                        </div>
                      </div>
                    ) : (idProofFile || savedIdProof) && (
                      <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded bg-emerald-50 text-[#0F766E] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {(idProofFile || savedIdProof)?.name || 'ID Proof Document'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(idProofFile || savedIdProof)?.size ? ((idProofFile.size / 1024 / 1024).toFixed(2) + ' MB') : 'Already uploaded'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(savedIdProof && !idProofFile) && (
                            <button
                              type="button"
                              onClick={() => downloadDocument(savedIdProof)}
                              className="p-1.5 text-slate-500 hover:text-[#0F766E] transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )}
                          {idProofFile && (
                            <button
                              type="button"
                              onClick={() => setIdProofFile(null)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {idProofFile && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={uploadIdProof}
                          disabled={uploadingIdProof}
                          className="h-9 px-5 rounded-lg bg-[#0F766E] hover:bg-[#0c6b64] text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                        >
                          {uploadingIdProof ? 'Uploading...' : 'Save ID Proof'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════
          SECTION 2: RESUME / CV (REQUIRED)
        ══════════════════════════════════════════════════════ */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#0F766E] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">RESUME / CV</h3>
                      <p className="text-[10px] text-slate-500">Candidate's updated resume (Required)</p>
                    </div>
                    <span className="ml-auto text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Required</span>
                  </div>

                  <div className="space-y-3">
                    {!resumeFile && !savedResume ? (
                      <div className="relative border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center hover:bg-slate-100 hover:border-[#0F766E]/50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => { if (e.target.files?.[0]) setResumeFile(e.target.files[0]) }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1.5 text-slate-500">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm font-medium">Upload Resume / CV</span>
                          <span className="text-xs">PDF, DOC, DOCX (Max 5MB)</span>
                        </div>
                      </div>
                    ) : (resumeFile || savedResume) && (
                      <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded bg-emerald-50 text-[#0F766E] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {(resumeFile || savedResume)?.name || 'Resume Document'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(resumeFile || savedResume)?.size ? ((resumeFile.size / 1024 / 1024).toFixed(2) + ' MB') : 'Already uploaded'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(savedResume && !resumeFile) && (
                            <button
                              type="button"
                              onClick={() => downloadDocument(savedResume)}
                              className="p-1.5 text-slate-500 hover:text-[#0F766E] transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )}
                          {resumeFile && (
                            <button
                              type="button"
                              onClick={() => setResumeFile(null)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {resumeFile && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={uploadResume}
                          disabled={uploadingResume}
                          className="h-9 px-5 rounded-lg bg-[#0F766E] hover:bg-[#0c6b64] text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                        >
                          {uploadingResume ? 'Uploading...' : 'Save Resume'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════
          SECTION 3: EXPERIENCE LETTER (OPTIONAL)
        ══════════════════════════════════════════════════════ */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">EXPERIENCE LETTER</h3>
                      <p className="text-[10px] text-slate-500">Previous employment proof (Optional)</p>
                    </div>
                    <span className="ml-auto text-[9px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                  </div>

                  <div className="space-y-3">
                    {!experienceLetterFile && !savedExperienceLetter ? (
                      <div className="relative border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center hover:bg-slate-100 hover:border-[#0F766E]/50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={(e) => { if (e.target.files?.[0]) setExperienceLetterFile(e.target.files[0]) }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1.5 text-slate-500">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm font-medium">Upload Experience Letter (Optional)</span>
                          <span className="text-xs">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</span>
                        </div>
                      </div>
                    ) : (experienceLetterFile || savedExperienceLetter) && (
                      <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {(experienceLetterFile || savedExperienceLetter)?.name || 'Experience Letter'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(experienceLetterFile || savedExperienceLetter)?.size ? ((experienceLetterFile.size / 1024 / 1024).toFixed(2) + ' MB') : 'Already uploaded'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(savedExperienceLetter && !experienceLetterFile) && (
                            <button
                              type="button"
                              onClick={() => downloadDocument(savedExperienceLetter)}
                              className="p-1.5 text-slate-500 hover:text-[#0F766E] transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )}
                          {experienceLetterFile && (
                            <button
                              type="button"
                              onClick={() => setExperienceLetterFile(null)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {experienceLetterFile && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={uploadExperienceLetter}
                          disabled={uploadingExperienceLetter}
                          className="h-9 px-5 rounded-lg bg-[#0F766E] hover:bg-[#0c6b64] text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                        >
                          {uploadingExperienceLetter ? 'Uploading...' : 'Save Experience Letter'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )
        }

      </Modal >
    </div >
  )
}