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
import {
  HiUser, HiIdentification, HiBriefcase, HiDocumentText, HiCreditCard,
  HiClock, HiCalendar, HiChartBar, HiArchiveBox, HiEllipsisVertical,
  HiCheckCircle, HiExclamationCircle, HiNoSymbol, HiArrowUpCircle,
  HiBolt, HiPrinter, HiPencilSquare, HiArrowPath,
} from 'react-icons/hi2'

const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TABS = [
  { id: 'overview',    label: 'Overview',              icon: HiUser },
  { id: 'personal',   label: 'Personal Information',   icon: HiIdentification },
  { id: 'job',        label: 'Job & Organization',     icon: HiBriefcase },
  { id: 'documents',  label: 'Documents',              icon: HiDocumentText },
  { id: 'visa',       label: 'Visa & Nationality',     icon: HiCreditCard },
  { id: 'attendance', label: 'Attendance & Timesheet', icon: HiClock },
  { id: 'leave',      label: 'Leave',                  icon: HiCalendar },
  { id: 'performance',label: 'Performance',            icon: HiChartBar },
  { id: 'assets',     label: 'Assets',                 icon: HiArchiveBox },
]

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
  const [activeTab, setActiveTab]       = useState('overview')
  const [selectedId, setSelectedId]     = useState(null)
  const [employeeList, setEmployeeList] = useState([])

  // Per-tab data
  const [profile,     setProfile]     = useState(null)
  const [attendance,  setAttendance]  = useState(null)
  const [leave,       setLeave]       = useState(null)
  const [documents,   setDocuments]   = useState(null)
  /** Tenant document_types rows — drives checklist + per-type upload on Documents tab */
  const [employeeDocTypes, setEmployeeDocTypes] = useState([])
  const [performance, setPerformance] = useState(null)
  const [assets,      setAssets]      = useState(null)

  const [loadingProfile,     setLoadingProfile]     = useState(false)
  const [loadingTab,         setLoadingTab]         = useState(false)
  const [loadingList,        setLoadingList]        = useState(true)

  // Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedPrintTabs, setSelectedPrintTabs] = useState(() => TABS.map(t => t.id))

  const isHrAdmin = currentUser?.role === 'hr_admin' || currentUser?.role === 'admin'

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
    setPerformance(null); setAssets(null)
    setActiveTab('overview')
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
            if (!performance) setPerformance(await getPerformance(selectedId))
            break
          case 'assets':
            if (!assets) setAssets(await getAssets(selectedId))
            break
          default: break
        }
      } catch (err) { console.error(err) }
      finally { setLoadingTab(false) }
    }
    load()
  }, [activeTab, selectedId, profile])

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

  const renderPersonal = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-end">
        {isHrAdmin && <Button label="UPDATE RECORDS" variant="outline" size="sm" icon={HiPencilSquare} className="text-[10px] font-black tracking-widest" />}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p><p className="text-sm font-bold text-slate-900">{emp?.date_of_birth || '—'}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p><p className="text-sm font-bold text-slate-900">{emp?.gender || '—'}</p></div>
          </div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Email</p><p className="text-sm font-bold text-slate-900">{emp?.personal_email || '—'}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Phone</p><p className="text-sm font-bold text-slate-900">{emp?.phone_number || '—'}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nationality</p><p className="text-sm font-bold text-slate-900">{emp?.nationality || '—'}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Country of Residence</p><p className="text-sm font-bold text-slate-900">{emp?.country_of_residence || '—'}</p></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Home Address</p><p className="text-sm font-bold text-slate-900">{emp?.home_address || '—'}</p></div>
        </div>
        <div className="space-y-4">
          <div className="p-6 rounded-none bg-slate-50 border border-slate-100 space-y-4">
            <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Emergency Contact</h3>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contact Name</p><p className="text-sm font-bold text-slate-900">{emp?.emergency_contact_name || '—'}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Emergency Phone</p><p className="text-sm font-bold text-[#0F766E]">{emp?.emergency_contact_phone || '—'}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marital Status</p><p className="text-sm font-bold text-slate-900">{emp?.marital_status || '—'}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dependents</p><p className="text-sm font-bold text-slate-900">{emp?.dependents ?? '—'}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Religion</p><p className="text-sm font-bold text-slate-900">{emp?.religion || '—'}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment (spouse)</p><p className="text-sm font-bold text-slate-900">{emp?.employment_spouse || '—'}</p></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portal username</p><p className="text-sm font-bold text-[#0F766E]">{emp?.username || '—'}</p></div>
          </div>
          {(emp?.bank_name || emp?.bank_account_no) ? (
            <div className="p-6 rounded-none bg-slate-50 border border-slate-100 space-y-3 mt-6">
              <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Bank</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bank name</p><p className="text-sm font-bold text-slate-900">{emp?.bank_name || '—'}</p></div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Account no.</p><p className="text-sm font-bold text-slate-900">{emp?.bank_account_no || '—'}</p></div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">IFSC</p><p className="text-sm font-bold text-slate-900">{emp?.ifsc_code || '—'}</p></div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Branch</p><p className="text-sm font-bold text-slate-900">{emp?.branch_address || '—'}</p></div>
              </div>
            </div>
          ) : null}
          {emp?.secondary_contact && typeof emp.secondary_contact === 'object' && (emp.secondary_contact.name || emp.secondary_contact.phoneNo1 || emp.secondary_contact.phone_no1) ? (
            <div className="p-6 rounded-none border border-slate-100 bg-white space-y-3 mt-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary contact</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-sm font-bold text-slate-900">
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Name</p>{emp.secondary_contact.name || '—'}</div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Relationship</p>{emp.secondary_contact.relationship || '—'}</div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone 1</p>{emp.secondary_contact.phone_no1 || emp.secondary_contact.phoneNo1 || '—'}</div>
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone 2</p>{emp.secondary_contact.phone_no2 || emp.secondary_contact.phoneNo2 || '—'}</div>
              </div>
            </div>
          ) : null}
          {Array.isArray(emp?.family_members) && emp.family_members.length > 0 ? (
            <div className="mt-6 space-y-3">
              <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Family members</h3>
              <ul className="space-y-2">
                {emp.family_members.map((m, i) => (
                  <li key={i} className="rounded-none border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-bold text-slate-900">
                    <span className="text-[#0F766E]">{m.name || '—'}</span>
                    {(m.relationship || m.phone || m.passport_expiry) ? (
                      <span className="block text-xs font-medium text-slate-500 mt-1">
                        {[m.relationship, m.phone, m.passport_expiry].filter(Boolean).join(' · ')}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(emp?.education) && emp.education.length > 0 ? (
            <div className="mt-6 space-y-3 md:col-span-2">
              <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Education</h3>
              <ul className="space-y-2">
                {emp.education.map((ed, i) => (
                  <li key={i} className="rounded-none border border-slate-100 bg-white px-4 py-3 text-sm">
                    <p className="font-black text-slate-900">{ed.institution_name || ed.institutionName || '—'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{ed.course || '—'}{ed.start_date || ed.startDate ? ` · ${ed.start_date || ed.startDate} → ${ed.end_date || ed.endDate || ''}` : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(emp?.work_experience) && emp.work_experience.length > 0 ? (
            <div className="mt-6 space-y-3 md:col-span-2">
              <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Prior experience</h3>
              <ul className="space-y-2">
                {emp.work_experience.map((wx, i) => (
                  <li key={i} className="rounded-none border border-slate-100 bg-white px-4 py-3 text-sm">
                    <p className="font-black text-slate-900">{wx.company_name || wx.companyName || '—'} — <span className="text-[#0F766E]">{wx.designation || '—'}</span></p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{wx.start_date || wx.startDate || ''}{wx.end_date || wx.endDate ? ` → ${wx.end_date || wx.endDate}` : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {emp?.is_currently_working !== undefined ? (
            <div className="mt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Currently employed (prior role)</p>
              <p className="text-sm font-bold text-slate-900">{emp.is_currently_working ? 'Yes — current role flagged' : 'No'}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  const renderJob = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Designation</p><p className="text-sm font-black text-slate-900">{emp?.job_title || '—'}</p></div>
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Division / Dept</p><p className="text-sm font-black text-slate-900">{emp?.department || '—'}</p></div>
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Location</p><p className="text-sm font-black text-slate-900">{emp?.work_location || '—'}</p></div>
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Mode</p><p className="text-sm font-black text-slate-900">{emp?.work_mode || '—'}</p></div>
        </div>
        <div className="space-y-4">
          <div className="p-5 rounded-none border border-emerald-100 bg-emerald-50/20"><p className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest mb-1">Reporting Manager</p><p className="text-sm font-black text-slate-900">{emp?.manager_name || '—'}</p></div>
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment Type</p><p className="text-sm font-black text-slate-900">{emp?.employment_type || '—'}</p></div>
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p><p className="text-sm font-black text-slate-900">{emp?.grade || '—'}</p></div>
          <div className="p-5 rounded-none border border-slate-100 bg-slate-50/50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Center</p><p className="text-sm font-black text-slate-900">{emp?.cost_center || '—'}</p></div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-none bg-slate-50 border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Join Date</p><p className="text-xs font-black text-slate-900">{emp?.join_date || '—'}</p></div>
        <div className="p-4 rounded-none bg-slate-50 border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Probation End</p><p className="text-xs font-black text-slate-900">{emp?.probation_end_date || '—'}</p></div>
        <div className="p-4 rounded-none bg-slate-50 border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><Badge label={emp?.employment_status || '—'} color={statusColor(emp?.employment_status)} variant="soft" className="text-[8px] font-black mt-1 rounded-none" /></div>
        <div className="p-4 rounded-none bg-slate-50 border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary</p><p className="text-xs font-black text-slate-900">{emp?.salary ? `AED ${emp.salary}` : '—'}</p></div>
      </div>
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
            {isHrAdmin && (
              <Button
                type="button"
                label="UPLOAD NEW"
                variant="primary"
                size="sm"
                icon={HiArrowUpCircle}
                className="text-[10px] font-black tracking-widest"
                onClick={() => openDocUpload('')}
              />
            )}
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
              {isHrAdmin ? (
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
                            {isHrAdmin ? (
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

  const renderVisa = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 rounded-none bg-slate-50 border border-slate-100 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport Intelligence</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Passport Number</p><p className="text-sm font-black text-slate-900">{emp?.passport_number || '—'}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nationality</p><p className="text-sm font-black text-slate-900">{emp?.nationality || '—'}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expiry</p><p className="text-sm font-black text-rose-600">{emp?.passport_expiry || '—'}</p></div>
          </div>
        </div>
        <div className="p-6 rounded-none bg-emerald-50/30 border border-emerald-100 space-y-4">
          <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Resident Visa Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Visa Type</p><p className="text-sm font-black text-slate-900">{emp?.visa_type || '—'}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sponsoring Entity</p><p className="text-sm font-black text-slate-900">{emp?.sponsoring_entity || '—'}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Visa Expiry</p><p className="text-sm font-black text-amber-600">{emp?.visa_expiry_date || '—'}</p></div>
          </div>
        </div>
        <div className="p-6 rounded-none bg-slate-50 border border-slate-100 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emirates ID</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ID Number</p><p className="text-sm font-black text-slate-900">{emp?.emirates_id_number || '—'}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expiry</p><p className="text-sm font-black text-rose-600">{emp?.emirates_id_expiry || '—'}</p></div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAttendance = () => {
    if (loadingTab && !attendance) return <Spinner />
    const s = attendance?.summary
    const records = attendance?.records || []
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { label: 'Present',  value: s?.present  ?? '—', color: 'emerald' },
            { label: 'Absent',   value: s?.absent   ?? '—', color: 'red' },
            { label: 'Late',     value: s?.late     ?? '—', color: 'amber' },
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
                { key: 'date',           label: 'DATE' },
                { key: 'check_in_time',  label: 'PUNCH IN',  render: v => <span className="font-bold text-slate-900">{v || '—'}</span> },
                { key: 'check_out_time', label: 'PUNCH OUT', render: v => <span className="font-bold text-slate-900">{v || '—'}</span> },
                { key: 'total_hours',    label: 'HOURS',     render: v => <Badge label={v ? `${v}h` : '—'} color="blue" variant="soft" className="font-black" /> },
                { key: 'status',         label: 'STATUS',    render: v => <Badge label={v} color={statusColor(v)} className="font-black text-[9px] tracking-widest" /> },
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
    const balances  = leave?.balances  || []
    const requests  = leave?.requests  || []
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
                { key: 'from_date',  label: 'FROM',  render: v => <span className="text-xs font-bold text-slate-900">{v}</span> },
                { key: 'to_date',    label: 'TO',    render: v => <span className="text-xs font-bold text-slate-900">{v}</span> },
                { key: 'total_days', label: 'DAYS',  render: v => <Badge label={`${v}d`} color="slate" variant="soft" className="font-black" /> },
                { key: 'status',     label: 'STATUS',render: v => <Badge label={v} color={statusColor(v)} className="font-black text-[9px] tracking-widest" /> },
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
    if (loadingTab && !performance) return <Spinner />
    const latest  = performance?.latest
    const reviews = performance?.reviews || []
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Intel</h2>
            {latest && <Badge label={latest.review_period} color="blue" className="text-[9px] font-black rounded-none" />}
          </div>
          {latest ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 rounded-none bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Latest Rating</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">{latest.overall_rating}</p>
                <p className="text-[10px] text-emerald-800 font-bold mt-2 bg-white/50 py-1 rounded-none px-4 inline-block uppercase">{latest.review_period}</p>
              </div>
              <div className="p-6 rounded-none bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Skill Ratings</p>
                {[
                  ['Work Quality',   latest.work_quality],
                  ['Productivity',   latest.productivity],
                  ['Communication',  latest.communication],
                  ['Teamwork',       latest.teamwork],
                  ['Leadership',     latest.leadership],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase">{label}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-2 w-4 rounded-none ${i <= (val || 0) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-none bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Review Date</p>
                <p className="text-lg font-black text-slate-900">{latest.review_date}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[120px]">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No completed reviews yet</p>
            </div>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Historical Performance Audits</h3>
            </div>
            <Table
              columns={[
                { key: 'review_period', label: 'CYCLE',    render: v => <span className="text-xs font-black text-slate-900">{v}</span> },
                { key: 'review_type',   label: 'TYPE',     render: v => <Badge label={v} color="slate" variant="soft" className="font-black text-[9px]" /> },
                { key: 'overall_rating',label: 'RATING',   render: v => <Badge label={v || '—'} color="green" className="font-black" /> },
                { key: 'reviewer_name', label: 'REVIEWER', render: v => <span className="text-xs font-bold text-slate-500">{v || '—'}</span> },
                { key: 'status',        label: 'STATUS',   render: v => <Badge label={v} color={statusColor(v)} variant="soft" className="font-black text-[9px]" /> },
              ]}
              data={reviews}
              pageSize={5}
            />
          </div>
        )}
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
      case 'overview':    return renderOverview()
      case 'personal':    return renderPersonal()
      case 'job':         return renderJob()
      case 'documents':   return renderDocuments()
      case 'visa':        return renderVisa()
      case 'attendance':  return renderAttendance()
      case 'leave':       return renderLeave()
      case 'performance': return renderPerformance()
      case 'assets':      return renderAssets()
      default:            return null
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
                  className={`inline-flex items-center gap-1.5 px-3 py-2 font-bold text-xs transition-all ${
                    isActive
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
                  className={`flex items-center gap-2.5 p-2 border cursor-pointer transition-all select-none ${
                    isChecked
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
    </div>
  )
}
