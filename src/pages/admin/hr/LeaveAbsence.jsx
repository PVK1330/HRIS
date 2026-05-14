import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiPlus, HiEye, HiCheck, HiXMark,
  HiMagnifyingGlass, HiUsers, HiClock, HiCheckCircle, HiXCircle,
  HiInformationCircle, HiArrowsUpDown
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import {
  listLeave, applyLeave, processLeave, listBalances, getLeaveTypes,
  getEmployeeLeave,
} from '../../../services/leaveService.js';
import { listEmployees } from '../../../services/employeeService.js';

const basicFieldClass = 'w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/25';

function colLabel(text) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {text}
      <HiArrowsUpDown className="h-3 w-3 shrink-0 opacity-45" aria-hidden />
    </span>
  );
}

const EMPTY_FORM = {
  employeeId: '', leaveType: '', fromDate: '', toDate: '',
  totalDays: '', reason: '', handoverNote: '',
};

function statusColor(s) {
  if (s === 'Approved')  return 'bg-green-100 text-green-700 ring-green-600/20';
  if (s === 'Pending')   return 'bg-orange-100 text-orange-700 ring-orange-600/20';
  if (s === 'Rejected')  return 'bg-red-100 text-red-700 ring-red-600/20';
  if (s === 'Cancelled') return 'bg-slate-100 text-slate-700 ring-slate-600/20';
  return 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

function countDays(from, to) {
  if (!from || !to) return 0;
  const diff = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}

export default function LeaveAbsence() {
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statusF, setStatusF] = useState('');
  const [year, setYear] = useState(currentYear);

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
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

  const fetchRequests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listLeave({ year, status: statusF, department: dept, search });
      setRequests(data.requests || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err?.message || 'Failed to load leave requests');
    } finally { setLoading(false); }
  }, [year, statusF, dept, search]);

  const fetchBalances = useCallback(async () => {
    setLoadingBal(true);
    try {
      const data = await listBalances({ year, department: dept, search });
      setBalances(data.balances || []);
    } catch { /* */ }
    finally { setLoadingBal(false); }
  }, [year, dept, search]);

  const fetchLeaveTypes = useCallback(async () => {
    if (leaveTypes.length > 0) return;
    try {
      const res = await getLeaveTypes();
      setLeaveTypes((res?.data?.leaveTypes || []).filter(t => t.isActive !== false));
    } catch { /* */ }
  }, [leaveTypes.length]);

  const fetchEmpList = useCallback(async () => {
    if (empList.length > 0) return;
    try {
      const data = await listEmployees({ limit: 100 });
      setEmpList(data?.employees || []);
    } catch { /* */ }
  }, [empList.length]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { if (activeTab === 'balances') fetchBalances(); }, [activeTab, fetchBalances]);

  useEffect(() => { setCurrentPage(1); setBalancesPage(1); }, [search, dept, statusF, year]);

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
    fetchEmpList(); fetchLeaveTypes();
    setForm(EMPTY_FORM); setLiveBalance(null);
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
        employeeId: parseInt(form.employeeId),
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        totalDays: days,
        reason: form.reason,
        handoverNote: form.handoverNote || undefined,
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
                   : 'cancel';
      await processLeave(selected.id, { action, reason: actionReason || undefined });
      toast.success(`Leave ${action}d successfully`);
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

  const pendingReqs  = useMemo(() => requests.filter(r => r.status === 'Pending'),  [requests]);
  const approvedReqs = useMemo(() => requests.filter(r => r.status === 'Approved'), [requests]);
  const rejectedReqs = useMemo(() => requests.filter(r => r.status === 'Rejected'), [requests]);

  const formDays = countDays(form.fromDate, form.toDate);
  const selectedTypeCfg = leaveTypes.find(t => t.name === form.leaveType);
  const balanceRemaining = liveBalance ? (liveBalance.total_allocated + liveBalance.carry_forward) - liveBalance.used : null;
  const balanceInsufficient = (
    selectedTypeCfg && selectedTypeCfg.paidOrUnpaid !== 'Unpaid' &&
    liveBalance !== null && formDays > 0 && balanceRemaining < formDays
  );

  const requestCols = (showActions = false) => [
    {
      key: 'employee_name', label: colLabel('Employee'),
      render: (v, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-600 shadow-sm">
            {(v || '?').charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{v}</div>
            <div className="truncate text-xs font-mono text-slate-500">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'leave_type', label: colLabel('Type'), render: (v) => <span className="text-sm font-semibold text-slate-700">{v}</span> },
    {
      key: 'range', label: colLabel('Period'),
      render: (_, row) => <span className="text-xs font-semibold text-slate-700">{row.from_date} → {row.to_date}</span>,
    },
    {
      key: 'total_days', label: 'Days',
      render: (v) => <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-600/20">{v}d</span>,
    },
    {
      key: 'balance_remaining', label: 'Remaining',
      render: (v, row) => {
        if (v === null || v === undefined) return <span className="text-xs text-slate-300">—</span>;
        const low = v <= 2;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-bold ${low ? 'text-red-600' : 'text-[#0F766E]'}`}>{v}d left</span>
            <span className="text-[10px] text-slate-400 font-medium">{row.balance_used ?? 0} used / {row.total_allocated ?? 0}</span>
          </div>
        );
      },
    },
    {
      key: 'status', label: colLabel('Status'),
      render: (v) => <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor(v)}`}>{v}</span>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => { setSelected(row); setViewModal(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100" aria-label="View">
            <HiEye className="h-4 w-4" />
          </button>
          {showActions && row.status === 'Pending' && (
            <>
              <button type="button" onClick={() => openAction(row, 'Approve')} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-[#10B981] text-white transition-colors hover:bg-[#059669]" aria-label="Approve">
                <HiCheck className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => openAction(row, 'Reject')} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-[#EF4444] text-white transition-colors hover:bg-[#DC2626]" aria-label="Reject">
                <HiXMark className="h-4 w-4" />
              </button>
            </>
          )}
          {showActions && row.status === 'Approved' && (
            <button type="button" onClick={() => openAction(row, 'Cancel')} className="inline-flex h-8 items-center justify-center rounded-none border border-slate-200 bg-slate-100 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-200">
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const balanceCols = [
    {
      key: 'employee_name', label: colLabel('Employee'),
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">{v}</span>
          <span className="text-xs font-mono text-slate-500">{row.emp_id} · {row.department}</span>
        </div>
      ),
    },
    { key: 'job_title', label: colLabel('Designation'), render: (v) => <span className="text-sm text-slate-700 font-medium">{v}</span> },
    {
      key: 'balances', label: 'Leave Balances',
      render: (v) => {
        if (!v || v.length === 0) return <span className="text-xs text-slate-300">No balances</span>;
        return (
          <div className="flex flex-wrap gap-1.5 py-1">
            {v.map(b => {
              const rem = b.remaining ?? (b.total_allocated + b.carry_forward - b.used);
              const low = rem <= 2;
              return (
                <div key={b.leave_type} className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${low ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-slate-50 text-slate-700 ring-slate-600/20'}`}>
                  <span className="mr-1 opacity-70">{b.leave_type.split(' ')[0]}:</span>
                  <span className={low ? 'text-red-700' : 'text-[#0F766E]'}>{rem}</span>
                  <span className="opacity-50">/{b.total_allocated}</span>
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 pb-10">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Leave & Absence</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>HR Operations</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Absence Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openApplyModal}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" /> Add Leave Request
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL REQUESTS', count: stats?.total ?? '—', bgColor: 'bg-[#3B82F6]', icon: HiUsers, year: year },
          { label: 'PENDING', count: stats?.pending ?? '—', bgColor: 'bg-[#F59E0B]', icon: HiClock, subtitle: 'Awaiting' },
          { label: 'APPROVED', count: stats?.approved ?? '—', bgColor: 'bg-[#10B981]', icon: HiCheckCircle, subtitle: 'This Year' },
          { label: 'REJECTED', count: stats?.rejected ?? '—', bgColor: 'bg-[#EF4444]', icon: HiXCircle, subtitle: 'This Year' }
        ].map((card, idx) => (
          <div key={idx} className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate leading-none">
                {card.label}
              </div>
              <div className="mt-1.5 flex items-end gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</span>
                {card.year && <span className="text-[10px] font-bold text-slate-400 mb-0.5">{card.year}</span>}
                {card.subtitle && <span className="text-[10px] font-bold text-slate-400 mb-0.5">{card.subtitle}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {[{ id: 'requests', label: 'Approval Workflow' }, { id: 'balances', label: 'Balance Summary' }].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Common Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-none p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-none border border-slate-300 bg-slate-50 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
          />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="h-9 rounded-none border border-slate-300 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium min-w-[140px]">
          <option value="">All Statuses</option>
          {['Pending','Approved','Rejected','Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="h-9 rounded-none border border-slate-300 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium w-24">
          {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y}>{y}</option>)}
        </select>
        <button
          type="button"
          onClick={() => { setSearch(''); setStatusF(''); setDept(''); setYear(currentYear); }}
          className="h-9 inline-flex items-center rounded-none border border-dashed border-slate-300 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {error && <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Content */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {[
            { label: 'Pending Requests', data: pendingReqs, borderColor: 'border-orange-500', bgHeader: 'bg-orange-500', showActions: true },
            { label: 'Approved History', data: approvedReqs, borderColor: 'border-[#10B981]', bgHeader: 'bg-[#10B981]', showActions: true },
            { label: 'Rejected Records', data: rejectedReqs, borderColor: 'border-red-500', bgHeader: 'bg-red-500', showActions: false },
          ].map(({ label, data, borderColor, bgHeader, showActions }) => (
            <div key={label} className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <div className={`flex items-center justify-between border-b ${borderColor} ${bgHeader} px-5 py-3`}>
                <h2 className="text-sm font-semibold text-white">{label}</h2>
                <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/40">{data.length}</span>
              </div>
              <Table 
                columns={requestCols(showActions)} 
                data={data} 
                pageSize={5} 
                square 
                loading={loading}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Leave Balances — {year}</h2>
            <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/40">{balances.length} Employees</span>
          </div>
          <Table 
            columns={balanceCols} 
            data={balances} 
            pageSize={10} 
            square 
            loading={loadingBal}
            totalCount={balances.length}
            currentPage={balancesPage - 1}
            onPageChange={(idx) => setBalancesPage(idx + 1)}
          />
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={applyModal} onClose={closeApplyModal} showClose size="lg"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Submit Leave Request</h2>
            <p className="text-xs font-medium text-slate-500">Apply for new leave, ensuring balance rules are met.</p>
          </div>
        }
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Employee <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className={basicFieldClass} required>
                <option value="">Select employee…</option>
                {empList.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.emp_id})</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Leave Type <span className="text-red-500">*</span></label>
              <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} className={basicFieldClass} required>
                <option value="">Select leave type…</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name}{t.annualEntitlementDays > 0 ? ` (${t.annualEntitlementDays}d/yr)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Balance Info Panel */}
            {form.employeeId && form.leaveType && (
              <div className={`md:col-span-2 flex items-start gap-2.5 p-3 text-sm border rounded-none ${
                loadingBalance ? 'bg-slate-50 border-slate-200 text-slate-500'
                : balanceInsufficient ? 'bg-red-50 border-red-200 text-red-700'
                : liveBalance ? 'bg-[#0F766E]/5 border-[#0F766E]/20 text-[#0F766E]'
                : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <HiInformationCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {loadingBalance ? (
                  <span className="font-medium">Checking balance…</span>
                ) : liveBalance ? (
                  <div className="font-medium">
                    <span className="font-bold">{form.leaveType} balance: </span>
                    <span className={balanceInsufficient ? 'font-bold text-red-700' : 'font-bold'}>
                      {balanceRemaining} day{balanceRemaining !== 1 ? 's' : ''} remaining
                    </span>
                    <span className="text-slate-500"> ({liveBalance.used} used / {liveBalance.total_allocated} allocated)</span>
                    {formDays > 0 && (
                      <span className={`ml-2 font-bold ${balanceInsufficient ? 'text-red-600' : 'text-slate-600'}`}>
                        — Requesting {formDays}d
                        {balanceInsufficient ? ' ⚠ Insufficient' : ' ✓'}
                      </span>
                    )}
                  </div>
                ) : selectedTypeCfg?.paidOrUnpaid === 'Unpaid' ? (
                  <span className="font-medium">Unpaid leave — no balance required</span>
                ) : (
                  <span className="font-medium">No balance record yet — will be seeded from entitlement on submit</span>
                )}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">From Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className={basicFieldClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">To Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.toDate} min={form.fromDate || undefined} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className={basicFieldClass} required />
            </div>

            {formDays > 0 && (
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration:</span>
                <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${balanceInsufficient ? 'bg-red-100 text-red-700 ring-red-600/20' : 'bg-blue-100 text-blue-700 ring-blue-600/20'}`}>
                  {formDays} day{formDays !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Reason <span className="text-red-500">*</span></label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className={basicFieldClass} placeholder="Brief justification…" rows={3} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Handover Note</label>
              <textarea value={form.handoverNote} onChange={e => setForm(f => ({ ...f, handoverNote: e.target.value }))} className={basicFieldClass} placeholder="Work handover details…" rows={2} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={closeApplyModal}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting || balanceInsufficient}
              className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} showClose size="md"
          header={
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-slate-900">Leave Request Detail</h2>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-none text-slate-900">
              <p className="text-lg font-bold">{selected.employee_name}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">{selected.emp_id} · {selected.department}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Leave Type', selected.leave_type],
                ['Status', selected.status],
                ['From', selected.from_date],
                ['To', selected.to_date],
                ['Total Days', `${selected.total_days} day(s)`],
                ['Approved By', selected.approved_by_name || '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-white p-3 border border-slate-200 rounded-none">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{val}</p>
                </div>
              ))}
            </div>
            <div className="bg-white p-3 border border-slate-200 rounded-none">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
              <p className="text-sm text-slate-700">{selected.reason}</p>
            </div>
            {selected.rejection_reason && (
              <div className="bg-red-50 p-3 border border-red-200 rounded-none">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Rejection Reason</p>
                <p className="text-sm text-red-800">{selected.rejection_reason}</p>
              </div>
            )}
            {selected.status === 'Pending' && (
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => { setViewModal(false); openAction(selected, 'Reject'); }}
                  className="rounded-md bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626] transition">Reject</button>
                <button onClick={() => { setViewModal(false); openAction(selected, 'Approve'); }}
                  className="rounded-md bg-[#10B981] px-4 py-2 text-sm font-semibold text-white hover:bg-[#059669] transition">Approve</button>
              </div>
            )}
            {selected.status === 'Approved' && (
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => { setViewModal(false); openAction(selected, 'Cancel'); }}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Cancel Leave (Restore Balance)
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Action Modal */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason(''); }} showClose size="sm"
          header={
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-slate-900">{actionType} Leave Request</h2>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-700">
              {actionType === 'Cancel' && selected?.status === 'Approved'
                ? <>Cancel approved leave for <strong>{selected?.employee_name}</strong>? The <strong>{selected?.total_days} day(s)</strong> will be <span className="text-[#0F766E] font-bold">restored</span> to their balance.</>
                : <>{actionType} leave request for <strong>{selected?.employee_name}</strong>?</>
              }
              <br /><span className="text-xs text-slate-500 block mt-1">{selected?.leave_type} · {selected?.from_date} → {selected?.to_date} ({selected?.total_days}d)</span>
            </p>
            {(actionType === 'Reject' || actionType === 'Cancel') && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Reason <span className="text-red-500">*</span></label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className={basicFieldClass} placeholder={`Reason for ${actionType.toLowerCase()}…`} rows={3} />
              </div>
            )}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => { setActionModal(false); setActionReason(''); }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Back
              </button>
              <button type="button" onClick={handleProcess} disabled={submitting || ((actionType === 'Reject' || actionType === 'Cancel') && !actionReason)}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  actionType === 'Approve' ? 'bg-[#10B981] hover:bg-[#059669]'
                  : actionType === 'Reject' ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                  : 'bg-[#0F766E] hover:bg-[#0c6b64]'
                }`}>
                {submitting ? 'Processing…' : actionType}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
