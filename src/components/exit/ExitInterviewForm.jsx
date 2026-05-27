import { useState } from 'react'
import { HiStar } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button.jsx'
import { submitExitInterview } from '../../services/exitManagementService.js'

const FORMAT_OPTIONS = [
  { value: 'in_person', label: 'In Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'written', label: 'Written' },
]

const REHIRE_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' },
]

export default function ExitInterviewForm({ exitRequestId, existingInterview, onSubmitted }) {
  const [format, setFormat] = useState('in_person')
  const [feedback, setFeedback] = useState('')
  const [rehireEligible, setRehireEligible] = useState('maybe')
  const [overallRating, setOverallRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  if (existingInterview) {
    return (
      <div className="space-y-4 rounded-none border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Exit Interview — Completed</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">Format</span>
            <p className="text-sm font-medium text-gray-800 capitalize">{existingInterview.format?.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Rehire Eligible</span>
            <p className="text-sm font-medium text-gray-800 capitalize">{existingInterview.rehire_eligible}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Overall Rating</span>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <HiStar
                  key={star}
                  className={`h-5 w-5 ${star <= existingInterview.overall_rating ? 'text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-500">Feedback</span>
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{existingInterview.feedback}</p>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs = {}
    if (!feedback || feedback.trim().length < 20) {
      errs.feedback = 'Feedback must be at least 20 characters.'
    }
    if (overallRating === 0) {
      errs.rating = 'Please select a rating.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await submitExitInterview({
        exit_request_id: exitRequestId,
        format,
        feedback: feedback.trim(),
        rehire_eligible: rehireEligible,
        overall_rating: overallRating,
      })
      toast.success('Exit interview submitted successfully')
      onSubmitted?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit exit interview')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-none border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Exit Interview</h3>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Format</label>
        <div className="flex flex-wrap gap-4">
          {FORMAT_OPTIONS.map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={opt.value}
                checked={format === opt.value}
                onChange={(e) => setFormat(e.target.value)}
                className="h-4 w-4 border-gray-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="interview-feedback" className="mb-1 block text-sm font-medium text-gray-700">
          Feedback <span className="text-red-500">*</span>
        </label>
        <textarea
          id="interview-feedback"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience, suggestions, or reasons for leaving..."
          className={`w-full rounded-lg border px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 ${
            errors.feedback
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-gray-300 focus:border-[#004CA5] focus:ring-blue-100'
          }`}
        />
        {errors.feedback && <p className="mt-1 text-xs text-red-600">{errors.feedback}</p>}
        <p className="mt-1 text-xs text-gray-400">{feedback.length}/20 minimum characters</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Rehire Eligible</label>
        <div className="flex flex-wrap gap-4">
          {REHIRE_OPTIONS.map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rehire"
                value={opt.value}
                checked={rehireEligible === opt.value}
                onChange={(e) => setRehireEligible(e.target.value)}
                className="h-4 w-4 border-gray-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setOverallRating(star)}
              className="focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <HiStar
                className={`h-7 w-7 transition-colors ${
                  star <= overallRating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          label="Submit Interview"
          variant="primary"
          loading={submitting}
          disabled={submitting}
        />
      </div>
    </form>
  )
}
