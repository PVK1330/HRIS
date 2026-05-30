import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  HiUserMinus,
  HiClock,
  HiClipboardDocumentCheck,
  HiCheckBadge,
  HiMagnifyingGlass,
  HiEye,
  HiPlus,
  HiArrowDownTray,
  HiChevronDown,
  HiBriefcase,
  HiMapPin,
  HiDocumentText,
  HiHandThumbUp,
  HiChatBubbleLeftRight,
  HiBanknotes,
  HiArrowRightOnRectangle,
  HiCheckCircle,
  HiCheck,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ResignationModal from '../../components/exit/ResignationModal.jsx'
import TerminationModal from '../../components/exit/TerminationModal.jsx'
import ClearanceChecklist from '../../components/exit/ClearanceChecklist.jsx'
import ExitInterviewForm from '../../components/exit/ExitInterviewForm.jsx'
import SettlementForm from '../../components/exit/SettlementForm.jsx'
import ExitDocuments from '../../components/exit/ExitDocuments.jsx'
import {
  listExitRecords,
  getExitRecordStats,
  getExitRecord,
  getAuditLog,
  listTerminationTypesDropdown,
  approveResignation,
  rejectResignation,
  updateExitStatus,
  updateClearanceTask,
  approveResignationWithdrawal,
  rejectResignationWithdrawal,
} from '../../services/exitManagementService.js'
import { listEmployeesDropdown } from '../../services/employeeService.js'

const STATUS_COLOR = {
  'Pending Approval': 'orange',
  Approved: 'green',
  Rejected: 'red',
  'In Progress': 'blue',
  clearance: 'blue',
  interview: 'purple',
  settlement: 'indigo',
  Completed: 'emerald',
}

const TYPE_COLOR = { Resignation: 'purple', Termination: 'red' }

const VIEW_STATUS_RANK = {
  'Pending Approval': 0,
  Rejected: -1,
  Approved: 1,
  clearance: 2,
  'In Progress': 2,
  interview: 3,
  settlement: 4,
  Completed: 5,
}

const VIEW_TABS = [
  { key: 'submitted', label: 'Submitted', icon: HiDocumentText, rankIndex: 0 },
  { key: 'approved', label: 'Approved', icon: HiHandThumbUp, rankIndex: 1 },
  { key: 'clearance', label: 'Clearance', icon: HiClipboardDocumentCheck, rankIndex: 2 },
  { key: 'interview', label: 'Interview', icon: HiChatBubbleLeftRight, rankIndex: 3 },
  { key: 'settlement', label: 'Settlement', icon: HiBanknotes, rankIndex: 4 },
  { key: 'exited', label: 'Exited', icon: HiArrowRightOnRectangle, rankIndex: 5 },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(d) {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}

function downloadCSV(records) {
  const header = 'Employee,Exit Type,Last Working Day,Status,Notice Period,Reason\n'
  const rows = records
    .map((r) =>
      [
        `"${r.employee_name || ''}"`,
        r.exit_type,
        fmtDate(r.last_working_day),
        r.status,
        r.notice_period_days || 0,
        `"${(r.exit_reason || '').replace(/"/g, '""')}"`,
      ].join(','),
    )
    .join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `exit-records-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const HR_ROLES = ['admin', 'hr_admin', 'hr_manager', 'manager']

export default function ExitManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!HR_ROLES.includes(user?.role)) {
    return <Navigate to="/admin/my-exit" replace />
  }

  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [employees, setEmployees] = useState([])
  const [terminationTypes, setTerminationTypes] = useState([])
  const [showResignModal, setShowResignModal] = useState(false)
  const [showTermModal, setShowTermModal] = useState(false)

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewTab, setViewTab] = useState('submitted')
  const [viewAuditLogs, setViewAuditLogs] = useState([])

  const [exportOpen, setExportOpen] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const s = await getExitRecordStats()
      setStats(s || {})
    } catch { /* silent */ }
  }, [])

  const fetchRecords = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const params = { page, limit: 10, search }
        if (typeFilter) params.exit_type = typeFilter
        if (statusFilter) params.status = statusFilter

        const res = await listExitRecords(params)
        setRecords(res?.records || [])
        setPagination(res?.pagination || { page: 1, totalPages: 1, total: 0 })
      } catch {
        toast.error('Failed to load exit records')
      } finally {
        setLoading(false)
      }
    },
    [search, statusFilter, typeFilter],
  )

  useEffect(() => {
    fetchStats()
    listEmployeesDropdown({ status: 'Active' })
      .then((r) => setEmployees(r?.employees || r || []))
      .catch(() => {})
    listTerminationTypesDropdown()
      .then((r) => setTerminationTypes(r || []))
      .catch(() => {})
  }, [fetchStats])

  useEffect(() => {
    fetchRecords(1)
  }, [fetchRecords])

  const handleSuccess = () => {
    fetchRecords(pagination.page)
    fetchStats()
  }

  const refreshViewRecord = async (exitId) => {
    try {
      const full = await getExitRecord(exitId)
      setViewRecord(full)
      try {
        const logs = await getAuditLog(exitId)
        setViewAuditLogs(logs || [])
      } catch { /* silent */ }
    } catch { /* silent */ }
  }

  const handleModalActionSuccess = () => {
    if (viewRecord) {
      refreshViewRecord(viewRecord.id)
    }
    handleSuccess()
  }

  const handleApprove = async () => {
    if (!viewRecord) return
    const result = await Swal.fire({
      title: 'Approve Resignation?',
      text: 'The employee will move to notice period and clearance tasks will be seeded.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, approve',
    })
    if (!result.isConfirmed) return
    try {
      await approveResignation(viewRecord.id)
      toast.success('Resignation approved successfully')
      handleModalActionSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve resignation')
    }
  }

  const handleReject = async () => {
    if (!viewRecord) return
    const { value: reason } = await Swal.fire({
      title: 'Reject Resignation',
      input: 'textarea',
      inputLabel: 'Rejection reason',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Reject',
      inputValidator: (v) => (!v && 'Reason is required'),
    })
    if (!reason) return
    try {
      await rejectResignation(viewRecord.id, { rejection_reason: reason })
      toast.success('Resignation rejected')
      handleModalActionSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject resignation')
    }
  }

  const handleApproveWithdrawal = async () => {
    if (!viewRecord) return
    const result = await Swal.fire({
      title: 'Approve Withdrawal?',
      text: 'The employee will return to Active status and the offboarding will be canceled.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, approve withdrawal',
    })
    if (!result.isConfirmed) return
    try {
      await approveResignationWithdrawal(viewRecord.id)
      toast.success('Resignation withdrawal approved. Employee is now active.')
      setViewModalOpen(false)
      setViewRecord(null)
      handleSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve withdrawal')
    }
  }

  const handleRejectWithdrawal = async () => {
    if (!viewRecord) return
    const { value: reason } = await Swal.fire({
      title: 'Reject Withdrawal Request?',
      input: 'textarea',
      inputLabel: 'Reason for rejecting withdrawal',
      inputPlaceholder: 'Provide a reason...',
      inputValidator: (v) => (!v?.trim() ? 'Reason is required' : undefined),
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      confirmButtonText: 'Reject request',
    })
    if (!reason) return
    try {
      await rejectResignationWithdrawal(viewRecord.id, { rejection_reason: reason })
      toast.success('Resignation withdrawal rejected')
      handleModalActionSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject withdrawal')
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!viewRecord) return
    try {
      await updateExitStatus(viewRecord.id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      handleModalActionSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleTaskToggle = async (taskId, payload) => {
    if (!viewRecord) return
    try {
      await updateClearanceTask(viewRecord.id, taskId, payload)
      toast.success('Clearance task updated')
      handleModalActionSuccess()
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const handleView = async (rec) => {
    setViewModalOpen(true)
    setViewLoading(true)
    setViewAuditLogs([])
    try {
      const full = await getExitRecord(rec.id)
      setViewRecord(full)
      const r = VIEW_STATUS_RANK[full.status] ?? 0
      if (r === -1) {
        setViewTab('submitted')
      } else {
        const match = VIEW_TABS.find((t) => t.rankIndex === r)
        setViewTab(match ? match.key : 'submitted')
      }
      try {
        const logs = await getAuditLog(rec.id)
        setViewAuditLogs(logs || [])
      } catch { /* silent */ }
    } catch {
      setViewRecord(rec)
      setViewTab('submitted')
    } finally {
      setViewLoading(false)
    }
  }

  const statCards = [
    { label: 'TOTAL EXITS', value: stats.total || 0, icon: HiUserMinus, bgColor: 'bg-[#0F172A]', filterFn: () => { setStatusFilter(''); setTypeFilter('') } },
    { label: 'PENDING', value: stats.pendingApproval || 0, icon: HiClock, bgColor: 'bg-[#F59E0B]', filterFn: () => { setStatusFilter('Pending Approval'); setTypeFilter('') } },
    { label: 'IN CLEARANCE', value: stats.inClearance || 0, icon: HiClipboardDocumentCheck, bgColor: 'bg-[#3B82F6]', filterFn: () => { setStatusFilter('clearance'); setTypeFilter('') } },
    { label: 'COMPLETED', value: stats.completed || 0, icon: HiCheckBadge, bgColor: 'bg-[#10B981]', filterFn: () => { setStatusFilter('Completed'); setTypeFilter('') } },
  ]

  const isActiveCard = (card) => {
    if (card.label === 'TOTAL EXITS' && !statusFilter && !typeFilter) return true
    if (card.label === 'PENDING' && statusFilter === 'Pending Approval') return true
    if (card.label === 'IN CLEARANCE' && statusFilter === 'clearance') return true
    if (card.label === 'COMPLETED' && statusFilter === 'Completed') return true
    return false
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Exit Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>HR</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Exit Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              disabled={records.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
            >
              <HiArrowDownTray className="h-4 w-4" />
              Export
              <HiChevronDown className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-none border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { downloadCSV(records); setExportOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <HiArrowDownTray className="h-4 w-4 text-slate-500" />
                  Export as CSV
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowResignModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 shadow-sm"
          >
            <HiPlus className="h-4 w-4" />
            Resignation
          </button>
          <button
            type="button"
            onClick={() => setShowTermModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
          >
            <HiPlus className="h-4 w-4" />
            Termination
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {statCards.map((card) => {
          const active = isActiveCard(card)
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.filterFn}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                active
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${active ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.value}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        {/* Teal Header Bar */}
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Exit Records</h2>
          <span className="text-xs font-medium text-white/70">{pagination.total} total records</span>
        </div>

        {/* Filters */}
        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="">All Exit Types</option>
              <option value="Resignation">Resignation</option>
              <option value="Termination">Termination</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="clearance">In Clearance</option>
              <option value="interview">Interview</option>
              <option value="settlement">Settlement</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter('') }}
                className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Employee</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Exit Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Last Working Day</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Days Left</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Notice</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse shrink-0" /><div className="space-y-1.5"><div className="h-3.5 bg-slate-100 animate-pulse rounded w-28" /><div className="h-2.5 bg-slate-100 animate-pulse rounded w-16" /></div></div></td>
                    <td className="px-4 py-4"><div className="h-5 bg-slate-100 animate-pulse rounded w-20" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-24" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-12" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-12" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-slate-100 animate-pulse rounded w-24" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-slate-100 animate-pulse rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <HiUserMinus className="h-7 w-7 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">No exit records found</p>
                        <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filters or search criteria</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const days = daysUntil(rec.last_working_day)
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/exit-management/${rec.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(rec.employee_name || 'U')[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-slate-900">{rec.employee_name}</div>
                            <div className="truncate text-xs text-slate-500">{rec.department || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={rec.exit_type} color={TYPE_COLOR[rec.exit_type] || 'gray'} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{fmtDate(rec.last_working_day)}</td>
                      <td className="px-4 py-3">
                        {days != null ? (
                          <span className={`text-sm font-bold ${days < 0 ? 'text-slate-400' : days < 7 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {days < 0 ? 'Past' : `${days}d`}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{rec.notice_period_days || 0}d</td>
                      <td className="px-4 py-3">
                        <Badge label={rec.status} color={STATUS_COLOR[rec.status] || 'gray'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleView(rec) }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-blue-500 text-white transition-colors hover:bg-blue-600"
                            title="View stepper"
                          >
                            <HiEye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs font-medium text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => fetchRecords(pageNum)}
                    className={`h-8 w-8 flex items-center justify-center text-xs font-bold rounded-none transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-[#0F766E] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* View Modal — 6 Tabs */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setViewRecord(null); setViewAuditLogs([]) }}
        title={viewRecord?.employee_name || 'Exit Details'}
        description="Exit process status and details"
        size="exit"
        icon={HiEye}
      >
        {viewLoading ? (
          <div className="space-y-3 mt-2">
            <div className="h-12 bg-slate-100 animate-pulse rounded-none" />
            <div className="h-32 bg-slate-100 animate-pulse rounded-none" />
          </div>
        ) : viewRecord ? (
          <ViewModalContent
            record={viewRecord}
            auditLogs={viewAuditLogs}
            activeTab={viewTab}
            setActiveTab={setViewTab}
            onApprove={handleApprove}
            onReject={handleReject}
            onApproveWithdrawal={handleApproveWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            onStatusChange={handleStatusChange}
            onTaskToggle={handleTaskToggle}
            onSuccess={handleModalActionSuccess}
          />
        ) : null}
      </Modal>

      {/* Modals */}
      <ResignationModal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        onSuccess={() => { setShowResignModal(false); handleSuccess() }}
        employees={employees}
      />
      <TerminationModal
        isOpen={showTermModal}
        onClose={() => setShowTermModal(false)}
        onSuccess={() => { setShowTermModal(false); handleSuccess() }}
        employees={employees}
        terminationTypes={terminationTypes}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  View Modal Content — 6-tab dynamic summary                          */
/* ------------------------------------------------------------------ */

function ViewModalContent({
  record,
  auditLogs,
  activeTab,
  setActiveTab,
  onApprove,
  onReject,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onStatusChange,
  onTaskToggle,
  onSuccess,
}) {
  const rank = VIEW_STATUS_RANK[record.status] ?? 0
  const days = daysUntil(record.last_working_day)
  const navigate = useNavigate()

  return (
    <div className="space-y-3 mt-2">
      {/* Employee Header */}
      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-none bg-slate-50/50 flex-wrap sm:flex-nowrap">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#004CA5] to-[#0F766E] flex items-center justify-center text-white text-base font-black shrink-0">
          {(record.employee_name || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-900">{record.employee_name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
            {record.department && <span className="flex items-center gap-1"><HiBriefcase className="h-3 w-3" /> {record.department}</span>}
            {record.job_title && <span className="flex items-center gap-1"><HiMapPin className="h-3 w-3" /> {record.job_title}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge label={record.exit_type} color={TYPE_COLOR[record.exit_type] || 'gray'} />
          <Badge label={record.status} color={STATUS_COLOR[record.status] || 'gray'} />
          <button
            type="button"
            onClick={() => navigate(`/admin/exit-management/${record.id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#0F766E] hover:bg-[#0c6b64] transition-colors"
          >
            Manage Detailed Page
          </button>
        </div>
      </div>

      {/* Resignation Withdrawal Request Panel */}
      {record.is_withdrawal_requested && (
        <div className="border border-teal-200 bg-teal-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <HiClock className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-teal-900">Resignation Withdrawal Request Pending</h4>
              {record.withdrawal_reason && (
                <div className="mt-1 text-[11px] italic text-teal-800 bg-white/60 p-2 border border-teal-100 font-medium">
                  &ldquo;{record.withdrawal_reason}&rdquo;
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onApproveWithdrawal}
              className="h-8 px-4 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all"
            >
              Approve Withdrawal
            </button>
            <button
              onClick={onRejectWithdrawal}
              className="h-8 px-4 rounded-none bg-red-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all"
            >
              Reject Request
            </button>
          </div>
        </div>
      )}

      {/* 6-Tab Headers */}
      <div className="border border-slate-200 rounded-none flex flex-col min-h-0 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto shrink-0 custom-scrollbar">
          {VIEW_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const isDone = rank > tab.rankIndex
            const isCurrent = rank === tab.rankIndex
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {isDone ? (
                  <HiCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <tab.icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0F766E]' : isCurrent ? 'text-slate-600' : 'text-slate-300'}`} />
                )}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content — scrollable */}
        <div className="p-4 overflow-y-auto overscroll-contain max-h-[min(50vh,420px)] min-h-0 custom-scrollbar">

          {/* Submitted */}
          {activeTab === 'submitted' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ViewField label="Exit Type" value={record.exit_type} />
                <ViewField label="Voluntary" value={record.is_voluntary ? 'Yes' : 'No'} />
                <ViewField label="Last Working Day" value={fmtDate(record.last_working_day)} />
                <ViewField label="Days Remaining" value={days != null ? `${days} days` : '—'} valueClass={days != null && days < 7 ? 'text-red-600' : ''} />
                <ViewField label="Notice Period" value={`${record.notice_period_days || 0} days`} />
                <ViewField label="Reason" value={record.exit_reason || '—'} />
                <ViewField label="Created" value={fmtDate(record.created_at)} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RTW Status</span>
                  <div className="mt-1"><Badge label={record.rtw_status || 'Valid'} color={record.rtw_status === 'invalid' ? 'red' : 'green'} /></div>
                </div>
              </div>
              {record.reason_detail && (
                <div className="border border-slate-200 rounded-none p-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason Detail</span>
                  <p className="text-sm text-slate-700 mt-1">{record.reason_detail}</p>
                </div>
              )}
              {record.status === 'Rejected' && record.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-none p-3">
                  <p className="text-sm font-bold text-red-700">Rejection Reason</p>
                  <p className="text-sm text-red-600 mt-1">{record.rejection_reason}</p>
                </div>
              )}
              <ViewAuditMini logs={auditLogs} />
            </div>
          )}

          {/* Approved */}
          {activeTab === 'approved' && (
            <div className="space-y-4">
              {rank < 1 ? (
                <ViewPending icon={HiClock} title="Awaiting Approval" desc="This exit request is pending manager/HR approval.">
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={onApprove}
                      className="inline-flex items-center justify-center rounded-none bg-[#0F766E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0c6b64] transition-all"
                    >
                      Approve Resignation
                    </button>
                    <button
                      onClick={onReject}
                      className="inline-flex items-center justify-center rounded-none bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </ViewPending>
              ) : (
                <div className="space-y-4">
                  <div className="border border-emerald-200 bg-emerald-50 rounded-none p-4 flex items-center gap-3">
                    <HiCheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Approved</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {record.approved_by_name ? `By ${record.approved_by_name}` : 'Approved'}{record.approved_at ? ` on ${fmtDate(record.approved_at)}` : ''}
                      </p>
                    </div>
                  </div>
                  {(record.status === 'Approved' || record.status === 'In Progress') && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onStatusChange('clearance')}
                        className="inline-flex items-center justify-center rounded-none bg-[#0F766E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0c6b64] transition-all"
                      >
                        Start Offboarding (Move to Clearance)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clearance */}
          {activeTab === 'clearance' && (
            <div className="space-y-4">
              {rank < 2 ? (
                <ViewPending icon={HiClipboardDocumentCheck} title="Not Yet Started" desc="Clearance tasks will be available after approval." />
              ) : (
                <>
                  <ClearanceChecklist
                    exitRequestId={record.id}
                    tasks={record.clearance_tasks || []}
                    onTaskUpdate={onTaskToggle}
                    roleCanEdit={true}
                    currentUserRole="hr"
                  />
                  {(record.status === 'clearance' || record.status === 'In Progress') && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => onStatusChange('interview')}
                        className="inline-flex items-center justify-center rounded-none bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition-all"
                      >
                        Move to Exit Interview
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Interview */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              {rank < 3 ? (
                <ViewPending icon={HiChatBubbleLeftRight} title="Not Yet Started" desc="Exit interview available after clearance." />
              ) : (
                <>
                  <ExitInterviewForm
                    exitRequestId={record.id}
                    existingInterview={record.exit_interview || null}
                    onSubmitted={onSuccess}
                  />
                  {record.status === 'interview' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => onStatusChange('settlement')}
                        className="inline-flex items-center justify-center rounded-none bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 transition-all"
                      >
                        Move to Settlement
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Settlement */}
          {activeTab === 'settlement' && (
            <div className="space-y-4">
              {rank < 4 ? (
                <ViewPending icon={HiBanknotes} title="Not Yet Started" desc="Settlement available after interview." />
              ) : (
                <>
                  <SettlementForm
                    exitRequestId={record.id}
                    existingSettlement={record.final_settlement || null}
                    onSubmitted={onSuccess}
                    employeeTenure={0}
                  />
                  {record.status === 'settlement' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => onStatusChange('Completed')}
                        className="inline-flex items-center justify-center rounded-none bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition-all"
                      >
                        Mark Process Completed
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Exited */}
          {activeTab === 'exited' && (
            <div className="space-y-4">
              {rank < 5 ? (
                <ViewPending icon={HiArrowRightOnRectangle} title="Not Yet Completed" desc="Complete all prior steps first." />
              ) : (
                <>
                  <div className="border border-emerald-200 bg-emerald-50 rounded-none p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <HiCheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-black text-emerald-800">Employee Exited</p>
                      <p className="text-xs text-emerald-600 mt-0.5">{record.employee_name} has been officially off-boarded.</p>
                    </div>
                  </div>
                  <ExitDocuments
                    exitRequestId={record.id}
                    exitType={(record.exit_type || '').toLowerCase()}
                    documents={record.exit_documents || []}
                    onGenerated={onSuccess}
                    canGenerate={true}
                  />
                  <ViewAuditMini logs={auditLogs} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function ViewField({ label, value, valueClass = '' }) {
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <p className={`font-bold text-slate-900 mt-1 ${valueClass}`}>{value}</p>
    </div>
  )
}

function ViewPending({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
        <Icon className="h-6 w-6 text-slate-300" />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5 mb-3">{desc}</p>
      {children}
    </div>
  )
}

function ViewAuditMini({ logs }) {
  if (!logs || logs.length === 0) return null
  return (
    <div className="border-t border-slate-100 pt-3 mt-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Activity</span>
      <div className="mt-2 space-y-2">
        {logs.slice(0, 3).map((log) => (
          <div key={log.id} className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700">
                {(log.action || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              <p className="text-[10px] text-slate-400">
                {log.performed_by_name || 'System'} &middot; {fmtDate(log.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
