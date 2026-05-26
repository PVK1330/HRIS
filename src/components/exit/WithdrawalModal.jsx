import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiDocumentText } from 'react-icons/hi2'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { requestResignationWithdrawal } from '../../services/exitManagementService.js'

export default function WithdrawalModal({ isOpen, onClose, onSuccess, exitRequestId }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for withdrawing your resignation.')
      return false
    }
    if (reason.trim().length < 10) {
      setError('Withdrawal reason must be at least 10 characters long.')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await requestResignationWithdrawal(exitRequestId, {
        withdrawal_reason: reason.trim()
      })
      toast.success('Resignation withdrawal request submitted successfully')
      onSuccess?.()
      resetForm()
      onClose?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit withdrawal request')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setReason('')
    setError('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose?.() }}
      title="Request Resignation Withdrawal"
      description="Submit a formal request to retract your resignation"
      size="md"
      icon={HiDocumentText}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3.5">
          <p className="text-xs font-semibold text-teal-800 leading-relaxed">
            Note: Withdrawal requests are subject to approval by your Manager and HR Department. Your current offboarding and clearance processes will remain on hold until a decision is made.
          </p>
        </div>

        <div>
          <label htmlFor="withdrawal-reason" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Reason for Withdrawal <span className="text-red-500">*</span>
          </label>
          <textarea
            id="withdrawal-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (e.target.value.trim().length >= 10) setError('')
            }}
            placeholder="Explain why you wish to withdraw your resignation..."
            className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] shadow-sm transition-all placeholder:text-gray-400"
          />
          {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button 
            type="button" 
            label="Cancel" 
            variant="outline" 
            onClick={() => { resetForm(); onClose?.() }} 
          />
          <Button
            type="submit"
            label="Submit Request"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          />
        </div>
      </form>
    </Modal>
  )
}
