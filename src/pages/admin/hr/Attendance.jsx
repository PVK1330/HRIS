import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import FileUpload from '../../../components/ui/FileUpload.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { dashboardStats, employees } from '../../../data/mockData.js'

const selectClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

const textareaClass =
  'w-full min-h-[88px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#004CA5]'

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
  const [actionType, setActionType] = useState('') // 'Approve' or 'Reject'
  const [actionReason, setActionReason] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [files, setFiles] = useState({})
  const [activeRole, setActiveRole] = useState('Admin') // For role-based simulation
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

  const resetModal = () => {
    setFormData(initialFormData)
    setFiles({})
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    resetModal()
  }

  const handleView = (record) => {
    setSelectedRecord(record)
    setViewModalOpen(true)
  }

  const handleRegularize = (record) => {
    setSelectedRecord(record)
    setRegModalOpen(true)
  }

  const handleReject = (record) => {
    setSelectedRecord(record)
    setActionType('Reject')
    setActionModalOpen(true)
  }

  const handleApprove = (record) => {
    setSelectedRecord(record)
    setActionType('Approve')
    setActionModalOpen(true)
  }

  const handleActionSubmit = (e) => {
    e.preventDefault()
    console.log(`${actionType}ed with reason: ${actionReason}`)
    setActionModalOpen(false)
    setActionReason('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ formData, files })
    handleCloseModal()
  }

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-500">{row.empId}</div>
        </div>
      ),
    },
    { key: 'department', label: 'Department' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge
          label={v}
          color={v === 'Present' ? 'green' : v === 'Remote' ? 'blue' : 'orange'}
        />
      ),
    },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'checkOut', label: 'Check-out' },
    { key: 'totalHours', label: 'Total Hours' },
    {
      key: 'lateMinutes',
      label: 'Late Min',
      render: (v) => (v > 0 ? <span className="text-red-600 font-medium">{v}m</span> : <span className="text-gray-400">-</span>),
    },
    {
      key: 'missingClockOut',
      label: 'Missing Punch',
      render: (v) => (v ? <Badge label="Missing" color="red" /> : <span className="text-gray-400">-</span>),
    },
    {
      key: 'earlyDeparture',
      label: 'Early Departure',
      render: (v) => (v ? <Badge label="Early" color="orange" /> : <span className="text-gray-500">No</span>),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleView(row)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  const requestColumns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-500">{row.empId}</div>
        </div>
      ),
    },
    { key: 'date', label: 'Date' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'actions',
      label: 'List with Approve/Reject',
      render: (_, row) => (
        <div className="flex gap-1">
          <button 
            onClick={() => handleApprove(row)}
            className="px-2.5 py-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all uppercase tracking-tight"
          >
            Approve
          </button>
          <button 
            onClick={() => handleReject(row)}
            className="px-2.5 py-1.5 text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-all uppercase tracking-tight"
          >
            Reject
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Attendance & Timesheet - Admin View</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Manage workforce presence, policy compliance, and regularization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button label="Manual Punch" variant="primary" onClick={() => setModalOpen(true)} className="rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="In Office" value={dashboardStats.todayInOffice} subtitle="Currently working" color="blue" />
        <StatCard title="Remote" value={dashboardStats.todayRemote} subtitle="Home/Field" color="emerald" />
        <StatCard title="Late Marks" value="12" subtitle="Threshold check" color="orange" />
        <StatCard title="Missing Clock-outs" value="3" subtitle="Action required" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Attendance Policy Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <span className="text-xs font-medium text-slate-600">Set Buffer Time (Minutes)</span>
              <input 
                type="text" 
                value={bufferTime} 
                onChange={(e) => setBufferTime(e.target.value)} 
                className="w-16 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-emerald-500" 
              />
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <span className="text-xs font-medium text-slate-600">Define Work Hours</span>
              <input 
                type="text" 
                value={workHours} 
                onChange={(e) => setWorkHours(e.target.value)} 
                className="w-32 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-emerald-500" 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Set Late Penalty Rules</span>
              <input 
                type="text" 
                value={penaltyRules} 
                onChange={(e) => setPenaltyRules(e.target.value)} 
                className="w-48 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-emerald-500" 
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col justify-center">
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Compliance Indicators</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Late threshold: {bufferTime} min grace allowed.
            </li>
            <li className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Missing clock-outs flagged for immediate regularization.
            </li>
            <li className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Standard payroll shift: {workHours}.
            </li>
          </ul>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-end bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex-1 w-full">
          <label className="mb-1 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search</label>
          <input 
            type="text"
            placeholder="Name or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md py-2 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="w-full lg:w-48">
          <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
          <select 
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
          >
            {deptOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-48">
          <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Remote">Remote</option>
            <option value="Late">Late Mark</option>
          </select>
        </div>

        <button 
          onClick={() => { setQ(''); setDept(''); setStatusFilter('') }}
          className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
          title="Reset Filters"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Daily Attendance Snapshot</h2>
          <div className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">Showing {filtered.length} logs</div>
        </div>
        <Table columns={columns} data={filtered} pageSize={5} />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Pending Regularization Requests</h2>
          <Badge label={`${pendingRequests.length} Pending`} color="orange" />
        </div>
        <Table columns={requestColumns} data={pendingRequests} pageSize={5} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Attendance Calendar</h2>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-semibold text-gray-500 pb-2">{d}</div>
            ))}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`flex h-10 items-center justify-center rounded-md border ${
                  i % 7 === 0 || i % 7 === 6
                    ? 'bg-gray-100 text-gray-400 border-gray-200'
                    : i % 5 === 0
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-green-50 text-green-600 border-green-100'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-50 border border-green-200" />
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-50 border border-red-200" />
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-100 border border-gray-200" />
              <span className="text-gray-600">Weekend</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Overtime Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <span className="text-sm text-gray-700">Total Overtime This Month</span>
              <span className="font-bold text-gray-900 text-lg">42.5 hours</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <span className="text-sm text-gray-700">Employees with Overtime</span>
              <span className="font-bold text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Pending Approvals</span>
              <Badge label="5 Pending" color="orange" />
            </div>
            <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
               <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Est. Overtime Payout</p>
                    <p className="text-xl font-black text-emerald-900">$4,250.00</p>
                  </div>
                  <Button label="Audit Payout" variant="primary" size="sm" className="rounded-md" />
               </div>
            </div>
          </div>
        </div>
      </div>


      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Mark Attendance" size="xl" showClose={true}>
        <form onSubmit={handleSubmit} className="w-full pr-1">
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0">
            Attendance record
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 w-full sm:col-span-1">
              <label htmlFor="att-employee" className="mb-1 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="att-employee"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select employee
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.empId})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Check In Time"
              name="checkInTime"
              type="time"
              value={formData.checkInTime}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Check Out Time"
              name="checkOutTime"
              type="time"
              value={formData.checkOutTime}
              onChange={handleFormChange}
            />
            <div className="w-full">
              <label htmlFor="att-work-mode" className="mb-1 block text-sm font-medium text-gray-700">
                Work Mode
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="att-work-mode"
                name="workMode"
                value={formData.workMode}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select work mode
                </option>
                <option value="In Office">In Office</option>
                <option value="Remote">Remote</option>
                <option value="Field">Field</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="att-status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
                <span className="text-red-500"> *</span>
              </label>
              <select
                id="att-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className={selectClass}
                required
              >
                <option value="" disabled hidden>
                  Select status
                </option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <Input
              label="Overtime Hours"
              name="overtimeHours"
              type="number"
              placeholder="0"
              value={formData.overtimeHours}
              onChange={handleFormChange}
            />
          </div>
          <div className="mt-3 w-full">
            <label htmlFor="att-notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="att-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className={textareaClass}
              rows={3}
            />
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Supporting document
          </p>
          <FileUpload
            label="Attachment"
            name="attachment"
            accept=".jpg,.png,.pdf"
            onChange={handleFileChange('attachment')}
            helpText="e.g. WFH approval email"
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button type="submit" label="Save Record" variant="primary" className="rounded-lg shadow-lg shadow-emerald-100" />
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {selectedRecord && (
        <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Attendance Details" size="md">
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                {selectedRecord.employee.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedRecord.employee}</h3>
                <p className="text-[10px] text-slate-500 font-medium">{selectedRecord.empId} • {selectedRecord.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Check-in</p>
                <p className="text-base font-black text-slate-900">{selectedRecord.checkIn}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Check-out</p>
                <p className="text-base font-black text-slate-900">{selectedRecord.checkOut || '--:--'}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Work Hours</p>
                <p className="text-base font-black text-emerald-600">{selectedRecord.totalHours}h</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                <Badge label={selectedRecord.status} color={selectedRecord.status === 'Present' ? 'green' : 'orange'} />
              </div>
            </div>

            {selectedRecord.lateMinutes > 0 && (
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-800">Late Arrival</p>
                  <p className="text-[9px] text-amber-600 font-medium italic">Threshold exceeded</p>
                </div>
                <span className="text-base font-black text-amber-700">{selectedRecord.lateMinutes}m</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button label="Close" variant="secondary" size="sm" onClick={() => setViewModalOpen(false)} />
            </div>
          </div>
        </Modal>
      )}

      {/* Regularization Modal */}
      {selectedRecord && (
        <Modal isOpen={regModalOpen} onClose={() => setRegModalOpen(false)} title="Submit Regularization" size="lg">
          <div className="space-y-6 pt-2">
            <div className="p-4 rounded-lg bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl" />
              <h3 className="relative z-10 text-sm font-bold uppercase tracking-widest text-emerald-400">Policy Context</h3>
              <p className="relative z-10 text-sm text-slate-300 mt-2 leading-relaxed">
                Regularization is required for late marks exceeding 10 minutes or missing clock-outs. Repeated instances (&gt;3) may impact payroll.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-bold text-slate-700">Reason for Regularization</label>
                <select className={selectClass}>
                  <option>Technical Issue (App/Portal)</option>
                  <option>Client Meeting / External Work</option>
                  <option>Personal Emergency</option>
                  <option>Transport / Traffic Delay</option>
                  <option>Internet / Power Outage (Remote)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-bold text-slate-700">Detailed Explanation</label>
                <textarea className={textareaClass} placeholder="Provide specific details for the approver..." />
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supporting Proof (Optional)</p>
                <FileUpload label="Attach Evidence" onChange={() => {}} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button label="Cancel" variant="ghost" onClick={() => setRegModalOpen(false)} />
              <Button label="Submit Request" variant="primary" onClick={() => setRegModalOpen(false)} className="rounded-lg shadow-lg shadow-emerald-100" />
            </div>
          </div>
        </Modal>
      )}

      {/* Action Modal (Approve/Reject) */}
      {selectedRecord && (
        <Modal 
          isOpen={actionModalOpen} 
          onClose={() => setActionModalOpen(false)} 
          title={`${actionType} Regularization`} 
          size="md"
        >
          <form onSubmit={handleActionSubmit} className="space-y-4 pt-2">
            <div className={`p-4 rounded-lg border ${actionType === 'Approve' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <p className={`text-xs font-bold ${actionType === 'Approve' ? 'text-emerald-800' : 'text-rose-800'}`}>
                You are about to {actionType.toLowerCase()} the regularization for {selectedRecord.employee}.
              </p>
            </div>
            
            <div>
              <label className="mb-1 block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Reason / Remarks
              </label>
              <textarea 
                className={textareaClass} 
                required 
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Provide a reason for ${actionType.toLowerCase()}al...`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" label="Cancel" variant="ghost" onClick={() => setActionModalOpen(false)} />
              <Button 
                type="submit" 
                label={`Confirm ${actionType}`} 
                variant="primary" 
                className={`rounded-lg shadow-lg ${actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`} 
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
