import { useCallback, useEffect, useState } from 'react';
import {
  HiEye, HiCheck, HiXMark,
  HiClock, HiGlobeAlt, HiBuildingOffice,
  HiMagnifyingGlass, HiExclamationTriangle, HiCalendar
} from 'react-icons/hi2';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
  listAttendance,
  getPendingRegularizations, regularize,
} from '../../../services/attendanceService.js';
import { formatHours } from '../../../utils/attendanceLabels.js';
import {
  canApproveRegularization,
  canPunchAttendance,
  canViewTeamAttendance,
  canViewAllAttendance,
} from '../../../utils/rbac.js';
import AttendanceDetailModal from '../../../components/attendance/AttendanceDetailModal.jsx';
import AttendancePunchCard from '../../../components/attendance/AttendancePunchCard.jsx';
import HolidayListWidget from '../../../components/attendance/HolidayListWidget.jsx';

const inputClass =
  'w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none';
const labelClass = 'text-sm font-medium text-slate-700';

function statusColor(s) {
  if (s === 'Present') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  if (s === 'Remote' || s === 'Work From Home') return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  if (s === 'Late') return 'bg-orange-50 text-orange-700 ring-orange-600/20';
  if (s === 'Absent') return 'bg-red-50 text-red-700 ring-red-600/20';
  if (s === 'Half Day') return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  if (s === 'On Leave') return 'bg-purple-50 text-purple-700 ring-purple-600/20';
  if (s === 'Missing Check In' || s === 'Missing Check Out') return 'bg-rose-50 text-rose-800 ring-rose-600/20';
  if (s === 'Regularization Pending') return 'bg-violet-50 text-violet-800 ring-violet-600/20';
  return 'bg-slate-50 text-slate-700 ring-slate-600/20';
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColor(status)}`}>
      {status}
    </span>
  );
}

export default function Attendance() {
  const { user, allowedModules } = useAuth();
  const mods = allowedModules || [];
  const showPunch = Boolean(user?.employeeId || user?.id);
  const showTeamLog = canViewTeamAttendance(mods) || canViewAllAttendance(mods);
  const showApproverInbox = canApproveRegularization(mods);

  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statusFilter, setStatus] = useState('');

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);

  const [detailId, setDetailId] = useState(null);
  const [actionModal, setActionModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showHolidays, setShowHolidays] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAttendance({ date, department: dept, status: statusFilter, search });
      setRecords(data.records || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [date, dept, statusFilter, search]);

  const fetchPending = useCallback(async () => {
    if (!showApproverInbox) {
      setPending([]);
      return;
    }
    setLoadingPending(true);
    try {
      const data = await getPendingRegularizations();
      setPending(data.records || []);
    } catch { /* ignore */ }
    finally { setLoadingPending(false); }
  }, [showApproverInbox]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { fetchPending(); }, [fetchPending]);
  useEffect(() => { setCurrentPage(1); }, [search, dept, statusFilter, date]);

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
      key: 'employee_name',
      label: 'Employee',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
            {(v || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900">{v}</div>
            <div className="truncate text-xs text-slate-500">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => <StatusBadge status={row.display_status || v} />,
    },
    {
      key: 'timing',
      label: 'Time',
      render: (_, row) => (
        <div className="text-sm text-slate-700">
          <div className="flex items-center gap-1.5">
            <HiClock className="h-4 w-4 text-teal-600" />
            {row.check_in_time || '—'} – {row.check_out_time || '—'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {row.total_hours || row.worked_hours
              ? formatHours(row.worked_hours || row.total_hours)
              : 'No hours recorded'}
          </div>
        </div>
      ),
    },
    {
      key: 'alerts',
      label: 'Flags',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_late && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">Late</span>
          )}
          {row.early_departure && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Early leave</span>
          )}
          {!row.check_out_time && row.check_in_time && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">No check-out</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setDetailId(row.id)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
        >
          <HiEye className="h-4 w-4" /> View
        </button>
      ),
    },
  ];

  const pendingColumns = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (v, row) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{v}</div>
          <div className="text-xs text-slate-500">{row.emp_id}</div>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (v) => <span className="text-sm text-slate-700">{v}</span> },
    {
      key: 'regularization_reason',
      label: 'Reason',
      render: (v, row) => (
        <span className="text-sm text-slate-600">{v || row.notes || '—'}</span>
      ),
    },
    {
      key: 'pending_approver_role',
      label: 'Approver',
      render: (_, row) => (
        <span className="text-sm text-slate-600">
          {row.pending_approver_role || `Level ${row.pending_level || row.current_approval_level || '—'}`}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            type="button"
            title="Approve"
            onClick={() => { setSelected(row); setActionType('Approve'); setActionModal(true); }}
            className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700"
          >
            <HiCheck className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Reject"
            onClick={() => { setSelected(row); setActionType('Reject'); setActionModal(true); }}
            className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const metricCards = [
    { id: 'present', label: 'Present today', count: summary?.present ?? '—', icon: HiBuildingOffice, filter: 'Present', accent: 'border-slate-800' },
    { id: 'remote', label: 'Remote', count: summary?.remote ?? '—', icon: HiGlobeAlt, filter: 'Remote', accent: 'border-teal-600' },
    { id: 'late', label: 'Late', count: summary?.late ?? '—', icon: HiClock, filter: 'Late', accent: 'border-orange-500' },
    { id: 'holidays', label: 'Holiday listing', count: 'View', icon: HiCalendar, filter: 'Holidays', accent: 'border-emerald-500', action: () => setShowHolidays(!showHolidays) },
    { id: 'pending', label: 'Pending approvals', count: pending.length, icon: HiExclamationTriangle, filter: null, accent: 'border-red-500' },
  ];

  return (
    <div className="space-y-6 min-w-0">
      {showPunch ? <AttendancePunchCard /> : null}
      <p className="text-sm text-slate-500">
        {showTeamLog
          ? 'Daily attendance log. Use the Override tab for manual corrections when you have manage permission.'
          : 'Your attendance for the selected date.'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((card) => {
          const active = card.filter && statusFilter === card.filter;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                if (card.action) card.action();
                else if (card.filter) setStatus(card.filter);
              }}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                active ? `${card.accent} bg-teal-50/40 ring-1 ring-teal-600` : card.id === 'holidays' && showHolidays ? `${card.accent} bg-emerald-50/40 ring-1 ring-emerald-600` : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${
                card.id === 'present' ? 'bg-slate-800' : card.id === 'remote' ? 'bg-teal-700' : card.id === 'late' ? 'bg-orange-500' : card.id === 'holidays' ? 'bg-emerald-600' : 'bg-red-500'
              }`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{card.count}</p>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showHolidays && <HolidayListWidget />}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Search</label>
            <div className="relative mt-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or employee ID"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} mt-1`} />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className={`${inputClass} mt-1`}>
              <option value="">All departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mt-1`}>
              <option value="">All statuses</option>
              {['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Remote'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">{records.length} record{records.length !== 1 ? 's' : ''}</p>
          <button
            type="button"
            onClick={() => { setDate(today); setSearch(''); setDept(''); setStatus(''); }}
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-teal-700 px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Attendance log</h2>
        </div>
        <Table
          columns={columns}
          data={records}
          pageSize={10}
          loading={loading}
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
        />
      </div>

      {pending.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-orange-200 bg-orange-50 px-5 py-3">
            <h2 className="text-sm font-semibold text-orange-900">Pending regularizations</h2>
            <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {pending.length} pending
            </span>
          </div>
          <Table columns={pendingColumns} data={pending} pageSize={5} loading={loadingPending} />
        </div>
      )}

      <AttendanceDetailModal recordId={detailId} open={!!detailId} onClose={() => setDetailId(null)} />

      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason(''); }} title={actionType === 'Approve' ? 'Approve request' : 'Reject request'} size="md">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {actionType === 'Approve' ? 'Approve' : 'Reject'} regularization for <strong>{selected.employee_name}</strong> on <strong>{selected.date}</strong>.
            </p>
            {actionType === 'Reject' && (
              <div>
                <label className={labelClass}>Reason for rejection <span className="text-red-500">*</span></label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className={`${inputClass} mt-1 min-h-[100px]`}
                  placeholder="Explain why this request is rejected"
                  rows={3}
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setActionModal(false); setActionReason(''); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegularize}
                disabled={submitting || (actionType === 'Reject' && !actionReason.trim())}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? 'Processing…' : actionType}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
