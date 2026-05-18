import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiEye, HiDocumentCheck, HiClipboardDocumentList, HiExclamationCircle, HiShieldCheck,
  HiMagnifyingGlass, HiCheckCircle, HiXCircle, HiIdentification,
  HiArrowDownTray, HiClock, HiGlobeAlt, HiArrowsUpDown, HiPlus, HiDocumentArrowDown,
  HiFolderOpen
} from 'react-icons/hi2';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import api from '../../../services/api.js';

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

const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveDocFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_ORIGIN}${path}`;
};

export default function Documents() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [allDocs, setAllDocs] = useState([]);

  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/documents');
      const docs = res.data?.data?.documents || [];
      setAllDocs(docs);

      const grouped = docs.reduce((acc, doc) => {
        if (!acc[doc.employee_id]) {
          acc[doc.employee_id] = {
            employee_id: doc.employee_id,
            employee_name: doc.employee_name,
            emp_id: doc.emp_id,
            department: doc.department,
            docs: []
          };
        }
        acc[doc.employee_id].docs.push(doc);
        return acc;
      }, {});
      setEmployees(Object.values(grouped));
    } catch (err) {
      toast.error('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchQ = !q || String(e.employee_name).toLowerCase().includes(q.toLowerCase()) || String(e.emp_id).toLowerCase().includes(q.toLowerCase());
      const matchDept = !deptFilter || e.department === deptFilter;
      // If statusFilter is applied, only show employees who have at least one doc matching the status
      const matchStatus = !statusFilter || e.docs.some(d => d.status === statusFilter);
      return matchQ && matchDept && matchStatus;
    });
  }, [employees, q, deptFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: allDocs.length,
    pending: allDocs.filter(s => s.status === 'Pending').length,
    approved: allDocs.filter(s => s.status === 'Approved').length,
    rejected: allDocs.filter(s => s.status === 'Rejected').length
  }), [allDocs]);

  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);
    setEmployeeModalOpen(true);
  };

  const handleAction = (doc, type) => {
    setSelectedDoc(doc);
    setActionType(type);
    setActionReason(type === 'Approve' ? 'Compliance Verified' : '');
    setActionModalOpen(true);
  };

  const handlePreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      const payload = {
        status: actionType === 'Approve' ? 'Approved' : 'Rejected',
        rejection_reason: actionReason
      };
      await api.put(`/admin/documents/${selectedDoc.id}/status`, payload);
      toast.success(`Document ${actionType === 'Approve' ? 'approved' : 'rejected'} successfully.`);
      setActionModalOpen(false);
      setSelectedDoc(null);
      // Reload documents
      await loadDocuments();
      // If employee modal is open, we need to update its contents implicitly via loadDocuments, 
      // but selectedEmployee won't auto-update since it's a static copy. We can just refresh it:
      setEmployeeModalOpen(false); // Quick way is to close or update the selectedEmployee
      setTimeout(() => {
        // Find updated employee and reopen
        const updatedEmp = employees.find(e => e.employee_id === selectedEmployee?.employee_id);
        if (updatedEmp) {
          setSelectedEmployee(updatedEmp);
          setEmployeeModalOpen(true);
        }
      }, 100);
    } catch (error) {
      toast.error('Failed to update document status.');
      console.error(error);
    }
  };

  const empColumns = [
    {
      key: 'employee',
      label: colLabel('Contributor'),
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-600 shadow-sm">
            {String(row.employee_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{row.employee_name}</div>
            <div className="truncate text-xs font-mono text-slate-500">{row.emp_id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: colLabel('Department'),
      render: (v) => <span className="text-sm font-medium text-slate-700">{v || '—'}</span>
    },
    {
      key: 'docStats',
      label: colLabel('Documents'),
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Badge label={`${row.docs.length} Total`} color="blue" variant="soft" className="font-bold text-[10px]" />
          {row.docs.some(d => d.status === 'Pending') && (
            <Badge label={`${row.docs.filter(d => d.status === 'Pending').length} Pending`} color="orange" className="font-bold text-[10px]" />
          )}
          {row.docs.some(d => d.status === 'Rejected') && (
            <Badge label={`${row.docs.filter(d => d.status === 'Rejected').length} Flagged`} color="red" className="font-bold text-[10px]" />
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          type="button"
          onClick={() => handleViewEmployee(row)}
          variant="outline"
          size="sm"
          icon={HiFolderOpen}
          label="VIEW DOCS"
          className="text-[10px] font-black tracking-widest text-[#0F766E]"
        />
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
            <span className="text-slate-600">Employee Documents Registry</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiDocumentArrowDown className="h-4 w-4" /> Export Report
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
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActiveFilter
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
          <h2 className="text-sm font-semibold text-white">Employee Directories</h2>
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
              <option value="">All Document Statuses</option>
              <option value="Pending">Awaiting Review</option>
              <option value="Approved">Verified / Valid</option>
              <option value="Rejected">Flagged / Rejected</option>
            </select>
          </div>
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

      {loading ? (
        <div className="flex justify-center p-8 text-slate-400">Loading documents...</div>
      ) : (
        <Table
          columns={empColumns}
          data={filtered}
          pageSize={8}
          square
          totalCount={filtered.length}
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
        />
      )}
    </div>

            {/* Employee Documents Modal */ }
  <Modal
    isOpen={employeeModalOpen}
    onClose={() => setEmployeeModalOpen(false)}
    showClose
    size="2xl"
    header={
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-900">
          Documents for {selectedEmployee?.employee_name}
        </h2>
        <p className="text-xs font-medium text-slate-500">
          {selectedEmployee?.emp_id} • {selectedEmployee?.department}
        </p>
      </div>
    }
  >
    <div className="pt-4 pb-2">
      <div className="overflow-x-auto rounded-none border border-slate-200">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Expiry</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {selectedEmployee?.docs?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                  No documents found for this employee.
                </td>
              </tr>
            )}
            {selectedEmployee?.docs?.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-800 text-xs">{doc.document_title || doc.document_type}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{doc.document_type}</p>
                  {doc.rejection_reason && doc.status === 'Rejected' && (
                    <p className="text-[9px] text-red-500 font-semibold mt-1">Rejection Reason: {doc.rejection_reason}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-[11px] text-slate-600 font-semibold">Sub: {doc.submitted_date || '—'}</p>
                  {doc.expiry_date && <p className="text-[10px] text-rose-500 font-bold mt-0.5">Exp: {doc.expiry_date}</p>}
                </td>
                <td className="px-4 py-3">
                  <Badge label={doc.status} color={statusColor(doc.status).includes('green') ? 'green' : statusColor(doc.status).includes('red') ? 'red' : 'orange'} variant="soft" className="font-black text-[9px] tracking-widest" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button type="button" onClick={() => handlePreview(doc)} className="inline-flex h-7 items-center justify-center rounded-none border border-slate-200 bg-white px-2 text-[9px] font-bold text-slate-700 transition-colors hover:bg-slate-50" aria-label="Preview">
                      VIEW
                    </button>
                    {doc.status === 'Pending' && (
                      <>
                        <button type="button" onClick={() => handleAction(doc, 'Approve')} className="inline-flex h-7 items-center justify-center rounded-none border border-emerald-200 bg-emerald-50 px-2 text-[9px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100" aria-label="Approve">
                          APPROVE
                        </button>
                        <button type="button" onClick={() => handleAction(doc, 'Reject')} className="inline-flex h-7 items-center justify-center rounded-none border border-rose-200 bg-rose-50 px-2 text-[9px] font-bold text-rose-700 transition-colors hover:bg-rose-100" aria-label="Reject">
                          REJECT
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Modal>

  {/* Action Modal: Verification Control */ }
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
          {selectedDoc?.employee_name} - {selectedDoc?.document_type}
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

  {/* Preview Modal */ }
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
          {selectedDoc?.employee_name} - {selectedDoc?.document_type}
        </p>
      </div>
    }
  >
    <div className="flex flex-col lg:flex-row gap-6 py-4">
      <div className="flex-1 bg-slate-50 rounded-md border border-slate-200 min-h-[400px] flex items-center justify-center overflow-hidden">
        {selectedDoc?.file_url ? (
          selectedDoc.file_url.toLowerCase().endsWith('.pdf') ? (
            <iframe src={resolveDocFileUrl(selectedDoc.file_url)} className="w-full h-full min-h-[400px]" title="PDF Preview" />
          ) : (
            <img src={resolveDocFileUrl(selectedDoc.file_url)} alt="Document Preview" className="max-w-full max-h-[500px] object-contain" />
          )
        ) : (
          <div className="text-center text-slate-400">
            <HiShieldCheck className="mx-auto h-16 w-16 mb-2 text-slate-300" />
            <p className="text-sm font-medium">No file available for preview</p>
          </div>
        )}
      </div>
      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white p-4 rounded-md border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Metadata</h4>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Employee</p>
              <p className="text-sm font-semibold text-slate-900">{selectedDoc?.employee_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Document Class</p>
              <p className="text-sm font-semibold text-slate-900">{selectedDoc?.document_type}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
              <Badge label={selectedDoc?.status} color={statusColor(selectedDoc?.status || '').includes('green') ? 'green' : statusColor(selectedDoc?.status || '').includes('red') ? 'red' : 'orange'} variant="soft" className="font-black text-[10px] mt-1 tracking-widest" />
            </div>
            {selectedDoc?.rejection_reason && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Rejection Reason</p>
                <p className="text-xs font-medium text-slate-700 italic">{selectedDoc.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
        {selectedDoc?.file_url && (
          <a
            href={resolveDocFileUrl(selectedDoc.file_url)}
            download
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-md border border-[#0F766E] bg-white px-4 py-2 text-sm font-bold text-[#0F766E] hover:bg-[#0F766E] hover:text-white transition flex justify-center items-center gap-2"
          >
            <HiArrowDownTray className="h-4 w-4" /> Download
          </a>
        )}
      </div>
    </div>
  </Modal>

    </div >
  );
}
