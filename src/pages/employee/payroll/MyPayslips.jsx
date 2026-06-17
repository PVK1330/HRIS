import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RiFileTextLine,
  RiSearchLine,
  RiArrowLeftLine,
  RiPrinterLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiArrowRightSLine,
  RiDownloadLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiSubtractLine,
  RiAddLine,
} from 'react-icons/ri';
import { Modal } from '../../../components/ui/Modal.jsx';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function fmtCurrency(val) {
  if (val == null || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function periodLabel(payslip) {
  if (payslip.period_label) return payslip.period_label;
  const m = payslip.month || payslip.pay_month;
  const y = payslip.year || payslip.pay_year;
  if (m && y) return `${MONTHS[m - 1]} ${y}`;
  return payslip.pay_period || '—';
}

function StatusChip({ status }) {
  const s = (status || '').toLowerCase();
  if (s === 'published' || s === 'approved' || s === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
        <RiCheckboxCircleLine className="h-3 w-3" /> Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold uppercase tracking-wider">
      <RiTimeLine className="h-3 w-3" /> Processing
    </span>
  );
}

// ─── Payslip Detail View (inline, not modal) ──────────────────────────────────
function PayslipDetail({ payslip, onBack }) {
  const earnings = payslip.earnings || payslip.components?.filter((c) => c.component_type === 'earning') || [];
  const deductions = payslip.deductions || payslip.components?.filter((c) => c.component_type === 'deduction') || [];
  const empContribs = payslip.employer_contributions || payslip.components?.filter((c) => c.component_type === 'employer_contribution') || [];

  const grossPay = parseFloat(payslip.gross_pay || payslip.gross || 0);
  const totalDeductions = parseFloat(payslip.total_deductions || payslip.deductions_total || 0);
  const netPay = parseFloat(payslip.net_pay || payslip.net || 0);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Back Button + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0F766E] transition-colors"
        >
          <RiArrowLeftLine className="h-4 w-4" /> Back to Payslips
        </button>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RiPrinterLine className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* Payslip Document */}
      <div id="payslip-print-area" className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Colored Header Band */}
        <div className="bg-[#0F766E] px-8 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
          <div className="absolute bottom-0 left-0 h-20 w-20 bg-white/5 -ml-10 -mb-10 rounded-full" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Pay Slip</div>
              <div className="text-2xl font-black text-white">{periodLabel(payslip)}</div>
              {payslip.employee_name && (
                <div className="mt-1 text-sm font-medium text-white/80">{payslip.employee_name}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Net Pay</div>
              <div className="text-3xl font-black text-white">{fmtCurrency(netPay)}</div>
              <div className="mt-1">
                <StatusChip status={payslip.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Employee & Period Info */}
        {(payslip.designation || payslip.department || payslip.payment_date || payslip.paid_date) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-slate-200">
            {[
              { label: 'Designation', value: payslip.designation },
              { label: 'Department', value: payslip.department },
              { label: 'Pay Date', value: fmtDate(payslip.payment_date || payslip.paid_date) },
              { label: 'Pay Period', value: periodLabel(payslip) },
            ].filter((i) => i.value).map((item, idx, arr) => (
              <div key={item.label} className={`px-5 py-3 ${idx < arr.length - 1 ? 'border-r border-slate-200' : ''}`}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                <div className="mt-0.5 text-sm font-medium text-slate-800">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pay Summary Tiles */}
        <div className="grid grid-cols-3 border-b border-slate-200 divide-x divide-slate-200">
          {[
            { label: 'Gross Pay', value: fmtCurrency(grossPay), color: 'text-slate-900' },
            { label: 'Total Deductions', value: fmtCurrency(totalDeductions), color: 'text-red-600' },
            { label: 'Net Pay', value: fmtCurrency(netPay), color: 'text-[#0F766E]' },
          ].map((item) => (
            <div key={item.label} className="px-5 py-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
              <div className={`mt-1 text-xl font-black ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Earnings */}
          <div>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-emerald-50">
              <RiAddLine className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Earnings</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {earnings.length === 0 && (
                <div className="px-5 py-4 text-sm text-slate-400 text-center">No earnings data</div>
              )}
              {earnings.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-700">{item.name || item.component_name}</span>
                  <span className="text-sm font-semibold text-slate-900">{fmtCurrency(item.amount || item.value)}</span>
                </div>
              ))}
              {earnings.length > 0 && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-emerald-50/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Earnings</span>
                  <span className="text-sm font-black text-emerald-700">{fmtCurrency(grossPay)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-red-50">
              <RiSubtractLine className="h-4 w-4 text-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-700">Deductions</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {deductions.length === 0 && (
                <div className="px-5 py-4 text-sm text-slate-400 text-center">No deductions</div>
              )}
              {deductions.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-700">{item.name || item.component_name}</span>
                  <span className="text-sm font-semibold text-red-600">{fmtCurrency(item.amount || item.value)}</span>
                </div>
              ))}
              {deductions.length > 0 && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-red-50/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700">Total Deductions</span>
                  <span className="text-sm font-black text-red-700">{fmtCurrency(totalDeductions)}</span>
                </div>
              )}
            </div>

            {/* Employer Contributions */}
            {empContribs.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 border-b border-slate-100 bg-blue-50">
                  <RiMoneyDollarCircleLine className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-700">Employer Contributions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {empContribs.map((item, i) => (
                    <div key={item.id || i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors">
                      <span className="text-sm text-slate-700">{item.name || item.component_name}</span>
                      <span className="text-sm font-semibold text-blue-600">{fmtCurrency(item.amount || item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Net Pay Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Net Pay = Gross Pay − Total Deductions
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">{fmtCurrency(grossPay)} − {fmtCurrency(totalDeductions)} =</span>
            <span className="text-xl font-black text-[#0F766E]">{fmtCurrency(netPay)}</span>
          </div>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body > *:not(#payslip-print-area) { display: none !important; }
          #payslip-print-area { display: block !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function MyPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payroll-engine/my-payslips');
      setPayslips(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

  const handleViewDetail = async (payslip) => {
    // If we already have full breakdown, show it
    if (payslip.earnings || payslip.components) {
      setSelected(payslip);
      return;
    }
    try {
      setDetailLoading(true);
      const res = await api.get(`/admin/payroll-engine/payslips/${payslip.id}`);
      setSelected(res.data?.data || res.data);
    } catch {
      toast.error('Failed to load payslip detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payslips.filter((p) =>
      periodLabel(p).toLowerCase().includes(q) ||
      String(p.status || '').toLowerCase().includes(q)
    );
  }, [payslips, search]);

  // Summary stats
  const publishedCount = payslips.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s === 'published' || s === 'approved' || s === 'paid';
  }).length;
  const latestNet = payslips.length > 0 ? (payslips[0]?.net_pay || payslips[0]?.net || 0) : 0;

  // If a payslip is selected, show the detail view
  if (selected) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
        <PayslipDetail payslip={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">My Payslips</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Payroll</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">My Payslips</span>
          </div>
        </div>
        <button
          onClick={fetchPayslips}
          className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm shrink-0"
        >
          <RiRefreshLine className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 min-w-0">
        {[
          {
            icon: RiFileTextLine,
            label: 'Total Payslips',
            value: payslips.length,
            color: 'bg-[#0F172A]',
          },
          {
            icon: RiCheckboxCircleLine,
            label: 'Published',
            value: publishedCount,
            color: 'bg-[#0F766E]',
          },
          {
            icon: RiMoneyDollarCircleLine,
            label: 'Latest Net Pay',
            value: fmtCurrency(latestNet),
            color: 'bg-blue-600',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none text-white shadow-sm ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">{card.label}</div>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        {/* Emerald Header */}
        <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <RiFileTextLine className="h-4 w-4" /> Payslip History
          </h2>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by period or status…"
              className="h-9 w-full sm:w-64 pl-9 pr-3 rounded-none border border-slate-200 bg-slate-50 text-sm focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {filtered.length} payslip{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* List */}
        {loading && (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-none shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-5 py-16 text-center">
            <RiFileTextLine className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No payslips found</p>
            <p className="text-xs text-slate-400 mt-1">Your payslips will appear here once payroll is processed.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filtered.map((payslip) => {
              const net = parseFloat(payslip.net_pay || payslip.net || 0);
              const gross = parseFloat(payslip.gross_pay || payslip.gross || 0);

              return (
                <button
                  key={payslip.id}
                  onClick={() => handleViewDetail(payslip)}
                  disabled={detailLoading}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors group disabled:opacity-60"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#0F766E]/10 text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                    <RiFileTextLine className="h-5 w-5" />
                  </div>

                  {/* Period & Date */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{periodLabel(payslip)}</div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {payslip.payment_date || payslip.paid_date ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <RiCalendarLine className="h-3 w-3" />
                          {fmtDate(payslip.payment_date || payslip.paid_date)}
                        </span>
                      ) : null}
                      {gross > 0 && (
                        <span className="text-xs text-slate-400">Gross: {fmtCurrency(gross)}</span>
                      )}
                    </div>
                  </div>

                  {/* Net & Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-[#0F766E]">{fmtCurrency(net)}</div>
                      <div className="mt-0.5">
                        <StatusChip status={payslip.status} />
                      </div>
                    </div>
                    <RiArrowRightSLine className="h-5 w-5 text-slate-300 group-hover:text-[#0F766E] transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading overlay for detail fetch */}
        {detailLoading && (
          <div className="flex items-center justify-center py-6 border-t border-slate-100 bg-slate-50/50">
            <RiRefreshLine className="h-4 w-4 animate-spin text-[#0F766E] mr-2" />
            <span className="text-sm text-slate-500">Loading payslip…</span>
          </div>
        )}
      </div>
    </div>
  );
}
