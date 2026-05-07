import React, { useMemo, useState } from 'react'
import { 
  HiEye, 
  HiDocumentCheck, 
  HiClipboardDocumentList, 
  HiExclamationCircle, 
  HiShieldCheck,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiIdentification,
  HiArrowDownTray,
  HiCloudArrowUp,
  HiClock,
  HiUsers,
  HiGlobeAlt
} from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { employees } from '../../../data/mockData.js'

const MANDATORY_DOCS = [
  'Passport',
  'National ID',
  'Education Certificates',
  'Employment Contract',
  'Offer Letter',
  'Experience Certificate'
]

const initialSubmissions = [
  { id: 1, employee: 'John Doe', empId: 'EP-1999', department: 'Engineering', docType: 'Passport', submittedDate: '2026-05-01', status: 'Pending', hrComments: '', version: 1 },
  { id: 2, employee: 'Jane Smith', empId: 'EP-2044', department: 'Human Resources', docType: 'Offer Letter', submittedDate: '2026-05-02', status: 'Rejected', hrComments: 'Signature missing on page 4.', version: 1 },
  { id: 3, employee: 'Robert Fox', empId: 'EP-1120', department: 'Design', docType: 'Employment Contract', submittedDate: '2026-04-28', status: 'Approved', hrComments: 'Verified and archived.', version: 2 },
  { id: 4, employee: 'Sarah Wilson', empId: 'EP-1001', department: 'Marketing', docType: 'National ID', submittedDate: '2026-05-03', status: 'Pending', hrComments: '', version: 1 },
  { id: 5, employee: 'Michael Chen', empId: 'EP-1088', department: 'Finance', docType: 'Education Certificates', submittedDate: '2026-05-04', status: 'Pending', hrComments: '', version: 1 },
]

export default function Documents() {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [q, setQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [actionType, setActionType] = useState('') 
  const [actionReason, setActionReason] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchQ = !q || s.employee.toLowerCase().includes(q.toLowerCase()) || s.empId.toLowerCase().includes(q.toLowerCase())
      const matchDept = !deptFilter || s.department === deptFilter
      const matchStatus = !statusFilter || s.status === statusFilter
      return matchQ && matchDept && matchStatus
    })
  }, [submissions, q, deptFilter, statusFilter])

  const stats = useMemo(() => ({
    pending: submissions.filter(s => s.status === 'Pending').length,
    approved: submissions.filter(s => s.status === 'Approved').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length,
    total: submissions.length
  }), [submissions])

  const handleAction = (row, type) => {
    setSelectedRow(row)
    setActionType(type)
    setActionReason(type === 'Approve' ? 'Compliance Verified' : '')
    setActionModalOpen(true)
  }

  const handlePreview = (row) => {
    setSelectedRow(row)
    setPreviewModalOpen(true)
  }

  const confirmAction = () => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === selectedRow.id) {
        return {
          ...s,
          status: actionType === 'Approve' ? 'Approved' : 'Rejected',
          hrComments: actionReason
        }
      }
      return s
    }))
    setActionModalOpen(false)
    setSelectedRow(null)
  }

  const columns = [
    {
      key: 'employee',
      label: 'Contributor',
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
    { 
       key: 'docType', 
       label: 'Classification',
       render: (v) => (
          <div className="flex items-center gap-2 text-slate-700 font-medium">
             <HiIdentification className="h-4 w-4 text-slate-400" />
             <span className="text-sm">{v}</span>
          </div>
       )
    },
    { 
       key: 'submittedDate', 
       label: 'Submitted',
       render: (v) => <span className="text-xs font-bold text-slate-500">{v}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge 
          label={v} 
          variant="outline"
          color={v === 'Pending' ? 'orange' : v === 'Rejected' ? 'red' : 'green'} 
          className="font-black uppercase text-[9px] tracking-widest px-2.5" 
        />
      )
    },
    {
       key: 'actions',
       label: 'Verification Control',
       render: (_, row) => (
          <div className="flex items-center gap-1.5">
             <Button variant="ghost" size="sm" icon={HiEye} onClick={() => handlePreview(row)} className="text-slate-400 hover:text-[#0F766E]" />
             {row.status === 'Pending' && (
                <>
                   <Button variant="ghost" size="sm" icon={HiCheckCircle} onClick={() => handleAction(row, 'Approve')} className="text-emerald-400 hover:text-emerald-600" />
                   <Button variant="ghost" size="sm" icon={HiXCircle} onClick={() => handleAction(row, 'Reject')} className="text-rose-400 hover:text-rose-600" />
                </>
             )}
          </div>
       )
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Hero Section (Emerald Gradient like Visa Page) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
              <HiShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Compliance Master Registry</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Documents & Approval</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed font-medium">
               Enterprise document verification suite. Audit regulatory submissions, manage workforce compliance, and track credential integrity with automated workflows.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
             <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10">
                <HiArrowPath className="h-4 w-4" /> Export Report
             </button>
             <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95">
                <HiCloudArrowUp className="h-4 w-4" /> Bulk Verification
             </button>
          </div>
        </div>
        {/* Background Decorative Elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      {/* Stats Cards (Referring Visa Page Design) */}
      <div className="grid gap-6 sm:grid-cols-4">
        <StatCard 
           title="Audit Queue" 
           value={stats.pending} 
           subtitle="Pending HR Verification" 
           color="orange" 
           icon={HiClipboardDocumentList}
        />
        <StatCard 
           title="Verified Assets" 
           value={stats.approved} 
           subtitle="Regulatory Compliance Met" 
           color="emerald" 
           icon={HiDocumentCheck}
        />
        <StatCard 
           title="Policy Flags" 
           value={stats.rejected} 
           subtitle="Intervention Required" 
           color="red" 
           icon={HiExclamationCircle}
        />
        <StatCard 
           title="Global Registry" 
           value={stats.total} 
           subtitle="Total Submission Volume" 
           color="blue" 
           icon={HiGlobeAlt}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar: Compliance Workspace */}
        <div className="xl:col-span-1 space-y-6">
           <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-2 text-slate-800 mb-2">
                 <HiAdjustmentsHorizontal className="h-5 w-5 text-[#0F766E]" />
                 <span className="text-xs font-bold uppercase tracking-widest">Workspace Filters</span>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
                 <div className="relative mt-1.5">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       type="text" 
                       placeholder="Talent name or ID..." 
                       value={q}
                       onChange={e => setQ(e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all"
                    />
                 </div>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                 <select 
                    value={deptFilter} 
                    onChange={e => setDeptFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all"
                 >
                    <option value="">Global Divisions</option>
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                 </select>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audit Status</label>
                 <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all"
                 >
                    <option value="">Audit Filter</option>
                    <option value="Pending">Awaiting Review</option>
                    <option value="Approved">Verified / Valid</option>
                    <option value="Rejected">Flagged / Rejected</option>
                 </select>
              </div>

              <button 
                 onClick={() => { setQ(''); setDeptFilter(''); setStatusFilter('') }}
                 className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] border border-dashed border-slate-200 rounded-xl hover:border-red-200 transition-all"
              >
                 Reset All Filters
              </button>
           </div>

           {/* Mandatory Compliance Checklist */}
           <div className="bg-[#0F766E] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                 <HiClipboardDocumentList className="w-5 h-5 opacity-50" />
                 Baseline Compliance
              </h3>
              <div className="space-y-3">
                 {MANDATORY_DOCS.map(doc => (
                    <div key={doc} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10 group/item hover:bg-white/20 transition-all cursor-default">
                       <HiCheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                       <span className="text-[11px] font-bold text-emerald-50 group-hover/item:translate-x-1 transition-transform">{doc}</span>
                    </div>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                 <p className="text-[10px] text-emerald-100/50 font-medium leading-relaxed italic">System automatically flags personnel missing these core regulatory credentials.</p>
              </div>
           </div>
        </div>

        {/* Main Workspace: Audit Queue */}
        <div className="xl:col-span-3 space-y-8">
           <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                       <HiArrowPath className="h-5 w-5" />
                    </div>
                    <div>
                       <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">Active Audit Queue</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Regulatory Intake</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <Badge label={`${filtered.length} RECORDS`} variant="outline" color="blue" className="font-black text-[9px] px-3" />
                 </div>
              </div>
              <Table columns={columns} data={filtered} pageSize={8} />
           </div>

           {/* Workflow Legend */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                 { title: 'Pending Audit', desc: 'New submissions awaiting HR administrative verification.', icon: HiClock, color: 'orange' },
                 { title: 'Verified Asset', desc: 'Securely archived credentials cleared for compliance.', icon: HiShieldCheck, color: 'emerald' },
                 { title: 'Policy Flags', desc: 'Rejected documents requiring employee intervention.', icon: HiExclamationCircle, color: 'red' }
              ].map(item => (
                 <div key={item.title} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex gap-4 items-start transition-all hover:shadow-md">
                    <div className={`h-10 w-10 shrink-0 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shadow-sm`}>
                       <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">{item.title}</h4>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Action Modal: Verification Control */}
      <Modal 
        isOpen={actionModalOpen} 
        onClose={() => setActionModalOpen(false)} 
        title={`Compliance Verification: ${actionType}`} 
        size="md"
      >
        <div className="space-y-6 pt-2 animate-in fade-in duration-300">
           <div className="bg-[#0F766E] p-6 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest mb-1">Subject Profile</p>
                       <p className="text-lg font-black text-white leading-tight">{selectedRow?.employee}</p>
                       <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest">{selectedRow?.empId}</p>
                    </div>
                    <Badge label={selectedRow?.docType} color="blue" className="font-black text-[9px] bg-white/20 text-white border-none" />
                 </div>
              </div>
           </div>
           
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Audit Remarks</label>
              <textarea 
                className="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all shadow-inner"
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder={actionType === 'Approve' ? 'Optional verification notes...' : 'Required justification for policy rejection...'}
              />
           </div>

           <div className="flex gap-4">
              <Button label="CANCEL" variant="ghost" onClick={() => setActionModalOpen(false)} className="flex-1 font-black text-xs" />
              <Button 
                label={`EXECUTE ${actionType.toUpperCase()}`} 
                variant="primary" 
                onClick={confirmAction}
                className={`flex-1 shadow-lg shadow-${actionType === 'Approve' ? 'emerald' : 'rose'}-900/20`}
                disabled={actionType !== 'Approve' && !actionReason.trim()}
              />
           </div>
        </div>
      </Modal>

      {/* Preview Modal: Secure Document Analyzer */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Secure Credential Analysis"
        size="xl"
      >
        <div className="flex flex-col lg:flex-row gap-8 py-4 animate-in zoom-in-95 duration-500">
          {/* Document Intelligence Viewer */}
          <div className="flex-1 bg-slate-100 rounded-3xl border border-slate-200 min-h-[550px] flex flex-col items-center justify-center p-12 relative group overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0F766E]/30 to-transparent animate-pulse" />
            
            {/* Simulation of a document scan */}
            <div className="relative w-full max-w-[340px] bg-white rounded-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 space-y-8 transform group-hover:scale-[1.02] transition-transform duration-700 border border-slate-200">
               <div className="flex justify-between border-b-2 border-slate-50 pb-6">
                  <div className="h-4 bg-slate-100 rounded-full w-24" />
                  <div className="h-4 bg-slate-50 rounded-full w-12" />
               </div>
               <div className="space-y-4">
                  <div className="h-2 bg-slate-50 rounded-full w-full" />
                  <div className="h-2 bg-slate-50 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-50 rounded-full w-4/5" />
               </div>
               <div className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <HiShieldCheck className="h-20 w-20 text-slate-200" />
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-40" />
               </div>
               <div className="flex justify-end pt-4">
                  <div className="h-3 bg-slate-100 rounded-full w-20" />
               </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
               <button className="h-12 w-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-900 hover:text-[#0F766E] transition-all hover:scale-110 border border-slate-100"><HiMagnifyingGlass className="h-6 w-6" /></button>
               <button className="h-12 w-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-900 hover:text-[#0F766E] transition-all hover:scale-110 border border-slate-100"><HiArrowDownTray className="h-6 w-6" /></button>
            </div>

            <div className="absolute top-8 left-8 flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-[#0F766E] animate-pulse" />
               <span className="text-[10px] font-black text-[#0F766E] uppercase tracking-[0.4em]">Audit Scan Pipeline Active</span>
            </div>
          </div>

          {/* Verification Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1.5 h-full bg-[#0F766E]" />
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">Registry Metadata</h4>
               
               <div className="space-y-4">
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Contributing Talent</p>
                     <p className="text-lg font-black text-slate-900 leading-tight mt-0.5">{selectedRow?.employee}</p>
                     <p className="text-[11px] font-bold text-[#0F766E] uppercase tracking-widest">{selectedRow?.empId}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Document Class</p>
                     <p className="text-sm font-black text-slate-800">{selectedRow?.docType}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Submission Trace</p>
                     <p className="text-xs font-bold text-slate-600">{selectedRow?.submittedDate} • Registry v{selectedRow?.version}.0</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Current Audit State</p>
                     <div className="mt-2">
                        <Badge label={selectedRow?.status} color={selectedRow?.status === 'Approved' ? 'green' : 'orange'} className="px-4 py-1 font-black text-[10px] uppercase tracking-widest shadow-sm" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 border-dashed">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Audit Trail Remarks</h4>
               <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                  {selectedRow?.hrComments || "No previous administrative remarks found. Record is currently in initial verification phase."}
               </p>
            </div>

            <div className="flex flex-col gap-3">
               <Button label="DOWNLOAD ASSET" variant="secondary" icon={HiArrowDownTray} className="w-full rounded-xl py-4 font-black" />
               <Button label="CLOSE PREVIEW" variant="ghost" onClick={() => setPreviewModalOpen(false)} className="w-full rounded-xl py-4 font-black text-slate-400 hover:text-[#0F766E]" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
