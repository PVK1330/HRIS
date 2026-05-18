import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HiPlus, HiEye, HiCheck, HiXMark,
  HiClock, HiUsers, HiGlobeAlt, HiBuildingOffice,
  HiMagnifyingGlass, HiArrowPath,
  HiExclamationTriangle, HiArrowsUpDown,
  HiIdentification,
} from 'react-icons/hi2';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import {
  listAttendance, markAttendance,
  getPendingRegularizations, regularize,
} from '../../../services/attendanceService.js';
import { listEmployees } from '../../../services/employeeService.js';

const EMPTY_FORM = {
  employeeId: '', date: new Date().toISOString().split('T')[0],
  checkInTime: '', checkOutTime: '', workMode: 'In Office',
  status: 'Present', overtimeHours: '', isLate: false, notes: '',
};

function statusColor(s) {
  if (s === 'Present')  return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  if (s === 'Remote')   return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  if (s === 'Late')     return 'bg-orange-50 text-orange-700 ring-orange-600/20';
  if (s === 'Absent')   return 'bg-red-50 text-red-700 ring-red-600/20';
  if (s === 'Half Day') return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  if (s === 'On Leave') return 'bg-purple-50 text-purple-700 ring-purple-600/20';
  return 'bg-slate-50 text-slate-700 ring-slate-600/20';
}

export default function Attendance() {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);

  const [markModal, setMarkModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);


  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAttendance({ date, department: dept, status: statusFilter, search });
      setRecords(data.records || []);
      setSummary(data.summary || null);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [date, dept, statusFilter, search]);

  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const data = await getPendingRegularizations();
      setPending(data.records || []);
    } catch {  }
    finally { setLoadingPending(false); }
  }, []);

  const fetchEmpList = useCallback(async () => {
    if (empList.length > 0) return;
    try {
      const data = await listEmployees({ limit: 100 });
      setEmpList(data?.employees || []);
    } catch {  }
  }, [empList.length]);


  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { fetchPending(); }, [fetchPending]);

  useEffect(() => { setCurrentPage(1); }, [search, dept, statusFilter, date]);

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await markAttendance({
        employeeId: parseInt(form.employeeId),
        date: form.date,
        checkInTime: form.checkInTime || null,
        checkOutTime: form.checkOutTime || null,
        workMode: form.workMode,
        status: form.status,
        overtimeHours: form.overtimeHours ? parseFloat(form.overtimeHours) : 0,
        isLate: form.isLate,
        notes: form.notes || null,
      });
      setMarkModal(false);
      setForm(EMPTY_FORM);
      fetchRecords();
    } catch (err) {
      alert(err?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegularize = async () => {
    setSubmitting(true);
    try {
      await regularize(selected.id, {
        action: actionType === 'Approve' ? 'approve' : 'reject',
        reason: actionReason || undefined,
      });
      setActionModal(false);
      setActionReason('');
      fetchPending();
      fetchRecords();
    } catch (err) {
      alert(err?.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'employee_name', label: 'PERSONNEL_ASSET',
      render: (v, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-slate-900 text-[12px] font-black text-white shadow-sm">
            {(v || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{v}</div>
            <div className="truncate text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', label: 'DIVISION', render: (v) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v}</span> },
    {
      key: 'status', label: 'PRESENCE_INDEX',
      render: (v) => (
        <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${statusColor(v)}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'timing', label: 'SHIFT_LOG',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase tracking-tighter">
            <HiClock className="h-3.5 w-3.5 text-[#0F766E]" />
            {row.check_in_time || '--:--'} – {row.check_out_time || '--:--'}
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-5">
            {row.total_hours ? `${row.total_hours}H_DURATION` : 'NULL_WINDOW'}
          </div>
        </div>
      ),
    },
    {
      key: 'alerts', label: 'FLAGS',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.is_late && <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-orange-900 text-white shadow-sm">LATE_ENTRY</span>}
          {row.early_departure && <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-red-900 text-white shadow-sm">EARLY_EXIT</span>}
          {!row.check_out_time && row.status === 'Present' && <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-100">STAY_ACTIVE</span>}
          {!row.is_late && !row.early_departure && row.check_out_time && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">VERIFIED</span>}
        </div>
      ),
    },
    {
      key: 'actions', label: 'COMMAND',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => { setSelected(row); setViewModal(true); }}
          className="h-8 px-4 rounded-none bg-slate-900 text-[9px] font-black uppercase tracking-widest text-white hover:bg-black transition-all flex items-center gap-2"
        >
          <HiEye className="h-3.5 w-3.5" /> DOSSIER
        </button>
      ),
    },
  ];

  const pendingColumns = [
    {
      key: 'employee_name', label: 'PETITIONER',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-slate-100 text-[10px] font-black text-slate-600 border border-slate-200">
            {(v || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[10px] font-black text-slate-900 uppercase">{v}</div>
            <div className="truncate text-[8px] font-black text-slate-400 tracking-widest">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'date', label: 'INCIDENT_DATE', render: (v) => <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{v}</span> },
    { key: 'status', label: 'PROPOSED_STATUS', render: (v) => <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${statusColor(v)}`}>{v}</span> },
    { key: 'notes', label: 'JUSTIFICATION', render: (v) => <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{v || 'NO_REMARK'}</span> },
    {
      key: 'actions', label: 'DECISION_NODE',
      render: (_, row) => (
        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={() => { setSelected(row); setActionType('Approve'); setActionModal(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-none bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <HiCheck className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setSelected(row); setActionType('Reject'); setActionModal(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-none bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0 border-b border-slate-100 pb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Attendance Intelligence</h1>
          <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Time Tracking & Operational Presence Index</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => { fetchEmpList(); setMarkModal(true); }}
            className="h-10 inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
          >
            <HiPlus className="h-4 w-4" /> Manual Punch
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'PRESENT TODAY',
            count: summary?.present ?? '—',
            bgColor: 'bg-slate-900',
            icon: HiBuildingOffice,
            onClickFilter: () => setStatus('Present')
          },
          {
            label: 'REMOTE_ACTIVE',
            count: summary?.remote ?? '—',
            bgColor: 'bg-[#0F766E]',
            icon: HiGlobeAlt,
            onClickFilter: () => setStatus('Remote')
          },
          {
            label: 'LATE_FLAGS',
            count: summary?.late ?? '—',
            bgColor: 'bg-orange-600',
            icon: HiClock,
            onClickFilter: () => setStatus('Late')
          },
          {
            label: 'PENDING_AUDIT',
            count: pending.length,
            bgColor: 'bg-red-600',
            icon: HiExclamationTriangle,
            onClickFilter: () => {}
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'PRESENT TODAY' && statusFilter === 'Present') ||
            (card.label === 'REMOTE_ACTIVE' && statusFilter === 'Remote') ||
            (card.label === 'LATE_FLAGS' && statusFilter === 'Late');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              className={`flex items-center gap-4 rounded-none border p-5 text-left transition-all min-w-0 shadow-sm ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-emerald-50/50 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-black uppercase tracking-widest truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {error && <div className="rounded-none border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-700">{error}</div>}

      {/* Filters + Main Table */}
      <div className="space-y-6">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Search</label>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="NAME OR ID..."
                  className="w-full h-12 rounded-none border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Log Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full h-12 rounded-none border border-slate-200 bg-slate-50/50 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division Filter</label>
              <select value={dept} onChange={e => setDept(e.target.value)} className="w-full h-12 rounded-none border border-slate-200 bg-slate-50/50 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none appearance-none transition-all cursor-pointer">
                <option value="">ALL_DIVISIONS</option>
                <option value="Engineering">ENGINEERING</option>
                <option value="Human Resources">HUMAN_RESOURCES</option>
                <option value="Finance">FINANCE</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Classification</label>
              <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="w-full h-12 rounded-none border border-slate-200 bg-slate-50/50 px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none appearance-none transition-all cursor-pointer">
                <option value="">ALL_STATUSES</option>
                {['Present','Absent','Late','Half Day','On Leave'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{records.length} ASSETS_SYNCHRONIZED</p>
            <button
              type="button"
              onClick={() => { setDate(today); setSearch(''); setDept(''); setStatus(''); }}
              className="text-[9px] font-black text-[#0F766E] hover:underline uppercase tracking-[0.2em]"
            >
              RESET_INTELLIGENCE_FILTERS
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
          <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
            <h2 className="text-sm font-semibold uppercase tracking-wider truncate">Attendance Log Transmission</h2>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">Log Status: Active</div>
          </div>
          <Table
            columns={columns}
            data={records}
            pageSize={10}
            square
            loading={loading}
            totalCount={records.length}
            currentPage={currentPage - 1}
            onPageChange={(idx) => setCurrentPage(idx + 1)}
            className="rounded-none"
          />
        </div>
      </div>

      {/* Pending Regularizations Table */}
      {pending.length > 0 && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between border-b border-orange-500 bg-orange-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <HiExclamationTriangle className="h-5 w-5 text-white" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Regularization Protocol Queue</h2>
            </div>
            <span className="inline-flex items-center rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white text-orange-600 shadow-sm">{pending.length} PENDING_ACTIONS</span>
          </div>
          <Table columns={pendingColumns} data={pending} pageSize={5} square loading={loadingPending} className="rounded-none" />
        </div>
      )}

      {/* Manual Punch Modal */}
      <Modal isOpen={markModal} onClose={() => { setMarkModal(false); setForm(EMPTY_FORM); }} title="ATTENDANCE_OVERRIDE_INTERFACE" size="lg">
        <form onSubmit={handleMarkSubmit} className="space-y-10 p-2 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Personnel Asset <span className="text-red-500">*</span></label>
              <div className="relative">
                <HiIdentification className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none appearance-none cursor-pointer" required>
                  <option value="">SELECT_PERSONNEL...</option>
                  {empList.map(e => <option key={e.id} value={e.id}>{e.full_name.toUpperCase()} ({e.emp_id})</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incident Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Status <span className="text-red-500">*</span></label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none cursor-pointer" required>
                {['Present','Absent','Half Day','Late','On Leave'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Configuration <span className="text-red-500">*</span></label>
              <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none cursor-pointer" required>
                {['In Office','Remote','Field'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overtime Allocation (Hrs)</label>
              <input type="number" min="0" step="0.5" value={form.overtimeHours} onChange={e => setForm(f => ({ ...f, overtimeHours: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none" placeholder="0.0" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Window Inception (Check-In)</label>
              <input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold focus:border-[#0F766E] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Window Termination (Check-Out)</label>
              <input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold focus:border-[#0F766E] outline-none" />
            </div>
            <div className="md:col-span-2 flex items-center gap-4 py-4 border-y border-slate-50">
               <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isLate: !f.isLate }))}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.isLate ? 'bg-orange-600' : 'bg-slate-200'}`}
               >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-white shadow ring-0 transition duration-200 ease-in-out ${form.isLate ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FLAG_AS_NON_COMPLIANT_LATE</span>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ADMINISTRATIVE_REMARKS</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all min-h-[120px] placeholder:text-slate-200" placeholder="ENTER PROTOCOL NOTES..." rows={3} />
            </div>
          </div>
          <div className="mt-10 flex items-center justify-end gap-6 pt-8 border-t border-slate-100">
            <button type="button" onClick={() => { setMarkModal(false); setForm(EMPTY_FORM); }}
              className="h-12 px-10 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              ABORT_INTERFACE
            </button>
            <button type="submit" disabled={submitting}
              className="h-12 px-16 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10">
              {submitting ? 'TRANSMITTING...' : 'COMMIT_PUNCH_LOG'}
            </button>
          </div>
        </form>
      </Modal>


      {/* View Detail Modal */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="PERSONNEL_PRESENCE_DOSSIER" size="lg">
          <div className="space-y-8 p-2 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-none border-l-4 border-[#0F766E] text-white shadow-xl shadow-slate-900/20">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-white/10 rounded-none border border-white/20 flex items-center justify-center text-3xl font-black">
                  {(selected.employee_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-2xl font-black uppercase tracking-tight leading-none mb-2">{selected.employee_name}</p>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{selected.emp_id} · {selected.department}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                ['Log Date', selected.date],
                ['Status', selected.status],
                ['Work Mode', selected.work_mode],
                ['Punch In', selected.check_in_time || '—'],
                ['Punch Out', selected.check_out_time || '—'],
                ['Total Duration', selected.total_hours ? `${selected.total_hours}H` : '—'],
                ['Overtime Allocation', selected.overtime_hours ? `${selected.overtime_hours}H` : '—'],
                ['Compliance Status', selected.regularization_status || 'VERIFIED_OK'],
              ].map(([label, val]) => (
                <div key={label} className="bg-white p-5 border border-slate-100 rounded-none shadow-sm transition-all hover:border-slate-300">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{val}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="bg-slate-50 p-6 border-l-4 border-slate-300 rounded-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">ADMINISTRATIVE_REMARKS</p>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">{selected.notes}</p>
              </div>
            )}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
               <button onClick={() => setViewModal(false)} className="h-11 px-10 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all">
                  TERMINATE_DOSSIER_VIEW
               </button>
            </div>
          </div>
        </Modal>
      )}


      {/* Regularize Action Modal */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason(''); }} title="GOVERNANCE_DECISION_INTERFACE" size="md">
          <div className="space-y-8 p-2">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-none">
              <p className="text-[11px] font-bold text-orange-900 uppercase tracking-widest leading-relaxed">
                EXERTING {actionType.toUpperCase()} AUTHORITY OVER REGULARIZATION REQUEST FOR PERSONNEL <span className="font-black underline">{selected.employee_name}</span> RECORDED ON <span className="font-black">{selected.date}</span>.
              </p>
            </div>
            {actionType === 'Reject' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">REJECTION_JUSTIFICATION <span className="text-red-500">*</span></label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-red-500 outline-none transition-all min-h-[120px] placeholder:text-slate-200" placeholder="ENTER REJECTION RATIONALE..." rows={3} />
              </div>
            )}
            <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
              <button type="button" onClick={() => { setActionModal(false); setActionReason(''); }}
                className="h-12 px-8 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                ABORT
              </button>
              <button type="button" onClick={handleRegularize} disabled={submitting || (actionType === 'Reject' && !actionReason)}
                className={`h-12 px-12 rounded-none text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg ${actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10' : 'bg-red-600 hover:bg-red-700 shadow-red-900/10'}`}>
                {submitting ? 'TRANSMITTING...' : `EXECUTE_${actionType.toUpperCase()}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
