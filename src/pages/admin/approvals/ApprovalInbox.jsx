import React, { useState, useEffect, useCallback } from 'react';
import {
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiUserLine,
  RiCalendarLine,
  RiAddLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiInboxLine,
  RiFileListLine,
  RiUserSharedLine,
  RiArrowRightLine,
  RiFilterLine,
  RiSearchLine,
  RiAlertLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'pending', label: 'Pending', icon: RiInboxLine },
  { key: 'my-requests', label: 'My Requests', icon: RiFileListLine },
  { key: 'delegates', label: 'Delegates', icon: RiUserSharedLine },
];

const MODULE_META = {
  regularization: { label: 'Regularization', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  overtime:       { label: 'Overtime',        color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  shift:          { label: 'Shift Change',    color: 'teal',   bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500'   },
  leave:          { label: 'Leave',          color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
};

const STATUS_META = {
  PENDING:   { label: 'Pending',   bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  APPROVED:  { label: 'Approved',  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  REJECTED:  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'    },
  WITHDRAWN: { label: 'Withdrawn', bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'  },
};

const MODULE_KEYS = Object.keys(MODULE_META);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ModuleBadge({ module }) {
  const meta = MODULE_META[module?.toLowerCase()] || MODULE_META.leave;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.text} border ${meta.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text} border ${meta.border}`}>
      {meta.label}
    </span>
  );
}

function StageIndicator({ current, total }) {
  if (!total) return null;
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">Stage {current}/{total}</span>
    </div>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ActionModal({ item, actionType, onClose, onConfirm }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const isReject = actionType === 'REJECTED';

  async function handleSubmit() {
    if (isReject && !remarks.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(item, actionType, remarks.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isReject ? 'Reject Request' : 'Approve Request'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isReject ? 'bg-red-100' : 'bg-green-100'}`}>
              {isReject ? <RiCloseLine className="text-red-600" size={16} /> : <RiCheckLine className="text-green-600" size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.employee_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                <ModuleBadge module={item.module} /> · {item.entity_type} · Submitted {fmtDate(item.submitted_at)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isReject ? 'Rejection Reason' : 'Remarks'}{isReject && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              placeholder={isReject ? 'State the reason for rejection...' : 'Optional remarks...'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {isReject ? 'Reject' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Tab ─────────────────────────────────────────────────────────────

function PendingTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [modal, setModal] = useState(null); // { item, actionType }

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals/pending');
      setRequests(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  async function handleAction(item, action, remarks) {
    try {
      await api.put(`/approvals/requests/${item.id}/action`, { action, remarks, source: item.source });
      toast.success(action === 'APPROVED' ? 'Request approved.' : 'Request rejected.');
      setRequests(prev => prev.filter(r => !(r.id === item.id && r.source === item.source)));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed.');
      throw err;
    }
  }

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.employee_name?.toLowerCase().includes(search.toLowerCase()) || r.entity_type?.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'all' || r.module?.toLowerCase() === filterModule;
    return matchSearch && matchModule;
  });

  const grouped = MODULE_KEYS.reduce((acc, key) => {
    const items = filtered.filter(r => r.module?.toLowerCase() === key);
    if (items.length) acc[key] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by employee or type..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <RiFilterLine className="text-gray-400" size={16} />
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Modules</option>
            {MODULE_KEYS.map(k => (
              <option key={k} value={k}>{MODULE_META[k].label}</option>
            ))}
          </select>
          <button
            onClick={fetchPending}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RiRefreshLine size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <RiRefreshLine className="animate-spin mr-2" size={20} />
          Loading pending approvals...
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RiInboxLine size={48} className="mb-3 opacity-40" />
          <p className="text-base font-medium">No pending approvals</p>
          <p className="text-sm mt-1">You are all caught up!</p>
        </div>
      ) : (
        Object.entries(grouped).map(([moduleKey, items]) => {
          const meta = MODULE_META[moduleKey];
          return (
            <div key={moduleKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{meta.label}</h3>
                <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${meta.bg} ${meta.text}`}>{items.length}</span>
              </div>
              <div className="grid gap-3">
                {items.map(item => (
                  <div
                    key={`${item.source}-${item.id}`}
                    className={`bg-white border ${meta.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                          <RiUserLine className={meta.text} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.employee_name || 'Unknown Employee'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.entity_type || item.module}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <RiCalendarLine size={12} />
                              {fmtDate(item.submitted_at)}
                            </span>
                            <ModuleBadge module={item.module} />
                          </div>
                          <div className="mt-2 max-w-xs">
                            <StageIndicator current={item.current_stage} total={item.total_stages} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setModal({ item, actionType: 'APPROVED' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                        >
                          <RiCheckLine size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => setModal({ item, actionType: 'REJECTED' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                        >
                          <RiCloseLine size={13} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {modal && (
        <ActionModal
          item={modal.item}
          actionType={modal.actionType}
          onClose={() => setModal(null)}
          onConfirm={handleAction}
        />
      )}
    </div>
  );
}

// ─── My Requests Tab ─────────────────────────────────────────────────────────

function MyRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/approvals/my-requests');
        setRequests(res.data?.data || res.data || []);
      } catch {
        toast.error('Failed to load your requests.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <RiRefreshLine className="animate-spin mr-2" size={20} />
        Loading your requests...
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <RiFileListLine size={48} className="mb-3 opacity-40" />
        <p className="text-base font-medium">No requests submitted</p>
        <p className="text-sm mt-1">Requests you submit will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {['Type', 'Module', 'Submitted', 'Stage', 'Status', 'Action Trail'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {requests.map((r, idx) => (
            <tr key={r.id || idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-800 font-medium whitespace-nowrap">
                {r.entity_type || '—'}
              </td>
              <td className="px-4 py-3">
                <ModuleBadge module={r.module} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                {fmtDateTime(r.submitted_at)}
              </td>
              <td className="px-4 py-3">
                <div className="w-32">
                  <StageIndicator current={r.current_stage} total={r.total_stages} />
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3">
                {r.action_trail?.length ? (
                  <div className="flex items-center gap-1">
                    {r.action_trail.map((step, i) => (
                      <React.Fragment key={i}>
                        <span className={`text-xs px-2 py-0.5 rounded ${step.status === 'APPROVED' ? 'bg-green-50 text-green-700' : step.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {step.actor_name || `Stage ${i + 1}`}
                        </span>
                        {i < r.action_trail.length - 1 && <RiArrowRightLine size={12} className="text-gray-300" />}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No actions yet</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Delegates Tab ────────────────────────────────────────────────────────────

function DelegatesTab() {
  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ delegate_employee_id: '', delegate_name: '', module: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(null);

  const fetchDelegations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals/delegations');
      setDelegations(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load delegations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDelegations(); }, [fetchDelegations]);

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.delegate_employee_id || !form.module || !form.start_date || !form.end_date) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error('End date must be after start date.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/approvals/delegations', form);
      toast.success('Delegation created successfully.');
      setForm({ delegate_employee_id: '', delegate_name: '', module: '', start_date: '', end_date: '' });
      setShowForm(false);
      fetchDelegations();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create delegation.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(id) {
    setRevoking(id);
    try {
      await api.delete(`/approvals/delegations/${id}`);
      toast.success('Delegation revoked.');
      setDelegations(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to revoke delegation.');
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">My Delegations</h3>
          <p className="text-sm text-gray-500 mt-0.5">Delegate your approval authority to others temporarily.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <RiAddLine size={16} />
          Add Delegation
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-indigo-800">New Delegation</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="delegate_employee_id"
                value={form.delegate_employee_id}
                onChange={handleFormChange}
                placeholder="Employee ID"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee Name</label>
              <input
                type="text"
                name="delegate_name"
                value={form.delegate_name}
                onChange={handleFormChange}
                placeholder="Display name (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Module <span className="text-red-500">*</span></label>
              <select
                name="module"
                value={form.module}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select module...</option>
                {MODULE_KEYS.map(k => (
                  <option key={k} value={k}>{MODULE_META[k].label}</option>
                ))}
                <option value="all">All Modules</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Create Delegation
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <RiRefreshLine className="animate-spin mr-2" size={20} />
          Loading delegations...
        </div>
      ) : delegations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <RiUserSharedLine size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No active delegations</p>
          <p className="text-xs mt-1">Click "Add Delegation" to delegate your approval authority.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Delegated To', 'Module', 'Valid From', 'Valid Until', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {delegations.map((d, idx) => {
                const now = new Date();
                const end = new Date(d.end_date);
                const start = new Date(d.start_date);
                const isActive = now >= start && now <= end;
                const isExpired = now > end;

                return (
                  <tr key={d.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                          <RiUserLine size={13} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{d.delegate_name || d.delegate_employee_id || '—'}</p>
                          {d.delegate_employee_id && <p className="text-xs text-gray-400">ID: {d.delegate_employee_id}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {d.module === 'all' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          All Modules
                        </span>
                      ) : (
                        <ModuleBadge module={d.module} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmtDate(d.start_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmtDate(d.end_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isExpired
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {isExpired ? 'Expired' : isActive ? 'Active' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevoke(d.id)}
                        disabled={revoking === d.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50 ml-auto"
                      >
                        {revoking === d.id
                          ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          : <RiDeleteBinLine size={12} />}
                        Revoke
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function ApprovalInbox() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Inbox</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage pending approvals across regularization, overtime and shift change.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <RiAlertLine size={14} />
            Approval actions are irreversible — review carefully.
          </div>
        </div>

        {/* Module Legend */}
        <div className="flex flex-wrap gap-2">
          {MODULE_KEYS.map(k => (
            <span key={k} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${MODULE_META[k].bg} ${MODULE_META[k].text} border ${MODULE_META[k].border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${MODULE_META[k].dot}`} />
              {MODULE_META[k].label}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-4">
            <nav className="flex gap-1 -mb-px">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                      active
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === 'pending'      && <PendingTab />}
            {activeTab === 'my-requests' && <MyRequestsTab />}
            {activeTab === 'delegates'   && <DelegatesTab />}
          </div>
        </div>

      </div>
    </div>
  );
}
