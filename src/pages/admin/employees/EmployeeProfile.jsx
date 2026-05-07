import { useCallback, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Avatar } from '../../../components/ui/Avatar.jsx'
import { employeeProfileEvents, employees } from '../../../data/mockData.js'
import { useAuth } from '../../../context/AuthContext.jsx'
import {
  HiUser, HiIdentification, HiBriefcase, HiDocumentText, HiCreditCard,
  HiClock, HiCalendar, HiChartBar, HiArchiveBox, HiEllipsisVertical,
  HiCheckCircle, HiExclamationCircle, HiNoSymbol, HiArrowUpCircle,
  HiArrowPath, HiBolt, HiPrinter, HiPencilSquare
} from 'react-icons/hi2'

const TABS = [
  { id: 'overview', label: 'Overview', icon: HiUser },
  { id: 'personal', label: 'Personal Information', icon: HiIdentification },
  { id: 'job', label: 'Job & Organization', icon: HiBriefcase },
  { id: 'documents', label: 'Documents', icon: HiDocumentText },
  { id: 'visa', label: 'Visa & Nationality', icon: HiCreditCard },
  { id: 'attendance', label: 'Attendance & Timesheet', icon: HiClock },
  { id: 'leave', label: 'Leave', icon: HiCalendar },
  { id: 'performance', label: 'Performance', icon: HiChartBar },
  { id: 'assets', label: 'Assets', icon: HiArchiveBox },
]

export default function EmployeeProfile() {
  const { user: currentUser } = useAuth()
  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)

  const selected = employees.find((e) => e.id === selectedId) ?? employees[0]
  const isHrAdmin = currentUser?.role === 'hr_admin'

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Overall Rating" value="4.5" subtitle="Last Review Cycle" color="emerald" icon={HiChartBar} />
              <StatCard title="Leave Balance" value="22" subtitle="Available Days" color="blue" icon={HiCalendar} />
              <StatCard title="Attendance" value="98%" subtitle="Last 30 Days" color="indigo" icon={HiClock} />
              <StatCard title="Assets" value="3" subtitle="Assigned Items" color="amber" icon={HiArchiveBox} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Primary Info Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Identity</h3>
                    <Badge label="ACTIVE STATUS" color="green" variant="soft" className="text-[8px] font-black" />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Manager</p>
                        <p className="text-sm font-bold text-slate-900">{selected.manager}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Center / Dept</p>
                        <p className="text-sm font-bold text-slate-900">{selected.department}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hired Date</p>
                        <p className="text-sm font-bold text-slate-900">Jan 15, 2024</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Identity Type</p>
                        <p className="text-sm font-bold text-slate-900">Full-time Regular</p>
                      </div>
                    </div>
                  </div>

                  {isHrAdmin && (
                    <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                      <Button label="PROMOTE" variant="primary" size="sm" icon={HiArrowUpCircle} className="text-[10px] font-black tracking-widest" />
                      <Button label="SUSPEND" variant="outline" size="sm" icon={HiExclamationCircle} className="text-[10px] font-black tracking-widest border-amber-200 text-amber-600 hover:bg-amber-50" />
                      <Button label="OFFBOARD" variant="outline" size="sm" icon={HiNoSymbol} className="text-[10px] font-black tracking-widest border-rose-200 text-rose-600 hover:bg-rose-50" />
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent HR Lifecycle Events</h3>
                    <HiBolt className="h-4 w-4 text-amber-500" />
                  </div>
                  <Table
                    columns={[
                      { key: 'date', label: 'TIMESTAMP', render: (v) => <span className="text-[10px] font-bold text-slate-500">{v}</span> },
                      { key: 'event', label: 'ACTIVITY', render: (v) => <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{v}</span> },
                      { key: 'owner', label: 'AUDITOR', render: (v) => <Badge label={v} color="slate" variant="soft" className="text-[9px]" /> },
                    ]}
                    data={employeeProfileEvents}
                    pageSize={3}
                  />
                </div>
              </div>

              {/* Career Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Career Evolution</h3>
                <div className="space-y-6 relative">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100" />
                  {[
                    { date: 'Jan 15, 2024', event: 'Identity Created: Senior Software Engineer', type: 'Onboarding' },
                    { date: 'July 10, 2024', event: 'Probation Clearance: Performance Confirmed', type: 'Milestone' },
                    { date: 'Dec 20, 2024', event: 'Merit Award: Employee of the Month', type: 'Recognition' },
                    { date: 'Mar 05, 2025', event: 'Internal Transfer: Tech Lead Operations', type: 'Mobility' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`h-5 w-5 rounded-full border-4 border-white shadow-sm z-10 ${i === 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className="flex-1 pb-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-tight">{item.event}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.date} • {item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'personal':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personal Identity</h2>
                <p className="text-xs text-slate-400 font-medium">Core personal records and emergency contacts</p>
              </div>
              {isHrAdmin && <Button label="UPDATE RECORDS" variant="outline" size="sm" icon={HiPencilSquare} className="text-[10px] font-black tracking-widest" />}
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-900">May 12, 1992</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender Identity</p>
                  <p className="text-sm font-bold text-slate-900">Male</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Email</p>
                  <p className="text-sm font-bold text-slate-900">john.doe.personal@gmail.com</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Phone</p>
                  <p className="text-sm font-bold text-slate-900">{selected.phone}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Emergency Contact</h3>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contact Personnel</p>
                    <p className="text-sm font-bold text-slate-900">Jane Doe (Spouse)</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Emergency Phone</p>
                    <p className="text-sm font-bold text-[#0F766E]">+971 50 123 4567</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marital Status</p>
                  <p className="text-sm font-bold text-slate-900">Married</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dependents</p>
                  <p className="text-sm font-bold text-slate-900">2 (Spouse, Child)</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'job':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Job & Organization</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                  <p className="text-sm font-black text-slate-900">{selected.jobTitle}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Division / Dept</p>
                  <p className="text-sm font-black text-slate-900">{selected.department}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Work Location</p>
                  <p className="text-sm font-black text-slate-900">{selected.location}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20">
                  <p className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest mb-1">Reporting Structure</p>
                  <p className="text-sm font-black text-slate-900">{selected.manager}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment Classification</p>
                  <p className="text-sm font-black text-slate-900">Full-time Regular (Corporate)</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Organizational Grade</p>
                  <p className="text-sm font-black text-slate-900">L5 - Senior Management</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'documents':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Document Compliance Registry</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verification Status & Checklist</p>
              </div>
              <Button label="UPLOAD NEW" variant="primary" size="sm" icon={HiArrowUpCircle} className="text-[10px] font-black tracking-widest" />
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Identification</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Remarks</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Passport Copy', status: 'Submitted', comment: 'Audit Verified' },
                  { name: 'National ID Card', status: 'Submitted', comment: 'Audit Verified' },
                  { name: 'Academic Certifications', status: 'Pending', comment: 'Missing Scan' },
                  { name: 'Employment Contract', status: 'Submitted', comment: 'Final Signature' },
                  { name: 'Previous Experience', status: 'Rejected', comment: 'Legibility Issues' },
                ].map((doc, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          <HiDocumentText className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        label={doc.status}
                        color={doc.status === 'Submitted' ? 'green' : doc.status === 'Rejected' ? 'red' : 'orange'}
                        variant="outline"
                        className="font-black text-[9px] tracking-widest"
                      />
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500 font-medium italic">{doc.comment}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button label="PREVIEW" variant="ghost" size="sm" className="text-[9px] font-black text-[#0F766E] uppercase" />
                        <Button label="REPLACE" variant="ghost" size="sm" className="text-[9px] font-black text-slate-400 uppercase" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'visa':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Visa & Nationality</h2>
                <p className="text-xs text-slate-400 font-medium">Legal stay and identity documentation</p>
              </div>
              <Badge label="COMPLIANCE SECURED" color="green" className="text-[10px] font-black px-4" />
            </div>
            <div className="grid gap-10 md:grid-cols-2">
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport Intelligence</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Passport Number</p>
                      <p className="text-sm font-black text-slate-900 uppercase">P12345678</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nationality</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{selected.nationality}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expiry Audit</p>
                      <p className="text-sm font-black text-rose-600">Jan 01, 2030</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-4">
                  <h3 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest">Resident Visa Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Visa ID</p>
                      <p className="text-sm font-black text-slate-900 uppercase">V987654321</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Category</p>
                      <p className="text-sm font-black text-slate-900 uppercase">Employment</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Renewal Deadline</p>
                      <p className="text-sm font-black text-amber-600">Jan 01, 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'attendance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Attendance Workspace</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational presence logs</p>
                </div>
                <div className="flex gap-2">
                  <Button label="REGULARIZE" variant="outline" size="sm" className="text-[10px] font-black tracking-widest" />
                  <Button label="EXPORT DATA" variant="ghost" size="sm" icon={HiBolt} className="text-[10px] font-black tracking-widest" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center mb-6">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 flex items-center justify-center rounded-xl text-xs border border-transparent transition-all hover:border-slate-200 cursor-pointer ${i + 1 === 1 ? 'bg-emerald-500 text-white font-black shadow-lg shadow-emerald-100' :
                        i + 1 === 2 ? 'bg-amber-500 text-white font-black shadow-lg shadow-amber-100' :
                          i + 1 === 3 ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-100' :
                            'bg-slate-50 text-slate-400 font-bold'
                      }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Table
                columns={[
                  { key: 'date', label: 'DATE' },
                  { key: 'in', label: 'PUNCH IN', render: (v) => <span className="font-bold text-slate-900">{v}</span> },
                  { key: 'out', label: 'PUNCH OUT', render: (v) => <span className="font-bold text-slate-900">{v}</span> },
                  { key: 'hours', label: 'NET HOURS', render: (v) => <Badge label={v} color="blue" variant="soft" className="font-black" /> },
                  { key: 'status', label: 'AUDIT STATUS', render: (v) => <Badge label={v} color={v === 'Present' ? 'green' : v === 'Late' ? 'orange' : 'red'} className="font-black text-[9px] tracking-widest" /> },
                ]}
                data={[
                  { date: 'May 01, 2026', in: '09:00 AM', out: '06:00 PM', hours: '9h 00m', status: 'Present' },
                  { date: 'May 02, 2026', in: '09:15 AM', out: '06:00 PM', hours: '8h 45m', status: 'Late' },
                  { date: 'May 03, 2026', in: '-', out: '-', hours: '0h 00m', status: 'Absent' },
                ]}
                pageSize={5}
              />
            </div>
          </div>
        )
      case 'leave':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { type: 'Annual Leave', balance: 22, color: 'emerald' },
                { type: 'Sick Leave', balance: 12, color: 'blue' },
                { type: 'Casual Leave', balance: 5, color: 'amber' },
                { type: 'Unpaid Leave', balance: 0, color: 'rose' },
              ].map((b, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{b.type}</p>
                  <p className={`text-2xl font-black text-${b.color}-600`}>{b.balance} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Days</span></p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Historical Absence Records</h3>
                <Button label="REQUEST LEAVE" variant="primary" size="sm" icon={HiCalendar} className="text-[10px] font-black tracking-widest" />
              </div>
              <Table
                columns={[
                  { key: 'type', label: 'LEAVE CATEGORY' },
                  { key: 'range', label: 'PERIOD', render: (v) => <span className="text-xs font-bold text-slate-900">{v}</span> },
                  { key: 'days', label: 'TOTAL DURATION', render: (v) => <Badge label={`${v} DAYS`} color="slate" variant="soft" className="font-black" /> },
                  { key: 'status', label: 'AUDIT STATUS', render: (v) => <Badge label={v} color="green" className="font-black text-[9px] tracking-widest" /> },
                  { key: 'actions', label: 'DOCS', render: () => <Button label="VIEW" variant="ghost" size="sm" className="text-[9px] font-black text-[#0F766E] uppercase" /> },
                ]}
                data={[
                  { type: 'Annual Leave', range: 'Apr 14 - Apr 18', days: 5, status: 'Approved' },
                  { type: 'Sick Leave', range: 'Mar 10 - Mar 11', days: 2, status: 'Approved' },
                ]}
                pageSize={5}
              />
            </div>
          </div>
        )
      case 'assets':
        return (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Organizational Assets Assigned</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hardware & Resource Inventory</p>
              </div>
              {isHrAdmin && <Button label="ASSIGN NEW ASSET" variant="primary" size="sm" className="text-[10px] font-black tracking-widest" />}
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Identification</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Inventory No</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Condition</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { id: 'AST-LP-001', type: 'MacBook Pro 16"', serial: 'SN-X98721', condition: 'Excellent', date: 'Jan 15, 2024', status: 'Issued' },
                  { id: 'AST-MN-002', type: 'UltraWide Monitor', serial: 'SN-M44552', condition: 'Excellent', date: 'Jan 15, 2024', status: 'Issued' },
                  { id: 'AST-AC-003', type: 'Secure Access Token', serial: 'AC-99011', condition: 'Standard', date: 'Jan 15, 2024', status: 'Active' },
                ].map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          <HiArchiveBox className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700">{asset.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{asset.type}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{asset.serial}</td>
                    <td className="px-6 py-4">
                      <Badge label={asset.condition} color="green" variant="soft" className="text-[9px] font-black" />
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={asset.status} color="emerald" className="text-[9px] font-black tracking-widest" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'performance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Intel</h2>
                <Badge label="ANNUAL CYCLE 2026" color="blue" className="text-[9px] font-black" />
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Latest Score</p>
                  <p className="text-4xl font-black text-emerald-600 mt-2">4.8 <span className="text-sm">/ 5</span></p>
                  <p className="text-[10px] text-emerald-800 font-bold mt-2 bg-white/50 py-1 rounded-full px-4 inline-block">EXCEEDS EXPECTATIONS</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Goal Completion</p>
                  <p className="text-4xl font-black text-slate-900 mt-2">85%</p>
                  <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 w-[85%]" />
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Review Frequency</p>
                  <p className="text-lg font-black text-slate-900 mt-5 uppercase">Quarterly</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Next: June 30</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Historical Performance Audits</h3>
              </div>
              <Table
                columns={[
                  { key: 'cycle', label: 'REVIEW CYCLE', render: (v) => <span className="text-xs font-black text-slate-900">{v}</span> },
                  { key: 'rating', label: 'RATING', render: (v) => <Badge label={v} color="green" className="font-black" /> },
                  { key: 'reviewer', label: 'AUDITOR', render: (v) => <span className="text-xs font-bold text-slate-500">{v}</span> },
                  { key: 'status', label: 'OUTCOME', render: (v) => <Badge label={v} color="slate" variant="soft" className="font-black" /> },
                ]}
                data={[
                  { cycle: '2025 Annual Review', rating: '4.5', reviewer: 'Michael Chen', status: 'Completed' },
                  { cycle: '2025 Mid-Year Audit', rating: '4.2', reviewer: 'Michael Chen', status: 'Completed' },
                ]}
                pageSize={5}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* SaaS Premium Hero Identity Portal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar name={selected.name} size="xl" className="ring-4 ring-white/20 shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                <HiCheckCircle className="h-4 w-4 text-[#0F766E]" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-100 mb-2">
                <HiIdentification className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Personnel Identity Profile</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">
                {selected.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <p className="text-emerald-100/70 text-sm font-medium">
                  <span className="text-white font-bold">{selected.empId}</span> • {selected.jobTitle}
                </p>
                <Badge label={selected.department} color="white" variant="soft" className="text-[8px] bg-white/10 text-white font-black px-2" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-64">
              <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1.5 ml-1">Switch Employee</p>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id} className="text-slate-900">{e.name} ({e.empId})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white shadow-lg">
                <HiPrinter className="h-5 w-5" />
              </button>
              <button className="p-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 transition-all text-[#0F766E] shadow-lg">
                <HiEllipsisVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sticky top-6">
            <div className="px-4 py-3 border-b border-slate-50 mb-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigator</h3>
            </div>
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all ${isActive
                        ? 'bg-[#0F766E] text-white shadow-lg shadow-emerald-900/10'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <HiClock className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Profile Integrity</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                Last updated on <span className="text-slate-900">May 05, 2026</span> by <span className="text-[#0F766E]">HR Audit Team</span>.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
