import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RiMoneyDollarCircleLine,
  RiFileListLine,
  RiCalendarLine,
  RiPlayCircleLine,
  RiAddLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
  RiArrowUpDownLine,
  RiEyeLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiGroupLine,
  RiCoinsLine,
  RiSettings3Line,
  RiDownloadLine,
  RiRefreshLine,
} from 'react-icons/ri';
import { Modal } from '../../../components/ui/Modal.jsx';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS = ['Components', 'Structures', 'Pay Periods', 'Payroll Runs'];

const COMP_TYPES = [
  { value: 'earning', label: 'Earning', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'deduction', label: 'Deduction', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'employer_contribution', label: 'Employer Contribution', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const CALC_TYPES = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: '% of Basic' },
  { value: 'formula', label: 'Formula' },
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function compTypeBadge(type) {
  const t = COMP_TYPES.find((c) => c.value === type);
  if (!t) return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border bg-slate-100 text-slate-600 border-slate-200">{type}</span>;
  return <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${t.color}`}>{t.label}</span>;
}

const RUN_STATUS_MAP = {
  DRAFT:      { label: 'Draft',      color: 'bg-slate-100 text-slate-600 border-slate-200' },
  PROCESSING: { label: 'Processing', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED:  { label: 'Completed',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  APPROVED:   { label: 'Approved',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  PAID:       { label: 'Paid',       color: 'bg-teal-100 text-teal-700 border-teal-200' },
};

const PERIOD_STATUS_MAP = {
  open:   { label: 'Open',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  locked: { label: 'Locked', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  closed: { label: 'Closed', color: 'bg-red-100 text-red-600 border-red-200' },
};

function StatusChip({ status, map }) {
  const s = map[status] || { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
      {s.label}
    </span>
  );
}

function fmtCurrency(val) {
  if (val == null || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function SortTh({ label }) {
  return (
    <span className="inline-flex items-center gap-1 uppercase tracking-wider text-[11px] font-bold">
      {label} <RiArrowUpDownLine className="h-3 w-3 opacity-40" />
    </span>
  );
}

function TableShell({ children, headers }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider whitespace-nowrap ${h.right ? 'text-right' : ''}`}>
                {h.sort ? <SortTh label={h.label} /> : h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRows({ cols, message }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}

function LoadingRows({ cols }) {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  ));
}

// ─── Modal: Component Form ─────────────────────────────────────────────────────
function ComponentModal({ open, onClose, initial, onSaved }) {
  const blank = { name: '', component_type: 'earning', calc_type: 'fixed', value: '', is_taxable: false };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...blank, ...initial } : blank);
  }, [initial, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    try {
      setSaving(true);
      if (initial?.id) {
        await api.put(`/admin/payroll-engine/components/${initial.id}`, form);
        toast.success('Component updated');
      } else {
        await api.post('/admin/payroll-engine/components', form);
        toast.success('Component created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save component');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="md"
      showClose
      header={
        <div>
          <h2 className="text-lg font-bold text-slate-900">{initial?.id ? 'Edit' : 'Add'} Salary Component</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define how this component is calculated and taxed.</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Component Name <span className="text-red-500">*</span></label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Basic Salary, HRA, PF Deduction"
            className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Component Type</label>
            <select
              value={form.component_type}
              onChange={(e) => set('component_type', e.target.value)}
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none bg-white"
            >
              {COMP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Calculation Type</label>
            <select
              value={form.calc_type}
              onChange={(e) => set('calc_type', e.target.value)}
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none bg-white"
            >
              {CALC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            {form.calc_type === 'percentage' ? 'Percentage (%)' : form.calc_type === 'formula' ? 'Formula Expression' : 'Fixed Amount'}
          </label>
          <input
            value={form.value}
            onChange={(e) => set('value', e.target.value)}
            placeholder={form.calc_type === 'percentage' ? '12.5' : form.calc_type === 'formula' ? 'basic * 0.1' : '0.00'}
            className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!form.is_taxable}
              onChange={(e) => set('is_taxable', e.target.checked)}
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]" />
          </label>
          <div>
            <p className="text-sm font-medium text-slate-800">Taxable Component</p>
            <p className="text-xs text-slate-500">Include this in taxable income calculation</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-9 px-5 rounded-none border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-9 px-6 rounded-none bg-[#0F766E] text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors disabled:opacity-60 shadow-sm">
            {saving ? 'Saving…' : initial?.id ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Modal: Structure Form ─────────────────────────────────────────────────────
function StructureModal({ open, onClose, components, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '', component_ids: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ name: '', description: '', component_ids: [] });
  }, [open]);

  const toggle = (id) => {
    setForm((f) => ({
      ...f,
      component_ids: f.component_ids.includes(id)
        ? f.component_ids.filter((x) => x !== id)
        : [...f.component_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    try {
      setSaving(true);
      await api.post('/admin/payroll-engine/structures', form);
      toast.success('Salary structure created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create structure');
    } finally {
      setSaving(false);
    }
  };

  const earningComps = components.filter((c) => c.component_type === 'earning');
  const deductionComps = components.filter((c) => c.component_type === 'deduction');
  const empContribComps = components.filter((c) => c.component_type === 'employer_contribution');

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="lg"
      showClose
      header={
        <div>
          <h2 className="text-lg font-bold text-slate-900">Create Salary Structure</h2>
          <p className="text-xs text-slate-500 mt-0.5">Group components into a reusable salary structure.</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Structure Name <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Standard Full-Time"
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            />
          </div>
        </div>

        {/* Component Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-2">
            Select Components <span className="text-slate-400 font-normal">({form.component_ids.length} selected)</span>
          </label>
          <div className="border border-slate-200 rounded-none divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {[
              { label: 'Earnings', items: earningComps },
              { label: 'Deductions', items: deductionComps },
              { label: 'Employer Contributions', items: empContribComps },
            ].map(({ label, items }) =>
              items.length > 0 && (
                <div key={label}>
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
                  {items.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.component_ids.includes(c.id)}
                        onChange={() => toggle(c.id)}
                        className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                      />
                      <span className="text-sm font-medium text-slate-800 flex-1">{c.name}</span>
                      {compTypeBadge(c.component_type)}
                      <span className="text-xs text-slate-400">
                        {c.calc_type === 'percentage' ? `${c.value}%` : c.calc_type === 'fixed' ? fmtCurrency(c.value) : c.value}
                      </span>
                    </label>
                  ))}
                </div>
              )
            )}
            {components.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-slate-400">No components available. Create components first.</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-9 px-5 rounded-none border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-9 px-6 rounded-none bg-[#0F766E] text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors disabled:opacity-60 shadow-sm">
            {saving ? 'Saving…' : 'Create Structure'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Modal: Pay Period Form ────────────────────────────────────────────────────
function PayPeriodModal({ open, onClose, onSaved }) {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    year: currentYear,
    month: new Date().getMonth() + 1,
    start_date: '',
    end_date: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const start = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
      setForm({ year: y, month: m, start_date: start, end_date: end });
    }
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date) return toast.error('Start and end dates are required');
    try {
      setSaving(true);
      await api.post('/admin/payroll-engine/pay-periods', form);
      toast.success('Pay period created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create pay period');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="md"
      showClose
      header={
        <div>
          <h2 className="text-lg font-bold text-slate-900">Add Pay Period</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define the payroll cycle period.</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Year</label>
            <select
              value={form.year}
              onChange={(e) => set('year', parseInt(e.target.value))}
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none bg-white"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Month</label>
            <select
              value={form.month}
              onChange={(e) => set('month', parseInt(e.target.value))}
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none bg-white"
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Start Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">End Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)}
              className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-9 px-5 rounded-none border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-9 px-6 rounded-none bg-[#0F766E] text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors disabled:opacity-60 shadow-sm">
            {saving ? 'Saving…' : 'Create Period'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Modal: Run Detail ─────────────────────────────────────────────────────────
function RunDetailModal({ open, onClose, runId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && runId) {
      setLoading(true);
      api.get(`/admin/payroll-engine/runs/${runId}`)
        .then((r) => setDetail(r.data?.data || r.data))
        .catch(() => toast.error('Failed to load run details'))
        .finally(() => setLoading(false));
    }
  }, [open, runId]);

  const employees = detail?.employees || detail?.payslips || [];

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="xl"
      showClose
      header={
        <div>
          <h2 className="text-lg font-bold text-slate-900">Run Detail</h2>
          <p className="text-xs text-slate-500 mt-0.5">Employee-level payroll breakdown for this run.</p>
        </div>
      }
    >
      <div className="pt-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        )}
        {!loading && detail && (
          <>
            {/* Run Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Run Name', value: detail.run_name || '—' },
                { label: 'Period', value: detail.period_label || '—' },
                { label: 'Total Employees', value: detail.total_employees ?? employees.length },
                { label: 'Total Net Pay', value: fmtCurrency(detail.total_net) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
                </div>
              ))}
            </div>

            {/* Employee Breakdown */}
            <div className="border border-slate-200 rounded-none overflow-hidden">
              <div className="bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white">Employee Breakdown</div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      {['Employee', 'Gross Pay', 'Deductions', 'Net Pay', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No employee data in this run yet.</td></tr>
                    )}
                    {employees.map((emp, i) => (
                      <tr key={emp.id || i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{emp.employee_name || emp.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-700">{fmtCurrency(emp.gross_pay)}</td>
                        <td className="px-4 py-3 text-red-600">{fmtCurrency(emp.total_deductions)}</td>
                        <td className="px-4 py-3 font-bold text-[#0F766E]">{fmtCurrency(emp.net_pay)}</td>
                        <td className="px-4 py-3">
                          <StatusChip status={(emp.status || 'DRAFT').toUpperCase()} map={RUN_STATUS_MAP} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {!loading && !detail && (
          <p className="py-8 text-center text-sm text-slate-400">No details available.</p>
        )}
        <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
          <button onClick={onClose} className="h-9 px-6 rounded-none border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal: Init Run ───────────────────────────────────────────────────────────
function InitRunModal({ open, onClose, periods, onSaved }) {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setSelectedPeriodId('');
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodId) return toast.error('Please select a pay period');
    try {
      setSaving(true);
      await api.post('/admin/payroll-engine/runs', { pay_period_id: selectedPeriodId });
      toast.success('Payroll run initiated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payroll run');
    } finally {
      setSaving(false);
    }
  };

  const openPeriods = periods.filter((p) => !p.status || p.status === 'open');

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="sm"
      showClose
      header={
        <div>
          <h2 className="text-lg font-bold text-slate-900">Process Payroll Run</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select a pay period to initiate a new payroll run.</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Pay Period <span className="text-red-500">*</span></label>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="w-full h-10 rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none bg-white"
            required
          >
            <option value="">Select a period…</option>
            {openPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {MONTHS[(p.month || 1) - 1]} {p.year} ({fmtDate(p.start_date)} – {fmtDate(p.end_date)})
              </option>
            ))}
          </select>
          {openPeriods.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">No open pay periods found. Create one in the Pay Periods tab.</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-9 px-5 rounded-none border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || openPeriods.length === 0} className="h-9 px-6 rounded-none bg-[#0F766E] text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors disabled:opacity-60 shadow-sm">
            {saving ? 'Processing…' : 'Initiate Run'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Tab: Components ──────────────────────────────────────────────────────────
function ComponentsTab({ components, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return components.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.component_type?.toLowerCase().includes(q)
    );
  }, [components, search]);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (comp) => { setEditTarget(comp); setModalOpen(true); };

  const headers = [
    { label: 'Name', sort: true },
    { label: 'Type', sort: true },
    { label: 'Calc Type', sort: true },
    { label: 'Value' },
    { label: 'Taxable' },
    { label: 'Actions', right: true },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components…"
            className="h-9 w-full sm:w-60 pl-9 pr-3 rounded-none border border-slate-200 bg-slate-50 text-sm focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
          />
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-none bg-[#0F766E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#0c6b64] transition-colors shadow-sm"
        >
          <RiAddLine className="h-4 w-4" /> Add Component
        </button>
      </div>

      <TableShell headers={headers}>
        {loading && <LoadingRows cols={6} />}
        {!loading && filtered.length === 0 && (
          <EmptyRows cols={6} message="No components found. Click 'Add Component' to get started." />
        )}
        {!loading && filtered.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
            <td className="px-4 py-3">{compTypeBadge(c.component_type)}</td>
            <td className="px-4 py-3 text-sm text-slate-600 capitalize">{c.calc_type}</td>
            <td className="px-4 py-3 text-sm font-mono text-slate-700">
              {c.calc_type === 'percentage' ? `${c.value}%` : c.calc_type === 'fixed' ? fmtCurrency(c.value) : c.value || '—'}
            </td>
            <td className="px-4 py-3">
              {c.is_taxable
                ? <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold"><RiCheckboxCircleLine className="h-4 w-4" /> Yes</span>
                : <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><RiCloseLine className="h-4 w-4" /> No</span>}
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end">
                <button
                  onClick={() => openEdit(c)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white hover:bg-[#0c6b64] transition-colors"
                  title="Edit"
                >
                  <RiEditLine className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>

      <ComponentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editTarget}
        onSaved={onRefresh}
      />
    </>
  );
}

// ─── Tab: Structures ──────────────────────────────────────────────────────────
function StructuresTab({ structures, components, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return structures.filter((s) => s.name?.toLowerCase().includes(q));
  }, [structures, search]);

  const headers = [
    { label: 'Name', sort: true },
    { label: 'Description' },
    { label: 'Components', sort: true },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search structures…"
            className="h-9 w-full sm:w-60 pl-9 pr-3 rounded-none border border-slate-200 bg-slate-50 text-sm focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-none bg-[#0F766E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#0c6b64] transition-colors shadow-sm"
        >
          <RiAddLine className="h-4 w-4" /> Add Structure
        </button>
      </div>

      <TableShell headers={headers}>
        {loading && <LoadingRows cols={3} />}
        {!loading && filtered.length === 0 && (
          <EmptyRows cols={3} message="No structures found. Click 'Add Structure' to get started." />
        )}
        {!loading && filtered.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{s.description || '—'}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E]">
                <RiCoinsLine className="h-4 w-4" />
                {s.component_count ?? (s.components?.length ?? 0)} components
              </span>
            </td>
          </tr>
        ))}
      </TableShell>

      <StructureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        components={components}
        onSaved={onRefresh}
      />
    </>
  );
}

// ─── Tab: Pay Periods ─────────────────────────────────────────────────────────
function PayPeriodsTab({ periods, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return periods.filter((p) => {
      const label = `${MONTHS[(p.month || 1) - 1]} ${p.year}`.toLowerCase();
      return label.includes(q);
    });
  }, [periods, search]);

  const headers = [
    { label: 'Period', sort: true },
    { label: 'Year', sort: true },
    { label: 'Month', sort: true },
    { label: 'Start Date', sort: true },
    { label: 'End Date', sort: true },
    { label: 'Status' },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search periods…"
            className="h-9 w-full sm:w-60 pl-9 pr-3 rounded-none border border-slate-200 bg-slate-50 text-sm focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-none bg-[#0F766E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#0c6b64] transition-colors shadow-sm"
        >
          <RiAddLine className="h-4 w-4" /> Add Period
        </button>
      </div>

      <TableShell headers={headers}>
        {loading && <LoadingRows cols={6} />}
        {!loading && filtered.length === 0 && (
          <EmptyRows cols={6} message="No pay periods found. Click 'Add Period' to create one." />
        )}
        {!loading && filtered.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900">{MONTHS[(p.month || 1) - 1]} {p.year}</td>
            <td className="px-4 py-3 text-sm text-slate-700">{p.year}</td>
            <td className="px-4 py-3 text-sm text-slate-700">{MONTHS[(p.month || 1) - 1]}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(p.start_date)}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(p.end_date)}</td>
            <td className="px-4 py-3">
              <StatusChip status={(p.status || 'open').toLowerCase()} map={PERIOD_STATUS_MAP} />
            </td>
          </tr>
        ))}
      </TableShell>

      <PayPeriodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={onRefresh}
      />
    </>
  );
}

// ─── Tab: Payroll Runs ────────────────────────────────────────────────────────
function PayrollRunsTab({ runs, periods, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [initModalOpen, setInitModalOpen] = useState(false);
  const [detailRunId, setDetailRunId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return runs.filter((r) =>
      r.run_name?.toLowerCase().includes(q) ||
      r.period_label?.toLowerCase().includes(q)
    );
  }, [runs, search]);

  const setAL = (id, val) => setActionLoading((prev) => ({ ...prev, [id]: val }));

  const handleApprove = async (run) => {
    if (!window.confirm(`Approve run "${run.run_name}"?`)) return;
    try {
      setAL(run.id, 'approving');
      await api.put(`/admin/payroll-engine/runs/${run.id}/approve`);
      toast.success('Run approved');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve run');
    } finally {
      setAL(run.id, null);
    }
  };

  const handleGeneratePayslips = async (run) => {
    if (!window.confirm(`Generate payslips for run "${run.run_name}"? This may take a moment.`)) return;
    try {
      setAL(run.id, 'generating');
      await api.post(`/admin/payroll-engine/runs/${run.id}/payslips`);
      toast.success('Payslips generated successfully');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate payslips');
    } finally {
      setAL(run.id, null);
    }
  };

  const openDetail = (runId) => { setDetailRunId(runId); setDetailOpen(true); };

  const headers = [
    { label: 'Run Name', sort: true },
    { label: 'Period', sort: true },
    { label: 'Status' },
    { label: 'Employees', sort: true },
    { label: 'Total Net Pay', sort: true },
    { label: 'Initiated', sort: true },
    { label: 'Actions', right: true },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search runs…"
            className="h-9 w-full sm:w-60 pl-9 pr-3 rounded-none border border-slate-200 bg-slate-50 text-sm focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
          />
        </div>
        <button
          onClick={() => setInitModalOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-none bg-[#0F766E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#0c6b64] transition-colors shadow-sm"
        >
          <RiPlayCircleLine className="h-4 w-4" /> Process Run
        </button>
      </div>

      <TableShell headers={headers}>
        {loading && <LoadingRows cols={7} />}
        {!loading && filtered.length === 0 && (
          <EmptyRows cols={7} message="No payroll runs found. Click 'Process Run' to initiate one." />
        )}
        {!loading && filtered.map((run) => {
          const status = (run.status || 'DRAFT').toUpperCase();
          const isApproved = status === 'APPROVED' || status === 'PAID';
          const al = actionLoading[run.id];

          return (
            <tr key={run.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900">{run.run_name || `Run #${run.id}`}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{run.period_label || '—'}</td>
              <td className="px-4 py-3"><StatusChip status={status} map={RUN_STATUS_MAP} /></td>
              <td className="px-4 py-3 text-sm text-slate-700">{run.total_employees ?? '—'}</td>
              <td className="px-4 py-3 text-sm font-bold text-[#0F766E]">{fmtCurrency(run.total_net)}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{fmtDate(run.created_at || run.initiated_at)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {/* View Detail */}
                  <button
                    onClick={() => openDetail(run.id)}
                    className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded-none border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                    title="View detail"
                  >
                    <RiEyeLine className="h-3.5 w-3.5" /> Detail
                  </button>

                  {/* Approve */}
                  {!isApproved && (
                    <button
                      onClick={() => handleApprove(run)}
                      disabled={!!al}
                      className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded-none bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition-colors disabled:opacity-50"
                      title="Approve run"
                    >
                      {al === 'approving' ? (
                        <RiRefreshLine className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RiCheckLine className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </button>
                  )}

                  {/* Generate Payslips */}
                  {isApproved && (
                    <button
                      onClick={() => handleGeneratePayslips(run)}
                      disabled={!!al}
                      className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded-none bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium transition-colors disabled:opacity-50"
                      title="Generate payslips"
                    >
                      {al === 'generating' ? (
                        <RiRefreshLine className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RiFileTextLine className="h-3.5 w-3.5" />
                      )}
                      Payslips
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </TableShell>

      <InitRunModal
        open={initModalOpen}
        onClose={() => setInitModalOpen(false)}
        periods={periods}
        onSaved={onRefresh}
      />
      <RunDetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailRunId(null); }}
        runId={detailRunId}
      />
    </>
  );
}

// ─── KPI Cards ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none text-white shadow-sm ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</div>
        <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{value}</div>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function PayrollEngine() {
  const [activeTab, setActiveTab] = useState('Components');
  const [components, setComponents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState({ components: false, structures: false, periods: false, runs: false });

  const setL = (key, val) => setLoading((prev) => ({ ...prev, [key]: val }));

  const fetchComponents = useCallback(async () => {
    try {
      setL('components', true);
      const res = await api.get('/admin/payroll-engine/components');
      setComponents(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load components');
    } finally {
      setL('components', false);
    }
  }, []);

  const fetchStructures = useCallback(async () => {
    try {
      setL('structures', true);
      const res = await api.get('/admin/payroll-engine/structures');
      setStructures(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load structures');
    } finally {
      setL('structures', false);
    }
  }, []);

  const fetchPeriods = useCallback(async () => {
    try {
      setL('periods', true);
      const res = await api.get('/admin/payroll-engine/pay-periods');
      setPeriods(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load pay periods');
    } finally {
      setL('periods', false);
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      setL('runs', true);
      const res = await api.get('/admin/payroll-engine/runs');
      setRuns(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load payroll runs');
    } finally {
      setL('runs', false);
    }
  }, []);

  // Fetch all on mount; also fetch components for structure modal
  useEffect(() => {
    fetchComponents();
    fetchStructures();
    fetchPeriods();
    fetchRuns();
  }, []);

  // Refresh active tab data
  const refreshActive = useCallback(() => {
    if (activeTab === 'Components') fetchComponents();
    else if (activeTab === 'Structures') { fetchStructures(); fetchComponents(); }
    else if (activeTab === 'Pay Periods') fetchPeriods();
    else if (activeTab === 'Payroll Runs') fetchRuns();
  }, [activeTab, fetchComponents, fetchStructures, fetchPeriods, fetchRuns]);

  const kpis = [
    { icon: RiCoinsLine, label: 'Total Components', value: components.length, color: 'bg-[#0F172A]' },
    { icon: RiFileListLine, label: 'Salary Structures', value: structures.length, color: 'bg-[#0F766E]' },
    { icon: RiCalendarLine, label: 'Active Periods', value: periods.filter((p) => !p.status || p.status === 'open').length, color: 'bg-blue-600' },
    { icon: RiPlayCircleLine, label: 'Payroll Runs', value: runs.length, color: 'bg-violet-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">Payroll Engine</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Finance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Payroll Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refreshActive}
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <RiRefreshLine className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        {/* Emerald Header */}
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <RiSettings3Line className="h-4 w-4" /> Payroll Engine Configuration
          </h2>
        </div>

        {/* Tab Strip */}
        <div className="border-b border-slate-200 bg-white px-4 pt-3">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Components' && (
          <ComponentsTab
            components={components}
            loading={loading.components}
            onRefresh={fetchComponents}
          />
        )}
        {activeTab === 'Structures' && (
          <StructuresTab
            structures={structures}
            components={components}
            loading={loading.structures}
            onRefresh={() => { fetchStructures(); fetchComponents(); }}
          />
        )}
        {activeTab === 'Pay Periods' && (
          <PayPeriodsTab
            periods={periods}
            loading={loading.periods}
            onRefresh={fetchPeriods}
          />
        )}
        {activeTab === 'Payroll Runs' && (
          <PayrollRunsTab
            runs={runs}
            periods={periods}
            loading={loading.runs}
            onRefresh={fetchRuns}
          />
        )}
      </div>
    </div>
  );
}
