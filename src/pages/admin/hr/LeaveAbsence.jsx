import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiCalendar, HiPlus, HiEye, HiCheck, HiXMark,
  HiMagnifyingGlass, HiUsers, HiClock, HiCheckCircle, HiXCircle,
  HiInformationCircle,
} from 'react-icons/hi2'
import { Badge }    from '../../../components/ui/Badge.jsx'
import { Button }   from '../../../components/ui/Button.jsx'
import { Modal }    from '../../../components/ui/Modal.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table }    from '../../../components/ui/Table.jsx'
import {
  listLeave, applyLeave, processLeave, listBalances, getLeaveTypes,
  getEmployeeLeave,
} from '../../../services/leaveService.js'
import { listEmployees } from '../../../services/employeeService.js'

const selectClass   = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 mt-1.5 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all'
const textareaClass = 'w-full min-h-[80px] rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 font-bold focus:border-[#0F766E] outline-none transition-all'

const EMPTY_FORM = {
  employeeId: '', leaveType: '', fromDate: '', toDate: '',
  totalDays: '', reason: '', handoverNote: '',
}

function statusColor(s) {
  if (s === 'Approved')  return 'green'
  if (s === 'Pending')   return 'orange'
  if (s === 'Rejected')  return 'red'
  if (s === 'Cancelled') return 'slate'
  return 'slate'
}

/** Calendar-day count inclusive */
function countDays(from, to) {
  if (!from || !to) return 0
  const diff = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1
  return diff > 0 ? diff : 0
}

export default function LeaveAbsence() {
  const currentYear = new Date().getFullYear()

  const [activeTab, setActiveTab] = useState('requests')
  const [search, setSearch]   = useState('')
  const [dept, setDept]       = useState('')
  const [statusF, setStatusF] = useState('')
  const [year, setYear]       = useState(currentYear)

  const [requests, setRequests]     = useState([])
  const [stats, setStats]           = useState(null)
  const [balances, setBalances]     = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [empList, setEmpList]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [loadingBal, setLoadingBal] = useState(false)
  const [error, setError]           = useState('')

  // Apply modal
  const [applyModal, setApplyModal] = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  // Live balance for selected employee+type
  const [liveBalance, setLiveBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  // Action modal
  const [actionModal, setActionModal]   = useState(false)
  const [actionType, setActionType]     = useState('')
  const [actionReason, setActionReason] = useState('')
  const [selected, setSelected]         = useState(null)

  // View modal
  const [viewModal, setViewModal] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await listLeave({ year, status: statusF, department: dept, search })
      setRequests(data.requests || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err?.message || 'Failed to load leave requests')
    } finally { setLoading(false) }
  }, [year, statusF, dept, search])

  const fetchBalances = useCallback(async () => {
    setLoadingBal(true)
    try {
      const data = await listBalances({ year, department: dept, search })
      setBalances(data.balances || [])
    } catch { /* non-critical */ }
    finally { setLoadingBal(false) }
  }, [year, dept, search])

  const fetchLeaveTypes = useCallback(async () => {
    if (leaveTypes.length > 0) return
    try {
      const res = await getLeaveTypes()
      setLeaveTypes((res?.data?.leaveTypes || []).filter(t => t.isActive !== false))
    } catch { /* non-critical */ }
  }, [leaveTypes.length])

  const fetchEmpList = useCallback(async () => {
    if (empList.length > 0) return
    try {
      const data = await listEmployees({ limit: 100 })
      setEmpList(data?.employees || [])
    } catch { /* non-critical */ }
  }, [empList.length])

  useEffect(() => { fetchRequests() }, [fetchRequests])
  useEffect(() => { if (activeTab === 'balances') fetchBalances() }, [activeTab, fetchBalances])

  // Auto-calc days when dates change
  useEffect(() => {
    if (!form.fromDate || !form.toDate) return
    const d = countDays(form.fromDate, form.toDate)
    if (d > 0) setForm(f => ({ ...f, totalDays: String(d) }))
  }, [form.fromDate, form.toDate])

  // Fetch live balance when employee + leave type both selected
  useEffect(() => {
    if (!form.employeeId || !form.leaveType) { setLiveBalance(null); return }
    const yr = form.fromDate ? new Date(form.fromDate).getFullYear() : currentYear
    setLoadingBalance(true)
    getEmployeeLeave(form.employeeId, { year: yr })
      .then(data => {
        const bal = (data?.balances || []).find(
          b => b.leave_type?.toLowerCase() === form.leaveType?.toLowerCase()
        )
        setLiveBalance(bal || null)
      })
      .catch(() => setLiveBalance(null))
      .finally(() => setLoadingBalance(false))
  }, [form.employeeId, form.leaveType, form.fromDate, currentYear])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openApplyModal = () => {
    fetchEmpList(); fetchLeaveTypes()
    setForm(EMPTY_FORM); setLiveBalance(null)
    setApplyModal(true)
  }

  const closeApplyModal = () => {
    setApplyModal(false); setForm(EMPTY_FORM); setLiveBalance(null)
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()

    // Client-side day validation
    const days = parseInt(form.totalDays) || countDays(form.fromDate, form.toDate)
    if (days <= 0) { toast.error('Invalid date range — to date must be after from date'); return }

    // Client-side balance warning (non-blocking for Unpaid, blocking for Paid)
    const selectedType = leaveTypes.find(t => t.name === form.leaveType)
    if (selectedType && selectedType.paidOrUnpaid !== 'Unpaid' && liveBalance) {
      const remaining = (liveBalance.total_allocated + liveBalance.carry_forward) - liveBalance.used
      if (remaining < days) {
        toast.error(
          `Insufficient ${form.leaveType} balance. Requested: ${days}d, Available: ${remaining}d`
        )
        return
      }
    }

    setSubmitting(true)
    try {
      const result = await applyLeave({
        employeeId:   parseInt(form.employeeId),
        leaveType:    form.leaveType,
        fromDate:     form.fromDate,
        toDate:       form.toDate,
        totalDays:    days,
        reason:       form.reason,
        handoverNote: form.handoverNote || undefined,
      })
      toast.success(
        result?.autoApproved
          ? `Leave auto-approved (${days} day${days > 1 ? 's' : ''})`
          : `Leave request submitted (${days} day${days > 1 ? 's' : ''}) — pending approval`
      )
      closeApplyModal()
      fetchRequests()
      if (activeTab === 'balances') fetchBalances()
    } catch (err) {
      toast.error(err?.message || 'Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProcess = async () => {
    setSubmitting(true)
    try {
      await processLeave(selected.id, {
        action: actionType === 'Approve' ? 'approve' : 'reject',
        reason: actionReason || undefined,
      })
      toast.success(
        actionType === 'Approve'
          ? `Leave approved for ${selected.employee_name}`
          : `Leave rejected for ${selected.employee_name}`
      )
      setActionModal(false); setActionReason('')
      fetchRequests()
      if (activeTab === 'balances') fetchBalances()
    } catch (err) {
      toast.error(err?.message || 'Failed to process request')
    } finally {
      setSubmitting(false)
    }
  }

  const openAction = (row, type) => {
    setSelected(row); setActionType(type); setActionReason(''); setActionModal(true)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const pendingReqs  = useMemo(() => requests.filter(r => r.status === 'Pending'),  [requests])
  const approvedReqs = useMemo(() => requests.filter(r => r.status === 'Approved'), [requests])
  const rejectedReqs = useMemo(() => requests.filter(r => r.status === 'Rejected'), [requests])

  // Computed days & balance info for the form
  const formDays = countDays(form.fromDate, form.toDate)
  const selectedTypeCfg = leaveTypes.find(t => t.name === form.leaveType)
  const balanceRemaining = liveBalance
    ? (liveBalance.total_allocated + liveBalance.carry_forward) - liveBalance.used
    : null
  const balanceInsufficient = (
    selectedTypeCfg &&
    selectedTypeCfg.paidOrUnpaid !== 'Unpaid' &&
    liveBalance !== null &&
    formDays > 0 &&
    balanceRemaining < formDays
  )

  // ── Table columns ──────────────────────────────────────────────────────────

  const requestCols = (showActions = false) => [
    {
      key: 'employee_name', label: 'Employee',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[10px] font-black text-[#0F766E]">
            {(v || '?').charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{v}</p>
            <p className="text-[9px] text-slate-400 font-black uppercase">{row.emp_id} · {row.department}</p>
          </div>
        </div>
      ),
    },
    { key: 'leave_type', label: 'Type' },
    {
      key: 'range', label: 'Period',
      render: (_, row) => <span className="text-xs font-bold text-slate-700">{row.from_date} → {row.to_date}</span>,
    },
    {
      key: 'total_days', label: 'Days',
      render: (v) => <Badge label={`${v}d`} color="blue" variant="soft" className="font-black text-[9px]" />,
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge label={v} color={statusColor(v)} variant="outline" className="font-black text-[9px] tracking-widest" />,
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={HiEye}
            onClick={() => { setSelected(row); setViewModal(true) }}
            className="text-slate-400 hover:text-[#0F766E]" />
          {showActions && row.status === 'Pending' && (
            <>
              <button onClick={() => openAction(row, 'Approve')}
                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                <HiCheck className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => openAction(row, 'Reject')}
                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                <HiXMark className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  const balanceCols = [
    {
      key: 'employee_name', label: 'Employee',
      render: (v, row) => (
        <div>
          <p className="text-xs font-bold text-slate-900">{v}</p>
          <p className="text-[9px] text-slate-400 font-black uppercase">{row.emp_id} · {row.department}</p>
        </div>
      ),
    },
    { key: 'job_title', label: 'Designation' },
    {
      key: 'balances', label: 'Leave Balances',
      render: (v) => {
        if (!v || v.length === 0) return <span className="text-xs text-slate-300">No balances</span>
        return (
          <div className="flex flex-wrap gap-1.5">
            {v.map(b => {
              const rem = b.remaining ?? (b.total_allocated + b.carry_forward - b.used)
              const low = rem <= 2
              return (
                <div key={b.leave_type}
                  className={`text-[9px] font-black rounded-lg px-2 py-1 border ${low ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-500">{b.leave_type.split(' ')[0]}: </span>
                  <span className={low ? 'text-red-600' : 'text-emerald-700'}>{rem}</span>
                  <span className="text-slate-400">/{b.total_allocated}</span>
                </div>
              )
            })}
          </div>
        )
      },
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
              <HiCalendar className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Absence Management</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Leave & Absence</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md font-medium">
              Manage leave requests, track balances, and enforce leave policies.
            </p>
          </div>
          <button onClick={openApplyModal}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:scale-105 active:scale-95">
            <HiPlus className="h-4 w-4" /> Add Leave Request
          </button>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total"    value={stats?.total    ?? '—'} subtitle={`${year} Requests`}  color="blue"    icon={HiUsers} />
        <StatCard title="Pending"  value={stats?.pending  ?? '—'} subtitle="Awaiting Approval"   color="orange"  icon={HiClock} />
        <StatCard title="Approved" value={stats?.approved ?? '—'} subtitle="Approved This Year"  color="emerald" icon={HiCheckCircle} />
        <StatCard title="Rejected" value={stats?.rejected ?? '—'} subtitle="Rejected This Year"  color="red"     icon={HiXCircle} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        {[{ id: 'requests', label: 'Approval Workflow' }, { id: 'balances', label: 'Balance Summary' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none w-56" />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none">
          <option value="">All Statuses</option>
          {['Pending','Approved','Rejected','Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-bold text-slate-900 focus:border-[#0F766E] outline-none">
          {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => { setSearch(''); setStatusF(''); setDept(''); setYear(currentYear) }}
          className="px-4 py-2.5 text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest border border-dashed border-slate-200 rounded-xl hover:border-red-200 transition-all">
          Reset
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {[
            { label: 'Pending Requests', data: pendingReqs,  color: 'bg-amber-500',   showActions: true },
            { label: 'Approved History', data: approvedReqs, color: 'bg-emerald-500', showActions: false },
            { label: 'Rejected Records', data: rejectedReqs, color: 'bg-rose-500',    showActions: false },
          ].map(({ label, data, color, showActions }) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`h-7 w-1.5 ${color} rounded-full`} />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{label}</h2>
                <Badge label={data.length} color={color.includes('amber') ? 'orange' : color.includes('emerald') ? 'green' : 'red'} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading
                  ? <div className="flex items-center justify-center py-10 text-slate-400 text-sm">Loading…</div>
                  : data.length === 0
                    ? <div className="flex items-center justify-center py-10 text-slate-300 text-xs font-black uppercase tracking-widest">No records</div>
                    : <Table columns={requestCols(showActions)} data={data} pageSize={5} />
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Leave Balance Summary — {year}</h2>
              <Badge label={`${balances.length} EMPLOYEES`} variant="outline" color="blue" className="font-black text-[8px]" />
            </div>
            {loadingBal
              ? <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
              : balances.length === 0
                ? <div className="flex items-center justify-center py-16 text-slate-300 text-xs font-black uppercase tracking-widest">No balance data for {year}</div>
                : <Table columns={balanceCols} data={balances} pageSize={15} />
            }
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={applyModal} onClose={closeApplyModal} title="Submit Leave Request" size="lg">
        <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">

          {/* Employee */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee <span className="text-red-400">*</span></label>
            <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className={selectClass} required>
              <option value="">Select employee…</option>
              {empList.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.emp_id})</option>)}
            </select>
          </div>

          {/* Leave Type */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type <span className="text-red-400">*</span></label>
            <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} className={selectClass} required>
              <option value="">Select leave type…</option>
              {leaveTypes.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name}{t.annualEntitlementDays > 0 ? ` (${t.annualEntitlementDays}d/yr)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Live balance info */}
          {form.employeeId && form.leaveType && (
            <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm border ${
              loadingBalance
                ? 'bg-slate-50 border-slate-200 text-slate-400'
                : balanceInsufficient
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : liveBalance
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <HiInformationCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {loadingBalance ? (
                <span className="text-xs font-medium">Checking balance…</span>
              ) : liveBalance ? (
                <div className="text-xs font-medium">
                  <span className="font-black">{form.leaveType} balance: </span>
                  <span className={balanceInsufficient ? 'font-black text-red-700' : 'font-black text-emerald-700'}>
                    {balanceRemaining} day{balanceRemaining !== 1 ? 's' : ''} remaining
                  </span>
                  <span className="text-slate-500"> ({liveBalance.used} used / {liveBalance.total_allocated} allocated)</span>
                  {formDays > 0 && (
                    <span className={`ml-2 font-black ${balanceInsufficient ? 'text-red-600' : 'text-slate-600'}`}>
                      — Requesting {formDays}d
                      {balanceInsufficient ? ' ⚠ Insufficient' : ' ✓'}
                    </span>
                  )}
                </div>
              ) : selectedTypeCfg?.paidOrUnpaid === 'Unpaid' ? (
                <span className="text-xs font-medium">Unpaid leave — no balance required</span>
              ) : (
                <span className="text-xs font-medium">No balance record yet — will be seeded from entitlement on submit</span>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} className={selectClass} required />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.toDate} min={form.fromDate || undefined} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} className={selectClass} required />
            </div>
          </div>

          {/* Day count badge */}
          {formDays > 0 && (
            <div className="flex items-center gap-2 ml-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration:</span>
              <Badge label={`${formDays} day${formDays !== 1 ? 's' : ''}`} color={balanceInsufficient ? 'red' : 'blue'} variant="soft" className="font-black text-xs" />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason <span className="text-red-400">*</span></label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className={textareaClass} placeholder="Brief justification…" required />
          </div>

          {/* Handover */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Handover Note</label>
            <textarea value={form.handoverNote} onChange={e => setForm(f => ({ ...f, handoverNote: e.target.value }))} className={textareaClass} placeholder="Work handover details…" />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="submit" disabled={submitting || balanceInsufficient}
              className="flex-1 py-3 rounded-xl bg-[#0F766E] text-white text-sm font-black uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button type="button" onClick={closeApplyModal}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-black uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Leave Request Detail" size="md">
          <div className="space-y-4 pt-2">
            <div className="bg-[#0F766E] p-5 rounded-2xl text-white">
              <p className="text-lg font-black">{selected.employee_name}</p>
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mt-1">{selected.emp_id} · {selected.department}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Leave Type',  selected.leave_type],
                ['Status',      selected.status],
                ['From',        selected.from_date],
                ['To',          selected.to_date],
                ['Total Days',  `${selected.total_days} day(s)`],
                ['Approved By', selected.approved_by_name || '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-xs font-black text-slate-900">{val}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason</p>
              <p className="text-xs text-slate-700">{selected.reason}</p>
            </div>
            {selected.rejection_reason && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Rejection Reason</p>
                <p className="text-xs text-red-700">{selected.rejection_reason}</p>
              </div>
            )}
            {selected.status === 'Pending' && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button onClick={() => { setViewModal(false); openAction(selected, 'Approve') }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest">Approve</button>
                <button onClick={() => { setViewModal(false); openAction(selected, 'Reject') }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest">Reject</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Action Modal */}
      {selected && (
        <Modal isOpen={actionModal} onClose={() => { setActionModal(false); setActionReason('') }} title={`${actionType} Leave Request`} size="sm">
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              {actionType} leave request for <strong>{selected.employee_name}</strong>?
              <br /><span className="text-xs text-slate-400">{selected.leave_type} · {selected.from_date} → {selected.to_date} ({selected.total_days}d)</span>
            </p>
            {actionType === 'Reject' && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} className={textareaClass} placeholder="Reason for rejection…" />
              </div>
            )}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={handleProcess} disabled={submitting}
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
