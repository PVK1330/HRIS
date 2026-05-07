import { useMemo, useState } from 'react'
import { 
  HiUserPlus, 
  HiClipboardDocumentCheck, 
  HiShieldCheck, 
  HiClock, 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiCheckBadge,
  HiXCircle,
  HiUserGroup,
  HiCpuChip,
  HiBriefcase,
  HiUserCircle,
  HiPlus,
  HiEye
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees } from '../../../data/mockData.js'

export default function Onboarding() {
  const [q, setQ] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedHire, setSelectedHire] = useState(null)

  const onboardData = [
    { id: '321', name: 'Ananya', dept: 'HR', joinDate: '10/01/2026', status: 'In Progress', progress: '4/5', manager: 'Sarah Johnson' },
    { id: '322', name: 'Rahul', dept: 'IT', joinDate: '15/01/2026', status: 'Pending', progress: '1/5', manager: 'Amit Patel' },
    { id: '323', name: 'Sneha', dept: 'Design', joinDate: '05/01/2026', status: 'Completed', progress: '5/5', manager: 'Michael Brown' },
    { id: '324', name: 'Vikram', dept: 'Sales', joinDate: '12/01/2026', status: 'In Progress', progress: '2/5', manager: 'Priya Singh' }
  ]

  const stats = {
    newHires: 12,
    inProgress: 8,
    pending: 3,
    completed: 25
  }

  const filtered = useMemo(() => {
    let data = onboardData
    if (activeStatus !== 'All') {
      data = data.filter(h => h.status === activeStatus)
    }
    if (q) {
      data = data.filter(h => h.name.toLowerCase().includes(q.toLowerCase()) || h.id.includes(q))
    }
    return data
  }, [q, activeStatus])

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E] font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'id', label: 'ID' },
    { key: 'dept', label: 'Department' },
    { key: 'joinDate', label: 'Joining Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Completed' ? 'green' : v === 'In Progress' ? 'blue' : 'orange'} variant="outline" />,
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-[#0F766E]" 
              style={{ width: `${(parseInt(v.split('/')[0]) / parseInt(v.split('/')[1])) * 100}%` }} 
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{v}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button 
          label="View" 
          variant="ghost" 
          size="sm" 
          icon={HiEye} 
          onClick={() => {
            setSelectedHire(row)
            setViewModalOpen(true)
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Onboarding Management</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Orchestrate the perfect welcome. Track multi-role checklists and monitor new hire integration progress.
            </p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
          >
            <HiPlus className="h-4 w-4" /> Initialize Onboarding
          </button>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Onboarding Status</p>
          {[
            { label: 'All', count: stats.newHires, icon: HiUserGroup, color: 'slate' },
            { label: 'In Progress', count: stats.inProgress, icon: HiClock, color: 'blue' },
            { label: 'Pending', count: stats.pending, icon: HiXCircle, color: 'orange' },
            { label: 'Completed', count: stats.completed, icon: HiCheckBadge, color: 'emerald' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveStatus(item.label)}
              className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all hover:scale-[1.02] active:scale-95 ${
                activeStatus === item.label 
                ? 'border-[#0F766E] bg-emerald-50/50 shadow-md ring-1 ring-[#0F766E]' 
                : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-700">{item.label === 'All' ? 'New Hires/ month' : `Onboarding ${item.label}`}</div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-tight">Clickable-opens filtered list</div>
                </div>
              </div>
              <div className={`text-lg font-black ${activeStatus === item.label ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                {item.count}
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Registry</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name, ID, DEPT, MANAGER..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <Button label="FILTER" icon={HiAdjustmentsHorizontal} variant="ghost" className="h-[46px] border border-slate-200" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
             <div className="bg-[#0F766E] px-6 py-3 text-white">
                <div className="flex items-center justify-between">
                   <h2 className="text-sm font-bold uppercase tracking-wider">Onboarding Registry</h2>
                   <HiUserGroup className="h-4 w-4 opacity-50" />
                </div>
             </div>
             <Table columns={columns} data={filtered} pageSize={8} />
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="ONBOARDING – ADMIN VIEW" size="xl">
        <div className="animate-in fade-in duration-500 space-y-8">
          {/* Top Bar Info */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 -mx-6 px-6 py-4 mb-6">
             <div className="flex items-center gap-6">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Name</p>
                   <p className="font-bold text-slate-900">{selectedHire?.name}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</p>
                   <p className="font-bold text-slate-900">{selectedHire?.id}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                   <p className="font-bold text-slate-900">{selectedHire?.dept}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporting Manager</p>
                   <p className="font-bold text-slate-900">{selectedHire?.manager}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 px-2">
             <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Joining Date:</p>
                <p className="text-sm text-slate-500">{selectedHire?.joinDate}</p>
             </div>
             <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Onboarding status:</p>
                <Badge label={selectedHire?.status} color={selectedHire?.status === 'Completed' ? 'green' : 'blue'} variant="outline" />
             </div>
          </div>

          {/* Categorized Tasks */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-2">
             {/* HR Tasks */}
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                   <HiClipboardDocumentCheck className="h-4 w-4 text-[#0F766E]" /> HR Tasks
                </h4>
                <div className="space-y-3">
                   {['Offer letter issued', 'Policy acknowledgement', 'Document verification'].map((task, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                         <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" defaultChecked={i < 2} />
                         <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{task}</span>
                      </label>
                   ))}
                </div>
             </div>

             {/* IT Tasks */}
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                   <HiCpuChip className="h-4 w-4 text-[#0F766E]" /> IT Tasks
                </h4>
                <div className="space-y-3">
                   {['Email created', 'Laptop issued'].map((task, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                         <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" defaultChecked={i === 0} />
                         <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{task}</span>
                      </label>
                   ))}
                </div>
             </div>

             {/* Manager Tasks */}
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                   <HiBriefcase className="h-4 w-4 text-[#0F766E]" /> Manager Tasks
                </h4>
                <div className="space-y-3">
                   {['Induction session', 'Team introduction'].map((task, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                         <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
                         <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{task}</span>
                      </label>
                   ))}
                </div>
             </div>

             {/* Employee Tasks */}
             <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                   <HiUserCircle className="h-4 w-4 text-[#0F766E]" /> Employee Tasks
                </h4>
                <div className="space-y-3">
                   {['Upload documents', 'Accept policies'].map((task, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group">
                         <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" defaultChecked={i === 0} />
                         <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{task}</span>
                      </label>
                   ))}
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-center gap-4">
             <Button label="SAVE CHANGES" variant="primary" className="px-10 shadow-lg shadow-emerald-900/20" />
             <Button label="NOTIFY TEAM" variant="secondary" icon={HiClock} />
             <Button label="CANCEL" variant="ghost" onClick={() => setViewModalOpen(false)} />
          </div>
        </div>
      </Modal>

      {/* Initialize Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Initialize New Onboarding" size="lg">
         <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
               <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Select Employee</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all">
                     <option value="" disabled hidden>Select from Directory</option>
                     {employees.map(e => <option key={e.id}>{e.name} ({e.empId})</option>)}
                  </select>
               </div>
               <div className="w-full">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Joining Date</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all" />
               </div>
               <div className="w-full">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Department</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all">
                     <option>HR</option>
                     <option>IT</option>
                     <option>Engineering</option>
                     <option>Sales</option>
                  </select>
               </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
               <Button type="button" label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
               <Button label="Initialize Onboarding" variant="primary" className="px-8 shadow-lg shadow-emerald-900/20" icon={HiPlus} />
            </div>
         </form>
      </Modal>
    </div>
  )
}
