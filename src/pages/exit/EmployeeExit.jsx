import { useCallback, useEffect, useState } from 'react'
import api from '../../services/api.js'
import {
  HiCalendarDays,
  HiClock,
  HiDocumentText,
  HiEnvelope,
  HiShieldCheck,
  HiCheckCircle,
  HiClipboardDocumentList,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import ExitStatusStepper from '../../components/exit/ExitStatusStepper.jsx'
import ClearanceChecklist from '../../components/exit/ClearanceChecklist.jsx'
import ExitInterviewForm from '../../components/exit/ExitInterviewForm.jsx'
import ExitDocuments from '../../components/exit/ExitDocuments.jsx'
import ResignationModal from '../../components/exit/ResignationModal.jsx'
import WithdrawalModal from '../../components/exit/WithdrawalModal.jsx'
import { useExitSocket } from '../../hooks/useExitSocket.js'
import {
  listExitRecords,
  getExitRecord,
  updateClearanceTask,
  getExitInterview,
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

const EXIT_CHECKLIST_ITEMS = [
  { id: 'laptop', label: 'Return laptop and charger' },
  { id: 'id_card', label: 'Return ID card and access cards' },
  { id: 'kt_docs', label: 'Complete KT documentation' },
  { id: 'handover', label: 'Hand over pending projects' },
  { id: 'personal', label: 'Clear personal items from workspace' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(d) {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}

export default function EmployeeExit() {
  const { user } = useAuth()
  const [record, setRecord] = useState(null)
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exportingGdpr, setExportingGdpr] = useState(false)
  const [showResignModal, setShowResignModal] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [personalChecklist, setPersonalChecklist] = useState(() => {
    const saved = localStorage.getItem('exit_personal_checklist')
    return saved ? JSON.parse(saved) : {}
  })

  // Real-time optimistic Socket.io room subscription
  useExitSocket(record?.id, {
    onWorkflowUpdated: () => {
      fetchMyExit()
    },
    onTaskUpdated: () => {
      fetchMyExit()
    }
  })

  const fetchMyExit = useCallback(async () => {
    try {
      setLoading(true)
      const result = await listExitRecords({ limit: 10, employee_id: user?.id })
      const myRecords = (result?.records || []).filter(
        (r) => r.status !== 'Rejected'
      )
      if (myRecords.length > 0) {
        const full = await getExitRecord(myRecords[0].id)
        setRecord(full)
        try {
          const iv = await getExitInterview(myRecords[0].id)
          setInterview(iv)
        } catch { /* no interview yet */ }
      } else {
        setRecord(null)
      }
    } catch {
      toast.error('Failed to load your exit record')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleGdprExport = async () => {
    try {
      setExportingGdpr(true)
      const res = await api.get('/employees/gdpr/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `GDPR_Data_Export_${user?.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.success('GDPR data exported successfully.')
    } catch (error) {
      toast.error('Failed to export GDPR data.')
      console.error(error)
    } finally {
      setExportingGdpr(false)
    }
  }

  useEffect(() => { fetchMyExit() }, [fetchMyExit])

  useEffect(() => {
    localStorage.setItem('exit_personal_checklist', JSON.stringify(personalChecklist))
  }, [personalChecklist])

  const handleTaskToggle = async (taskId, payload) => {
    if (!record) return
    try {
      await updateClearanceTask(record.id, taskId, payload)
      const full = await getExitRecord(record.id)
      setRecord(full)
      toast.success('Task updated')
    } catch {
      toast.error('Failed to update task')
    }
  }

  const togglePersonalItem = useCallback((itemId) => {
    setPersonalChecklist((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <div className="h-8 w-40 bg-slate-100 animate-pulse rounded-none" />
        <div className="h-4 w-64 bg-slate-50 animate-pulse rounded-none" />
        <div className="h-24 bg-slate-100 animate-pulse rounded-none" />
        <div className="h-48 bg-slate-100 animate-pulse rounded-none" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-none" />
      </div>
    )
  }

  /* No active exit */
  if (!record) {
    return (
      <div className="p-6 space-y-6 font-[Poppins]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">My Exit</h1>
          <p className="text-sm text-slate-500 mt-1">View your resignation status and complete exit tasks</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-12 text-center">
          <div className="h-16 w-16 bg-slate-50 mx-auto mb-5 flex items-center justify-center">
            <HiDocumentText className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-700 font-bold text-lg mb-1">No active exit request</p>
          <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
            If you wish to resign, submit your resignation below. Your manager will review and approve it.
          </p>
          <Button
            label="Submit Resignation"
            variant="primary"
            onClick={() => setShowResignModal(true)}
          />
        </div>

        <ResignationModal
          isOpen={showResignModal}
          onClose={() => setShowResignModal(false)}
          onSuccess={() => {
            setShowResignModal(false)
            fetchMyExit()
          }}
          employees={user ? [{ id: user.id, full_name: user.name, emp_id: '' }] : []}
        />
      </div>
    )
  }

  const days = daysUntil(record.last_working_day)
  const rank = STATUS_RANK[record.status] ?? 0
  const employeeTasks = (record.clearance_tasks || []).filter(
    (t) => t.assigned_to_role === 'employee' || !t.assigned_to_role,
  )
  const completedPersonal = EXIT_CHECKLIST_ITEMS.filter((i) => personalChecklist[i.id]).length

  return (
    <div className="p-6 space-y-6 font-[Poppins]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">My Exit</h1>
          <p className="text-sm text-slate-500 mt-1">Track your exit progress and complete required tasks</p>
        </div>
        {record.exit_type === 'Resignation' && ['Pending Approval', 'Approved'].includes(record.status) && !record.is_withdrawal_requested && (
          <Button
            label="Withdraw Resignation"
            variant="outline"
            onClick={() => setIsWithdrawModalOpen(true)}
          />
        )}
      </div>

      {/* Exit Journey Visualization */}
      <div className="bg-white border border-slate-200 rounded-none p-6">
        <ExitStatusStepper
          currentStatus={record.status}
          exitType={(record.exit_type || '').toLowerCase()}
        />
      </div>

      {/* Resignation Withdrawal Request Pending Notice */}
      {record.is_withdrawal_requested && (
        <div className="bg-teal-50/50 border border-teal-200 p-5 rounded-none">
          <div className="flex items-start gap-3">
            <HiClock className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-teal-900">Resignation Withdrawal Request Pending</p>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                Your request to retract this resignation is currently awaiting review by HR.
              </p>
              {record.withdrawal_reason && (
                <p className="mt-2 text-xs italic text-teal-800 bg-white/60 p-2.5 border border-teal-100 font-medium">
                  &ldquo;{record.withdrawal_reason}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Summary Card */}
      <div className="bg-white border border-slate-200 rounded-none p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</span>
            <div className="mt-1.5">
              <Badge label={record.status} color={STATUS_COLOR[record.status] || 'gray'} />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Working Day</span>
            <p className="font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
              <HiCalendarDays className="h-4 w-4 text-slate-400" />
              {fmtDate(record.last_working_day)}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Days Remaining</span>
            <p className={`font-bold mt-1.5 flex items-center gap-1.5 ${days != null && days < 7 ? 'text-red-600' : 'text-slate-900'}`}>
              <HiClock className="h-4 w-4 text-slate-400" />
              {days != null ? `${days} days` : '—'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notice Period</span>
            <p className="font-bold text-slate-900 mt-1.5">{record.notice_period_days || 0} days</p>
          </div>
        </div>
      </div>

      {/* Rejection Banner */}
      {record.status === 'Rejected' && record.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-none p-5">
          <p className="text-sm font-bold text-red-700 mb-1">Resignation Rejected</p>
          <p className="text-sm text-red-600">{record.rejection_reason}</p>
        </div>
      )}

      {/* Your Clearance Tasks */}
      {rank >= 2 && employeeTasks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-none p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HiClipboardDocumentList className="h-5 w-5 text-[#0F766E]" />
            Your Clearance Tasks
          </h3>
          <ClearanceChecklist
            exitRequestId={record.id}
            tasks={employeeTasks}
            onTaskUpdate={handleTaskToggle}
            roleCanEdit={true}
            currentUserRole="employee"
          />
        </div>
      )}

      {/* Personal Exit Checklist */}
      {rank >= 2 && (
        <div className="bg-white border border-slate-200 rounded-none p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HiCheckCircle className="h-5 w-5 text-[#0F766E]" />
              Your Exit Checklist
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {completedPersonal}/{EXIT_CHECKLIST_ITEMS.length} done
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Personal tasks to complete before your last day. These are for your reference only.</p>
          <div className="space-y-2">
            {EXIT_CHECKLIST_ITEMS.map((item) => {
              const checked = !!personalChecklist[item.id]
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 border rounded-none cursor-pointer transition-colors ${
                    checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePersonalItem(item.id)}
                    className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className={`text-sm font-medium ${checked ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Exit Interview */}
      {rank >= 3 && (
        <div className="bg-white border border-slate-200 rounded-none p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Exit Interview</h3>
          {record.status === 'interview' && !interview ? (
            <ExitInterviewForm
              exitRequestId={record.id}
              existingInterview={null}
              onSubmitted={fetchMyExit}
            />
          ) : interview ? (
            <ExitInterviewForm
              exitRequestId={record.id}
              existingInterview={interview}
              onSubmitted={fetchMyExit}
            />
          ) : (
            <p className="text-sm text-slate-400">Exit interview not yet available</p>
          )}
        </div>
      )}

      {/* Exit Documents (show if any exist) */}
      {(record.exit_documents?.length > 0 || record.status === 'Completed') && (
        <div className="bg-white border border-slate-200 rounded-none p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Exit Documents</h3>
          <ExitDocuments
            exitRequestId={record.id}
            exitType={(record.exit_type || '').toLowerCase()}
            documents={record.exit_documents || []}
            onGenerated={fetchMyExit}
            canGenerate={false}
          />
        </div>
      )}

      {/* GDPR Data Rights Card */}
      <div className="bg-white border border-slate-200 rounded-none p-5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 flex items-center justify-center shrink-0">
            <HiShieldCheck className="h-5 w-5 text-[#0F766E]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">GDPR Data Rights</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Under GDPR, you have the right to request a copy of your personal data held by the organisation.
            </p>
          </div>
          <button
            onClick={handleGdprExport}
            disabled={exportingGdpr}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <HiEnvelope className="h-4 w-4" />
            {exportingGdpr ? 'Exporting...' : 'Request data export'}
          </button>
        </div>
      </div>
    
      {/* Resignation Withdrawal Request Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={() => {
          setIsWithdrawModalOpen(false)
          fetchMyExit()
        }}
        exitRequestId={record.id}
      />
    </div>
  )
}
