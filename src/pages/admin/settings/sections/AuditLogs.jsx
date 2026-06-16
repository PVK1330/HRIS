import { useState, useEffect, useCallback } from 'react';
import {
  RiTimeLine,
  RiUserLine,
  RiHistoryLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiRefreshLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiShieldLine,
  RiComputerLine,
  RiSettings4Line,
  RiFileListLine,
} from 'react-icons/ri';
import api from '../../../../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUCCESS: {
    label: 'Success',
    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  FAILURE: {
    label: 'Failure',
    classes: 'bg-red-100 text-red-700 border border-red-200',
  },
  WARNING: {
    label: 'Warning',
    classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
};

const MODULE_COLOR_MAP = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-slate-100 text-slate-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-sky-100 text-sky-700',
];

// Deterministic color per module name so the color stays stable across renders
const moduleColorCache = {};
let moduleColorIndex = 0;
function moduleColor(module) {
  if (!module) return MODULE_COLOR_MAP[0];
  if (!moduleColorCache[module]) {
    moduleColorCache[module] =
      MODULE_COLOR_MAP[moduleColorIndex % MODULE_COLOR_MAP.length];
    moduleColorIndex += 1;
  }
  return moduleColorCache[module];
}

function formatTimestamp(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function exportCSV(logs) {
  const headers = [
    'Timestamp',
    'Actor',
    'Role',
    'Module',
    'Action',
    'Entity',
    'Status',
    'IP Address',
  ];
  const rows = logs.map((l) => [
    formatTimestamp(l.created_at),
    l.actor_name ?? '',
    l.actor_role ?? '',
    l.module ?? '',
    l.action ?? '',
    l.entity_type ?? '',
    l.status ?? '',
    l.ip_address ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Loading spinner ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <RiHistoryLine className="w-12 h-12 mb-3 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">
        {filtered ? 'No logs match the current filters.' : 'No audit logs found.'}
      </p>
      {filtered && (
        <p className="text-xs text-slate-400 mt-1">Try adjusting or clearing the filters.</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const LIMIT = 20;

export default function AuditLogs() {
  // Filter state
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Data state
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch module list once on mount
  useEffect(() => {
    api
      .get('/admin/audit/modules')
      .then((res) => setModules(res.data?.data ?? []))
      .catch(() => setModules([]));
  }, []);

  // Fetch action list whenever module changes
  useEffect(() => {
    setAction('');
    if (!module) {
      setActions([]);
      return;
    }
    api
      .get('/admin/audit/actions', { params: { module } })
      .then((res) => setActions(res.data?.data ?? []))
      .catch(() => setActions([]));
  }, [module]);

  // Fetch logs
  const fetchLogs = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/admin/audit/logs', {
        params: {
          module: module || undefined,
          action: action || undefined,
          status: status || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          search: search || undefined,
          page,
          limit: LIMIT,
        },
      })
      .then((res) => {
        const d = res.data?.data ?? {};
        setLogs(d.data ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .catch((err) => {
        setError(err?.response?.data?.message ?? 'Failed to load audit logs.');
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [module, action, status, fromDate, toDate, search, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 whenever filters change (but not page itself)
  const applyFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  const isFiltered = !!(module || action || status || fromDate || toDate || search);

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <RiHistoryLine className="w-5 h-5 text-teal-600" />
            System Audit Logs
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Track all admin actions across the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RiRefreshLine className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => exportCSV(logs)}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <RiDownloadLine className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <RiFilterLine className="w-4 h-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Search */}
          <div className="xl:col-span-2 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search actor, action, entity…"
              value={search}
              onChange={(e) => applyFilter(setSearch)(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Module */}
          <select
            value={module}
            onChange={(e) => applyFilter(setModule)(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={action}
            onChange={(e) => applyFilter(setAction)(e.target.value)}
            disabled={!module}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          >
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => applyFilter(setStatus)(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="WARNING">Warning</option>
          </select>

          {/* Date range */}
          <div className="xl:col-span-2 flex gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => applyFilter(setFromDate)(e.target.value)}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              title="From date"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => applyFilter(setToDate)(e.target.value)}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              title="To date"
            />
          </div>

          {/* Clear filters */}
          {isFiltered && (
            <button
              onClick={() => {
                setModule('');
                setAction('');
                setStatus('');
                setFromDate('');
                setToDate('');
                setSearch('');
                setPage(1);
              }}
              className="text-sm text-teal-600 hover:text-teal-800 font-medium underline-offset-2 hover:underline transition-colors text-left"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results summary */}
      {!loading && !error && (
        <p className="text-xs text-slate-500">
          Showing{' '}
          <span className="font-medium text-slate-700">{logs.length}</span> of{' '}
          <span className="font-medium text-slate-700">{total}</span> log
          {total !== 1 ? 's' : ''}
          {isFiltered ? ' (filtered)' : ''}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <Spinner />
        ) : logs.length === 0 ? (
          <EmptyState filtered={isFiltered} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <RiTimeLine className="w-4 h-4 text-slate-400" />
                      Timestamp
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <RiUserLine className="w-4 h-4 text-slate-400" />
                      Actor
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <RiComputerLine className="w-4 h-4 text-slate-400" />
                      Module
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <RiSettings4Line className="w-4 h-4 text-slate-400" />
                      Action
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <RiFileListLine className="w-4 h-4 text-slate-400" />
                      Entity
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <RiShieldLine className="w-4 h-4 text-slate-400" />
                      Status
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const statusCfg =
                    STATUS_CONFIG[log.status?.toUpperCase()] ?? STATUS_CONFIG.WARNING;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 leading-tight">
                          {log.actor_name ?? '—'}
                        </div>
                        {log.actor_role && (
                          <div className="text-xs text-slate-400 mt-0.5 capitalize">
                            {log.actor_role}
                          </div>
                        )}
                      </td>

                      {/* Module */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${moduleColor(
                            log.module
                          )}`}
                        >
                          {log.module ?? '—'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {log.action ?? '—'}
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3 text-slate-500">
                        {log.entity_type ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.classes}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {log.ip_address ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page{' '}
            <span className="font-medium text-slate-700">{page}</span> of{' '}
            <span className="font-medium text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
              Previous
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current
                let startPage = Math.max(1, page - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                const p = startPage + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-teal-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Retention note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Audit logs are retained for 90 days. For archival or compliance reports, contact your system administrator.
        </p>
      </div>
    </div>
  );
}
