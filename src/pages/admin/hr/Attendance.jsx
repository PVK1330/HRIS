import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  HiCalendar, HiPlus, HiEye, HiCheck, HiXMark,
  HiClock, HiUsers, HiGlobeAlt, HiBuildingOffice,
  HiMagnifyingGlass, HiAdjustmentsHorizontal, HiArrowPath,
  HiExclamationTriangle, HiOutlineClipboardDocumentCheck,
  HiArrowTrendingUp, HiArrowDownTray,
} from 'react-icons/hi2'
import { Badge }    from '../../../components/ui/Badge.jsx'
import { Button }   from '../../../components/ui/Button.jsx'
import { Modal }    from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table }    from '../../../components/ui/Table.jsx'
import {
  listAttendance, markAttendance,
  getPendingRegularizations, regularize,
} from '../../../services/attendanceService.js'
import { listEmployees } from '../../../services/employeeService.js'

const selectClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all'
const textareaClass = 'w-full min-h-[80px] rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all'

const EMPTY_FORM = {
  employeeId: '', date: new Date().toISOString().split('T')[0],
  checkInTime: '', checkOutTime: '', workMode: 'In Office',
  status: 'Present', overtimeHours: '', isLate: false, notes: '',
}

function statusColor(s) {
  if (s === 'Present')  return 'green'
  if (s === 'Remote')   return 'blue'
  if (s === 'Late')     return 'orange'
  if (s === 'Absent')   return 'red'
  if (s === 'Half Day') return 'yellow'
  if (s === 'On Leave') return 'purple'
  return 'slate'
}

export default function Attendance() {
  const today = new Date().toISOString().split('T')[0]

  // Filters
  const [date, setDate]           = useState(today)
  const [search, setSearch]       = useState('')
  const [dept, setDept]           = useState('')
  const [statusFilter, setStatus] = useState('')

  // Data
  const [records, setRecords]         = useState([])
  const [summary, setSummary]         = useState(null)
  const [total, setTotal]             = useState(0)
  const [pending, setPending]         = useState([])
  const [empList, setEmpList]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [loadingPending, setLoadingPending] = useState(false)

  // Modals
  const [markModal, setMarkModal]     = useState(false)
  const [viewModal, setViewModal]     = useState(false)
  const [actionModal, setActionModal] = useState(false)
  const [selected, setSelected]       = useState(null)
  const [actionType, setActionType]   = useState('')
  const [actionReason, setActionReason] = useState('')
  const [form, setForm]               = useState(EMPTY_FORM)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAttendance({ date, department: dept, status: statusFilter, search })
      setRecords(data.records || [])
      setSummary(data.summary || null)
      setTotal(data.total || 0)
    } catch (err) {
      setError(err?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [date, dept, statusFilter, search])

  const fetchPending = useCallback(async () => {
    setLoadingPending(true)
    try {
      const data = await getPendingRegularizations()
      setPending(data.records || [])
    } catch { /* non-critical */ }
    finally { setLoadingPending(false) }
  }, [])

  const fetchEmpList = useCallback(async () => {
    if (empList.length > 0) return
    try {
      const data = await listEmployees({ limit: 100 })
      setEmpList(data?.employees || [])
    } catch { /* non-critical */ }
  }, [empList.length])

  useEffect(() => { fetchRecords() }, [fetchRecords])
  useEffect(() => { fetchPending() }, [fetchPending])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await markAttendance({
        employeeId:    parseInt(form.employeeId),
        date:          form.date,
        checkInTime:   form.checkInTime  || null,
        checkOutTime:  form.checkOutTime || null,
        workMode:      form.workMode,
        status:        form.status,
        overtimeHours: form.overtimeHours ? parseFloat(form.overtimeHours) : 0,
        isLate:        form.isLate,
        notes:         form.notes || null,
      })
      setMarkModal(false)
      setForm(EMPTY_FORM)
      fetchRecords()
    } catch (err) {
      alert(err?.message || 'Failed to mark attendance')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegularize = async () => {
    setSubmitting(true)
    try {
      await regularize(selected.id, {
        action: actionType === 'Approve' ? 'approve' : 'reject',
        reason: actionReason || undefined,
      })
      setActionModal(false)
      setActionReason('')
      fetchPending()
      fetchRecords()
    } catch (err) {
      alert(err?.message || 'Failed to process request')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'employee_name', label: 'Personnel',
      render: (v, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 shrink-0 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[10px] font-black text-[#0F766E] border border-[#0F766E]/20">
            {(v || '?').charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none mb-1">{v}</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', label: 'Division' },
    {
      key: 'status', label: 'Presence',
      render: (v) => <Badge label={v} variant="outline" color={statusColor(v)} className="font-black uppercase text-[9px] tracking-widest px-2.5" />,
    },
    {
      key: 'timing', label: 'Shift',
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
          {row.is_late        && <Badge label="Late"         color="orange" variant="soft" className="text-[9px] font-black" />}
          {row.early_departure && <Badge label="Early Exit"  color="rose"   variant="soft" className="text-[9px] font-black" />}
          {!row.check_out_time && row.status === 'Present' && <Badge label="No Checkout" color="red" variant="soft" className="text-[9px] font-black" />}
          {!row.is_late && !row.early_departure && row.check_out_time && <span className="text-xs text-slate-300">Clear</span>}
        </div>
      ),
    },
    {
      key: 'regularization_status', label: 'Reg. Status',
      render: (v) => v && v !== 'N/A'
        ? <Badge label={v} color={v === 'Approved' ? 'green' : v === 'Pending' ? 'orange' : 'red'} variant="soft" className="text-[9px] font-black" />
        : <span className="text-xs text-slate-300">—</span>,
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <Button variant="ghost" size="sm" icon={HiEye}
          onClick={() => { setSelected(row); setViewModal(true) }}
          className="text-slate-400 hover:text-[#0F766E]" />
      ),
    },
  ]

  const pendingColumns = [
    {
      key: 'employee_name', label: 'Petitioner',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
            {(v || '?').charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{v}</div>
            <div className="text-[9px] text-slate-400 font-black uppercase">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'date',   label: 'Date',   render: (v) => <span className="text-xs font-bold text-slate-600">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v} color={statusColor(v)} variant="soft" className="text-[9px] font-black" /> },
    { key: 'notes',  label: 'Reason', render: (v) => <span className="text-[10px] italic text-slate-500">{v || '—'}</span> },
    {
      key: 'actions', label: 'Decision',
      render: (_, row) => (
        <div className="flex gap-1.5">
          <Button label="Approve" variant="ghost" size="sm"
            onClick={() => { setSelected(row); setActionType('Approve'); setActionModal(true) }}
            className="text-[10px] font-black text-emerald-600 hover:bg-emerald-50 uppercase" />
          <Button label="Reject" variant="ghost" size="sm"
            onClick={() => { setSelected(row); setActionType('Reject'); setActionModal(true) }}
            className="text-[10px] font-black text-rose-600 hover:bg-rose-50 uppercase" />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
              <HiClock className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Workforce Presence Intelligence</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Attendance & Timesheet</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md font-medium">
              Monitor operational shifts, audit regularization requests, and manage time policies.
            </p>
          </div>
          <button
            onClick={() => { fetchEmpList(); setMarkModal(true) }}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <HiPlus className="h-4 w-4" /> Manual Punch
          </button>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Present"  value={summary?.present  ?? '—'} subtitle="Today"          color="emerald" icon={HiBuildingOffice} />
        <StatCard title="Remote"   value={summary?.remote   ?? '—'} subtitle="Working Remote" color="blue"    icon={HiGlobeAlt} />
        <StatCard title="Late"     value={summary?.late     ?? '—'} subtitle="Late Marks"     color="orange"  icon={HiClock} />
        <StatCard title="Pending"  value={pending.length}           subtitle="Regularizations" color="rose"   icon={HiExclamationTriangle} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-5 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <HiAdjustmentsHorizontal className="h-4 w-4 text-[#0F766E]" />
              <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none" />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search</label>
              <div className="relative mt-1.5">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select value={statusFilter} onChange={e => setStatus(e.target.value)} className={selectClass}>
                <option value="">All Statuses</option>
                {['Present','Absent','Late','Half Day','On Leave'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <button onClick={() => { setDate(today); setSearch(''); setDept(''); setStatus('') }}
              className="w-full py-2.5 text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] border border-dashed border-slate-200 rounded-xl hover:border-red-200 transition-all">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="xl:col-span-3 space-y-6">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Daily Log */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <HiArrowPath className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-none">Attendance Log — {date}</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time presence tracking</p>
                </div>
              </div>
              <Badge label={`${total} RECORDS`} variant="outline" color="blue" className="font-black text-[8px] px-2 py-0.5" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
            ) : (
              <Table columns={columns} data={records} pageSize={10} />
            )}
          </div>

          {/* Pending Regularizations */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg">
                  <HiExclamationTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-none">Regularization Queue</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pending administrative review</p>
                </div>
              </div>
              <Badge label={`${pending.length} PENDING`} color="orange" className="font-black text-[9px]" />
            </div>
            {loadingPending ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm">Loading…</div>
            ) : pending.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-slate-300 text-xs font-black uppercase tracking-widest">No pending requests</div>
            ) : (
              <Table columns={pendingColumns} data={pending} pageSize={5} />
            )}
          </div>
        </div>
      </div>

      {/* ── Manual Punch Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={markModal} onClose={() => { setMarkModal(false); setForm(EMPTY_FORM) }} title="Manual Attendance Entry" size="lg">
        <form onSubmit={handleMarkSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee <span className="text-red-400">*</span></label>
              <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className={selectClass} required>
                <option value="">Select employee…</option>
                {empList.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.emp_id})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={selectClass} required />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status <span className="text-red-400">*</span></label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectClass} required>
                {['Present','Absent','Half Day','Late','On Leave'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Mode <span className="text-red-400">*</span></label>
              <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))} className={selectClass} required>
                {['In Office','Remote','Field'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Check In</label>
              <input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} className={selectClass} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Check Out</label>
              <input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} className={selectClass} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Overtime Hours</label>
              <input type="number" min="0" step="0.5" value={form.overtimeHours} onChange={e => setForm(f => ({ ...f, overtimeHours: e.target.value }))} className={selectClass} placeholder="0" />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="isLate" checked={form.isLate} onChange={e => setForm(f => ({ ...f, isLate: e.target.checked }))} className="h-4 w-4 rounded text-[#0F766E]" />
              <label htmlFor="isLate" className="text-sm font-bold text-slate-700">Mark as Late</label>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={textareaClass} placeholder="Administrative remarks…" />
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#0F766E] text-white text-sm font-black uppercase tracking-widest shadow-lg disabled:opacity-50">
              {submitting ? 'Saving…' : 'Mark Attendance'}
            </button>
            <button type="button" onClick={() => { setMarkModal(false); setForm(EMPTY_FORM) }}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Detail Modal ──────────────────────────────────────────────── */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Attendance Detail" size="md">
          <div className="space-y-4 pt-2">
            <div className="bg-[#0F766E] p-5 rounded-2xl text-white">
              <p className="text-lg font-black">{selected.employee_name}</p>
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mt-1">{selected.emp_id} · {selected.department}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Date',        selected.date],
                ['Status',      selected.status],
                ['Work Mode',   selected.work_mode],
                ['Check In',    selected.check_in_time  || '—'],
                ['Check Out',   selected.check_out_time || '—'],
                ['Total Hours', selected.total_hours    ? `${selected.total_hours}h` : '—'],
                ['Overtime',    selected.overtime_hours ? `${selected.overtime_hours}h` : '—'],
                ['Reg. Status', selected.regularization_status || 'N/A'],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-xs font-black text-slate-900">{val}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                <p className="text-xs text-slate-700">{selected.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Regularize Action Modal ────────────────────────────────────────── */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason('') }} title={`${actionType} Regularization`} size="sm">
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              {actionType} regularization request for <strong>{selected.employee_name}</strong> on <strong>{selected.date}</strong>?
            </p>
            {actionType === 'Reject' && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className={textareaClass} placeholder="Reason for rejection…" />
              </div>
            )}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={handleRegularize} disabled={submitting}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-black uppercase tracking-widest shadow-lg disabled:opacity-50 ${actionType === 'Approve' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                {submitting ? 'Processing…' : actionType}
              </button>
              <button onClick={() => { setActionModal(false); setActionReason('') }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-black uppercase tracking-widest">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
