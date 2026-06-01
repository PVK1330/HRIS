import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  HiArrowLeft, HiCheck, HiXMark, HiArrowUturnLeft, HiArrowTrendingUp,
  HiChatBubbleLeftRight, HiClock, HiUser, HiBriefcase, HiCalendarDays,
} from 'react-icons/hi2'
import svc from '../../services/exitWorkflowService'

const STATUS_PILL = {
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-200 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
}

function approverLabel(stage) {
  const parts = [
    ...(stage.owner_roles || []),
    ...(stage.owner_departments || []).map((d) => `${d} dept`),
    ...(stage.owner_users || []),
  ]
  return parts.length ? [...new Set(parts)].join(', ') : 'Unassigned'
}

function initials(name) {
  return (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '' }
}

export default function ExitRequestDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await svc.getExitRequest(id)
      setData(d)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load exit request')
      if (e?.response?.status === 403 || e?.response?.status === 404) nav('/admin/exit-management')
    } finally { setLoading(false) }
  }, [id, nav])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="p-10 text-center text-slate-400">Loading…</div>
  if (!data) return null

  const stages = [...(data.stages || [])].sort((a, b) => a.stage_order - b.stage_order)
  const myActions = data.my_actions || []
  const can = (a) => myActions.includes(a)

  const run = async (fn, okMsg) => {
    setBusy(true)
    try { await fn(); toast.success(okMsg); setComment(''); await load() }
    catch (e) { toast.error(e?.response?.data?.message || 'Action failed') }
    finally { setBusy(false) }
  }
  const doApprove = () => run(() => svc.approveStage(id, comment), 'Approved')
  const doReject = async () => {
    const { value } = await Swal.fire({ title: 'Reject exit request', input: 'textarea', inputLabel: 'Reason (required)', inputValidator: (v) => !v && 'A reason is required', showCancelButton: true, confirmButtonColor: '#dc2626' })
    if (value) run(() => svc.rejectStage(id, value), 'Rejected')
  }
  const doSendBack = async () => {
    const { value } = await Swal.fire({ title: 'Send back', input: 'textarea', inputLabel: 'Comment (required)', inputValidator: (v) => !v && 'A comment is required', showCancelButton: true })
    if (value) run(() => svc.sendBackStage(id, { comments: value }), 'Sent back')
  }
  const doEscalate = () => run(() => svc.escalateStage(id, comment || 'Manual escalation'), 'Escalated')
  const doComment = () => { if (!comment.trim()) { toast.error('Enter a comment'); return } run(() => svc.addStageComment(id, comment), 'Comment added') }
  const doWithdraw = async () => {
    const r = await Swal.fire({ title: 'Withdraw this exit request?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626' })
    if (r.isConfirmed) run(() => svc.withdrawExitRequest(id, 'Withdrawn by request'), 'Withdrawn')
  }
  const toggleChecklist = (stageId, item) =>
    run(() => svc.updateChecklistItem(id, stageId, item.id, { status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }), 'Checklist updated')

  const canWithdraw = ['SUBMITTED', 'IN_PROGRESS'].includes(data.status) && data.my_visibility === 'subject_readonly'

  return (
    <div className="mx-auto max-w-3xl p-4">
      <button onClick={() => nav('/admin/exit-management')} className="mb-3 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0F766E]"><HiArrowLeft /> Back to exits</button>

      {/* header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F766E] text-base font-bold text-white">{initials(data.employee_name)}</div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{data.employee_name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
              {data.job_title && <span className="flex items-center gap-1"><HiBriefcase className="h-3.5 w-3.5" /> {data.job_title}</span>}
              <span className="flex items-center gap-1 capitalize"><HiUser className="h-3.5 w-3.5" /> {data.exit_type}</span>
              {data.last_working_day && <span className="flex items-center gap-1"><HiCalendarDays className="h-3.5 w-3.5" /> LWD {fmtDate(data.last_working_day)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_PILL[data.status] || 'bg-slate-100 text-slate-500'}`}>{data.status.replace('_', ' ')}</span>
          {canWithdraw && <button onClick={doWithdraw} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">Withdraw</button>}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Approval flow</h2>
        <span className="text-xs text-slate-400">{data.workflow_name}</span>
      </div>

      {/* vertical timeline */}
      <div className="space-y-0">
        {stages.map((s, i) => {
          const isActive = s.state === 'ACTIVE'
          const isDone = s.state === 'COMPLETED'
          const isRejected = s.state === 'REJECTED'
          const stageActs = (data.approvals || []).filter((a) => a.stage_id === s.id && a.action !== 'PENDING')
          const checklist = (data.checklist_items || []).filter((c) => c.stage_id === s.id)
          const decided = stageActs.find((a) => ['APPROVE', 'REJECT', 'COMPLETE'].includes(a.action))

          return (
            <div key={s.id} className="flex gap-3">
              {/* rail */}
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isDone ? 'bg-green-500 text-white'
                    : isRejected ? 'bg-red-500 text-white'
                    : isActive ? 'bg-[#0F766E] text-white ring-4 ring-teal-100'
                    : 'bg-slate-100 text-slate-400'}`}>
                  {isDone ? <HiCheck className="h-5 w-5" /> : isRejected ? <HiXMark className="h-5 w-5" /> : s.stage_order}
                </div>
                {i < stages.length - 1 && <div className={`w-0.5 flex-1 ${isDone ? 'bg-green-300' : 'bg-slate-200'}`} style={{ minHeight: 24 }} />}
              </div>

              {/* card */}
              <div className={`mb-4 flex-1 rounded-xl border p-4 ${isActive ? 'border-teal-300 bg-teal-50/40 shadow-sm' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{s.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isDone ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700'
                      : isActive ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                    {isDone ? 'Approved' : isRejected ? 'Rejected' : isActive ? 'Current' : 'Upcoming'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Approver: <span className="font-medium text-slate-600">{approverLabel(s)}</span></p>

                {/* completed → who acted */}
                {decided && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <HiClock className="h-3.5 w-3.5 text-slate-300" />
                    {decided.action === 'REJECT' ? 'Rejected' : 'Approved'} by {decided.actor_full_name || decided.actor_name || 'System'} · {fmtDate(decided.created_at)}
                    {decided.comments && <span className="text-slate-400"> · “{decided.comments}”</span>}
                  </p>
                )}

                {/* checklist */}
                {checklist.length > 0 && (isActive || isDone) && (
                  <div className="mt-3 rounded-lg bg-white/70 p-2">
                    {checklist.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 py-0.5 text-sm text-slate-600">
                        <input type="checkbox" disabled={!isActive || !can('complete_checklist')} checked={c.status === 'COMPLETED'} onChange={() => toggleChecklist(s.id, c)} className="h-4 w-4 rounded text-[#0F766E] disabled:opacity-50" />
                        <span className={c.status === 'COMPLETED' ? 'text-slate-400 line-through' : ''}>{c.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* current stage: action card OR waiting note */}
                {isActive && (
                  can('approve') ? (
                    <div className="mt-3 rounded-lg border border-teal-200 bg-white p-3">
                      <p className="mb-2 text-xs font-bold uppercase text-teal-700">Your action is needed</p>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Optional comment…" className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                      <div className="flex flex-wrap gap-2">
                        <button disabled={busy} onClick={doApprove} className="flex items-center gap-1 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"><HiCheck /> Approve</button>
                        {can('reject') && <button disabled={busy} onClick={doReject} className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"><HiXMark /> Reject</button>}
                        {can('send_back') && <button disabled={busy} onClick={doSendBack} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><HiArrowUturnLeft /> Send back</button>}
                        {can('escalate') && <button disabled={busy} onClick={doEscalate} className="flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50"><HiArrowTrendingUp /> Escalate</button>}
                        {can('comment') && <button disabled={busy} onClick={doComment} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><HiChatBubbleLeftRight /> Comment</button>}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">⏳ Waiting for <span className="font-semibold">{approverLabel(s)}</span> to approve.</p>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {data.status === 'COMPLETED' && (
        <div className="mt-2 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-700">✓ Exit process completed</div>
      )}
      {data.status === 'REJECTED' && (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">This exit request was rejected{data.rejection_reason ? `: ${data.rejection_reason}` : ''}.</div>
      )}
    </div>
  )
}
