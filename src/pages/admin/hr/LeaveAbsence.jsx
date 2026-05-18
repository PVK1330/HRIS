import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiPlus, HiEye, HiCheck, HiXMark,
  HiMagnifyingGlass, HiUsers, HiClock, HiCheckCircle, HiXCircle,
  HiInformationCircle, HiArrowsUpDown
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import {
  listLeave, applyLeave, processLeave, listBalances, getLeaveTypes,
  getEmployeeLeave,
} from '../../../services/leaveService.js';
import { listEmployees } from '../../../services/employeeService.js';

const basicFieldClass = 'w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none transition focus:border-[#0F766E]';

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
  if (s === 'Approved')  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s === 'Pending')   return 'bg-orange-50 text-orange-700 border-orange-100';
  if (s === 'Rejected')  return 'bg-red-50 text-red-700 border-red-100';
  if (s === 'Cancelled') return 'bg-slate-50 text-slate-600 border-slate-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
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
      key: 'employee_name', label: colLabel('ABSENCE_ENTITY'),
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-slate-900 text-white shadow-sm border border-slate-800">
             <HiUsers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{v}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'leave_type', label: colLabel('PROTOCOL_CLASS'), render: (v) => <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{v}</span> },
    {
      key: 'range', label: colLabel('TEMPORAL_WINDOW'),
      render: (_, row) => <span className="text-[10px] font-bold text-slate-500">{row.from_date} — {row.to_date}</span>,
    },
    {
      key: 'total_days', label: 'METRIC',
      render: (v) => <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-100">{v}D</span>,
    },
    {
      key: 'balance_remaining', label: 'RESIDUAL',
      render: (v, row) => {
        if (v === null || v === undefined) return <span className="text-[9px] text-slate-300 font-black tracking-widest">UNSET</span>;
        const low = v <= 2;
        return (
          <div className="flex flex-col">
            <span className={`text-[10px] font-black tracking-tight ${low ? 'text-red-600' : 'text-[#0F766E]'}`}>{v}D_REMAINING</span>
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{row.balance_used ?? 0} USED / {row.total_allocated ?? 0} ALLOC</span>
          </div>
        );
      },
    },
    {
      key: 'status', label: colLabel('LIFECYCLE'),
      render: (v) => <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${statusColor(v)}`}>{v}</span>,
    },
    {
      key: 'actions', label: 'COMMAND',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => { setSelected(row); setViewModal(true); }} className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] shadow-sm">
            <HiEye className="h-4 w-4" />
          </button>
          {showActions && row.status === 'Pending' && (
            <>
              <button type="button" onClick={() => openAction(row, 'Approve')} className="h-8 w-8 flex items-center justify-center rounded-none bg-[#0F766E] text-white hover:bg-[#0c6b64] shadow-sm">
                <HiCheck className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => openAction(row, 'Reject')} className="h-8 w-8 flex items-center justify-center rounded-none bg-red-600 text-white hover:bg-red-700 shadow-sm">
                <HiXMark className="h-4 w-4" />
              </button>
            </>
          )}
          {showActions && row.status === 'Approved' && (
            <button type="button" onClick={() => openAction(row, 'Cancel')} className="h-8 px-3 rounded-none border border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all">
              ABORT
            </button>
          )}
        </div>
      ),
    },
  ];

  const balanceCols = [
    {
      key: 'employee_name', label: colLabel('ENTITY_ID'),
      render: (v, row) => (
        <div className="flex flex-col py-1">
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{v}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.emp_id} · {row.department}</span>
        </div>
      ),
    },
    { key: 'job_title', label: colLabel('DESIGNATION'), render: (v) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v}</span> },
    {
      key: 'balances', label: 'ABSENCE_POOL_DISTRIBUTION',
      render: (v) => {
        if (!v || v.length === 0) return <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ZERO_POOL</span>;
        return (
          <div className="flex flex-wrap gap-2 py-1">
            {v.map(b => {
              const rem = b.remaining ?? (b.total_allocated + b.carry_forward - b.used);
              const low = rem <= 2;
              return (
                <div key={b.leave_type} className={`inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${low ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                  <span className="mr-1.5 opacity-50">{b.leave_type.split(' ')[0]}:</span>
                  <span className={low ? 'text-red-700' : 'text-[#0F766E]'}>{rem}</span>
                  <span className="opacity-30 ml-0.5">/{b.total_allocated}</span>
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-w-0 pb-16">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0 border-b border-slate-100 pb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Absence Governance</h1>
          <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Temporal Resource Orchestration & Compliance Audit</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openApplyModal}
            className="h-10 inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
          >
            <HiPlus className="h-4 w-4" /> Initialize Request
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'TOTAL_TRANSACTIONS', count: stats?.total ?? '0', bgColor: 'bg-slate-900', icon: HiUsers, year: year },
          { label: 'AWAITING_PROTOCOL', count: stats?.pending ?? '0', bgColor: 'bg-orange-500', icon: HiClock },
          { label: 'APPROVED_UNITS', count: stats?.approved ?? '0', bgColor: 'bg-emerald-500', icon: HiCheckCircle },
          { label: 'REJECTED_AUDITS', count: stats?.rejected ?? '0', bgColor: 'bg-red-500', icon: HiXCircle }
        ].map((card, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-none border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate leading-none mb-2">
                {card.label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</span>
                {card.year && <span className="text-[10px] font-black text-slate-400">{card.year}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-10" aria-label="Tabs">
          {[{ id: 'requests', label: 'AUDIT_WORKFLOW' }, { id: 'balances', label: 'RESIDUAL_LEDGER' }].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Common Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm flex flex-col md:flex-row md:items-end gap-6">
        <div className="flex-1">
          <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Search</label>
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
                type="text"
                placeholder="NAME, ID OR DIVISION..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-none border border-slate-200 bg-slate-50/50 px-4 pl-11 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
            <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
            <select value={statusF} onChange={e => setStatusF(e.target.value)} className="h-12 w-full rounded-none border border-slate-200 bg-slate-50/50 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none appearance-none cursor-pointer">
                <option value="">ALL_STATUS_PROTOCOLS</option>
                {['Pending','Approved','Rejected','Cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
        </div>
        <div className="w-full md:w-32">
            <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiscal Year</label>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="h-12 w-full rounded-none border border-slate-200 bg-slate-50/50 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none appearance-none cursor-pointer">
                {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
        {(search || statusF || year !== currentYear) && (
            <button
                type="button"
                onClick={() => { setSearch(''); setStatusF(''); setDept(''); setYear(currentYear); }}
                className="h-12 px-6 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            >
                RESET_FILTERS
            </button>
        )}
      </div>

      {error && <div className="rounded-none border border-red-200 bg-red-50 px-6 py-4 text-[11px] font-black text-red-700 uppercase tracking-widest">CRITICAL_EXCEPTION: {error}</div>}

      {/* Content */}
      {activeTab === 'requests' && (
        <div className="space-y-10">
          {[
            { label: 'Awaiting Verification', data: pendingReqs, borderColor: 'border-orange-500', bgHeader: 'bg-orange-500', showActions: true },
            { label: 'Authorization History', data: approvedReqs, borderColor: 'border-[#0F766E]', bgHeader: 'bg-[#0F766E]', showActions: true },
            { label: 'Excision Records', data: rejectedReqs, borderColor: 'border-red-500', bgHeader: 'bg-red-500', showActions: false },
          ].map(({ label, data, borderColor, bgHeader, showActions }) => (
            <div key={label} className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <div className={`flex items-center justify-between border-b ${borderColor} ${bgHeader} px-5 py-3.5`}>
                <h2 className="text-[11px] font-black text-white uppercase tracking-widest">{label}</h2>
                <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">{data.length} TRANSACTIONS</span>
              </div>
              <Table 
                columns={requestCols(showActions)} 
                data={data} 
                pageSize={5} 
                square 
                loading={loading}
                className="rounded-none"
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3.5">
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Residual Asset Ledger — {year}</h2>
            <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">{balances.length} ENTITIES_MAPPED</span>
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
            className="rounded-none"
          />
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={applyModal} onClose={closeApplyModal} size="lg" title="ABSENCE_REQUEST_INTERFACE">
        <form onSubmit={handleApplySubmit} className="space-y-10 p-2 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Authorization <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className={basicFieldClass} required>
                <option value="">SELECT_ASSET...</option>
                {empList.map(e => <option key={e.id} value={String(e.id)}>{e.full_name?.toUpperCase()} ({e.emp_id})</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Absence Protocol <span className="text-red-500">*</span></label>
              <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} className={basicFieldClass} required>
                <option value="">SELECT_PROTOCOL_CLASS...</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name.toUpperCase()}{t.annualEntitlementDays > 0 ? ` (${t.annualEntitlementDays}D_LIMIT)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Balance Info Panel */}
            {form.employeeId && form.leaveType && (
              <div className={`md:col-span-2 flex items-start gap-4 p-5 border rounded-none ${
                loadingBalance ? 'bg-slate-50 border-slate-100 text-slate-400'
                : balanceInsufficient ? 'bg-red-50 border-red-100 text-red-700'
                : liveBalance ? 'bg-emerald-50 border-emerald-100 text-[#0F766E]'
                : 'bg-blue-50 border-blue-100 text-blue-700'
              }`}>
                <HiInformationCircle className="h-5 w-5 shrink-0" />
                {loadingBalance ? (
                  <span className="text-[10px] font-black uppercase tracking-widest">Verifying ledger status…</span>
                ) : liveBalance ? (
                  <div className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    <span className="opacity-60">{form.leaveType} RESIDUAL: </span>
                    <span className={balanceInsufficient ? 'text-red-700 underline decoration-2' : ''}>
                      {balanceRemaining} DAYS_AVAILABLE
                    </span>
                    <br/>
                    <span className="opacity-40">({liveBalance.used} USED / {liveBalance.total_allocated} ALLOCATED)</span>
                    {formDays > 0 && (
                      <span className={`ml-4 ${balanceInsufficient ? 'text-red-600' : 'text-slate-500'}`}>
                        — REQUESTING {formDays}D
                        {balanceInsufficient ? ' [CRITICAL_SHORTFALL]' : ' [VERIFIED]'}
                      </span>
                    )}
                  </div>
                ) : selectedTypeCfg?.paidOrUnpaid === 'Unpaid' ? (
                  <span className="text-[10px] font-black uppercase tracking-widest">UNPAID_PROTOCOL — NO_BALANCE_ENFORCEMENT</span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest">ZERO_BALANCE_DETECTED — INITIALIZING_LEDGER_ON_SUBMIT</span>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Inception <span className="text-red-500">*</span></label>
              <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className={basicFieldClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Cessation <span className="text-red-500">*</span></label>
              <input type="date" value={form.toDate} min={form.fromDate || undefined} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className={basicFieldClass} required />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Justification <span className="text-red-500">*</span></label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none min-h-[100px]" placeholder="DEFINE OPERATIONAL PARAMETERS..." required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Handover Documentation</label>
              <textarea value={form.handoverNote} onChange={e => setForm(f => ({ ...f, handoverNote: e.target.value }))} className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none min-h-[80px]" placeholder="AUDIT_NOTES..." />
            </div>
          </div>
          <div className="flex items-center justify-end gap-6 pt-8 border-t border-slate-100">
            <button type="button" onClick={closeApplyModal} className="h-12 px-10 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              ABORT_INTERFACE
            </button>
            <button type="submit" disabled={submitting || balanceInsufficient} className="h-12 px-16 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30">
              {submitting ? 'TRANSMITTING...' : 'COMMIT_REQUEST'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} size="md" title="TRANSACTION_AUDIT_LOG">
          <div className="space-y-8 p-2">
            <div className="bg-slate-900 p-8 rounded-none border border-slate-800 shadow-xl">
              <p className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">{selected.employee_name}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{selected.emp_id} • {selected.department?.toUpperCase()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['PROTOCOL_CLASS', selected.leave_type],
                ['LIFECYCLE', selected.status],
                ['INCEPTION', selected.from_date],
                ['CESSATION', selected.to_date],
                ['DURATION_METRIC', `${selected.total_days} DAYS`],
                ['AUDIT_BY', selected.approved_by_name || 'SYSTEM_CORE'],
              ].map(([label, val]) => (
                <div key={label} className="bg-white p-5 border border-slate-100 rounded-none shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                  <p className="text-[11px] font-black text-slate-900 uppercase">{val}</p>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 border border-slate-100 rounded-none shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">JUSTIFICATION_MANIFEST</p>
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-relaxed">{selected.reason}</p>
            </div>
            {selected.rejection_reason && (
              <div className="bg-red-50 p-6 border border-red-100 rounded-none">
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">EXCISION_ROOT_CAUSE</p>
                <p className="text-[11px] font-black text-red-800 uppercase tracking-tight">{selected.rejection_reason}</p>
              </div>
            )}
            {selected.status === 'Pending' && (
              <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
                <button onClick={() => { setViewModal(false); openAction(selected, 'Reject'); }} className="h-12 px-8 rounded-none bg-red-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700">REJECT_AUDIT</button>
                <button onClick={() => { setViewModal(false); openAction(selected, 'Approve'); }} className="h-12 px-12 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64]">AUTHORIZE</button>
              </div>
            )}
            {selected.status === 'Approved' && (
              <div className="flex items-center justify-end pt-8 border-t border-slate-100">
                <button onClick={() => { setViewModal(false); openAction(selected, 'Cancel'); }} className="h-12 px-10 rounded-none border border-red-200 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50">
                  ABORT_TRANSACTION
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Action Modal */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason(''); }} size="sm" title="EXECUTION_GATEWAY">
          <div className="space-y-8 p-2">
            <div className="p-6 border border-slate-100 bg-slate-50/50">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight leading-relaxed">
                {actionType === 'Cancel' && selected?.status === 'Approved'
                    ? <>CONFIRM ABORTION OF APPROVED PROTOCOL FOR <span className="text-slate-900">{selected?.employee_name?.toUpperCase()}</span>? RESIDUAL ASSETS WILL BE RESTORED.</>
                    : <>CONFIRM {actionType.toUpperCase()} OF PROTOCOL FOR <span className="text-slate-900">{selected?.employee_name?.toUpperCase()}</span>?</>
                }
                <span className="text-[9px] font-black text-[#0F766E] block mt-3 tracking-widest">[{selected?.leave_type?.toUpperCase()} | {selected?.from_date} → {selected?.to_date} | {selected?.total_days}D]</span>
                </p>
            </div>
            {(actionType === 'Reject' || actionType === 'Cancel') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Excision Reason <span className="text-red-500">*</span></label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className="w-full rounded-none border border-slate-200 bg-white p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#0F766E]" placeholder="SPECIFY REASON..." rows={3} />
              </div>
            )}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
              <button type="button" onClick={() => { setActionModal(false); setActionReason(''); }} className="h-10 px-6 rounded-none border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">ABORT</button>
              <button type="button" onClick={handleProcess} disabled={submitting || ((actionType === 'Reject' || actionType === 'Cancel') && !actionReason)}
                className={`h-10 px-10 rounded-none text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-lg ${
                  actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10'
                  : actionType === 'Reject' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/10'
                  : 'bg-slate-900 hover:bg-black shadow-slate-900/10'
                }`}>
                {submitting ? 'TRANSMITTING...' : `CONFIRM_${actionType.toUpperCase()}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
