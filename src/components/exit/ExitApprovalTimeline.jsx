import { HiCheckCircle, HiXCircle, HiMinusCircle, HiArrowPath } from 'react-icons/hi2'
import { Badge } from '../ui/Badge.jsx'
import { Button } from '../ui/Button.jsx'

const STATUS_COLOR = {
  Pending: 'gray',
  Active: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Skipped: 'blue',
}

const ACTION_ICON = {
  Approved: HiCheckCircle,
  Rejected: HiXCircle,
  Skipped: HiMinusCircle,
  Restarted: HiArrowPath,
  WorkflowAssigned: HiCheckCircle,
  Reassigned: HiArrowPath,
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ExitApprovalTimeline({
  workflow,
  onApprove,
  onReject,
  onSkip,
  actionLoading,
  canManage = false,
}) {
  const steps = workflow?.steps || []
  const approvals = workflow?.approvals || []

  if (!steps.length && !approvals.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        No department workflow configured yet.
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Department steps</h3>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`relative rounded-lg border p-4 transition-all ${
              step.status === 'Active'
                ? 'border-[#0F766E] bg-[#0F766E]/5 shadow-sm'
                : 'border-slate-200 bg-white'
            }`}
          >
            {idx < steps.length - 1 && (
              <div className="absolute left-6 top-full h-3 w-0.5 bg-slate-200" />
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{step.department_name}</span>
                  <Badge label={step.status} color={STATUS_COLOR[step.status] || 'gray'} />
                  {!step.is_mandatory && <Badge label="Optional" color="gray" />}
                </div>
                <p className="mt-1 text-xs text-slate-500">Head: {step.department_head_name || '—'}</p>
                {step.remarks && (
                  <p className="mt-2 text-xs text-slate-600 italic">{step.remarks}</p>
                )}
                {step.approved_at && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {step.approved_by_name} · {fmtDate(step.approved_at)}
                  </p>
                )}
              </div>
              {step.status === 'Active' && canManage && (
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    size="sm"
                    label="Approve"
                    loading={actionLoading === `approve-${step.id}`}
                    onClick={() => onApprove?.(step)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    label="Reject"
                    loading={actionLoading === `reject-${step.id}`}
                    onClick={() => onReject?.(step)}
                  />
                  {!step.is_mandatory && (
                    <Button
                      size="sm"
                      variant="ghost"
                      label="Skip"
                      loading={actionLoading === `skip-${step.id}`}
                      onClick={() => onSkip?.(step)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Approval history</h3>
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {approvals.length === 0 ? (
            <p className="text-sm text-slate-400">No actions recorded yet.</p>
          ) : (
            approvals.map((a) => {
              const Icon = ACTION_ICON[a.action] || HiCheckCircle
              return (
                <div key={a.id} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{a.action}</p>
                    <p className="text-xs text-slate-500">
                      {a.actor_name || 'System'} · {fmtDate(a.created_at)}
                    </p>
                    {a.comments && <p className="mt-1 text-xs text-slate-600">{a.comments}</p>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
