import React, { useMemo, useState } from 'react';
import { 
  HiEye, HiDocumentCheck, HiClipboardDocumentList, HiExclamationCircle, HiShieldCheck,
  HiMagnifyingGlass, HiCheckCircle, HiXCircle, HiIdentification,
  HiArrowDownTray, HiClock, HiGlobeAlt, HiArrowsUpDown, HiPlus, HiDocumentArrowDown
} from 'react-icons/hi2';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';

const basicFieldClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/25';

function colLabel(text) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {text}
      <HiArrowsUpDown className="h-3 w-3 shrink-0 opacity-45" aria-hidden />
    </span>
  );
}

function statusColor(status) {
  if (status === 'Approved') return 'bg-green-100 text-green-700 ring-green-600/20';
  if (status === 'Pending') return 'bg-orange-100 text-orange-700 ring-orange-600/20';
  if (status === 'Rejected') return 'bg-red-100 text-red-700 ring-red-600/20';
  return 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

const MANDATORY_DOCS = [
  'Passport',
  'National ID',
  'Education Certificates',
  'Employment Contract',
  'Offer Letter',
  'Experience Certificate'
];

const initialSubmissions = [
  { id: 1, employee: 'John Doe', empId: 'EP-1999', department: 'Engineering', docType: 'Passport', submittedDate: '2026-05-01', status: 'Pending', hrComments: '', version: 1 },
  { id: 2, employee: 'Jane Smith', empId: 'EP-2044', department: 'Human Resources', docType: 'Offer Letter', submittedDate: '2026-05-02', status: 'Rejected', hrComments: 'Signature missing on page 4.', version: 1 },
  { id: 3, employee: 'Robert Fox', empId: 'EP-1120', department: 'Design', docType: 'Employment Contract', submittedDate: '2026-04-28', status: 'Approved', hrComments: 'Verified and archived.', version: 2 },
  { id: 4, employee: 'Sarah Wilson', empId: 'EP-1001', department: 'Marketing', docType: 'National ID', submittedDate: '2026-05-03', status: 'Pending', hrComments: '', version: 1 },
  { id: 5, employee: 'Michael Chen', empId: 'EP-1088', department: 'Finance', docType: 'Education Certificates', submittedDate: '2026-05-04', status: 'Pending', hrComments: '', version: 1 },
];

export default function Documents() {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); 
  const [actionReason, setActionReason] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchQ = !q || s.employee.toLowerCase().includes(q.toLowerCase()) || s.empId.toLowerCase().includes(q.toLowerCase());
      const matchDept = !deptFilter || s.department === deptFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchQ && matchDept && matchStatus;
    });
  }, [submissions, q, deptFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    approved: submissions.filter(s => s.status === 'Approved').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length
  }), [submissions]);

  const handleAction = (row, type) => {
    setSelectedRow(row);
    setActionType(type);
    setActionReason(type === 'Approve' ? 'Compliance Verified' : '');
    setActionModalOpen(true);
  };

  const handlePreview = (row) => {
    setSelectedRow(row);
    setPreviewModalOpen(true);
  };

  const confirmAction = () => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === selectedRow.id) {
        return {
          ...s,
          status: actionType === 'Approve' ? 'Approved' : 'Rejected',
          hrComments: actionReason
        };
      }
      return s;
    }));
    setActionModalOpen(false);
    setSelectedRow(null);
  };

  const columns = [
    {
      key: 'employee',
      label: colLabel('Contributor'),
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-600 shadow-sm">
            {row.employee.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{row.employee}</div>
            <div className="truncate text-xs font-mono text-slate-500">{row.empId}</div>
          </div>
        </div>
      )
    },
    { 
       key: 'docType', 
       label: colLabel('Classification'),
       render: (v) => (
          <div className="flex items-center gap-2 text-slate-700">
             <HiIdentification className="h-4 w-4 text-slate-400" />
             <span className="text-sm font-semibold">{v}</span>
          </div>
       )
    },
    { 
       key: 'submittedDate', 
       label: colLabel('Submitted Date'),
       render: (v) => <span className="text-sm font-medium text-slate-700">{v}</span>
    },
    {
      key: 'status',
      label: colLabel('Status'),
      render: (v) => (
        <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor(v)}`}>
          {v}
        </span>
      )
    },
    {
       key: 'actions',
       label: 'Actions',
       render: (_, row) => (
          <div className="flex items-center gap-1.5">
             <button type="button" onClick={() => handlePreview(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-blue-500 text-white transition-colors hover:bg-blue-600" aria-label="View">
                <HiEye className="h-4 w-4" />
             </button>
             {row.status === 'Pending' && (
                <>
                   <button type="button" onClick={() => handleAction(row, 'Approve')} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-[#10B981] text-white transition-colors hover:bg-[#059669]" aria-label="Approve">
                      <HiCheckCircle className="h-4 w-4" />
                   </button>
                   <button type="button" onClick={() => handleAction(row, 'Reject')} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-[#EF4444] text-white transition-colors hover:bg-[#DC2626]" aria-label="Reject">
                      <HiXCircle className="h-4 w-4" />
                   </button>
                </>
             )}
          </div>
       )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      
      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Documents & Approval</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Compliance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Documents Registry</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiDocumentArrowDown className="h-4 w-4" /> Export Report
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" /> Add Document
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL SUBMISSIONS',
            count: stats.total,
            bgColor: 'bg-[#0F172A]',
            icon: HiGlobeAlt,
            onClickFilter: () => setStatusFilter('')
          },
          {
            label: 'VERIFIED ASSETS',
            count: stats.approved,
            bgColor: 'bg-[#10B981]',
            icon: HiDocumentCheck,
            onClickFilter: () => setStatusFilter('Approved')
          },
          {
            label: 'AWAITING AUDIT',
            count: stats.pending,
            bgColor: 'bg-[#F59E0B]',
            icon: HiClipboardDocumentList,
            onClickFilter: () => setStatusFilter('Pending')
          },
          {
            label: 'POLICY FLAGS',
            count: stats.rejected,
            bgColor: 'bg-[#EF4444]',
            icon: HiExclamationCircle,
            onClickFilter: () => setStatusFilter('Rejected')
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'TOTAL SUBMISSIONS' && statusFilter === '') ||
            (card.label === 'VERIFIED ASSETS' && statusFilter === 'Approved') ||
            (card.label === 'AWAITING AUDIT' && statusFilter === 'Pending') ||
            (card.label === 'POLICY FLAGS' && statusFilter === 'Rejected');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Full width Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Document Registry</h2>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search talent name or ID..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Divisions</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Statuses</option>
              <option value="Pending">Awaiting Review</option>
              <option value="Approved">Verified / Valid</option>
              <option value="Rejected">Flagged / Rejected</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
            <button
              type="button"
              onClick={() => { setQ(''); setDeptFilter(''); setStatusFilter(''); }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filtered}
          pageSize={8}
          square
          totalCount={filtered.length}
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
        />
      </div>

      {/* Action Modal: Verification Control */}
      <Modal 
        isOpen={actionModalOpen} 
        onClose={() => setActionModalOpen(false)} 
        showClose
        size="md"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              Verification: {actionType}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {selectedRow?.employee} - {selectedRow?.docType}
            </p>
          </div>
        }
      >
        <div className="space-y-4 pt-4">
           <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Administrative Audit Remarks<span className="text-red-500"> *</span>
              </label>
              <textarea 
                className={basicFieldClass}
                rows={4}
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder={actionType === 'Approve' ? 'Optional verification notes...' : 'Required justification for policy rejection...'}
              />
           </div>

           <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={actionType !== 'Approve' && !actionReason.trim()}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${actionType === 'Approve' ? 'bg-[#10B981] hover:bg-[#059669]' : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}
              >
                Confirm {actionType}
              </button>
           </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        showClose
        size="xl"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              Document Preview
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {selectedRow?.employee} - {selectedRow?.docType}
            </p>
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-6 py-4">
          <div className="flex-1 bg-slate-50 rounded-md border border-slate-200 min-h-[400px] flex items-center justify-center">
             <div className="text-center text-slate-400">
                <HiShieldCheck className="mx-auto h-16 w-16 mb-2 text-slate-300" />
                <p className="text-sm font-medium">Document viewer placeholder</p>
             </div>
          </div>
          <div className="w-full lg:w-72 space-y-4">
             <div className="bg-white p-4 rounded-md border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Metadata</h4>
                <div className="space-y-3">
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Employee</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedRow?.employee}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Document Class</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedRow?.docType}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                      <span className={`mt-1 inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor(selectedRow?.status)}`}>
                        {selectedRow?.status}
                      </span>
                   </div>
                   {selectedRow?.hrComments && (
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Remarks</p>
                        <p className="text-xs font-medium text-slate-700 italic">{selectedRow.hrComments}</p>
                     </div>
                   )}
                </div>
             </div>
             <button
               type="button"
               className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex justify-center items-center gap-2"
             >
               <HiArrowDownTray className="h-4 w-4" /> Download
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
