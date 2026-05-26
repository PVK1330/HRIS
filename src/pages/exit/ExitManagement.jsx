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
  HiXMark,
  HiCalendarDays,
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
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ExitStatusStepper from '../../components/exit/ExitStatusStepper.jsx'
import ResignationModal from '../../components/exit/ResignationModal.jsx'
import TerminationModal from '../../components/exit/TerminationModal.jsx'
import {
  listExitRecords,
  getExitRecordStats,
  getExitRecord,
  getAuditLog,
  listTerminationTypesDropdown,
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
        size="xl"
        icon={HiEye}
      >
        {viewLoading ? (
          <div className="space-y-4 mt-4">
            <div className="h-16 bg-slate-100 animate-pulse rounded-none" />
            <div className="h-40 bg-slate-100 animate-pulse rounded-none" />
          </div>
        ) : viewRecord ? (
          <ViewModalContent
            record={viewRecord}
            auditLogs={viewAuditLogs}
            activeTab={viewTab}
            setActiveTab={setViewTab}
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
/*  View Modal Content — 6-tab read-only summary                       */
/* ------------------------------------------------------------------ */

function ViewModalContent({ record, auditLogs, activeTab, setActiveTab }) {
  const rank = VIEW_STATUS_RANK[record.status] ?? 0
  const days = daysUntil(record.last_working_day)

  return (
    <div className="space-y-4 mt-4">
      {/* Employee Header */}
      <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-none bg-slate-50/50">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#004CA5] to-[#0F766E] flex items-center justify-center text-white text-xl font-black shrink-0">
          {(record.employee_name || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-slate-900">{record.employee_name}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            {record.department && <span className="flex items-center gap-1"><HiBriefcase className="h-3.5 w-3.5" /> {record.department}</span>}
            {record.job_title && <span className="flex items-center gap-1"><HiMapPin className="h-3.5 w-3.5" /> {record.job_title}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge label={record.exit_type} color={TYPE_COLOR[record.exit_type] || 'gray'} />
          <Badge label={record.status} color={STATUS_COLOR[record.status] || 'gray'} />
        </div>
      </div>

      {/* 6-Tab Headers */}
      <div className="border border-slate-200 rounded-none overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {VIEW_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const isDone = rank > tab.rankIndex
            const isCurrent = rank === tab.rankIndex
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
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

        {/* Tab Content */}
        <div className="p-5">

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
                <ViewPending icon={HiClock} title="Awaiting Approval" desc="This exit request is pending manager/HR approval." />
              ) : (
                <div className="border border-emerald-200 bg-emerald-50 rounded-none p-4 flex items-center gap-3">
                  <HiCheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Approved</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {record.approved_by_name ? `By ${record.approved_by_name}` : 'Approved'}{record.approved_at ? ` on ${fmtDate(record.approved_at)}` : ''}
                    </p>
                  </div>
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
                  {(record.clearance_tasks || []).length > 0 ? (
                    <div className="space-y-2">
                      {(record.clearance_tasks || []).map((task) => (
                        <div key={task.id} className="flex items-center gap-3 px-3 py-2 border border-slate-100 rounded-none">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${task.is_completed ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            {task.is_completed && <HiCheck className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.task_name}</p>
                            <p className="text-[10px] text-slate-400">{task.department}</p>
                          </div>
                          <Badge label={task.is_completed ? 'Done' : 'Pending'} color={task.is_completed ? 'emerald' : 'orange'} />
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                        <span className="font-bold text-[#0F766E]">
                          {(record.clearance_tasks || []).filter((t) => t.is_completed).length}
                        </span>
                        <span>of {(record.clearance_tasks || []).length} tasks completed</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">No clearance tasks assigned yet.</p>
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
              ) : record.exit_interview ? (
                <div className="space-y-3">
                  <div className="border border-emerald-200 bg-emerald-50 rounded-none p-3 flex items-center gap-2">
                    <HiCheckCircle className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-800">Interview Completed</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ViewField label="Format" value={record.exit_interview.format || '—'} />
                    <ViewField label="Rating" value={record.exit_interview.overall_rating ? `${record.exit_interview.overall_rating}/5` : '—'} />
                    <ViewField label="Rehire Eligible" value={record.exit_interview.rehire_eligible || '—'} />
                    {record.exit_interview.conducted_by_full_name && (
                      <ViewField label="Conducted By" value={record.exit_interview.conducted_by_full_name} />
                    )}
                  </div>
                  {record.exit_interview.feedback && (
                    <div className="border border-slate-200 rounded-none p-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Feedback</span>
                      <p className="text-sm text-slate-700 mt-1">{record.exit_interview.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <ViewPending icon={HiChatBubbleLeftRight} title="Interview Pending" desc="Exit interview has not been submitted yet." />
              )}
            </div>
          )}

          {/* Settlement */}
          {activeTab === 'settlement' && (
            <div className="space-y-4">
              {rank < 4 ? (
                <ViewPending icon={HiBanknotes} title="Not Yet Started" desc="Settlement available after interview." />
              ) : record.final_settlement ? (
                <div className="space-y-3">
                  <div className="border border-emerald-200 bg-emerald-50 rounded-none p-3 flex items-center gap-2">
                    <HiCheckCircle className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-800">Settlement Processed</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ViewField label="Unpaid Salary" value={`£${Number(record.final_settlement.unpaid_salary || 0).toFixed(2)}`} />
                    <ViewField label="Leave Encashment" value={`£${Number(record.final_settlement.leave_encashment || 0).toFixed(2)}`} />
                    <ViewField label="Gratuity" value={`£${Number(record.final_settlement.gratuity || 0).toFixed(2)}`} />
                    <ViewField label="Deductions" value={`£${Number(record.final_settlement.deductions || 0).toFixed(2)}`} />
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Net Payable</span>
                    <span className="text-xl font-black text-[#0F766E]">£{Number(record.final_settlement.net_payable || 0).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <ViewPending icon={HiBanknotes} title="Settlement Pending" desc="Final settlement has not been processed yet." />
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
                  {(record.exit_documents || []).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Documents Generated</span>
                      {(record.exit_documents || []).map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 px-3 py-2 border border-slate-100 rounded-none">
                          <HiDocumentText className="h-4 w-4 text-[#0F766E]" />
                          <span className="text-sm font-medium text-slate-700">{doc.document_title || doc.document_type}</span>
                          <Badge label="Generated" color="emerald" />
                        </div>
                      ))}
                    </div>
                  )}
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

function ViewPending({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
        <Icon className="h-6 w-6 text-slate-300" />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
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
