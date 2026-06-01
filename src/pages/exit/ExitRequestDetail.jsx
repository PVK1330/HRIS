import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  HiArrowLeft, HiCheck, HiXMark, HiArrowUturnLeft, HiArrowTrendingUp,
  HiChatBubbleLeftRight, HiArrowRightOnRectangle, HiClock,
} from 'react-icons/hi2'
import svc from '../../services/exitWorkflowService'

const STATE_BADGE = {
  ACTIVE: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-slate-100 text-slate-500',
  REJECTED: 'bg-red-100 text-red-700',
}
const STATE_LABEL = { ACTIVE: 'Current', COMPLETED: 'Done', PENDING: 'Upcoming', REJECTED: 'Rejected' }
const STATE_DOT = { ACTIVE: 'bg-amber-500', COMPLETED: 'bg-green-500', PENDING: 'bg-slate-300', REJECTED: 'bg-red-500' }

function Stepper({ stages, activeId, onPick }) {
  return (
    <div className="mb-5 flex items-center gap-1 overflow-x-auto pb-1">
      {stages.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <button onClick={() => onPick(s.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeId === s.id ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${STATE_DOT[s.state] || 'bg-slate-300'}`} />
            {s.name}
          </button>
          {i < stages.length - 1 && <span className="mx-1 h-px w-4 bg-slate-200" />}
        </div>
      ))}
    </div>
  )
}

export default function ExitRequestDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeStageId, setActiveStageId] = useState(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await svc.getExitRequest(id)
      setData(d)
      const active = d.stages?.find((s) => s.state === 'ACTIVE') || d.stages?.[0]
      setActiveStageId((prev) => prev ?? active?.id ?? null)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load exit request')
      if (e?.response?.status === 403 || e?.response?.status === 404) nav('/admin/exit-management')
    } finally { setLoading(false) }
  }, [id, nav])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="p-10 text-center text-slate-400">Loading…</div>
  if (!data) return null

  const stages = [...(data.stages || [])].sort((a, b) => a.stage_order - b.stage_order)
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0]
  const isCurrentStage = activeStage?.state === 'ACTIVE'
  const actions = isCurrentStage ? (data.my_actions || []) : []
  const can = (a) => actions.includes(a)

  const stageApprovals = (data.approvals || []).filter((a) => a.stage_id === activeStage?.id)
  const stageChecklist = (data.checklist_items || []).filter((c) => c.stage_id === activeStage?.id)

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
  const toggleChecklist = (item) =>
    run(() => svc.updateChecklistItem(id, activeStage.id, item.id, { status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }), 'Checklist updated')

  return (
    <div className="mx-auto max-w-4xl p-4">
      <button onClick={() => nav('/admin/exit-management')} className="mb-3 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0F766E]"><HiArrowLeft /> Back to exits</button>

      {/* header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">{data.employee_name}</h1>
          <p className="text-sm text-slate-500 capitalize">{data.exit_type} · workflow: {data.workflow_name || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${data.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : data.status === 'REJECTED' ? 'bg-red-100 text-red-700' : data.status === 'WITHDRAWN' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{data.status}</span>
          {['SUBMITTED', 'IN_PROGRESS'].includes(data.status) && (data.my_visibility === 'subject_readonly') && (
            <button onClick={doWithdraw} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"><HiArrowRightOnRectangle /> Withdraw</button>
          )}
        </div>
      </div>

      <Stepper stages={stages} activeId={activeStageId} onPick={setActiveStageId} />

      {/* active stage panel */}
      {activeStage && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">{activeStage.name}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATE_BADGE[activeStage.state]}`}>{STATE_LABEL[activeStage.state]}</span>
          </div>

          {/* checklist */}
          {stageChecklist.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-bold uppercase text-slate-400">Checklist</h3>
              {stageChecklist.map((c) => (
                <label key={c.id} className="flex items-center gap-2 py-1 text-sm text-slate-600">
                  <input type="checkbox" disabled={!can('complete_checklist')} checked={c.status === 'COMPLETED'} onChange={() => toggleChecklist(c)}
                    className="h-4 w-4 rounded text-[#0F766E] disabled:opacity-50" />
                  <span className={c.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}>{c.label}</span>
                  <span className="text-[10px] uppercase text-slate-300">{c.item_type}</span>
                </label>
              ))}
            </div>
          )}

          {/* history */}
          <div className="mb-4">
            <h3 className="mb-1 text-xs font-bold uppercase text-slate-400">Stage activity</h3>
            {stageApprovals.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {stageApprovals.map((a) => (
                  <li key={a.id} className="flex items-start gap-2 text-sm">
                    <HiClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                    <div>
                      <span className="font-semibold text-slate-700">{a.actor_full_name || a.actor_name || 'System'}</span>
                      <span className="text-slate-500"> — {a.action.toLowerCase().replace('_', ' ')}</span>
                      {a.comments && <span className="text-slate-400"> · “{a.comments}”</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* action panel — only on the current stage, only permitted actions */}
          {isCurrentStage && actions.some((a) => a !== 'view') ? (
            <div className="rounded-lg bg-slate-50 p-3">
              <h3 className="mb-2 text-xs font-bold uppercase text-slate-400">Your actions</h3>
              {(can('comment') || can('approve')) && (
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Optional comment…"
                  className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              )}
              <div className="flex flex-wrap gap-2">
                {can('approve') && <button disabled={busy} onClick={doApprove} className="flex items-center gap-1 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"><HiCheck /> Approve</button>}
                {can('reject') && <button disabled={busy} onClick={doReject} className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"><HiXMark /> Reject</button>}
                {can('send_back') && <button disabled={busy} onClick={doSendBack} className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><HiArrowUturnLeft /> Send back</button>}
                {can('escalate') && <button disabled={busy} onClick={doEscalate} className="flex items-center gap-1 rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50"><HiArrowTrendingUp /> Escalate</button>}
                {can('comment') && <button disabled={busy} onClick={doComment} className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><HiChatBubbleLeftRight /> Comment</button>}
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-400">
              {activeStage.state === 'PENDING' ? 'This stage has not started yet.'
                : activeStage.state === 'COMPLETED' ? 'This stage is complete (read-only).'
                : 'You have no actions on this stage.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
