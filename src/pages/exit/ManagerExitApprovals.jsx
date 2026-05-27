import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiClipboardDocumentCheck,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  listExitRecords,
  approveResignation,
  rejectResignation,
  updateClearanceTask,
  listClearanceTasks,
} from '../../services/exitManagementService.js'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(d) {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}

const MGR_ROLES = ['admin', 'hr_admin', 'hr_manager', 'manager']

export default function ManagerExitApprovals() {
  const { user } = useAuth()

  if (!MGR_ROLES.includes(user?.role)) {
    return <Navigate to="/admin/my-exit" replace />
  }

  const [pendingRecords, setPendingRecords] = useState([])
  const [clearanceRecords, setClearanceRecords] = useState([])
  const [clearanceTasks, setClearanceTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const [pendingRes, clearanceRes] = await Promise.all([
        listExitRecords({ status: 'Pending Approval', limit: 50 }),
        listExitRecords({ status: 'clearance', limit: 50 }),
      ])
      setPendingRecords(pendingRes?.records || [])
      setClearanceRecords(clearanceRes?.records || [])

      const clearRecs = clearanceRes?.records || []
      const taskMap = {}
      for (const rec of clearRecs) {
        try {
          const tasks = await listClearanceTasks(rec.id)
          taskMap[rec.id] = (tasks || []).filter(
            (t) => t.assigned_to_role === 'manager' || !t.assigned_to_role,
          )
        } catch {
          taskMap[rec.id] = []
        }
      }
      setClearanceTasks(taskMap)
    } catch {
      toast.error('Failed to load exit records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Approve this resignation?',
      text: 'This will move the employee to notice period.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      confirmButtonText: 'Yes, approve',
    })
    if (!result.isConfirmed) return
    try {
      setActionLoading((p) => ({ ...p, [id]: 'approve' }))
      await approveResignation(id)
      toast.success('Resignation approved')
      fetchRecords()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }))
    }
  }

  const handleReject = async (id) => {
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
      setActionLoading((p) => ({ ...p, [id]: 'reject' }))
      await rejectResignation(id, { rejection_reason: reason })
      toast.success('Resignation rejected')
      fetchRecords()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }))
    }
  }

  const handleTaskToggle = async (exitId, taskId, currentCompleted) => {
    try {
      await updateClearanceTask(exitId, taskId, { is_completed: !currentCompleted })
      setClearanceTasks((prev) => ({
        ...prev,
        [exitId]: (prev[exitId] || []).map((t) =>
          t.id === taskId ? { ...t, is_completed: !currentCompleted } : t,
        ),
      }))
      toast.success('Task updated')
    } catch {
      toast.error('Failed to update task')
    }
  }

  const totalClearanceTasks = Object.values(clearanceTasks).reduce(
    (sum, tasks) => sum + tasks.filter((t) => !t.is_completed).length, 0,
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-56 bg-slate-100 animate-pulse rounded-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-none" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-slate-100 animate-pulse rounded-none" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 font-[Poppins]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Exit Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">Manage resignation approvals and clearance sign-offs for your team</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-amber-400 rounded-none p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Approvals</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{pendingRecords.length}</p>
            </div>
            <div className="h-10 w-10 bg-amber-50 flex items-center justify-center">
              <HiClock className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 border-l-4 border-l-blue-400 rounded-none p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clearance Tasks</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalClearanceTasks}</p>
            </div>
            <div className="h-10 w-10 bg-blue-50 flex items-center justify-center">
              <HiClipboardDocumentCheck className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Awaiting Approval Section */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HiClock className="h-5 w-5 text-amber-500" />
          Awaiting Your Approval
          {pendingRecords.length > 0 && (
            <Badge label={String(pendingRecords.length)} color="orange" />
          )}
        </h2>

        {pendingRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-none p-10 text-center">
            <HiClock className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No resignations awaiting your approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRecords.map((rec) => {
              const days = daysUntil(rec.last_working_day)
              return (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-none p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(rec.employee_name || 'U')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{rec.employee_name}</p>
                        <p className="text-xs text-slate-500">{rec.department || 'No department'} &middot; {rec.job_title || ''}</p>
                      </div>
                    </div>
                    <Badge label={rec.exit_type} color={rec.exit_type === 'Resignation' ? 'purple' : 'red'} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{rec.exit_reason || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Working Day</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{fmtDate(rec.last_working_day)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notice Period</span>
                      <p className="font-semibold text-slate-700 mt-0.5">{rec.notice_period_days || 0} days</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Days Remaining</span>
                      <p className={`font-semibold mt-0.5 ${days != null && days < 7 ? 'text-red-600' : 'text-slate-700'}`}>
                        {days != null ? `${days} days` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 justify-end border-t border-slate-100 pt-4">
                    <Button
                      label="Reject"
                      variant="danger"
                      size="sm"
                      icon={HiXCircle}
                      onClick={() => handleReject(rec.id)}
                      loading={actionLoading[rec.id] === 'reject'}
                      disabled={!!actionLoading[rec.id]}
                    />
                    <Button
                      label="Approve"
                      variant="Approve"
                      size="sm"
                      icon={HiCheckCircle}
                      onClick={() => handleApprove(rec.id)}
                      loading={actionLoading[rec.id] === 'approve'}
                      disabled={!!actionLoading[rec.id]}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Clearance Sign-off Section */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HiClipboardDocumentCheck className="h-5 w-5 text-blue-500" />
          Clearance Sign-off
          {clearanceRecords.length > 0 && (
            <Badge label={String(clearanceRecords.length)} color="blue" />
          )}
        </h2>

        {clearanceRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-none p-10 text-center">
            <HiClipboardDocumentCheck className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No clearance tasks assigned to you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clearanceRecords.map((rec) => {
              const tasks = clearanceTasks[rec.id] || []
              const done = tasks.filter((t) => t.is_completed).length
              const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
              return (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-none p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {(rec.employee_name || 'U')[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{rec.employee_name}</p>
                      <p className="text-xs text-slate-500">{rec.department || ''}</p>
                    </div>
                    <Badge label="Clearance" color="blue" />
                  </div>

                  {tasks.length === 0 ? (
                    <p className="text-sm text-slate-400">No manager tasks assigned</p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                          <span className="font-medium">{done} of {tasks.length} completed</span>
                          <span className="font-bold text-slate-700">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#0F766E] transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-3 border rounded-none transition-colors ${
                              task.is_completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div>
                              <p className={`text-sm font-semibold ${task.is_completed ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                                {task.task_name}
                              </p>
                              {task.department && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 inline-block">
                                  {task.department}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTaskToggle(rec.id, task.id, task.is_completed)}
                              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                                task.is_completed ? 'bg-[#0F766E]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                  task.is_completed ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
