import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees, leaveRequests } from '../../../data/mockData.js'
import { HiCalendar, HiPlus, HiEye, HiCheck, HiXMark, HiTrash, HiPencil, HiDocumentArrowDown } from 'react-icons/hi2'

const selectClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500'
const textareaClass = 'w-full min-h-[88px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500'

// --- Mock Data Extensions for Demo ---
const mockHolidays = [
  { id: 1, name: 'New Year', date: '2026-01-01', day: 'Thursday', country: 'Global', type: 'Public', status: 'Active' },
  { id: 2, name: 'Eid al-Fitr', date: '2026-03-31', day: 'Tuesday', country: 'UAE', type: 'Religious', status: 'Active' },
  { id: 3, name: 'Company Anniversary', date: '2026-06-15', day: 'Monday', country: 'Internal', type: 'Company', status: 'Active' },
]

const mockBalances = employees.map(emp => ({
  id: emp.id,
  name: emp.name,
  empId: emp.empId,
  dept: emp.department,
  jobTitle: emp.jobTitle,
  annual: 30,
  sick: 10,
  casual: 5,
  unpaid: 0,
  comp: 2,
  used: 12,
  remaining: 35
}))

export default function LeaveAbsence() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('requests') // 'requests', 'balances', 'holidays'
  const [q, setQ] = useState('')

  // Modals
  const [holidayModalOpen, setHolidayModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionReason, setActionReason] = useState('')

  // --- Calculations ---
  const pendingRequests = useMemo(() => leaveRequests.filter(r => r.status === 'Pending'), [])
  const approvedRequests = useMemo(() => leaveRequests.filter(r => r.status === 'Approved'), [])
  const rejectedRequests = useMemo(() => leaveRequests.filter(r => r.status === 'Rejected'), [])

  // --- Handlers ---
  const handleAction = (req, type) => {
    setSelectedRequest(req)
    setActionType(type)
    setActionModalOpen(true)
  }

  const openEmployeeDetails = (emp) => {
    setSelectedEmployee(emp)
    setDetailModalOpen(true)
  }

  // --- Column Definitions ---

  // 1. Pending Requests
  const pendingColumns = [
    { key: 'employee', label: 'Name' },
    { key: 'empId', label: 'ID', render: (_, r) => <span className="text-xs font-bold text-slate-400">{r.empId || 'E001'}</span> },
    { key: 'dept', label: 'Dept', render: () => <span className="text-xs">Operations</span> },
    { key: 'type', label: 'Leave Type' },
    { key: 'range', label: 'Date Range', render: (_, r) => <span className="text-xs font-bold">{r.from} - {r.to}</span> },
    { key: 'days', label: 'Total Days', render: (v) => <Badge label={`${v} Days`} color="blue" /> },
    { key: 'doc', label: 'Doc', render: (_, r) => r.type === 'Sick Leave' ? <HiDocumentArrowDown className="h-5 w-5 text-emerald-600 cursor-pointer" /> : '—' },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-[10px] italic text-slate-500 truncate block max-w-[100px]">{v}</span> },
    {
      key: 'actions',
      label: 'Approve/Reject',
      render: (_, r) => (
        <div className="flex gap-1">
          <button onClick={() => handleAction(r, 'Approve')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100"><HiCheck className="h-4 w-4" /></button>
          <button onClick={() => handleAction(r, 'Reject')} className="p-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100"><HiXMark className="h-4 w-4" /></button>
        </div>
      )
    }
  ]

  // 2. Approved Requests
  const approvedColumns = [
    { key: 'employee', label: 'Name' },
    { key: 'type', label: 'Leave Type' },
    { key: 'approvedDate', label: 'Approved Date', render: () => <span className="text-xs">2026-05-01</span> },
    { key: 'range', label: 'Date Range', render: (_, r) => <span className="text-xs font-bold">{r.from} - {r.to}</span> },
    { key: 'days', label: 'Total Days', render: (v) => <span className="text-xs font-black">{v}</span> },
    { key: 'approvedBy', label: 'Approved By', render: () => <span className="text-xs font-bold text-emerald-700 underline">HR Admin</span> },
    { key: 'download', label: 'Dwnld Doc', render: () => <HiDocumentArrowDown className="h-5 w-5 text-slate-400 hover:text-emerald-600 cursor-pointer" /> }
  ]

  // 3. Rejected Requests
  const rejectedColumns = [
    { key: 'employee', label: 'Name' },
    { key: 'range', label: 'Date Range', render: (_, r) => <span className="text-xs font-bold">{r.from} - {r.to}</span> },
    { key: 'type', label: 'Leave Type' },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-[10px] text-rose-600 italic font-bold">{v || 'Policy Violation'}</span> },
    { key: 'rejectedBy', label: 'Rejected By', render: () => <span className="text-xs font-bold text-rose-700 underline">Dept Manager</span> }
  ]

  // 4. Balance Summary
  const balanceColumns = [
    { key: 'name', label: 'Name', render: (v, r) => <div className="font-bold text-slate-900">{v}</div> },
    { key: 'dept', label: 'Dept' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'annual', label: 'Annual', render: (v) => <span className="font-black text-blue-600">{v}</span> },
    { key: 'sick', label: 'Sick', render: (v) => <span className="font-black text-emerald-600">{v}</span> },
    { key: 'casual', label: 'Casual', render: (v) => <span className="font-black text-amber-600">{v}</span> },
    { key: 'unpaid', label: 'Unpaid', render: (v) => <span className="font-black text-rose-600">{v}</span> },
    { key: 'comp', label: 'Comp', render: (v) => <span className="font-black text-indigo-600">{v}</span> },
    { key: 'used', label: 'Total Used', render: (v) => <Badge label={v} color="slate" /> },
    { key: 'remaining', label: 'Remaining', render: (v) => <Badge label={v} color="emerald" /> },
    {
      key: 'actions',
      label: 'View Details',
      render: (_, r) => (
        <button onClick={() => openEmployeeDetails(r)} className="text-emerald-600 hover:underline font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
          <HiEye className="h-3.5 w-3.5" /> Details
        </button>
      )
    }
  ]

  // 5. Holiday Setup
  const holidayColumns = [
    { key: 'name', label: 'Holiday Name', render: (v) => <span className="font-bold text-slate-900">{v}</span> },
    { key: 'date', label: 'Date', render: (v) => <span className="text-xs font-black">{v}</span> },
    { key: 'day', label: 'Day' },
    { key: 'country', label: 'Country' },
    { key: 'type', label: 'Holiday Type', render: (v) => <Badge label={v} color={v === 'Public' ? 'blue' : v === 'Religious' ? 'purple' : 'emerald'} /> },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v} color="green" /> },
    {
      key: 'actions',
      label: 'Edit/Delete',
      render: () => (
        <div className="flex gap-2">
          <HiPencil className="h-4 w-4 text-slate-400 hover:text-emerald-600 cursor-pointer" />
          <HiTrash className="h-4 w-4 text-slate-400 hover:text-rose-600 cursor-pointer" />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Header Area */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm ring-1 ring-slate-900/5">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <HiCalendar className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Absence Management</span>
          </div>
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">Leave & Absence – Admin View</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Holistic workforce presence tracking and policy compliance.</p>
        </div>
        <div className="flex gap-2">
          <Button label="Public Holiday Setup" variant="outline" onClick={() => setActiveTab('holidays')} className="rounded-md border-slate-200" />
          <Button label="Add Leave Request" variant="primary" icon={HiPlus} className="rounded-md shadow-lg shadow-emerald-100" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'requests' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Approval Workflow
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'balances' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Balance Summary
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'holidays' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Holiday Calendar
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'requests' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Pending Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-amber-500 rounded-full" />
              <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight">Pending Requests</h2>
              <Badge label={pendingRequests.length} color="orange" />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm ring-1 ring-slate-900/5">
              <Table columns={pendingColumns} data={pendingRequests} pageSize={5} />
            </div>
          </div>

          {/* Approved Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-emerald-500 rounded-full" />
              <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight">Approved History</h2>
              <Badge label={approvedRequests.length} color="emerald" />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm ring-1 ring-slate-900/5">
              <Table columns={approvedColumns} data={approvedRequests} pageSize={5} />
            </div>
          </div>

          {/* Rejected Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-rose-500 rounded-full" />
              <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight">Rejected Records</h2>
              <Badge label={rejectedRequests.length} color="rose" />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm ring-1 ring-slate-900/5">
              <Table columns={rejectedColumns} data={rejectedRequests} pageSize={5} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight">Employee Leave Balance Summary</h2>
            <div className="relative w-64">
              <input type="text" placeholder="Search employee..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500" />
              <div className="absolute left-3 top-2.5 text-slate-400">🔍</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm ring-1 ring-slate-900/5">
            <Table columns={balanceColumns} data={mockBalances} pageSize={10} />
          </div>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-slate-900 uppercase tracking-tight">Public Holiday Setup</h2>
            <Button label="Add New Holiday" variant="primary" icon={HiPlus} onClick={() => setHolidayModalOpen(true)} className="rounded-md" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-2 shadow-sm ring-1 ring-slate-900/5">
              <Table columns={holidayColumns} data={mockHolidays} pageSize={10} />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm ring-1 ring-slate-900/5 h-fit">
              <h3 className="font-bold text-slate-900 mb-4">Calendar View Preview</h3>
              <div className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6">
                <HiCalendar className="h-12 w-12 text-slate-300 mb-2" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interactive Calendar Engine</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Highlighting holidays for 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modals --- */}

      {/* Holiday Modal */}
      <Modal isOpen={holidayModalOpen} onClose={() => setHolidayModalOpen(false)} title="Register New Holiday" size="md">
        <form className="space-y-4 pt-2">
          <Input label="Holiday Name" placeholder="e.g. Eid al-Adha" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" required />
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select className={selectClass}>
                <option>Public Holiday</option>
                <option>Company Holiday</option>
                <option>Religious Holiday</option>
              </select>
            </div>
          </div>
          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700">Applicable To</label>
            <select className={selectClass}>
              <option>All Employees</option>
              <option>Specific Location</option>
              <option>Specific Department</option>
            </select>
          </div>
          <div className="flex gap-4 p-3 bg-slate-50 rounded-md border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Is Paid Holiday?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Recurring Yearly?</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button label="Cancel" variant="secondary" className="flex-1" onClick={() => setHolidayModalOpen(false)} />
            <Button label="Add Holiday" variant="primary" className="flex-1" />
          </div>
        </form>
      </Modal>

      {/* Employee Detail Modal */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Employee Leave Summary" size="xl">
        {selectedEmployee && (
          <div className="space-y-6 pt-2 overflow-y-auto max-h-[75vh] pr-2">
            {/* Summary Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Identity Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-2xl border border-emerald-200">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">{selectedEmployee.name}</div>
                    <div className="text-xs font-bold text-slate-500">{selectedEmployee.empId} • {selectedEmployee.jobTitle}</div>
                    <div className="mt-1 flex gap-2">
                      <Badge label={selectedEmployee.dept} color="blue" />
                      <Badge label="Active" color="green" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Accrual Rules</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Accrual Rate</span>
                    <span className="text-slate-900">2.5 Days / Month</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Carry Forward Limit</span>
                    <span className="text-slate-900">10 Days</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Probation Period</span>
                    <span className="text-slate-900">3 Months (Cleared)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Balance Table */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-tight">Current Leave Balance</h3>
              <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Leave Type</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Entitlement</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Carry Forward</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Used</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Pending</th>
                      <th className="px-4 py-3 font-black text-emerald-700 uppercase tracking-tight bg-emerald-50/50">Current Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[
                      { type: 'Annual Leave', entitlement: 30, carry: 5, used: 10, pending: 2, balance: 23 },
                      { type: 'Sick Leave', entitlement: 10, carry: 0, used: 2, pending: 0, balance: 8 },
                      { type: 'Casual Leave', entitlement: 5, carry: 0, used: 0, pending: 1, balance: 4 },
                    ].map((row) => (
                      <tr key={row.type} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{row.type}</td>
                        <td className="px-4 py-3 text-slate-600">{row.entitlement}</td>
                        <td className="px-4 py-3 text-slate-600">{row.carry}</td>
                        <td className="px-4 py-3 text-rose-600 font-bold">{row.used}</td>
                        <td className="px-4 py-3 text-amber-600 font-bold">{row.pending}</td>
                        <td className="px-4 py-3 bg-emerald-50/30 text-emerald-700 font-black text-sm">{row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* History Table */}
            <div className="space-y-3">
              <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-tight">Absence History</h3>
              <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Type</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Date Range</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight text-center">Total Days</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Status</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Reason</th>
                      <th className="px-4 py-3 font-black text-slate-600 uppercase tracking-tight">Attach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[
                      { type: 'Annual', range: '2026-04-10 - 2026-04-15', days: 5, status: 'Approved', reason: 'Family Visit' },
                      { type: 'Sick', range: '2026-03-02 - 2026-03-03', days: 2, status: 'Approved', reason: 'Medical emergency' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{row.type}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{row.range}</td>
                        <td className="px-4 py-3 text-slate-900 font-black text-center">{row.days}</td>
                        <td className="px-4 py-3">
                          <Badge label={row.status} color="green" />
                        </td>
                        <td className="px-4 py-3 text-slate-500 italic">{row.reason}</td>
                        <td className="px-4 py-3"><HiDocumentArrowDown className="h-5 w-5 text-slate-400 cursor-pointer" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button label="Add Leave Adjustment" variant="primary" icon={HiPlus} className="rounded-md flex-1" />
              <Button label="Deduct Leave balance" variant="outline" className="rounded-md border-rose-200 text-rose-600 hover:bg-rose-50 flex-1" />
              <Button label="Write Compliance Note" variant="secondary" className="rounded-md flex-1" />
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal (Approve/Reject) */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Audit Decision: ${actionType}`}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); setActionModalOpen(false) }} className="space-y-4 pt-2">
          <div className={`p-4 rounded-md border ${actionType === 'Approve' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <p className={`text-xs font-bold ${actionType === 'Approve' ? 'text-emerald-800' : 'text-rose-800'}`}>
              Confirming decision for {selectedRequest?.employee}'s {selectedRequest?.type}.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Process Remarks</label>
            <textarea className={textareaClass} placeholder="Reason for this decision..." required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button label="Cancel" variant="secondary" className="flex-1" onClick={() => setActionModalOpen(false)} />
            <Button
              type="submit"
              label={`Confirm ${actionType}`}
              variant="primary"
              className={`flex-1 shadow-lg ${actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
