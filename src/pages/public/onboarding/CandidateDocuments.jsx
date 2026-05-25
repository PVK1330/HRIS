import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getChecklist,
  uploadChecklistDocument,
} from '../../../services/candidateOnboardingService.js'

export default function CandidateDocuments() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [uploadingKey, setUploadingKey] = useState('')

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    getChecklist(token)
      .then(setData)
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load checklist'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (documentKey, file) => {
    if (!file) return
    setUploadingKey(documentKey)
    try {
      await uploadChecklistDocument(token, documentKey, file)
      toast.success('Document uploaded')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingKey('')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">Missing onboarding link.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-[#0F766E] px-6 py-5 text-white">
          <h1 className="text-lg font-bold uppercase tracking-wide">Document checklist</h1>
          <p className="text-emerald-100 text-sm mt-1">{data?.candidate?.name}</p>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : loadError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {loadError}
              <button
                type="button"
                onClick={load}
                className="mt-3 block text-xs font-bold uppercase text-[#0F766E]"
              >
                Try again
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {(data?.checklist || []).map((item) => (
                <li
                  key={item.documentKey}
                  className="border border-slate-100 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.documentLabel}</p>
                      {item.isMandatory && (
                        <span className="text-[10px] uppercase font-bold text-amber-600">Required</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.hrReviewStatus === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.uploadStatus === 'Uploaded'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.hrReviewStatus === 'Approved'
                        ? 'Approved'
                        : item.uploadStatus === 'Uploaded'
                          ? 'Uploaded'
                          : 'Pending'}
                    </span>
                  </div>
                  {item.hrReviewStatus === 'Rejected' && item.hrReviewComment && (
                    <p className="text-xs text-rose-600">HR: {item.hrReviewComment}</p>
                  )}
                  {item.uploadStatus !== 'Uploaded' || item.hrReviewStatus === 'Rejected' ? (
                    <label className="text-xs font-bold text-[#0F766E] cursor-pointer">
                      {uploadingKey === item.documentKey ? 'Uploading…' : 'Choose file (PDF, JPG, PNG)'}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={uploadingKey === item.documentKey}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleUpload(item.documentKey, f)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-xs text-slate-400">
            HR will review each document. You will receive portal access once onboarding is complete.
          </p>
        </div>
      </div>
    </div>
  )
}
