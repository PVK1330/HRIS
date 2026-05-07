import React, { useMemo, useState } from 'react'
import { 
  HiCalendar, 
  HiPlus, 
  HiEye, 
  HiCheck, 
  HiXMark, 
  HiTrash, 
  HiPencil, 
  HiDocumentArrowDown,
  HiShieldCheck,
  HiClock,
  HiUsers,
  HiGlobeAlt,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiBuildingOffice,
  HiArrowTrendingUp,
  HiExclamationTriangle,
  HiOutlineClipboardDocumentCheck
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { dashboardStats, employees } from '../../../data/mockData.js'

const selectClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all'
const textareaClass = 'w-full min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all shadow-inner'

const initialFormData = {
  employeeId: '',
  date: '',
  checkInTime: '',
  checkOutTime: '',
  workMode: '',
  status: '',
  overtimeHours: '',
  notes: '',
}

export default function Attendance() {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState('') 
  const [actionReason, setActionReason] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [bufferTime, setBufferTime] = useState('15')
  const [workHours, setWorkHours] = useState('09:00 - 18:00')
  const [penaltyRules, setPenaltyRules] = useState('3 late marks = 0.5 day cut')

  const deptOptions = useMemo(() => {
    const u = [...new Set(employees.map((e) => e.department))].sort()
    return [{ value: '', label: 'All departments' }, ...u.map((d) => ({ value: d, label: d }))]
  }, [])

  const rows = useMemo(() => {
    return employees.slice(0, 12).map((e, idx) => ({
      id: e.id,
      employee: e.name,
      empId: e.empId,
      department: e.department,
      status: idx % 2 === 0 ? 'Present' : idx % 3 === 0 ? 'Remote' : 'Late',
      checkIn: idx % 2 === 0 ? '08:55' : '09:18',
      checkOut: idx % 7 === 0 ? '' : (idx % 2 === 0 ? '18:00' : '17:45'),
      totalHours: idx % 7 === 0 ? '0.00' : (idx % 2 === 0 ? '9.08' : '8.45'),
      lateMinutes: idx % 3 === 0 ? 18 : 0,
      isLate: idx % 3 === 0,
      earlyDeparture: idx % 4 === 0,
      regularizationStatus: idx === 1 || idx === 3 ? 'Pending' : idx % 5 === 1 ? 'Approved' : 'N/A',
      missingClockOut: idx % 7 === 0,
      reason: idx === 1 ? 'Technical Glitch' : idx === 3 ? 'Client Visit' : '',
      date: '2024-05-06'
    }))
  }, [])

  const pendingRequests = useMemo(() => {
    return rows.filter(r => r.regularizationStatus === 'Pending')
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ = !q || r.employee.toLowerCase().includes(q.toLowerCase()) || r.empId.toLowerCase().includes(q.toLowerCase())
      const matchDept = !dept || r.department === dept
      const matchStatus = !statusFilter || r.status === statusFilter
      return matchQ && matchDept && matchStatus
    })
  }, [rows, q, dept, statusFilter])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (key) => (fileList) => {
    setFiles((prev) => ({ ...prev, [key]: fileList }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData(initialFormData)
    setFiles({})
  }

  const handleView = (record) => {
    setSelectedRecord(record)
    setViewModalOpen(true)
  }

  const handleApprove = (record) => {
    setSelectedRecord(record)
    setActionType('Approve')
    setActionModalOpen(true)
  }

  const handleReject = (record) => {
    setSelectedRecord(record)
    setActionType('Reject')
    setActionModalOpen(true)
  }

  const handleActionSubmit = (e) => {
    e.preventDefault()
    setActionModalOpen(false)
    setActionReason('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleCloseModal()
  }

  const columns = [
    {
      key: 'employee',
      label: 'Personnel',
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 shrink-0 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[10px] font-black text-[#0F766E] border border-[#0F766E]/20 shadow-sm">
            {row.employee.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none mb-1">{row.employee}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.empId}</div>
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Division' },
    {
      key: 'status',
      label: 'Presence',
      render: (v) => (
        <Badge
          label={v}
          variant="outline"
          color={v === 'Present' ? 'green' : v === 'Remote' ? 'blue' : 'orange'}
          className="font-black uppercase text-[9px] tracking-widest px-2.5"
        />
      )
    },
    { 
       key: 'timing', 
       label: 'Operational Shift',
       render: (_, row) => (
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <HiClock className="h-3 w-3 text-slate-400" />
                {row.checkIn} - {row.checkOut || '--:--'}
             </div>
             <div className="text-[9px] font-black text-[#0F766E] uppercase tracking-widest">{row.totalHours} Net Hours</div>
          </div>
       )
    },
    {
      key: 'alerts',
      label: 'Risk Markers',
      render: (_, row) => (
         <div className="flex gap-2">
            {row.isLate && <Badge label={`${row.lateMinutes}m Late`} color="orange" variant="soft" className="text-[9px] font-black" />}
            {row.missingClockOut && <Badge label="Missing Out" color="red" variant="soft" className="text-[9px] font-black" />}
            {row.earlyDeparture && <Badge label="Early Exit" color="rose" variant="soft" className="text-[9px] font-black" />}
            {!row.isLate && !row.missingClockOut && !row.earlyDeparture && <span className="text-xs text-slate-300 font-medium">Clear</span>}
         </div>
      )
    },
    {
      key: 'actions',
      label: 'Audit',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={HiEye}
            onClick={() => handleView(row)}
            className="text-slate-400 hover:text-[#0F766E]"
          />
        </div>
      )
    }
  ]

  const requestColumns = [
    {
      key: 'employee',
      label: 'Petitioner',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200">
             {row.employee.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-none mb-1">{row.employee}</div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{row.empId}</div>
          </div>
        </div>
      )
    },
    { key: 'date', label: 'Log Date', render: (v) => <span className="text-xs font-bold text-slate-600">{v}</span> },
    { key: 'reason', label: 'Justification', render: (v) => <span className="text-[10px] italic text-slate-500 font-medium">{v || 'N/A'}</span> },
    {
      key: 'actions',
      label: 'Audit Decision',
      render: (_, row) => (
        <div className="flex gap-1.5">
          <Button
            label="Approve"
            variant="ghost"
            size="sm"
            onClick={() => handleApprove(row)}
            className="text-[10px] font-black text-emerald-600 hover:bg-emerald-50 uppercase"
          />
          <Button
            label="Reject"
            variant="ghost"
            size="sm"
            onClick={() => handleReject(row)}
            className="text-[10px] font-black text-rose-600 hover:bg-rose-50 uppercase"
          />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
              <HiClock className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Workforce Presence Intelligence</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Attendance & Timesheet Control</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed font-medium">
               Holistic workforce presence tracking. Monitor operational shifts, audit regularization requests, and manage organizational time policies.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
             <button 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
             >
                <HiPlus className="h-4 w-4" /> Manual Punch
             </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-4">
        <StatCard title="In Office" value={dashboardStats.todayInOffice} subtitle="Current Physical Presence" color="blue" icon={HiBuildingOffice} />
        <StatCard title="Remote" value={dashboardStats.todayRemote} subtitle="Digital Workspace Activity" color="emerald" icon={HiGlobeAlt} />
        <StatCard title="Late Marks" value="12" subtitle="Policy Threshold Violations" color="orange" icon={HiClock} />
        <StatCard title="Missing Punches" value="3" subtitle="Action Required (Audit)" color="rose" icon={HiExclamationTriangle} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar: Policy & Filters */}
        <div className="xl:col-span-1 space-y-6">
           <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-slate-800 mb-2">
                 <HiOutlineClipboardDocumentCheck className="h-5 w-5 text-[#0F766E]" />
                 <span className="text-xs font-bold uppercase tracking-widest">Policy Configuration</span>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grace Period (Min)</label>
                    <input 
                       type="text" 
                       value={bufferTime} 
                       onChange={e => setBufferTime(e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Work Shift</label>
                    <input 
                       type="text" 
                       value={workHours} 
                       onChange={e => setWorkHours(e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Late Penalty Rule</label>
                    <input 
                       type="text" 
                       value={penaltyRules} 
                       onChange={e => setPenaltyRules(e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none"
                    />
                 </div>
              </div>
           </div>

           <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-slate-800 mb-2">
                 <HiAdjustmentsHorizontal className="h-5 w-5 text-[#0F766E]" />
                 <span className="text-xs font-bold uppercase tracking-widest">Global Filters</span>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel Search</label>
                 <div className="relative mt-1.5">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       type="text" 
                       placeholder="Name or ID..." 
                       value={q}
                       onChange={e => setQ(e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none"
                    />
                 </div>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                 <select 
                    value={dept} 
                    onChange={e => setDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none"
                 >
                    {deptOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
              </div>

              <button 
                 onClick={() => { setQ(''); setDept(''); setStatusFilter('') }}
                 className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] border border-dashed border-slate-200 rounded-xl hover:border-red-200 transition-all"
              >
                 Reset Workspace
              </button>
           </div>
        </div>

        {/* Main Workspace */}
        <div className="xl:col-span-3 space-y-8">
           {/* Daily Snapshot */}
           <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                       <HiArrowPath className="h-5 w-5" />
                    </div>
                    <div>
                       <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">Attendance Log Snapshot</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time presence tracking</p>
                    </div>
                 </div>
                 <Badge label={`${filtered.length} ACTIVE`} variant="outline" color="blue" className="font-black text-[9px]" />
              </div>
              <Table columns={columns} data={filtered} pageSize={8} />
           </div>

           {/* Pending Requests */}
           <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg">
                       <HiExclamationTriangle className="h-5 w-5" />
                    </div>
                    <div>
                       <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">Regularization Queue</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pending administrative review</p>
                    </div>
                 </div>
                 <Badge label={`${pendingRequests.length} PENDING`} color="orange" className="font-black text-[9px]" />
              </div>
              <Table columns={requestColumns} data={pendingRequests} pageSize={5} />
           </div>

           {/* Bottom Intelligence Grid */}
           <div className="grid gap-8 lg:grid-cols-2">
              {/* Calendar View */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                       <HiCalendar className="h-5 w-5 text-[#0F766E]" /> Attendance Heatmap
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">May 2026</span>
                 </div>
                 <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                       <div key={d} className="text-[10px] font-black text-slate-300 text-center uppercase pb-2">{d}</div>
                    ))}
                    {[...Array(30)].map((_, i) => (
                       <div key={i} className={`aspect-square rounded-lg border flex items-center justify-center text-[11px] font-bold ${i % 7 === 0 || i % 7 === 6 ? 'bg-slate-50 text-slate-300 border-slate-100' : i % 5 === 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                          {i + 1}
                       </div>
                    ))}
                 </div>
                 <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-emerald-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Healthy</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-rose-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deviation</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-slate-200" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weekend</span></div>
                 </div>
              </div>

              {/* Overtime Analysis */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                       <HiArrowTrendingUp className="h-5 w-5 text-[#0F766E]" /> Overtime Intelligence
                    </h3>
                    <Badge label="Operational Focus" color="blue" variant="outline" className="text-[9px] font-black" />
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total OT Accumulated</p>
                          <p className="text-2xl font-black text-slate-900">42.5 <span className="text-xs text-slate-400 font-bold uppercase ml-1">Hours</span></p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Est. Liability</p>
                          <p className="text-lg font-black text-slate-900">$4,250.00</p>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[65%]" />
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold text-slate-800 leading-none">High OT Alert</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">12 Employees exceeding weekly limits.</p>
                       </div>
                       <Button label="Audit Payout" variant="primary" size="sm" className="rounded-lg shadow-lg shadow-emerald-900/10" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Manual Punch Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Initialize Manual Punch" size="xl">
        <form onSubmit={handleSubmit} className="space-y-8 pt-4 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Contributor Profile</h3>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Select</label>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleFormChange}
                      className={selectClass}
                      required
                    >
                      <option value="">Select Talent...</option>
                      {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.empId})</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shift Date</label>
                       <input type="date" name="date" value={formData.date} onChange={handleFormChange} className={selectClass} required />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Mode</label>
                       <select name="workMode" value={formData.workMode} onChange={handleFormChange} className={selectClass} required>
                          <option value="">Select...</option>
                          <option value="In Office">In Office</option>
                          <option value="Remote">Remote</option>
                          <option value="Field">Field</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Timing & Classification</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punch In</label>
                       <input type="time" name="checkInTime" value={formData.checkInTime} onChange={handleFormChange} className={selectClass} required />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punch Out</label>
                       <input type="time" name="checkOutTime" value={formData.checkOutTime} onChange={handleFormChange} className={selectClass} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Audit</label>
                       <select name="status" value={formData.status} onChange={handleFormChange} className={selectClass} required>
                          <option value="">Select...</option>
                          <option value="Present">Present</option>
                          <option value="Half Day">Half Day</option>
                          <option value="Late">Late Mark</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OT Hours</label>
                       <input type="number" name="overtimeHours" value={formData.overtimeHours} onChange={handleFormChange} className={selectClass} placeholder="0" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Remarks</label>
                 <textarea name="notes" value={formData.notes} onChange={handleFormChange} className={textareaClass} placeholder="Internal justification for manual entry..." />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compliance Proof (Attachment)</label>
                 <FileUpload onChange={handleFileChange('attachment')} />
              </div>
           </div>

           <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Button type="submit" label="INITIALIZE RECORD" variant="primary" className="flex-1 py-4 shadow-xl shadow-emerald-900/20" />
              <Button type="button" label="CANCEL" variant="ghost" onClick={handleCloseModal} className="flex-1 py-4 font-black text-slate-400" />
           </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {selectedRecord && (
        <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Attendance Analysis" size="md">
          <div className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="bg-[#0F766E] p-6 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black text-white border border-white/20 backdrop-blur-md">
                  {selectedRecord.employee.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-none mb-1">{selectedRecord.employee}</h3>
                  <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">{selectedRecord.empId} • {selectedRecord.department}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Entry</p>
                <p className="text-lg font-black text-slate-900">{selectedRecord.checkIn}</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Exit</p>
                <p className="text-lg font-black text-slate-900">{selectedRecord.checkOut || '--:--'}</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 bg-emerald-50/30">
                <p className="text-[9px] font-black text-[#0F766E] uppercase tracking-widest mb-1">Net Productivity</p>
                <p className="text-lg font-black text-[#0F766E]">{selectedRecord.totalHours}h</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Status</p>
                <Badge label={selectedRecord.status} color={selectedRecord.status === 'Present' ? 'green' : 'orange'} className="mt-1" />
              </div>
            </div>

            {selectedRecord.lateMinutes > 0 && (
               <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Policy Deviation</p>
                     <p className="text-xs font-bold text-rose-600 mt-1">Late Arrival Identified</p>
                  </div>
                  <Badge label={`${selectedRecord.lateMinutes}m`} color="red" className="font-black" />
               </div>
            )}

            <Button label="CLOSE ANALYSIS" variant="ghost" onClick={() => setViewModalOpen(false)} className="w-full py-4 font-black text-slate-400 text-xs" />
          </div>
        </Modal>
      )}

      {/* Decision Modal */}
      {selectedRecord && (
        <Modal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} title={`Audit Decision: ${actionType}`} size="md">
          <form onSubmit={handleActionSubmit} className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className={`p-6 rounded-2xl border ${actionType === 'Approve' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <p className={`text-xs font-black uppercase tracking-tight ${actionType === 'Approve' ? 'text-emerald-800' : 'text-rose-800'}`}>
                Confirming {actionType.toLowerCase()}al for regularization request.
              </p>
              <p className="text-sm font-bold text-slate-600 mt-2">Subject: {selectedRecord.employee} ({selectedRecord.date})</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Remarks</label>
              <textarea
                className={textareaClass}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Briefly state the reason for this decision..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" label="CANCEL" variant="ghost" onClick={() => setActionModalOpen(false)} className="flex-1 font-black text-xs" />
              <Button
                type="submit"
                label={`CONFIRM ${actionType.toUpperCase()}`}
                variant="primary"
                className={`flex-1 shadow-lg shadow-${actionType === 'Approve' ? 'emerald' : 'rose'}-900/20`}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
