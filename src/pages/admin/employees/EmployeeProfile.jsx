import { useEffect, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  getEmployeeProfile, getAttendance, getLeave,
  getDocuments, getPerformance, getAssets,
} from '../../../services/employeeProfileService.js'
import { listEmployees } from '../../../services/employeeService.js'
import {
  HiUser, HiIdentification, HiBriefcase, HiDocumentText, HiCreditCard,
  HiClock, HiCalendar, HiChartBar, HiArchiveBox, HiEllipsisVertical,
  HiCheckCircle, HiExclamationCircle, HiNoSymbol, HiArrowUpCircle,
  HiBolt, HiPrinter, HiPencilSquare, HiArrowPath,
} from 'react-icons/hi2'

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
  const [performance, setPerformance] = useState(null)
  const [assets,      setAssets]      = useState(null)

  const [loadingProfile,     setLoadingProfile]     = useState(false)
  const [loadingTab,         setLoadingTab]         = useState(false)
  const [loadingList,        setLoadingList]        = useState(true)

  const isHrAdmin = currentUser?.role === 'hr_admin' || currentUser?.role === 'admin'

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
          case 'documents':
            if (!documents) setDocuments(await getDocuments(selectedId))
            break
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Latest Rating"  value={performance?.latest?.overall_rating || '—'} subtitle="Last Review"    color="emerald" icon={HiChartBar} />
        <StatCard title="Leave Balance"  value={leave?.balances?.find(b => b.leave_type === 'Annual Leave')?.remaining ?? '—'} subtitle="Annual Days Left" color="blue" icon={HiCalendar} />
        <StatCard title="Attendance"     value={attendance?.summary ? `${Math.round((attendance.summary.present / (attendance.summary.total_days || 1)) * 100)}%` : '—'} subtitle="This Month" color="indigo" icon={HiClock} />
        <StatCard title="Assets"         value={assets?.counts?.active ?? '—'} subtitle="Assigned Items" color="amber" icon={HiArchiveBox} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Identity</h3>
            <Badge label={emp?.employment_status || 'Active'} color={statusColor(emp?.employment_status)} variant="soft" className="text-[8px] font-black rounded-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="p-4 rounded-none bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Manager</p>
                <p className="text-sm font-bold text-slate-900">{emp?.manager_name || '—'}</p>
              </div>
              <div className="p-4 rounded-none bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Center / Dept</p>
                <p className="text-sm font-bold text-slate-900">{emp?.cost_center || emp?.department || '—'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-none bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hired Date</p>
                <p className="text-sm font-bold text-slate-900">{emp?.join_date || '—'}</p>
              </div>
              <div className="p-4 rounded-none bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment Type</p>
                <p className="text-sm font-bold text-slate-900">{emp?.employment_type || '—'}</p>
              </div>
            </div>
          </div>
          {isHrAdmin && (
            <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-slate-100">
              <Button label="PROMOTE"  variant="primary" size="sm" icon={HiArrowUpCircle}    className="text-[10px] font-black tracking-widest" />
              <Button label="SUSPEND"  variant="outline" size="sm" icon={HiExclamationCircle} className="text-[10px] font-black tracking-widest border-amber-200 text-amber-600 hover:bg-amber-50" />
              <Button label="OFFBOARD" variant="outline" size="sm" icon={HiNoSymbol}          className="text-[10px] font-black tracking-widest border-rose-200 text-rose-600 hover:bg-rose-50" />
            </div>
          )}
        </div>
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Career Evolution</h3>
          <div className="space-y-4 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100" />
            {emp?.career_history ? (
              emp.career_history.split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={`h-5 w-5 rounded-full border-4 border-white shadow-sm z-10 ${i === 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-tight flex-1 pb-1">{line}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-8">No career history recorded</p>
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
    if (loadingTab && !documents) return <Spinner />
    const docs = documents?.documents || []
    return (
      <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Document Compliance Registry</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{docs.length} document(s) on file</p>
          </div>
          {isHrAdmin && <Button label="UPLOAD NEW" variant="primary" size="sm" icon={HiArrowUpCircle} className="text-[10px] font-black tracking-widest" />}
        </div>
        {docs.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No documents on file</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        <HiDocumentText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-xs">{doc.document_title}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{doc.document_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={doc.status} color={statusColor(doc.status)} variant="outline" className="font-black text-[9px] tracking-widest" />
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{doc.expiry_date || '—'}</td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 font-medium italic">{doc.notes || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer"><Button label="VIEW" variant="ghost" size="sm" className="text-[9px] font-black text-[#0F766E] uppercase" /></a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
      {/* Top Title Bar with Breadcrumbs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Employee Profile Portal</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Employees</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">360° Profile Audit</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar
                initials={initials}
                size="xl"
                className="ring-4 ring-white/20 shadow-2xl rounded-none"
              />
              {emp && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-none bg-emerald-400 border-2 border-white flex items-center justify-center">
                  <HiCheckCircle className="h-4 w-4 text-[#0F766E]" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <HiIdentification className="h-4 w-4 shrink-0 text-emerald-200" aria-hidden />
                <span className="text-xs font-semibold tracking-wide text-emerald-100/90">Employee profile</span>
              </div>
              {loadingProfile ? (
                <div className="h-8 w-48 bg-white/10 rounded-none animate-pulse" />
              ) : (
                <>
                  <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">
                    {emp?.full_name || 'Select Employee'}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <p className="text-emerald-100/70 text-sm font-medium">
                      <span className="text-white font-bold">{emp?.emp_id}</span>
                      {emp?.job_title && ` • ${emp.job_title}`}
                    </p>
                    {emp?.department && (
                      <Badge label={emp.department} color="white" variant="soft" className="text-[8px] bg-white/10 text-white font-black px-2 rounded-none" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-64">
              <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1.5 ml-1">Switch Employee</p>
              {loadingList ? (
                <div className="h-10 w-full bg-white/10 rounded-none animate-pulse" />
              ) : (
                <select
                  value={selectedId || ''}
                  onChange={e => setSelectedId(Number(e.target.value))}
                  className="w-full rounded-none bg-white/10 backdrop-blur-md border border-white/20 p-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
                >
                  {employeeList.map(e => (
                    <option key={e.id} value={e.id} className="text-slate-900">
                      {e.full_name} ({e.emp_id})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-none bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white shadow-sm">
                <HiPrinter className="h-5 w-5" />
              </button>
              <button className="p-3 rounded-none bg-emerald-400 hover:bg-emerald-300 transition-all text-[#0F766E] shadow-sm">
                <HiEllipsisVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Horizontal tabs — standardized layout border framing */}
      <div className="rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 min-w-0">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium sm:gap-x-6 min-w-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 border-b-2 pb-2.5 pt-0.5 transition-colors ${
                    isActive
                      ? 'border-[#0F766E] text-[#0F766E]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-right text-xs text-slate-500">
            <HiClock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span>
              <span className="font-medium text-slate-400">Updated </span>
              <span className="font-semibold text-slate-700">{emp?.updatedAt || '—'}</span>
            </span>
          </div>
        </div>
        <div className="min-w-0 p-4 sm:p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}
