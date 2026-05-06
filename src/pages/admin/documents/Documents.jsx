import { useMemo, useState } from 'react'
import { HiEye, HiDocumentCheck, HiClipboardDocumentList, HiExclamationCircle, HiShieldCheck } from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { employees } from '../../../data/mockData.js'

const selectClass =
  'w-full bg-white/50 border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700'

const textareaClass =
  'w-full min-h-[120px] rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner'

const MANDATORY_DOCS = [
  'Passport',
  'National ID',
  'Education Certificates',
  'Contract',
  'Offer Letter',
  'Experience Letters'
]

const initialSubmissions = [
  { id: 1, employee: 'John Doe', empId: 'EMP001', department: 'Engineering', docType: 'Passport', submittedDate: '2024-05-01', status: 'Pending', hrComments: '', version: 1 },
  { id: 2, employee: 'Jane Smith', empId: 'EMP002', department: 'HR', docType: 'Offer Letter', submittedDate: '2024-05-02', status: 'Rejected', hrComments: 'ID number blurry, please re-scan.', version: 1 },
  { id: 3, employee: 'Robert Fox', empId: 'EMP003', department: 'Design', docType: 'Contract', submittedDate: '2024-04-28', status: 'Approved', hrComments: 'Verified and archived.', version: 1 },
  { id: 4, employee: 'Sarah Wilson', empId: 'EMP004', department: 'Marketing', docType: 'National ID', submittedDate: '2024-05-03', status: 'Pending', hrComments: '', version: 1 },
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

  const pendingDocs = useMemo(() => filtered.filter(s => s.status === 'Pending'), [filtered])
  const rejectedDocs = useMemo(() => filtered.filter(s => s.status === 'Rejected'), [filtered])
  const approvedDocs = useMemo(() => filtered.filter(s => s.status === 'Approved'), [filtered])

  const stats = useMemo(() => ({
    pending: submissions.filter(s => s.status === 'Pending').length,
    approved: submissions.filter(s => s.status === 'Approved').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length,
    compliance: Math.round((submissions.filter(s => s.status === 'Approved').length / MANDATORY_DOCS.length) * 100)
  }), [submissions])

  const handleAction = (row, type) => {
    setSelectedRow(row)
    setActionType(type)
    setActionReason(type === 'Approve' ? 'Approved' : '')
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
          status: actionType === 'Correction' ? 'Rejected' : actionType,
          hrComments: actionReason
        }
      }
      return s
    }))
    setActionModalOpen(false)
    setSelectedRow(null)
  }

  const sectionHeader = (title, Icon) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative">
        <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm" />
        <div className="relative bg-[#005c8d] text-white p-2 rounded-lg shadow-lg">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Workflow • Section 0{title.includes('Pending') ? '1' : title.includes('Rejected') ? '2' : '3'}</p>
      </div>
    </div>
  )

  const commonColumns = [
    {
      key: 'employee',
      label: 'Employee Name',
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200 shadow-sm">
            {row.employee.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none">{row.employee}</div>
            <div className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">{row.empId}</div>
          </div>
        </div>
      )
    },
    { key: 'docType', label: 'Document Type' },
    { key: 'submittedDate', label: 'Submission Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <Badge 
          label={v} 
          color={v === 'Pending' ? 'orange' : v === 'Rejected' ? 'red' : 'green'} 
          className="rounded-md px-2 py-0.5 font-bold uppercase text-[9px] tracking-widest" 
        />
      )
    }
  ]

  const pendingColumns = [
    ...commonColumns,
    {
      key: 'actions',
      label: 'Verification Actions',
      render: (_, row) => (
        <div className="flex gap-1.5">
          <button onClick={() => handlePreview(row)} className="px-3 py-1 text-[10px] font-black text-white bg-[#005c8d] hover:bg-[#004a72] rounded-md transition-all uppercase shadow-sm">Preview</button>
          <button onClick={() => handleAction(row, 'Approve')} className="px-3 py-1 text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all uppercase">Approve</button>
          <button onClick={() => handleAction(row, 'Reject')} className="px-3 py-1 text-[10px] font-black text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-all uppercase">Reject</button>
        </div>
      )
    }
  ]

  const rejectedColumns = [
    ...commonColumns,
    {
      key: 'hrComments',
      label: 'Reason for Rejection',
      render: (v) => <span className="text-[11px] text-rose-600 font-bold italic truncate block max-w-[150px]" title={v}>{v || 'Policy Mismatch'}</span>
    },
    {
      key: 'actions_rejected',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => handlePreview(row)} className="px-3 py-1 text-[10px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-all uppercase">Preview</button>
      )
    }
  ]

  const approvedColumns = [
    ...commonColumns,
    {
      key: 'actions_approved',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => handlePreview(row)} className="px-3 py-1 text-[10px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-all uppercase">Preview</button>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Hero Section */}
      <div className="relative bg-slate-900 rounded-2xl p-8 mb-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <HiShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Compliance Registry</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Documents & Approval</h1>
            <p className="text-slate-400 mt-2 font-medium max-w-md">Enterprise-grade document verification and workforce compliance tracking system.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Awaiting</p>
              <p className="text-2xl font-black text-white leading-none">{stats.pending}</p>
              <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved</p>
              <p className="text-2xl font-black text-white leading-none">{stats.approved}</p>
              <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rejected</p>
              <p className="text-2xl font-black text-white leading-none">{stats.rejected}</p>
              <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '15%' }} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-lg shadow-emerald-500/10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Compliance</p>
              <p className="text-2xl font-black text-white leading-none">{stats.compliance}%</p>
              <p className="text-[9px] font-bold text-emerald-400 mt-1 uppercase">Health Check</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar: Checklist & Filters */}
        <div className="xl:col-span-1 space-y-6">
          {/* Glassmorphism Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#005c8d] rounded-full" />
              Registry Filters
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Talent</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Name or ID..." 
                    value={q} 
                    onChange={e => setQ(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#005c8d] font-medium" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={selectClass}>
                  <option value="">All Divisions</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Design">Design</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doc Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
                  <option value="">Global Status</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Approved">Verified</option>
                  <option value="Rejected">Flagged</option>
                </select>
              </div>
              <button 
                onClick={() => { setQ(''); setDeptFilter(''); setStatusFilter('') }}
                className="w-full py-2.5 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest border border-dashed border-slate-200 rounded-md hover:border-rose-200 transition-all"
              >
                Reset Parameters
              </button>
            </div>
          </div>

          {/* Mandatory Checklist Sidebar */}
          <div className="bg-[#005c8d] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <HiClipboardDocumentList className="w-4 h-4 text-white" />
              Baseline Audit
            </h3>
            <div className="space-y-3">
              {MANDATORY_DOCS.map(doc => (
                <div key={doc} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10 group hover:bg-white/20 transition-all cursor-default">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-xs font-bold text-white group-hover:translate-x-1 transition-transform">{doc}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] text-white/50 leading-relaxed italic">System automatically flags employees missing these core credentials.</p>
            </div>
          </div>
        </div>

        {/* Main Content: Document Lists */}
        <div className="xl:col-span-3 space-y-8">
          {/* Pending Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {sectionHeader('Pending Verification', HiClipboardDocumentList)}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <Table columns={pendingColumns} data={pendingDocs} pageSize={5} />
            </div>
          </div>

          {/* Rejected Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {sectionHeader('Flagged & Rejected', HiExclamationCircle)}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <Table columns={rejectedColumns} data={rejectedDocs} pageSize={5} />
            </div>
          </div>

          {/* Approved Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {sectionHeader('Verified Repository', HiDocumentCheck)}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <Table columns={approvedColumns} data={approvedDocs} pageSize={5} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <Modal 
        isOpen={actionModalOpen} 
        onClose={() => setActionModalOpen(false)} 
        title={`${actionType} Regulatory Submission`} 
        size="md"
      >
        <div className="space-y-6 pt-2">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Target Compliance Record</p>
            <p className="text-sm font-black text-white">{selectedRow?.docType}</p>
            <p className="text-xs font-bold text-emerald-400 mt-1">{selectedRow?.employee} ({selectedRow?.empId})</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Remarks</label>
            <textarea 
              className={textareaClass}
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              placeholder={actionType === 'Approve' ? 'Optional remarks for the employee profile...' : 'Detailed justification required for audit rejection...'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button label="Abort Action" variant="ghost" onClick={() => setActionModalOpen(false)} className="flex-1 font-bold" />
            <Button 
              label={`Execute ${actionType}`} 
              variant="primary" 
              onClick={confirmAction}
              className={`flex-1 rounded-md shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${actionType === 'Approve' ? 'bg-emerald-600' : actionType === 'Reject' ? 'bg-rose-600' : 'bg-amber-600'}`}
              disabled={actionType !== 'Approve' && !actionReason.trim()}
            />
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Secure Document Analysis"
        size="xl"
      >
        <div className="flex flex-col lg:flex-row gap-8 py-4">
          {/* Document Viewer Simulation */}
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 min-h-[500px] flex flex-col items-center justify-center p-12 text-center relative group overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 z-10">
              <button className="p-4 bg-white rounded-full shadow-2xl text-slate-900 hover:text-emerald-600 transition-all hover:scale-110 active:scale-95"><HiEye className="w-6 h-6" /></button>
              <button className="p-4 bg-white rounded-full shadow-2xl text-slate-900 hover:text-emerald-600 transition-all hover:scale-110 active:scale-95">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            
            <div className="w-full max-w-[320px] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-sm p-8 space-y-6 border border-slate-200 transform group-hover:rotate-1 group-hover:scale-[1.03] transition-all duration-700">
              <div className="h-6 bg-slate-100 rounded-sm w-3/4 mb-8" />
              <div className="space-y-4">
                <div className="h-3 bg-slate-50 rounded-sm w-full" />
                <div className="h-3 bg-slate-50 rounded-sm w-full" />
                <div className="h-3 bg-slate-50 rounded-sm w-5/6" />
              </div>
              <div className="aspect-[4/3] bg-slate-50 rounded-sm border border-slate-100 flex items-center justify-center my-8">
                <div className="relative">
                   <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-xl" />
                   <HiShieldCheck className="w-16 h-16 text-slate-200 relative" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded-sm w-1/2 ml-auto" />
            </div>
            <p className="mt-10 text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.4em] animate-pulse">Encryption Protocol Active</p>
          </div>

          {/* Metadata Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Credential Intelligence</h4>
              <div className="space-y-5">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Talent Profile</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">{selectedRow?.employee}</p>
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">{selectedRow?.empId} • {selectedRow?.department}</p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Classification</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">{selectedRow?.docType}</p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Registry Status</p>
                  <div className="mt-2">
                    <Badge label={selectedRow?.status} color={selectedRow?.status === 'Approved' ? 'green' : 'orange'} className="rounded-lg font-black text-[10px] uppercase px-3 py-1 tracking-widest shadow-sm" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Timestamp</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{selectedRow?.submittedDate} • 09:42 AM</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Audit Remarks</h4>
              <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                {selectedRow?.hrComments || "No administrative compliance remarks recorded for this version. System default validation passed."}
              </p>
            </div>

            <Button 
              label="Terminate Preview" 
              variant="secondary" 
              onClick={() => setPreviewModalOpen(false)} 
              className="w-full rounded-xl font-bold py-4 shadow-lg hover:shadow-xl transition-all" 
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
