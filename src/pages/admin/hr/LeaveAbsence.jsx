import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiPlus, HiEye, HiCheck, HiXMark,
  HiMagnifyingGlass, HiUsers, HiClock, HiCheckCircle,
  HiArrowDownTray, HiCalendarDays
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import {
  listLeave, applyLeave, processLeave, listBalances, getLeaveTypes,
  getEmployeeLeave, exportLeave,
} from '../../../services/leaveService.js';
import { getAttendanceDashboard } from '../../../services/attendanceService.js';
import { listEmployees } from '../../../services/employeeService.js';
import AddLeaveModal from '../../../components/leave/AddLeaveModal.jsx';
import HolidayListWidget from '../../../components/attendance/HolidayListWidget.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { canApproveLeave, canApplyLeave } from '../../../utils/rbac.js';

const EMPTY_FORM = {
  employeeId: '', leaveTypeId: '', fromDate: '', toDate: '',
  totalDays: '', reason: '', handoverNote: '', supportingDocumentUrl: '',
};

function statusColor(s) {
  if (s === 'Approved')                  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s === 'Pending HR Approval')       return 'bg-blue-50 text-blue-700 border-blue-100';
  if (s === 'Pending Dept Approval')     return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  if (s === 'Pending Manager Approval')  return 'bg-amber-50 text-amber-700 border-amber-100';
  if (s === 'Draft')                     return 'bg-slate-50 text-slate-700 border-slate-200';
  if (s === 'Rejected by Manager' || s === 'Rejected by Dept' || s === 'Rejected by HR')
                                         return 'bg-red-50 text-red-700 border-red-100';
  if (s === 'Cancelled')                 return 'bg-slate-50 text-slate-600 border-slate-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
}

function statusLabel(s) {
  return String(s || '').replace(/_/g, ' ');
}

function countDays(from, to) {
  if (!from || !to) return 0;
  const diff = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}

export default function LeaveAbsence() {
  const { user, allowedModules } = useAuth();
  const canApprove = canApproveLeave(allowedModules);
  const canApply = canApplyLeave(allowedModules);
  const selfEmployeeId = user?.employeeId ? String(user.employeeId) : '';
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statusF, setStatusF] = useState('');
  const [leaveTypeF, setLeaveTypeF] = useState('');
  const [year, setYear] = useState(currentYear);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExportOpen(false);
    setExporting(true);
    try {
      await exportLeave(format, {
        year, status: statusF, leaveType: leaveTypeF, department: dept, search,
      });
      toast.success(`Leave ${format === 'pdf' ? 'PDF' : 'Excel'} downloaded`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBal, setLoadingBal] = useState(false);
  const [error, setError] = useState('');

  const [applyModal, setApplyModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [liveBalance, setLiveBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [selected, setSelected] = useState(null);

  const [viewModal, setViewModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [balancesPage, setBalancesPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchRequests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listLeave({ year, status: statusF, department: dept, search, leaveType: leaveTypeF });
      setRequests(data.requests || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err?.message || 'Failed to load leave requests');
    } finally { setLoading(false); }
  }, [year, statusF, dept, search, leaveTypeF]);

  const fetchBalances = useCallback(async () => {
    setLoadingBal(true);
    try {
      const data = await listBalances({ year, department: dept, search });
      setBalances(data.balances || []);
    } catch { /* */ }
    finally { setLoadingBal(false); }
  }, [year, dept, search]);

  const fetchAttendanceSummary = useCallback(async () => {
    try {
      const res = await getAttendanceDashboard();
      setAttendance(res?.widgets || null);
    } catch { /* attendance snapshot is best-effort */ }
  }, []);

  const fetchLeaveTypes = useCallback(async () => {
    if (leaveTypes.length > 0) return;
    try {
      const res = await getLeaveTypes();
      setLeaveTypes((res?.data?.leaveTypes || []).filter(t => t.isActive !== false));
    } catch { /* */ }
  }, [leaveTypes.length]);

  const fetchEmpList = useCallback(async () => {
    if (empList.length > 0) return;
    if (!canApprove && selfEmployeeId) {
      const name = user?.name || 'Me';
      setEmpList([{ id: Number(selfEmployeeId), first_name: name, last_name: '' }]);
      return;
    }
    try {
      const data = await listEmployees({ limit: 100 });
      setEmpList(data?.employees || []);
    } catch { /* */ }
  }, [empList.length, canApprove, selfEmployeeId, user?.name]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { if (activeTab === 'balances') fetchBalances(); }, [activeTab, fetchBalances]);
  useEffect(() => { fetchLeaveTypes(); }, [fetchLeaveTypes]);
  useEffect(() => { fetchAttendanceSummary(); }, [fetchAttendanceSummary]);

  useEffect(() => { setCurrentPage(1); setBalancesPage(1); }, [search, dept, statusF, year, leaveTypeF]);

  useEffect(() => {
    if (!form.fromDate || !form.toDate) return;
    const d = countDays(form.fromDate, form.toDate);
    if (d > 0) setForm(f => ({ ...f, totalDays: String(d) }));
  }, [form.fromDate, form.toDate]);

  useEffect(() => {
    if (!form.employeeId || !form.leaveType) { setLiveBalance(null); return; }
    const yr = form.fromDate ? new Date(form.fromDate).getFullYear() : currentYear;
    setLoadingBalance(true);
    getEmployeeLeave(form.employeeId, { year: yr })
      .then(data => {
        const bal = (data?.balances || []).find(
          b => b.leave_type?.toLowerCase() === form.leaveType?.toLowerCase()
        );
        setLiveBalance(bal || null);
      })
      .catch(() => setLiveBalance(null))
      .finally(() => setLoadingBalance(false));
  }, [form.employeeId, form.leaveType, form.fromDate, currentYear]);

  const openApplyModal = () => {
    if (!canApply) {
      toast.error('You do not have permission to apply for leave');
      return;
    }
    fetchEmpList(); fetchLeaveTypes();

    const defaultEmp = selfEmployeeId || (empList.length > 0 ? String(empList[0].id) : '');

    setForm({ ...EMPTY_FORM, employeeId: defaultEmp });
    setLiveBalance(null);
    setApplyModal(true);
  };

  const closeApplyModal = () => {
    setApplyModal(false); setForm(EMPTY_FORM); setLiveBalance(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    const days = parseInt(form.totalDays) || countDays(form.fromDate, form.toDate);
    if (days <= 0) { toast.error('Invalid date range'); return; }

    const selectedType = leaveTypes.find(t => t.name === form.leaveType);
    if (selectedType && selectedType.paidOrUnpaid !== 'Unpaid' && liveBalance) {
      const remaining = (liveBalance.total_allocated + liveBalance.carry_forward) - liveBalance.used;
      if (remaining < days) {
        toast.error(`Insufficient balance. Available: ${remaining}d`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await applyLeave({
        employeeId: parseInt(form.employeeId, 10),
        leaveTypeId: parseInt(form.leaveTypeId, 10),
        fromDate: form.fromDate,
        toDate: form.toDate,
        totalDays: parseInt(form.totalDays, 10),
        reason: form.reason,
        handoverNote: form.handoverNote,
        supportingDocumentUrl: form.supportingDocumentUrl,
        isDraft: form.isDraft,
      });
      toast.success(result?.autoApproved ? 'Leave auto-approved' : 'Leave request submitted');
      closeApplyModal();
      fetchRequests();
      if (activeTab === 'balances') fetchBalances();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async () => {
    setSubmitting(true);
    try {
      const action = actionType === 'Approve' ? 'approve'
                   : actionType === 'Reject'  ? 'reject'
                   : actionType === 'Submit'  ? 'submit'
                   : 'cancel';
      await processLeave(selected.id, { action, reason: actionReason || undefined });
      toast.success(`Leave ${actionType.toLowerCase()}d successfully`);
      setActionModal(false); setActionReason('');
      fetchRequests();
      if (activeTab === 'balances') fetchBalances();
    } catch (err) {
      toast.error(err?.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const openAction = (row, type) => {
    setSelected(row); setActionType(type); setActionReason(''); setActionModal(true);
  };

  const canManageRequest = (row) => {
    if (canApprove) return true;
    if (!selfEmployeeId) return false;
    return String(row.employee_id) === selfEmployeeId;
  };

  // A request belongs to the logged-in user — no self-approval/reject, even
  // for approvers. Guards against the employee seeing approve/reject on their
  // own leave when the backend grants a self-scoped leave.approve slug.
  const isOwnRequest = (row) => !!selfEmployeeId && String(row.employee_id) === selfEmployeeId;

  // Only true approvers acting on someone else's request may approve/reject.
  const canActOnRequest = (row) => canApprove && !isOwnRequest(row);

  const requestCols = [
    {
      key: 'employee_name', label: 'EMPLOYEE',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm border border-emerald-100">
             <HiUsers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 leading-none mb-1">{v}</div>
            <div className="text-xs font-medium text-slate-500">{row.department}</div>
          </div>
        </div>
      ),
    },
    { key: 'leave_type', label: 'LEAVE TYPE', render: (v) => <span className="text-sm font-semibold text-slate-700">{v}</span> },
    {
      key: 'from_date', label: 'FROM',
      render: (v) => <span className="text-sm text-slate-600">{v}</span>,
    },
    {
      key: 'to_date', label: 'TO',
      render: (v) => <span className="text-sm text-slate-600">{v}</span>,
    },
    {
      key: 'total_days', label: 'DAYS',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>,
    },
    {
      key: 'status', label: 'STATUS',
      render: (v) => <span className={`inline-flex items-center rounded-none px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${statusColor(v)}`}>{statusLabel(v)}</span>,
    },
    {
      key: 'actions', label: 'ACTIONS',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setSelected(row); setViewModal(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700" title="View details">
            <HiEye className="h-4 w-4" />
          </button>
          {canActOnRequest(row) && (row.status === 'Pending Manager Approval' || row.status === 'Pending Dept Approval' || row.status === 'Pending HR Approval') && (
            <>
              <button type="button" title="Approve" onClick={() => openAction(row, 'Approve')} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">
                <HiCheck className="h-4 w-4" />
              </button>
              <button type="button" title="Reject" onClick={() => openAction(row, 'Reject')} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors">
                <HiXMark className="h-4 w-4" />
              </button>
            </>
          )}
          {canApply && canManageRequest(row) && row.status === 'Draft' && (
            <button type="button" title="Submit" onClick={() => openAction(row, 'Submit')} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors">
               <HiCheck className="h-4 w-4" />
            </button>
          )}
          {canApply && canManageRequest(row) && (row.status === 'Pending Manager Approval' || row.status === 'Pending Dept Approval' || row.status === 'Pending HR Approval' || row.status === 'Draft' || row.status === 'Approved') && (
            <button type="button" title="Cancel" onClick={() => openAction(row, 'Cancel')} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700">
               <HiArrowDownTray className="h-4 w-4 rotate-180" />
            </button>
          )}</div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">
      {/* Header section matching Holidays layout */}
      <div className="flex items-center justify-between min-w-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage Leaves</h2>
          <p className="text-xs font-medium text-slate-500">View and process employee leave requests and absences.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              disabled={exporting}
              onClick={() => setExportOpen((o) => !o)}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 shadow-sm disabled:opacity-50"
            >
              <HiArrowDownTray className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export'}
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-none border border-slate-200 bg-white shadow-lg">
                  <button type="button" onClick={() => handleExport('excel')} className="block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Excel (.xlsx)</button>
                  <button type="button" onClick={() => handleExport('pdf')} className="block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">PDF (.pdf)</button>
                </div>
              </>
            )}
          </div>
          {canApply ? (
            <button onClick={openApplyModal} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
              <HiPlus className="h-4 w-4" /> Add Leave
            </button>
          ) : null}
        </div>
      </div>

      {/* KPI Cards — driven by live attendance snapshot + leave stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'Present Today',
            value: attendance ? `${attendance.present_today ?? 0}/${attendance.total_employees ?? 0}` : '—',
            sub: attendance?.attendance_rate != null ? `${attendance.attendance_rate}% attendance rate` : 'Live attendance snapshot',
            accent: 'bg-emerald-50 text-[#0F766E] border-emerald-100',
            icon: HiUsers,
          },
          {
            label: 'On Leave Today',
            value: attendance ? String(attendance.on_leave ?? 0) : '—',
            sub: 'Employees absent on approved leave',
            accent: 'bg-amber-50 text-amber-600 border-amber-100',
            icon: HiCalendarDays,
          },
          {
            label: 'Approved Leaves',
            value: stats ? String(stats.approved ?? 0) : '—',
            sub: `${year} calendar year`,
            accent: 'bg-sky-50 text-sky-600 border-sky-100',
            icon: HiCheckCircle,
          },
          {
            label: 'Pending Requests',
            value: stats ? String(stats.pending ?? 0) : '—',
            sub: 'Awaiting manager / HR approval',
            accent: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            icon: HiClock,
          },
        ].map((card, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</div>
              <div className="mt-1.5 text-2xl font-black text-slate-900">{card.value}</div>
              <div className="mt-0.5 truncate text-[10px] font-medium text-slate-400">{card.sub}</div>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none border ${card.accent}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { key: 'requests', label: 'Leave Requests' },
          { key: 'holidays', label: 'Holiday Listing' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === t.key ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
            {activeTab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#0F766E]" />
            )}
          </button>
        ))}
      </div>

      {/* Main Panel matching Table layout */}
      {activeTab === 'requests' && (
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Leave Listing</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leave name..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-10 min-w-[120px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
            >
              {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y}>{y} Calendar</option>
              ))}
            </select>
            <select
              value={statusF}
              onChange={(e) => setStatusF(e.target.value)}
              className="h-10 min-w-[150px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">All Statuses</option>
              {['Draft','Pending Manager Approval','Pending Dept Approval','Pending HR Approval','Approved','Rejected by Manager','Rejected by Dept','Rejected by HR','Cancelled'].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <select
              value={leaveTypeF}
              onChange={(e) => setLeaveTypeF(e.target.value)}
              className="h-10 min-w-[150px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">All Leave Types</option>
              {leaveTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{requests.length} records shown</p>
            {(search || statusF || leaveTypeF || year !== currentYear) ? (
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusF(''); setLeaveTypeF(''); setYear(currentYear); }}
                className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        <Table 
          columns={requestCols} 
          data={requests} 
          pageSize={pageSize} 
          loading={loading}
          square
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
        />
      </div>
      )}

      {activeTab === 'holidays' && <HolidayListWidget />}

      <AddLeaveModal
        isOpen={applyModal}
        onClose={closeApplyModal}
        leaveTypes={leaveTypes}
        empList={empList}
        liveBalance={liveBalance}
        onSubmit={handleApplySubmit}
        submitting={submitting}
        form={form}
        setForm={setForm}
        lockEmployee={!canApprove && !!selfEmployeeId}
      />

      {/* View Detail Modal */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} size="md" showClose header={
          <div className="flex flex-col gap-1">
             <h2 className="text-lg font-bold text-slate-900">Leave Details</h2>
             <p className="text-xs font-medium text-slate-500">View information and history for this leave request.</p>
          </div>
        }>
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
               <div className="h-12 w-12 rounded-none bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                 <HiUsers className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-lg font-bold text-slate-800 leading-none mb-1">{selected.employee_name}</p>
                 <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{selected.emp_id} • {selected.department}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Leave Type</p>
                <p className="text-sm font-bold text-slate-800">{selected.leave_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${statusColor(selected.status)}`}>{statusLabel(selected.status)}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">From Date</p>
                <p className="text-sm font-bold text-slate-800">{selected.from_date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">To Date</p>
                <p className="text-sm font-bold text-slate-800">{selected.to_date}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-none border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Reason provided</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{selected.reason}</p>
            </div>

            {selected.rejection_reason && (
              <div className="bg-red-50 p-4 rounded-none border border-red-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Rejection Reason</p>
                <p className="text-sm font-semibold text-red-700">{selected.rejection_reason}</p>
              </div>
            )}
            
            {canActOnRequest(selected) && (selected.status === 'Pending Manager Approval' || selected.status === 'Pending Dept Approval' || selected.status === 'Pending HR Approval') && (
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button onClick={() => { setViewModal(false); openAction(selected, 'Reject'); }} className="px-5 py-2 rounded-none bg-white border border-red-200 text-sm font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition">Reject</button>
                <button onClick={() => { setViewModal(false); openAction(selected, 'Approve'); }} className="px-5 py-2 rounded-none bg-[#0F766E] text-sm font-bold uppercase tracking-wider text-white hover:bg-[#0c6b64] shadow-sm transition">Approve</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Action Confirmation Modal */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason(''); }} size="sm" showClose header={
          <div className="flex flex-col gap-1">
             <h2 className="text-lg font-bold text-slate-900">Confirm Action</h2>
          </div>
        }>
          <div className="space-y-6 pt-4">
            <div className="p-4 rounded-none bg-slate-50 text-sm text-slate-700 border border-slate-200 font-medium">
                Are you sure you want to {actionType.toLowerCase()} this leave request for <span className="font-bold">{selected?.employee_name}</span>?
            </div>
            
            {(actionType === 'Reject' || actionType === 'Cancel') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reason <span className="text-red-500">*</span></label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className="w-full rounded-none border border-slate-300 bg-white p-3 text-sm font-medium outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]" placeholder="Please provide a reason..." rows={3} />
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => { setActionModal(false); setActionReason(''); }} className="px-5 py-2 rounded-none bg-white border border-slate-300 text-sm font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button type="button" onClick={handleProcess} disabled={submitting || ((actionType === 'Reject' || actionType === 'Cancel') && !actionReason)}
                className={`px-5 py-2 rounded-none text-sm font-bold uppercase tracking-wider text-white transition shadow-sm disabled:opacity-50 ${
                  actionType === 'Approve' ? 'bg-[#0F766E] hover:bg-[#0c6b64]'
                  : actionType === 'Reject' ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-slate-800 hover:bg-slate-900'
                }`}>
                {submitting ? 'Saving...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
