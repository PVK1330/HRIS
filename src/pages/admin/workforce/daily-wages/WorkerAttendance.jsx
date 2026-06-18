import { useState } from 'react'
import {
  HiMagnifyingGlass, HiUsers, HiClock,
  HiExclamationTriangle, HiMapPin, HiSignal, HiArrowPath,
  HiCheckCircle, HiXCircle, HiExclamationCircle,
  HiCurrencyRupee, HiCalendar, HiDocumentArrowDown,
  HiTableCells, HiChartBar,
} from 'react-icons/hi2'
import { Table } from '../../../../components/ui/Table.jsx'

const MOCK_ATTENDANCE = [
  { id: 'ATT-001', workerId: 'DW-001', workerName: 'Rahul Sharma', role: 'Floor Supervisor', area: 'Pune Plant', zone: 'Production Unit', date: '2024-06-19', checkIn: '06:05', checkOut: '14:10', duration: '8h 05m', attendanceStatus: 'Present', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 650, grossPay: 650 },
  { id: 'ATT-002', workerId: 'DW-002', workerName: 'Sunita Pawar', role: 'Packer', area: 'Warehouse Area', zone: 'Loading Dock', date: '2024-06-19', checkIn: '09:00', checkOut: null, duration: '—', attendanceStatus: 'In Progress', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 520, grossPay: 0 },
  { id: 'ATT-003', workerId: 'DW-003', workerName: 'Manoj Thakur', role: 'Security Guard', area: 'North Gate Zone', zone: 'Gate A', date: '2024-06-19', checkIn: '22:00', checkOut: '06:00', duration: '8h 00m', attendanceStatus: 'Present', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 580, grossPay: 580 },
  { id: 'ATT-004', workerId: 'DW-004', workerName: 'Anita Desai', role: 'Cleaning Operative', area: 'Admin Block', zone: 'Canteen Area', date: '2024-06-19', checkIn: null, checkOut: null, duration: '—', attendanceStatus: 'Absent', geofenceStatus: '—', gpsVerified: false, dailyRate: 480, grossPay: 0 },
  { id: 'ATT-005', workerId: 'DW-005', workerName: 'Vijay Kumar Kadam', role: 'Driver', area: 'South Yard', zone: 'Parking Zone', date: '2024-06-19', checkIn: '14:00', checkOut: '19:00', duration: '5h 00m', attendanceStatus: 'Half Day', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 700, grossPay: 350 },
  { id: 'ATT-006', workerId: 'DW-006', workerName: 'Rekha Bhosale', role: 'Warehouse Operative', area: 'Pune Plant', zone: 'Production Unit', date: '2024-06-19', checkIn: '06:10', checkOut: '14:00', duration: '7h 50m', attendanceStatus: 'Present', geofenceStatus: 'Outside', gpsVerified: false, dailyRate: 750, grossPay: 750 },
  { id: 'ATT-007', workerId: 'DW-007', workerName: 'Santosh More', role: 'General Labourer', area: 'Chinchwad Site', zone: 'Gate A', date: '2024-06-19', checkIn: '06:15', checkOut: '14:15', duration: '8h 00m', attendanceStatus: 'Present', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 430, grossPay: 430 },
  { id: 'ATT-008', workerId: 'DW-008', workerName: 'Lata Gaikwad', role: 'Cleaning Operative', area: 'Admin Block', zone: 'Canteen Area', date: '2024-06-19', checkIn: '09:05', checkOut: null, duration: '—', attendanceStatus: 'In Progress', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 460, grossPay: 0 },
  { id: 'ATT-009', workerId: 'DW-001', workerName: 'Rahul Sharma', role: 'Floor Supervisor', area: 'Pune Plant', zone: 'Production Unit', date: '2024-06-18', checkIn: '06:02', checkOut: '14:05', duration: '8h 03m', attendanceStatus: 'Present', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 650, grossPay: 650 },
  { id: 'ATT-010', workerId: 'DW-002', workerName: 'Sunita Pawar', role: 'Packer', area: 'Warehouse Area', zone: 'Loading Dock', date: '2024-06-18', checkIn: '09:10', checkOut: '17:10', duration: '8h 00m', attendanceStatus: 'Present', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 520, grossPay: 520 },
  { id: 'ATT-011', workerId: 'DW-005', workerName: 'Vijay Kumar Kadam', role: 'Driver', area: 'South Yard', zone: 'Parking Zone', date: '2024-06-18', checkIn: '07:45', checkOut: '13:00', duration: '5h 15m', attendanceStatus: 'Half Day', geofenceStatus: 'Inside', gpsVerified: true, dailyRate: 700, grossPay: 350 },
  { id: 'ATT-012', workerId: 'DW-003', workerName: 'Manoj Thakur', role: 'Security Guard', area: 'North Gate Zone', zone: 'Security Post', date: '2024-06-18', checkIn: null, checkOut: null, duration: '—', attendanceStatus: 'Absent', geofenceStatus: '—', gpsVerified: false, dailyRate: 580, grossPay: 0 },
]

const STATUS_STYLES = {
  'Present':     'bg-emerald-50 border-emerald-200 text-emerald-700',
  'Absent':      'bg-red-50 border-red-200 text-red-700',
  'Half Day':    'bg-amber-50 border-amber-200 text-amber-700',
  'In Progress': 'bg-blue-50 border-blue-200 text-blue-700',
}

function AttendanceBadge({ status }) {
  const s = STATUS_STYLES[status] || 'bg-slate-50 border-slate-200 text-slate-700'
  return <span className={`rounded-none border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s}`}>{status}</span>
}
function GpsBadge({ verified }) {
  return verified
    ? <span className="inline-flex items-center gap-1 rounded-none bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700"><HiCheckCircle className="h-3 w-3" />Verified</span>
    : <span className="inline-flex items-center gap-1 rounded-none bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600"><HiXCircle className="h-3 w-3" />Not verified</span>
}
function GeofenceBadge({ status }) {
  if (status === '—') return <span className="text-slate-400 text-xs">—</span>
  return status === 'Inside'
    ? <span className="inline-flex items-center gap-1 rounded-none bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-bold text-green-700"><HiSignal className="h-3 w-3" />Inside</span>
    : <span className="inline-flex items-center gap-1 rounded-none bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700"><HiExclamationTriangle className="h-3 w-3" />Outside</span>
}

const TABS = ['Daily Log', 'Weekly Summary', 'Monthly Report']

export default function WorkerAttendance() {
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [dateFrom, setDateFrom] = useState('2024-06-18')
  const [dateTo, setDateTo] = useState('2024-06-19')
  const [appliedFrom, setAppliedFrom] = useState('2024-06-18')
  const [appliedTo, setAppliedTo] = useState('2024-06-19')

  const filtered = MOCK_ATTENDANCE.filter(r =>
    (!search || r.workerName.toLowerCase().includes(search.toLowerCase()) || r.workerId.toLowerCase().includes(search.toLowerCase()))
    && (!filterStatus || r.attendanceStatus === filterStatus)
    && (!filterArea || r.area === filterArea)
    && (!appliedFrom || r.date >= appliedFrom)
    && (!appliedTo || r.date <= appliedTo)
  )

  const stats = {
    total: filtered.length,
    present: filtered.filter(r => r.attendanceStatus === 'Present').length,
    absent: filtered.filter(r => r.attendanceStatus === 'Absent').length,
    halfDay: filtered.filter(r => r.attendanceStatus === 'Half Day').length,
    inProgress: filtered.filter(r => r.attendanceStatus === 'In Progress').length,
    grossPayable: filtered.reduce((a, r) => a + (r.grossPay || 0), 0),
  }

  const areas = [...new Set(MOCK_ATTENDANCE.map(r => r.area))]

  // ── Weekly summary mock ─────────────────────────────────────────────────────
  const weeklyWorkers = [
    { name: 'Rahul Sharma', id: 'DW-001', mon: '8h 05m', tue: '8h 03m', wed: '7h 55m', thu: '8h 05m', fri: '—', sat: '—', sun: '—', total: '32h 08m', grossPay: 2600 },
    { name: 'Sunita Pawar', id: 'DW-002', mon: '8h 00m', tue: 'Absent', wed: '8h 10m', thu: 'In Progress', fri: '—', sat: '—', sun: '—', total: '~24h', grossPay: 1560 },
    { name: 'Manoj Thakur', id: 'DW-003', mon: '8h 00m', tue: '8h 00m', wed: 'Absent', thu: 'Absent', fri: '—', sat: '—', sun: '—', total: '16h 00m', grossPay: 1160 },
    { name: 'Vijay Kumar Kadam', id: 'DW-005', mon: '5h 15m', tue: '8h 00m', wed: '5h 00m', thu: '8h 00m', fri: '—', sat: '—', sun: '—', total: '26h 15m', grossPay: 2100 },
  ]
  const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  function dayColor(val) {
    if (!val || val === '—') return 'text-slate-300'
    if (val === 'Absent') return 'text-red-500 font-semibold'
    if (val === 'In Progress') return 'text-blue-500 font-semibold'
    return 'text-emerald-700 font-medium'
  }

  // ── Monthly summary mock ────────────────────────────────────────────────────
  const monthlyData = [
    { name: 'Rahul Sharma', id: 'DW-001', role: 'Floor Supervisor', daysPresent: 22, daysAbsent: 2, halfDays: 0, totalHours: '176h', grossPay: 14300 },
    { name: 'Sunita Pawar', id: 'DW-002', role: 'Packer', daysPresent: 20, daysAbsent: 4, halfDays: 0, totalHours: '160h', grossPay: 10400 },
    { name: 'Manoj Thakur', id: 'DW-003', role: 'Security Guard', daysPresent: 18, daysAbsent: 6, halfDays: 0, totalHours: '144h', grossPay: 10440 },
    { name: 'Vijay Kumar Kadam', id: 'DW-005', role: 'Driver', daysPresent: 19, daysAbsent: 3, halfDays: 2, totalHours: '158h', grossPay: 13300 },
    { name: 'Rekha Bhosale', id: 'DW-006', role: 'Warehouse Operative', daysPresent: 23, daysAbsent: 1, halfDays: 0, totalHours: '184h', grossPay: 17250 },
  ]

  const columns = [
    {
      key: 'worker', label: 'Worker', render: (_, r) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{r.workerName}</p>
          <p className="text-[11px] font-mono text-slate-400">{r.workerId} · {r.role}</p>
        </div>
      )
    },
    { key: 'date', label: 'Date', render: (_, r) => <span className="text-sm text-slate-700 font-medium whitespace-nowrap">{r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span> },
    {
      key: 'site', label: 'Site', render: (_, r) => (
        <div className="flex items-start gap-1.5">
          <HiMapPin className="h-3.5 w-3.5 shrink-0 text-[#0F766E] mt-0.5" />
          <div>
            <p className="text-xs font-medium text-slate-700">{r.area}</p>
            <p className="text-[11px] text-slate-400">{r.zone}</p>
          </div>
        </div>
      )
    },
    { key: 'checkIn', label: 'Check-in', render: (_, r) => r.checkIn ? <span className="text-sm font-medium text-slate-700">{r.checkIn}</span> : <span className="text-slate-400">—</span> },
    { key: 'checkOut', label: 'Check-out', render: (_, r) => r.checkOut ? <span className="text-sm font-medium text-slate-700">{r.checkOut}</span> : <span className="text-slate-400">—</span> },
    {
      key: 'duration', label: 'Duration', render: (_, r) => (
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${r.duration === '—' ? 'text-slate-400' : 'text-slate-800'}`}>
          {r.duration !== '—' && <HiClock className="h-3.5 w-3.5 text-slate-400" />}{r.duration}
        </span>
      )
    },
    { key: 'gpsVerified', label: 'GPS Verified', render: (_, r) => <GpsBadge verified={r.gpsVerified} /> },
    { key: 'attendanceStatus', label: 'Status', render: (_, r) => <AttendanceBadge status={r.attendanceStatus} /> },
    { key: 'geofenceStatus', label: 'Geofence', render: (_, r) => <GeofenceBadge status={r.geofenceStatus} /> },
    {
      key: 'grossPay', label: 'Gross Pay (₹)', render: (_, r) => (
        <span className={`inline-flex items-center gap-1 text-sm font-bold ${r.grossPay > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
          {r.grossPay > 0 ? <><HiCurrencyRupee className="h-3.5 w-3.5 text-slate-500" />{Number(r.grossPay).toLocaleString()}</> : '—'}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Attendance Records</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Workforce Management</span><span className="text-slate-400">&gt;</span><span className="text-slate-600">Attendance</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
            <HiDocumentArrowDown className="h-4 w-4" />Export CSV
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
            <HiDocumentArrowDown className="h-4 w-4" />Export XLSX
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
            <HiArrowPath className="h-4 w-4" />Refresh
          </button>
        </div>
      </div>

      {/* Isolation banner */}
      <div className="flex items-start gap-3 rounded-none border border-amber-200 bg-amber-50 px-4 py-3">
        <HiExclamationCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="text-xs font-medium text-amber-800">
          Attendance data for daily wages workers is stored in a <strong>separate system</strong>. It does not merge with, or affect, the permanent employee attendance records.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Present Today', count: stats.present + stats.inProgress, bg: 'bg-[#10B981]', icon: HiCheckCircle, sub: `${stats.inProgress} in progress` },
          { label: 'Days Worked (Jun)', count: MOCK_ATTENDANCE.filter(r => r.attendanceStatus === 'Present').length, bg: 'bg-[#0F766E]', icon: HiTableCells, sub: 'Across all workers' },
          { label: 'Absences (Jun)', count: MOCK_ATTENDANCE.filter(r => r.attendanceStatus === 'Absent').length, bg: 'bg-[#EF4444]', icon: HiXCircle, sub: 'This month' },
          { label: 'Avg. Hours/Day', count: '8.3', bg: 'bg-[#0F172A]', icon: HiChartBar, sub: 'This month' },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-3.5 rounded-none border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${c.bg} text-white`}><c.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">{c.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900 leading-none">{c.count}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab, i) => (
          <button key={tab} type="button" onClick={() => setActiveTab(i)}
            className={`py-2.5 px-5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === i ? 'border-[#0F766E] text-[#0F766E]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Daily Log ──────────────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Daily Attendance Log</h2>
            <span className="text-xs font-medium text-teal-200">{filtered.length} records</span>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search worker name or ID…"
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]" />
            </div>
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
              <option value="">All Sites</option>{areas.map(a => <option key={a}>{a}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-[#0F766E] cursor-pointer">
              <option value="">All Statuses</option>
              <option>Present</option><option>Absent</option><option>Half Day</option><option>In Progress</option>
            </select>
            <div className="flex items-center gap-2">
              <HiCalendar className="h-4 w-4 shrink-0 text-slate-400" />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-10 flex-1 min-w-0 rounded-none border border-slate-200 bg-slate-50/70 px-2 text-sm outline-none transition focus:border-[#0F766E]" />
              <span className="text-xs text-slate-400 shrink-0">to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-10 flex-1 min-w-0 rounded-none border border-slate-200 bg-slate-50/70 px-2 text-sm outline-none transition focus:border-[#0F766E]" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setAppliedFrom(dateFrom); setAppliedTo(dateTo) }}
                className="h-10 flex-1 rounded-none bg-[#0F766E] px-3 text-xs font-bold text-white hover:bg-[#0c6b64]">Apply</button>
              <button type="button" onClick={() => { setSearch(''); setFilterStatus(''); setFilterArea(''); setDateFrom('2024-06-18'); setDateTo('2024-06-19'); setAppliedFrom('2024-06-18'); setAppliedTo('2024-06-19') }}
                className="shrink-0 rounded-none border border-dashed border-slate-200 px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-500 hover:border-slate-300">Reset</button>
            </div>
          </div>

          <Table columns={columns} data={filtered} pageSize={8} />

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
            <span className="text-xs font-medium text-slate-500">Showing {filtered.length} of {MOCK_ATTENDANCE.length} records</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <HiCurrencyRupee className="h-4 w-4 text-[#0F766E]" />
              Total Gross: ₹{filtered.reduce((a, r) => a + (r.grossPay || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* ── Weekly Summary ─────────────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Weekly Summary — 16–22 June 2024</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-5 py-3 text-left">Worker</th>
                  {DAYS_SHORT.map(d => <th key={d} className="px-3 py-3 text-center">{d}</th>)}
                  <th className="px-5 py-3 text-right">Total Hrs</th>
                  <th className="px-5 py-3 text-right">Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                {weeklyWorkers.map((w, i) => (
                  <tr key={w.id} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900 text-sm">{w.name}</p>
                      <p className="font-mono text-[11px] text-[#0F766E]">{w.id}</p>
                    </td>
                    {dayKeys.map(dk => (
                      <td key={dk} className={`px-3 py-3 text-center text-xs ${dayColor(w[dk])}`}>
                        {w[dk]}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right text-sm font-bold text-slate-800">{w.total}</td>
                    <td className="px-5 py-3 text-right text-sm font-black text-slate-900">₹{w.grossPay.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Monthly Report ─────────────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Monthly Report — June 2024</h2>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-none border border-teal-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700">
              <HiDocumentArrowDown className="h-3.5 w-3.5" />Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-5 py-3 text-left">Worker</th>
                  <th className="px-4 py-3 text-center">Days Present</th>
                  <th className="px-4 py-3 text-center">Absences</th>
                  <th className="px-4 py-3 text-center">Half Days</th>
                  <th className="px-4 py-3 text-right">Total Hours</th>
                  <th className="px-5 py-3 text-right">Gross Pay (₹)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((w, i) => (
                  <tr key={w.id} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{w.name}</p>
                      <p className="text-[11px] text-slate-400">{w.id} · {w.role}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-none bg-slate-100">
                          <div className="h-1.5 rounded-none bg-[#0F766E]" style={{ width: `${(w.daysPresent / 24) * 100}%` }} />
                        </div>
                        <span className="font-bold text-emerald-700">{w.daysPresent}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-red-500">{w.daysAbsent}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-600">{w.halfDays}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{w.totalHours}</td>
                    <td className="px-5 py-3 text-right font-black text-slate-900 text-base">₹{w.grossPay.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Totals</td>
                  <td className="px-4 py-3 text-center font-black text-slate-800">{monthlyData.reduce((a, r) => a + r.daysPresent, 0)}</td>
                  <td className="px-4 py-3 text-center font-black text-red-500">{monthlyData.reduce((a, r) => a + r.daysAbsent, 0)}</td>
                  <td className="px-4 py-3 text-center font-black text-amber-600">{monthlyData.reduce((a, r) => a + r.halfDays, 0)}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-800">—</td>
                  <td className="px-5 py-3 text-right font-black text-[#0F766E] text-base">₹{monthlyData.reduce((a, r) => a + r.grossPay, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
