import { useState } from 'react'
import {
  HiDocumentArrowDown, HiCurrencyRupee, HiCalendar,
  HiUsers, HiCheckCircle, HiClock, HiExclamationTriangle,
  HiArrowPath, HiInformationCircle, HiBanknotes,
} from 'react-icons/hi2'
import { Table } from '../../../../components/ui/Table.jsx'

const MOCK_WAGES = [
  { id: 'W-001', workerId: 'DW-001', name: 'Rahul Sharma', aadhaar: '1234 5678 9012', pan: 'ABCDE1234F', role: 'Floor Supervisor', area: 'Pune Plant', daysPresent: 22, daysAbsent: 2, dailyRate: 650, grossPay: 14300, status: 'Processed' },
  { id: 'W-002', workerId: 'DW-002', name: 'Sunita Pawar', aadhaar: '9876 5432 1098', pan: 'BCDEF2345G', role: 'Packer', area: 'Warehouse Area', daysPresent: 20, daysAbsent: 4, dailyRate: 520, grossPay: 10400, status: 'Processed' },
  { id: 'W-003', workerId: 'DW-003', name: 'Manoj Thakur', aadhaar: '4567 8901 2345', pan: 'CDEFG3456H', role: 'Security Guard', area: 'North Gate Zone', daysPresent: 18, daysAbsent: 6, dailyRate: 580, grossPay: 10440, status: 'Pending' },
  { id: 'W-004', workerId: 'DW-004', name: 'Anita Desai', aadhaar: '2345 6789 0123', pan: 'DEFGH4567I', role: 'Cleaning Operative', area: 'Admin Block', daysPresent: 19, daysAbsent: 5, dailyRate: 480, grossPay: 9120, status: 'On Hold' },
  { id: 'W-005', workerId: 'DW-005', name: 'Vijay Kumar Kadam', aadhaar: '3456 7890 1234', pan: 'EFGHI5678J', role: 'Driver', area: 'South Yard', daysPresent: 21, daysAbsent: 3, dailyRate: 700, grossPay: 14700, status: 'Pending' },
  { id: 'W-006', workerId: 'DW-006', name: 'Rekha Bhosale', aadhaar: '5678 9012 3456', pan: 'FGHIJ6789K', role: 'Warehouse Operative', area: 'Pune Plant', daysPresent: 23, daysAbsent: 1, dailyRate: 750, grossPay: 17250, status: 'Processed' },
  { id: 'W-007', workerId: 'DW-007', name: 'Santosh More', aadhaar: '6789 0123 4567', pan: 'GHIJK7890L', role: 'General Labourer', area: 'Chinchwad Site', daysPresent: 15, daysAbsent: 9, dailyRate: 430, grossPay: 6450, status: 'Pending' },
  { id: 'W-008', workerId: 'DW-008', name: 'Lata Gaikwad', aadhaar: '7890 1234 5678', pan: 'HIJKL8901M', role: 'Cleaning Operative', area: 'Admin Block', daysPresent: 20, daysAbsent: 4, dailyRate: 460, grossPay: 9200, status: 'On Hold' },
]

const STATUS_STYLES = {
  Processed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Pending: 'bg-amber-50 border-amber-200 text-amber-700',
  'On Hold': 'bg-red-50 border-red-200 text-red-700',
}

function maskedAadhaar(n) { if (!n) return '—'; const d = n.replace(/\s/g, ''); return d.length >= 4 ? `XXXX XXXX ${d.slice(-4)}` : n }

export default function WagesSummary() {
  const [filterMonth, setFilterMonth] = useState('June 2024')
  const [filterArea, setFilterArea] = useState('')
  const [applied, setApplied] = useState({ month: 'June 2024', area: '' })

  const MONTHS = ['April 2024', 'May 2024', 'June 2024', 'July 2024']
  const areas = [...new Set(MOCK_WAGES.map(w => w.area))]

  const filtered = MOCK_WAGES.filter(w => !applied.area || w.area === applied.area)

  const totals = {
    totalGross: filtered.reduce((a, r) => a + r.grossPay, 0),
    totalDays: filtered.reduce((a, r) => a + r.daysPresent, 0),
    processed: filtered.filter(r => r.status === 'Processed').length,
    pending: filtered.filter(r => r.status === 'Pending').length,
    onHold: filtered.filter(r => r.status === 'On Hold').length,
  }

  const columns = [
    {
      key: 'worker', label: 'Worker', render: (_, r) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{r.name}</p>
          <p className="font-mono text-[11px] text-[#0F766E]">{r.workerId}</p>
        </div>
      )
    },
    {
      key: 'ids', label: 'Aadhaar / PAN', render: (_, r) => (
        <div>
          <p className="font-mono text-xs text-slate-600">{maskedAadhaar(r.aadhaar)}</p>
          <p className="font-mono text-[11px] text-slate-400">{r.pan}</p>
        </div>
      )
    },
    { key: 'role', label: 'Role', render: (_, r) => <span className="text-sm text-slate-700">{r.role}</span> },
    { key: 'area', label: 'Area', render: (_, r) => <span className="text-xs text-slate-600">{r.area}</span> },
    {
      key: 'daysPresent', label: 'Days Present', render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-none bg-slate-100">
            <div className="h-1.5 rounded-none bg-[#0F766E]" style={{ width: `${(r.daysPresent / 24) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-slate-800">{r.daysPresent}</span>
        </div>
      )
    },
    { key: 'daysAbsent', label: 'Days Absent', render: (_, r) => <span className="text-sm font-medium text-red-500">{r.daysAbsent}</span> },
    {
      key: 'dailyRate', label: 'Daily Rate (₹)', render: (_, r) => (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-800">
          <HiCurrencyRupee className="h-3.5 w-3.5 text-slate-400" />{r.dailyRate.toLocaleString()}
        </span>
      )
    },
    {
      key: 'grossPay', label: 'Gross Pay (₹)', render: (_, r) => (
        <span className="inline-flex items-center gap-1 text-sm font-black text-slate-900">
          <HiCurrencyRupee className="h-3.5 w-3.5 text-[#0F766E]" />{r.grossPay.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status', label: 'Status', render: (_, r) => (
        <span className={`rounded-none border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[r.status]}`}>{r.status}</span>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Wages Summary</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Workforce Management</span><span className="text-slate-400">&gt;</span><span className="text-slate-600">Wages Summary</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
            <HiDocumentArrowDown className="h-4 w-4" />Export Payslips
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0c6b64] shadow-sm">
            <HiBanknotes className="h-4 w-4" />Run Payroll
          </button>
        </div>
      </div>

      {/* Navy Summary Banner */}
      {/* <div className="rounded-none bg-[#0F172A] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pay Period</p>
            <p className="mt-0.5 text-lg font-black text-white">01 June 2024 – 30 June 2024</p>
            <p className="mt-1 text-xs text-slate-400">Payment Due: <span className="font-semibold text-amber-400">05 July 2024</span></p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Workers</p>
              <p className="mt-1 text-3xl font-black text-white">{filtered.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Days Worked</p>
              <p className="mt-1 text-3xl font-black text-white">{totals.totalDays}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Wages Payable</p>
              <p className="mt-1 text-3xl font-black text-amber-400">₹{totals.totalGross.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-700 pt-4">
          {[
            { label: 'Processed', count: totals.processed, color: 'text-emerald-400' },
            { label: 'Pending', count: totals.pending, color: 'text-amber-400' },
            { label: 'On Hold', count: totals.onHold, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Info alert */}
      <div className="flex items-start gap-3 rounded-none border border-blue-200 bg-blue-50 px-4 py-3">
        <HiInformationCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <p className="text-xs font-medium text-blue-800">
          Amounts shown are <strong>gross wages</strong> (before any deductions). PF, ESIC, or other statutory deductions must be applied separately as per applicable labour laws before disbursing payment.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Wages Breakdown</h2>
          <span className="text-xs font-medium text-teal-200">{filtered.length} workers</span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-3 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <HiCalendar className="h-4 w-4 shrink-0 text-slate-400" />
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="h-10 flex-1 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
            <option value="">All Areas</option>{areas.map(a => <option key={a}>{a}</option>)}
          </select>
          <button type="button" onClick={() => setApplied({ month: filterMonth, area: filterArea })}
            className="h-10 rounded-none bg-[#0F766E] px-4 text-sm font-semibold text-white hover:bg-[#0c6b64]">
            Apply Filter
          </button>
          <div className="flex items-center justify-end">
            <button type="button" onClick={() => { setFilterArea(''); setApplied({ month: filterMonth, area: '' }) }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-slate-300">Reset</button>
          </div>
        </div>

        <Table columns={columns} data={filtered} pageSize={10} />

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
          <span className="text-xs font-medium text-slate-500">{filtered.length} workers in {applied.month}</span>
          <div className="flex items-center gap-1.5 text-sm font-black text-slate-800">
            <HiCurrencyRupee className="h-4 w-4 text-[#0F766E]" />
            Total Gross Wages: ₹{filtered.reduce((a, r) => a + r.grossPay, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
