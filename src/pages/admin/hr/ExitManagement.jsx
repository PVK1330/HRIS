import { useMemo, useState } from 'react'
import { 
  HiUserMinus, 
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
  HiEye,
  HiArrowPathRoundedSquare,
  HiCurrencyDollar,
  HiDocumentText,
  HiChatBubbleLeftRight,
  HiDevicePhoneMobile
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees } from '../../../data/mockData.js'

export default function ExitManagement() {
  const [q, setQ] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedExit, setSelectedExit] = useState(null)
  const [activeTab, setActiveTab] = useState('Summary')

  const exitData = [
    { id: '28389174', name: 'Ananya Sharma', dept: 'HR', title: 'Admin Executive', type: 'Contract End', date: '23/12/2025', lwd: '23/12/2025', status: 'Pending Approval', manager: 'Sarah Johnson', joinDate: '01/01/2022', notice: '30 Days' },
    { id: '28389175', name: 'Rahul Verma', dept: 'IT', title: 'Senior Developer', type: 'Resignation', date: '15/01/2026', lwd: '15/02/2026', status: 'In Progress', manager: 'Amit Patel', joinDate: '15/06/2020', notice: '60 Days' },
    { id: '28389176', name: 'Sneha Kapoor', dept: 'Design', title: 'UI Lead', type: 'Resignation', date: '05/01/2026', lwd: '05/02/2026', status: 'Completed', manager: 'Michael Brown', joinDate: '10/03/2021', notice: '30 Days' },
    { id: '28389177', name: 'Vikram Singh', dept: 'Sales', title: 'Manager', type: 'Termination', date: '12/01/2026', lwd: '12/01/2026', status: 'Settlement Pending', manager: 'Priya Singh', joinDate: '20/11/2019', notice: '0 Days' }
  ]

  const stats = {
    exitsThisMonth: 8,
    pendingApprovals: 3,
    assetsPending: 5,
    pendingSettlements: 2
  }

  const filtered = useMemo(() => {
    let data = exitData
    if (activeStatus !== 'All') {
      data = data.filter(e => e.status === activeStatus)
    }
    if (q) {
      data = data.filter(e => e.name.toLowerCase().includes(q.toLowerCase()) || e.id.includes(q))
    }
    return data
  }, [q, activeStatus])

  const columns = [
    {
      key: 'name',
      label: 'Employee Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E] font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'id', label: 'Employee ID' },
    { key: 'dept', label: 'Department' },
    { key: 'type', label: 'Exit Type' },
    { key: 'lwd', label: 'Last Working Day' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={v === 'Completed' ? 'green' : v === 'Pending Approval' ? 'orange' : 'blue'} variant="outline" />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button 
          label="View Details" 
          variant="ghost" 
          size="sm" 
          icon={HiEye} 
          onClick={() => {
            setSelectedExit(row)
            setReviewModalOpen(true)
            setActiveTab('Summary')
          }}
        />
      ),
    },
  ]

  const tabs = [
    { id: 'Summary', icon: HiClipboardDocumentCheck },
    { id: 'Asset Return', icon: HiArrowPathRoundedSquare },
    { id: 'Checklist', icon: HiShieldCheck },
    { id: 'Settlement', icon: HiCurrencyDollar },
    { id: 'Documents', icon: HiDocumentText },
    { id: 'Interview', icon: HiChatBubbleLeftRight }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Top Title Bar — Standardized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Exit Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Human Capital</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600 uppercase font-black tracking-widest text-[10px]">Offboarding Governance</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
          >
            <HiPlus className="h-4 w-4" /> Initiate Exit
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 min-w-0">
        {[
          { id: 'All', label: 'TOTAL OFBOARDING', count: exitData.length, icon: HiUserGroup, bgColor: 'bg-slate-900' },
          { id: 'Pending Approval', label: 'GOVERNANCE PENDING', count: exitData.filter(e => e.status === 'Pending Approval').length, icon: HiClock, bgColor: 'bg-[#F59E0B]' },
          { id: 'In Progress', label: 'PROTOCOL ACTIVE', count: exitData.filter(e => e.status === 'In Progress').length, icon: HiArrowPathRoundedSquare, bgColor: 'bg-[#3B82F6]' },
          { id: 'Completed', label: 'OFFBOARDED', count: exitData.filter(e => e.status === 'Completed').length, icon: HiCheckBadge, bgColor: 'bg-[#10B981]' },
          { id: 'Settlement Pending', label: 'FINANCIAL SETTLEMENT', count: exitData.filter(e => e.status === 'Settlement Pending').length, icon: HiCurrencyDollar, bgColor: 'bg-[#EF4444]' }
        ].map((card, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStatus(card.id)}
            className={`flex items-center gap-3.5 rounded-none border p-4 shadow-sm min-w-0 transition-all ${
              activeStatus === card.id ? 'border-[#0F766E] bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Workspace Area */}
      <div className="space-y-6 min-w-0">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <div className="flex flex-col gap-6 md:flex-row md:items-end min-w-0">
            <div className="flex-1 min-w-0">
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 truncate">Security Filter</label>
              <div className="relative min-w-0">
                <HiMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="SEARCH BY ASSET NAME, IDENTIFIER OR PROTOCOL TYPE..."
                  className="w-full rounded-none border border-slate-200 bg-slate-50/50 h-12 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all min-w-0"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <button className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
               REFINE PROTOCOL
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
          <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
            <h2 className="text-sm font-semibold uppercase tracking-wider truncate">Offboarding Registry</h2>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">Clearance Status: Admin</div>
          </div>
          <Table columns={columns} data={filtered} pageSize={10} className="rounded-none" />
        </div>
      </div>

      {/* Review Exit Modal — Audit System */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="LIFECYCLE TERMINATION AUDIT" size="xl">
        <div className="animate-in fade-in duration-500 space-y-6">
          {/* Tabs Navigation — Minimalist */}
          <div className="flex flex-wrap items-center border-b border-slate-200 bg-slate-50 -mx-6 px-6">
             {tabs.map((tab) => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2 ${
                      activeTab === tab.id 
                      ? 'border-[#0F766E] text-[#0F766E] bg-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                   }`}
                >
                   <tab.icon className="h-4 w-4" /> {tab.id}
                </button>
             ))}
          </div>

          <div className="min-h-[450px]">
             {activeTab === 'Summary' && (
                <div className="grid gap-10 lg:grid-cols-2 p-2">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest border-l-4 border-[#0F766E] pl-3 mb-6">Asset & Governance Context</h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-none border border-slate-100 p-6 bg-slate-50/50">
                         {[
                           { label: 'Asset Name', value: selectedExit?.name },
                           { label: 'Asset ID', value: selectedExit?.id },
                           { label: 'Operational Dept', value: selectedExit?.dept },
                           { label: 'Governance Lead', value: selectedExit?.manager },
                           { label: 'Protocol Type', value: selectedExit?.type },
                           { label: 'Notice Period', value: selectedExit?.notice },
                           { label: 'Designation', value: selectedExit?.title },
                           { label: 'Inception Date', value: selectedExit?.joinDate },
                           { label: 'Termination Date', value: selectedExit?.lwd },
                           { label: 'Audit Status', value: selectedExit?.status }
                         ].map(item => (
                            <div key={item.label}>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                               <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.value}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest border-l-4 border-[#0F766E] pl-3 mb-6">Administrative Remarks</h4>
                      <textarea 
                         className="w-full rounded-none border border-slate-200 bg-white p-5 text-sm font-medium text-slate-800 focus:border-[#0F766E] outline-none min-h-[280px] shadow-sm transition-all"
                         placeholder="ENTER DETAILED ADMINISTRATIVE REMARKS..."
                      />
                   </div>
                </div>
             )}

             {activeTab === 'Asset Return' && (
                <div className="space-y-8 p-2">
                   <div className="overflow-hidden rounded-none border border-slate-200 shadow-sm">
                      <table className="w-full text-left">
                         <thead className="bg-slate-900 text-white">
                            <tr>
                               {['Classification', 'Identifier', 'Serial Vector', 'Provision Date', 'Recovery Date', 'Condition', 'Audit'].map(h => (
                                  <th key={h} className="px-5 py-4 font-black uppercase text-[9px] tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 bg-white">
                            {[
                              { type: 'Laptop Hardware', id: 'LP-902', serial: 'SN-00129', issued: '01/01/2022', return: '-', condition: 'Optimal', status: 'Pending' },
                              { type: 'Mobile Unit', id: 'MB-102', serial: 'IMEI-8821', issued: '01/01/2022', return: '20/12/2025', condition: 'Optimal', status: 'Recovered' },
                              { type: 'Access Protocol', id: 'AC-50', serial: 'RFID-11', issued: '01/01/2022', return: '-', condition: '-', status: 'Pending' }
                            ].map((asset, i) => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-5 py-4 text-[11px] font-black text-slate-900 uppercase">{asset.type}</td>
                                  <td className="px-5 py-4 text-[11px] font-bold text-slate-500">{asset.id}</td>
                                  <td className="px-5 py-4 text-[10px] font-mono text-slate-400">{asset.serial}</td>
                                  <td className="px-5 py-4 text-[10px] font-bold text-slate-500">{asset.issued}</td>
                                  <td className="px-5 py-4 text-[10px] font-bold text-slate-500">{asset.return}</td>
                                  <td className="px-5 py-4">
                                     <select className="bg-transparent border-none focus:ring-0 text-[10px] text-slate-900 font-black uppercase cursor-pointer">
                                        <option>OPTIMAL</option>
                                        <option>DEGRADED</option>
                                        <option>LOSS</option>
                                     </select>
                                  </td>
                                  <td className="px-5 py-4">
                                     <Badge label={asset.status.toUpperCase()} color={asset.status === 'Recovered' ? 'green' : 'orange'} className="rounded-none text-[8px] font-black tracking-widest" />
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}

             {activeTab === 'Checklist' && (
                <div className="grid gap-8 md:grid-cols-2 p-2">
                   {['Infrastructure Clearance', 'Fiscal Clearance', 'Governance Clearance', 'Operational Clearance'].map(title => (
                      <div key={title} className="rounded-none border border-slate-200 p-6 space-y-6 bg-white shadow-sm hover:border-[#0F766E]/30 transition-all">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">{title}</h4>
                         <div className="space-y-4">
                            {['System access revocation', 'Email archival protocols', 'Hardware verification audit'].map((item, i) => (
                               <label key={i} className="flex items-center justify-between p-3 border border-slate-50 bg-slate-50/30 cursor-pointer group transition-all hover:bg-white hover:border-[#0F766E]/20">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-900">{item}</span>
                                  <input type="checkbox" className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-0 focus:ring-offset-0" />
                               </label>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
             <button onClick={() => setReviewModalOpen(false)} className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                CANCEL
             </button>
             <button className="h-12 px-10 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all shadow-xl shadow-emerald-900/10">
                COMMIT AUDIT UPDATES
             </button>
             <button className="h-12 px-10 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all">
                EXECUTE FINAL CLEARANCE
             </button>
          </div>
        </div>
      </Modal>

      {/* Initiation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="GOVERNANCE TERMINATION INITIALIZATION" size="lg">
         <form className="space-y-8 p-2">
            <div className="space-y-6">
               <div>
                  <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Selection</label>
                  <select className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer">
                     <option value="" disabled hidden>SEARCH DIRECTORY FOR ASSET...</option>
                     {employees.map(e => <option key={e.id}>{e.name} — {e.empId}</option>)}
                  </select>
               </div>
               <div className="grid gap-6 md:grid-cols-2">
                  <div>
                     <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Type</label>
                     <select className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all cursor-pointer">
                        <option>RESIGNATION</option>
                        <option>CONTRACT TERMINATION</option>
                        <option>REDUNDANCY</option>
                        <option>RETIREMENT</option>
                     </select>
                  </div>
                  <div>
                     <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Termination Date</label>
                     <input type="date" className="w-full rounded-none border border-slate-200 bg-white h-12 px-4 text-[11px] font-black focus:border-[#0F766E] outline-none transition-all" />
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
