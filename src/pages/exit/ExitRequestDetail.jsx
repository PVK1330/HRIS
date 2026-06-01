import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  HiArrowLeft, HiCheck, HiXMark, HiArrowUturnLeft, HiArrowTrendingUp,
  HiChatBubbleLeftRight, HiClock, HiUser, HiBriefcase, HiCalendarDays,
  HiComputerDesktop, HiDocumentText, HiArrowDownTray, HiEnvelope,
} from 'react-icons/hi2'
import svc from '../../services/exitWorkflowService'

function GenerateDocsModal({ id, open, onClose, onDone }) {
  const [templates, setTemplates] = useState([])
  const [selected, setSelected] = useState([])
  const [sendEmail, setSendEmail] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSettlement, setShowSettlement] = useState(false)
  const [settlement, setSettlement] = useState({ unpaid_salary: '', leave_encashment: '', gratuity: '', deductions: '', net_payable: '' })

  useEffect(() => {
    if (!open) return
    setSelected([]); setSendEmail(true); setLoading(true)
    setShowSettlement(false); setSettlement({ unpaid_salary: '', leave_encashment: '', gratuity: '', deductions: '', net_payable: '' })
    svc.listExitDocTemplates(id)
      .then((t) => setTemplates(t || []))
      .catch((e) => toast.error(e?.response?.data?.message || 'Failed to load templates'))
      .finally(() => setLoading(false))
  }, [open, id])

  if (!open) return null
  const toggle = (tid) => setSelected((s) => (s.includes(tid) ? s.filter((x) => x !== tid) : [...s, tid]))

  const submit = async () => {
    if (!selected.length) { toast.error('Select at least one document'); return }
    setBusy(true)
    try {
      const hasSettlement = Object.values(settlement).some((v) => String(v).trim() !== '')
      const payload = { template_ids: selected, send_email: sendEmail }
      if (hasSettlement) payload.settlement = settlement
      const res = await svc.generateExitDocuments(id, payload)
      if (sendEmail && res?.email_error) toast.success(`Generated. Email not sent: ${res.email_error}`)
      else if (sendEmail && res?.emailed) toast.success(`Generated and emailed to ${res.email_to}`)
      else toast.success('Documents generated')
      onDone()
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to generate') }
    finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-lg font-bold text-slate-800">Generate exit documents</h2>
        <p className="mb-4 text-xs text-slate-500">Documents are generated from your Exit letter templates and (optionally) emailed to the employee.</p>
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading templates…</div>
        ) : templates.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">No Exit letter templates found. Add templates under Documents → Letter Templates (category “Exit”).</p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {templates.map((t) => (
              <label key={t.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} className="h-4 w-4 rounded text-[#0F766E]" />
                <span className="font-medium text-slate-700">{t.name}</span>
              </label>
            ))}
          </div>
        )}
        {/* Optional settlement figures for Full & Final letters */}
        <div className="mt-3 rounded-lg border border-slate-200">
          <button type="button" onClick={() => setShowSettlement((s) => !s)} className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600">
            <span>Settlement figures (optional)</span>
            <span className="text-slate-400">{showSettlement ? '−' : '+'}</span>
          </button>
          {showSettlement && (
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
              {[
                ['unpaid_salary', 'Unpaid salary'],
                ['leave_encashment', 'Leave encashment'],
                ['gratuity', 'Gratuity'],
                ['deductions', 'Deductions'],
                ['net_payable', 'Net payable'],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="mb-0.5 block text-[11px] font-medium text-slate-500">{label}</label>
                  <input value={settlement[k]} onChange={(e) => setSettlement((s) => ({ ...s, [k]: e.target.value }))}
                    placeholder="0.00" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="h-4 w-4 rounded text-[#0F766E]" />
          Email the document(s) to the employee
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} disabled={busy || !templates.length} className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">{busy ? 'Generating…' : 'Generate'}</button>
        </div>
      </div>
    </div>
  )
}

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
  const [assets, setAssets] = useState(null) // { assets, outstanding, total } | null
  const [docs, setDocs] = useState([])
  const [showDocsModal, setShowDocsModal] = useState(false)
  const [reqTasks, setReqTasks] = useState([])

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

  // Pull the exiting employee's assigned assets when any stage carries an ASSET_RETURN item,
  // so the clearance owner sees the real items to collect (not just a generic checklist row).
  const loadAssets = useCallback(async () => {
    try { setAssets(await svc.listExitAssets(id)) } catch { /* asset module optional */ }
  }, [id])
  useEffect(() => {
    const hasAssetItem = (data?.checklist_items || []).some((c) => c.item_type === 'ASSET_RETURN')
    if (hasAssetItem) loadAssets()
  }, [data, loadAssets])

  const loadDocs = useCallback(async () => {
    try { setDocs(await svc.listExitDocuments(id) || []) } catch { /* none */ }
  }, [id])
  useEffect(() => { if (data) loadDocs() }, [data, loadDocs])

  const loadReqTasks = useCallback(async () => {
    try { setReqTasks(await svc.listRequestTasks(id) || []) } catch { /* none */ }
  }, [id])
  useEffect(() => { if (data) loadReqTasks() }, [data, loadReqTasks])

  const downloadDoc = async (doc) => {
    try {
      const blob = await svc.downloadExitDocument(id, doc.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = doc.file_name || 'document.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) { toast.error(e?.response?.data?.message || 'Download failed') }
  }

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

  const setAssetStatus = async (asset, status) => {
    setBusy(true)
    try {
      await svc.returnExitAsset(id, asset.id, { status })
      toast.success(status === 'Returned' ? 'Marked returned' : `Marked ${status.toLowerCase()}`)
      await loadAssets()
    } catch (e) { toast.error(e?.response?.data?.message || 'Action failed') }
    finally { setBusy(false) }
  }

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
              <span className="flex items-center gap-1 capitalize"><HiUser className="h-3.5 w-3.5" /> {data.exit_type}{data.termination_type_name ? ` · ${data.termination_type_name}` : ''}</span>
              {data.last_working_day && <span className="flex items-center gap-1"><HiCalendarDays className="h-3.5 w-3.5" /> LWD {fmtDate(data.last_working_day)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_PILL[data.status] || 'bg-slate-100 text-slate-500'}`}>{data.status.replace('_', ' ')}</span>
          {canWithdraw && <button onClick={doWithdraw} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">Withdraw</button>}
        </div>
      </div>

      {data.exit_reason && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Reason</div>
          <p className="text-sm text-slate-600">{data.exit_reason}</p>
        </div>
      )}

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

                {/* asset clearance — the employee's actual assigned assets to collect */}
                {checklist.some((c) => c.item_type === 'ASSET_RETURN') && (isActive || isDone) && assets && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <HiComputerDesktop className="h-4 w-4" /> Assets to return
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${assets.outstanding ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {assets.outstanding ? `${assets.outstanding} outstanding` : 'All cleared'}
                      </span>
                    </div>
                    {assets.assets.length === 0 ? (
                      <p className="py-1 text-sm text-slate-400">No assets are assigned to this employee.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {assets.assets.map((a) => {
                          const returned = a.status !== 'Issued'
                          return (
                            <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm">
                              <span className={`font-medium ${returned ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{a.asset_name}</span>
                              <span className="text-xs text-slate-400">{a.asset_tag}{a.category ? ` · ${a.category}` : ''}</span>
                              <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${a.status === 'Issued' ? 'bg-amber-100 text-amber-700' : a.status === 'Returned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                              {isActive && can('complete_checklist') && (
                                a.status === 'Issued' ? (
                                  <button disabled={busy} onClick={() => setAssetStatus(a, 'Returned')} className="rounded-lg bg-[#0F766E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50">Mark returned</button>
                                ) : (
                                  <button disabled={busy} onClick={() => setAssetStatus(a, 'Issued')} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50">Undo</button>
                                )
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
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

      {/* Assigned tasks */}
      {reqTasks.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Assigned tasks</h2>
          <div className="space-y-1.5">
            {reqTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className={`h-2 w-2 shrink-0 rounded-full ${t.status === 'PENDING' ? 'bg-amber-400' : t.status === 'COMPLETED' ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="min-w-0 flex-1 truncate text-slate-700">{t.title}</span>
                <span className="shrink-0 text-xs text-slate-500">{t.assigned_to_name || 'Unassigned'}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${t.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exit documents */}
      {(can('generate_documents') || docs.length > 0) && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-400"><HiDocumentText className="h-4 w-4" /> Exit documents</h2>
            {can('generate_documents') && (
              <button onClick={() => setShowDocsModal(true)} className="flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800">
                <HiEnvelope className="h-4 w-4" /> Generate &amp; email
              </button>
            )}
          </div>
          {docs.length === 0 ? (
            <p className="py-2 text-sm text-slate-400">No documents generated yet.</p>
          ) : (
            <div className="space-y-1.5">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <HiDocumentText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{d.file_name}</span>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{fmtDate(d.uploaded_at)}</span>
                  <button onClick={() => downloadDoc(d)} className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-white"><HiArrowDownTray className="h-3.5 w-3.5" /> Download</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.status === 'COMPLETED' && (
        <div className="mt-2 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-700">✓ Exit process completed</div>
      )}
      {data.status === 'REJECTED' && (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">This exit request was rejected{data.rejection_reason ? `: ${data.rejection_reason}` : ''}.</div>
      )}

      <GenerateDocsModal id={id} open={showDocsModal} onClose={() => setShowDocsModal(false)} onDone={() => { setShowDocsModal(false); loadDocs() }} />
    </div>
  )
}
