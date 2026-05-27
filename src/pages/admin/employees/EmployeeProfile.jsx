import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  getEmployeeProfile, getAttendance, getLeave,
  getDocuments, getEmployeeDocumentCatalog, uploadEmployeeDocument,
  getPerformance, getAssets,
} from '../../../services/employeeProfileService.js'
import { listEmployees } from '../../../services/employeeService.js'
import { listVisaRecords } from '../../../services/visaRecordService.js'
import performanceAssessmentAPI from '../../../services/performanceAssessmentAPI.js'
import {
  HiUser, HiIdentification, HiBriefcase, HiDocumentText, HiCreditCard,
  HiClock, HiCalendar, HiChartBar, HiArchiveBox, HiEllipsisVertical,
  HiCheckCircle, HiExclamationCircle, HiNoSymbol, HiArrowUpCircle,
  HiBolt, HiPrinter, HiPencilSquare, HiArrowPath,
  HiStar, HiEye, HiUserGroup, HiPhone, HiAcademicCap,
} from 'react-icons/hi2'

const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/** Same order/labels as EmployeeDirectory create & view tabs (experience only under job) */
const DIRECTORY_PROFILE_TABS = [
  { id: 'basic', label: 'Basic Information', icon: HiUser },
  { id: 'personal', label: 'Personal Information', icon: HiIdentification },
  { id: 'bank', label: 'Bank Information', icon: HiCreditCard },
  { id: 'family', label: 'Family Information', icon: HiUserGroup },
  { id: 'contact', label: 'Contact Section', icon: HiPhone },
  { id: 'education', label: 'Educational Details', icon: HiAcademicCap },
  { id: 'job', label: 'Experience Details', icon: HiBriefcase },
]

const OPERATIONAL_TABS = [
  { id: 'documents', label: 'Documents', icon: HiDocumentText },
  { id: 'visa', label: 'Visa & Nationality', icon: HiIdentification },
  { id: 'attendance', label: 'Attendance & Timesheet', icon: HiClock },
  { id: 'leave', label: 'Leave', icon: HiCalendar },
  { id: 'performance', label: 'Performance', icon: HiChartBar },
  { id: 'assets', label: 'Assets', icon: HiArchiveBox },
]

const TABS = [...DIRECTORY_PROFILE_TABS, ...OPERATIONAL_TABS]

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <HiArrowPath className="h-6 w-6 text-[#0F766E] animate-spin" />
    </div>
  )
}

function InfoCard({ label, value, highlight }) {
  return (
    <div className="bg-slate-50 p-3 rounded-none border border-slate-100">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xs font-black ${highlight ? 'text-[#0F766E]' : 'text-slate-900'}`}>{value || '—'}</p>
    </div>
  )
}

export default function EmployeeProfile() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  const [selectedId, setSelectedId] = useState(null)
  const [employeeList, setEmployeeList] = useState([])

  // Per-tab data
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [leave, setLeave] = useState(null)
  const [documents, setDocuments] = useState(null)
  /** Tenant document_types rows — drives checklist + per-type upload on Documents tab */
  const [employeeDocTypes, setEmployeeDocTypes] = useState([])
  const [performanceAssessments, setPerformanceAssessments] = useState(null)
  const [performanceSummary, setPerformanceSummary] = useState(null)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [competencies, setCompetencies] = useState([])
  const [assets, setAssets] = useState(null)
  const [visaRecords, setVisaRecords] = useState(null)

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingTab, setLoadingTab] = useState(false)
  const [loadingList, setLoadingList] = useState(true)

  // Document Upload State
  const [docUploadOpen, setDocUploadOpen] = useState(false)
  const [docFile, setDocFile] = useState(null)
  const [docCatalog, setDocCatalog] = useState([])
  const [docCatalogLoading, setDocCatalogLoading] = useState(false)
  const [docUploading, setDocUploading] = useState(false)
  const [docForm, setDocForm] = useState({
    document_type: '',
    document_title: '',
    document_number: '',
    notes: '',
    issue_date: '',
    expiry_date: '',
  })

  // Employee Progress State
  const [progressForm, setProgressForm] = useState({
    employeeStatus: 'Not Started',
    employeeProgress: '0',
    employeeComments: '',
    completionNotes: ''
  })
  const [savingProgress, setSavingProgress] = useState(false)

  // Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedPrintTabs, setSelectedPrintTabs] = useState(() => TABS.map(t => t.id))

  const isHrAdmin = currentUser?.role === 'hr_admin' || currentUser?.role === 'admin'

  /** Matches documents POST allow-list on API (upload / add file). */
  const canUploadDocuments = (() => {
    const r = String(currentUser?.role || '').toLowerCase()
    return ['superadmin', 'admin', 'hr_admin', 'hr_executive'].includes(r)
  })()

  const resolveDocFileUrl = (url) => {
    if (!url) return null
    if (/^https?:\/\//i.test(url)) return url
    const path = url.startsWith('/') ? url : `/${url}`
    return `${API_ORIGIN}${path}`
  }

  const closeDocUpload = () => {
    setDocUploadOpen(false)
    setDocFile(null)
    setDocCatalog([])
    setDocForm({
      document_type: '',
      document_title: '',
      document_number: '',
      notes: '',
      issue_date: '',
      expiry_date: '',
    })
  }

  const openDocUpload = async (initialDocumentType = '') => {
    if (!selectedId) return
    setDocUploadOpen(true)
    setDocFile(null)
    setDocForm({
      document_type: '',
      document_title: '',
      document_number: '',
      notes: '',
      issue_date: '',
      expiry_date: '',
    })
    setDocCatalogLoading(true)
    try {
      let list = employeeDocTypes
      if (!list.length) {
        const res = await getEmployeeDocumentCatalog(selectedId)
        list = res?.types || []
        if (list.length) setEmployeeDocTypes(list)
      }
      setDocCatalog([...list])
      const initial = String(initialDocumentType || '').trim()
      const pick =
        initial && list.some((t) => String(t.name).trim() === initial)
          ? initial
          : list[0]?.name || initial
      setDocForm({
        document_type: pick,
        document_title: '',
        document_number: '',
        notes: '',
        issue_date: '',
        expiry_date: '',
      })
    } catch (e) {
      console.error(e)
      setDocCatalog([])
      setDocForm({
        document_type: String(initialDocumentType || '').trim(),
        document_title: '',
        document_number: '',
        notes: '',
        issue_date: '',
        expiry_date: '',
      })
      toast.error(e.message || 'Could not load document types')
    } finally {
      setDocCatalogLoading(false)
    }
  }

  const submitDocUpload = async (e) => {
    e.preventDefault()
    if (!selectedId) return
    const type = docForm.document_type.trim()
    if (!type) {
      toast.error('Choose or enter a document type.')
      return
    }
    if (!docFile) {
      toast.error('Select a file to upload (PDF, JPG, or PNG).')
      return
    }
    const fd = new FormData()
    fd.append('file', docFile)
    fd.append('document_type', type.slice(0, 100))
    if (docForm.document_title.trim()) fd.append('document_title', docForm.document_title.trim())
    if (docForm.document_number.trim()) fd.append('document_number', docForm.document_number.trim())
    if (docForm.notes.trim()) fd.append('notes', docForm.notes.trim())
    if (docForm.issue_date) fd.append('issue_date', docForm.issue_date)
    if (docForm.expiry_date) fd.append('expiry_date', docForm.expiry_date)
    setDocUploading(true)
    try {
      await uploadEmployeeDocument(selectedId, fd)
      toast.success('Document uploaded.')
      closeDocUpload()
      const [docData, catRes] = await Promise.all([
        getDocuments(selectedId),
        getEmployeeDocumentCatalog(selectedId).catch(() => ({ types: [] })),
      ])
      setDocuments(docData)
      setEmployeeDocTypes(catRes?.types || [])
    } catch (err) {
      toast.error(err.message || 'Upload failed.')
    } finally {
      setDocUploading(false)
    }
  }

  // ── Load employee list for switcher ──────────────────────────────────────
  useEffect(() => {
    listEmployees({ limit: 100 })
      .then(data => {
        setEmployeeList(data?.employees || [])
        if (data?.employees?.length) setSelectedId(data.employees[0].id)
      })
      .catch(console.error)
      .finally(() => setLoadingList(false))
  }, [])

  // ── Load profile when employee changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedId) return
    setProfile(null)
    setAttendance(null); setLeave(null); setDocuments(null)
    setEmployeeDocTypes([])
    setPerformanceAssessments(null); setPerformanceSummary(null); setAssets(null)
    setVisaRecords(null)
    setActiveTab('basic')
    setLoadingProfile(true)
    getEmployeeProfile(selectedId)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoadingProfile(false))
  }, [selectedId])

  // ── Load tab data on demand ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId || !profile) return
    setLoadingTab(true)
    const load = async () => {
      try {
        switch (activeTab) {
          case 'attendance':
            if (!attendance) setAttendance(await getAttendance(selectedId))
            break
          case 'leave':
            if (!leave) setLeave(await getLeave(selectedId))
            break
          case 'documents': {
            const [docData, catRes] = await Promise.all([
              getDocuments(selectedId),
              getEmployeeDocumentCatalog(selectedId).catch(() => ({ types: [] })),
            ])
            setDocuments(docData)
            setEmployeeDocTypes(catRes?.types || [])
            break
          }
          case 'performance':
            if (!performanceAssessments) {
              const [assessmentsData, summaryData, competenciesData] = await Promise.all([
                performanceAssessmentAPI.getEmployeeAssessments(selectedId),
                performanceAssessmentAPI.getEmployeePerformanceSummary(selectedId),
                performanceAssessmentAPI.getCompetenciesDropdown().catch(() => ({ data: [] }))
              ])
              setPerformanceAssessments(assessmentsData?.data || [])
              setPerformanceSummary(summaryData?.data || null)
              setCompetencies(competenciesData?.data || [])
            }
            break
          case 'assets':
            if (!assets) setAssets(await getAssets(selectedId))
            break
          case 'visa': {
            if (!visaRecords) {
              const visaData = await listVisaRecords({ employeeId: selectedId, limit: 50, page: 1 })
              setVisaRecords(visaData?.records ?? [])
            }
            break
          }
          default: break
        }
      } catch (err) { console.error(err) }
      finally { setLoadingTab(false) }
    }
    load()
  }, [activeTab, selectedId, profile])

  // ── Handler to open assessment with competencies ─────────────────────────
  const handleViewAssessment = async (assessment) => {
    // Ensure competencies are loaded before opening modal
    if (competencies.length === 0) {
      try {
        const competenciesData = await performanceAssessmentAPI.getCompetenciesDropdown().catch(() => ({ data: [] }))
        setCompetencies(competenciesData?.data || [])
      } catch (err) {
        console.error('Error loading competencies:', err)
      }
    }
    setSelectedAssessment(assessment)
    setProgressForm({
      employeeStatus: assessment.employeeStatus || 'Not Started',
      employeeProgress: String(assessment.employeeProgress || '0'),
      employeeComments: assessment.employeeComments || '',
      completionNotes: assessment.completionNotes || ''
    })
  }

  const handleSaveProgress = async () => {
    if (!selectedAssessment) return
    setSavingProgress(true)
    try {
      const updated = await performanceAssessmentAPI.updateEmployeeProgress(selectedAssessment.id, progressForm)
      toast.success('Progress updated successfully')
      
      const updatedData = updated?.data || updated // depending on ApiResponse format
      
      setPerformanceAssessments(prev => 
        prev.map(a => a.id === selectedAssessment.id ? { ...a, ...updatedData } : a)
      )
      
      // Close the modal
      setSelectedAssessment(null)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update progress')
    } finally {
      setSavingProgress(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const emp = profile
  const initials = emp?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  const statusColor = (s) => {
    if (s === 'Active' || s === 'Present' || s === 'Approved' || s === 'Submitted' || s === 'Issued') return 'green'
    if (s === 'Probation' || s === 'Late' || s === 'Pending') return 'orange'
    if (s === 'Absent' || s === 'Rejected' || s === 'Terminated') return 'red'
    if (s === 'On Leave' || s === 'Half Day') return 'yellow'
    return 'slate'
  }

  // ── Tab renderers ─────────────────────────────────────────────────────────

  /** EmployeeDirectory view modal — basic tab */
  const renderBasic = () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 animate-in fade-in duration-300">
      {[
        ['Employee ID', emp?.emp_id],
        ['Full Name', emp?.full_name],
        ['Work Email', emp?.work_email],
        ['Phone', emp?.phone_number],
        ['Department', emp?.department],
        ['Designation', emp?.job_title],
        ['Join Date', emp?.join_date],
        ['Portal Role', emp?.rbac_role_name],
      ].map(([label, val]) => (
        <div key={label}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
        </div>
      ))}
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0">
      {/* 4 Custom Consistent Metrics Cards Grid (Mirroring Directory Design System) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'LATEST RATING',
            count: performance?.latest?.overall_rating || '—',
            subtitle: 'Last Review',
            bgColor: 'bg-[#0F172A]',
            icon: HiChartBar,
          },
          {
            label: 'LEAVE BALANCE',
            count: leave?.balances?.find(b => b.leave_type === 'Annual Leave')?.remaining ?? '—',
            subtitle: 'Annual Days Left',
            bgColor: 'bg-[#10B981]',
            icon: HiCalendar,
          },
          {
            label: 'ATTENDANCE RATIO',
            count: attendance?.summary ? `${Math.round((attendance.summary.present / (attendance.summary.total_days || 1)) * 100)}%` : '—',
            subtitle: 'This Month Summary',
            bgColor: 'bg-[#3B82F6]',
            icon: HiClock,
          },
          {
            label: 'ASSIGNED ASSETS',
            count: assets?.counts?.active ?? '—',
            subtitle: 'Tracked Items',
            bgColor: 'bg-[#F59E0B]',
            icon: HiArchiveBox,
          }
        ].map((card, idx) => (
          <div
            key={idx}
            className="group flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 min-w-0 shadow-2xs"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-2xs`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none truncate">
                {card.count}
              </div>
              <div className="mt-1 text-[9px] font-semibold text-slate-400 truncate">
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2 rounded-none border border-slate-200 bg-white p-6 shadow-2xs min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 min-w-0">
            <h3 className="text-xs font-black text-[#0F766E] uppercase tracking-wider">Operational Identity</h3>
            <Badge label={emp?.employment_status || 'Active'} color={statusColor(emp?.employment_status)} variant="soft" className="text-[9px] font-black rounded-none px-2.5 py-0.5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 min-w-0">
            <div className="space-y-4 min-w-0">
              <div className="p-3.5 rounded-none border border-slate-200 bg-slate-50/50 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Direct Manager</p>
                <p className="text-xs font-bold text-slate-900 truncate">{emp?.manager_name || '—'}</p>
              </div>
              <div className="p-3.5 rounded-none border border-slate-200 bg-slate-50/50 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Cost Center / Dept</p>
                <p className="text-xs font-bold text-slate-900 truncate">{emp?.cost_center || emp?.department || '—'}</p>
              </div>
            </div>
            <div className="space-y-4 min-w-0">
              <div className="p-3.5 rounded-none border border-slate-200 bg-slate-50/50 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Hired Date</p>
                <p className="text-xs font-bold text-slate-900 truncate">{emp?.join_date || '—'}</p>
              </div>
              <div className="p-3.5 rounded-none border border-slate-200 bg-slate-50/50 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Employment Type</p>
                <p className="text-xs font-bold text-slate-900 truncate">{emp?.employment_type || '—'}</p>
              </div>
            </div>
          </div>
          {isHrAdmin && (
            <div className="mt-6 flex flex-wrap gap-2.5 pt-5 border-t border-slate-100 min-w-0">
              <button type="button" className="inline-flex items-center gap-1.5 rounded-none bg-[#0F766E] px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-wider hover:bg-[#0c6b64] transition-colors shadow-2xs">
                <HiArrowUpCircle className="h-3.5 w-3.5" /> Promote
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-none border border-amber-300 bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-700 uppercase tracking-wider hover:bg-amber-100 transition-colors shadow-2xs">
                <HiExclamationCircle className="h-3.5 w-3.5" /> Suspend
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-none border border-rose-300 bg-rose-50 px-3 py-1.5 text-[10px] font-black text-rose-700 uppercase tracking-wider hover:bg-rose-100 transition-colors shadow-2xs">
                <HiNoSymbol className="h-3.5 w-3.5" /> Offboard
              </button>
            </div>
          )}
        </div>
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-2xs min-w-0 flex flex-col">
          <div className="border-b border-slate-100 pb-4 mb-5 min-w-0 shrink-0">
            <h3 className="text-xs font-black text-[#0F766E] uppercase tracking-wider">Career Evolution</h3>
          </div>
          <div className="space-y-4 relative flex-1 min-w-0">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100" />
            {emp?.career_history ? (
              emp.career_history.split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex gap-3.5 relative min-w-0">
                  <div className={`h-5 w-5 shrink-0 rounded-none border-2 border-white shadow-xs z-10 ${i === 0 ? 'bg-[#0F766E]' : 'bg-slate-300'}`} />
                  <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight flex-1 pb-1 min-w-0 break-words">{line}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-6 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Evolution History</p>
                <p className="text-[10px] text-slate-400 mt-1">Career timeline tracks structural position changes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  /** EmployeeDirectory view modal — personal tab */
  const renderPersonalInfo = () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 animate-in fade-in duration-300">
      {[
        ['Gender', emp?.gender],
        ['Date of Birth', emp?.date_of_birth],
        ['Nationality', emp?.nationality],
        ['Marital Status', emp?.marital_status],
        ['Religion', emp?.religion],
        ['No. of Children', emp?.dependents],
        ['Personal Email', emp?.personal_email],
        ['Country of Residence', emp?.country_of_residence],
        ['Home Address', emp?.home_address],
      ].map(([label, val]) => (
        <div key={label} className={label === 'Home Address' ? 'col-span-2' : ''}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">{val ?? '—'}</p>
        </div>
      ))}
    </div>
  )

  const formatRecordDuration = (start, end, usePresent = false) => {
    const s = start ? String(start).split('T')[0] : ''
    const e = end ? String(end).split('T')[0] : (usePresent ? 'Present' : '')
    if (!s && !e) return '—'
    if (s && e) return `${s} – ${e}`
    return s || e || '—'
  }

  /** EmployeeDirectory view modal — experience tab */
  const renderExperience = () => (
    <div className="animate-in fade-in duration-300">
      {Array.isArray(emp?.work_experience) && emp.work_experience.length > 0 ? (
        <div className="space-y-3">
          {emp.work_experience.map((wx, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-4 rounded-none border border-slate-100 bg-slate-50 px-4 py-3 sm:grid-cols-3 sm:gap-6"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Company Name</p>
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {wx.company_name || wx.companyName || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Designation</p>
                <p className="mt-0.5 text-sm font-medium text-[#0F766E]">{wx.designation || '—'}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                <p className="mt-0.5 text-sm font-medium text-slate-600">
                  {formatRecordDuration(
                    wx.start_date || wx.startDate,
                    wx.end_date || wx.endDate,
                    !wx.end_date && !wx.endDate && emp?.is_currently_working,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No work experience records</p>
      )}
    </div>
  )

  /** Job & Organization tab: prior work experience only (current role is on Basic Information) */
  const renderJob = () => (
    <div className="animate-in fade-in duration-300">
      <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-[#0F766E]">Experience</h3>
      {renderExperience()}
    </div>
  )

  const renderBank = () => (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 animate-in fade-in duration-300">
      {[
        ['Bank Name', emp?.bank_name],
        ['Account Number', emp?.bank_account_no],
        ['IFSC Code', emp?.ifsc_code],
        ['Branch Address', emp?.branch_address],
      ].map(([label, val]) => (
        <div key={label}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900 break-words">{val || '—'}</p>
        </div>
      ))}
    </div>
  )

  const renderFamily = () => (
    <div className="animate-in fade-in duration-300">
      {Array.isArray(emp?.family_members) && emp.family_members.length > 0 ? (
        <div className="space-y-3">
          {emp.family_members.map((m, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 rounded-none border border-slate-100 bg-slate-50 px-4 py-3">
              {[['Name', m.name], ['Relationship', m.relationship], ['Phone', m.phone]].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No family members added</p>
      )}
    </div>
  )

  const renderContact = () => {
    const sc = emp?.secondary_contact
    if (!sc || typeof sc !== 'object') {
      return <p className="text-sm text-slate-400">No secondary contact recorded</p>
    }
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 animate-in fade-in duration-300">
        {[
          ['Name', sc.name],
          ['Relationship', sc.relationship],
          ['Phone 1', sc.phone_no1 || sc.phoneNo1],
          ['Phone 2', sc.phone_no2 || sc.phoneNo2],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-900">{val || '—'}</p>
          </div>
        ))}
      </div>
    )
  }

  const renderEducation = () => (
    <div className="animate-in fade-in duration-300">
      {Array.isArray(emp?.education) && emp.education.length > 0 ? (
        <div className="space-y-3">
          {emp.education.map((ed, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-4 rounded-none border border-slate-100 bg-slate-50 px-4 py-3 sm:grid-cols-3 sm:gap-6"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Institution Name</p>
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {ed.institution_name || ed.institutionName || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Course</p>
                <p className="mt-0.5 text-sm font-medium text-[#0F766E]">{ed.course || '—'}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                <p className="mt-0.5 text-sm font-medium text-slate-600">
                  {formatRecordDuration(ed.start_date || ed.startDate, ed.end_date || ed.endDate, !ed.end_date && !ed.endDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No education records</p>
      )}
    </div>
  )

  const renderDocuments = () => {
    if (loadingTab && documents === null) return <Spinner />
    const docs = documents?.documents || []
    const types = employeeDocTypes

    const norm = (s) => String(s || '').trim().toLowerCase()
    const latestForType = (typeName) => {
      const n = norm(typeName)
      const matches = docs.filter((d) => norm(d.document_type) === n)
      return matches[0] || null
    }
    const catalogNorms = new Set(types.map((t) => norm(t.name)))
    const otherDocs = docs.filter((d) => !catalogNorms.has(norm(d.document_type)))

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Document Compliance Registry</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {types.length} required type{types.length === 1 ? '' : 's'}
                <span className="text-slate-300"> · </span>
                {docs.length} file{docs.length === 1 ? '' : 's'} on record
              </p>
            </div>
          </div>

          {types.length === 0 ? (
            <div className="px-6 py-8 space-y-4">
              <p className="text-sm text-slate-600">
                No document types are configured for this company. Add them under{' '}
                <span className="font-semibold text-slate-800">Admin → Settings → Documents</span>, then return here to upload per employee.
              </p>
              {docs.length > 0 ? (
                <div className="overflow-x-auto rounded-none border border-slate-100">
                  <table className="w-full text-left text-sm min-w-[560px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {docs.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800 text-xs">{doc.document_title}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{doc.document_type}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={doc.status} color={statusColor(doc.status)} variant="outline" className="font-black text-[9px] tracking-widest" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {doc.file_url ? (
                              <a href={resolveDocFileUrl(doc.file_url)} target="_blank" rel="noreferrer">
                                <Button label="VIEW" variant="ghost" size="sm" className="text-[9px] font-black text-[#0F766E] uppercase" />
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {canUploadDocuments ? (
                <Button
                  type="button"
                  label="UPLOAD OTHER DOCUMENT"
                  variant="outline"
                  size="sm"
                  icon={HiArrowUpCircle}
                  className="text-[10px] font-black tracking-widest border-[#0F766E] text-[#0F766E]"
                  onClick={() => openDocUpload('')}
                />
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Required document</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">On file</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest title</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {types.map((t) => {
                    const latest = latestForType(t.name)
                    const count = docs.filter((d) => norm(d.document_type) === norm(t.name)).length
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                              <HiDocumentText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{t.name}</p>
                              {count > 1 ? (
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{count} versions</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {latest ? (
                            <Badge label="Yes" color="green" variant="soft" className="text-[9px] font-black" />
                          ) : (
                            <Badge label="Missing" color="orange" variant="outline" className="text-[9px] font-black tracking-widest" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-semibold text-slate-600">{latest?.document_title || '—'}</td>
                        <td className="px-6 py-4">
                          {latest ? (
                            <Badge label={latest.status} color={statusColor(latest.status)} variant="outline" className="font-black text-[9px] tracking-widest" />
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{latest?.expiry_date || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            {latest?.file_url ? (
                              <a href={resolveDocFileUrl(latest.file_url)} target="_blank" rel="noreferrer">
                                <Button label="VIEW" variant="ghost" size="sm" className="text-[9px] font-black text-[#0F766E] uppercase" />
                              </a>
                            ) : null}
                            {canUploadDocuments ? (
                              <Button
                                type="button"
                                label={latest ? 'ADD FILE' : 'UPLOAD'}
                                variant={latest ? 'outline' : 'primary'}
                                size="sm"
                                icon={HiArrowUpCircle}
                                className={`text-[9px] font-black tracking-widest ${latest ? 'border-slate-200' : ''}`}
                                onClick={() => openDocUpload(t.name)}
                              />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {otherDocs.length > 0 ? (
          <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight">Other documents on record</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Types not in the checklist above (still stored in the documents table)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[560px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / title</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {otherDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-3">
                        <p className="font-bold text-slate-800 text-xs">{doc.document_title}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{doc.document_type}</p>
                      </td>
                      <td className="px-6 py-3">
                        <Badge label={doc.status} color={statusColor(doc.status)} variant="outline" className="font-black text-[9px] tracking-widest" />
                      </td>
                      <td className="px-6 py-3 text-right">
                        {doc.file_url ? (
                          <a href={resolveDocFileUrl(doc.file_url)} target="_blank" rel="noreferrer">
                            <Button label="VIEW" variant="ghost" size="sm" className="text-[9px] font-black text-[#0F766E] uppercase" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const fmtVisaDate = (v) => {
    if (!v) return '—'
    const s = String(v).split('T')[0]
    return s || '—'
  }

  const renderVisa = () => {
    if (loadingTab && visaRecords === null) return <Spinner />

    const records = visaRecords ?? []
    const hasEmployeeFields =
      emp?.passport_number ||
      emp?.visa_type ||
      emp?.emirates_id_number ||
      emp?.sponsoring_entity

    if (records.length === 0 && !hasEmployeeFields) {
      return (
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-none border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
          <p className="text-sm font-medium text-slate-600">No visa or nationality records for this employee</p>
          <p className="mt-2 text-xs text-slate-500">
            Add records under Compliance → Visa &amp; Nationality, or passport/visa fields on the employee form.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {records.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0F766E]">
              Visa &amp; nationality records ({records.length})
            </h3>
            {records.map((vr) => (
              <div
                key={vr.id}
                className="grid gap-6 rounded-none border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3"
              >
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Passport</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Number</p>
                      <p className="font-medium text-slate-900">{vr.passport_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Nationality</p>
                      <p className="font-medium text-slate-900">{vr.nationality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Issue</p>
                      <p className="font-medium text-slate-900">{fmtVisaDate(vr.passport_issue_date)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Expiry</p>
                      <p className="font-medium text-rose-600">{fmtVisaDate(vr.passport_expiry_date)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Country of issue</p>
                      <p className="font-medium text-slate-900">{vr.country_of_issue || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0F766E]">Visa</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Type</p>
                      <p className="font-medium text-slate-900">{vr.visa_type_display || vr.visa_type_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Number</p>
                      <p className="font-medium text-slate-900">{vr.visa_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Expiry</p>
                      <p className="font-medium text-amber-600">{fmtVisaDate(vr.visa_expiry_date)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Sponsor</p>
                      <p className="font-medium text-slate-900">{vr.sponsoring_entity || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emirates ID</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">ID Number</p>
                      <p className="font-medium text-slate-900">{vr.emirates_id_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400">Expiry</p>
                      <p className="font-medium text-rose-600">{fmtVisaDate(vr.emirates_id_expiry)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {hasEmployeeFields ? (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-none border border-slate-100 bg-slate-50 p-5 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employee profile (legacy)</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Passport</p>
                  <p className="font-medium">{emp?.passport_number || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Passport expiry</p>
                  <p className="font-medium text-rose-600">{fmtVisaDate(emp?.passport_expiry)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-none border border-emerald-100 bg-emerald-50/30 p-5 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F766E]">Visa (legacy)</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Type</p>
                  <p className="font-medium">{emp?.visa_type || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Expiry</p>
                  <p className="font-medium text-amber-600">{fmtVisaDate(emp?.visa_expiry_date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Sponsor</p>
                  <p className="font-medium">{emp?.sponsoring_entity || '—'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-none border border-slate-100 bg-slate-50 p-5 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emirates ID (legacy)</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Number</p>
                  <p className="font-medium">{emp?.emirates_id_number || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">Expiry</p>
                  <p className="font-medium text-rose-600">{fmtVisaDate(emp?.emirates_id_expiry)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const renderAttendance = () => {
    if (loadingTab && !attendance) return <Spinner />
    const s = attendance?.summary
    const records = attendance?.records || []
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { label: 'Present', value: s?.present ?? '—', color: 'emerald' },
            { label: 'Absent', value: s?.absent ?? '—', color: 'red' },
            { label: 'Late', value: s?.late ?? '—', color: 'amber' },
            { label: 'Half Day', value: s?.half_day ?? '—', color: 'yellow' },
            { label: 'On Leave', value: s?.on_leave ?? '—', color: 'blue' },
          ].map(c => (
            <div key={c.label} className="rounded-none border border-slate-200 bg-white p-4 shadow-sm text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{c.label}</p>
              <p className={`text-2xl font-black text-${c.color}-600`}>{c.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Attendance Log — {attendance?.month}/{attendance?.year}</h3>
          </div>
          {records.length === 0 ? (
            <div className="flex items-center justify-center min-h-[150px]">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No records for this period</p>
            </div>
          ) : (
            <Table
              columns={[
                { key: 'date', label: 'DATE' },
                { key: 'check_in_time', label: 'PUNCH IN', render: v => <span className="font-bold text-slate-900">{v || '—'}</span> },
                { key: 'check_out_time', label: 'PUNCH OUT', render: v => <span className="font-bold text-slate-900">{v || '—'}</span> },
                { key: 'total_hours', label: 'HOURS', render: v => <Badge label={v ? `${v}h` : '—'} color="blue" variant="soft" className="font-black" /> },
                { key: 'status', label: 'STATUS', render: v => <Badge label={v} color={statusColor(v)} className="font-black text-[9px] tracking-widest" /> },
              ]}
              data={records}
              pageSize={10}
            />
          )}
        </div>
      </div>
    )
  }

  const renderLeave = () => {
    if (loadingTab && !leave) return <Spinner />
    const balances = leave?.balances || []
    const requests = leave?.requests || []
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.length === 0 ? (
            <div className="col-span-4 rounded-none border border-slate-200 bg-white p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No leave balances configured</p>
            </div>
          ) : balances.map(b => (
            <div key={b.leave_type} className="rounded-none border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{b.leave_type}</p>
              <p className="text-2xl font-black text-emerald-600">{b.remaining} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Days</span></p>
              <p className="text-[9px] text-slate-400 mt-1">{b.used} used / {b.total_allocated} allocated</p>
            </div>
          ))}
        </div>
        <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Leave History — {leave?.year}</h3>
          </div>
          {requests.length === 0 ? (
            <div className="flex items-center justify-center min-h-[150px]">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No leave requests found</p>
            </div>
          ) : (
            <Table
              columns={[
                { key: 'leave_type', label: 'TYPE' },
                { key: 'from_date', label: 'FROM', render: v => <span className="text-xs font-bold text-slate-900">{v}</span> },
                { key: 'to_date', label: 'TO', render: v => <span className="text-xs font-bold text-slate-900">{v}</span> },
                { key: 'total_days', label: 'DAYS', render: v => <Badge label={`${v}d`} color="slate" variant="soft" className="font-black" /> },
                { key: 'status', label: 'STATUS', render: v => <Badge label={v} color={statusColor(v)} className="font-black text-[9px] tracking-widest" /> },
              ]}
              data={requests}
              pageSize={8}
            />
          )}
        </div>
      </div>
    )
  }

  const renderPerformance = () => {
    if (loadingTab && (!performanceAssessments || !performanceSummary)) return <Spinner />
    const assessments = performanceAssessments || []

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Summary</h2>
        </div>

        <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Assessment History</h3>
          </div>
          {assessments.length === 0 ? (
            <div className="flex items-center justify-center min-h-[150px]">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No assessments found</p>
            </div>
          ) : (
            <Table
              columns={[
                { key: 'performanceCycle', label: 'CYCLE', render: v => <span className="text-xs font-black text-slate-900">{v?.cycleName || 'N/A'}</span> },
                { key: 'performanceLead', label: 'PERFORMANCE LEAD', render: v => <span className="text-xs font-bold text-slate-600">{v || '—'}</span> },
                { key: 'assessmentDate', label: 'DATE', render: v => <span className="text-xs font-bold text-slate-600">{v ? v.split('T')[0] : '—'}</span> },
                { key: 'overallRating', label: 'RATING', render: v => <div className="flex items-center gap-1"><HiStar className="w-3 h-3 text-amber-400" /><span className="font-black text-slate-800 text-xs">{v || 0}</span></div> },
                { key: 'performanceBand', label: 'BAND', render: v => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{v || '—'}</span> },
                { key: 'status', label: 'STATUS', render: v => <Badge label={v} color={v === 'Completed' ? 'green' : 'orange'} variant="soft" className="font-black text-[9px] tracking-widest" /> },
                { key: 'actions', label: 'DETAILS', render: (_, row) => (
                  <Button 
                    label="VIEW" 
                    icon={HiEye}
                    variant="ghost" 
                    size="sm" 
                    className="text-[9px] font-black text-[#0F766E] uppercase"
                    onClick={() => handleViewAssessment(row)}
                  />
                )}
              ]}
              data={assessments}
              pageSize={10}
            />
          )}
        </div>
      </div>
    )
  }

  const renderAssets = () => {
    if (loadingTab && !assets) return <Spinner />
    const list = assets?.assets || []
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Assigned assets</p>
            <p className="text-xs text-slate-500">
              {assets?.counts?.active ?? 0} active · {assets?.counts?.total ?? 0} total
            </p>
          </div>
          {isHrAdmin && (
            <Button label="ASSIGN ASSET" variant="primary" size="sm" className="text-[10px] font-black tracking-widest shrink-0" />
          )}
        </div>
        {list.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center rounded-none border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500">No assets assigned</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-4 rounded-none border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <HiArchiveBox className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{a.asset_name || '—'}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-semibold text-[#0F766E]">{a.asset_tag || '—'}</span>
                      {a.assigned_date ? (
                        <>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span>Assigned {a.assigned_date}</span>
                        </>
                      ) : null}
                    </p>
                    {(a.category || a.serial_number) && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {[a.category, a.serial_number].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {a.condition && (
                    <Badge label={a.condition} color="green" variant="soft" className="text-[9px] font-black" />
                  )}
                  {a.status && (
                    <Badge label={a.status} color={statusColor(a.status)} className="text-[9px] font-black tracking-widest" />
                  )}
                  <button
                    type="button"
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    aria-label="More options"
                  >
                    <HiEllipsisVertical className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const handleTogglePrintTab = (id) => {
    setSelectedPrintTabs(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSelectAllPrintTabs = (select) => {
    if (select) {
      setSelectedPrintTabs(TABS.map(t => t.id))
    } else {
      setSelectedPrintTabs([])
    }
  }

  const executePrintExport = (format) => {
    if (!selectedPrintTabs.length) {
      toast.error('Please select at least one tab to include.')
      return
    }

    const selectedLabels = TABS.filter(t => selectedPrintTabs.includes(t.id)).map(t => t.label)

    if (format === 'pdf') {
      toast.success(`Exporting ${selectedLabels.length} modules as highly formatted PDF bundle...`)
      setTimeout(() => {
        window.print()
      }, 500)
    } else if (format === 'excel') {
      toast.success(`Exporting multi-sheet Excel workbook for ${emp?.full_name || 'Employee'}...`)
    } else {
      toast.success(`Preparing printer-friendly document layouts...`)
      setTimeout(() => {
        window.print()
      }, 500)
    }
    setPrintModalOpen(false)
  }

  const renderTabContent = () => {
    if (loadingProfile || !emp) return <Spinner />
    switch (activeTab) {
      case 'basic':
        return renderBasic()
      case 'overview':
        return renderOverview()
      case 'personal':
        return renderPersonalInfo()
      case 'job':
        return renderJob()
      case 'bank':
        return renderBank()
      case 'family':
        return renderFamily()
      case 'contact':
      case 'secondary':
        return renderContact()
      case 'education':
        return renderEducation()
      case 'documents':
        return renderDocuments()
      case 'visa': return renderVisa()
      case 'attendance': return renderAttendance()
      case 'leave': return renderLeave()
      case 'performance': return renderPerformance()
      case 'assets': return renderAssets()
      default: return null
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Employee Profile Portal</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Employees</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">360° Profile Audit</span>
          </div>
        </div>

        {/* Right side Switcher and Export actions migrated directly into Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          <div className="w-full sm:w-60">
            {loadingList ? (
              <div className="h-9 w-full bg-slate-100 rounded-none animate-pulse" />
            ) : (
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black tracking-wider text-slate-400 uppercase pointer-events-none bg-white px-1">
                  SWITCH
                </span>
                <select
                  value={selectedId || ''}
                  onChange={e => setSelectedId(Number(e.target.value))}
                  className="w-full rounded-none border border-slate-200 bg-white py-2 pl-16 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] cursor-pointer shadow-2xs"
                >
                  {employeeList.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.emp_id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            title="Print / Export Selective Modules"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0F766E] transition-colors shadow-2xs shrink-0"
          >
            <HiPrinter className="h-4 w-4 text-slate-500" />
            <span>Print Queue</span>
          </button>
        </div>
      </div>

      {/* Modern High-Fidelity Clean Directory Header Panel (No Background Colors) */}
      <div className="relative overflow-hidden rounded-none border border-slate-200 bg-white p-4 shadow-2xs min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {emp?.profile_image_url ? (
              <img src={emp.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200 shadow-2xs" />
            ) : (
              <Avatar name={emp?.full_name} size="md" />
            )}
            {emp && (
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-white" title="Active Record">
                <span className="h-1 w-1 rounded-full bg-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <HiIdentification className="h-3.5 w-3.5 shrink-0 text-[#0F766E]" aria-hidden />
              <span className="text-[10px] font-bold tracking-wider text-[#0F766E] uppercase leading-none">Employee Profile</span>
            </div>
            {loadingProfile ? (
              <div className="h-6 w-48 bg-slate-100 rounded-none animate-pulse mt-1" />
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1.5 truncate">
                  {emp?.full_name || 'Select Employee'}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-none leading-none">
                    {emp?.emp_id || 'ID: —'}
                  </span>
                  {emp?.job_title && (
                    <span className="text-xs font-semibold text-slate-600 leading-none">
                      • {emp.job_title}
                    </span>
                  )}
                  {emp?.department && (
                    <span className="text-[10px] font-bold text-[#0F766E] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-none ml-0.5 leading-none">
                      {emp.department}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal tabs — standardized layout border framing */}
      <div className="rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 font-bold text-xs transition-all ${isActive
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
            <HiClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              <span className="font-medium">Updated </span>
              <span className="font-bold text-slate-600">{emp?.updatedAt || '—'}</span>
            </span>
          </div>
        </div>
        <div className="min-w-0 p-4 sm:p-6">{renderTabContent()}</div>
      </div>

      {/* Selective Print / Export Selection Dialog */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Selective Print &amp; Export Configurator"
        size="md"
      >
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Profile Modules
            </h3>
            <p className="text-xs text-slate-600">
              Select the data sections to bundle into your document export or print queue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 p-3 bg-slate-50/50">
            {TABS.map((tab) => {
              const isChecked = selectedPrintTabs.includes(tab.id)
              return (
                <label
                  key={tab.id}
                  className={`flex items-center gap-2.5 p-2 border cursor-pointer transition-all select-none ${isChecked
                    ? 'bg-white border-[#0F766E]/40 text-[#0F766E] shadow-2xs font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleTogglePrintTab(tab.id)}
                    className="h-3.5 w-3.5 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-xs truncate">{tab.label}</span>
                </label>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAllPrintTabs(true)}
                className="text-[11px] font-bold text-[#0F766E] hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => handleSelectAllPrintTabs(false)}
                className="text-[11px] font-semibold text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {selectedPrintTabs.length} of {TABS.length} selected
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => executePrintExport('pdf')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-none bg-rose-600 py-2 px-3 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-sm"
            >
              Export as PDF
            </button>
            <button
              type="button"
              onClick={() => executePrintExport('excel')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-none bg-emerald-600 py-2 px-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Export as Excel
            </button>
            <button
              type="button"
              onClick={() => executePrintExport('print')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-none bg-[#0F766E] py-2 px-3 text-xs font-bold text-white hover:bg-[#0c6b64] transition-colors shadow-sm"
            >
              Print Queue
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Upload Modal */}
      <Modal
        isOpen={docUploadOpen}
        onClose={closeDocUpload}
        title="Upload Employee Document"
        size="md"
      >
        <form onSubmit={submitDocUpload} className="p-5 space-y-4">
          {docCatalogLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Spinner />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document Type <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  list="doc-types-list"
                  placeholder="e.g. Passport, Offer Letter"
                  value={docForm.document_type}
                  onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
                />
                <datalist id="doc-types-list">
                  {docCatalog.map((t) => (
                    <option key={t.id || t.name} value={t.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document Title</label>
                <input
                  type="text"
                  placeholder="Optional title/description"
                  value={docForm.document_title}
                  onChange={(e) => setDocForm({ ...docForm, document_title: e.target.value })}
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document / ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. A1234567"
                  value={docForm.document_number}
                  onChange={(e) => setDocForm({ ...docForm, document_number: e.target.value })}
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    value={docForm.issue_date}
                    onChange={(e) => setDocForm({ ...docForm, issue_date: e.target.value })}
                    className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    value={docForm.expiry_date}
                    onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })}
                    className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Upload File <span className="text-rose-500">*</span></label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocFile(e.target.files[0] || null)}
                  className="w-full text-xs font-bold text-slate-800 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer transition-colors"
                />
                <p className="text-[10px] font-semibold text-slate-500 mt-1.5">PDF, JPG, PNG up to 10MB.</p>
              </div>

              <div className="pt-5 border-t border-slate-100 flex justify-end gap-2.5">
                <Button type="button" label="CANCEL" variant="outline" onClick={closeDocUpload} className="text-[10px] font-black tracking-widest" />
                <Button type="submit" label={docUploading ? 'UPLOADING...' : 'UPLOAD'} variant="primary" disabled={docUploading} className="text-[10px] font-black tracking-widest" />
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Assessment Details Modal - Modern Professional Design */}
      <Modal
        isOpen={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        title="Assessment Details"
        size="2xl"
        className="rounded-none"
      >
        {selectedAssessment && (
          <div className="space-y-6 pt-4">
            {/* Header Section with Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Cycle</p>
                <p className="text-sm font-bold text-slate-900">{selectedAssessment.performanceCycle?.cycleName || 'N/A'}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Status</p>
                <Badge 
                  label={selectedAssessment.status} 
                  color={selectedAssessment.status === 'Completed' ? 'green' : 'orange'} 
                  variant="soft" 
                  className="font-black text-[9px] tracking-widest inline-block" 
                />
              </div>
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Lead</p>
                <p className="text-sm font-bold text-slate-900 truncate">{selectedAssessment.performanceLead || '—'}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Date</p>
                <p className="text-sm font-bold text-slate-900">{selectedAssessment.assessmentDate ? selectedAssessment.assessmentDate.split('T')[0] : '—'}</p>
              </div>
            </div>

            {/* Overall Performance Rating with Professional Progress Bar */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-white p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Overall Performance Rating</p>
                  <p className="text-2xl font-black text-[#0F766E]">{selectedAssessment.overallRating || 0} <span className="text-base text-slate-400">/ 5.0</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Performance Ratio</p>
                  <p className="text-3xl font-black text-[#0F766E]">{Math.round(((selectedAssessment.overallRating || 0) / 5) * 100)}<span className="text-base">%</span></p>
                </div>
              </div>

              {/* Professional Multi-Segment Progress Bar */}
              <div className="space-y-2">
                <div className="relative w-full h-8 bg-slate-100 rounded-lg overflow-hidden shadow-inner border border-slate-200">
                  {/* Background gradient segments */}
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-gradient-to-r from-red-100 to-red-50"></div>
                    <div className="flex-1 bg-gradient-to-r from-yellow-100 to-yellow-50"></div>
                    <div className="flex-1 bg-gradient-to-r from-blue-100 to-blue-50"></div>
                    <div className="flex-1 bg-gradient-to-r from-green-100 to-green-50"></div>
                    <div className="flex-1 bg-gradient-to-r from-emerald-100 to-emerald-50"></div>
                  </div>
                  
                  {/* Filled progress indicator */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-lg transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${Math.round(((selectedAssessment.overallRating || 0) / 5) * 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                  </div>

                  {/* Milestone markers */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {[1, 2, 3, 4, 5].map((marker) => (
                      <div key={marker} className="flex-1 border-r border-slate-300/40 last:border-r-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-400">{marker}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rating labels */}
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                  <div className="flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <HiStar key={star} className={`h-4 w-4 ${star <= Math.round(selectedAssessment.overallRating || 0) ? 'text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-center border-l border-r border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Competencies Rated</p>
                  <p className="text-xl font-black text-[#0F766E]">{selectedAssessment.competencyRatings?.length || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Avg Competency</p>
                  <p className="text-xl font-black text-[#0F766E]">
                    {selectedAssessment.competencyRatings?.length > 0 
                      ? (selectedAssessment.competencyRatings.reduce((sum, cr) => sum + (cr.rating || 0), 0) / selectedAssessment.competencyRatings.length).toFixed(1)
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Competency Ratings Section - Modern Cards */}
            <div>
              <div className="mb-4">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Competency Ratings</p>
                <p className="text-[11px] text-slate-500 mt-1">Detailed assessment across key competencies</p>
              </div>
              
              {selectedAssessment.competencyRatings?.length > 0 ? (
                <div className="grid gap-3">
                  {selectedAssessment.competencyRatings.map((cr, i) => {
                    // Determine competency ID - it could be cr.competency as number or as object
                    let competencyId = null
                    if (typeof cr.competency === 'number') {
                      competencyId = cr.competency
                    } else if (cr.competency?.id) {
                      competencyId = cr.competency.id
                    }
                    
                    // Try multiple ways to get the competency name
                    let competencyName = null
                    
                    // 1. Check if competency is a populated object with competencyName
                    if (cr.competency?.competencyName) {
                      competencyName = cr.competency.competencyName
                    } else if (cr.competency?.name) {
                      competencyName = cr.competency.name
                    } 
                    // 2. Check if competencyName is directly on the rating object
                    else if (cr.competencyName) {
                      competencyName = cr.competencyName
                    } else if (cr.name) {
                      competencyName = cr.name
                    } 
                    // 3. If competencies array is available, search by ID
                    else if (competencies && competencies.length > 0 && competencyId) {
                      const found = competencies.find(c => c.id === competencyId)
                      if (found) {
                        competencyName = found.competencyName || found.name
                      }
                    }
                    
                    // 4. Final fallback - use ID or index
                    if (!competencyName) {
                      competencyName = competencyId ? `Competency #${competencyId}` : `Competency ${i + 1}`
                    }
                    
                    const ratingPercentage = (cr.rating / 5) * 100
                    
                    return (
                      <div key={i} className="rounded-lg border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">{competencyName}</p>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <HiStar 
                                  key={star} 
                                  className={`h-4 w-4 transition-colors ${star <= cr.rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-[#0F766E]">{cr.rating || 0}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">{ratingPercentage.toFixed(0)}%</p>
                          </div>
                        </div>
                        
                        {/* Mini progress bar for competency */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] transition-all duration-500"
                            style={{ width: `${ratingPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500 font-semibold">No competency ratings found.</p>
                  <p className="text-xs text-slate-400 mt-1">Competencies will appear once they are added to the assessment.</p>
                </div>
              )}
            </div>

            {/* Key Contributions & Growth Objectives */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">Key Contributions</p>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto">
                  {selectedAssessment.keyContributions || <span className="text-slate-400 italic">No key contributions recorded.</span>}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">Growth Objectives</p>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto">
                  {selectedAssessment.growthObjectives || <span className="text-slate-400 italic">No growth objectives recorded.</span>}
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            {selectedAssessment.remarks && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">Additional Remarks</p>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedAssessment.remarks}
                </div>
              </div>
            )}

            {/* Goal & KPI Details Section */}
            {(selectedAssessment.goalTitle || selectedAssessment.kpiTarget) && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">Goal & KPI Details</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Goal Title</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAssessment.goalTitle || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">KPI Target</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAssessment.kpiTarget || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Priority</p>
                    <Badge label={selectedAssessment.priority || 'Normal'} color="blue" variant="soft" className="font-black text-[9px] tracking-widest" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Goal Due Date</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAssessment.dueDate ? selectedAssessment.dueDate.split('T')[0] : '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* My Progress Update Section */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="mb-4">
                <p className="text-sm font-black text-[#0F766E] uppercase tracking-tight">My Progress Update</p>
                <p className="text-[11px] text-slate-500 mt-1">Update your progress for this assessment</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee Status</label>
                  <select
                    value={progressForm.employeeStatus}
                    onChange={e => setProgressForm({ ...progressForm, employeeStatus: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] transition-colors"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Progress Percentage
                  </label>
                  <select
                    value={progressForm.employeeProgress}
                    onChange={e => setProgressForm({ ...progressForm, employeeProgress: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F766E] transition-colors"
                  >
                    <option value="0">0%</option>
                    <option value="10 to 30">10 to 30%</option>
                    <option value="30 to 50">30 to 50%</option>
                    <option value="50 to 80">50 to 80%</option>
                    <option value="80 to 100">80 to 100%</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee Comments</label>
                  <textarea
                    value={progressForm.employeeComments}
                    onChange={e => setProgressForm({ ...progressForm, employeeComments: e.target.value })}
                    placeholder="Provide your feedback or comments..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F766E] transition-colors resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Completion Notes</label>
                  <textarea
                    value={progressForm.completionNotes}
                    onChange={e => setProgressForm({ ...progressForm, completionNotes: e.target.value })}
                    placeholder="Notes about completion..."
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F766E] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  label="CANCEL" 
                  variant="outline" 
                  onClick={() => setSelectedAssessment(null)} 
                  className="text-[10px] font-black tracking-widest"
                />
                <Button 
                  label={savingProgress ? 'SAVING...' : 'SAVE PROGRESS'} 
                  variant="primary" 
                  onClick={handleSaveProgress}
                  disabled={savingProgress}
                  className="text-[10px] font-black tracking-widest"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
