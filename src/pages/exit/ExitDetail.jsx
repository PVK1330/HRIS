import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiClock,
  HiCalendarDays,
  HiUserCircle,
  HiBriefcase,
  HiMapPin,
  HiDocumentText,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight,
  HiBanknotes,
  HiArrowRightOnRectangle,
  HiHandThumbUp,
  HiCheck,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ExitStatusStepper from '../../components/exit/ExitStatusStepper.jsx'
import ClearanceChecklist from '../../components/exit/ClearanceChecklist.jsx'
import ExitInterviewForm from '../../components/exit/ExitInterviewForm.jsx'
import SettlementForm from '../../components/exit/SettlementForm.jsx'
import ExitDocuments from '../../components/exit/ExitDocuments.jsx'
import {
  getExitRecord,
  approveResignation,
  rejectResignation,
  updateExitStatus,
  updateClearanceTask,
  getAuditLog,
} from '../../services/exitManagementService.js'

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

const STATUS_RANK = {
  'Pending Approval': 0,
  Rejected: -1,
  Approved: 1,
  clearance: 2,
  'In Progress': 2,
  interview: 3,
  settlement: 4,
  Completed: 5,
}

const HR_ROLES = ['admin', 'hr_admin']

const DETAIL_TABS = [
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

function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function daysUntil(d) {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}

export default function ExitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [record, setRecord] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab] = useState('submitted')

  const isHR = HR_ROLES.includes(user?.role)
  const rank = STATUS_RANK[record?.status] ?? 0

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getExitRecord(id)
      if (!isHR && data?.employee_id !== user?.id) {
        toast.error('You do not have access to this record')
        navigate('/admin/my-exit', { replace: true })
        return
      }
      setRecord(data)
    } catch {
      toast.error('Failed to load exit record')
    } finally {
      setLoading(false)
    }
  }, [id, isHR, user?.id, navigate])

  const fetchAudit = useCallback(async () => {
    try {
      const logs = await getAuditLog(id)
      setAuditLogs(logs || [])
    } catch { /* silent */ }
  }, [id])

  useEffect(() => {
    fetchRecord()
    fetchAudit()
  }, [fetchRecord, fetchAudit])

  useEffect(() => {
    if (!record) return
    const r = STATUS_RANK[record.status] ?? 0
    if (r === -1) {
      setActiveTab('submitted')
      return
    }
    const matchingTab = DETAIL_TABS.find((t) => t.rankIndex === r)
    if (matchingTab) setActiveTab(matchingTab.key)
  }, [record?.status])

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: 'Approve this resignation?',
      text: 'The employee will move to notice period and clearance tasks will be created.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, approve',
    })
    if (!result.isConfirmed) return
    try {
      setActionLoading('approve')
      await approveResignation(id)
      toast.success('Resignation approved')
      fetchRecord()
      fetchAudit()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Reject this resignation?',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Provide a reason...',
      inputValidator: (v) => (!v?.trim() ? 'Reason is required' : undefined),
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      confirmButtonText: 'Reject',
    })
    if (!reason) return
    try {
      setActionLoading('reject')
      await rejectResignation(id, { rejection_reason: reason })
      toast.success('Resignation rejected')
      fetchRecord()
      fetchAudit()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading('status')
      await updateExitStatus(id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      fetchRecord()
      fetchAudit()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTaskToggle = async (taskId, payload) => {
    try {
      await updateClearanceTask(id, taskId, payload)
      fetchRecord()
      toast.success('Task updated')
    } catch {
      toast.error('Failed to update task')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-5 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="h-24 bg-slate-100 animate-pulse rounded-none" />
        <div className="h-20 bg-slate-100 animate-pulse rounded-none" />
        <div className="h-12 bg-slate-100 animate-pulse rounded-none" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-none" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Exit record not found</p>
        <Button label="Back" variant="outline" className="mt-4" onClick={() => navigate('/admin/exit-management')} />
      </div>
    )
  }

  const days = daysUntil(record.last_working_day)
  const initial = (record.employee_name || 'U')[0].toUpperCase()

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Back */}
      <div className="px-6 pt-6">
        <button
          type="button"
          onClick={() => navigate('/admin/exit-management')}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" /> Back to Exit Management
        </button>
      </div>

      {/* Employee Info Header */}
      <div className="mx-6 bg-white border border-slate-200 rounded-none p-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#004CA5] to-[#0F766E] flex items-center justify-center text-white text-2xl font-black shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900">{record.employee_name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-500">
              {record.employee_id && (
                <span className="flex items-center gap-1"><HiUserCircle className="h-4 w-4" /> ID: {record.employee_id}</span>
              )}
              {record.department && (
                <span className="flex items-center gap-1"><HiBriefcase className="h-4 w-4" /> {record.department}</span>
              )}
              {record.job_title && (
                <span className="flex items-center gap-1"><HiMapPin className="h-4 w-4" /> {record.job_title}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge label={record.exit_type} color={record.exit_type === 'Resignation' ? 'purple' : 'red'} />
            <Badge label={record.status} color={STATUS_COLOR[record.status] || 'gray'} />
          </div>
          {days != null && (
            <div className={`text-center shrink-0 px-3 py-1.5 border rounded-none ${days < 7 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-lg font-black ${days < 7 ? 'text-red-600' : 'text-slate-800'}`}>{days}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Days Left</p>
            </div>
          )}
        </div>
      </div>

     
      {/* Tabbed Content Section */}
      <div className="mx-6 overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const isDone = rank > tab.rankIndex
            const isCurrent = rank === tab.rankIndex
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#0F766E] text-[#0F766E]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {isDone ? (
                  <HiCheck className="h-4 w-4 text-emerald-500" />
                ) : (
                  <tab.icon className={`h-4 w-4 ${isActive ? 'text-[#0F766E]' : isCurrent ? 'text-slate-600' : 'text-slate-300'}`} />
                )}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* ── TAB 1: Submitted ── */}
          {activeTab === 'submitted' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800">Submission Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                <InfoItem label="Exit Type" value={record.exit_type} />
                <InfoItem label="Voluntary" value={record.is_voluntary ? 'Yes' : 'No'} />
                <InfoItem label="Last Working Day" value={fmtDate(record.last_working_day)} icon={HiCalendarDays} />
                <InfoItem
                  label="Days Remaining"
                  value={days != null ? `${days} days` : '—'}
                  icon={HiClock}
                  valueClass={days != null && days < 7 ? 'text-red-600' : ''}
                />
                <InfoItem label="Notice Period" value={`${record.notice_period_days || 0} days`} />
                <InfoItem label="Reason" value={record.exit_reason || '—'} />
                <InfoItem label="Created At" value={fmtDate(record.created_at)} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RTW Status</span>
                  <div className="mt-1">
                    <Badge label={record.rtw_status || 'Valid'} color={record.rtw_status === 'invalid' ? 'red' : 'green'} />
                  </div>
                </div>
              </div>

              {record.reason_detail && (
                <div className="border border-slate-200 rounded-none p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason Detail</span>
                  <p className="text-sm text-slate-700 mt-1.5">{record.reason_detail}</p>
                </div>
              )}

              {record.status === 'Rejected' && record.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-none p-4">
                  <p className="text-sm font-bold text-red-700">Rejection Reason</p>
                  <p className="text-sm text-red-600 mt-1">{record.rejection_reason}</p>
                </div>
              )}

              {/* Audit Log for this step */}
              <AuditSection logs={auditLogs} />
            </div>
          )}

          {/* ── TAB 2: Approved ── */}
          {activeTab === 'approved' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800">Approval</h3>

              {rank < 1 ? (
                <PendingActionCard
                  title="Awaiting Approval"
                  description="This exit request is pending manager/HR approval."
                  icon={HiClock}
                >
                  {isHR && record.status === 'Pending Approval' && (
                    <div className="flex items-center gap-3 mt-4">
                      <Button label="Approve" variant="Approve" icon={HiCheckCircle} onClick={handleApprove} loading={actionLoading === 'approve'} disabled={!!actionLoading} />
                      <Button label="Reject" variant="danger" icon={HiXCircle} onClick={handleReject} loading={actionLoading === 'reject'} disabled={!!actionLoading} />
                    </div>
                  )}
                </PendingActionCard>
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

                  {record.status === 'Approved' && isHR && (
                    <div className="flex items-center gap-3">
                      <Button label="Move to Clearance" variant="secondary" icon={HiArrowPath} onClick={() => handleStatusChange('clearance')} loading={actionLoading === 'status'} />
                    </div>
                  )}
                </div>
              )}

              <AuditSection logs={auditLogs} />
            </div>
          )}

          {/* ── TAB 3: Clearance ── */}
          {activeTab === 'clearance' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800">Clearance Tasks</h3>

              {rank < 2 ? (
                <PendingActionCard
                  title="Not Yet Started"
                  description="Clearance tasks will be available after the exit is approved."
                  icon={HiClipboardDocumentCheck}
                />
              ) : (
                <>
                  {(record.clearance_tasks || []).length > 0 ? (
                    <ClearanceChecklist
                      exitRequestId={record.id}
                      tasks={record.clearance_tasks || []}
                      onTaskUpdate={handleTaskToggle}
                      roleCanEdit={isHR}
                      currentUserRole={user?.role || 'employee'}
                    />
                  ) : (
                    <div className="text-center py-10 text-sm text-slate-400">
                      No clearance tasks assigned yet.
                    </div>
                  )}

                  {record.status === 'clearance' && isHR && (
                    <div className="flex items-center gap-3 pt-2">
                      <Button label="Move to Interview" variant="secondary" icon={HiArrowPath} onClick={() => handleStatusChange('interview')} loading={actionLoading === 'status'} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TAB 4: Interview ── */}
          {activeTab === 'interview' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800">Exit Interview</h3>

              {rank < 3 ? (
                <PendingActionCard
                  title="Not Yet Started"
                  description="Exit interview will be available after clearance is completed."
                  icon={HiChatBubbleLeftRight}
                />
              ) : (
                <>
                  <ExitInterviewForm
                    exitRequestId={record.id}
                    existingInterview={record.exit_interview || null}
                    onSubmitted={() => { fetchRecord(); fetchAudit() }}
                  />

                  {record.status === 'interview' && isHR && (
                    <div className="flex items-center gap-3 pt-2">
                      <Button label="Move to Settlement" variant="secondary" icon={HiArrowPath} onClick={() => handleStatusChange('settlement')} loading={actionLoading === 'status'} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TAB 5: Settlement ── */}
          {activeTab === 'settlement' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800">Final Settlement</h3>

              {rank < 4 ? (
                <PendingActionCard
                  title="Not Yet Started"
                  description="Settlement processing will be available after the exit interview."
                  icon={HiBanknotes}
                />
              ) : (
                <>
                  {isHR ? (
                    <SettlementForm
                      exitRequestId={record.id}
                      existingSettlement={record.final_settlement || null}
                      onSubmitted={() => { fetchRecord(); fetchAudit() }}
                      employeeTenure={0}
                    />
                  ) : (
                    <div className="text-center py-10 text-sm text-slate-400">
                      Settlement processing is handled by HR. Please contact your HR administrator.
                    </div>
                  )}

                  {record.status === 'settlement' && isHR && (
                    <div className="flex items-center gap-3 pt-2">
                      <Button label="Mark Completed" variant="Approve" icon={HiCheckCircle} onClick={() => handleStatusChange('Completed')} loading={actionLoading === 'status'} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TAB 6: Exited ── */}
          {activeTab === 'exited' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800">Exit Completion</h3>

              {rank < 5 ? (
                <PendingActionCard
                  title="Not Yet Completed"
                  description="The employee has not yet been fully off-boarded. Complete all prior steps first."
                  icon={HiArrowRightOnRectangle}
                />
              ) : (
                <>
                  <div className="border border-emerald-200 bg-emerald-50 rounded-none p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <HiCheckCircle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-emerald-800">Employee Exited</p>
                      <p className="text-sm text-emerald-600 mt-0.5">
                        {record.employee_name} has been officially off-boarded. All access has been revoked and records archived.
                      </p>
                    </div>
                  </div>

                  <ExitDocuments
                    exitRequestId={record.id}
                    exitType={(record.exit_type || '').toLowerCase()}
                    documents={record.exit_documents || []}
                    onGenerated={fetchRecord}
                    canGenerate={isHR}
                  />

                  <AuditSection logs={auditLogs} />
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon: Icon, valueClass = '' }) {
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <p className={`font-bold text-slate-900 mt-1 flex items-center gap-1.5 ${valueClass}`}>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {value}
      </p>
    </div>
  )
}

function PendingActionCard({ title, description, icon: Icon, children }) {
  return (
    <div className="border border-slate-200 rounded-none p-6 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="h-7 w-7 text-slate-300" />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
      {children}
    </div>
  )
}

function AuditSection({ logs }) {
  if (!logs || logs.length === 0) return null
  return (
    <div className="border-t border-slate-100 pt-5 mt-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Activity Log</p>
      <div className="relative pl-6 space-y-4">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className="relative flex items-start gap-3">
            <div className="absolute left-[-17px] top-1 h-3 w-3 rounded-full bg-[#0F766E] border-2 border-white shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{formatAction(log.action)}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                by {log.performed_by_name || 'System'} &middot; {fmtDateTime(log.created_at)}
              </p>
              {(log.before_value || log.after_value) && (
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                  {log.before_value && (
                    <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded">
                      {typeof log.before_value === 'string' ? log.before_value : JSON.stringify(log.before_value)}
                    </span>
                  )}
                  {log.before_value && log.after_value && <span>→</span>}
                  {log.after_value && (
                    <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                      {typeof log.after_value === 'string' ? log.after_value : JSON.stringify(log.after_value)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatAction(action) {
  return (action || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
