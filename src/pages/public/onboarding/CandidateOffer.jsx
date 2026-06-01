import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  acceptOffer,
  getCandidateOnboardingState,
  rejectOffer,
} from '../../../services/candidateOnboardingService.js'
import { candidateOnboardingPath } from '../../../utils/candidateOnboardingTenant.js'
import { WORKFLOW_STATUS_LABELS } from '../../../constants/onboardingWorkflow.js'

export default function CandidateOffer() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const action = searchParams.get('action')
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(action === 'reject')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getCandidateOnboardingState(token)
      .then(setState)
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Invalid or expired link')
      })
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token || !action || loading || !state) return
    if (action === 'accept' && state.workflowStatus === 'offer_sent') {
      acceptOffer(token)
        .then((res) => {
          toast.success(res.message || 'Offer accepted')
          navigate(candidateOnboardingPath('/onboarding/sign', token))
        })
        .catch((err) => toast.error(err.response?.data?.message || 'Could not accept offer'))
    }
  }, [action, token, loading, state, navigate])

  const handleAccept = async () => {
    try {
      const res = await acceptOffer(token)
      toast.success(res.message || 'Offer accepted')
      navigate(candidateOnboardingPath('/onboarding/sign', token))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept offer')
    }
  }

  const handleReject = async () => {
    try {
      await rejectOffer(token, rejectReason)
      toast.success('Offer declined')
      const next = await getCandidateOnboardingState(token)
      setState(next)
      setShowReject(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject offer')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">Missing onboarding link.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">Loading…</p>
      </div>
    )
  }

  const status = state?.workflowStatus
  const label = WORKFLOW_STATUS_LABELS[status] || status

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-[#0F766E] px-6 py-5 text-white">
          <h1 className="text-lg font-bold uppercase tracking-wide">Offer of Employment</h1>
          <p className="text-emerald-100 text-sm mt-1">{state?.name}</p>
        </div>
        <div className="p-6 space-y-4 text-sm text-slate-700">
          <p>
            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Status</span>
            <br />
            <span className="font-semibold text-slate-900">{label}</span>
          </p>
          <p>
            <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Position</span>
            <br />
            {state?.jobTitle} — {state?.department}
          </p>

          {status === 'offer_sent' && action !== 'accept' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 h-11 bg-[#0F766E] text-white text-xs font-black uppercase tracking-widest"
              >
                Accept offer
              </button>
              <button
                type="button"
                onClick={() => setShowReject(true)}
                className="flex-1 h-11 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-widest"
              >
                Reject offer
              </button>
            </div>
          )}

          {status === 'accepted_pending_upload' && (
            <button
              type="button"
              onClick={() => navigate(candidateOnboardingPath('/onboarding/sign', token))}
              className="w-full h-11 bg-[#0F766E] text-white text-xs font-black uppercase tracking-widest"
            >
              Sign offer letter →
            </button>
          )}

          {status === 'documents_pending' && (
            <button
              type="button"
              onClick={() => navigate(candidateOnboardingPath('/onboarding/documents', token))}
              className="w-full h-11 bg-[#0F766E] text-white text-xs font-black uppercase tracking-widest"
            >
              Upload documents →
            </button>
          )}

          {showReject && status === 'offer_sent' && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Optional reason for declining…"
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleReject}
                className="w-full h-10 bg-rose-600 text-white text-xs font-bold uppercase"
              >
                Confirm rejection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
