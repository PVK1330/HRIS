import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HiUserMinus,
  HiClipboardDocumentCheck,
  HiShieldCheck,
  HiClock,
  HiMagnifyingGlass,
  HiCheckBadge,
  HiXCircle,
  HiUserGroup,
  HiPlus,
  HiEye,
  HiArrowPathRoundedSquare,
  HiCurrencyDollar,
  HiDocumentText,
  HiChatBubbleLeftRight,
  HiChevronDown,
  HiPencil,
  HiTrash,
  HiArrowDownTray,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { listEmployeesDropdown } from '../../../services/employeeService.js'
import {
  listExitRecords,
  getExitRecordStats,
  getExitRecord,
  createResignation,
  createTermination,
  approveResignation,
  rejectResignation,
  updateExitStatus,
  listClearanceTasks,
  addClearanceTask,
  updateClearanceTask,
  listAssetReturns,
  addAssetReturn,
  updateAssetReturn,
  listExitDocuments,
  generateExitDocument,
  listTerminationTypesDropdown,
} from '../../../services/exitManagementService.js'

const STATUS_COLORS = {
  'Pending Approval': 'orange',
  Approved: 'blue',
  'In Progress': 'blue',
  Completed: 'green',
  Rejected: 'red',
}

const ASSET_STATUS_COLORS = {
  Pending: 'orange',
  Returned: 'green',
  Lost: 'red',
  Damaged: 'orange',
}

function fmtDate(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#0F766E]/10 text-[#0F766E]">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F766E]" />
    </div>
  )
}

export default function ExitManagement() {
  const [q, setQ] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({ total: 0, pendingApproval: 0, inProgress: 0, completed: 0, rejected: 0 })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [resignationModalOpen, setResignationModalOpen] = useState(false)
  const [terminationModalOpen, setTerminationModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Summary')

  const [selectedExit, setSelectedExit] = useState(null)
  const [exitDetails, setExitDetails] = useState(null)
  const [clearanceTasks, setClearanceTasks] = useState([])
  const [assetReturns, setAssetReturns] = useState([])
  const [exitDocuments, setExitDocuments] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  const [employees, setEmployees] = useState([])
  const [terminationTypes, setTerminationTypes] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Resignation form
  const [resForm, setResForm] = useState({ employee_id: '', notice_date: '', resignation_date: '', last_working_day: '', notice_period_days: 30, exit_reason: '' })
  // Termination form
  const [termForm, setTermForm] = useState({ employee_id: '', termination_type_id: '', notice_date: '', resignation_date: '', last_working_day: '', exit_reason: '' })

  // Add asset return form
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [assetForm, setAssetForm] = useState({ asset_name: '', asset_code: '', asset_type: '', notes: '' })

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, search: q }
      if (activeStatus !== 'All') params.status = activeStatus
      const result = await listExitRecords(params)
      setRecords(result?.records || [])
      setTotalPages(result?.pagination?.totalPages || 1)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }, [page, q, activeStatus])

  const fetchStats = useCallback(async () => {
    try {
      const s = await getExitRecordStats()
      setStats(s || { total: 0, pendingApproval: 0, inProgress: 0, completed: 0, rejected: 0 })
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])
  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    listEmployeesDropdown({ status: 'Active' }).then((r) => setEmployees(r?.employees || r || [])).catch(() => {})
    listTerminationTypesDropdown().then((r) => setTerminationTypes(r || [])).catch(() => {})
  }, [])

  const loadExitDetails = useCallback(async (id) => {
    setDetailLoading(true)
    try {
      const [detail, tasks, assets, docs] = await Promise.all([
        getExitRecord(id),
        listClearanceTasks(id).catch(() => []),
        listAssetReturns(id).catch(() => []),
        listExitDocuments(id).catch(() => []),
      ])
      setExitDetails(detail)
      setClearanceTasks(Array.isArray(tasks) ? tasks : tasks?.tasks || [])
      setAssetReturns(Array.isArray(assets) ? assets : assets?.assets || [])
      setExitDocuments(Array.isArray(docs) ? docs : docs?.documents || [])
    } catch (err) {
      toast.error('Failed to load exit details')
    }
    setDetailLoading(false)
  }, [])

  const openReview = useCallback((row) => {
    setSelectedExit(row)
    setExitDetails(null)
    setClearanceTasks([])
    setAssetReturns([])
    setExitDocuments([])
    setActiveTab('Summary')
    setReviewModalOpen(true)
    loadExitDetails(row.id)
  }, [loadExitDetails])

  // Submit resignation
  const handleResignation = async (e) => {
    e.preventDefault()
    if (!resForm.employee_id) return toast.error('Select an employee')
    if (!resForm.last_working_day) return toast.error('Last working day is required')
    setSubmitting(true)
    try {
      await createResignation(resForm)
      toast.success('Resignation submitted successfully')
      setResignationModalOpen(false)
      setResForm({ employee_id: '', notice_date: '', resignation_date: '', last_working_day: '', notice_period_days: 30, exit_reason: '' })
      fetchRecords()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resignation')
    }
    setSubmitting(false)
  }

  // Submit termination
  const handleTermination = async (e) => {
    e.preventDefault()
    if (!termForm.employee_id) return toast.error('Select an employee')
    if (!termForm.termination_type_id) return toast.error('Select termination type')
    if (!termForm.last_working_day) return toast.error('Last working day is required')
    setSubmitting(true)
    try {
      await createTermination(termForm)
      toast.success('Termination record created')
      setTerminationModalOpen(false)
      setTermForm({ employee_id: '', termination_type_id: '', notice_date: '', resignation_date: '', last_working_day: '', exit_reason: '' })
      fetchRecords()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create termination')
    }
    setSubmitting(false)
  }

  // Approve/Reject resignation
  const handleApprove = async () => {
    if (!exitDetails) return
    const result = await Swal.fire({ title: 'Approve Resignation?', text: 'This will move the employee to notice period and seed clearance tasks.', icon: 'question', showCancelButton: true, confirmButtonColor: '#0F766E', confirmButtonText: 'Approve' })
    if (!result.isConfirmed) return
    try {
      await approveResignation(exitDetails.id)
      toast.success('Resignation approved')
      loadExitDetails(exitDetails.id)
      fetchRecords()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    if (!exitDetails) return
    const { value: reason } = await Swal.fire({ title: 'Reject Resignation', input: 'textarea', inputLabel: 'Rejection reason', inputPlaceholder: 'Enter reason...', showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'Reject', inputValidator: (v) => (!v && 'Reason is required') })
    if (!reason) return
    try {
      await rejectResignation(exitDetails.id, { rejection_reason: reason })
      toast.success('Resignation rejected')
      loadExitDetails(exitDetails.id)
      fetchRecords()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    }
  }

  // Move status forward
  const handleStatusUpdate = async (newStatus) => {
    if (!exitDetails) return
    try {
      await updateExitStatus(exitDetails.id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      loadExitDetails(exitDetails.id)
      fetchRecords()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  // Toggle clearance task
  const handleToggleClearance = async (task) => {
    try {
      await updateClearanceTask(exitDetails.id, task.id, { is_completed: !task.is_completed })
      const updated = clearanceTasks.map((t) => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t)
      setClearanceTasks(updated)
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  // Add asset return
  const handleAddAsset = async (e) => {
    e.preventDefault()
    if (!assetForm.asset_name) return toast.error('Asset name is required')
    try {
      await addAssetReturn(exitDetails.id, assetForm)
      toast.success('Asset added')
      setAddAssetOpen(false)
      setAssetForm({ asset_name: '', asset_code: '', asset_type: '', notes: '' })
      const assets = await listAssetReturns(exitDetails.id)
      setAssetReturns(Array.isArray(assets) ? assets : assets?.assets || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add asset')
    }
  }

  // Update asset return status
  const handleAssetStatusChange = async (asset, status) => {
    try {
      await updateAssetReturn(exitDetails.id, asset.id, { status, return_date: status === 'Returned' ? new Date().toISOString().slice(0, 10) : null })
      const updated = assetReturns.map((a) => a.id === asset.id ? { ...a, status } : a)
      setAssetReturns(updated)
    } catch {
      toast.error('Failed to update asset')
    }
  }

  // Generate exit document
  const handleGenerateDoc = async (docType) => {
    try {
      await generateExitDocument(exitDetails.id, { document_type: docType })
      toast.success(`${docType} generated`)
      const docs = await listExitDocuments(exitDetails.id)
      setExitDocuments(Array.isArray(docs) ? docs : docs?.documents || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate document')
    }
  }

  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] text-sm font-bold shadow-sm">
            {(row.employee_name || 'E').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.employee_name || '—'}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.department || '—'}</div>
          </div>
        </div>
      ),
    },
    { key: 'exit_type', label: 'Exit Type' },
    {
      key: 'last_working_day',
      label: 'Last Working Day',
      render: (v) => <span className="text-xs font-medium">{fmtDate(v)}</span>,
    },
    {
      key: 'notice_date',
      label: 'Notice Date',
      render: (v) => <span className="text-xs font-medium">{fmtDate(v)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v || '—'} color={STATUS_COLORS[v] || 'gray'} variant="outline" />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <button
          onClick={() => openReview(row)}
          className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-slate-300 transition-all shadow-sm"
          title="View Details"
        >
          <HiEye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  const tabs = [
    { id: 'Summary', icon: HiClipboardDocumentCheck },
    { id: 'Clearance', icon: HiShieldCheck },
    { id: 'Asset Return', icon: HiArrowPathRoundedSquare },
    { id: 'Documents', icon: HiDocumentText },
  ]

  const statusCards = [
    { id: 'All', label: 'TOTAL EXITS', count: stats.total, icon: HiUserGroup, bgColor: 'bg-slate-900' },
    { id: 'Pending Approval', label: 'PENDING APPROVAL', count: stats.pendingApproval, icon: HiClock, bgColor: 'bg-[#F59E0B]' },
    { id: 'In Progress', label: 'IN PROGRESS', count: stats.inProgress, icon: HiArrowPathRoundedSquare, bgColor: 'bg-[#3B82F6]' },
    { id: 'Completed', label: 'COMPLETED', count: stats.completed, icon: HiCheckBadge, bgColor: 'bg-[#10B981]' },
    { id: 'Rejected', label: 'REJECTED', count: stats.rejected, icon: HiXCircle, bgColor: 'bg-[#EF4444]' },
  ]

  const clearanceProgress = useMemo(() => {
    if (!clearanceTasks.length) return { done: 0, total: 0, pct: 0 }
    const done = clearanceTasks.filter((t) => t.is_completed).length
    return { done, total: clearanceTasks.length, pct: Math.round((done / clearanceTasks.length) * 100) }
  }, [clearanceTasks])

  const groupedClearance = useMemo(() => {
    const map = {}
    for (const t of clearanceTasks) {
      const dept = t.department || 'General'
      if (!map[dept]) map[dept] = []
      map[dept].push(t)
    }
    return map
  }, [clearanceTasks])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Exit Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Human Capital</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600 uppercase font-black tracking-widest text-[10px]">Resignation & Termination</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setResForm({ employee_id: '', notice_date: '', resignation_date: '', last_working_day: '', notice_period_days: 30, exit_reason: '' }); setResignationModalOpen(true) }}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
          >
            <HiPlus className="h-4 w-4" /> Add Resignation
          </button>
          <button
            onClick={() => { setTermForm({ employee_id: '', termination_type_id: '', notice_date: '', resignation_date: '', last_working_day: '', exit_reason: '' }); setTerminationModalOpen(true) }}
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-none bg-red-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-700 shadow-lg shadow-red-900/10"
          >
            <HiPlus className="h-4 w-4" /> Add Termination
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 min-w-0">
        {statusCards.map((card, idx) => {
          const isActive = activeStatus === card.id
          return (
            <button
              key={idx}
              onClick={() => { setActiveStatus(card.id); setPage(1) }}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActive ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-black uppercase tracking-widest truncate leading-none ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Registry table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm min-w-0">
        <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
          <h2 className="text-sm font-semibold uppercase tracking-wider truncate">Exit Registry</h2>
          <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] shrink-0">{records.length} records</div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              placeholder="Search by name..."
              className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            {(q || activeStatus !== 'All') && (
              <button
                type="button"
                onClick={() => { setQ(''); setActiveStatus('All'); setPage(1) }}
                className="h-10 px-4 rounded-none border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {loading ? <Spinner /> : <Table columns={columns} data={records} pageSize={15} className="rounded-none" />}
      </div>

      {/* ===== RESIGNATION MODAL ===== */}
      <Modal isOpen={resignationModalOpen} onClose={() => setResignationModalOpen(false)} title="Add Resignation" size="lg">
        <form onSubmit={handleResignation} className="space-y-5 p-1">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Resigning Employee</label>
            <select
              value={resForm.employee_id}
              onChange={(e) => setResForm({ ...resForm, employee_id: e.target.value })}
              className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none"
            >
              <option value="">Select</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name} {emp.emp_id ? `(${emp.emp_id})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notice Date</label>
            <input type="date" value={resForm.notice_date} onChange={(e) => setResForm({ ...resForm, notice_date: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Resignation Date</label>
            <input type="date" value={resForm.resignation_date} onChange={(e) => setResForm({ ...resForm, resignation_date: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Last Working Day *</label>
              <input type="date" value={resForm.last_working_day} onChange={(e) => setResForm({ ...resForm, last_working_day: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notice Period (Days)</label>
              <input type="number" value={resForm.notice_period_days} onChange={(e) => setResForm({ ...resForm, notice_period_days: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" min={0} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Reason</label>
            <textarea value={resForm.exit_reason} onChange={(e) => setResForm({ ...resForm, exit_reason: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white p-3 text-sm focus:border-[#0F766E] outline-none min-h-[80px]" placeholder="Reason for resignation..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" label="Cancel" variant="outline" onClick={() => setResignationModalOpen(false)} />
            <button type="submit" disabled={submitting} className="h-10 px-6 rounded-none bg-[#0F766E] text-xs font-bold uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Add Resignation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== TERMINATION MODAL ===== */}
      <Modal isOpen={terminationModalOpen} onClose={() => setTerminationModalOpen(false)} title="Add Termination" size="lg">
        <form onSubmit={handleTermination} className="space-y-5 p-1">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Terminated Employee</label>
            <select
              value={termForm.employee_id}
              onChange={(e) => setTermForm({ ...termForm, employee_id: e.target.value })}
              className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none"
            >
              <option value="">Select</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name} {emp.emp_id ? `(${emp.emp_id})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Termination Type</label>
            <select
              value={termForm.termination_type_id}
              onChange={(e) => setTermForm({ ...termForm, termination_type_id: e.target.value })}
              className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none"
            >
              <option value="">Select</option>
              {terminationTypes.map((tt) => (
                <option key={tt.id} value={tt.id}>{tt.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notice Date</label>
            <input type="date" value={termForm.notice_date} onChange={(e) => setTermForm({ ...termForm, notice_date: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Reason</label>
            <textarea value={termForm.exit_reason} onChange={(e) => setTermForm({ ...termForm, exit_reason: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white p-3 text-sm focus:border-[#0F766E] outline-none min-h-[80px]" placeholder="Reason..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Resignation Date</label>
            <input type="date" value={termForm.resignation_date} onChange={(e) => setTermForm({ ...termForm, resignation_date: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Last Working Day *</label>
            <input type="date" value={termForm.last_working_day} onChange={(e) => setTermForm({ ...termForm, last_working_day: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-11 px-3 text-sm focus:border-[#0F766E] outline-none" required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" label="Cancel" variant="outline" onClick={() => setTerminationModalOpen(false)} />
            <button type="submit" disabled={submitting} className="h-10 px-6 rounded-none bg-red-600 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-all disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Add Termination'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== REVIEW / DETAIL MODAL ===== */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Exit Record Details" size="xl">
        <div className="animate-in fade-in duration-500 space-y-5">
          {/* Tabs */}
          <div className="flex flex-wrap items-center border-b border-slate-200 bg-slate-50 -mx-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#0F766E] text-[#0F766E] bg-white'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.id}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {detailLoading ? (
              <Spinner />
            ) : activeTab === 'Summary' ? (
              <div className="space-y-6 p-1">
                {/* Summary grid */}
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <SectionHeader icon={HiClipboardDocumentCheck} title="Exit Summary" />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-none border border-slate-100 p-5 bg-slate-50/50">
                      {[
                        { label: 'Employee', value: exitDetails?.employee_name },
                        { label: 'Department', value: exitDetails?.department },
                        { label: 'Designation', value: exitDetails?.job_title },
                        { label: 'Exit Type', value: exitDetails?.exit_type },
                        { label: 'Notice Date', value: fmtDate(exitDetails?.notice_date) },
                        { label: 'Resignation Date', value: fmtDate(exitDetails?.resignation_date) },
                        { label: 'Last Working Day', value: fmtDate(exitDetails?.last_working_day) },
                        { label: 'Notice Period', value: exitDetails?.notice_period_days != null ? `${exitDetails.notice_period_days} days` : '—' },
                        { label: 'Status', value: exitDetails?.status },
                        { label: 'Approved By', value: exitDetails?.approved_by_name || '—' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-[11px] font-bold text-slate-900">{item.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionHeader icon={HiDocumentText} title="Reason / Remarks" />
                    <div className="rounded-none border border-slate-100 p-5 bg-slate-50/50 min-h-[200px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Exit Reason</p>
                      <p className="text-sm text-slate-700">{exitDetails?.exit_reason || 'No reason provided'}</p>
                      {exitDetails?.rejection_reason && (
                        <>
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 mt-4">Rejection Reason</p>
                          <p className="text-sm text-red-600">{exitDetails.rejection_reason}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {exitDetails && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {exitDetails.status === 'Pending Approval' && exitDetails.exit_type === 'Resignation' && (
                      <>
                        <button onClick={handleApprove} className="h-10 px-6 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all">
                          Approve Resignation
                        </button>
                        <button onClick={handleReject} className="h-10 px-6 rounded-none bg-red-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all">
                          Reject
                        </button>
                      </>
                    )}
                    {exitDetails.status === 'Approved' && (
                      <button onClick={() => handleStatusUpdate('In Progress')} className="h-10 px-6 rounded-none bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all">
                        Start Offboarding
                      </button>
                    )}
                    {exitDetails.status === 'In Progress' && (
                      <button onClick={() => handleStatusUpdate('Completed')} className="h-10 px-6 rounded-none bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 transition-all">
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'Clearance' ? (
              <div className="space-y-6 p-1">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={HiShieldCheck} title="Clearance Tasks" subtitle={`${clearanceProgress.done}/${clearanceProgress.total} completed (${clearanceProgress.pct}%)`} />
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F766E] transition-all duration-500" style={{ width: `${clearanceProgress.pct}%` }} />
                </div>
                {Object.keys(groupedClearance).length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No clearance tasks yet. Approve the resignation to seed default tasks.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {Object.entries(groupedClearance).map(([dept, tasks]) => (
                      <div key={dept} className="rounded-none border border-slate-200 p-5 space-y-4 bg-white shadow-sm hover:border-[#0F766E]/30 transition-all">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                          {dept} <span className="text-slate-400">({tasks.filter((t) => t.is_completed).length}/{tasks.length})</span>
                        </h4>
                        <div className="space-y-3">
                          {tasks.map((task) => (
                            <label key={task.id} className="flex items-center justify-between p-3 border border-slate-50 bg-slate-50/30 cursor-pointer group transition-all hover:bg-white hover:border-[#0F766E]/20">
                              <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${task.is_completed ? 'text-emerald-600 line-through' : 'text-slate-500 group-hover:text-slate-900'}`}>
                                {task.task_name}
                              </span>
                              <input
                                type="checkbox"
                                checked={task.is_completed}
                                onChange={() => handleToggleClearance(task)}
                                className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-0 focus:ring-offset-0"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'Asset Return' ? (
              <div className="space-y-6 p-1">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={HiArrowPathRoundedSquare} title="Asset Return Tracking" />
                  <button
                    onClick={() => setAddAssetOpen(true)}
                    className="h-9 px-4 rounded-none bg-[#0F766E] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0c6b64] transition-all flex items-center gap-1.5"
                  >
                    <HiPlus className="h-3.5 w-3.5" /> Add Asset
                  </button>
                </div>
                {assetReturns.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No assets tracked for this exit record.</p>
                ) : (
                  <div className="overflow-hidden rounded-none border border-slate-200 shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          {['Asset Name', 'Code', 'Type', 'Status', 'Return Date', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3 font-black uppercase text-[9px] tracking-[0.15em]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {assetReturns.map((asset) => (
                          <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-[11px] font-bold text-slate-900">{asset.asset_name}</td>
                            <td className="px-4 py-3 text-[10px] font-mono text-slate-400">{asset.asset_code || '—'}</td>
                            <td className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">{asset.asset_type || '—'}</td>
                            <td className="px-4 py-3">
                              <Badge label={asset.status} color={ASSET_STATUS_COLORS[asset.status] || 'gray'} className="rounded-none text-[8px] font-black tracking-widest" />
                            </td>
                            <td className="px-4 py-3 text-[10px] font-bold text-slate-500">{fmtDate(asset.return_date)}</td>
                            <td className="px-4 py-3">
                              <select
                                value={asset.status}
                                onChange={(e) => handleAssetStatusChange(asset, e.target.value)}
                                className="bg-transparent border border-slate-200 rounded-none px-2 py-1 text-[10px] font-bold text-slate-700 cursor-pointer focus:border-[#0F766E] outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Returned">Returned</option>
                                <option value="Lost">Lost</option>
                                <option value="Damaged">Damaged</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add asset sub-modal */}
                {addAssetOpen && (
                  <div className="rounded-none border-2 border-dashed border-[#0F766E]/30 p-5 bg-[#0F766E]/5">
                    <h4 className="text-[10px] font-black text-[#0F766E] uppercase tracking-widest mb-4">Add Asset for Return</h4>
                    <form onSubmit={handleAddAsset} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Asset Name *</label>
                        <input value={assetForm.asset_name} onChange={(e) => setAssetForm({ ...assetForm, asset_name: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-9 px-3 text-sm focus:border-[#0F766E] outline-none" required />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Asset Code</label>
                        <input value={assetForm.asset_code} onChange={(e) => setAssetForm({ ...assetForm, asset_code: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-9 px-3 text-sm focus:border-[#0F766E] outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Type</label>
                        <select value={assetForm.asset_type} onChange={(e) => setAssetForm({ ...assetForm, asset_type: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-9 px-3 text-sm focus:border-[#0F766E] outline-none">
                          <option value="">Select</option>
                          <option>Laptop</option>
                          <option>Monitor</option>
                          <option>Phone</option>
                          <option>Access Card</option>
                          <option>Keys</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Notes</label>
                        <input value={assetForm.notes} onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })} className="w-full rounded-none border border-slate-200 bg-white h-9 px-3 text-sm focus:border-[#0F766E] outline-none" />
                      </div>
                      <div className="col-span-2 flex gap-2 justify-end">
                        <button type="button" onClick={() => setAddAssetOpen(false)} className="h-9 px-4 rounded-none border border-slate-200 text-[10px] font-bold text-slate-500">Cancel</button>
                        <button type="submit" className="h-9 px-4 rounded-none bg-[#0F766E] text-[10px] font-bold text-white">Add</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : activeTab === 'Documents' ? (
              <div className="space-y-6 p-1">
                <div className="flex items-center justify-between">
                  <SectionHeader icon={HiDocumentText} title="Exit Documents" subtitle="Generate official exit documents" />
                </div>
                {/* Generate buttons */}
                <div className="flex flex-wrap gap-3">
                  {['Experience Letter', 'No Objection Certificate', 'Relieving Letter', 'Full & Final Statement'].map((docType) => (
                    <button
                      key={docType}
                      onClick={() => handleGenerateDoc(docType)}
                      className="h-10 px-5 rounded-none border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-all flex items-center gap-2"
                    >
                      <HiDocumentText className="h-4 w-4" /> {docType}
                    </button>
                  ))}
                </div>
                {/* Generated docs list */}
                {exitDocuments.length > 0 && (
                  <div className="overflow-hidden rounded-none border border-slate-200 shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {exitDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-xs font-bold text-slate-800">{doc.document_title}</td>
                            <td className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">{doc.document_type}</td>
                            <td className="px-4 py-3 text-[10px] text-slate-500">{fmtDate(doc.generated_at || doc.created_at)}</td>
                            <td className="px-4 py-3 text-right">
                              {doc.file_url && (
                                <a href={doc.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-black text-[#0F766E] uppercase tracking-widest hover:underline">
                                  <HiArrowDownTray className="h-3.5 w-3.5" /> Download
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {exitDocuments.length === 0 && (
                  <p className="text-sm text-slate-400 py-6 text-center">No documents generated yet. Use the buttons above to generate exit documents.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  )
}
