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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">EXIT MANAGEMENT – ADMIN VIEW</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Manage employee departures, asset recovery, and final settlements with a streamlined professional workflow.
            </p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
          >
            <HiPlus className="h-4 w-4" /> Initiate Exit
          </button>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Status Filters / Quick Stats */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Stats</p>
          {[
            { label: 'Exits this month', count: stats.exitsThisMonth, icon: HiUserGroup, color: 'slate' },
            { label: 'Pending approvals', count: stats.pendingApprovals, icon: HiClock, color: 'orange' },
            { label: 'Pending assets', count: stats.assetsPending, icon: HiArrowPathRoundedSquare, color: 'blue' },
            { label: 'Pending settlements', count: stats.pendingSettlements, icon: HiCurrencyDollar, color: 'emerald' }
          ].map((item) => (
            <div
              key={item.label}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-tight">System Audit</div>
                </div>
              </div>
              <div className={`text-lg font-black text-slate-700`}>
                {item.count}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name, ID, or Exit Type..."
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
                   <h2 className="text-sm font-bold uppercase tracking-wider">Exit Registry</h2>
                   <HiArrowPathRoundedSquare className="h-4 w-4 opacity-50" />
                </div>
             </div>
             <Table columns={columns} data={filtered} pageSize={8} />
          </div>
        </div>
      </div>

      {/* Review Exit Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="EXIT MANAGEMENT – ADMIN VIEW" size="xl">
        <div className="animate-in fade-in duration-500 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/50 -mx-6 px-6">
             {tabs.map((tab) => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === tab.id 
                      ? 'border-[#0F766E] text-[#0F766E] bg-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                   }`}
                >
                   <tab.icon className="h-4 w-4" /> {tab.id}
                </button>
             ))}
          </div>

          {activeTab === 'Summary' && (
             <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-1">
                   <div className="grid grid-cols-2 gap-x-12 gap-y-4 rounded-2xl border border-slate-100 p-6 bg-slate-50/30">
                      {[
                        { label: 'Employee Name', value: selectedExit?.name },
                        { label: 'Employee ID', value: selectedExit?.id },
                        { label: 'Department', value: selectedExit?.dept },
                        { label: 'Manager', value: selectedExit?.manager },
                        { label: 'Exit Type', value: selectedExit?.type },
                        { label: 'Notice Period', value: selectedExit?.notice },
                        { label: 'Job Title', value: selectedExit?.title },
                        { label: 'Join Date', value: selectedExit?.joinDate },
                        { label: 'Last working day', value: selectedExit?.lwd },
                        { label: 'Exit Status', value: selectedExit?.status }
                      ].map(item => (
                         <div key={item.label}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-sm font-bold text-slate-700">{item.value}</p>
                         </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Remarks</p>
                   <textarea 
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none min-h-[200px]"
                      placeholder="Enter exit notes or administrative comments..."
                   />
                </div>
             </div>
          )}

          {activeTab === 'Asset Return' && (
             <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-[#0F766E] text-white">
                         <tr>
                            {['Asset Type', 'Asset ID', 'Serial No.', 'Issued Date', 'Return Date', 'Condition', 'Status'].map(h => (
                               <th key={h} className="px-4 py-3 font-bold uppercase text-[10px] tracking-wider">{h}</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {[
                           { type: 'Laptop', id: 'LP-902', serial: 'SN-00129', issued: '01/01/2022', return: '-', condition: 'Good', status: 'Pending' },
                           { type: 'Mobile', id: 'MB-102', serial: 'IMEI-8821', issued: '01/01/2022', return: '20/12/2025', condition: 'Good', status: 'Returned' },
                           { type: 'Access keys/card', id: 'AC-50', serial: 'RFID-11', issued: '01/01/2022', return: '-', condition: '-', status: 'Pending' }
                         ].map((asset, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                               <td className="px-4 py-4 font-bold text-slate-700">{asset.type}</td>
                               <td className="px-4 py-4">{asset.id}</td>
                               <td className="px-4 py-4 text-xs font-mono">{asset.serial}</td>
                               <td className="px-4 py-4">{asset.issued}</td>
                               <td className="px-4 py-4">{asset.return}</td>
                               <td className="px-4 py-4">
                                  <select className="bg-transparent border-none focus:ring-0 text-xs text-slate-900 font-bold">
                                     <option>Good</option>
                                     <option>Damaged</option>
                                     <option>Lost</option>
                                  </select>
                               </td>
                               <td className="px-4 py-4">
                                  <Badge label={asset.status} color={asset.status === 'Returned' ? 'green' : 'orange'} />
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Recovery Notes</p>
                   <textarea className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none" rows={2} />
                </div>
             </div>
          )}

          {activeTab === 'Checklist' && (
             <div className="grid gap-6 md:grid-cols-2">
                {['IT Clearance', 'Finance Clearance', 'HR Clearance', 'Manager Clearance'].map(title => (
                   <div key={title} className="rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm bg-white">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">{title}</h4>
                      <div className="space-y-3">
                         {['System access revoked', 'Email archived', 'Hardware verified'].map((item, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                               <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]" />
                               <span className="text-xs text-slate-600 group-hover:text-slate-900">{item}</span>
                            </label>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-center gap-4">
             <Button label="SAVE UPDATES" variant="primary" className="px-12 shadow-lg shadow-emerald-900/20" />
             <Button label="APPROVE EXIT" variant="secondary" className="bg-emerald-600 hover:bg-emerald-700" icon={HiCheckBadge} />
             <Button label="CANCEL" variant="ghost" onClick={() => setReviewModalOpen(false)} />
          </div>
        </div>
      </Modal>

      {/* Initiation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Initiate Exit Workflow" size="lg">
         <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
               <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Select Employee</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none">
                     <option value="" disabled hidden>Search employee to initiate exit...</option>
                     {employees.map(e => <option key={e.id}>{e.name} ({e.empId})</option>)}
                  </select>
               </div>
               <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Exit Type</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none">
                     <option>Resignation</option>
                     <option>Contract End</option>
                     <option>Termination</option>
                     <option>Retirement</option>
                  </select>
               </div>
               <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Last Working Day</label>
                  <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none" />
               </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
               <Button type="button" label="Cancel" variant="ghost" onClick={() => setModalOpen(false)} />
               <Button label="Start Exit Process" variant="primary" className="px-8 shadow-lg shadow-emerald-900/20" icon={HiUserMinus} />
            </div>
         </form>
      </Modal>
    </div>
  )
}
