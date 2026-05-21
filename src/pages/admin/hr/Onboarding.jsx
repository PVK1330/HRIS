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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] text-sm font-bold shadow-sm">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.name}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
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
        <button
          onClick={() => {
            setSelectedHire(row)
            setViewModalOpen(true)
          }}
          className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-slate-300 transition-all shadow-sm"
          title="View"
        >
          <HiEye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Standardized */}
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
            <HiPlus className="h-4 w-4" /> Initialize Onboarding
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL NEW HIRES', count: stats.newHires, icon: HiUserPlus, bgColor: 'bg-slate-900', status: 'All' },
          { label: 'IN PROGRESS', count: stats.inProgress, icon: HiClock, bgColor: 'bg-[#3B82F6]', status: 'In Progress' },
          { label: 'GOVERNANCE PENDING', count: stats.pending, icon: HiXCircle, bgColor: 'bg-[#F59E0B]', status: 'Pending' },
          { label: 'PROTOCOL COMPLETED', count: stats.completed, icon: HiCheckBadge, bgColor: 'bg-[#10B981]', status: 'Completed' }
        ].map((card, idx) => {
          const isActive = activeStatus === card.status;
          return (
            <button
              key={idx}
              onClick={() => setActiveStatus(card.status)}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActive
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
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
          );
        })}
      </div>

      {/* Main Content Workspace Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
        <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
          <h2 className="text-sm font-semibold uppercase tracking-wider truncate">Lifecycle Registry</h2>
          <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">Security Level: Admin</div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID or manager..."
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
            {q || activeStatus !== 'All' ? (
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setActiveStatus('All');
                }}
                className="h-10 px-4 rounded-none border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
      </div>

      {/* View Details Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="LIFECYCLE ASSET AUDIT" size="xl">
        <div className="animate-in fade-in duration-500 space-y-10">
          {/* Top Bar Info — Standardized Audit Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 -mx-6 px-8 py-6 mb-8">
             <div className="flex flex-wrap items-center gap-12">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Nomenclature</p>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedHire?.name}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset ID</p>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedHire?.id}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Dept</p>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedHire?.dept}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Governance Lead</p>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedHire?.manager}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inception Date</p>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{selectedHire?.joinDate}</p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</p>
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-none ${selectedHire?.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                   <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{selectedHire?.status}</span>
                </div>
             </div>
          </div>

          {/* Categorized Tasks — High Contrast Audit Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-2">
             {/* HR Tasks */}
             <div className="space-y-6">
                <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                   <HiClipboardDocumentCheck className="h-5 w-5 text-[#0F766E]" /> Governance Protocols (HR)
                </h4>
                <div className="space-y-4">
                   {['Offer letter issued', 'Policy acknowledgement', 'Document verification'].map((task, i) => (
                      <label key={i} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E]/30 cursor-pointer transition-all">
                         <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{task}</span>
                         <input type="checkbox" className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-0 focus:ring-offset-0" defaultChecked={i < 2} />
                      </label>
                   ))}
                </div>
             </div>

             {/* IT Tasks */}
             <div className="space-y-6">
                <h4 className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                   <HiCpuChip className="h-5 w-5 text-[#0F766E]" /> Infrastructure Provisions (IT)
                </h4>
                <div className="space-y-4">
                   {['Email Account Provisioning', 'Hardware Allocation'].map((task, i) => (
                      <label key={i} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#0F766E]/30 cursor-pointer transition-all">
                         <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{task}</span>
                         <input type="checkbox" className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-0 focus:ring-offset-0" defaultChecked={i === 0} />
                      </label>
                   ))}
                </div>
             </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex justify-end gap-4 px-2">
             <button onClick={() => setViewModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                CANCEL
             </button>
             <button className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#0F766E] hover:bg-emerald-50 transition-colors">
                DISPATCH NOTIFICATION
             </button>
             <button className="h-12 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10">
                COMMIT AUDIT
             </button>
          </div>
        </div>
      </Modal>      {/* Initialize Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="GOVERNANCE INITIALIZATION" size="lg">
         <form className="space-y-8 p-2">
            <div className="space-y-6">
               <div>
                  <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Selection</label>
                  <select className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all cursor-pointer">
                     <option value="" disabled hidden>SELECT FROM DIRECTORY</option>
                     {employees.map(e => <option key={e.id}>{e.name} — {e.empId}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="w-full">
                     <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inception Date</label>
                     <input type="date" className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black focus:border-[#0F766E] focus:bg-white outline-none transition-all" />
                  </div>
                  <div className="w-full">
                     <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Dept</label>
                     <select className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all cursor-pointer">
                        <option>OPERATIONS</option>
                        <option>TECHNOLOGY</option>
                        <option>ENGINEERING</option>
                        <option>GOVERNANCE</option>
                     </select>
                  </div>
               </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
               <button type="button" onClick={() => setModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                  CANCEL
               </button>
               <button type="submit" className="h-12 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10">
                  INITIALIZE PROTOCOL
               </button>
            </div>
         </form>
      </Modal>
    </div>
  )
}
