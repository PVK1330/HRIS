import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HiPlus, HiEye, HiCheck, HiXMark,
  HiClock, HiUsers, HiGlobeAlt, HiBuildingOffice,
  HiMagnifyingGlass, HiArrowPath,
  HiExclamationTriangle, HiArrowsUpDown
} from 'react-icons/hi2';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import {
  listAttendance, markAttendance,
  getPendingRegularizations, regularize,
} from '../../../services/attendanceService.js';
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
  employeeId: '', date: new Date().toISOString().split('T')[0],
  checkInTime: '', checkOutTime: '', workMode: 'In Office',
  status: 'Present', overtimeHours: '', isLate: false, notes: '',
};

function statusColor(s) {
  if (s === 'Present')  return 'bg-green-100 text-green-700 ring-green-600/20';
  if (s === 'Remote')   return 'bg-blue-100 text-blue-700 ring-blue-600/20';
  if (s === 'Late')     return 'bg-orange-100 text-orange-700 ring-orange-600/20';
  if (s === 'Absent')   return 'bg-red-100 text-red-700 ring-red-600/20';
  if (s === 'Half Day') return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
  if (s === 'On Leave') return 'bg-purple-100 text-purple-700 ring-purple-600/20';
  return 'bg-slate-100 text-slate-700 ring-slate-600/20';
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
      key: 'employee_name', label: colLabel('Personnel'),
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
    { key: 'department', label: colLabel('Division'), render: (v) => <span className="text-sm font-semibold text-slate-700">{v}</span> },
    {
      key: 'status', label: colLabel('Presence'),
      render: (v) => <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor(v)}`}>{v}</span>,
    },
    {
      key: 'timing', label: colLabel('Shift'),
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <HiClock className="h-3 w-3 text-slate-400" />
            {row.check_in_time || '--:--'} – {row.check_out_time || '--:--'}
          </div>
          <div className="text-[9px] font-black text-[#0F766E] uppercase tracking-widest">
            {row.total_hours ? `${row.total_hours}h` : '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'alerts', label: 'Flags',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_late && <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset bg-orange-100 text-orange-700 ring-orange-600/20">Late</span>}
          {row.early_departure && <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset bg-red-100 text-red-700 ring-red-600/20">Early Exit</span>}
          {!row.check_out_time && row.status === 'Present' && <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset bg-red-100 text-red-700 ring-red-600/20">No Checkout</span>}
          {!row.is_late && !row.early_departure && row.check_out_time && <span className="text-xs text-slate-300">Clear</span>}
        </div>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <button type="button" onClick={() => { setSelected(row); setViewModal(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-blue-500 text-white transition-colors hover:bg-blue-600" aria-label="View">
          <HiEye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const pendingColumns = [
    {
      key: 'employee_name', label: colLabel('Petitioner'),
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600">
            {(v || '?').charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-slate-900">{v}</div>
            <div className="truncate text-[10px] font-mono text-slate-500">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'date', label: colLabel('Date'), render: (v) => <span className="text-sm font-semibold text-slate-700">{v}</span> },
    { key: 'status', label: colLabel('Status'), render: (v) => <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor(v)}`}>{v}</span> },
    { key: 'notes', label: colLabel('Reason'), render: (v) => <span className="text-xs italic text-slate-500">{v || '—'}</span> },
    {
      key: 'actions', label: 'Decision',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => { setSelected(row); setActionType('Approve'); setActionModal(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-[#10B981] text-white transition-colors hover:bg-[#059669]" aria-label="Approve">
            <HiCheck className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { setSelected(row); setActionType('Reject'); setActionModal(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-[#EF4444] text-white transition-colors hover:bg-[#DC2626]" aria-label="Reject">
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Attendance & Timesheet</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>HR Operations</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Time Tracking</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { fetchEmpList(); setMarkModal(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
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
            bgColor: 'bg-[#10B981]',
            icon: HiBuildingOffice,
            onClickFilter: () => setStatus('Present')
          },
          {
            label: 'REMOTE',
            count: summary?.remote ?? '—',
            bgColor: 'bg-[#3B82F6]',
            icon: HiGlobeAlt,
            onClickFilter: () => setStatus('Remote')
          },
          {
            label: 'LATE MARKS',
            count: summary?.late ?? '—',
            bgColor: 'bg-[#F59E0B]',
            icon: HiClock,
            onClickFilter: () => setStatus('Late')
          },
          {
            label: 'PENDING REGULARIZATIONS',
            count: pending.length,
            bgColor: 'bg-[#EF4444]',
            icon: HiExclamationTriangle,
            onClickFilter: () => {}
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'PRESENT TODAY' && statusFilter === 'Present') ||
            (card.label === 'REMOTE' && statusFilter === 'Remote') ||
            (card.label === 'LATE MARKS' && statusFilter === 'Late');

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

      {error && <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Filters + Main Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Attendance Log</h2>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or ID..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />

            <select value={dept} onChange={e => setDept(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium">
              <option value="">All Divisions</option>
              {/* Provide mock options since we don't have department list in API easily accessible without fetch */}
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>

            <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium">
              <option value="">All Statuses</option>
              {['Present','Absent','Late','Half Day','On Leave'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{records.length} records shown</p>
            <button
              type="button"
              onClick={() => { setDate(today); setSearch(''); setDept(''); setStatus(''); }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
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
        />
      </div>

      {/* Pending Regularizations Table */}
      {pending.length > 0 && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-orange-500 bg-orange-500 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Regularization Queue</h2>
            <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white text-orange-600">{pending.length} Pending</span>
          </div>
          <Table columns={pendingColumns} data={pending} pageSize={5} square loading={loadingPending} />
        </div>
      )}

      {/* Manual Punch Modal */}
      <Modal isOpen={markModal} onClose={() => { setMarkModal(false); setForm(EMPTY_FORM); }} showClose size="md"
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Manual Attendance Entry</h2>
            <p className="text-xs font-medium text-slate-500">Fill in the details below to manually punch attendance.</p>
          </div>
        }
      >
        <form onSubmit={handleMarkSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Employee <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className={basicFieldClass} required>
                <option value="">Select employee…</option>
                {empList.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.emp_id})</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={basicFieldClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Status <span className="text-red-500">*</span></label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={basicFieldClass} required>
                {['Present','Absent','Half Day','Late','On Leave'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Work Mode <span className="text-red-500">*</span></label>
              <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))} className={basicFieldClass} required>
                {['In Office','Remote','Field'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Check In</label>
              <input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} className={basicFieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Check Out</label>
              <input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} className={basicFieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Overtime Hours</label>
              <input type="number" min="0" step="0.5" value={form.overtimeHours} onChange={e => setForm(f => ({ ...f, overtimeHours: e.target.value }))} className={basicFieldClass} placeholder="0" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 mt-2">
              <input type="checkbox" id="isLate" checked={form.isLate} onChange={e => setForm(f => ({ ...f, isLate: e.target.checked }))} className="h-4 w-4 rounded text-[#0F766E] border-slate-300 focus:ring-[#0F766E]" />
              <label htmlFor="isLate" className="text-sm font-semibold text-slate-700">Mark as Late</label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={basicFieldClass} placeholder="Administrative remarks…" rows={3} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { setMarkModal(false); setForm(EMPTY_FORM); }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition disabled:opacity-50">
              {submitting ? 'Saving…' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} showClose size="md"
          header={
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-slate-900">Attendance Detail</h2>
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
                ['Date', selected.date],
                ['Status', selected.status],
                ['Work Mode', selected.work_mode],
                ['Check In', selected.check_in_time || '—'],
                ['Check Out', selected.check_out_time || '—'],
                ['Total Hours', selected.total_hours ? `${selected.total_hours}h` : '—'],
                ['Overtime', selected.overtime_hours ? `${selected.overtime_hours}h` : '—'],
                ['Reg. Status', selected.regularization_status || 'N/A'],
              ].map(([label, val]) => (
                <div key={label} className="bg-white p-3 border border-slate-200 rounded-none">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{val}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="bg-white p-3 border border-slate-200 rounded-none">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                <p className="text-sm text-slate-700">{selected.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Regularize Action Modal */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason(''); }} showClose size="sm"
          header={
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-slate-900">{actionType} Regularization</h2>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-700">
              {actionType} regularization request for <strong>{selected.employee_name}</strong> on <strong>{selected.date}</strong>?
            </p>
            {actionType === 'Reject' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Reason <span className="text-red-500">*</span></label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className={basicFieldClass} placeholder="Reason for rejection…" rows={3} />
              </div>
            )}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => { setActionModal(false); setActionReason(''); }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="button" onClick={handleRegularize} disabled={submitting || (actionType === 'Reject' && !actionReason)}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${actionType === 'Approve' ? 'bg-[#10B981] hover:bg-[#059669]' : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}>
                {submitting ? 'Processing…' : actionType}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
